import { localRequest, runtimeApi } from "./shared.js";

const api = runtimeApi();

api.runtime.onInstalled.addListener(() => {
  api.storage.local.set({ herramientasEnabled: true });
});

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "herramientas:health") {
    localRequest("/api/extension/health").then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === "herramientas:context") {
    localRequest("/api/context/inspect", { method: "POST", body: JSON.stringify(message.payload) })
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return false;
});
