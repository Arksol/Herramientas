import { FormEvent, useEffect, useMemo, useState } from "react";
import { sessionApi, type Session } from "./api/session";
import SummarizerPanel from "./components/SummarizerPanel";
import ClassDownloadPanel from "./components/ClassDownloadPanel";
import { tools, type Tool } from "./data/tools";

type Mode = "integrated" | "contextual";
type DraftTool = { name: string; purpose: string; inputs: string; outputs: string; protected: boolean };

const signedOut: Session = { authenticated: false, state: "signed_out" };
const emptyDraft: DraftTool = { name: "", purpose: "", inputs: "", outputs: "", protected: false };

function App() {
  const [mode, setMode] = useState<Mode>("integrated");
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
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

  const modeLabel = mode === "integrated" ? "Modo integrado" : "Modo contextual";
  const selectedText = useMemo(() => mode === "contextual" ? "Elige contenido desde una pagina autorizada para iniciar la tarea." : "Todo ocurre dentro de Herramientas, en esta misma aplicacion.", [mode]);

  useEffect(() => {
    sessionApi.get().then((value) => { setSession(value); setServiceOnline(true); }).catch(() => setServiceOnline(false));
  }, []);

  const openTool = (tool: Tool) => {
    setLauncherOpen(false);
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
      setLoginError(error instanceof Error ? error.message : "No se pudo validar el codigo.");
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
    return <main className="app-shell"><Workspace tool={activeTool} mode={mode} session={session} onSession={setSession} onBack={() => setActiveTool(null)} onRequestAccess={() => setPendingTool(activeTool)} /></main>;
  }

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <button className="brand" onClick={() => setActiveTool(null)} aria-label="Ir al inicio">H</button>
      <nav aria-label="Navegacion principal"><a className="active" href="#inicio">Inicio</a><a href="#herramientas">Herramientas</a><a href="#acerca">Acerca de</a></nav>
      <div className="topbar-actions"><span className={`local-badge ${serviceOnline === false ? "offline" : ""}`}>* {serviceOnline === false ? "Sin servicio" : "Local"}</span>{session.authenticated && <button className="text-button" onClick={logout}>Cerrar sesion</button>}</div>
    </header>
    <section id="inicio" className="hero">
      <p className="eyebrow">Aplicacion de escritorio - local-first</p><h1>Herramientas</h1>
      <p className="lede">Tu espacio privado para aprender, crear y organizar. Elige una herramienta o activa el lanzador contextual.</p>
      <div className="mode-switch" role="group" aria-label="Modo de operacion"><button className={mode === "integrated" ? "selected" : ""} onClick={() => setMode("integrated")}>Dentro de Herramientas</button><button className={mode === "contextual" ? "selected" : ""} onClick={() => setMode("contextual")}>Burbuja contextual</button></div>
      <p className="mode-note"><b>{modeLabel}.</b> {selectedText}</p><div className="extension-strip"><span>Extension contextual:</span><b>Chrome Dev</b><b>Firefox</b><b>Helium</b></div>
    </section>
    <section id="herramientas" className="catalog" aria-label="Catalogo de herramientas">
      {tools.map((tool) => <button className="tool-card" key={tool.id} onClick={() => openTool(tool)}><span className="tool-number">{tool.number}</span><span className="tool-icon">{tool.icon}</span><h2>{tool.name}</h2><p>{mode === "contextual" ? tool.contextual : tool.description}</p><span className="agent-chip">{tool.agent.name}</span><span className="card-action">{tool.protected && !session.authenticated ? "Requiere acceso" : "Abrir espacio de trabajo"} <b>-&gt;</b></span></button>)}
      <button className="tool-card add-card" onClick={() => setDraftOpen(true)}><span className="plus">+</span><h2>Crear nueva herramienta</h2><p>Registra nombre, proposito, entradas, salidas y si requiere acceso protegido.</p>{draftSaved && <span className="draft-chip">Borrador: {draftSaved.name}</span>}</button>
    </section>
    <aside className="mode-panel"><span>{mode === "integrated" ? "Aplicacion local" : "Contexto seleccionado"}</span><strong>{mode === "integrated" ? "Tus datos permanecen en este equipo." : "La extension solo comparte contenido confirmado."}</strong></aside>
    <button className={`launcher ${launcherOpen ? "launcher-open" : ""}`} onClick={() => setLauncherOpen(!launcherOpen)} aria-expanded={launcherOpen} aria-label="Abrir lanzador de herramientas">*</button>
    {launcherOpen && <section className="launcher-menu" aria-label="Lanzador contextual"><div><span>{modeLabel}</span><button onClick={() => setContextPaused(!contextPaused)}>{contextPaused ? "Reanudar" : "Pausar"}</button></div><p>{contextPaused ? "Captura contextual pausada." : selectedText}</p>{tools.map((tool) => <button key={tool.id} onClick={() => openTool(tool)}>{tool.icon} {tool.name}</button>)}</section>}
    {draftOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="draft-title"><form className="access-modal draft-modal" onSubmit={saveDraft}><button type="button" className="modal-close" onClick={() => setDraftOpen(false)} aria-label="Cerrar">x</button><p className="eyebrow">Borrador local</p><h2 id="draft-title">Nueva herramienta</h2><label>Nombre<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><label>Proposito<textarea value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} required /></label><label>Entradas esperadas<input value={draft.inputs} onChange={(event) => setDraft({ ...draft, inputs: event.target.value })} placeholder="Texto, archivos, imagenes..." /></label><label>Resultado esperado<input value={draft.outputs} onChange={(event) => setDraft({ ...draft, outputs: event.target.value })} placeholder="Nota, prompt, reporte..." /></label><label className="checkbox-row"><input type="checkbox" checked={draft.protected} onChange={(event) => setDraft({ ...draft, protected: event.target.checked })} /> Requiere acceso protegido</label><button className="primary" disabled={!draft.name.trim() || !draft.purpose.trim()}>Guardar borrador</button><small>El borrador no se publica ni se activa hasta pasar revision de seguridad.</small></form></section>}
    {pendingTool && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-title"><form className="access-modal" onSubmit={submitLogin}><button type="button" className="modal-close" onClick={() => setPendingTool(null)} aria-label="Cerrar">x</button><p className="eyebrow">Acceso protegido</p><h2 id="access-title">{pendingTool.name}</h2><p>{session.configured === false ? "Crea el codigo local de acceso. Se guardara solamente como hash protegido en esta aplicacion." : "Introduce el codigo configurado. Tienes un maximo de tres intentos antes de un bloqueo temporal."}</p><label htmlFor="access-code">{session.configured === false ? "Nuevo codigo de acceso" : "Codigo de acceso"}</label><input id="access-code" type="password" minLength={8} autoFocus value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" /><p className="form-error" aria-live="polite">{loginError}</p><button className="primary" disabled={loginBusy || (session.configured === false && accessCode.length < 8)}>{loginBusy ? "Validando..." : session.configured === false ? "Configurar y desbloquear" : "Desbloquear herramienta"}</button><small>La sesion caduca 24 horas despues del acceso correcto.</small></form></section>}
  </main>;
}

