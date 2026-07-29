const HOST_ID = "herramientas-context-host";
const POSITION_KEY = "herramientasBubblePosition";
const ENABLED_KEY = "herramientasEnabled";
const CACHE_DB = "herramientas-context-cache";
const CACHE_STORE = "captures";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CONTEXT = 20000;
let bubbleHost = null;

function runtimeApi() {
  return globalThis.browser ?? globalThis.chrome;
}

function blockedOrigin() {
  return /^(chrome|chrome-extension|moz-extension|about|edge|brave|file):/.test(location.protocol);
}

function safeText(value, max = MAX_CONTEXT) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeSelection() {
  return safeText(globalThis.getSelection?.());
}

function pagePayload(selectedText, sourceKind = "selection", adapter = "") {
  return { origin: location.origin, url: location.href, title: document.title, selectedText, sourceKind, adapter, capturedAt: new Date().toISOString() };
}

async function storageGet(key) {
  const api = runtimeApi();
  const value = api.storage.local.get(key);
  const resolved = value && typeof value.then === "function" ? await value : await new Promise((resolve) => api.storage.local.get(key, resolve));
  return resolved?.[key];
}

async function storageSet(value) {
  const api = runtimeApi();
  const result = api.storage.local.set(value);
  if (result && typeof result.then === "function") await result;
  else await new Promise((resolve) => api.storage.local.set(value, resolve));
}

async function storageRemove(key) {
  const api = runtimeApi();
  const result = api.storage.local.remove(key);
  if (result && typeof result.then === "function") await result;
  else await new Promise((resolve) => api.storage.local.remove(key, resolve));
}

function sendMessage(message) {
  const api = runtimeApi();
  if (globalThis.browser?.runtime?.sendMessage) {
    return api.runtime.sendMessage(message).then((response) => response ?? { ok: false, error: "No hubo respuesta de la extensión." }).catch((error) => ({ ok: false, error: error?.message ?? "No se pudo enviar el contexto." }));
  }
  return new Promise((resolve) => {
    api.runtime.sendMessage(message, (response) => {
      const runtimeError = api.runtime.lastError?.message;
      resolve(runtimeError ? { ok: false, error: runtimeError } : response ?? { ok: false, error: "No hubo respuesta de la extensión." });
    });
  });
}

function openCache() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function purgeExpiredCaptures() {
  try {
    const db = await openCache();
    const transaction = db.transaction(CACHE_STORE, "readwrite");
    const cursor = transaction.objectStore(CACHE_STORE).openCursor();
    const now = Date.now();
    cursor.onsuccess = () => { const item = cursor.result; if (!item) return; if (!item.value.expiresAt || item.value.expiresAt <= now) item.delete(); item.continue(); };
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error); });
    db.close();
  } catch {}
}

async function cacheCapture(payload) {
  try {
    await purgeExpiredCaptures();
    const db = await openCache();
    const transaction = db.transaction(CACHE_STORE, "readwrite");
    transaction.objectStore(CACHE_STORE).put({ id: `${location.href}:${payload.requestedTool}:${payload.sourceKind}`, ...payload, createdAt: Date.now(), expiresAt: Date.now() + CACHE_TTL_MS });
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error); });
    db.close();
  } catch {}
}

