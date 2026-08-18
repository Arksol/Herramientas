import { FormEvent, useEffect, useMemo, useState } from "react";
import { sessionApi, type Session } from "./api/session";
import SummarizerPanel from "./components/SummarizerPanel";
import ClassDownloadPanel from "./components/ClassDownloadPanel";
import LegalAnalysisPanel from "./components/LegalAnalysisPanel";
import AgentSettingsPanel from "./components/AgentSettingsPanel";
import ToolContractPanel from "./components/ToolContractPanel";
import SpecialistAgentTaskPanel from "./components/SpecialistAgentTaskPanel";
import SpecializedProfessorsPanel from "./components/SpecializedProfessorsPanel";
import ContextBubble from "./components/ContextBubble";
import { isLocalWebApp } from "./api/base";
import { readPersonalAgentSettings } from "./api/agentSettings";
import { getPendingContext, type ContextPayload } from "./api/context";
import { tools, type Tool } from "./data/tools";

type Mode = "integrated" | "contextual";
type DraftTool = { name: string; purpose: string; inputs: string; outputs: string };
const signedOutSession: Session = { authenticated: false, access: "none", canPersist: false, canCreateTools: false, state: "signed_out" };
const guestSession: Session = { authenticated: false, access: "guest", canPersist: false, canCreateTools: false, state: "active" };
const emptyDraft: DraftTool = { name: "", purpose: "", inputs: "", outputs: "" };
const draftKey = "herramientas.admin.custom-tools.v1";

