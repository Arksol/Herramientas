import { runtimeApi } from "./shared.js";

const api = runtimeApi();
const status = document.getElementById("status");
const check = document.getElementById("check");
const enabled = document.getElementById("enabled");
const reset = document.getElementById("reset");

async function storageGet(key) {
  const value = api.storage.local.get(key);
  const resolved = value && typeof value.then === "function" ? await value : await new Promise((resolve) => api.storage.local.get(key, resolve));
  return resolved?.[key];
}

async function storageSet(value) {
  const result = api.storage.local.set(value);
  if (result && typeof result.then === "function") await result;
  else await new Promise((resolve) => api.storage.local.set(value, resolve));
}

function message(payload) {
  return new Promise((resolve) => api.runtime.sendMessage(payload, (response) => resolve(api.runtime.lastError ? { ok: false, error: api.runtime.lastError.message } : response)));
}

async function verify() {
  status.textContent = "Comprobando app local...";
  const response = await message({ type: "herramientas:health" });
  status.textContent = response?.ok ? "Herramientas local está disponible." : response?.error ?? "No se pudo conectar con la app local.";
}

enabled.addEventListener("change", async () => {
  await storageSet({ herramientasEnabled: enabled.checked });
  status.textContent = enabled.checked ? "La burbuja se habilitó en sitios compatibles." : "La burbuja se ocultó en sitios compatibles.";
});
check.addEventListener("click", verify);
reset.addEventListener("click", async () => {
  const response = await message({ type: "herramientas:reset-position" });
  status.textContent = response?.ok ? "La posición se restableció." : response?.error ?? "No se pudo restablecer la posición.";
});

void storageGet("herramientasEnabled").then((value) => { enabled.checked = value !== false; });
void verify();