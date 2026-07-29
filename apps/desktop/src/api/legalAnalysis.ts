import { analyzeSource, type SourceKind } from "./summarizer";

export type LegalAnalysis = {
  markdown: string;
  signals: string[];
  sourceCharacters: number;
  usedLocalAi: boolean;
  limitation: string;
};

import { apiUrl, serviceError } from "./base";
const isTauri = () => "__TAURI_INTERNALS__" in window;

export async function analyzeLegalSource(kind: Extract<SourceKind, "text" | "link" | "file">, source: string, jurisdiction: string): Promise<LegalAnalysis> {
  const prepared = await analyzeSource(kind, source);
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<LegalAnalysis>("analyze_legal_text", { text: prepared.text, sourceLabel: prepared.sourceLabel, jurisdiction });
  }
  const response = await fetch(`${apiUrl}/api/legal/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: prepared.text, sourceLabel: prepared.sourceLabel, jurisdiction, useLocalAi: true })
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo analizar el documento legal.");
  return body as LegalAnalysis;
}
