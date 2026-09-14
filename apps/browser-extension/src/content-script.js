const LOCAL_API = "http://127.0.0.1:3030";
const HOST_ID = "herramientas-context-host";
const POSITION_KEY = "herramientasBubblePosition";
const CACHE_DB = "herramientas-context-cache";
const CACHE_STORE = "captures";
const MAX_CONTEXT = 20000;

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

function pagePayload(selectedText, sourceKind = "selection") {
  return {
    origin: location.origin,
    url: location.href,
    title: document.title,
    selectedText,
    sourceKind,
    capturedAt: new Date().toISOString()
  };
}

function storageGet(key) {
  const api = runtimeApi();
  return new Promise((resolve) => api.storage.local.get(key, (value) => resolve(value?.[key])));
}

function storageSet(value) {
  const api = runtimeApi();
  return new Promise((resolve) => api.storage.local.set(value, resolve));
}

function sendContext(payload, callback) {
  const api = runtimeApi();
  api.runtime.sendMessage({ type: "herramientas:context", payload }, (response) => {
    const runtimeError = api.runtime.lastError?.message;
    callback(runtimeError ? { ok: false, error: runtimeError } : response);
  });
}

function openCache() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cacheCapture(payload) {
  try {
    const db = await openCache();
    const transaction = db.transaction(CACHE_STORE, "readwrite");
    transaction.objectStore(CACHE_STORE).put({ id: location.href, ...payload });
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch {
    // Cache is a convenience layer; context sending must still work without it.
  }
}

function textFromSelectors(selectors) {
  const seen = new Set();
  const parts = [];
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((node) => {
      const text = safeText(node.textContent, 5000);
      if (text.length > 30 && !seen.has(text)) {
        seen.add(text);
        parts.push(text);
      }
    });
  }
  return safeText(parts.join("\n\n"));
}

function transcriptFromTracks() {
  const video = document.querySelector("video");
  const tracks = Array.from(video?.textTracks ?? []);
  const parts = [];
  for (const track of tracks) {
    try { track.mode = "hidden"; } catch {}
    const cues = Array.from(track.cues ?? []);
    for (const cue of cues) {
      const text = safeText(cue.text, 1000);
      if (text) parts.push(`[${Math.round(cue.startTime)}s] ${text}`);
    }
  }
  return safeText(parts.join("\n"));
}

function platformAdapter() {
  const host = location.hostname.toLowerCase();
  if (host.includes("platzi.com")) {
    return {
      name: "Platzi",
      selectors: [
        '[data-testid*="transcript" i]', '[class*="transcript" i]', '[class*="Transcript" i]',
        '[class*="caption" i]', '[class*="subtitle" i]', 'aside [role="listitem"]', 'main p'
      ]
    };
  }
  if (host.includes("ebac")) {
    return {
      name: "EBAC",
      selectors: ['[class*="transcript" i]', '[class*="lesson" i] p', '[class*="subtitle" i]', '[class*="caption" i]', 'main p']
    };
  }
  if (host.includes("class.com") || host.includes("uvm")) {
    return {
      name: "UVM/Class",
      selectors: ['[class*="transcript" i]', '[class*="caption" i]', '[aria-label*="transcript" i]', '[data-testid*="caption" i]', 'main p']
    };
  }
  if (host.includes("mastermind")) {
    return {
      name: "Mastermind",
      selectors: ['[class*="transcript" i]', '[class*="lesson" i] p', '[class*="caption" i]', '[class*="subtitle" i]', 'main p']
    };
  }
  return { name: "Generico", selectors: ['[class*="transcript" i]', '[class*="caption" i]', '[class*="subtitle" i]', 'article p', 'main p'] };
}

function extractTranscript() {
  const adapter = platformAdapter();
  const trackText = transcriptFromTracks();
  if (trackText.length > 80) return { text: trackText, adapter: `${adapter.name}: video.textTracks` };
  const domText = textFromSelectors(adapter.selectors);
  if (domText.length > 80) return { text: domText, adapter: `${adapter.name}: DOM` };
  return { text: "", adapter: adapter.name };
}

function createStyle() {
  const style = document.createElement("style");
  style.textContent = `
    :host{all:initial;position:fixed;right:18px;bottom:18px;z-index:2147483647;font-family:Inter,Arial,system-ui,sans-serif;color:#e8edf6}
    *,*::before,*::after{box-sizing:border-box}
    button{font:inherit;cursor:pointer}
    .toggle{width:48px;height:48px;border-radius:50%;border:1px solid #6da5e9;background:#112846;color:#dcecff;font-weight:700;box-shadow:0 10px 30px #0008}
    .panel{width:min(320px,calc(100vw - 36px));margin-bottom:10px;border:1px solid #415775;border-radius:8px;background:#0c1521f7;box-shadow:0 18px 60px #0009;padding:12px;backdrop-filter:blur(14px)}
    .panel[hidden]{display:none}
    header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:10px}
    strong{font-size:13px;color:#f5f8ff}
    header button{border:0;background:transparent;color:#a8caff;text-decoration:underline;font-size:12px;padding:2px}
    p{font-size:12px;line-height:1.45;color:#adb7c7;margin:0 0 10px}
    .actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .actions button{min-height:34px;border:1px solid #34475e;border-radius:8px;background:#101d2e;color:#e8edf6;padding:8px;font-size:12px}
    .actions button:hover,.toggle:hover{border-color:#88bdf5;background:#142b47}
    .drag{touch-action:none;cursor:move;color:#8dbbf1;font-size:12px;text-decoration:none;border:0;background:transparent;padding:2px}
  `;
  return style;
}

