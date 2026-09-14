import { useEffect, useState } from "react";
import { getObsStatus, launchObsStudio, type ObsStatus } from "../api/classes";
import { analyzeSource, summarizeText, type SourceAnalysis, type SourceKind, type Summary } from "../api/summarizer";

type Props = { disabled: boolean; onActivity: () => Promise<void> | void };
type ClassSourceKind = Extract<SourceKind, "text" | "link" | "file" | "video">;
const platforms = ["Class (UVM)", "EBAC", "Mastermind", "Platzi", "Otra plataforma autorizada"];
const sourceLabels: Record<ClassSourceKind, string> = { text: "Texto/transcripcion", link: "Link", file: "VTT/SRT/archivo", video: "Video local" };

function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "No se pudo completar la accion.";
}

function fileName(title: string) {
  const cleaned = title.trim().replace(/[<>:"/\\|?*]/g, "-").replace(/\s+/g, " ");
  return `${cleaned || "Resumen de clase"}.md`;
}

function sourcePlaceholder(kind: ClassSourceKind) {
  if (kind === "link") return "Pega el enlace oficial de la clase o pagina con contenido legible.";
  if (kind === "file") return "Pega la ruta completa de un .vtt, .srt, .txt, .md, .html, .json o archivo de texto.";
  if (kind === "video") return "Pega la ruta completa de un video local mp4, mov, mkv, webm o avi. Usa Whisper/Ollama locales si estan configurados.";
  return "Pega la transcripcion de la clase, subtitulos o apuntes autorizados.";
}

export default function ClassDownloadPanel({ disabled, onActivity }: Props) {
  const [platform, setPlatform] = useState(platforms[0]);
  const [classTitle, setClassTitle] = useState("Resumen de clase");
  const [officialUrl, setOfficialUrl] = useState("");
  const [outputFolder, setOutputFolder] = useState("");
  const [sourceKind, setSourceKind] = useState<ClassSourceKind>("text");
  const [source, setSource] = useState("");
  const [obs, setObs] = useState<ObsStatus | null>(null);
  const [analysis, setAnalysis] = useState<SourceAnalysis | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getObsStatus().then(setObs).catch(() => setObs({ installed: false, path: null })); }, []);

  const prepareOfficial = () => {
    void onActivity(); setError(""); setMessage("");
    if (!classTitle.trim() || !officialUrl.trim() || !outputFolder.trim()) {
      setError("Indica la clase, su enlace oficial y la carpeta donde la organizaras."); return;
    }
    try { new URL(officialUrl); } catch { setError("Escribe una URL valida de la plataforma autorizada."); return; }
    setMessage("Plan preparado. Usa unicamente el boton oficial de descarga de la plataforma y guarda el archivo en la carpeta elegida.");
  };

  const generateSummary = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      await onActivity();
      const prepared = await analyzeSource(sourceKind, source);
      const heading = `${classTitle.trim() || "Resumen de clase"} - ${platform}`;
      const result = await summarizeText(prepared.text, heading);
      setAnalysis(prepared);
      setSummary(result);
      setMessage(`${prepared.sourceLabel}: ${prepared.notes.join(" ")}`);
    } catch (reason) { setError(errorText(reason)); }
    finally { setBusy(false); }
  };

  const copySummary = async () => {
    if (!summary) return;
    try { await navigator.clipboard.writeText(summary.markdown); setMessage("Markdown copiado al portapapeles."); }
    catch { setError("No se pudo copiar automaticamente. Selecciona el Markdown y copialo manualmente."); }
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([summary.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName(classTitle);
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`Archivo ${fileName(classTitle)} preparado para descarga.`);
  };

  const openObs = async () => {
    await onActivity(); setError(""); setMessage("");
    if (!classTitle.trim() || !outputFolder.trim()) { setError("Indica el nombre de la clase y una carpeta existente para la grabacion."); return; }
    setBusy(true);
    try {
      await launchObsStudio(classTitle, outputFolder);
      setMessage("OBS Studio se abrio. Antes de grabar, confirma en OBS que la carpeta de salida sea la indicada y que tienes autorizacion para registrar la clase.");
    } catch (reason) { setError(errorText(reason)); }
    finally { setBusy(false); }
  };

  return <section className="class-panel">
    <div className="class-card">
      <p className="eyebrow">Clase autorizada</p>
      <h2>Procesar clase</h2>
      <p>Herramientas no elude protecciones, sesiones, DRM ni limites de las plataformas. Usa descargas oficiales, transcripciones visibles, archivos propios o grabaciones con permiso.</p>
      <label>Plataforma<select value={platform} onChange={(event) => setPlatform(event.target.value)} disabled={disabled}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Nombre de la clase<input value={classTitle} onFocus={onActivity} onChange={(event) => setClassTitle(event.target.value)} placeholder="Ej. Introduccion a JavaScript" disabled={disabled} /></label>
      <label>Enlace oficial de la clase<input value={officialUrl} onFocus={onActivity} onChange={(event) => { setOfficialUrl(event.target.value); if (sourceKind === "link") setSource(event.target.value); }} placeholder="https://..." disabled={disabled} /></label>
      <label>Carpeta para organizar el archivo<input value={outputFolder} onFocus={onActivity} onChange={(event) => setOutputFolder(event.target.value)} placeholder="C:\\Cursos\\Clase 01" disabled={disabled} /></label>
      <button className="primary" onClick={prepareOfficial} disabled={disabled || busy}>Preparar descarga autorizada -&gt;</button>
      <div className="class-source-block">
        <label>Fuente para resumen</label>
        <div className="source-kind" role="group" aria-label="Fuente para clase">{(Object.keys(sourceLabels) as ClassSourceKind[]).map((kind) => <button key={kind} type="button" className={sourceKind === kind ? "selected" : ""} onClick={() => { setSourceKind(kind); if (kind === "link" && officialUrl) setSource(officialUrl); }}>{sourceLabels[kind]}</button>)}</div>
        <textarea value={source} onFocus={onActivity} onChange={(event) => setSource(event.target.value)} disabled={disabled || busy} placeholder={sourcePlaceholder(sourceKind)} />
        <button className="secondary" onClick={generateSummary} disabled={disabled || busy || source.trim().length < 3}>{busy ? "Procesando..." : "Analizar y resumir clase"}</button>
      </div>
    </div>
    <aside className="class-card obs-card">
      <p className="eyebrow">Resumen y OBS</p>
      {summary ? <>
        <h2>Markdown listo</h2>
        {analysis && <p className="summary-meta">Fuente: {analysis.sourceLabel} - {analysis.usedLocalAi ? "IA local usada" : "Extraccion local"}</p>}
        <textarea className="summary-editor class-summary-editor" value={summary.markdown} onChange={(event) => setSummary({ ...summary, markdown: event.target.value })} disabled={disabled || busy} aria-label="Resumen Markdown de la clase" />
        <div className="export-actions"><button className="secondary" onClick={copySummary} disabled={disabled || busy}>Copiar Markdown</button><button className="secondary" onClick={downloadSummary} disabled={disabled || busy}>Descargar .md</button></div>
      </> : <>
        <h2>Preparar OBS Studio</h2>
        <p>{obs?.installed ? "OBS Studio esta disponible en este equipo." : "No encontramos OBS Studio en la ruta habitual. Instalalo o configuralo antes de continuar."}</p>
        <div className={`obs-status ${obs?.installed ? "ready" : ""}`}>{obs?.installed ? "OBS detectado" : "OBS no detectado"}</div>
        <ol><li>Abre la clase que tienes permiso para ver y registrar.</li><li>Verifica en OBS la carpeta de salida y la fuente de captura.</li><li>Inicia y deten la grabacion tu mismo desde OBS.</li></ol>
        <button className="secondary" onClick={openObs} disabled={disabled || busy || !obs?.installed}>{busy ? "Abriendo OBS..." : "Abrir OBS Studio"}</button>
      </>}
      <p className="form-error" aria-live="polite">{error}</p><p className="form-notice" aria-live="polite">{message}</p>
    </aside>
  </section>;
}
