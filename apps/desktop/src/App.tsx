import { FormEvent, useEffect, useMemo, useState } from "react";
import { sessionApi, type Session } from "./api/session";
import SummarizerPanel from "./components/SummarizerPanel";
import ClassDownloadPanel from "./components/ClassDownloadPanel";
import LegalAnalysisPanel from "./components/LegalAnalysisPanel";
import AgentSettingsPanel from "./components/AgentSettingsPanel";
import ToolContractPanel from "./components/ToolContractPanel";
import SpecialistAgentTaskPanel from "./components/SpecialistAgentTaskPanel";
import ContextBubble from "./components/ContextBubble";
import { isLocalWebApp } from "./api/base";
import { readPersonalAgentSettings } from "./api/agentSettings";
import { getPendingContext, type ContextPayload } from "./api/context";
import { tools, type Tool } from "./data/tools";

type Mode = "integrated" | "contextual";
type DraftTool = { name: string; purpose: string; inputs: string; outputs: string; protected: boolean };

const signedOut: Session = { authenticated: false, state: "signed_out" };
const emptyDraft: DraftTool = { name: "", purpose: "", inputs: "", outputs: "", protected: false };

function App() {
  const [mode, setMode] = useState<Mode>("integrated");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [contextPaused, setContextPaused] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTool>(emptyDraft);
  const [draftSaved, setDraftSaved] = useState<DraftTool | null>(null);
  const [session, setSession] = useState<Session>(signedOut);
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [pendingTool, setPendingTool] = useState<Tool | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const [contextPayload, setContextPayload] = useState<ContextPayload | null>(null);
  const route = useMemo(() => new URLSearchParams(window.location.search), []);
  const routedToolId = route.get("tool");
  const routedContextId = route.get("context");

  const modeLabel = mode === "integrated" ? "Modo integrado" : "Modo contextual";
  const selectedText = useMemo(() => mode === "contextual" ? "Elige contenido desde una página autorizada para iniciar la tarea." : "Todo ocurre dentro de Herramientas, en esta misma aplicación.", [mode]);

  useEffect(() => {
    sessionApi.get().then((value) => { setSession(value); setServiceOnline(true); }).catch(() => setServiceOnline(false));
  }, []);  useEffect(() => {
    const routedTool = tools.find((tool) => tool.id === routedToolId);
    if (!routedTool) return;
    if (routedTool.protected && !session.authenticated) { setPendingTool(routedTool); return; }
    setActiveTool(routedTool);
  }, [routedToolId, session.authenticated]);

  useEffect(() => {
    if (!routedContextId || !session.authenticated) return;
    getPendingContext(routedContextId).then(setContextPayload).catch((reason) => setLoginError(reason instanceof Error ? reason.message : "No se pudo recuperar el contexto local."));
  }, [routedContextId, session.authenticated]);

  const openTool = (tool: Tool) => {
    if (tool.protected && !session.authenticated) {
      setLoginError("");
      setPendingTool(tool);
      return;
    }
    setActiveTool(tool);
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const value = session.configured === false ? await sessionApi.configure(accessCode) : await sessionApi.login(accessCode);
      setSession(value);
      setServiceOnline(true);
      setAccessCode("");
      if (pendingTool) setActiveTool(pendingTool);
      setPendingTool(null);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo validar el código.");
    } finally { setLoginBusy(false); }
  };

  const logout = async () => {
    try { await sessionApi.logout(); } finally { setSession(signedOut); setActiveTool(null); }
  };

  const saveDraft = (event: FormEvent) => {
    event.preventDefault();
    setDraftSaved(draft);
    setDraft(emptyDraft);
    setDraftOpen(false);
  };

  if (activeTool) {
    return <main className="app-shell"><Workspace tool={activeTool} mode={mode} session={session} onSession={setSession} onBack={() => setActiveTool(null)} onRequestAccess={() => setPendingTool(activeTool)} initialContext={contextPayload} /></main>;
  }

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <button className="brand" onClick={() => setActiveTool(null)} aria-label="Ir al inicio">H</button>
      <nav aria-label="Navegación principal"><a className="active" href="#inicio">Inicio</a><a href="#herramientas">Herramientas</a><a href="#acerca">Acerca de</a></nav>
      <div className="topbar-actions"><span className={`local-badge ${serviceOnline === false ? "offline" : ""}`}>* {serviceOnline === false ? (isLocalWebApp ? "Servicio local desconectado" : "Modo web") : "Local"}</span>{serviceOnline === false && !isLocalWebApp && <a className="text-button" href="http://localhost:1420/">Abrir versión local</a>}<button className="text-button" onClick={() => setAgentSettingsOpen(true)}>Asistente</button>{session.authenticated && <button className="text-button" onClick={logout}>Cerrar sesión</button>}</div>
    </header>
    <section id="inicio" className="hero">
      <p className="eyebrow">Aplicación de escritorio - local-first</p><h1>Herramientas</h1>
      <p className="lede">Modo administrador para tu flujo privado. El producto público queda preparado, aislado de tus datos y pendiente de publicación.</p>
      <div className="mode-switch" role="group" aria-label="Modo de operación"><button className={mode === "integrated" ? "selected" : ""} onClick={() => setMode("integrated")}>Dentro de Herramientas</button><button className={mode === "contextual" ? "selected" : ""} onClick={() => setMode("contextual")}>Burbuja contextual</button></div>
      <p className="mode-note"><b>{modeLabel}.</b> {selectedText}</p><div className="extension-strip"><span>Extensión contextual:</span><b>Chrome Dev</b><b>Firefox</b><b>Helium</b></div>
    </section>
    <section id="herramientas" className="catalog" aria-label="Catálogo de herramientas">
      {tools.map((tool) => <button className="tool-card" key={tool.id} onClick={() => openTool(tool)}><span className="tool-number">{tool.number}</span><span className="tool-icon">{tool.icon}</span><h2>{tool.name}</h2><p>{mode === "contextual" ? tool.contextual : tool.description}</p><span className="agent-chip">{tool.agent.name}</span><span className="card-action">{tool.protected && !session.authenticated ? "Requiere acceso" : "Abrir espacio de trabajo"} <b>-&gt;</b></span></button>)}
      <button className="tool-card add-card" onClick={() => setDraftOpen(true)}><span className="plus">+</span><h2>Crear nueva herramienta</h2><p>Registra nombre, propósito, entradas, salidas y si requiere acceso protegido.</p>{draftSaved && <span className="draft-chip">Borrador: {draftSaved.name}</span>}</button>
    </section>
    <aside className="mode-panel"><span>{mode === "integrated" ? "Aplicación local" : "Contexto seleccionado"}</span><strong>{mode === "integrated" ? "Tus datos permanecen en este equipo." : "La extensión solo comparte contenido confirmado."}</strong></aside>
    <ContextBubble tools={tools} modeLabel={modeLabel} selectedText={selectedText} paused={contextPaused} onTogglePause={() => setContextPaused((current) => !current)} onOpenTool={openTool} />
    {draftOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="draft-title"><form className="access-modal draft-modal" onSubmit={saveDraft}><button type="button" className="modal-close" onClick={() => setDraftOpen(false)} aria-label="Cerrar">x</button><p className="eyebrow">Borrador local</p><h2 id="draft-title">Nueva herramienta</h2><label>Nombre<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><label>Propósito<textarea value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} required /></label><label>Entradas esperadas<input value={draft.inputs} onChange={(event) => setDraft({ ...draft, inputs: event.target.value })} placeholder="Texto, archivos, imágenes..." /></label><label>Resultado esperado<input value={draft.outputs} onChange={(event) => setDraft({ ...draft, outputs: event.target.value })} placeholder="Nota, prompt, reporte..." /></label><label className="checkbox-row"><input type="checkbox" checked={draft.protected} onChange={(event) => setDraft({ ...draft, protected: event.target.checked })} /> Requiere acceso protegido</label><button className="primary" disabled={!draft.name.trim() || !draft.purpose.trim()}>Guardar borrador</button><small>El borrador no se publica ni se activa hasta pasar revisión de seguridad.</small></form></section>}
    {agentSettingsOpen && <AgentSettingsPanel onClose={() => setAgentSettingsOpen(false)} />}
    {pendingTool && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-title"><form className="access-modal" onSubmit={submitLogin}><button type="button" className="modal-close" onClick={() => setPendingTool(null)} aria-label="Cerrar">x</button><p className="eyebrow">Acceso protegido</p><h2 id="access-title">{pendingTool.name}</h2><p>{session.configured === false ? "Crea el código local de acceso. Se guardará solamente como hash protegido en esta aplicación." : "Introduce el código configurado. Tienes un máximo de tres intentos antes de un bloqueo temporal."}</p><label htmlFor="access-code">{session.configured === false ? "Nuevo código de acceso" : "Código de acceso"}</label><input id="access-code" type="password" minLength={8} autoFocus value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" /><p className="form-error" aria-live="polite">{loginError}</p><button className="primary" disabled={loginBusy || (session.configured === false && accessCode.length < 8)}>{loginBusy ? "Validando..." : session.configured === false ? "Configurar y desbloquear" : "Desbloquear herramienta"}</button><small>La sesión caduca 24 horas después del acceso correcto.</small></form></section>}
  </main>;
}

