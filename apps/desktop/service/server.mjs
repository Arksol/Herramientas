import crypto from "node:crypto";
import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { PDFParse } from "pdf-parse";
import { z } from "zod";
import { createUser, findUser, markUserLogin, openUserDatabase } from "./database.mjs";
import { compactText, looksLikeTranscript, parseTranscriptText } from "./transcript.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(directory, "..", ".env") });

const port = Number(process.env.HERRAMIENTAS_PORT ?? 3030);
const allowedOrigin = process.env.HERRAMIENTAS_ALLOWED_ORIGIN ?? "http://localhost:5175";
const authConfigPath = path.join(directory, "..", ".auth.local.json");
const usersConfigPath = path.join(directory, "..", ".users.local.json");
const databasePath = path.join(directory, "..", "data", "herramientas.sqlite");
const obsidianConfigPath = path.join(directory, "..", ".obsidian.local.json");
let accessCodeHash = await loadAccessCodeHash();
const userDatabase = await openUserDatabase(databasePath, usersConfigPath);
const app = express();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const IDLE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 15 * 60 * 1000;
const COOKIE_NAME = "herramientas_session";
const OLLAMA_ENDPOINT = process.env.HERRAMIENTAS_OLLAMA_ENDPOINT ?? "http://127.0.0.1:11434";
const TEXT_MODEL = process.env.HERRAMIENTAS_TEXT_MODEL ?? "qwen2.5:3b-instruct-q4_K_M";
const OBSIDIAN_ENDPOINT = process.env.HERRAMIENTAS_OBSIDIAN_ENDPOINT ?? "https://127.0.0.1:27124";
const sessions = new Map();
const attempts = new Map();
const latestContexts = new Map();

