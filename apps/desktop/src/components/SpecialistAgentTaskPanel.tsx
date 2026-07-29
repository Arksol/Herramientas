import { useEffect, useState } from "react";
import { generateAgentPlan } from "../api/agentPlanner";
import { clearAgentMemory, readAgentMemory, readPersonalAgentSettings, saveAgentMemory } from "../api/agentSettings";
import type { TaskPriority, AgentPlan } from "../data/agentProfiles";
import type { Tool } from "../data/tools";

type Props = { tool: Tool; disabled: boolean; onActivity: () => Promise<void> | void };

const priorityLabels: Record<TaskPriority, string> = { hoy: "Hoy", "esta-semana": "Esta semana", profundizar: "Profundizar" };

export default function SpecialistAgentTaskPanel({ tool, disabled, onActivity }: Props) {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("hoy");
  const [includeProfile, setIncludeProfile] = useState(false);
  const [rememberGoal, setRememberGoal] = useState(false);
  const [savedGoal, setSavedGoal] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const memory = readAgentMemory(tool.agent.id);
    setSavedGoal(memory?.goal ?? "");
    setTask(memory?.goal ?? "");
    setPlan(null);
    setRememberGoal(false);
  }, [tool.agent.id]);

  const createPlan = async () => {
    if (!task.trim()) return;
    setBusy(true);
    try {
      await onActivity();
      const profile = readPersonalAgentSettings().localProfile;
      const nextPlan = await generateAgentPlan({
        toolId: tool.id,
        agentId: tool.agent.id,
        task,
        priority,
        useLocalAi: true,
        personalContext: includeProfile ? { goals: profile.goals, schedule: profile.schedule, preferences: profile.preferences } : undefined
      });
      setPlan(nextPlan);
      if (rememberGoal) {
        saveAgentMemory(tool.agent.id, task.trim());
        setSavedGoal(task.trim());
      }
    } finally {
      setBusy(false);
    }
  };

  const removeSavedGoal = () => {
    clearAgentMemory(tool.agent.id);
    setSavedGoal("");
  };

  return <section className="agent-task-panel" aria-label={`Plan de ${tool.agent.name}`}>
    <div className="agent-task-heading"><div><span>Plan de estudio</span><h2>{tool.agent.name}</h2></div><p>{tool.agent.specialties.join(" · ")}</p></div>
    <label>Objetivo inmediato<textarea value={task} onFocus={onActivity} onChange={(event) => setTask(event.target.value)} placeholder="Describe qué quieres aprender, practicar, resolver o preparar." disabled={disabled || busy} /></label>
    <div className="agent-task-controls"><label>Prioridad<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} disabled={disabled || busy}>{(Object.keys(priorityLabels) as TaskPriority[]).map((item) => <option key={item} value={item}>{priorityLabels[item]}</option>)}</select></label><label className="checkbox-row"><input type="checkbox" checked={includeProfile} onChange={(event) => setIncludeProfile(event.target.checked)} disabled={disabled || busy} /> Usar perfil personal local</label><label className="checkbox-row"><input type="checkbox" checked={rememberGoal} onChange={(event) => setRememberGoal(event.target.checked)} disabled={disabled || busy} /> Conservar objetivo</label></div>
    {savedGoal && <div className="saved-agent-goal"><span>Objetivo guardado localmente</span><button type="button" onClick={removeSavedGoal}>Eliminar</button></div>}
    <button className="primary" onClick={createPlan} disabled={disabled || busy || !task.trim()}>{busy ? "Preparando..." : "Crear plan"}</button>
    {plan && <div className="agent-plan-result"><div><b>{plan.usedLocalAi ? "Guía con IA local" : "Guía con reglas locales"}</b><span>{priorityLabels[plan.priority]}</span></div><p>{plan.objective}</p><ol>{plan.nextActions.map((action) => <li key={action}>{action}</li>)}</ol><p className="agent-outcome"><b>Resultado:</b> {plan.expectedOutcome}</p><p className="field-help">{plan.coachMessage}</p></div>}
  </section>;
}