function Workspace({ tool, mode, session, onSession, onBack, onRequestAccess, initialContext }: { tool: Tool; mode: Mode; session: Session; onSession: (session: Session) => void; onBack: () => void; onRequestAccess: () => void; initialContext: ContextPayload | null }) {
  const [error, setError] = useState("");
  const protectedReady = !tool.protected || session.authenticated;
  const paused = tool.protected === true && session.state === "paused";
  const inactive = tool.protected === true && session.state === "inactive";
  const protectedUsable = !tool.protected || (session.authenticated && session.state === "active");

  const togglePause = async () => {
    if (!tool.protected) return;
    try { onSession(paused || inactive ? await sessionApi.resume() : await sessionApi.pause()); setError(""); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No se pudo actualizar la sesión."); }
  };
  const recordActivity = async () => {
    if (!tool.protected || !session.authenticated) return;
    try { onSession(await sessionApi.activity()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Reanuda la sesión antes de continuar."); }
  };

  const statusText = !protectedReady ? "Acceso requerido" : paused ? "Sesión pausada" : inactive ? "Sesión inactiva" : "Listo para trabajar";

  return <section className="workspace">
    <header className="workspace-header"><button onClick={onBack}>&lt;- Herramientas</button><span>{mode === "integrated" ? "Modo integrado" : "Modo contextual"}</span>{tool.protected && <button onClick={togglePause} disabled={!protectedReady}>{paused || inactive ? "Reanudar sesión" : "Pausar sesión"}</button>}</header>
    <div className="workspace-intro"><span className="workspace-icon">{tool.icon}</span><div><p className="eyebrow">{tool.number} - espacio de trabajo</p><h1>{tool.name}</h1><p>{mode === "integrated" ? tool.description : tool.contextual}</p></div></div><ToolContractPanel tool={tool} /><AgentPanel tool={tool} /><SpecialistAgentTaskPanel tool={tool} disabled={!protectedUsable} onActivity={recordActivity} />
    {tool.protected && !protectedReady && <div className="notice"><b>Acceso protegido.</b> Configura e inicia el servicio local para desbloquear esta herramienta. <button onClick={onRequestAccess}>Introducir código</button></div>}
    {tool.protected && protectedReady && <div className={`notice ${protectedUsable ? "success" : ""}`}><b>{statusText}.</b> {protectedUsable ? "Puedes procesar contenido local." : "El procesamiento está detenido hasta reanudar."} Vence el {session.expiresAt ? new Date(session.expiresAt).toLocaleString("es-MX") : ""}.</div>}
    {tool.id === "resumidor" ? <SummarizerPanel disabled={!protectedUsable} onActivity={recordActivity} initialSource={initialContext?.requestedTool === "resumidor" ? initialContext.selectedText : ""} /> : tool.id === "clases" ? <ClassDownloadPanel disabled={!protectedUsable} onActivity={recordActivity} /> : tool.id === "legal" ? <LegalAnalysisPanel disabled={!protectedUsable} onActivity={recordActivity} initialSource={initialContext?.requestedTool === "legal" ? initialContext.selectedText : ""} /> : null}
  </section>;
}

function AgentPanel({ tool }: { tool: Tool }) {
  const assistant = readPersonalAgentSettings();
  const provider = assistant.provider === "houston"
    ? `Houston: ${assistant.houston.agentName || "asistente personal"}`
    : `Local: ${assistant.localProfile.name || "perfil sin nombre"}`;
  return <aside className="agent-panel" aria-label="Agente asignado">
    <span>Agente especializado</span>
    <strong>{tool.agent.name}</strong>
    <p>{tool.agent.role}</p>
    <p className="agent-instruction">{tool.agent.instruction}</p>
    <div className="agent-specialties">{tool.agent.specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}</div>
    <dl>
      <div><dt>Coordinación</dt><dd>{provider}</dd></div>
      <div><dt>Modelo</dt><dd>{tool.agent.modelProfile}</dd></div>
      <div><dt>Memoria</dt><dd>{tool.agent.memoryScope}</dd></div>
    </dl>
  </aside>;
}
export default App;
