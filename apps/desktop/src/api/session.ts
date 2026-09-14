export type SessionState = "active" | "paused" | "inactive" | "blocked" | "signed_out";

export type Session = {
  authenticated: boolean;
  configured?: boolean;
  state: SessionState;
  expiresAt?: string | number;
  lastActivityAt?: string | number;
  tools?: string[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
const isTauri = () => "__TAURI_INTERNALS__" in window;

async function native<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }, ...options });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con el servicio local.");
  return body as T;
}

export const sessionApi = {
  get: () => isTauri() ? native<Session>("auth_status") : request<Session>("/api/auth/session"),
  configure: (accessCode: string) => isTauri() ? native<Session>("auth_configure", { accessCode }) : request<Session>("/api/auth/configure", { method: "POST", body: JSON.stringify({ accessCode }) }),
  login: (accessCode: string) => isTauri() ? native<Session>("auth_login", { accessCode }) : request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify({ accessCode }) }),
  pause: () => isTauri() ? native<Session>("auth_pause") : request<Session>("/api/auth/pause", { method: "POST" }),
  resume: () => isTauri() ? native<Session>("auth_resume") : request<Session>("/api/auth/resume", { method: "POST" }),
  activity: () => isTauri() ? native<Session>("auth_activity") : request<Session>("/api/auth/activity", { method: "POST" }),
  logout: () => isTauri() ? native<void>("auth_logout") : request<void>("/api/auth/logout", { method: "POST" })
};
