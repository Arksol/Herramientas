export type ObsStatus = { installed: boolean; path: string | null };

export type ClassPlanInput = {
  platform: string;
  classTitle: string;
  officialUrl: string;
  outputFolder: string;
  recordingAuthorized: boolean;
  recordingConsentConfirmed: boolean;
};

export type ClassPlan = {
  planId: string;
  platform: string;
  flow: "official-download" | "contextual-study";
  recordingApproved: boolean;
  nextSteps: string[];
  notices: string[];
  expiresAt: string | number;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
const isTauri = () => "__TAURI_INTERNALS__" in window;

async function invoke<T>(command: string, payload?: Record<string, string | boolean>): Promise<T> {
  if (!isTauri()) throw new Error("Esta función está disponible desde la aplicación de escritorio.");
  const { invoke: nativeInvoke } = await import("@tauri-apps/api/core");
  return nativeInvoke<T>(command, payload);
}

async function localRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message ?? "No se pudo conectar con el servicio local.");
  return payload as T;
}

export function getObsStatus() {
  return invoke<ObsStatus>("get_obs_status");
}

export function prepareClassPlan(input: ClassPlanInput) {
  return isTauri()
    ? invoke<ClassPlan>("prepare_class_plan", input)
    : localRequest<ClassPlan>("/api/classes/plan", input);
}

export function launchObsStudio(classTitle: string, outputFolder: string, recordingAuthorized: boolean, recordingConsentConfirmed: boolean) {
  return invoke<void>("launch_obs_studio", { classTitle, outputFolder, recordingAuthorized, recordingConsentConfirmed });
}