function base32Encode(buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  const bytes = [];
  for (const char of value.replace(/=+$/g, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("El secreto A2F no es valido.");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function createTotpSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function totpCode(secret, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 30000);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac("sha1", base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 15;
  const number = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(number % 1000000).padStart(6, "0");
}

function verifyTotp(secret, code) {
  const normalized = String(code ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  return [-1, 0, 1].some((step) => totpCode(secret, Date.now() + step * 30000) === normalized);
}

function registeredBenefits() {
  return ["Herramientas de 3ros", "Agentes configurables", "Modelos y terminales conectables", "Sesión protegida con A2F"];
}

function registeredSession(user) {
  return { accountType: "registered", username: user.identifier, benefits: registeredBenefits(), twoFactor: true };
}

async function loadAccessCodeHash() {
  if (process.env.HERRAMIENTAS_ACCESS_CODE_HASH) return process.env.HERRAMIENTAS_ACCESS_CODE_HASH;
  try {
    const parsed = JSON.parse(await fs.readFile(authConfigPath, "utf8"));
    return typeof parsed.accessCodeHash === "string" ? parsed.accessCodeHash : undefined;
  } catch {
    return undefined;
  }
}

async function saveAccessCodeHash(hash) {
  await fs.writeFile(authConfigPath, JSON.stringify({ accessCodeHash: hash }, null, 2));
}

async function loadObsidianApiKey() {
  if (process.env.HERRAMIENTAS_OBSIDIAN_API_KEY) return process.env.HERRAMIENTAS_OBSIDIAN_API_KEY;
  try {
    const parsed = JSON.parse(await fs.readFile(obsidianConfigPath, "utf8"));
    return typeof parsed.apiKey === "string" ? parsed.apiKey : undefined;
  } catch {
    return undefined;
  }
}

async function saveObsidianApiKey(apiKey) {
  await fs.writeFile(obsidianConfigPath, JSON.stringify({ apiKey }, null, 2));
}

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
const validOrigins = new Set([allowedOrigin, "http://localhost:5175", "http://127.0.0.1:5175"]);
app.use(cors({ origin: (origin, callback) => callback(null, !origin || validOrigins.has(origin)), credentials: true, methods: ["GET", "POST"] }));
app.use(express.json({ limit: "512kb" }));
app.use(cookieParser());

function error(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function clientKey(req) {
  return req.ip || req.socket.remoteAddress || "local";
}

function getSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = token ? sessions.get(token) : undefined;
  if (!session) return null;
  if (Date.now() >= session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return { token, session };
}

function sessionState(session) {
  const inactive = Date.now() - session.lastActivityAt >= IDLE_TTL_MS;
  return session.paused ? "paused" : inactive ? "inactive" : "active";
}

function sessionResponse(session) {
  return {
    authenticated: true,
    state: sessionState(session),
    expiresAt: new Date(session.expiresAt).toISOString(),
    lastActivityAt: new Date(session.lastActivityAt).toISOString(),
    tools: session.accountType === "registered" ? ["resumidor", "clases", "ingles", "tecnologia", "visuales", "codigo", "lector", "third-party"] : ["resumidor", "clases"],
    accountType: session.accountType ?? "local",
    username: session.username ?? null,
    benefits: session.benefits ?? [],
    twoFactor: Boolean(session.twoFactor)
  };
}

function requireSession(req, res, next) {
  const found = getSession(req);
  if (!found) return error(res, 401, "UNAUTHENTICATED", "Se requiere acceso autorizado.");
  req.localSession = found;
  next();
}

function requireActiveSession(req, res, next) {
  const found = getSession(req);
  if (!found) return error(res, 401, "UNAUTHENTICATED", "Se requiere acceso autorizado.");
  const state = sessionState(found.session);
  if (state === "paused") return error(res, 409, "SESSION_PAUSED", "La sesion esta pausada. Reanudala antes de procesar contenido.");
  if (state === "inactive") return error(res, 409, "SESSION_INACTIVE", "La sesion esta inactiva por falta de uso. Reanudala antes de continuar.");
  found.session.lastActivityAt = Date.now();
  req.localSession = found;
  next();
}

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function allowedTextFile(filePath) {
  return /\.(pdf|txt|md|markdown|csv|json|jsonl|log|rs|ts|tsx|js|jsx|py|html|css|toml|yaml|yml|xml|srt|vtt)$/i.test(filePath);
}

async function extractPdfText(data) {
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return compactText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function analyzeLink(source) {
  const url = new URL(source.trim());
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Solo se aceptan links http o https.");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`El sitio respondio con estado ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > 10 * 1024 * 1024) throw new Error("La pagina o PDF supera el limite local de 10 MB.");
  if (contentType.includes("application/pdf") || url.pathname.toLowerCase().endsWith(".pdf")) {
    const text = await extractPdfText(body);
    if (text.length < 40) throw new Error("No se encontro suficiente texto legible en el PDF.");
    return { kind: "link", text, sourceLabel: url.toString(), usedLocalAi: false, notes: ["PDF descargado y texto extraido localmente."] };
  }
  const html = body.toString("utf8");
  const text = compactText(stripHtml(html));
  if (text.length < 40) throw new Error("No se encontro suficiente texto legible en el link.");
  return { kind: "link", text, sourceLabel: url.toString(), usedLocalAi: false, notes: ["HTML descargado y limpiado localmente."] };
}

async function analyzeFile(source) {
  const filePath = source.trim().replace(/^"|"$/g, "");
  if (!allowedTextFile(filePath)) throw new Error("Este tipo de archivo aun no esta permitido. Usa txt, md, csv, json, html, codigo, srt o vtt.");
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) throw new Error("Indica la ruta completa de un archivo local existente.");
  if (stat.size > 2 * 1024 * 1024) throw new Error("El archivo supera el limite local de 2 MB.");
  if (/\.pdf$/i.test(filePath)) {
    const text = await extractPdfText(await fs.readFile(filePath));
    if (text.length < 40) throw new Error("El PDF no contiene suficiente texto legible para analizar.");
    return { kind: "file", text, sourceLabel: filePath, usedLocalAi: false, notes: ["Texto del PDF extraido localmente."] };
  }
  const content = await fs.readFile(filePath, "utf8");
  const transcript = looksLikeTranscript(content, filePath);
  const text = transcript ? parseTranscriptText(content) : compactText(content);
  if (text.length < 40) throw new Error("El archivo no contiene suficiente texto para resumir.");
  return { kind: "file", text, sourceLabel: filePath, usedLocalAi: false, notes: [transcript ? "Transcripcion VTT/SRT parseada localmente." : "Archivo de texto leido localmente."] };
}

function splitChunks(text, maxChars = 3600) {
  const normalized = compactText(text, 90000);
  if (normalized.length <= maxChars) return [normalized];
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += `${sentence.trim()} `;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.slice(0, 24);
}

async function ollamaGenerate(prompt) {
  const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: TEXT_MODEL, prompt, stream: true, options: { num_ctx: 4096, temperature: 0.2 } })
  });
  if (!response.ok || !response.body) throw new Error(`Ollama no pudo generar el resumen (estado ${response.status}).`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let output = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const item = JSON.parse(line);
      output += item.response ?? "";
    }
  }
  if (pending.trim()) {
    const item = JSON.parse(pending);
    output += item.response ?? "";
  }
  const cleaned = output.trim();
  if (cleaned.length < 40) throw new Error("Ollama devolvio un resumen demasiado corto.");
  return cleaned;
}

