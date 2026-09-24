export type SessionState = "active" | "paused" | "inactive" | "blocked" | "signed_out";

export type Session = {
  authenticated: boolean;
  configured?: boolean;
  state: SessionState;
  expiresAt?: string | number;
  lastActivityAt?: string | number;
  tools?: string[];
  accountType?: "guest" | "local" | "registered";
  username?: string | null;
  benefits?: string[];
  twoFactor?: boolean;
};

export type RegistrationResult = { registered: boolean; identifier: string; twoFactor: { type: "TOTP"; issuer: string; secret: string; otpauthUri: string }; next: string };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }, ...options });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo conectar con el servicio local.");
  return body as T;
}

export const sessionApi = {
  get: () => request<Session>("/api/auth/session"),
  configure: (accessCode: string) => request<Session>("/api/auth/configure", { method: "POST", body: JSON.stringify({ accessCode }) }),
  login: (accessCode: string) => request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify({ accessCode }) }),
  register: (identifier: string, password: string) => request<RegistrationResult>("/api/auth/register", { method: "POST", body: JSON.stringify({ identifier, password }) }),
  loginRegistered: (identifier: string, password: string, totpCode: string) => request<Session>("/api/auth/login-registered", { method: "POST", body: JSON.stringify({ identifier, password, totpCode }) }),
  pause: () => request<Session>("/api/auth/pause", { method: "POST" }),
  resume: () => request<Session>("/api/auth/resume", { method: "POST" }),
  activity: () => request<Session>("/api/auth/activity", { method: "POST" }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" })
};
