import { useEffect, useMemo, useState } from "react";
import { getLocalAiStatus, type LocalAiStatus } from "../api/localAi";
import { analyzeSource, appendToObsidian, configureObsidian, getObsidianStatus, saveToObsidian, summarizeText, testObsidianConnection, type ObsidianStatus, type SourceAnalysis, type SourceKind, type Summary } from "../api/summarizer";

type Props = { disabled: boolean; onActivity: () => Promise<void> };
type SaveMode = "new" | "append";

const sourceLabels: Record<SourceKind, string> = { text: "Texto", link: "Link", image: "Imagen", video: "Video", file: "Archivo" };

function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  try { return JSON.stringify(error); } catch { return "Error desconocido."; }
}

function fileName(title: string) {
  const cleaned = title.trim().replace(/[<>:"/\\|?*]/g, "-").replace(/\s+/g, " ");
  return `${cleaned || "Resumen academico"}.md`;
}

function obsidianFile(uri: string) {
  const url = new URL(uri);
  if (url.protocol !== "obsidian:") throw new Error("La ubicacion debe comenzar con obsidian://.");
  const file = (url.searchParams.get("file") ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!file || file.includes("..")) throw new Error("La URL de Obsidian no contiene una nota valida.");
  return file.endsWith(".md") ? file : `${file}.md`;
}


function updateSummaryMarkdown(summary: Summary, markdown: string): Summary {
  return { ...summary, markdown };
}
function newNoteFromUrl(uri: string, title: string) {
  const reference = obsidianFile(uri);
  const folder = reference.includes("/") ? reference.slice(0, reference.lastIndexOf("/")) : "";
  return folder ? `${folder}/${fileName(title)}` : fileName(title);
}

function sourcePlaceholder(kind: SourceKind) {
  if (kind === "link") return "Pega una URL http o https. Se descargara y limpiara localmente antes de resumir.";
  if (kind === "image") return "Pega la ruta completa de una imagen local png, jpg, jpeg o webp. Requiere Ollama vision.";
  if (kind === "video") return "Pega la ruta completa de un video local mp4, mov, mkv, webm o avi. Requiere ffmpeg y Ollama vision.";
  if (kind === "file") return "Pega la ruta completa de un archivo local de texto, Markdown, codigo, csv, json, srt o vtt.";
  return "Pega apuntes, una transcripcion o texto academico. El analisis se realiza localmente.";
}

function LocalAiPanel({ status }: { status: LocalAiStatus | null }) {
  return <div className="local-ai-panel">
    <h3>IA local multimodal</h3>
    <p>{status?.available ? `Ollama detectado en ${status.endpoint}.` : "Ollama local todavia no esta disponible en 127.0.0.1:11434."}</p>
    <p>Perfil de laptop: NVIDIA GTX 1650 Ti Max-Q 4 GB + Intel Iris Xe 1 GB. La configuracion prioriza modelos 3B/4B cuantizados, vision ligera y extraccion previa de video.</p>
    {status?.models?.length ? <p>Modelos instalados: {status.models.join(", ")}</p> : <p>Modelos sugeridos: texto 3B cuantizado, vision ligera cuantizada, Whisper base/small para audio.</p>}
    {status?.profiles?.length ? <ul>{status.profiles.map((profile) => <li key={profile.role}><b>{profile.role}:</b> {profile.model} - {profile.note}</li>)}</ul> : null}
  </div>;
}

export default function SummarizerPanel({ disabled, onActivity }: Props) {
  const [title, setTitle] = useState("Resumen academico");
  const [source, setSource] = useState("");
  const [sourceKind, setSourceKind] = useState<SourceKind>("text");
  const [notePath, setNotePath] = useState("Resumenes/Resumen academico.md");
  const [obsidianUrl, setObsidianUrl] = useState("");
  const [saveMode, setSaveMode] = useState<SaveMode>("new");
  const [headingLevel, setHeadingLevel] = useState(2);
  const [apiKey, setApiKey] = useState("");
  const [obsidian, setObsidian] = useState<ObsidianStatus | null>(null);
  const [localAi, setLocalAi] = useState<LocalAiStatus | null>(null);
  const [analysis, setAnalysis] = useState<SourceAnalysis | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  const urlDestination = useMemo(() => {
    if (!obsidianUrl.trim()) return "";
    try { return saveMode === "append" ? obsidianFile(obsidianUrl) : newNoteFromUrl(obsidianUrl, title); } catch { return ""; }
  }, [obsidianUrl, saveMode, title]);
  const keyFormVisible = !obsidian?.configured || editingKey;

  useEffect(() => { getObsidianStatus().then(setObsidian).catch(() => undefined); }, []);
  useEffect(() => { getLocalAiStatus().then(setLocalAi).catch(() => undefined); }, []);

  const generate = async () => {
    setLoading(true); setError(""); setNotice("");
    try {
      await onActivity();
      const prepared = await analyzeSource(sourceKind, source);
      setAnalysis(prepared);
      setSummary(await summarizeText(prepared.text, title));
      setNotice(`${prepared.sourceLabel}: ${prepared.notes.join(" ")}`);
    }
    catch (requestError) { setError(errorText(requestError)); }
    finally { setLoading(false); }
  };

  const connectObsidian = async () => {
    setLoading(true); setError(""); setNotice("");
    try {
      await onActivity(); await configureObsidian(apiKey);
      const status = await testObsidianConnection();
      setObsidian(status); setApiKey(""); setEditingKey(false); setNotice("Clave verificada y guardada localmente. No se volvera a pedir para los proximos resumenes.");
    } catch (requestError) { setError(`No se pudo verificar la clave: ${errorText(requestError)}`); }
    finally { setLoading(false); }
  };


  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.markdown);
      setNotice("Markdown copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar automaticamente. Selecciona el Markdown y copialo manualmente.");
    }
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([summary.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName(title);
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`Archivo ${fileName(title)} preparado para descarga.`);
  };
  const save = async () => {
    if (!summary) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const destination = obsidianUrl.trim() ? (saveMode === "append" ? obsidianFile(obsidianUrl) : newNoteFromUrl(obsidianUrl, title)) : notePath;
      await onActivity();
      if (saveMode === "append") await appendToObsidian(destination, summary.markdown, headingLevel);
      else await saveToObsidian(destination, summary.markdown);
      setNotice(saveMode === "append" ? `Resumen agregado a ${destination}.` : `Nota guardada en ${destination}.`);
    } catch (requestError) { setError(`No se pudo guardar la nota: ${errorText(requestError)}`); }
    finally { setLoading(false); }
  };

  return <section className="summarizer-panel">
    <div className="input-panel">
      <label htmlFor="summary-title">Titulo del resumen</label>
      <input id="summary-title" value={title} onChange={(event) => { setTitle(event.target.value); if (!obsidianUrl.trim()) setNotePath(`Resumenes/${fileName(event.target.value)}`); }} disabled={disabled} />
      <label>Tipo de fuente</label>
      <div className="source-kind" role="group" aria-label="Tipo de fuente">{(Object.keys(sourceLabels) as SourceKind[]).map((kind) => <button key={kind} type="button" className={sourceKind === kind ? "selected" : ""} onClick={() => setSourceKind(kind)}>{sourceLabels[kind]}</button>)}</div>
      <label htmlFor="source-text">Fuente del resumen</label>
      <textarea id="source-text" value={source} onFocus={onActivity} onChange={(event) => setSource(event.target.value)} disabled={disabled} placeholder={sourcePlaceholder(sourceKind)} />
      <p className="field-help">El analisis se ejecuta localmente: links se limpian en este equipo, archivos se leen por ruta local, imagenes usan Ollama vision y videos usan ffmpeg + Ollama vision.</p>
      <LocalAiPanel status={localAi} />
      <div className="input-actions"><button className="secondary" disabled>Selector visual proximamente</button><button className="primary" disabled={disabled || loading || source.trim().length < 3} onClick={generate}>{loading ? "Procesando..." : sourceKind === "text" ? "Generar resumen local ->" : "Analizar y resumir ->"}</button></div>
      {error && <p className="form-error">{error}</p>}{notice && <p className="form-notice">{notice}</p>}
    </div>
    <aside className="summary-preview">
      <p className="eyebrow">Obsidian y vista previa</p>
      {obsidian?.configured && !editingKey && <div className="connection-row"><p className="connection-ok">Clave guardada en este equipo. Conexion local preparada: {obsidian.vaultHint}.</p><button className="secondary compact-button" disabled={disabled || loading} onClick={() => { setEditingKey(true); setError(""); setNotice(""); }}>Cambiar clave de Obsidian</button></div>}
      {keyFormVisible && <div className="obsidian-setup"><p>{obsidian?.configured ? "Pega la nueva clave de API de Obsidian. La app la verificara antes de usarla." : "Abre los ajustes de Local REST API with MCP en Obsidian y pega aqui su API Key."}</p><label htmlFor="obsidian-key">Clave de API local</label><input id="obsidian-key" type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} disabled={disabled || loading} placeholder="Pega la clave de Obsidian" /><div className="key-actions"><button className="secondary" disabled={disabled || loading || apiKey.trim().length < 16} onClick={connectObsidian}>{obsidian?.configured ? "Guardar y verificar clave" : "Conectar y verificar Obsidian"}</button>{obsidian?.configured && <button className="secondary" disabled={loading} onClick={() => { setEditingKey(false); setApiKey(""); setError(""); }}>Cancelar</button>}</div></div>}
      {analysis && <p className="summary-meta">Fuente preparada: {analysis.sourceLabel} - {analysis.usedLocalAi ? "IA local usada" : "Extraccion local"}</p>}{summary ? <><textarea className="summary-editor" value={summary.markdown} onChange={(event) => setSummary(updateSummaryMarkdown(summary, event.target.value))} disabled={disabled || loading} aria-label="Markdown editable del resumen" /><p className="summary-meta">{summary.sourceCharacters} caracteres analizados - {summary.keyPoints.length} ideas clave</p><div className="export-actions"><button className="secondary" disabled={disabled || loading} onClick={copySummary}>Copiar Markdown</button><button className="secondary" disabled={disabled || loading} onClick={downloadSummary}>Descargar .md</button></div><div className="destination-picker"><p className="destination-title">Donde quieres guardar el resumen?</p><div className="save-mode"><label><input type="radio" checked={saveMode === "new"} onChange={() => setSaveMode("new")} disabled={disabled || loading || !obsidian?.configured} /> Crear nota nueva</label><label><input type="radio" checked={saveMode === "append"} onChange={() => setSaveMode("append")} disabled={disabled || loading || !obsidian?.configured} /> Agregar a nota existente</label></div><label htmlFor="obsidian-url">Ruta o URL de Obsidian</label><input id="obsidian-url" value={obsidianUrl} onChange={(event) => setObsidianUrl(event.target.value)} disabled={disabled || loading || !obsidian?.configured} placeholder="Pega Copiar ruta como URL de Obsidian" />{obsidianUrl.trim() && <p className="destination-preview">Destino: <code>{urlDestination || "URL invalida"}</code></p>}<p className="field-help">{saveMode === "append" ? "La nota ya creada se conserva: el resumen se agrega al final." : "Se creara una nota nueva junto a la nota indicada."}</p>{saveMode === "append" && <><label htmlFor="heading-level">Nivel del titulo del resumen</label><select id="heading-level" value={headingLevel} onChange={(event) => setHeadingLevel(Number(event.target.value))} disabled={disabled || loading || !obsidian?.configured}><option value={1}># Titulo principal</option><option value={2}>## Subtitulo</option><option value={3}>### Sub-subtitulo</option><option value={4}>#### Nivel 4</option></select><p className="field-help">Los apartados internos se ajustaran un nivel debajo.</p></>}<p className="destination-or">o escribe la ruta manual</p><label htmlFor="note-path">Ruta Markdown dentro de la boveda</label><input id="note-path" value={notePath} onChange={(event) => { setNotePath(event.target.value); setObsidianUrl(""); }} disabled={disabled || loading || !obsidian?.configured} placeholder="Resumenes/Mi nota.md" /></div><button className="secondary" disabled={disabled || loading || !obsidian?.configured} onClick={save}>{saveMode === "append" ? "Agregar resumen a la nota" : "Guardar nota nueva"}</button></> : <p>Genera primero una vista previa. Despues podras crear una nota nueva o agregar el resumen a una nota ya creada.</p>}
    </aside>
  </section>;
}

