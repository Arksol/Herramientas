import { useState } from "react";
import {
  buildHoustonBriefing,
  readPersonalAgentSettings,
  savePersonalAgentSettings,
  type PersonalAgentSettings
} from "../api/agentSettings";

type Props = { onClose: () => void };

export default function AgentSettingsPanel({ onClose }: Props) {
  const [settings, setSettings] = useState<PersonalAgentSettings>(readPersonalAgentSettings);
  const [notice, setNotice] = useState("");

  const updateLocal = (field: keyof PersonalAgentSettings["localProfile"], value: string) => {
    setSettings((current) => ({ ...current, localProfile: { ...current.localProfile, [field]: value } }));
  };
  const updateHouston = (field: keyof PersonalAgentSettings["houston"], value: string) => {
    setSettings((current) => ({ ...current, houston: { ...current.houston, [field]: value } }));
  };
  const save = () => {
    savePersonalAgentSettings(settings);
    setNotice("Configuración guardada en este equipo. El perfil base no se mezcla con capturas ni contexto temporal.");
  };
  const copyForHouston = async () => {
    try {
      await navigator.clipboard.writeText(buildHoustonBriefing(settings));
      setNotice("Instrucciones copiadas. Revísalas y pégalas en tu agente de Houston cuando decidas compartirlas.");
    } catch {
      setNotice("No se pudo copiar automáticamente. Guarda la configuración y copia el contenido desde esta pantalla en una siguiente versión.");
    }
  };

  return <section className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="agent-settings-title">
    <div className="access-modal agent-settings-modal">
      <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar configuración">x</button>
      <p className="eyebrow">Modo administrador</p>
      <h2 id="agent-settings-title">Asistente personal</h2>
      <p>Elige qué asistente coordina tus estudios, agenda y progreso. La parte pública del producto no verá este perfil.</p>
      <div className="agent-provider-switch" role="group" aria-label="Proveedor del asistente personal">
        <button type="button" className={settings.provider === "local" ? "selected" : ""} onClick={() => setSettings((current) => ({ ...current, provider: "local" }))}>Agente local</button>
        <button type="button" className={settings.provider === "houston" ? "selected" : ""} onClick={() => setSettings((current) => ({ ...current, provider: "houston" }))}>Houston</button>
      </div>
      {settings.provider === "local" ? <div className="agent-settings-fields">
        <p className="field-help">Este perfil permanece en Herramientas. Solo tú decides qué datos conservar; capturas, adjuntos y contexto temporal se eliminan semanalmente.</p>
        <label>Nombre o alias<input value={settings.localProfile.name} onChange={(event) => updateLocal("name", event.target.value)} placeholder="Ejemplo: Aaron" /></label>
        <label>Objetivos<textarea value={settings.localProfile.goals} onChange={(event) => updateLocal("goals", event.target.value)} placeholder="Estudio, proyectos, trabajo y metas personales" /></label>
        <label>Horario y disponibilidad<textarea value={settings.localProfile.schedule} onChange={(event) => updateLocal("schedule", event.target.value)} placeholder="Horario rotativo, clases y bloques disponibles" /></label>
        <label>Preferencias de estudio<textarea value={settings.localProfile.preferences} onChange={(event) => updateLocal("preferences", event.target.value)} placeholder="Cómo prefieres estudiar, practicar y recibir recordatorios" /></label>
      </div> : <div className="agent-settings-fields">
        <p className="field-help">Houston se usa mediante una transferencia explícita. Herramientas no inicia sesión, no lee tu cuenta ni envía tu perfil automáticamente.</p>
        <label>Nombre del agente en Houston<input value={settings.houston.agentName} onChange={(event) => updateHouston("agentName", event.target.value)} placeholder="Ejemplo: Asistente personal" /></label>
        <label>Dirección de Houston<input type="url" value={settings.houston.agentUrl} onChange={(event) => updateHouston("agentUrl", event.target.value)} /></label>
        <div className="external-agent-actions"><button type="button" className="secondary" onClick={copyForHouston}>Copiar instrucciones para Houston</button><a className="secondary external-link" href={settings.houston.agentUrl || "https://gethouston.ai"} target="_blank" rel="noreferrer">Abrir Houston</a></div>
      </div>}
      <div className="agent-retention-note"><b>Retención:</b> el perfil que guardes se conserva hasta que lo cambies o elimines. Las capturas, el caché de la extensión, los archivos temporales y el contexto de agentes se purgan cada siete días. Nunca se eliminan archivos ni notas fuera de Herramientas.</div>
      <p className="form-notice" aria-live="polite">{notice}</p>
      <button type="button" className="primary" onClick={save}>Guardar configuración</button>
    </div>
  </section>;
}
