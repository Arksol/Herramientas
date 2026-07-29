const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const isLocalWebApp = localHosts.has(window.location.hostname);
export const apiUrl = import.meta.env.VITE_API_URL || "";

export function serviceError(fallback = "No se pudo conectar con el servicio local.") {
  if (!isLocalWebApp && !import.meta.env.VITE_API_URL) {
    return "Esta vista web no tiene acceso al servicio local. Abre la aplicación de escritorio o inicia la aplicación local.";
  }
  return fallback;
}
