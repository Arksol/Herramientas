import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Tool } from "../data/tools";

const POSITION_KEY = "herramientasAppBubblePosition";

type Props = {
  tools: Tool[];
  modeLabel: string;
  selectedText: string;
  paused: boolean;
  onTogglePause: () => void;
  onOpenTool: (tool: Tool) => void;
};

type Position = { left: number; top: number };

function readPosition(): Position | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(POSITION_KEY) ?? "null");
    return Number.isFinite(value?.left) && Number.isFinite(value?.top) ? value : null;
  } catch {
    return null;
  }
}

function clampPosition(position: Position): Position {
  return {
    left: Math.max(8, Math.min(position.left, Math.max(8, window.innerWidth - 72))),
    top: Math.max(8, Math.min(position.top, Math.max(8, window.innerHeight - 72)))
  };
}

export default function ContextBubble({ tools, modeLabel, selectedText, paused, onTogglePause, onOpenTool }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(() => readPosition());
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const onResize = () => setPosition((current) => current ? clampPosition(current) : current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (!dragRef.current) return;
      setPosition(clampPosition({ left: event.clientX - dragRef.current.dx, top: event.clientY - dragRef.current.dy }));
    };
    const end = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setPosition((current) => {
        if (current) window.localStorage.setItem(POSITION_KEY, JSON.stringify(current));
        return current;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.closest(".context-bubble")?.getBoundingClientRect();
    if (!rect || event.button !== 0) return;
    dragRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    event.preventDefault();
  };

  const style = position ? { left: position.left, top: position.top, right: "auto", bottom: "auto" } : undefined;

  return <aside className={`context-bubble ${open ? "is-open" : ""}`} style={style} aria-label="Burbuja contextual de Herramientas">
    {open && <section className="context-bubble-panel">
      <header className="context-bubble-header">
        <div><strong>Herramientas</strong><span>{modeLabel}</span></div>
        <button type="button" className="bubble-drag" onPointerDown={startDrag} title="Mover burbuja">Mover</button>
      </header>
      <p>{paused ? "La captura contextual está pausada." : selectedText}</p>
      <div className="context-bubble-actions">
        <button type="button" onClick={onTogglePause}>{paused ? "Reanudar" : "Pausar"}</button>
        {tools.map((tool) => <button type="button" key={tool.id} onClick={() => onOpenTool(tool)}>{tool.icon} {tool.name}</button>)}
      </div>
      <small>Elige una herramienta para continuar con el contexto confirmado.</small>
    </section>}
    <button type="button" className="context-bubble-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open} title="Abrir burbuja contextual">H<span aria-hidden="true" /></button>
  </aside>;
}
