import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { Tool } from "../data/tools";

const POSITION_KEY = "herramientasAppBubblePosition";
const POSITION_CHANNEL = "herramientas-app-bubble-position";
const BUBBLE_SIZE = 55;

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
    if (!Number.isFinite(value?.left) || !Number.isFinite(value?.top)) return null;
    return clampPosition({ left: value.left, top: value.top });
  } catch {
    return null;
  }
}

function clampPosition(position: Position): Position {
  return {
    left: Math.max(8, Math.min(position.left, Math.max(8, window.innerWidth - BUBBLE_SIZE - 8))),
    top: Math.max(8, Math.min(position.top, Math.max(8, window.innerHeight - BUBBLE_SIZE - 8)))
  };
}

export default function ContextBubble({ tools, modeLabel, selectedText, paused, onTogglePause, onOpenTool }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(() => readPosition());
  const dragRef = useRef<{ dx: number; dy: number; source: "toggle" | "handle"; moved: boolean; startX: number; startY: number } | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const suppressToggleClick = useRef(false);

  useEffect(() => {
    const applyPosition = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      const candidate = value as Partial<Position>;
      if (!Number.isFinite(candidate.left) || !Number.isFinite(candidate.top)) return;
      setPosition(clampPosition({ left: candidate.left as number, top: candidate.top as number }));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== POSITION_KEY) return;
      if (!event.newValue) { setPosition(null); return; }
      try { applyPosition(JSON.parse(event.newValue)); } catch { /* Ignore malformed external state. */ }
    };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(POSITION_CHANNEL) : null;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "position") applyPosition(event.data.position);
    };
    channel?.addEventListener("message", onMessage);
    channelRef.current = channel;
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setPosition((current) => current ? clampPosition(current) : current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (!dragRef.current) return;
      const drag = dragRef.current;
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 3) drag.moved = true;
      if (drag.moved) {
        setPosition(clampPosition({ left: event.clientX - drag.dx, top: event.clientY - drag.dy }));
        event.preventDefault();
      }
    };
    const end = () => {
      if (!dragRef.current) return;
      const finished = dragRef.current;
      dragRef.current = null;
      if (finished.source === "toggle" && finished.moved) suppressToggleClick.current = true;
      setPosition((current) => {
        if (current && finished.moved) {
          window.localStorage.setItem(POSITION_KEY, JSON.stringify(current));
          channelRef.current?.postMessage({ type: "position", position: current });
        }
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

  const startDrag = (event: PointerEvent<HTMLButtonElement>, source: "toggle" | "handle") => {
    const rect = event.currentTarget.closest(".context-bubble")?.getBoundingClientRect();
    if (!rect || event.button !== 0) return;
    dragRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top, source, moved: false, startX: event.clientX, startY: event.clientY };
    if (source === "handle") event.preventDefault();
  };

  const style = position ? { left: position.left, top: position.top, right: "auto", bottom: "auto" } : undefined;

  const bubble = <aside className={"context-bubble " + (open ? "is-open" : "")} style={style} aria-label="Burbuja contextual de Herramientas">
    {open && <section className="context-bubble-panel">
      <header className="context-bubble-header">
        <div><strong>Herramientas</strong><span>{modeLabel}</span></div>
        <button type="button" className="bubble-drag" onPointerDown={(event) => startDrag(event, "handle")} title="Mover burbuja">Mover</button>
      </header>
      <p>{paused ? "La captura contextual está pausada." : selectedText}</p>
      <div className="context-bubble-actions">
        <button type="button" onClick={onTogglePause}>{paused ? "Reanudar" : "Pausar"}</button>
        {tools.map((tool) => <button type="button" key={tool.id} onClick={() => onOpenTool(tool)}>{tool.icon} {tool.name}</button>)}
      </div>
      <small>Elige una herramienta para continuar con el contexto confirmado.</small>
    </section>}
    <button type="button" className="context-bubble-toggle" onPointerDown={(event) => startDrag(event, "toggle")} onClick={() => { if (suppressToggleClick.current) { suppressToggleClick.current = false; return; } setOpen((current) => !current); }} aria-expanded={open} title="Abrir burbuja contextual">H<span aria-hidden="true" /></button>
  </aside>;
  return createPortal(bubble, document.body);
}
