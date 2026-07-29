import type { Summary } from "./summarizer";

export type StudyMetadata = {
  course: string;
  unit: string;
  tags: string;
  relatedNotes: string;
};

export type StudyQuestion = { prompt: string; answer: string };

const marker = "<!-- herramientas:interactive-study -->";

function cleanLine(value: string, max = 160) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function tagsFrom(value: string) {
  return value.split(",").map((item) => cleanLine(item, 48).replace(/^#/, "").replace(/[^\wáéíóúüñ-]/gi, "-").replace(/-+/g, "-")).filter(Boolean).slice(0, 8).map((tag) => `#${tag}`);
}

function noteLinksFrom(value: string) {
  return value.split(",").map((item) => cleanLine(item, 120).replace(/[\[\]]/g, "")).filter(Boolean).slice(0, 8).map((note) => `[[${note}]]`);
}

export function questionsFromSummary(summary: Summary): StudyQuestion[] {
  const points = summary.keyPoints.map((point) => cleanLine(point, 260)).filter((point) => point.length >= 20).slice(0, 6);
  return points.map((point, index) => ({ prompt: `Pregunta ${index + 1}: ¿Cómo explicarías esta idea con tus propias palabras?`, answer: point }));
}

export function hasInteractiveStudyBlock(markdown: string) {
  return String(markdown ?? "").includes(marker);
}

export function appendInteractiveStudyBlock(markdown: string, summary: Summary, metadata: StudyMetadata) {
  if (hasInteractiveStudyBlock(markdown)) return markdown;
  const questions = questionsFromSummary(summary);
  const course = cleanLine(metadata.course);
  const unit = cleanLine(metadata.unit);
  const tags = tagsFrom(metadata.tags);
  const related = noteLinksFrom(metadata.relatedNotes);
  const context = [course && `- Curso: ${course}`, unit && `- Unidad: ${unit}`, tags.length && `- Etiquetas: ${tags.join(" ")}`, related.length && `- Relacionar con: ${related.join(", ")}`].filter(Boolean);
  const reviewTasks = summary.keyPoints.map((point) => cleanLine(point, 180)).filter((point) => point.length >= 20).slice(0, 5).map((point) => `- [ ] Explicar sin ver apuntes: ${point}`).join("\n");
  const callouts = questions.map((question) => `> [!question]- ${question.prompt}\n> ${question.answer}`).join("\n\n");
  return `${String(markdown ?? "").trimEnd()}\n\n${marker}\n\n## Contexto de estudio\n\n${context.length ? context.join("\n") : "- [ ] Completar curso, unidad o enlaces relacionados si aportan contexto."}\n\n## Repaso activo\n\n${reviewTasks || "- [ ] Redactar una pregunta de repaso antes de guardar."}\n\n## Autoevaluación\n\n${callouts || "> [!question]- ¿Cuál es la idea principal de esta nota?\n> Completa la respuesta después de revisar el resumen."}\n\n## Próxima sesión\n\n- [ ] Programar un bloque breve para recuperar estas ideas sin consultar la nota.\n`;
}