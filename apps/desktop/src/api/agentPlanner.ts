import { createRuleBasedAgentPlan, type AgentPlan, type TaskPriority } from "../data/agentProfiles";
import type { ToolId } from "../data/toolContracts";

export type PersonalContext = {
  goals: string;
  schedule: string;
  preferences: string;
};

export type AgentPlanRequest = {
  toolId: ToolId;
  agentId: string;
  task: string;
  priority: TaskPriority;
  useLocalAi: boolean;
  personalContext?: PersonalContext;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3030";
const isTauri = () => "__TAURI_INTERNALS__" in window;

export async function generateAgentPlan(request: AgentPlanRequest): Promise<AgentPlan> {
  const fallback = createRuleBasedAgentPlan(request.toolId, request.task, request.priority);
  if (isTauri()) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke<AgentPlan>("generate_agent_plan", request);
    } catch {
      return fallback;
    }
  }
  try {
    const response = await fetch(`${apiUrl}/api/agents/plan`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error?.message ?? "No se pudo crear el plan del agente.");
    return body as AgentPlan;
  } catch {
    return fallback;
  }
}