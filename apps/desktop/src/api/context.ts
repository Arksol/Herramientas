export type ContextPayload = {
  origin: string;
  url: string;
  title: string;
  selectedText: string;
  sourceKind: string;
  adapter?: string;
  requestedTool: string;
  expiresAt: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";

export async function getPendingContext(contextId: string): Promise<ContextPayload> {
  const response = await fetch(`${apiUrl}/api/context/latest/${encodeURIComponent(contextId)}`, { credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo recuperar el contexto local.");
  return body as ContextPayload;
}
