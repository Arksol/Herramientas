export type AssistantProvider = "local" | "houston";

export type PersonalAgentSettings = {
  provider: AssistantProvider;
  localProfile: {
    name: string;
    goals: string;
    schedule: string;
    preferences: string;
  };
  houston: {
    agentName: string;
    agentUrl: string;
  };
};

export type AgentMemoryEntry = { goal: string; updatedAt: string };

type AgentMemoryStore = Record<string, AgentMemoryEntry>;

const settingsKey = "herramientas.personal-agent.settings.v1";
const memoryKey = "herramientas.specialist-agent.memory.v1";

export const defaultPersonalAgentSettings: PersonalAgentSettings = {
  provider: "local",
  localProfile: {
    name: "",
    goals: "",
    schedule: "",
    preferences: ""
  },
  houston: {
    agentName: "",
    agentUrl: "https://gethouston.ai"
  }
};

export function readPersonalAgentSettings(): PersonalAgentSettings {
  try {
    const stored = window.localStorage.getItem(settingsKey);
    if (!stored) return defaultPersonalAgentSettings;
    const parsed = JSON.parse(stored) as Partial<PersonalAgentSettings>;
    return {
      provider: parsed.provider === "houston" ? "houston" : "local",
      localProfile: { ...defaultPersonalAgentSettings.localProfile, ...parsed.localProfile },
      houston: { ...defaultPersonalAgentSettings.houston, ...parsed.houston }
    };
  } catch {
    return defaultPersonalAgentSettings;
  }
}

export function savePersonalAgentSettings(settings: PersonalAgentSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function readAgentMemoryStore(): AgentMemoryStore {
  try {
    const stored = window.localStorage.getItem(memoryKey);
    const parsed = stored ? JSON.parse(stored) as AgentMemoryStore : {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value?.goal === "string" && typeof value?.updatedAt === "string"));
  } catch {
    return {};
  }
}

export function readAgentMemory(agentId: string): AgentMemoryEntry | null {
  return readAgentMemoryStore()[agentId] ?? null;
}

export function saveAgentMemory(agentId: string, goal: string) {
  const normalized = goal.trim().replace(/\s+/g, " ").slice(0, 1000);
  if (!normalized) return;
  const memory = readAgentMemoryStore();
  memory[agentId] = { goal: normalized, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(memoryKey, JSON.stringify(memory));
}

export function clearAgentMemory(agentId: string) {
  const memory = readAgentMemoryStore();
  delete memory[agentId];
  window.localStorage.setItem(memoryKey, JSON.stringify(memory));
}

export function buildHoustonBriefing(settings: PersonalAgentSettings) {
  const { localProfile, houston } = settings;
  return [
    `Agente seleccionado en Houston: ${houston.agentName || "Asistente personal"}`,
    `Usuario: ${localProfile.name || "Sin nombre configurado"}`,
    `Objetivos: ${localProfile.goals || "Sin objetivos configurados"}`,
    `Horario y disponibilidad: ${localProfile.schedule || "Sin horario configurado"}`,
    `Preferencias de estudio: ${localProfile.preferences || "Sin preferencias configuradas"}`,
    "Reglas: no acceder a credenciales, cursos privados, archivos ni notas sin una autorización específica. Solicitar confirmación antes de enviar, guardar, descargar o modificar información."
  ].join("\n");
}