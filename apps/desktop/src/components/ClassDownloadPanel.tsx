import { useEffect, useState } from "react";
import { getObsStatus, launchObsStudio, prepareClassPlan, type ClassPlan, type ObsStatus } from "../api/classes";
import { analyzeSource, summarizeText, type SourceAnalysis, type SourceKind, type Summary } from "../api/summarizer";

type Props = { disabled: boolean; onActivity: () => Promise<void> | void };
type ClassSourceKind = Extract<SourceKind, "text" | "link" | "file" | "video">;

const platforms = ["Class (UVM)", "Blackboard UVM", "EBAC", "Mastermind", "Platzi", "Coursera", "YouTube", "Otra plataforma autorizada"];
const sourceLabels: Record<ClassSourceKind, string> = {
  text: "Texto o transcripción",
  link: "Enlace",
  file: "VTT/SRT o archivo",
  video: "Vídeo local"
};

function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "No se pudo completar la acción.";
}

function fileName(title: string) {
  const cleaned = title.trim().replace(/[<>:"/\\|?*]/g, "-").replace(/\s+/g, " ");
  return `${cleaned || "Resumen de clase"}.md`;
}

function sourcePlaceholder(kind: ClassSourceKind) {
  if (kind === "link") return "Pega el enlace oficial de la clase o una página con contenido legible y autorizado.";
  if (kind === "file") return "Pega la ruta completa de un .vtt, .srt, .txt, .md, .html, .json o archivo de texto.";
  if (kind === "video") return "Pega la ruta completa de un vídeo local mp4, mov, mkv, webm o avi. Usa Whisper y Ollama locales si están configurados.";
  return "Pega la transcripción de la clase, subtítulos o apuntes autorizados.";
}

export default function ClassDownloadPanel({ disabled, onActivity }: Props) {
  const [platform, setPlatform] = useState(platforms[0]);
  const [classTitle, setClassTitle] = useState("Resumen de clase");
  const [officialUrl, setOfficialUrl] = useState("");
  const [outputFolder, setOutputFolder] = useState("");
  const [sourceKind, setSourceKind] = useState<ClassSourceKind>("text");
  const [source, setSource] = useState("");
  const [obs, setObs] = useState<ObsStatus | null>(null);
  const [plan, setPlan] = useState<ClassPlan | null>(null);
  const [recordingAuthorized, setRecordingAuthorized] = useState(false);
  const [recordingConsentConfirmed, setRecordingConsentConfirmed] = useState(false);
  const [analysis, setAnalysis] = useState<SourceAnalysis | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getObsStatus().then(setObs).catch(() => setObs({ installed: false, path: null }));
  }, []);

  const resetPlan = () => setPlan(null);

  const prepareOfficial = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await onActivity();
      const prepared = await prepareClassPlan({ platform, classTitle, officialUrl, outputFolder, recordingAuthorized, recordingConsentConfirmed });
      setPlan(prepared);
      setMessage(prepared.notices[0] ?? "Plan preparado.");
    } catch (reason) {
      setPlan(null);
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  const generateSummary = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await onActivity();
      const prepared = await analyzeSource(sourceKind, source);
      const heading = `${classTitle.trim() || "Resumen de clase"} - ${platform}`;
      const result = await summarizeText(prepared.text, heading);
      setAnalysis(prepared);
      setSummary(result);
      setMessage(`${prepared.sourceLabel}: ${prepared.notes.join(" ")}`);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.markdown);
      setMessage("Markdown copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar automáticamente. Selecciona el Markdown y cópialo manualmente.");
    }
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
    setError("");
    setMessage("");
    if (!plan?.recordingApproved) {
      setError("Prepara el plan y confirma ambos avisos antes de abrir OBS Studio.");
      return;
    }
    setBusy(true);
    try {
      await onActivity();
      await launchObsStudio(classTitle, outputFolder, recordingAuthorized, recordingConsentConfirmed);
      setMessage("OBS Studio se abrió. Herramientas no inicia ni detiene la grabación; revisa la fuente, la carpeta y el permiso antes de actuar en OBS.");
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  return <section className="class-panel">
    <div className="class-card">
      <p className="eyebrow">Clase autorizada</p>
      <h2>Procesar clase</h2>
      <p>La herramienta no elude protecciones, sesiones, DRM ni límites de las plataformas. Usa descargas oficiales, transcripciones visibles, archivos propios o grabaciones con permiso.</p>
      <label>Plataforma<select value={platform} onChange={(event) => { setPlatform(event.target.value); resetPlan(); }} disabled={disabled || busy}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Nombre de la clase<input value={classTitle} onFocus={onActivity} onChange={(event) => { setClassTitle(event.target.value); resetPlan(); }} placeholder="Ej. Introducción a JavaScript" disabled={disabled || busy} /></label>
      <label>Enlace oficial de la clase<input value={officialUrl} onFocus={onActivity} onChange={(event) => { setOfficialUrl(event.target.value); resetPlan(); if (sourceKind === "link") setSource(event.target.value); }} placeholder="https://..." disabled={disabled || busy} /></label>
      <label>Carpeta para organizar el archivo<input value={outputFolder} onFocus={onActivity} onChange={(event) => { setOutputFolder(event.target.value); resetPlan(); }} placeholder="C:\\Cursos\\Clase 01" disabled={disabled || busy} /></label>
      <div className="legal-confirmations">
        <label><input type="checkbox" checked={recordingAuthorized} onChange={(event) => { setRecordingAuthorized(event.target.checked); resetPlan(); }} disabled={disabled || busy} />Confirmo que la institución, el docente y la plataforma permiten grabar esta clase para mi uso personal.</label>
        <label><input type="checkbox" checked={recordingConsentConfirmed} onChange={(event) => { setRecordingConsentConfirmed(event.target.checked); resetPlan(); }} disabled={disabled || busy} />Entiendo que Herramientas no descarga contenido protegido, no evita DRM y no controla la grabación de OBS.</label>
      </div>
      <button className="primary" onClick={prepareOfficial} disabled={disabled || busy}>Preparar flujo autorizado -&gt;</button>
      {plan && <div className="class-plan"><strong>{plan.flow === "official-download" ? "Flujo de descarga oficial" : "Flujo de estudio contextual"}</strong><ol>{plan.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol></div>}
      <div className="class-source-block">
        <label>Fuente para resumen</label>
        <div className="source-kind" role="group" aria-label="Fuente para clase">{(Object.keys(sourceLabels) as ClassSourceKind[]).map((kind) => <button key={kind} type="button" className={sourceKind === kind ? "selected" : ""} onClick={() => { setSourceKind(kind); if (kind === "link" && officialUrl) setSource(officialUrl); }} disabled={disabled || busy}>{sourceLabels[kind]}</button>)}</div>
        <textarea value={source} onFocus={onActivity} onChange={(event) => setSource(event.target.value)} disabled={disabled || busy} placeholder={sourcePlaceholder(sourceKind)} />
        <button className="secondary" onClick={generateSummary} disabled={disabled || busy || source.trim().length < 3}>{busy ? "Procesando..." : "Analizar y resumir clase"}</button>
      </div>
    </div>
    <aside className="class-card obs-card">
      <p className="eyebrow">Resumen y OBS</p>
      {summary ? <>
        <h2>Markdown listo</h2>
        {analysis && <p className="summary-meta">Fuente: {analysis.sourceLabel} - {analysis.usedLocalAi ? "IA local usada" : "Extracción local"}</p>}
        <textarea className="summary-editor class-summary-editor" value={summary.markdown} onChange={(event) => setSummary({ ...summary, markdown: event.target.value })} disabled={disabled || busy} aria-label="Resumen Markdown de la clase" />
        <div className="export-actions"><button className="secondary" onClick={copySummary} disabled={disabled || busy}>Copiar Markdown</button><button className="secondary" onClick={downloadSummary} disabled={disabled || busy}>Descargar .md</button></div>
      </> : <>
        <h2>Preparar OBS Studio</h2>
        <p>{obs?.installed ? "OBS Studio está disponible en este equipo." : "No encontramos OBS Studio en la ruta habitual. Instálalo o configúralo antes de continuar."}</p>
        <div className={`obs-status ${obs?.installed ? "ready" : ""}`}>{obs?.installed ? "OBS detectado" : "OBS no detectado"}</div>
        <ol><li>Prepara primero el flujo autorizado.</li><li>Verifica en OBS la carpeta de salida y la fuente de captura.</li><li>Inicia y detén la grabación tú mismo desde OBS.</li></ol>
        <button className="secondary" onClick={openObs} disabled={disabled || busy || !obs?.installed || !plan?.recordingApproved}>{busy ? "Abriendo OBS..." : "Abrir OBS Studio"}</button>
      </>}
      <p className="form-error" aria-live="polite">{error}</p><p className="form-notice" aria-live="polite">{message}</p>
    </aside>
  </section>;
}