function isVisible(node) {
  const element = node instanceof Element ? node : node?.parentElement;
  if (!element) return false;
  if (typeof element.checkVisibility === "function" && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function textFromSelectors(selectors) {
  for (const selector of selectors) {
    const parts = Array.from(document.querySelectorAll(selector)).filter(isVisible).map((node) => safeText(node.textContent, 3000)).filter((text) => text.length > 24);
    const text = safeText([...new Set(parts)].join("\n"));
    if (text.length > 80) return text;
  }
  return "";
}

function transcriptFromTracks() {
  const parts = [];
  for (const video of document.querySelectorAll("video")) {
    for (const track of Array.from(video.textTracks ?? [])) {
      try { track.mode = "hidden"; } catch {}
      for (const cue of Array.from(track.cues ?? [])) {
        const text = safeText(cue.text, 1000);
        if (text) parts.push(`[${Math.round(cue.startTime)} s] ${text}`);
      }
    }
  }
  return safeText([...new Set(parts)].join("\n"));
}

function platformAdapter() {
  const host = location.hostname.toLowerCase();
  if (host.endsWith("platzi.com")) return { name: "Platzi", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='subtitle' i]", "[class*='caption' i]"] };
  if (host.endsWith("ebac.mx")) return { name: "EBAC", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='caption' i]", "[class*='subtitle' i]"] };
  if (host.endsWith("blackboard.com")) return { name: "Blackboard UVM", selectors: ["[aria-label*='transcript' i]", "[data-testid*='caption' i]", "[class*='transcript' i]", "[class*='caption' i]"] };
  if (host.endsWith("class.com")) return { name: "Class UVM", selectors: ["[aria-label*='transcript' i]", "[data-testid*='caption' i]", "[class*='transcript' i]", "[class*='caption' i]"] };
  if (host.endsWith("mastermind.ac") || host.endsWith("mastermind.com")) return { name: "Mastermind", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='subtitle' i]", "[class*='caption' i]"] };
  if (host.endsWith("academia.eduardorosas.mx")) return { name: "Finanzas - Academia Eduardo Rosas", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='caption' i]", "[class*='subtitle' i]"] };
  if (host.endsWith("coursera.org")) return { name: "Coursera", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='caption' i]", "[class*='subtitle' i]"] };
  if (host.endsWith("youtube.com") || host === "youtu.be") return { name: "YouTube", selectors: ["ytd-transcript-segment-renderer", "#segments-container", ".ytp-caption-segment"] };
  return { name: "Sitio compatible", selectors: ["[data-testid*='transcript' i]", "[class*='transcript' i]", "[class*='caption' i]", "[class*='subtitle' i]"] };
}

function extractTranscript() {
  const adapter = platformAdapter();
  const tracks = transcriptFromTracks();
  if (tracks.length > 80) return { text: tracks, adapter: `${adapter.name}: subtítulos disponibles` };
  const domText = textFromSelectors(adapter.selectors);
  if (domText.length > 80) return { text: domText, adapter: `${adapter.name}: transcripción visible` };
  return { text: "", adapter: adapter.name };
}

function createStyle() {
  const style = document.createElement("style");
  style.textContent = `
    :host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647;font-family:Inter,Arial,system-ui,sans-serif;color:#edf4ff}
    *,*::before,*::after{box-sizing:border-box}button{font:inherit;cursor:pointer}.toggle{position:relative;display:grid;place-items:center;width:56px;height:56px;border:1px solid #8ab9ec;border-radius:50%;background:#123558;color:#eff7ff;font-size:18px;font-weight:700;box-shadow:0 14px 36px #000a;transition:transform .18s,background .18s}.toggle:hover{transform:translateY(-2px);background:#194a79}.toggle:focus-visible,.actions button:focus-visible,header button:focus-visible{outline:2px solid #d5e9ff;outline-offset:3px}.signal{position:absolute;right:7px;top:7px;width:9px;height:9px;border:2px solid #123558;border-radius:50%;background:#83e2ac}.toggle[aria-expanded="true"] .signal{background:#93c8ff}.panel{width:min(352px,calc(100vw - 32px));margin-bottom:11px;border:1px solid #527599;border-radius:10px;background:#0a1420f5;box-shadow:0 22px 64px #000b;padding:12px;backdrop-filter:blur(14px)}.panel[hidden]{display:none}.panel.dragging{user-select:none}header{display:flex;align-items:center;gap:8px;margin-bottom:9px}.brand{display:flex;align-items:center;gap:8px;min-width:0}.brand-mark{display:grid;place-items:center;width:25px;height:25px;border:1px solid #5f87b1;border-radius:50%;background:#142e49;color:#dceeff;font-weight:700;font-size:12px}.brand-copy{display:flex;min-width:0;flex-direction:column;gap:1px}.brand-copy strong{font-size:13px;color:#f5f9ff}.brand-copy span{font-size:10px;color:#9eb1c6}.header-actions{display:flex;gap:2px;margin-left:auto}.header-actions button{border:0;background:transparent;color:#b4d5f8;padding:5px;font-size:12px}.drag{touch-action:none;cursor:grab}.drag:active{cursor:grabbing}p{font-size:12px;line-height:1.45;color:#b6c2d1;margin:0 0 10px}.privacy{color:#8da1b7;font-size:10px;margin:10px 0 0}.actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.actions button{display:flex;align-items:center;min-height:36px;border:1px solid #354c65;border-radius:7px;background:#101e2e;color:#e8f0fa;padding:8px;text-align:left;font-size:11px}.actions button:hover{border-color:#80b5ed;background:#173451}.actions button.wide{grid-column:span 2}.action-icon{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:7px;border-radius:5px;background:#1d3a5a;color:#beddff;font-size:9px;font-weight:700}.open-app{margin-top:7px;width:100%;border:0;background:transparent;color:#b9dcff;text-decoration:underline;font-size:11px;text-align:left}.status-ready{color:#b6e6c4}@media (prefers-reduced-motion:no-preference){.signal{animation:signal 1.8s ease-in-out infinite}@keyframes signal{0%,100%{box-shadow:0 0 0 0 #83e2ac66}50%{box-shadow:0 0 0 5px #83e2ac00}}}
  `;
  return style;
}

function createMarkup(root) {
  root.innerHTML = `
    <section class="panel" hidden>
      <header><div class="brand"><span class="brand-mark">H</span><span class="brand-copy"><strong>Herramientas</strong><span data-adapter>Contexto local confirmado</span></span></div><div class="header-actions"><button class="drag" type="button" data-drag aria-label="Mover burbuja" title="Mover burbuja">Mover</button><button type="button" data-close aria-label="Cerrar panel" title="Cerrar panel">Cerrar</button></div></header>
      <p data-status>Selecciona texto visible o extrae la transcripción disponible.</p>
      <div class="actions"><button type="button" data-send="resumidor"><span class="action-icon">R</span>Resumir selección</button><button type="button" data-transcript="clases"><span class="action-icon">T</span>Enviar transcripción</button><button type="button" data-send="ingles"><span class="action-icon">EN</span>Practicar inglés</button><button type="button" data-send="tecnologia"><span class="action-icon">TI</span>Analizar tecnología</button><button type="button" data-send="musica"><span class="action-icon">MU</span>Profesor de música</button><button type="button" data-send="legal"><span class="action-icon">LG</span>Análisis legal</button><button type="button" data-send="visuales"><span class="action-icon">V</span>Crear recurso visual</button><button type="button" class="wide" data-send="codigo"><span class="action-icon">C</span>Revisar código</button></div>
      <button type="button" class="open-app" data-open>Enviar y abrir Herramientas</button><p class="privacy">Solo se envía texto confirmado. El contexto temporal y el caché local vencen en siete días.</p>
    </section><button type="button" class="toggle" aria-label="Abrir Herramientas" aria-expanded="false"><span>H</span><span class="signal" aria-hidden="true"></span></button>
  `;
}

async function applySavedPosition(host) {
  const position = await storageGet(POSITION_KEY);
  if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) return;
  host.style.left = `${Math.max(8, Math.min(position.left, innerWidth - 64))}px`;
  host.style.top = `${Math.max(8, Math.min(position.top, innerHeight - 64))}px`;
  host.style.right = "auto";
  host.style.bottom = "auto";
}

function makeDraggable(host, handle, panel) {
  let drag = null;
  const move = (event) => { if (!drag) return; const left = Math.max(8, Math.min(event.clientX - drag.dx, innerWidth - 64)); const top = Math.max(8, Math.min(event.clientY - drag.dy, innerHeight - 64)); host.style.left = `${left}px`; host.style.top = `${top}px`; host.style.right = "auto"; host.style.bottom = "auto"; };
  const end = () => { if (!drag) return; const rect = host.getBoundingClientRect(); drag = null; panel.classList.remove("dragging"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); void storageSet({ [POSITION_KEY]: { left: Math.round(rect.left), top: Math.round(rect.top) } }); };
  handle.addEventListener("pointerdown", (event) => { if (event.button !== 0) return; const rect = host.getBoundingClientRect(); drag = { dx: event.clientX - rect.left, dy: event.clientY - rect.top }; panel.classList.add("dragging"); window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end); event.preventDefault(); });
}

