import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { sessionApi, type RegistrationResult, type Session } from "./api/session";
import SummarizerPanel from "./components/SummarizerPanel";
import ClassDownloadPanel from "./components/ClassDownloadPanel";
import FileReaderPanel from "./components/FileReaderPanel";
import { tools, type Tool } from "./data/tools";

type Mode = "integrated" | "contextual" | "third-party";
type SettingsTab = "general" | "agents" | "models" | "terminals" | "connections";
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
  const [registeredOpen, setRegisteredOpen] = useState(false);
  const [registeredMode, setRegisteredMode] = useState<"login" | "register">("login");
  const [registeredIdentifier, setRegisteredIdentifier] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [registeredCode, setRegisteredCode] = useState("");
  const [registeredError, setRegisteredError] = useState("");
  const [registeredBusy, setRegisteredBusy] = useState(false);
  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");

  const modeLabel = mode === "integrated" ? "Modo integrado" : mode === "contextual" ? "Modo contextual" : "Herramientas de 3ros";
  const selectedText = useMemo(() => mode === "contextual" ? "Elige contenido desde una pagina autorizada para iniciar la tarea." : mode === "third-party" ? "Agrega herramientas desde una página web o desde tu propio escritorio." : "Todo ocurre dentro de Herramientas, en esta misma aplicacion.", [mode]);

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

  const submitRegistered = async (event: FormEvent) => {
    event.preventDefault();
    setRegisteredBusy(true);
    setRegisteredError("");
    try {
      if (registeredMode === "register") {
        const result = await sessionApi.register(registeredIdentifier, registeredPassword);
        setRegistration(result);
        setRegisteredMode("login");
        setRegisteredPassword("");
        setRegisteredError("Cuenta creada. Guarda el secreto en Proton Authenticator y después inicia sesión con el código de 6 dígitos.");
      } else {
        const value = await sessionApi.loginRegistered(registeredIdentifier, registeredPassword, registeredCode);
        setSession(value);
        setServiceOnline(true);
        setRegisteredOpen(false);
        setRegisteredPassword("");
        setRegisteredCode("");
      }
    } catch (error) {
      setRegisteredError(error instanceof Error ? error.message : "No se pudo completar la autenticación.");
    } finally { setRegisteredBusy(false); }
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
      <div className="topbar-actions"><button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label="Abrir configuracion" title="Configuracion"><SettingsIcon /></button><span className={`local-badge ${serviceOnline === false ? "offline" : ""}`}>● {serviceOnline === false ? "Sin servicio" : "Local"}</span>{session.authenticated ? <button className="text-button" onClick={logout}>Cerrar sesion</button> : <button className="text-button" onClick={() => { setRegisteredOpen(true); setRegisteredError(""); }}>Iniciar sesion</button>}</div>
    </header>
    <section id="inicio" className="hero">
      <p className="eyebrow">Aplicacion web local - local-first</p><h1>Herramientas</h1>
      <p className="lede">Tu espacio privado para aprender, crear y organizar. Elige una herramienta o activa el lanzador contextual.</p>
      <div className="mode-switch" role="group" aria-label="Modo de operacion"><button className={mode === "integrated" ? "selected" : ""} onClick={() => setMode("integrated")}>Dentro de Herramientas</button><button className={mode === "third-party" ? "selected" : ""} onClick={() => setMode("third-party")}>Herramientas de 3ros</button><button className={mode === "contextual" ? "selected" : ""} onClick={() => setMode("contextual")}>Burbuja contextual</button></div>
      <p className="mode-note"><b>{modeLabel}.</b> {selectedText}</p><div className="extension-strip"><span>Extension contextual:</span><b>Chrome Dev</b><b>Firefox</b><b>Helium</b></div>
    </section>
    {mode !== "third-party" && <section id="herramientas" className="catalog" aria-label="Catalogo de herramientas">
      {tools.map((tool) => <button className="tool-card" key={tool.id} onClick={() => openTool(tool)}><span className="tool-number">{tool.number}</span><span className="tool-icon"><ToolIcon name={tool.icon} /></span><h2>{tool.name}</h2><p>{mode === "contextual" ? tool.contextual : tool.description}</p><span className="agent-chip">{tool.agent.name}</span><span className="card-action">{tool.protected && !session.authenticated ? "Requiere acceso" : "Abrir espacio de trabajo"} <b>-&gt;</b></span></button>)}
      <button className="tool-card add-card" onClick={() => setDraftOpen(true)}><span className="plus"><PlusIcon /></span><h2>Crear nueva herramienta</h2><p>Registra nombre, proposito, entradas, salidas y si requiere acceso protegido.</p>{draftSaved && <span className="draft-chip">Borrador: {draftSaved.name}</span>}</button>
    </section>}
    {mode === "third-party" && <ThirdPartyPanel authenticated={session.authenticated} onRequestAccess={() => setPendingTool(tools[0])} onCreate={() => setDraftOpen(true)} />}
    <aside className="mode-panel"><span>{mode === "integrated" ? "Aplicacion local" : mode === "contextual" ? "Contexto seleccionado" : "Herramientas de 3ros"}</span><strong>{mode === "integrated" ? "Tus datos permanecen en este equipo." : mode === "contextual" ? "La extension solo comparte contenido confirmado." : "Solo las cuentas con acceso pueden agregar herramientas externas."}</strong></aside>
    <footer className="site-footer"><div className="author-mark"><span className="github-mark"><GithubIcon /></span><div><strong>Diseñada por el autor</strong><span>Con ayuda de inteligencia artificial</span></div></div><span>© 2026 Herramientas. Todos los derechos reservados.</span><button className="footer-link" onClick={() => { setSettingsTab("general"); setSettingsOpen(true); }}>Configurar perfil de GitHub</button></footer>
    <button className={`launcher ${launcherOpen ? "launcher-open" : ""}`} onClick={() => setLauncherOpen(!launcherOpen)} aria-expanded={launcherOpen} aria-label="Abrir lanzador de herramientas">*</button>
    {launcherOpen && <section className="launcher-menu" aria-label="Lanzador contextual"><div><span>{modeLabel}</span><button onClick={() => setContextPaused(!contextPaused)}>{contextPaused ? "Reanudar" : "Pausar"}</button></div><p>{contextPaused ? "Captura contextual pausada." : selectedText}</p>{tools.map((tool) => <button key={tool.id} onClick={() => openTool(tool)}>{tool.icon} {tool.name}</button>)}</section>}
    {draftOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="draft-title"><form className="access-modal draft-modal" onSubmit={saveDraft}><button type="button" className="modal-close" onClick={() => setDraftOpen(false)} aria-label="Cerrar">x</button><p className="eyebrow">Borrador local</p><h2 id="draft-title">Nueva herramienta</h2><label>Nombre<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><label>Proposito<textarea value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} required /></label><label>Entradas esperadas<input value={draft.inputs} onChange={(event) => setDraft({ ...draft, inputs: event.target.value })} placeholder="Texto, archivos, imagenes..." /></label><label>Resultado esperado<input value={draft.outputs} onChange={(event) => setDraft({ ...draft, outputs: event.target.value })} placeholder="Nota, prompt, reporte..." /></label><label className="checkbox-row"><input type="checkbox" checked={draft.protected} onChange={(event) => setDraft({ ...draft, protected: event.target.checked })} /> Requiere acceso protegido</label><button className="primary" disabled={!draft.name.trim() || !draft.purpose.trim()}>Guardar borrador</button><small>El borrador no se publica ni se activa hasta pasar revision de seguridad.</small></form></section>}
    {pendingTool && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-title"><form className="access-modal" onSubmit={submitLogin}><button type="button" className="modal-close" onClick={() => setPendingTool(null)} aria-label="Cerrar">x</button><p className="eyebrow">Acceso protegido</p><h2 id="access-title">{pendingTool.name}</h2><p>{session.configured === false ? "Crea el codigo local de acceso. Se guardara solamente como hash protegido en esta aplicacion." : "Introduce el codigo configurado. Tienes un maximo de tres intentos antes de un bloqueo temporal."}</p><label htmlFor="access-code">{session.configured === false ? "Nuevo codigo de acceso" : "Codigo de acceso"}</label><input id="access-code" type="password" minLength={8} autoFocus value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" /><p className="form-error" aria-live="polite">{loginError}</p><button className="primary" disabled={loginBusy || (session.configured === false && accessCode.length < 8)}>{loginBusy ? "Validando..." : session.configured === false ? "Configurar y desbloquear" : "Desbloquear herramienta"}</button><small>La sesion caduca 24 horas despues del acceso correcto.</small></form></section>}
    {registeredOpen && <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="registered-title"><form className="access-modal registered-modal" onSubmit={submitRegistered}><button type="button" className="modal-close" onClick={() => setRegisteredOpen(false)} aria-label="Cerrar">×</button><p className="eyebrow">Cuenta Herramientas</p><h2 id="registered-title">{registeredMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2><p>{registeredMode === "login" ? "Accede a tus agentes, herramientas de terceros y conexiones con tu contraseña y el código de Proton Authenticator." : "Crea una cuenta local para desbloquear las funciones avanzadas de Herramientas."}</p>{registration && <div className="registration-secret"><strong>Configura Proton Authenticator</strong><span>Agrega una cuenta TOTP y copia este secreto:</span><code>{registration.twoFactor.secret}</code><small>Después inicia sesión usando el código de 6 dígitos que genera Proton Authenticator.</small></div>}<label htmlFor="registered-identifier">Usuario o correo</label><input id="registered-identifier" value={registeredIdentifier} onChange={(event) => setRegisteredIdentifier(event.target.value)} autoComplete="username" required /><label htmlFor="registered-password">Contraseña</label><input id="registered-password" type="password" minLength={10} value={registeredPassword} onChange={(event) => setRegisteredPassword(event.target.value)} autoComplete={registeredMode === "login" ? "current-password" : "new-password"} required />{registeredMode === "login" && <><label htmlFor="registered-code">Código de Proton Authenticator</label><input id="registered-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={registeredCode} onChange={(event) => setRegisteredCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required /></>}<p className="form-error" aria-live="polite">{registeredError}</p><button className="primary" disabled={registeredBusy}>{registeredBusy ? "Procesando..." : registeredMode === "login" ? "Entrar como usuario registrado" : "Crear cuenta y configurar A2F"}</button><button type="button" className="secondary auth-switch" onClick={() => { setRegisteredMode(registeredMode === "login" ? "register" : "login"); setRegisteredError(""); }}>{registeredMode === "login" ? "Crear una cuenta nueva" : "Ya tengo una cuenta"}</button><small>La autenticación usa TOTP estándar, compatible con Proton Authenticator.</small></form></section>}    {settingsOpen && <SettingsPanel tab={settingsTab} setTab={setSettingsTab} session={session} onClose={() => setSettingsOpen(false)} onLogout={logout} />}
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
    <div className="workspace-intro"><span className="workspace-icon"><ToolIcon name={tool.icon} /></span><div><p className="eyebrow">{tool.number} - espacio de trabajo</p><h1>{tool.name}</h1><p>{mode === "contextual" ? tool.contextual : tool.description}</p></div></div><AgentPanel tool={tool} />
    {tool.protected && !protectedReady && <div className="notice"><b>Acceso protegido.</b> Configura e inicia el servicio local para desbloquear esta herramienta. <button onClick={onRequestAccess}>Introducir codigo</button></div>}
    {tool.protected && protectedReady && <div className={`notice ${protectedUsable ? "success" : ""}`}><b>{statusText}.</b> {protectedUsable ? "Puedes procesar contenido local." : "El procesamiento esta detenido hasta reanudar."} Vence el {session.expiresAt ? new Date(session.expiresAt).toLocaleString("es-MX") : ""}.</div>}
    {tool.id === "resumidor" ? <SummarizerPanel disabled={!protectedUsable} onActivity={recordActivity} /> : tool.id === "clases" ? <ClassDownloadPanel disabled={!protectedUsable} onActivity={recordActivity} /> : tool.id === "lector" ? <FileReaderPanel disabled={!protectedUsable} /> : <div className="workspace-grid"><section className="input-panel"><label htmlFor="task">Que quieres hacer?</label><textarea id="task" value={text} onFocus={recordActivity} onChange={(event) => setText(event.target.value)} placeholder={mode === "contextual" ? "El contexto seleccionado aparecera aqui despues de confirmarlo." : "Escribe tu solicitud o adjunta contenido autorizado."} disabled={!protectedUsable} /><div className="input-actions"><button className="secondary" disabled={!protectedUsable}>Adjuntar archivo</button><button className="primary" disabled={!protectedUsable || !text.trim()} onClick={recordActivity}>Iniciar tarea -&gt;</button></div></section><aside className="status-panel"><span className="status-dot" /> <b>{statusText}</b><p>Los modelos, archivos e integraciones se conectan localmente. No se envia contenido a servicios externos por defecto.</p><p className="form-error">{error}</p><hr/><small>Sesion: hasta 24 h - Inactividad: 10 min - Intentos de acceso: 3</small></aside></div>}
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

function ThirdPartyPanel({ authenticated, onRequestAccess, onCreate }: { authenticated: boolean; onRequestAccess: () => void; onCreate: () => void }) {
  return <section className="third-party-panel" aria-label="Herramientas de terceros"><div className="third-party-heading"><div><span className="eyebrow">Espacio privado</span><h2>Herramientas de 3ros</h2><p>Integra herramientas propias, páginas web autorizadas o aplicaciones instaladas en tu escritorio.</p></div><span className="access-badge">{authenticated ? "Cuenta activa" : "Solo cuentas"}</span></div>{authenticated ? <div className="third-party-options"><button className="third-party-card" onClick={onCreate}><span><WebIcon /></span><strong>Desde una página web</strong><p>Guarda una herramienta externa con su URL, permisos y modo de conexión.</p><b>Agregar herramienta -&gt;</b></button><button className="third-party-card" onClick={onCreate}><span><DesktopIcon /></span><strong>Desde tu escritorio</strong><p>Registra una aplicación local, un ejecutable o un flujo de terminal.</p><b>Agregar aplicación -&gt;</b></button></div> : <div className="account-gate"><LockIcon /><div><strong>Inicia sesión para usar este espacio</strong><p>Las herramientas de terceros pueden ejecutar conexiones externas, por eso quedan disponibles solo para cuentas autorizadas.</p></div><button className="primary" onClick={onRequestAccess}>Configurar cuenta</button></div>}</section>;
}

function SettingsPanel({ tab, setTab, session, onClose, onLogout }: { tab: SettingsTab; setTab: (tab: SettingsTab) => void; session: Session; onClose: () => void; onLogout: () => void }) {
  const tabs: { id: SettingsTab; label: string; icon: JSX.Element }[] = [{ id: "general", label: "General", icon: <SlidersIcon /> }, { id: "agents", label: "Agentes", icon: <AgentIcon /> }, { id: "models", label: "Modelos", icon: <ModelIcon /> }, { id: "terminals", label: "Terminales", icon: <TerminalIcon /> }, { id: "connections", label: "APIs y MCPs", icon: <PlugIcon /> }];
  return <section className="settings-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="settings-panel"><header className="settings-header"><div><span className="eyebrow">Centro de control</span><h2 id="settings-title">Configuración</h2><p>Administra agentes, modelos, terminales y conexiones desde un solo lugar.</p></div><button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button></header><div className="settings-layout"><nav className="settings-nav" aria-label="Secciones de configuración">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "selected" : ""} onClick={() => setTab(item.id)}>{item.icon}<span>{item.label}</span></button>)}</nav><div className="settings-content">{tab === "general" && <><h3>Cuenta y preferencias</h3><div className="setting-row"><span><b>Tipo de cuenta</b><small>{session.authenticated ? "Cuenta local autorizada" : "Invitado · acceso limitado"}</small></span><span className="setting-value">{session.authenticated ? "Activa" : "Invitado"}</span></div><div className="setting-row"><span><b>Idioma</b><small>Idioma de la interfaz y de los mensajes</small></span><select defaultValue="es"><option value="es">Español</option><option value="en">English</option></select></div><div className="setting-row"><span><b>Perfil de GitHub</b><small>Se mostrará en el pie de la aplicación</small></span><input placeholder="https://github.com/tu-usuario" /></div><button className="logout-button settings-action" onClick={onLogout}><LogoutIcon />Cerrar sesión</button></>}{tab === "agents" && <SettingsList title="Agentes" items={["Agente de Síntesis Académica", "Agente Tutor C1", "Agente Tutor Técnico", "Agente Lector General"]} action="Agregar agente" />}{tab === "models" && <SettingsList title="Modelos" items={["Ollama · qwen2.5:3b-instruct-q4_K_M", "OpenAI · configurar clave de API", "Claude · configurar clave de API", "Modelos locales personalizados"]} action="Conectar modelo" />}{tab === "terminals" && <SettingsList title="Terminales inteligentes y normales" items={["Warp", "PowerShell", "Ubuntu / WSL", "Anaconda", "Python"]} action="Agregar terminal" />}{tab === "connections" && <SettingsList title="Aplicaciones, APIs y MCPs" items={["Conexión REST / API", "Servidor MCP local", "Servidor MCP remoto", "Aplicación de escritorio"]} action="Nueva conexión" />}</div></div></div></section>;
}

function SettingsList({ title, items, action }: { title: string; items: string[]; action: string }) { return <><h3>{title}</h3><p className="settings-intro">Configura qué servicios puede usar Herramientas y qué permisos tendrá cada conexión.</p><div className="settings-list">{items.map((item) => <div className="setting-row" key={item}><span><b>{item}</b><small>Sin configurar · conexión local y controlada</small></span><button className="secondary compact-button">Configurar</button></div>)}</div><button className="primary settings-action">{action}</button></>; }

function ToolIcon({ name }: { name: Tool["icon"] }) { const icons = { synthesis: <SparkIcon />, download: <DownloadIcon />, language: <LanguageIcon />, technology: <CpuIcon />, visual: <ImageIcon />, code: <CodeIcon />, reader: <BookIcon /> }; return icons[name]; }
function SvgIcon({ children }: { children: ReactNode }) { return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>; }
const SparkIcon = () => <SvgIcon><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></SvgIcon>;
const DownloadIcon = () => <SvgIcon><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></SvgIcon>;
const LanguageIcon = () => <SvgIcon><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5Z"/></SvgIcon>;
const CpuIcon = () => <SvgIcon><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3M10 10h4v4h-4z"/></SvgIcon>;
const ImageIcon = () => <SvgIcon><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.3"/><path d="m4 17 5-5 3 3 2-2 6 5"/></SvgIcon>;
const CodeIcon = () => <SvgIcon><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></SvgIcon>;
const BookIcon = () => <SvgIcon><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z"/><path d="M5 4.5v17M8 6h8m-8 4h7"/></SvgIcon>;
const SettingsIcon = () => <SvgIcon><path d="M12 2.8v2.3m0 13.8v2.3M4.8 4.8l1.6 1.6m11.2 11.2 1.6 1.6M2.8 12h2.3m13.8 0h2.3M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></SvgIcon>;
const PlusIcon = () => <SvgIcon><path d="M12 5v14M5 12h14"/></SvgIcon>;
const GithubIcon = () => <SvgIcon><path d="M9 19c-4 .9-4-2-5-2m10 4v-3.5c0-1 .1-1.4-.5-2 1.8-.2 3.7-.9 3.7-4A3.1 3.1 0 0 0 16.4 9c.1-.4.4-1.4-.1-2.8 0 0-1-.3-3 1.1a10.2 10.2 0 0 0-5.5 0c-2-1.4-3-1.1-3-1.1-.5 1.4-.2 2.4-.1 2.8A3.1 3.1 0 0 0 4 11.5c0 3.1 1.9 3.8 3.7 4-.6.6-.6 1.1-.5 2V21"/></SvgIcon>;
const WebIcon = () => <SvgIcon><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2 2.4 3 5.2 3 8.5s-1 6.1-3 8.5c-2-2.4-3-5.2-3-8.5s1-6.1 3-8.5Z"/></SvgIcon>;
const DesktopIcon = () => <SvgIcon><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></SvgIcon>;
const LockIcon = () => <SvgIcon><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></SvgIcon>;
const LogoutIcon = () => <SvgIcon><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m14 8 4 4-4 4m4-4H9"/></SvgIcon>;
const SlidersIcon = () => <SvgIcon><path d="M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 6v4"/></SvgIcon>;
const AgentIcon = () => <SvgIcon><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0M19 4v4m-2-2h4"/></SvgIcon>;
const ModelIcon = () => <SvgIcon><path d="M4 7h16v10H4zM8 4h8M8 20h8"/><path d="M8 10h8m-8 3h5"/></SvgIcon>;
const TerminalIcon = () => <SvgIcon><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m5 0h5"/></SvgIcon>;
const PlugIcon = () => <SvgIcon><path d="m8 12 4-4m0 0 2 2m-2-2 3-3 3 3-3 3m-7 1-3 3 3 3 3-3m-3 3 2 2"/></SvgIcon>;
export default App;
