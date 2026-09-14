export const LOCAL_API = "http://127.0.0.1:3030";

export function runtimeApi() {
  return globalThis.browser ?? globalThis.chrome;
}

export async function localRequest(path, options = {}) {
  const response = await fetch(`${LOCAL_API}${path}`, {
    credentials: "omit",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con Herramientas local.");
  return body;
}

export function safeSelection() {
  const selection = String(globalThis.getSelection?.() ?? "").trim();
  return selection.slice(0, 20000);
}

export function pagePayload(selectedText) {
  return {
    origin: location.origin,
    url: location.href,
    title: document.title,
    selectedText,
    capturedAt: new Date().toISOString()
  };
}