function Workspace({ tool, mode, session, onSession, onBack, onRequestAccess }: { tool: Tool; mode: Mode; session: Session; onSession: (session: Session) => void; onBack: () => void; onRequestAccess: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const protectedReady = !tool.protected || session.authenticated;
  const paused = tool.protected === true && session.state === "paused";
  const inactive = tool.protected === true && session.state === "inactive";
  const protectedUsable = !tool.protected || (session.authenticated && session.state === "active");

  const togglePause = async () => {
    if (!tool.protected) return;
    try { onSession(paused || inactive ? await sessionApi.resume() : await sessionApi.pause()); setError(""); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No se pudo actualizar la sesion."); }
  };
  const recordActivity = async () => {
    if (!tool.protected || !session.authenticated) return;
    try { onSession(await sessionApi.activity()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Reanuda la sesion antes de continuar."); }
  };

  const statusText = !protectedReady ? "Acceso requerido" : paused ? "Sesion pausada" : inactive ? "Sesion inactiva" : "Listo para trabajar";

  return <section className="workspace">
    <header className="workspace-header"><button onClick={onBack}>&lt;- Herramientas</button><span>{mode === "integrated" ? "Modo integrado" : "Modo contextual"}</span>{tool.protected && <button onClick={togglePause} disabled={!protectedReady}>{paused || inactive ? "Reanudar sesion" : "Pausar sesion"}</button>}</header>
    <div className="workspace-intro"><span className="workspace-icon">{tool.icon}</span><div><p className="eyebrow">{tool.number} - espacio de trabajo</p><h1>{tool.name}</h1><p>{mode === "integrated" ? tool.description : tool.contextual}</p></div></div><AgentPanel tool={tool} />
    {tool.protected && !protectedReady && <div className="notice"><b>Acceso protegido.</b> Configura e inicia el servicio local para desbloquear esta herramienta. <button onClick={onRequestAccess}>Introducir codigo</button></div>}
    {tool.protected && protectedReady && <div className={`notice ${protectedUsable ? "success" : ""}`}><b>{statusText}.</b> {protectedUsable ? "Puedes procesar contenido local." : "El procesamiento esta detenido hasta reanudar."} Vence el {session.expiresAt ? new Date(session.expiresAt).toLocaleString("es-MX") : ""}.</div>}
    {tool.id === "resumidor" ? <SummarizerPanel disabled={!protectedUsable} onActivity={recordActivity} /> : tool.id === "clases" ? <ClassDownloadPanel disabled={!protectedUsable} onActivity={recordActivity} /> : <div className="workspace-grid"><section className="input-panel"><label htmlFor="task">Que quieres hacer?</label><textarea id="task" value={text} onFocus={recordActivity} onChange={(event) => setText(event.target.value)} placeholder={mode === "contextual" ? "El contexto seleccionado aparecera aqui despues de confirmarlo." : "Escribe tu solicitud o adjunta contenido autorizado."} disabled={!protectedUsable} /><div className="input-actions"><button className="secondary" disabled={!protectedUsable}>Adjuntar archivo</button><button className="primary" disabled={!protectedUsable || !text.trim()} onClick={recordActivity}>Iniciar tarea -&gt;</button></div></section><aside className="status-panel"><span className="status-dot" /> <b>{statusText}</b><p>Los modelos, archivos e integraciones se conectan localmente. No se envia contenido a servicios externos por defecto.</p><p className="form-error">{error}</p><hr/><small>Sesion: hasta 24 h - Inactividad: 10 min - Intentos de acceso: 3</small></aside></div>}
  </section>;
}

function AgentPanel({ tool }: { tool: Tool }) {
  return <aside className="agent-panel" aria-label="Agente asignado">
    <span>Agente local</span>
    <strong>{tool.agent.name}</strong>
    <p>{tool.agent.role}</p>
    <dl><div><dt>Modelo</dt><dd>{tool.agent.modelProfile}</dd></div><div><dt>Memoria</dt><dd>{tool.agent.memoryScope}</dd></div></dl>
  </aside>;
}
export default App;
