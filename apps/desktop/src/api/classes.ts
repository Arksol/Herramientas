export type ObsStatus = { installed: boolean; path: string | null };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con el servicio local.");
  return body as T;
}

export function getObsStatus() {
  return apiRequest<ObsStatus>("/api/obs/status");
}

export function launchObsStudio(classTitle: string, outputFolder: string) {
  return apiRequest<{ opened: boolean; path: string }>("/api/obs/open", {
    method: "POST",
    body: JSON.stringify({ classTitle, outputFolder })
  });
}
