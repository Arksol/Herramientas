export type ToolId =
  | "resumidor"
  | "clases"
  | "ingles"
  | "tecnologia"
  | "visuales"
  | "codigo"
  | "lector";

export type ToolAgent = {
  id: string;
  name: string;
  role: string;
  modelProfile: string;
  memoryScope: string;
};

export type Tool = {
  id: ToolId;
  number: string;
  icon: "synthesis" | "download" | "language" | "technology" | "visual" | "code" | "reader";
  name: string;
  description: string;
  contextual: string;
  agent: ToolAgent;
  protected?: boolean;
};

export const tools: Tool[] = [
  {
    id: "resumidor",
    number: "01",
    icon: "synthesis",
    name: "Resumidor academico y Obsidian",
    description: "Convierte clases, links, imagenes, videos y archivos en notas estructuradas para tu boveda.",
    contextual: "Resume el contenido que selecciones y preparalo para Obsidian.",
    protected: true,
    agent: {
      id: "academic-synthesis-agent",
      name: "Agente de Sintesis Academica",
      role: "Extrae contexto, resume, estructura Markdown y coordina el guardado confirmado en Obsidian.",
      modelProfile: "Texto 3B/4B cuantizado + vision local cuando haya imagenes o video.",
      memoryScope: "Preferencias de notas, rutas autorizadas y formato de resumen."
    }
  },
  {
    id: "clases",
    number: "02",
    icon: "download",
    name: "Descarga de clases",
    description: "Gestiona materiales autorizados y prepara grabaciones visibles con OBS.",
    contextual: "Identifica una clase autorizada y ofrece el flujo permitido.",
    protected: true,
    agent: {
      id: "authorized-resources-agent",
      name: "Agente de Recursos Autorizados",
      role: "Distingue descargas oficiales, organiza materiales y prepara OBS solo con permiso explicito.",
      modelProfile: "Texto ligero para clasificacion, nombres y notas; vision/video solo sobre archivos propios.",
      memoryScope: "Plataformas, carpetas autorizadas, convenciones de nombres y estado de recursos."
    }
  },
  {
    id: "ingles",
    number: "03",
    icon: "language",
    name: "Profesor de ingles C1",
    description: "Practica con memoria local, intereses, archivos y explicaciones adaptadas.",
    contextual: "Convierte una seleccion en una practica personalizada.",
    agent: {
      id: "english-c1-tutor-agent",
      name: "Agente Tutor C1",
      role: "Diagnostica nivel, crea practica adaptada y registra progreso local editable.",
      modelProfile: "Texto 3B/4B instruct; voz/transcripcion local en fase posterior.",
      memoryScope: "Nivel, objetivos, intereses, vocabulario, errores recurrentes y progreso."
    }
  },
  {
    id: "tecnologia",
    number: "04",
    icon: "technology",
    name: "Profesor integral de tecnologia",
    description: "Aprende con explicaciones, ejercicios, ejemplos y analisis de archivos locales.",
    contextual: "Explica contenido tecnico que hayas seleccionado.",
    agent: {
      id: "technical-tutor-agent",
      name: "Agente Tutor Tecnico",
      role: "Explica conceptos, crea ejercicios, revisa respuestas y conecta temas con proyectos.",
      modelProfile: "Texto/codigo local cuantizado; embeddings locales para rutas de estudio.",
      memoryScope: "Temas dominados, rutas de aprendizaje, ejercicios, proyectos y dudas recurrentes."
    }
  },
  {
    id: "visuales",
    number: "05",
    icon: "visual",
    name: "Arquitecto de prompts visuales",
    description: "Crea prompts para imagenes y videos a partir de referencias locales.",
    contextual: "Usa imagenes o videos seleccionados como referencia.",
    agent: {
      id: "visual-prompt-agent",
      name: "Agente Visual Prompt Architect",
      role: "Analiza composicion, estilo, luz y objetos para producir prompts visuales precisos.",
      modelProfile: "Ollama vision cuantizado + texto 3B/4B para redaccion y variaciones.",
      memoryScope: "Estilos preferidos, plataformas objetivo, parametros y prompts previos."
    }
  },
  {
    id: "codigo",
    number: "06",
    icon: "code",
    name: "Arquitecto de prompts de codigo",
    description: "Transforma requisitos, contexto tecnico y archivos en prompts precisos.",
    contextual: "Usa codigo o documentacion seleccionados sin secretos.",
    agent: {
      id: "code-prompt-agent",
      name: "Agente Code Prompt Architect",
      role: "Analiza requisitos, errores y estructura para crear prompts tecnicos seguros y verificables.",
      modelProfile: "Modelo local de codigo; ClawCode candidato para orquestacion futura.",
      memoryScope: "Stacks preferidos, reglas de seguridad, formato de prompts y criterios de aceptacion."
    }
  },
  {
    id: "lector",
    number: "07",
    icon: "reader",
    name: "Lector general",
    description: "Lee libros, documentos, páginas web y PDFs literalmente con voz local.",
    contextual: "Lee en voz alta el contenido que selecciones, sin resumirlo ni alterarlo.",
    agent: {
      id: "file-reader-agent",
      name: "Agente Lector General",
      role: "Extrae texto de archivos locales y páginas autorizadas para leerlo literalmente sin enviarlo fuera del equipo.",
      modelProfile: "qwen2.5:3b-instruct-q4_K_M",
      memoryScope: "Solo la lectura actual; no conserva el contenido del archivo."
    }
  }
];