function removeBubble() {
  bubbleHost?.remove();
  bubbleHost = null;
}

function ensureBubble() {
  if (blockedOrigin() || bubbleHost || document.getElementById(HOST_ID)) return;
  const host = document.createElement("div");
  host.id = HOST_ID;
  bubbleHost = host;
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.append(createStyle());
  const root = document.createElement("div");
  createMarkup(root);
  shadow.append(root);
  document.documentElement.append(host);
  void applySavedPosition(host);
  void purgeExpiredCaptures();

  const panel = root.querySelector(".panel");
  const status = root.querySelector("[data-status]");
  const adapterLabel = root.querySelector("[data-adapter]");
  const toggle = root.querySelector(".toggle");
  const adapter = platformAdapter();
  adapterLabel.textContent = `${adapter.name} · contexto local`;
  const updateSelectionStatus = () => { const size = safeSelection().length; if (size) { status.textContent = `${size} caracteres seleccionados. Elige una acción.`; status.classList.add("status-ready"); } else { status.textContent = "Selecciona texto visible o extrae la transcripción disponible."; status.classList.remove("status-ready"); } };
  document.addEventListener("selectionchange", updateSelectionStatus, { passive: true });
  toggle.addEventListener("click", () => { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) updateSelectionStatus(); });
  root.querySelector("[data-close]").addEventListener("click", () => { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); });
  root.querySelector("[data-open]").addEventListener("click", async () => { const response = await sendMessage({ type: "herramientas:open-app" }); status.textContent = response?.ok ? "Herramientas se abrió en una pestaña local." : response?.error ?? "No se pudo abrir Herramientas."; });
  makeDraggable(host, root.querySelector("[data-drag]"), panel);

  root.querySelectorAll("[data-send]").forEach((button) => {
    button.addEventListener("click", async () => {
      const selectedText = safeSelection();
      if (!selectedText) { status.textContent = "Selecciona texto visible antes de enviar contexto."; return; }
      status.textContent = "Enviando contexto local...";
      const payload = { ...pagePayload(selectedText, "selection", adapter.name), requestedTool: button.dataset.send, consent: true };
      await cacheCapture(payload);
      const response = await sendMessage({ type: "herramientas:context", payload });
      status.textContent = response?.ok ? "Contexto enviado. Abre Herramientas para continuar." : response?.error ?? "No se pudo enviar el contexto.";
    });
  });

  root.querySelector("[data-transcript]").addEventListener("click", async (event) => {
    const transcript = extractTranscript();
    if (!transcript.text) { status.textContent = `No encontré una transcripción visible para ${transcript.adapter}. Usa selección manual o un archivo VTT/SRT.`; return; }
    status.textContent = `Transcripción detectada (${transcript.adapter}). Enviando...`;
    const payload = { ...pagePayload(transcript.text, "transcript", transcript.adapter), requestedTool: event.currentTarget.dataset.transcript, consent: true };
    await cacheCapture(payload);
    const response = await sendMessage({ type: "herramientas:context", payload });
    status.textContent = response?.ok ? "Transcripción enviada al gestor de clases." : response?.error ?? "No se pudo enviar la transcripción.";
  });
}

runtimeApi().runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "herramientas:reset-position") return false;
  void storageRemove(POSITION_KEY).then(() => { if (bubbleHost) { bubbleHost.style.left = ""; bubbleHost.style.top = ""; bubbleHost.style.right = "20px"; bubbleHost.style.bottom = "20px"; } sendResponse({ ok: true }); });
  return true;
});

runtimeApi().storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes[ENABLED_KEY]) return;
  if (changes[ENABLED_KEY].newValue === false) removeBubble();
  else ensureBubble();
});

void storageGet(ENABLED_KEY).then((enabled) => { if (enabled !== false) ensureBubble(); });