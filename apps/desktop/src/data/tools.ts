import { specialistAgents, type SpecialistAgent } from "./agentProfiles";
import { toolContracts, type ToolContract, type ToolId } from "./toolContracts";

export type { ToolId } from "./toolContracts";
export type ToolAgent = SpecialistAgent;

export type Tool = { id: ToolId; number: string; icon: string; name: string; description: string; contextual: string; agent: ToolAgent; contract: ToolContract; protected?: boolean };

export const tools: Tool[] = [
  { id: "resumidor", number: "01", icon: "AI", name: "Resumidor académico y Obsidian", description: "Convierte clases, enlaces, imágenes, vídeos y archivos en notas estructuradas para tu bóveda.", contextual: "Resume el contenido que selecciones y prepáralo para Obsidian.", protected: true, agent: specialistAgents.resumidor, contract: toolContracts.resumidor },
  { id: "clases", number: "02", icon: "DL", name: "Gestor de clases", description: "Organiza materiales autorizados y prepara flujos de descarga oficial o grabación confirmada.", contextual: "Identifica una clase autorizada y ofrece el flujo permitido.", protected: true, agent: specialistAgents.clases, contract: toolContracts.clases },
  { id: "ingles", number: "03", icon: "EN", name: "Profesor de inglés C1", description: "Practica con intereses, archivos y explicaciones adaptadas.", contextual: "Convierte una selección en una práctica personalizada.", agent: specialistAgents.ingles, contract: toolContracts.ingles },
  { id: "tecnologia", number: "04", icon: "IT", name: "Profesor integral de tecnología", description: "Aprende con explicaciones, ejercicios, ejemplos y análisis de archivos locales.", contextual: "Explica contenido técnico que hayas seleccionado.", agent: specialistAgents.tecnologia, contract: toolContracts.tecnologia },
  { id: "musica", number: "05", icon: "MU", name: "Profesor de música", description: "Estudia teoría, instrumento, composición, oído y práctica musical con un plan adaptable.", contextual: "Convierte una referencia, partitura o selección en una práctica musical.", agent: specialistAgents.musica, contract: toolContracts.musica },
  { id: "visuales", number: "06", icon: "VI", name: "Arquitecto de prompts visuales", description: "Crea prompts para imágenes y vídeos a partir de referencias locales.", contextual: "Usa imágenes o vídeos seleccionados como referencia.", agent: specialistAgents.visuales, contract: toolContracts.visuales },
  { id: "codigo", number: "07", icon: "</>", name: "Arquitecto de prompts de código", description: "Transforma requisitos, contexto técnico y archivos en prompts precisos.", contextual: "Usa código o documentación seleccionados sin secretos.", agent: specialistAgents.codigo, contract: toolContracts.codigo },
  { id: "legal", number: "08", icon: "LG", name: "Análisis legal", description: "Explica acuerdos, privacidad y riesgos para los datos con límites claros y una recomendación condicionada.", contextual: "Analiza el texto visible de un acuerdo que decidas compartir.", agent: specialistAgents.legal, contract: toolContracts.legal }
];
