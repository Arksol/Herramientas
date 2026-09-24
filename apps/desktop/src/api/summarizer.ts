export type Summary = { markdown: string; keyPoints: string[]; sourceCharacters: number };
export type SourceKind = "text" | "link" | "image" | "video" | "file";
export type SourceAnalysis = { kind: SourceKind; text: string; sourceLabel: string; usedLocalAi: boolean; notes: string[] };
export type ObsidianStatus = { configured: boolean; endpoint: string; vaultHint: string };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }, ...options });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con el servicio local.");
  return body as T;
}

export async function analyzeSource(kind: SourceKind, source: string): Promise<SourceAnalysis> {
  return apiRequest<SourceAnalysis>("/api/summarizer/analyze", { method: "POST", body: JSON.stringify({ kind, source }) });
}

export async function analyzeUploadedFile(fileName: string, data: ArrayBuffer): Promise<SourceAnalysis> {
  let binary = "";
  const bytes = new Uint8Array(data);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return apiRequest<SourceAnalysis>("/api/summarizer/analyze-upload", {
    method: "POST",
    body: JSON.stringify({ fileName, data: btoa(binary) })
  });
}

export async function summarizeText(text: string, title: string): Promise<Summary> {
  return apiRequest<Summary>("/api/summarizer/generate", { method: "POST", body: JSON.stringify({ text, title }) });
}

export function getObsidianStatus() {
  return apiRequest<ObsidianStatus>("/api/obsidian/status");
}

export function configureObsidian(apiKey: string) {
  return apiRequest<ObsidianStatus>("/api/obsidian/configure", { method: "POST", body: JSON.stringify({ apiKey }) });
}

export function testObsidianConnection() {
  return apiRequest<ObsidianStatus>("/api/obsidian/test", { method: "POST" });
}

export function saveToObsidian(notePath: string, markdown: string) {
  return apiRequest<void>("/api/obsidian/save", { method: "POST", body: JSON.stringify({ notePath, markdown }) });
}

export function appendToObsidian(notePath: string, markdown: string, headingLevel: number) {
  return apiRequest<void>("/api/obsidian/append", { method: "POST", body: JSON.stringify({ notePath, markdown, headingLevel }) });
}
