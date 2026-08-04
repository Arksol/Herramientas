import { specialistAgents, type SpecialistAgent } from "./agentProfiles";
import { toolContracts, type ToolContract, type ToolId } from "./toolContracts";
export type { ToolId } from "./toolContracts";
export type ToolAgent = SpecialistAgent;
export type Tool = { id: ToolId; number: string; icon: string; name: string; description: string; contextual: string; agent: ToolAgent; contract: ToolContract };
export const tools: Tool[] = [
  { id: "resumidor", number: "01", icon: "AI", name: "Resumidor académico y Obsidian", description: "Convierte clases, enlaces, imágenes, vídeos y archivos autorizados en notas estructuradas.", contextual: "Resume el contenido que selecciones y prepáralo para estudiar.", agent: specialistAgents.resumidor, contract: toolContracts.resumidor },
  { id: "clases", number: "02", icon: "CL", name: "Gestor de clases", description: "Organiza materiales autorizados y prepara flujos de estudio permitidos.", contextual: "Identifica una clase autorizada y ofrece el flujo permitido.", agent: specialistAgents.clases, contract: toolContracts.clases },
  { id: "multi-profesor", number: "03", icon: "MP", name: "Multi profesor", description: "Elige entre inglés, tecnología, música, matemáticas y física con modelos locales.", contextual: "Elige una materia, un profesor y un modelo local para empezar.", agent: specialistAgents["multi-profesor"], contract: toolContracts["multi-profesor"] },
  { id: "visuales", number: "04", icon: "VI", name: "Arquitecto de prompts visuales", description: "Crea prompts para imágenes y vídeos desde referencias locales.", contextual: "Usa una referencia autorizada para crear un prompt visual.", agent: specialistAgents.visuales, contract: toolContracts.visuales },
  { id: "codigo", number: "05", icon: "</>", name: "Arquitecto de prompts de código", description: "Transforma requisitos y contexto técnico en prompts precisos.", contextual: "Usa código o documentación seleccionados sin secretos.", agent: specialistAgents.codigo, contract: toolContracts.codigo },
  { id: "legal", number: "06", icon: "LG", name: "Análisis legal", description: "Explica acuerdos, privacidad y riesgos para los datos con límites claros.", contextual: "Analiza el texto visible de un acuerdo que decidas compartir.", agent: specialistAgents.legal, contract: toolContracts.legal }
];