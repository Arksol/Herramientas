export type LocalAiProfile = {
  role: string;
  model: string;
  context: number;
  device: string;
  note: string;
};

export type LocalModelStatus = {
  id: string;
  name: string;
  size: string;
  purpose: string;
  recommendedFor: string[];
  command: string;
  installed: boolean;
  licenseNote: string;
};

export type LocalAiStatus = {
  available: boolean;
  endpoint: string;
  hardware: string;
  models: string[];
  profiles: LocalAiProfile[];
  modelCatalog: LocalModelStatus[];
};

import { apiUrl, serviceError } from "./base";
const isTauri = () => "__TAURI_INTERNALS__" in window;

export async function getLocalAiStatus(): Promise<LocalAiStatus> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<LocalAiStatus>("get_local_ai_status");
  }
  const response = await fetch(`${apiUrl}/api/local-ai/status`, { credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? serviceError("No se pudo consultar la IA local."));
  return body as LocalAiStatus;
}
