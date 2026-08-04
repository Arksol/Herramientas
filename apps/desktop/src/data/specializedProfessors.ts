import { specialistAgents, type SpecialistAgent } from "./agentProfiles";
import type { ToolId } from "./toolContracts";

export type LocalModelOption = {
  id: string;
  name: string;
  size: string;
  purpose: string;
  recommendedFor: ToolId[];
  command: string;
  licenseNote: string;
};

export const localModelCatalog: LocalModelOption[] = [
  { id: "qwen2.5:3b", name: "Qwen 2.5 3B", size: "1.9 GB", purpose: "Profesor general, español, resúmenes y práctica", recommendedFor: ["ingles", "tecnologia", "musica", "matematicas", "fisica", "profesores"], command: "ollama pull qwen2.5:3b", licenseNote: "Revisa la licencia Qwen del modelo 3B antes de redistribuirlo." },
  { id: "deepseek-r1:1.5b", name: "DeepSeek-R1 1.5B", size: "1.1 GB", purpose: "Razonamiento ligero para matemáticas y física", recommendedFor: ["matematicas", "fisica", "profesores"], command: "ollama pull deepseek-r1:1.5b", licenseNote: "La ficha oficial de Ollama indica licencia MIT para la serie; revisa también la licencia del modelo base destilado." },
  { id: "qwen3:4b", name: "Qwen 3 4B", size: "2.5 GB", purpose: "Alternativa con mejor razonamiento y contexto", recommendedFor: ["ingles", "tecnologia", "musica", "matematicas", "fisica", "profesores"], command: "ollama pull qwen3:4b", licenseNote: "Confirma los términos del modelo antes de distribuir una aplicación con él." }
];

export type ProfessorOption = {
  id: string;
  toolId: ToolId;
  name: string;
  role: string;
  specialties: string[];
  agent: SpecialistAgent;
};

export const professorOptions: ProfessorOption[] = [
  { id: specialistAgents.ingles.id, toolId: "ingles", name: specialistAgents.ingles.name, role: specialistAgents.ingles.role, specialties: specialistAgents.ingles.specialties, agent: specialistAgents.ingles },
  { id: specialistAgents.tecnologia.id, toolId: "tecnologia", name: specialistAgents.tecnologia.name, role: specialistAgents.tecnologia.role, specialties: specialistAgents.tecnologia.specialties, agent: specialistAgents.tecnologia },
  { id: specialistAgents.musica.id, toolId: "musica", name: specialistAgents.musica.name, role: specialistAgents.musica.role, specialties: specialistAgents.musica.specialties, agent: specialistAgents.musica },
  { id: specialistAgents.matematicas.id, toolId: "matematicas", name: specialistAgents.matematicas.name, role: specialistAgents.matematicas.role, specialties: specialistAgents.matematicas.specialties, agent: specialistAgents.matematicas },
  { id: specialistAgents.fisica.id, toolId: "fisica", name: specialistAgents.fisica.name, role: specialistAgents.fisica.role, specialties: specialistAgents.fisica.specialties, agent: specialistAgents.fisica }
];

export function modelsForProfessor(toolId: ToolId) {
  return localModelCatalog.filter((model) => model.recommendedFor.includes(toolId));
}