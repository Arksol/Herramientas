export type ObsStatus = { installed: boolean; path: string | null };

// OBS Studio requiere capacidades nativas; queda pendiente para la futura versión de escritorio.
export function getObsStatus() {
  return Promise.resolve<ObsStatus>({ installed: false, path: null });
}

export function launchObsStudio(_classTitle: string, _outputFolder: string) {
  return Promise.reject<void>(new Error("Abrir OBS Studio queda pendiente en la versión web."));
}