function createMarkup(root) {
  root.innerHTML = `
    <section class="panel" hidden>
      <header><strong>Herramientas</strong><button class="drag" type="button" data-drag>mover</button><button type="button" data-close>cerrar</button></header>
      <p data-status>Selecciona texto o extrae la transcripcion visible de la clase.</p>
      <div class="actions">
        <button type="button" data-send="resumidor">Resumir seleccion</button>
        <button type="button" data-transcript="clases">Transcripcion</button>
        <button type="button" data-send="ingles">Ingles</button>
        <button type="button" data-send="tecnologia">Tecnologia</button>
        <button type="button" data-send="visuales">Visual</button>
        <button type="button" data-send="codigo">Codigo</button>
      </div>
    </section>
    <button type="button" class="toggle" aria-label="Abrir Herramientas">H</button>
  `;
}

async function applySavedPosition(host) {
  const position = await storageGet(POSITION_KEY);
  if (!position) return;
  host.style.left = `${Math.max(8, Math.min(position.left, innerWidth - 64))}px`;
  host.style.top = `${Math.max(8, Math.min(position.top, innerHeight - 64))}px`;
  host.style.right = "auto";
  host.style.bottom = "auto";
}

function makeDraggable(host, handle) {
  let drag = null;
  const start = (event) => {
    const point = event.touches?.[0] ?? event;
    const rect = host.getBoundingClientRect();
    drag = { dx: point.clientX - rect.left, dy: point.clientY - rect.top };
    event.preventDefault();
  };
  const move = (event) => {
    if (!drag) return;
    const point = event.touches?.[0] ?? event;
    const left = Math.max(8, Math.min(point.clientX - drag.dx, innerWidth - 64));
    const top = Math.max(8, Math.min(point.clientY - drag.dy, innerHeight - 64));
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    host.style.right = "auto";
    host.style.bottom = "auto";
    event.preventDefault();
  };
  const end = () => {
    if (!drag) return;
    const rect = host.getBoundingClientRect();
    drag = null;
    storageSet({ [POSITION_KEY]: { left: Math.round(rect.left), top: Math.round(rect.top) } });
  };
  handle.addEventListener("pointerdown", start);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", end);
  host.addEventListener("pointercancel", end);
}

function ensureBubble() {
  if (blockedOrigin() || document.getElementById(HOST_ID)) return;
  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.append(createStyle());
  const root = document.createElement("div");
  createMarkup(root);
  shadow.append(root);
  document.documentElement.append(host);
  applySavedPosition(host);

  const panel = root.querySelector(".panel");
  const status = root.querySelector("[data-status]");
  root.querySelector(".toggle").addEventListener("click", () => { panel.hidden = !panel.hidden; });
  root.querySelector("[data-close]").addEventListener("click", () => { panel.hidden = true; });
  makeDraggable(host, root.querySelector("[data-drag]"));

  root.querySelectorAll("[data-send]").forEach((button) => {
    button.addEventListener("click", async () => {
      const selectedText = safeSelection();
      if (!selectedText) {
        status.textContent = "Selecciona texto visible antes de enviar contexto.";
        return;
      }
      status.textContent = "Enviando contexto local...";
      const payload = { ...pagePayload(selectedText), requestedTool: button.dataset.send, consent: true };
      await cacheCapture(payload);
      sendContext(payload, (response) => { status.textContent = response?.ok === false ? response.error : "Contexto enviado a Herramientas local."; });
    });
  });

  root.querySelector("[data-transcript]").addEventListener("click", async () => {
    const transcript = extractTranscript();
    if (!transcript.text) {
      status.textContent = `No encontre transcripcion visible con el adaptador ${transcript.adapter}. Usa seleccion manual o un archivo VTT/SRT.`;
      return;
    }
    status.textContent = `Transcripcion detectada (${transcript.adapter}). Enviando...`;
    const payload = { ...pagePayload(transcript.text, "transcript"), requestedTool: "resumidor", consent: true, adapter: transcript.adapter };
    await cacheCapture(payload);
    sendContext(payload, (response) => { status.textContent = response?.ok === false ? response.error : "Transcripcion enviada a Herramientas local."; });
  });
}

ensureBubble();