function loadDrafts(): DraftTool[] { try { const value = JSON.parse(localStorage.getItem(draftKey) ?? "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }

function App() {
  const [mode, setMode] = useState<Mode>("integrated");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [contextPaused, setContextPaused] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTool>(emptyDraft);
  const [drafts, setDrafts] = useState<DraftTool[]>([]);
  const [session, setSession] = useState<Session>(signedOutSession);
  const [accessChoice, setAccessChoice] = useState<"guest" | "administrator" | null>(null);
  const [choiceBusy, setChoiceBusy] = useState(false);
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const [contextPayload, setContextPayload] = useState<ContextPayload | null>(null);
  const route = useMemo(() => new URLSearchParams(window.location.search), []);
  const routedToolId = route.get("tool");
  const routedContextId = route.get("context");
  const isAdministrator = session.access === "administrator" && session.authenticated;
  const modeLabel = mode === "integrated" ? "Modo integrado" : "Modo contextual";
  const selectedText = mode === "contextual" ? "Elige contenido desde una página autorizada para iniciar la tarea." : "Todo ocurre dentro de Herramientas, en esta misma aplicación.";

  const beginGuest = async () => {
    try { const value = await sessionApi.guest(); setSession(value); setServiceOnline(true); }
    catch { setSession(guestSession); setServiceOnline(false); }
  };
  useEffect(() => {
    sessionApi.get().then((value) => { setSession({ ...signedOutSession, configured: value.configured }); setServiceOnline(true); }).catch(() => setServiceOnline(false));
  }, []);
  useEffect(() => { if (isAdministrator) setDrafts(loadDrafts()); else setDrafts([]); }, [isAdministrator]);
  useEffect(() => { if (!accessChoice) return; const tool = tools.find((item) => item.id === routedToolId); if (tool) setActiveTool(tool); }, [accessChoice, routedToolId]);
  useEffect(() => { if (!routedContextId || session.state !== "active") return; getPendingContext(routedContextId).then(setContextPayload).catch(() => undefined); }, [routedContextId, session.state]);

  const submitAdmin = async (event: FormEvent) => {
    event.preventDefault(); setLoginBusy(true); setLoginError("");
    try {
      const value = session.configured === false ? await sessionApi.configure(accessCode) : await sessionApi.login(accessCode);
      setSession(value); setServiceOnline(true); setAccessChoice("administrator"); setAccessCode(""); setAccessOpen(false);
    } catch (error) { setLoginError(error instanceof Error ? error.message : "No se pudo validar el código de administrador."); }
    finally { setLoginBusy(false); }
  };
  const chooseGuest = async () => {
    setChoiceBusy(true);
    try { await beginGuest(); setAccessChoice("guest"); } finally { setChoiceBusy(false); }
  };
  const chooseAdministrator = async () => {
    try { await sessionApi.logout(); } catch { /* No local session exists in the public interface. */ }
    setSession((current) => ({ ...signedOutSession, configured: current.configured }));
    setLoginError(""); setAccessCode(""); setAccessChoice("administrator"); setAccessOpen(true);
  };
  const returnToChoice = async () => { try { await sessionApi.logout(); } finally { setSession((current) => ({ ...signedOutSession, configured: current.configured })); setAccessChoice(null); setActiveTool(null); setAgentSettingsOpen(false); } };
  const saveDraft = (event: FormEvent) => { event.preventDefault(); if (!isAdministrator) return; const next = [...drafts, draft]; localStorage.setItem(draftKey, JSON.stringify(next)); setDrafts(next); setDraft(emptyDraft); setDraftOpen(false); };

  if (activeTool) return <main className="app-shell"><Workspace tool={activeTool} mode={mode} session={session} onSession={setSession} onBack={() => setActiveTool(null)} initialContext={contextPayload} modeLabel={modeLabel} selectedText={selectedText} contextPaused={contextPaused} onToggleContextPause={() => setContextPaused((current) => !current)} onOpenTool={setActiveTool} /></main>;

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar"><button className="brand" onClick={() => setActiveTool(null)} aria-label="Ir al inicio">H</button><nav aria-label="Navegación principal"><a className="active" href="#inicio">Inicio</a><a href="#herramientas">Herramientas</a></nav><div className="topbar-actions"><span className={`local-badge ${serviceOnline === false ? "offline" : ""}`}>{serviceOnline === false ? (isLocalWebApp ? "Servicio local desconectado" : "Modo web") : isAdministrator ? "Administrador local" : "Invitado temporal"}</span>{serviceOnline === false && !isLocalWebApp && <a className="text-button" href="http://localhost:1420/">Abrir versión local</a>}{isAdministrator ? <><button className="text-button" onClick={() => setAgentSettingsOpen(true)}>Asistente</button><button className="text-button" onClick={returnToChoice}>Cambiar usuario</button></> : <button className="text-button" onClick={chooseAdministrator}>Cambiar a administrador</button>}</div></header>
    <section id="inicio" className="hero"><p className="eyebrow">Aplicación local-first</p><h1>Herramientas</h1><p className="lede">Como invitado puedes usar las herramientas durante una sesión temporal sin guardar datos. El administrador conserva solo lo que decida guardar en este equipo.</p><div className="mode-switch" role="group" aria-label="Modo de operación"><button className={mode === "integrated" ? "selected" : ""} onClick={() => setMode("integrated")}>Dentro de Herramientas</button><button className={mode === "contextual" ? "selected" : ""} onClick={() => setMode("contextual")}>Burbuja contextual</button></div><p className="mode-note"><b>{modeLabel}.</b> {selectedText}</p></section>
    <section id="herramientas" className="catalog" aria-label="Catálogo de herramientas">{tools.map((tool) => <button className="tool-card" key={tool.id} onClick={() => setActiveTool(tool)}><span className="tool-number">{tool.number}</span><span className="tool-icon">{tool.icon}</span><h2>{tool.name}</h2><p>{mode === "contextual" ? tool.contextual : tool.description}</p><span className="agent-chip">{tool.agent.name}</span><span className="card-action">Abrir espacio de trabajo <b>-&gt;</b></span></button>)}{isAdministrator && <button className="tool-card add-card" onClick={() => setDraftOpen(true)}><span className="plus">+</span><h2>Crear nueva herramienta</h2><p>Registra nombre, propósito, entradas y salidas. El borrador queda local hasta su revisión.</p>{drafts.length > 0 && <span className="draft-chip">{drafts.length} borrador(es) local(es)</span>}</button>}</section>
    <aside className="mode-panel"><span>{isAdministrator ? "Administrador" : "Invitado"}</span><strong>{isAdministrator ? "Tu configuración y borradores quedan en este equipo." : "La sesión vence y no guarda tu información."}</strong></aside>
    <ContextBubble tools={tools} modeLabel={modeLabel} selectedText={selectedText} paused={contextPaused} onTogglePause={() => setContextPaused((current) => !current)} onOpenTool={setActiveTool} />
    {draftOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="draft-title"><form className="access-modal draft-modal" onSubmit={saveDraft}><button type="button" className="modal-close" onClick={() => setDraftOpen(false)} aria-label="Cerrar">x</button><p className="eyebrow">Administrador local</p><h2 id="draft-title">Nueva herramienta</h2><label>Nombre<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><label>Propósito<textarea value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} required /></label><label>Entradas esperadas<input value={draft.inputs} onChange={(event) => setDraft({ ...draft, inputs: event.target.value })} /></label><label>Resultado esperado<input value={draft.outputs} onChange={(event) => setDraft({ ...draft, outputs: event.target.value })} /></label><button className="primary" disabled={!draft.name.trim() || !draft.purpose.trim()}>Guardar borrador</button></form></section>}
    {agentSettingsOpen && isAdministrator && <AgentSettingsPanel onClose={() => setAgentSettingsOpen(false)} />}
    {accessChoice === null && <section className="modal-backdrop access-choice-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-choice-title"><div className="access-modal access-choice-modal"><p className="eyebrow">Antes de comenzar</p><h2 id="access-choice-title">¿Qué tipo de usuario eres?</h2><p>Elige cómo quieres usar Herramientas en esta sesión.</p><div className="access-choice-grid"><button type="button" className="access-choice-card" onClick={chooseGuest} disabled={choiceBusy}><strong>Usuario</strong><span>Usa las herramientas durante una sesión temporal. No se guardan fuentes, planes ni preferencias.</span><b>{choiceBusy ? "Preparando..." : "Continuar como usuario"}</b></button><button type="button" className="access-choice-card administrator" onClick={chooseAdministrator} disabled={choiceBusy}><strong>Administrador</strong><span>Guarda configuración y borradores locales, crea herramientas y usa Obsidian con confirmación.</span><b>Ingresar con contraseña</b></button></div><small>El modo Administrador requiere la contraseña local antes de mostrar las herramientas.</small></div></section>}
    {accessOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-title"><form className="access-modal" onSubmit={submitAdmin}><button type="button" className="modal-close" onClick={returnToChoice} aria-label="Volver a elegir tipo de usuario">x</button><p className="eyebrow">Acceso de administrador</p><h2 id="access-title">Configuración y memoria local</h2><p>{session.configured === false ? "Crea el código local de administrador. Se guarda solo como hash protegido." : "Introduce el código de administrador ya configurado."}</p><label htmlFor="access-code">Código de administrador</label><input id="access-code" type="password" minLength={8} autoFocus value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" /><p className="form-error" aria-live="polite">{loginError}</p><button className="primary" disabled={loginBusy || (session.configured === false && accessCode.length < 8)}>{loginBusy ? "Validando..." : session.configured === false ? "Configurar administrador" : "Entrar como administrador"}</button><small>El administrador no caduca por tiempo; puedes salir para volver al modo invitado.</small></form></section>}
  </main>;
}

function Workspace({ tool, mode, session, onSession, onBack, initialContext, modeLabel, selectedText, contextPaused, onToggleContextPause, onOpenTool }: { tool: Tool; mode: Mode; session: Session; onSession: (session: Session) => void; onBack: () => void; initialContext: ContextPayload | null; modeLabel: string; selectedText: string; contextPaused: boolean; onToggleContextPause: () => void; onOpenTool: (tool: Tool) => void }) {
  const disabled = session.state === "paused" || session.state === "inactive";
  const recordActivity = async () => { if (session.state !== "active") return; try { onSession(await sessionApi.activity()); } catch { /* La UI conserva el modo invitado cuando no existe servicio local. */ } };
  return <section className="workspace"><header className="workspace-header"><button onClick={onBack}>&lt;- Herramientas</button><span>{mode === "integrated" ? "Modo integrado" : "Modo contextual"}</span><span>{session.access === "administrator" ? "Administrador" : "Invitado temporal"}</span></header><div className="workspace-intro"><span className="workspace-icon">{tool.icon}</span><div><p className="eyebrow">{tool.number} - espacio de trabajo</p><h1>{tool.name}</h1><p>{mode === "integrated" ? tool.description : tool.contextual}</p></div></div><ToolContractPanel tool={tool} /><AgentPanel tool={tool} />{tool.id === "multi-profesor" ? <SpecializedProfessorsPanel tool={tool} disabled={disabled} onActivity={recordActivity} /> : <SpecialistAgentTaskPanel tool={tool} disabled={disabled} canPersist={session.canPersist === true} onActivity={recordActivity} />}{tool.id === "resumidor" ? <SummarizerPanel disabled={disabled} onActivity={recordActivity} initialSource={initialContext?.requestedTool === "resumidor" ? initialContext.selectedText : ""} /> : tool.id === "clases" ? <ClassDownloadPanel disabled={disabled} onActivity={recordActivity} /> : tool.id === "legal" ? <LegalAnalysisPanel disabled={disabled} onActivity={recordActivity} initialSource={initialContext?.requestedTool === "legal" ? initialContext.selectedText : ""} /> : null}{session.access === "guest" && <div className="notice"><b>Modo invitado.</b> Puedes usar esta herramienta durante la sesión temporal. Los planes, fuentes y resultados no se guardan.</div>}<ContextBubble tools={tools} modeLabel={modeLabel} selectedText={selectedText} paused={contextPaused} onTogglePause={onToggleContextPause} onOpenTool={onOpenTool} /></section>;
}
function AgentPanel({ tool }: { tool: Tool }) { const assistant = readPersonalAgentSettings(); return <aside className="agent-panel" aria-label="Agente asignado"><span>Agente especializado</span><strong>{tool.agent.name}</strong><p>{tool.agent.role}</p><p className="agent-instruction">{tool.agent.instruction}</p><div className="agent-specialties">{tool.agent.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}</div><dl><div><dt>Modelo</dt><dd>{tool.agent.modelProfile}</dd></div><div><dt>Memoria</dt><dd>{tool.agent.memoryScope}</dd></div><div><dt>Coordinación</dt><dd>{assistant.provider === "houston" ? "Houston manual" : "Agente local"}</dd></div></dl></aside>; }
export default App;