function fallbackSummary(text, title, note = "") {
  const normalized = compactText(text);
  if (normalized.length < 40) return { error: "Incluye al menos 40 caracteres para generar un resumen util." };
  if (normalized.length > 90000) return { error: "La fuente supera el limite local de 90,000 caracteres." };
  const points = normalized.split(/[.!?\n]/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 20).slice(0, 8);
  if (!points.length) return { error: "No se encontraron ideas completas para resumir." };
  const noteTitle = title.trim() || "Resumen academico";
  return {
    markdown: `# ${noteTitle}\n\n## Resumen\n\n${points.slice(0, 3).join(". ")}\n\n## Ideas clave\n\n${points.map((point) => `- ${point}`).join("\n")}\n\n## Proximos pasos\n\n- Revisar y completar esta nota antes de guardarla en Obsidian.${note ? `\n\n## Nota tecnica\n\n${note}` : ""}`,
    keyPoints: points,
    sourceCharacters: normalized.length
  };
}

async function buildSummary(text, title) {
  const normalized = compactText(text, 90000);
  if (normalized.length < 40) return { error: "Incluye al menos 40 caracteres para generar un resumen util." };
  const noteTitle = title.trim() || "Resumen academico";
  try {
    const chunks = splitChunks(normalized);
    const partials = [];
    for (let index = 0; index < chunks.length; index += 1) {
      const prompt = `Resume este bloque de una clase o fuente academica en espanol. Conserva conceptos, pasos, ejemplos y dudas. Devuelve bullets claros.\n\nBloque ${index + 1}/${chunks.length}:\n${chunks[index]}`;
      partials.push(await ollamaGenerate(prompt));
    }
    const reducePrompt = `Crea una nota Markdown para Obsidian titulada "${noteTitle}" usando estos resumenes parciales. Usa secciones: Resumen, Ideas clave, Conceptos, Pasos o procedimiento, Dudas para repasar, Acciones sugeridas. No inventes datos.\n\n${partials.join("\n\n---\n\n")}`;
    const markdown = await ollamaGenerate(reducePrompt);
    const keyPoints = markdown.split("\n").map((line) => line.replace(/^[-*#\s]+/, "").trim()).filter((line) => line.length >= 20).slice(0, 8);
    return { markdown, keyPoints: keyPoints.length ? keyPoints : partials.slice(0, 6), sourceCharacters: normalized.length };
  } catch (reason) {
    return fallbackSummary(normalized, noteTitle, `Ollama local no estuvo disponible para map-reduce streaming; se uso resumen extractivo local. Detalle: ${reason instanceof Error ? reason.message : "error desconocido"}.`);
  }
}


function obsidianStatus(apiKey) {
  return { configured: Boolean(apiKey?.trim()), endpoint: OBSIDIAN_ENDPOINT, vaultHint: "La boveda que tenga habilitado Local REST API" };
}

function validateNotePath(notePath) {
  const normalized = String(notePath ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized || !normalized.endsWith(".md") || normalized.includes("..") || normalized.startsWith("/")) {
    throw new Error("Indica una ruta Markdown valida dentro de la boveda, por ejemplo Resumenes/Clase 1.md.");
  }
  return normalized;
}

function encodeVaultPath(notePath) {
  return `/vault/${notePath.split("/").map(encodeURIComponent).join("/")}`;
}

function obsidianRequest({ method = "GET", requestPath = "/vault/", apiKey, body = "" }) {
  return new Promise((resolve, reject) => {
    const url = new URL(requestPath, OBSIDIAN_ENDPOINT);
    const request = https.request(url, {
      method,
      rejectUnauthorized: false,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body ? { "Content-Type": "text/markdown; charset=utf-8", "Content-Length": Buffer.byteLength(body) } : {})
      }
    }, (response) => {
      let text = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { text += chunk; });
      response.on("end", () => resolve({ status: response.statusCode ?? 0, text }));
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function formatSummaryForHeading(markdown, baseLevel) {
  const level = Number(baseLevel);
  if (!Number.isInteger(level) || level < 1 || level > 4) throw new Error("Elige un nivel de titulo entre # y ####.");
  return String(markdown ?? "").split("\n").map((line) => {
    const match = line.match(/^(#{1,6})(\s+)/);
    if (!match) return line;
    const next = Math.min(6, match[1].length + level - 1);
    return `${"#".repeat(next)}${line.slice(match[1].length)}`;
  }).join("\n");
}
app.get("/api/extension/health", (_req, res) => {
  res.json({ ok: true, service: "herramientas-extension-bridge", mode: "local", supportedBrowsers: ["chrome-dev", "firefox", "helium"] });
});

app.get("/api/context/capabilities", (_req, res) => {
  res.json({ ok: true, tools: ["resumidor", "clases", "ingles", "tecnologia", "visuales", "codigo"], limits: { selectedText: 20000 }, requiresConfirmation: true });
});

app.post("/api/context/inspect", (req, res) => {
  const parsed = z.object({
    origin: z.string().max(500),
    url: z.string().max(2000),
    title: z.string().max(500).optional().default(""),
    selectedText: z.string().min(1).max(20000),
    sourceKind: z.string().max(80).optional().default("selection"),
    adapter: z.string().max(120).optional(),
    requestedTool: z.enum(["resumidor", "clases", "ingles", "tecnologia", "visuales", "codigo"]),
    consent: z.literal(true),
    capturedAt: z.string().optional()
  }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_CONTEXT", "El contexto enviado por la extension no es valido.");
  const contextSessionId = crypto.randomUUID();
  latestContexts.set(contextSessionId, parsed.data);
  res.json({
    ok: true,
    contextSessionId,
    received: { origin: parsed.data.origin, title: parsed.data.title, requestedTool: parsed.data.requestedTool, sourceKind: parsed.data.sourceKind, characters: parsed.data.selectedText.length },
    nextAction: "Abre Herramientas y continua en la herramienta seleccionada."
  });
});

app.get("/api/context/latest/:id", requireActiveSession, (req, res) => {
  const value = latestContexts.get(req.params.id);
  if (!value) return error(res, 404, "CONTEXT_NOT_FOUND", "No se encontro ese contexto local.");
  res.json(value);
});


app.get("/api/obsidian/status", requireActiveSession, async (_req, res) => {
  res.json(obsidianStatus(await loadObsidianApiKey()));
});

app.post("/api/obsidian/configure", requireActiveSession, async (req, res) => {
  const parsed = z.object({ apiKey: z.string().min(16).max(512) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_OBSIDIAN_KEY", "La clave de la API de Obsidian no parece valida.");
  const apiKey = parsed.data.apiKey.trim();
  try {
    const response = await obsidianRequest({ apiKey, requestPath: "/vault/" });
    if (response.status >= 200 && response.status < 300) {
      await saveObsidianApiKey(apiKey);
      return res.json(obsidianStatus(apiKey));
    }
    if (response.status === 401) return error(res, 401, "OBSIDIAN_REJECTED_KEY", "La clave fue rechazada por Obsidian (401). Copia el valor API Key de esta misma boveda.");
    return error(res, 502, "OBSIDIAN_BAD_STATUS", `Obsidian no respondio correctamente (estado ${response.status}).`);
  } catch {
    return error(res, 502, "OBSIDIAN_UNREACHABLE", "No se pudo contactar Obsidian. Abre Obsidian y activa Local REST API with MCP.");
  }
});

app.post("/api/obsidian/test", requireActiveSession, async (_req, res) => {
  const apiKey = await loadObsidianApiKey();
  if (!apiKey) return error(res, 400, "OBSIDIAN_NOT_CONFIGURED", "Configura primero la API local de Obsidian.");
  try {
    const response = await obsidianRequest({ apiKey, requestPath: "/vault/" });
    if (response.status >= 200 && response.status < 300) return res.json(obsidianStatus(apiKey));
    if (response.status === 401) return error(res, 401, "OBSIDIAN_REJECTED_KEY", "La clave fue rechazada por Obsidian (401). Copia el valor API Key de esta misma boveda.");
    return error(res, 502, "OBSIDIAN_BAD_STATUS", `Obsidian no respondio correctamente (estado ${response.status}).`);
  } catch {
    return error(res, 502, "OBSIDIAN_UNREACHABLE", "No se pudo contactar Obsidian. Abre Obsidian y activa Local REST API with MCP.");
  }
});

app.post("/api/obsidian/save", requireActiveSession, async (req, res) => {
  const parsed = z.object({ notePath: z.string().max(500), markdown: z.string().max(250000) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_OBSIDIAN_SAVE", "La nota enviada no es valida.");
  const apiKey = await loadObsidianApiKey();
  if (!apiKey) return error(res, 400, "OBSIDIAN_NOT_CONFIGURED", "Configura primero la API local de Obsidian.");
  try {
    const notePath = validateNotePath(parsed.data.notePath);
    const response = await obsidianRequest({ method: "PUT", requestPath: encodeVaultPath(notePath), apiKey, body: parsed.data.markdown });
    if (response.status >= 200 && response.status < 300) return res.status(204).end();
    return error(res, 502, "OBSIDIAN_SAVE_FAILED", `Obsidian rechazo el guardado (estado ${response.status}).`);
  } catch (reason) {
    return error(res, 400, "OBSIDIAN_SAVE_FAILED", reason instanceof Error ? reason.message : "No se pudo guardar la nota.");
  }
});

app.post("/api/obsidian/append", requireActiveSession, async (req, res) => {
  const parsed = z.object({ notePath: z.string().max(500), markdown: z.string().max(250000), headingLevel: z.number().int().min(1).max(4) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_OBSIDIAN_APPEND", "La nota enviada no es valida.");
  const apiKey = await loadObsidianApiKey();
  if (!apiKey) return error(res, 400, "OBSIDIAN_NOT_CONFIGURED", "Configura primero la API local de Obsidian.");
  try {
    const notePath = validateNotePath(parsed.data.notePath);
    const requestPath = encodeVaultPath(notePath);
    const existing = await obsidianRequest({ requestPath, apiKey });
    if (existing.status < 200 || existing.status >= 300) return error(res, 502, "OBSIDIAN_READ_FAILED", `No se pudo abrir la nota existente (estado ${existing.status}).`);
    const formatted = formatSummaryForHeading(parsed.data.markdown, parsed.data.headingLevel);
    const content = `${existing.text.trimEnd()}\n\n${formatted.trim()}\n`;
    const saved = await obsidianRequest({ method: "PUT", requestPath, apiKey, body: content });
    if (saved.status >= 200 && saved.status < 300) return res.status(204).end();
    return error(res, 502, "OBSIDIAN_APPEND_FAILED", `Obsidian rechazo la actualizacion (estado ${saved.status}).`);
  } catch (reason) {
    return error(res, 400, "OBSIDIAN_APPEND_FAILED", reason instanceof Error ? reason.message : "No se pudo agregar el resumen.");
  }
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "herramientas-local", accessConfigured: Boolean(accessCodeHash) });
});

app.post("/api/summarizer/analyze", requireActiveSession, async (req, res) => {
  const parsed = z.object({ kind: z.enum(["text", "link", "image", "video", "file"]), source: z.string().min(1).max(120000) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_INPUT", "La informacion enviada no es valida.");
  try {
    if (parsed.data.kind === "text") {
      const isTranscript = looksLikeTranscript(parsed.data.source);
      return res.json({ kind: "text", text: isTranscript ? parseTranscriptText(parsed.data.source) : compactText(parsed.data.source), sourceLabel: isTranscript ? "Transcripcion pegada" : "Texto pegado", usedLocalAi: false, notes: [isTranscript ? "Transcripcion pegada parseada localmente." : "Texto recibido directamente."] });
    }
    if (parsed.data.kind === "link") return res.json(await analyzeLink(parsed.data.source));
    if (parsed.data.kind === "file") return res.json(await analyzeFile(parsed.data.source));
    return error(res, 501, "DESKTOP_ONLY", "Imagenes y videos requieren la aplicacion de escritorio con Ollama local, ffmpeg y Whisper local cuando aplique.");
  } catch (reason) {
    return error(res, 400, "SOURCE_ANALYSIS_FAILED", reason instanceof Error ? reason.message : "No se pudo analizar la fuente.");
  }
});

app.post("/api/summarizer/generate", requireActiveSession, async (req, res) => {
  const parsed = z.object({ text: z.string().max(120000), title: z.string().max(200).optional().default("") }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_INPUT", "La informacion enviada no es valida.");
  const result = await buildSummary(parsed.data.text, parsed.data.title);
  if (result.error) return error(res, 400, "SUMMARY_NOT_AVAILABLE", result.error);
  res.json(result);
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = z.object({ identifier: z.string().trim().min(3).max(160), password: z.string().min(10).max(256) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_REGISTRATION", "Usa un usuario o correo valido y una contraseña de al menos 10 caracteres.");
  const identifier = parsed.data.identifier.toLowerCase();
  if (findUser(userDatabase, identifier)) return error(res, 409, "USER_EXISTS", "Ya existe una cuenta con ese usuario.");
  const totpSecret = createTotpSecret();
  const user = { identifier, passwordHash: await bcrypt.hash(parsed.data.password, 12), totpSecret, createdAt: new Date().toISOString() };
  createUser(userDatabase, user);
  const issuer = "Herramientas";
  const otpauthUri = `otpauth://totp/${encodeURIComponent(`${issuer}:${identifier}`)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  res.status(201).json({ registered: true, identifier, twoFactor: { type: "TOTP", issuer, secret: totpSecret, otpauthUri }, next: "Inicia sesión con tu contraseña y el código de Proton Authenticator." });
});

app.post("/api/auth/login-registered", async (req, res) => {
  const parsed = z.object({ identifier: z.string().trim().min(3).max(160), password: z.string().min(1).max(256), totpCode: z.string().min(6).max(12) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_LOGIN", "Indica usuario, contraseña y el código de Proton Authenticator.");
  const identifier = parsed.data.identifier.toLowerCase();
  const user = findUser(userDatabase, identifier);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return error(res, 401, "INVALID_LOGIN", "El usuario o la contraseña no son validos.");
  if (!verifyTotp(user.totpSecret, parsed.data.totpCode)) return error(res, 401, "INVALID_2FA", "El código A2F no es valido o ya expiro. Usa el código actual de Proton Authenticator.");
  markUserLogin(userDatabase, identifier);
  const now = Date.now();
  const token = crypto.randomUUID();
  const session = { createdAt: now, lastActivityAt: now, expiresAt: now + SESSION_TTL_MS, paused: false, ...registeredSession(user) };
  sessions.set(token, session);
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: "strict", secure: false, maxAge: SESSION_TTL_MS, path: "/" });
  res.json(sessionResponse(session));
});

app.post("/api/auth/configure", async (req, res) => {
  if (accessCodeHash) return error(res, 409, "ACCESS_ALREADY_CONFIGURED", "El codigo de acceso ya fue configurado.");
  const parsed = z.object({ accessCode: z.string().min(8).max(256) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_INPUT", "El codigo debe tener al menos 8 caracteres.");
  accessCodeHash = await bcrypt.hash(parsed.data.accessCode, 12);
  await saveAccessCodeHash(accessCodeHash);
  const token = crypto.randomUUID();
  const now = Date.now();
  const session = { createdAt: now, lastActivityAt: now, expiresAt: now + SESSION_TTL_MS, paused: false };
  sessions.set(token, session);
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: "strict", secure: false, maxAge: SESSION_TTL_MS, path: "/" });
  res.json({ ...sessionResponse(session), configured: true });
});

app.post("/api/auth/login", async (req, res) => {
  if (!accessCodeHash) return error(res, 503, "ACCESS_NOT_CONFIGURED", "Configura el codigo de acceso local antes de iniciar sesion.");
  const parsed = z.object({ accessCode: z.string().min(1).max(256) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "INVALID_INPUT", "La informacion enviada no es valida.");
  const key = clientKey(req);
  const attempt = attempts.get(key);
  const now = Date.now();
  if (attempt?.lockedUntil && now < attempt.lockedUntil) return error(res, 429, "TEMPORARILY_LOCKED", "El acceso esta bloqueado temporalmente. Intentalo mas tarde.");
  const matches = await bcrypt.compare(parsed.data.accessCode, accessCodeHash);
  if (!matches) {
    const failures = (attempt?.failures ?? 0) + 1;
    attempts.set(key, failures >= MAX_ATTEMPTS ? { failures, lockedUntil: now + LOCKOUT_MS } : { failures });
    return error(res, 401, "INVALID_ACCESS", "El codigo de acceso no es valido.");
  }
  attempts.delete(key);
  const token = crypto.randomUUID();
  const session = { createdAt: now, lastActivityAt: now, expiresAt: now + SESSION_TTL_MS, paused: false };
  sessions.set(token, session);
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: "strict", secure: false, maxAge: SESSION_TTL_MS, path: "/" });
  res.json(sessionResponse(session));
});

app.get("/api/auth/session", (req, res) => {
  const found = getSession(req);
  if (!found) return res.json({ authenticated: false, configured: Boolean(accessCodeHash), state: "signed_out" });
  res.json(sessionResponse(found.session));
});

app.post("/api/auth/pause", requireActiveSession, (req, res) => {
  req.localSession.session.paused = true;
  res.json(sessionResponse(req.localSession.session));
});

app.post("/api/auth/resume", requireSession, (req, res) => {
  req.localSession.session.paused = false;
  req.localSession.session.lastActivityAt = Date.now();
  res.json(sessionResponse(req.localSession.session));
});

app.post("/api/auth/activity", requireActiveSession, (req, res) => {
  req.localSession.session.lastActivityAt = Date.now();
  res.json(sessionResponse(req.localSession.session));
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) sessions.delete(token);
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "strict", secure: false, path: "/" });
  res.status(204).end();
});

app.get("/api/local-ai/status", async (_req, res) => {
  const profiles = [
    { role: "Resumen y tutoria", model: "qwen2.5:3b-instruct-q4_K_M", context: 4096, device: "GTX 1650 Ti Max-Q", note: "Modelo principal ligero para resumen, ingles, tecnologia y prompts; qwen2.5:7b-instruct-q4_K_M queda como opcion si hay memoria suficiente." },
    { role: "Vision local", model: "llava:7b-v1.6-mistral-q4_K_M", context: 4096, device: "GTX 1650 Ti Max-Q / CPU fallback", note: "Usar con imagenes sueltas; si falta VRAM, bajar a un modelo de vision 2B/4B cuantizado." },
    { role: "Extraccion de video", model: "whisper.cpp small/base + fotogramas", context: 0, device: "CPU/GPU local", note: "Transcribe audio y toma fotogramas seleccionados antes de resumir." }
  ];
  try {
    const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`);
    if (!response.ok) throw new Error("Ollama no respondio correctamente.");
    const body = await response.json();
    res.json({ available: true, endpoint: OLLAMA_ENDPOINT, hardware: "NVIDIA GTX 1650 Ti Max-Q 4 GB + Intel Iris Xe 1 GB", models: body.models?.map((model) => model.name) ?? [], profiles });
  } catch {
    res.json({ available: false, endpoint: OLLAMA_ENDPOINT, hardware: "NVIDIA GTX 1650 Ti Max-Q 4 GB + Intel Iris Xe 1 GB", models: [], profiles });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Herramientas local API en http://127.0.0.1:${port}`);
  if (!accessCodeHash) console.warn("HERRAMIENTAS_ACCESS_CODE_HASH no esta configurado; el acceso protegido permanecera desactivado.");
});
