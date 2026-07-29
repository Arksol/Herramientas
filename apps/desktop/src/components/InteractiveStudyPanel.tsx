import { useMemo, useState } from "react";
import { appendInteractiveStudyBlock, hasInteractiveStudyBlock, questionsFromSummary, type StudyMetadata } from "../api/obsidianStudy";
import type { Summary } from "../api/summarizer";

type Props = { summary: Summary; onApply: (markdown: string) => void; disabled: boolean };

const emptyMetadata: StudyMetadata = { course: "", unit: "", tags: "", relatedNotes: "" };

export default function InteractiveStudyPanel({ summary, onApply, disabled }: Props) {
  const [metadata, setMetadata] = useState<StudyMetadata>(emptyMetadata);
  const [revealed, setRevealed] = useState<number | null>(null);
  const questions = useMemo(() => questionsFromSummary(summary), [summary]);
  const alreadyAdded = hasInteractiveStudyBlock(summary.markdown);
  const setField = (field: keyof StudyMetadata, value: string) => setMetadata((current) => ({ ...current, [field]: value }));

  return <section className="interactive-study-panel" aria-label="Repaso interactivo para Obsidian">
    <div className="interactive-study-heading"><div><span>Repaso activo</span><h3>Estudiar esta nota</h3></div><b>{alreadyAdded ? "Bloque listo" : `${questions.length} preguntas`}</b></div>
    <div className="study-question">
      {questions.length ? <><p>{questions[0].prompt}</p><button type="button" className="secondary compact-button" onClick={() => setRevealed(revealed === 0 ? null : 0)}>{revealed === 0 ? "Ocultar respuesta" : "Mostrar respuesta"}</button>{revealed === 0 && <p className="study-answer">{questions[0].answer}</p>}</> : <p>Genera un resumen con ideas clave para crear preguntas de recuperación.</p>}
    </div>
    <div className="study-metadata">
      <label>Curso<input value={metadata.course} onChange={(event) => setField("course", event.target.value)} placeholder="Ej. Fundamentos de datos" disabled={disabled || alreadyAdded} /></label>
      <label>Unidad<input value={metadata.unit} onChange={(event) => setField("unit", event.target.value)} placeholder="Ej. Unidad 2" disabled={disabled || alreadyAdded} /></label>
      <label>Etiquetas<input value={metadata.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="datos, estadística" disabled={disabled || alreadyAdded} /></label>
      <label>Notas relacionadas<input value={metadata.relatedNotes} onChange={(event) => setField("relatedNotes", event.target.value)} placeholder="Curso/Clase anterior, Proyecto" disabled={disabled || alreadyAdded} /></label>
    </div>
    <button type="button" className="secondary" disabled={disabled || alreadyAdded} onClick={() => onApply(appendInteractiveStudyBlock(summary.markdown, summary, metadata))}>{alreadyAdded ? "Bloque de repaso añadido" : "Añadir bloque interactivo"}</button>
  </section>;
}