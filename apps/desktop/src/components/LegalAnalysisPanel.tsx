import { useEffect, useState } from "react";
import { analyzeLegalSource, type LegalAnalysis } from "../api/legalAnalysis";
import type { SourceKind } from "../api/summarizer";

type Props = { disabled: boolean; onActivity: () => Promise<void> | void; initialSource?: string };
type LegalSourceKind = Extract<SourceKind, "text" | "link" | "file">;

const labels: Record<LegalSourceKind, string> = { text: "Texto", link: "Enlace", file: "Archivo" };

function placeholder(kind: LegalSourceKind) {
  if (kind === "link") return "Pega un enlace público a términos, privacidad u otro acuerdo.";
  if (kind === "file") return "Pega la ruta de un archivo local de texto, Markdown, HTML, SRT o VTT.";
  return "Pega el texto del acuerdo, política de privacidad o aviso legal que deseas revisar.";
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar el análisis legal.";
}

export default function LegalAnalysisPanel({ disabled, onActivity, initialSource = "" }: Props) {
  const [sourceKind, setSourceKind] = useState<LegalSourceKind>("text");
  const [source, setSource] = useState("");
  const [jurisdiction, setJurisdiction] = useState("México y referencias internacionales");
  const [result, setResult] = useState<LegalAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (initialSource.trim()) setSource(initialSource);
  }, [initialSource]);

  const analyze = async () => {
    setBusy(true); setError("");
    try {
      await onActivity();
      setResult(await analyzeLegalSource(sourceKind, source, jurisdiction));
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setBusy(false);
    }
  };

  return <section className="legal-analysis-panel">
    <div className="legal-input-panel">
      <p className="eyebrow">Información general, no asesoría jurídica</p>
      <h2>Revisa antes de aceptar</h2>
      <p>Identifica tratamiento de datos, identidad digital, compromisos, alertas y preguntas. Una conclusión sobre legalidad o una decisión importante requiere revisar el texto completo y, cuando corresponda, una persona profesional del derecho.</p>
      <label>Tipo de fuente</label>
      <div className="source-kind" role="group" aria-label="Tipo de documento legal">{(Object.keys(labels) as LegalSourceKind[]).map((kind) => <button type="button" key={kind} className={sourceKind === kind ? "selected" : ""} onClick={() => setSourceKind(kind)}>{labels[kind]}</button>)}</div>
      <label htmlFor="legal-source">Documento o fuente</label>
      <textarea id="legal-source" value={source} onChange={(event) => setSource(event.target.value)} onFocus={onActivity} placeholder={placeholder(sourceKind)} disabled={disabled || busy} />
      <label htmlFor="legal-jurisdiction">Jurisdicción de referencia</label>
      <input id="legal-jurisdiction" value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} disabled={disabled || busy} placeholder="Por ejemplo: México" />
      <p className="field-help">El texto se procesa solo en este equipo. No se inicia sesión ni se buscan contratos privados; para fuentes privadas, pega el texto que tengas derecho a revisar.</p>
      <button className="primary" disabled={disabled || busy || source.trim().length < 40} onClick={analyze}>{busy ? "Analizando..." : "Analizar acuerdo"}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <aside className="legal-result-panel">
      {result ? <>
        <p className="eyebrow">Resultado revisable</p>
        <p className="legal-limitation">{result.limitation}</p>
        <textarea className="summary-editor" value={result.markdown} onChange={(event) => setResult({ ...result, markdown: event.target.value })} aria-label="Análisis legal editable" disabled={disabled || busy} />
        <p className="summary-meta">{result.sourceCharacters} caracteres analizados · {result.usedLocalAi ? "IA local usada" : "Reglas locales usadas"}</p>
        <div className="legal-signals"><b>Señales detectadas</b><ul>{result.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></div>
      </> : <p>Agrega una fuente para recibir un análisis claro y editable. El resultado no sustituye la lectura del contrato ni asesoría legal.</p>}
    </aside>
  </section>;
}
