const isTauri = () => "__TAURI_INTERNALS__" in window;

export type ObsStatus = { installed: boolean; path: string | null };

async function invoke<T>(command: string, payload?: Record<string, string>): Promise<T> {
  if (!isTauri()) throw new Error("Esta funcion esta disponible desde la aplicacion de escritorio.");
  const { invoke: nativeInvoke } = await import("@tauri-apps/api/core");
  return nativeInvoke<T>(command, payload);
}

export function getObsStatus() {
  return invoke<ObsStatus>("get_obs_status");
}

export function launchObsStudio(classTitle: string, outputFolder: string) {
  return invoke<void>("launch_obs_studio", { classTitle, outputFolder });
}
