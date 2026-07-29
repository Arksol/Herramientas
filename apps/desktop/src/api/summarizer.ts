export type Summary = { markdown: string; keyPoints: string[]; sourceCharacters: number };
export type SourceKind = "text" | "link" | "image" | "video" | "file";
export type SourceAnalysis = { kind: SourceKind; text: string; sourceLabel: string; usedLocalAi: boolean; notes: string[] };
export type ObsidianStatus = { configured: boolean; endpoint: string; vaultHint: string };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
const isTauri = () => "__TAURI_INTERNALS__" in window;

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }, ...options });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con el servicio local.");
  return body as T;
}

async function nativeInvoke<T>(command: string, payload?: Record<string, string | number>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, payload);
}

export async function analyzeSource(kind: SourceKind, source: string): Promise<SourceAnalysis> {
  if (isTauri()) return nativeInvoke<SourceAnalysis>("analyze_source", { kind, source });
  return apiRequest<SourceAnalysis>("/api/summarizer/analyze", { method: "POST", body: JSON.stringify({ kind, source }) });
}

export async function summarizeText(text: string, title: string): Promise<Summary> {
  if (isTauri()) return nativeInvoke<Summary>("summarize_text", { text, title });
  return apiRequest<Summary>("/api/summarizer/generate", { method: "POST", body: JSON.stringify({ text, title }) });
}

export function getObsidianStatus() {
  return isTauri() ? nativeInvoke<ObsidianStatus>("get_obsidian_status") : apiRequest<ObsidianStatus>("/api/obsidian/status");
}

export function configureObsidian(apiKey: string) {
  return isTauri() ? nativeInvoke<ObsidianStatus>("configure_obsidian", { apiKey }) : apiRequest<ObsidianStatus>("/api/obsidian/configure", { method: "POST", body: JSON.stringify({ apiKey }) });
}

export function testObsidianConnection() {
  return isTauri() ? nativeInvoke<ObsidianStatus>("test_obsidian_connection") : apiRequest<ObsidianStatus>("/api/obsidian/test", { method: "POST" });
}

export function saveToObsidian(notePath: string, markdown: string) {
  return isTauri() ? nativeInvoke<void>("save_to_obsidian", { notePath, markdown }) : apiRequest<void>("/api/obsidian/save", { method: "POST", body: JSON.stringify({ notePath, markdown }) });
}

export function appendToObsidian(notePath: string, markdown: string, headingLevel: number) {
  return isTauri() ? nativeInvoke<void>("append_to_obsidian", { notePath, markdown, headingLevel }) : apiRequest<void>("/api/obsidian/append", { method: "POST", body: JSON.stringify({ notePath, markdown, headingLevel }) });
}
