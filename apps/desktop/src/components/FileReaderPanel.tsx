import { ChangeEvent, useEffect, useRef, useState } from "react";
import { analyzeSource } from "../api/summarizer";

type VoiceLanguage = "auto" | "es" | "en";

function detectLanguage(text: string): "es" | "en" {
  const spanish = (text.match(/\b(el|la|los|las|que|para|con|una|del|este|esta|por|como|también|cómo|qué)\b/gi) ?? []).length;
  const english = (text.match(/\b(the|and|for|with|that|this|from|are|was|were|what|how)\b/gi) ?? []).length;
  return spanish >= english ? "es" : "en";
}

function chunks(text: string, size = 2600) {
  const result: string[] = [];
  for (let start = 0; start < text.length; start += size) result.push(text.slice(start, start + size));
  return result;
}

export default function FileReaderPanel({ disabled = false }: { disabled?: boolean }) {
  const [sourceKind, setSourceKind] = useState<"file" | "link">("file");
  const [path, setPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [language, setLanguage] = useState<VoiceLanguage>("auto");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTauri = "__TAURI_INTERNALS__" in window;

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const chooseFile = async () => {
    if (disabled || loading) return;
    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      const selected = await invoke<string | null>("pick_text_file");
      if (selected) setPath(selected);
      return;
    }
    fileInputRef.current?.click();
  };

  const onBrowserFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) { setSelectedFile(selected); setPath(selected.name); }
  };

  const loadText = async () => {
    if (!path.trim()) return;
    setLoading(true);
    setError("");
    window.speechSynthesis.cancel();
    try {
      if (sourceKind === "file" && selectedFile) {
        if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) throw new Error("Para leer PDFs desde el navegador, inicia el servicio local o usa la aplicación de escritorio.");
        setText((await selectedFile.text()).replace(/\s+/g, " ").trim());
        setSourceLabel(selectedFile.name);
      } else {
        const source = await analyzeSource(sourceKind, path.trim());
        setText(source.text);
        setSourceLabel(source.sourceLabel);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo leer el contenido.");
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const lang = language === "auto" ? detectLanguage(text) : language;
    const voices = window.speechSynthesis.getVoices().filter((item) => item.lang.toLowerCase().startsWith(lang));
    const femaleVoice = /female|woman|zira|samantha|karen|victoria|ava|jenny|aria|hazel|susan|sabina|paulina|monica|helena|google español/i;
    const voice = voices.find((item) => femaleVoice.test(item.name)) ?? voices[0];
    const parts = chunks(text);
    let index = 0;
    const readNext = () => {
      if (index >= parts.length) { setSpeaking(false); return; }
      const utterance = new SpeechSynthesisUtterance(parts[index++]);
      utterance.lang = lang === "es" ? "es-MX" : "en-US";
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      utterance.onend = readNext;
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    setSpeaking(true);
    readNext();
  };

  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };
  const pause = () => { if (window.speechSynthesis.paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause(); };

  return <div className="workspace-grid">
    <section className="input-panel">
      <label htmlFor="file-reader-kind">Tipo de fuente</label>
      <select id="file-reader-kind" value={sourceKind} onChange={(event) => { setSourceKind(event.target.value as "file" | "link"); setSelectedFile(null); setPath(""); }} disabled={disabled || loading}><option value="file">Archivo local</option><option value="link">Página web o PDF remoto</option></select>
      <label htmlFor="file-reader-path">{sourceKind === "file" ? "Archivo" : "URL"}</label>
      <div className="input-actions"><input id="file-reader-path" value={path} onChange={(event) => { setSelectedFile(null); setPath(event.target.value); }} placeholder={sourceKind === "file" ? "C:\\Documentos\\libro.pdf" : "https://ejemplo.com/libro"} disabled={disabled || loading} /><button type="button" className="secondary" onClick={chooseFile} disabled={sourceKind !== "file" || disabled || loading}>Escoger archivo</button><input ref={fileInputRef} type="file" hidden accept=".pdf,.txt,.md,.markdown,.csv,.json,.jsonl,.log,.rs,.ts,.tsx,.js,.jsx,.py,.html,.css,.toml,.yaml,.yml,.xml,.srt,.vtt" onChange={onBrowserFile} /></div>
      <div className="input-actions"><button className="primary" onClick={loadText} disabled={disabled || loading || !path.trim()}>{loading ? "Cargando..." : "Cargar texto"}</button></div>
      <p className="field-help">El contenido se conserva literalmente para lectura; no se resume ni se explica.</p>
      {error && <p className="form-error">{error}</p>}
    </section>
    <aside className="status-panel"><span className="status-dot" /> <b>{speaking ? "Leyendo en voz alta" : text ? "Texto cargado" : "Listo para leer"}</b><p>La voz se genera en este equipo con las voces instaladas del sistema.</p>{sourceLabel && <small>Fuente: {sourceLabel}</small>}</aside>
    {text && <section className="input-panel"><label htmlFor="reader-language">Idioma de lectura</label><select id="reader-language" value={language} onChange={(event) => setLanguage(event.target.value as VoiceLanguage)} disabled={speaking}><option value="auto">Detectar automáticamente</option><option value="es">Español</option><option value="en">English</option></select><div className="input-actions"><button className="primary" onClick={speak} disabled={disabled || loading}>{speaking ? "Reiniciar lectura" : "Leer en voz alta"}</button><button className="secondary" onClick={pause} disabled={!speaking}>Pausar / reanudar</button><button className="secondary" onClick={stop} disabled={!speaking}>Detener</button></div><label htmlFor="file-reader-text">Texto leído</label><textarea id="file-reader-text" className="summary-editor" value={text} readOnly /></section>}
  </div>;
}
