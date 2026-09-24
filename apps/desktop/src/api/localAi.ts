export type LocalAiProfile = {
  role: string;
  model: string;
  context: number;
  device: string;
  note: string;
};

export type LocalAiStatus = {
  available: boolean;
  endpoint: string;
  hardware: string;
  models: string[];
  profiles: LocalAiProfile[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
export async function getLocalAiStatus(): Promise<LocalAiStatus> {
  const response = await fetch(`${apiUrl}/api/local-ai/status`, { credentials: "include" });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo consultar la IA local.");
  return body as LocalAiStatus;
}
