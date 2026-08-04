import { specialistAgents, type SpecialistAgent } from "./agentProfiles";
export type LocalModelOption = { id: string; name: string; size: string; purpose: string; recommendedFor: string[]; command: string; licenseNote: string };
export type ProfessorOption = { id: string; subject: "ingles" | "tecnologia" | "musica" | "matematicas" | "fisica"; name: string; role: string; specialties: string[]; agent: SpecialistAgent };
export const localModelCatalog: LocalModelOption[] = [
  { id: "qwen2.5:3b-instruct", name: "Qwen 2.5 3B Instruct", size: "1.9 GB", purpose: "Explicación general en español, inglés, tecnología y música", recommendedFor: ["ingles", "tecnologia", "musica", "matematicas", "fisica"], command: "ollama pull qwen2.5:3b-instruct", licenseNote: "Revisa la licencia de Qwen antes de redistribuirlo." },
  { id: "deepseek-r1:1.5b", name: "DeepSeek-R1 1.5B", size: "1.1 GB", purpose: "Razonamiento ligero para matemáticas y física", recommendedFor: ["matematicas", "fisica"], command: "ollama pull deepseek-r1:1.5b", licenseNote: "Revisa la ficha y la licencia del modelo base." },
  { id: "qwen3:4b", name: "Qwen3 4B", size: "2.5 GB", purpose: "Alternativa con más razonamiento y contexto", recommendedFor: ["ingles", "tecnologia", "musica", "matematicas", "fisica"], command: "ollama pull qwen3:4b", licenseNote: "Confirma los términos del modelo antes de distribuirlo." }
];
export const professorOptions: ProfessorOption[] = [
  { id: specialistAgents.ingles.id, subject: "ingles", name: specialistAgents.ingles.name, role: specialistAgents.ingles.role, specialties: specialistAgents.ingles.specialties, agent: specialistAgents.ingles },
  { id: specialistAgents.tecnologia.id, subject: "tecnologia", name: specialistAgents.tecnologia.name, role: specialistAgents.tecnologia.role, specialties: specialistAgents.tecnologia.specialties, agent: specialistAgents.tecnologia },
  { id: specialistAgents.musica.id, subject: "musica", name: specialistAgents.musica.name, role: specialistAgents.musica.role, specialties: specialistAgents.musica.specialties, agent: specialistAgents.musica },
  { id: specialistAgents.matematicas.id, subject: "matematicas", name: specialistAgents.matematicas.name, role: specialistAgents.matematicas.role, specialties: specialistAgents.matematicas.specialties, agent: specialistAgents.matematicas },
  { id: specialistAgents.fisica.id, subject: "fisica", name: specialistAgents.fisica.name, role: specialistAgents.fisica.role, specialties: specialistAgents.fisica.specialties, agent: specialistAgents.fisica }
];
export function modelsForProfessor(subject: ProfessorOption["subject"]) { return localModelCatalog.filter((model) => model.recommendedFor.includes(subject)); }