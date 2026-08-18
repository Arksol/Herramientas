import { useEffect, useMemo, useState } from "react";
import { generateAgentPlan } from "../api/agentPlanner";
import { getLocalAiStatus, type LocalAiStatus } from "../api/localAi";
import { readPersonalAgentSettings } from "../api/agentSettings";
import type { AgentPlan, TaskPriority } from "../data/agentProfiles";
import { localModelCatalog, modelsForProfessor, professorOptions, type ProfessorOption } from "../data/specializedProfessors";
import type { Tool } from "../data/tools";

const priorityLabels: Record<TaskPriority, string> = { hoy: "Hoy", "esta-semana": "Esta semana", profundizar: "Profundizar" };

type Props = { tool: Tool; disabled: boolean; onActivity: () => Promise<void> | void };

export default function SpecializedProfessorsPanel({ tool, disabled, onActivity }: Props) {
  const options = useMemo(() => professorOptions, []);
  const [selectedAgentId, setSelectedAgentId] = useState(options[0]?.id ?? "");
  const [modelId, setModelId] = useState(localModelCatalog[0].id);
  const [priority, setPriority] = useState<TaskPriority>("hoy");
  const [task, setTask] = useState("");
  const [status, setStatus] = useState<LocalAiStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedProfessor = options.find((professor) => professor.id === selectedAgentId) ?? options[0];
  const modelOptions = selectedProfessor ? modelsForProfessor(selectedProfessor.subject) : localModelCatalog;
  const installedModels = status?.models ?? [];
  const isInstalled = (id: string) => installedModels.some((installed) => installed === id);

  useEffect(() => {
    let active = true;
    getLocalAiStatus().then((value) => { if (active) setStatus(value); }).catch((reason) => { if (active) setStatusError(reason instanceof Error ? reason.message : "No se pudo consultar Ollama local."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const nextProfessor = options[0];
    setSelectedAgentId(nextProfessor?.id ?? "");
    setModelId(nextProfessor ? (modelsForProfessor(nextProfessor.subject).find((model) => isInstalled(model.id))?.id ?? modelsForProfessor(nextProfessor.subject)[0]?.id ?? "") : "");
    setPlan(null);
  }, [options, status]);

  useEffect(() => {
    if (!selectedProfessor) return;
    const compatible = modelsForProfessor(selectedProfessor.subject);
    if (!compatible.some((model) => model.id === modelId)) setModelId(compatible[0]?.id ?? "");
  }, [modelId, selectedProfessor]);

  const chooseProfessor = (professor: ProfessorOption) => {
    setSelectedAgentId(professor.id);
    const compatible = modelsForProfessor(professor.subject);
    setModelId(compatible.find((model) => isInstalled(model.id))?.id ?? compatible[0]?.id ?? "");
    setPlan(null);
  };

  const startWorking = async () => {
    if (!selectedProfessor || !task.trim()) return;
    setBusy(true);
    try {
      await onActivity();
      const profile = readPersonalAgentSettings().localProfile;
      const nextPlan = await generateAgentPlan({
        toolId: tool.id,
        agentId: selectedProfessor.id,
        task,
        priority,
        useLocalAi: true,
        modelId,
        personalContext: { goals: profile.goals, schedule: profile.schedule, preferences: profile.preferences }
      });
      setPlan(nextPlan);
    } finally {
      setBusy(false);
    }
  };

  return <section className="professor-workspace" aria-label="Profesores especializados">
    <div className="professor-workspace-heading"><div><span>Agentes de estudio local</span><h2>Elige tu profesor</h2></div><p>{status?.available ? "Ollama conectado" : "Ollama local"}</p></div>
    <div className="professor-list" role="listbox" aria-label="Profesores disponibles">{options.map((professor) => <button type="button" key={professor.id} className={`professor-option ${professor.id === selectedAgentId ? "selected" : ""}`} onClick={() => chooseProfessor(professor)} disabled={disabled || busy} role="option" aria-selected={professor.id === selectedAgentId}><strong>{professor.name}</strong><span>{professor.specialties.join(" · ")}</span><small>{professor.role}</small></button>)}</div>
    {selectedProfessor && <div className="professor-selection"><div><b>{selectedProfessor.name}</b><p>{selectedProfessor.role}</p></div><label>Modelo local<select value={modelId} onChange={(event) => setModelId(event.target.value)} disabled={disabled || busy}>{modelOptions.map((model) => <option key={model.id} value={model.id}>{model.name} · {isInstalled(model.id) ? "Disponible" : "No instalado"}</option>)}</select></label><p className="field-help">{modelOptions.find((model) => model.id === modelId)?.purpose}. El modelo se ejecuta en Ollama local y no se envía a Houston ni a otro servicio.</p></div>}
    <label className="professor-task-label">¿Qué quieres aprender o resolver?<textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Ejemplo: explícame cómo resolver sistemas de ecuaciones y déjame un ejercicio similar." disabled={disabled || busy} /></label>
    <div className="professor-controls"><label>Prioridad<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} disabled={disabled || busy}>{(Object.keys(priorityLabels) as TaskPriority[]).map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}</select></label><button type="button" className="primary" onClick={startWorking} disabled={disabled || busy || !task.trim() || !selectedProfessor}>{busy ? "Trabajando..." : "Empezar con este profesor"}</button></div>
    {statusError && <p className="field-help">No se pudo consultar el estado de Ollama: {statusError} Puedes preparar el plan local con reglas y descargar el modelo indicado cuando decidas hacerlo.</p>}
    {selectedProfessor && !isInstalled(modelId) && <p className="model-install-note">Este modelo aún no está instalado. Comando local sugerido: <code>{modelOptions.find((model) => model.id === modelId)?.command}</code></p>}
    {plan && <div className="agent-plan-result"><div><b>{plan.usedLocalAi ? "Guía con IA local" : "Guía con reglas locales"}</b><span>{priorityLabels[plan.priority]}</span></div><p><b>Modelo:</b> {plan.modelId ?? modelId}</p><p>{plan.objective}</p><ol>{plan.nextActions.map((action) => <li key={action}>{action}</li>)}</ol><p className="agent-outcome"><b>Resultado:</b> {plan.expectedOutcome}</p><p className="field-help">{plan.coachMessage}</p></div>}
  </section>;
}