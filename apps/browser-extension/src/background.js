import { localRequest, runtimeApi } from "./shared.js";

const api = runtimeApi();
const APP_URL = "http://127.0.0.1:1420/";
const PENDING_CONTEXT_KEY = "herramientasPendingContext";

function respond(promise, sendResponse) {
  Promise.resolve(promise).then(sendResponse).catch((error) => sendResponse({ ok: false, error: error?.message ?? "No se pudo completar la acción." }));
  return true;
}

api.runtime.onInstalled.addListener(() => {
  api.storage.local.set({ herramientasEnabled: true });
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "herramientas:health") return respond(localRequest("/api/extension/health").catch((error) => ({ ok: false, error: error.message })), sendResponse);
  if (message?.type === "herramientas:context") return respond((async () => { const result = await localRequest("/api/context/inspect", { method: "POST", body: JSON.stringify(message.payload) }); if (result?.ok && result.contextSessionId) await api.storage.local.set({ [PENDING_CONTEXT_KEY]: { contextSessionId: result.contextSessionId, requestedTool: message.payload.requestedTool, createdAt: Date.now() } }); return result; })().catch((error) => ({ ok: false, error: error.message })), sendResponse);
  if (message?.type === "herramientas:open-app") return respond((async () => { const stored = await api.storage.local.get(PENDING_CONTEXT_KEY); const pending = stored?.[PENDING_CONTEXT_KEY]; const query = pending?.contextSessionId && pending?.requestedTool ? `?tool=${encodeURIComponent(pending.requestedTool)}&context=${encodeURIComponent(pending.contextSessionId)}` : ""; await api.tabs.create({ url: `${APP_URL}${query}` }); return { ok: true, contextSessionId: pending?.contextSessionId ?? null }; })(), sendResponse);
  if (message?.type === "herramientas:reset-position") {
    const reset = async () => {
      await api.storage.local.remove("herramientasBubblePosition");
      const tabs = await api.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) await api.tabs.sendMessage(tabs[0].id, { type: "herramientas:reset-position" }).catch(() => undefined);
      return { ok: true };
    };
    return respond(reset(), sendResponse);
  }
  return false;
});