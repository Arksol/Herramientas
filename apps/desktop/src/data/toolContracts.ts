export type ToolId =
  | "resumidor"
  | "clases"
  | "ingles"
  | "tecnologia"
  | "musica"
  | "visuales"
  | "codigo"
  | "legal"
  | "matematicas"
  | "fisica"
  | "profesores";

export type ToolContract = {
  inputs: string[];
  outputs: string[];
  requiresActiveSession: boolean;
  allowedCapabilities: string[];
  confirmations: string[];
  forbiddenActions: string[];
};

export const toolContracts: Record<ToolId, ToolContract> = {
  resumidor: { inputs: ["Texto pegado", "Enlace público autorizado", "Archivo local permitido", "Imagen o vídeo local"], outputs: ["Resumen Markdown editable", "Ideas clave", "Preguntas de repaso", "Nota de Obsidian confirmada"], requiresActiveSession: true, allowedCapabilities: ["Crear plan de estudio local", "Analizar fuente", "Resumir con IA local", "Guardar o anexar en Obsidian"], confirmations: ["Guardar o anexar una nota de Obsidian", "Conservar un objetivo recurrente"], forbiddenActions: ["Leer credenciales", "Modificar notas sin confirmación", "Subir fuentes privadas por defecto"] },
  clases: { inputs: ["URL oficial", "Título de clase", "Carpeta local existente", "Transcripción o archivo autorizado"], outputs: ["Plan de recurso autorizado", "Resumen de clase", "Instrucciones de OBS confirmadas"], requiresActiveSession: true, allowedCapabilities: ["Crear plan de estudio local", "Validar plataforma y URL", "Organizar recursos propios", "Abrir OBS con doble confirmación", "Resumir fuentes autorizadas"], confirmations: ["Usar OBS", "Declarar autorización para grabar", "Confirmar que no se elude DRM ni controles de acceso", "Conservar un objetivo recurrente"], forbiddenActions: ["Descargar transmisiones protegidas", "Inspeccionar cookies o tokens", "Iniciar o detener OBS automáticamente"] },
  ingles: { inputs: ["Objetivo", "Texto o selección autorizada", "Preferencias de estudio"], outputs: ["Práctica adaptada", "Corrección explicada", "Progreso local editable"], requiresActiveSession: false, allowedCapabilities: ["Crear plan de estudio local", "Crear ejercicios", "Explicar correcciones", "Guardar progreso autorizado"], confirmations: ["Conservar preferencias o progreso", "Conservar un objetivo recurrente"], forbiddenActions: ["Enviar conversaciones a terceros por defecto", "Acceder a cuentas de cursos"] },
  tecnologia: { inputs: ["Pregunta", "Código o documento autorizado", "Nivel y objetivo"], outputs: ["Explicación", "Ejercicio", "Ruta de proyecto"], requiresActiveSession: false, allowedCapabilities: ["Crear plan de estudio local", "Explicar", "Proponer ejercicios", "Analizar archivos de texto autorizados"], confirmations: ["Conservar avance o contexto de proyecto", "Conservar un objetivo recurrente"], forbiddenActions: ["Ejecutar código desconocido", "Modificar repositorios sin confirmación"] },
  musica: { inputs: ["Objetivo musical", "Referencia autorizada", "Instrumento o nivel"], outputs: ["Plan de práctica", "Ejercicios", "Explicación musical"], requiresActiveSession: false, allowedCapabilities: ["Crear plan de estudio local", "Crear prácticas", "Explicar teoría", "Analizar texto o referencias autorizadas"], confirmations: ["Conservar metas o progreso", "Analizar audio local", "Conservar un objetivo recurrente"], forbiddenActions: ["Retener audio temporal", "Distribuir partituras o material protegido"] },
  visuales: { inputs: ["Idea", "Imagen o vídeo local autorizado", "Restricciones de estilo"], outputs: ["Prompt visual", "Variaciones", "Cambios explicados"], requiresActiveSession: false, allowedCapabilities: ["Crear plan de estudio local", "Analizar referencias locales", "Generar prompts", "Excluir secretos visibles"], confirmations: ["Conservar referencias o historial", "Conservar un objetivo recurrente"], forbiddenActions: ["Enviar referencias privadas a un generador externo por defecto"] },
  codigo: { inputs: ["Requisito", "Código o error autorizado", "Criterios de aceptación"], outputs: ["Prompt técnico", "Plan de implementación", "Pruebas propuestas"], requiresActiveSession: false, allowedCapabilities: ["Crear plan de estudio local", "Analizar texto y código", "Generar criterios", "Proponer pruebas"], confirmations: ["Conservar contexto del proyecto", "Abrir una integración externa", "Conservar un objetivo recurrente"], forbiddenActions: ["Ejecutar código", "Leer secretos", "Modificar archivos sin confirmación"] },
  legal: { inputs: ["Texto pegado", "Enlace público", "Archivo legal local de texto", "Jurisdicción de referencia"], outputs: ["Mapa de compromisos", "Riesgos para datos e identidad digital", "Preguntas para la empresa", "Recomendación condicionada"], requiresActiveSession: false, allowedCapabilities: ["Crear plan local", "Analizar lenguaje contractual", "Identificar cláusulas y riesgos", "Preparar una nota revisable"], confirmations: ["Guardar un análisis o una nota", "Usar un perfil personal para contextualizar el análisis"], forbiddenActions: ["Dar asesoría jurídica definitiva", "Presentar una conclusión como dictamen profesional", "Enviar contratos privados a terceros", "Ocultar incertidumbres o jurisdicción"] },
  matematicas: { inputs: ["Problema o pregunta", "Datos y fórmulas", "Imagen o archivo local autorizado", "Nivel de estudio"], outputs: ["Solución paso a paso", "Comprobación del resultado", "Errores frecuentes", "Ejercicios graduados"], requiresActiveSession: false, allowedCapabilities: ["Explicar conceptos", "Resolver con procedimiento visible", "Comprobar unidades y operaciones", "Crear práctica local"], confirmations: ["Conservar progreso o metas", "Guardar una nota de estudio"], forbiddenActions: ["Dar solo el resultado sin razonamiento", "Inventar datos del problema", "Modificar archivos sin confirmación"] },
  fisica: { inputs: ["Problema o pregunta", "Datos, unidades y diagrama", "Imagen o archivo local autorizado", "Nivel de estudio"], outputs: ["Modelo físico", "Desarrollo con unidades", "Comprobación dimensional", "Ejercicios graduados"], requiresActiveSession: false, allowedCapabilities: ["Identificar principios físicos", "Resolver con unidades", "Comprobar dimensiones y supuestos", "Crear práctica local"], confirmations: ["Conservar progreso o metas", "Guardar una nota de estudio"], forbiddenActions: ["Ocultar supuestos", "Inventar mediciones", "Modificar archivos sin confirmación"] },
  profesores: { inputs: ["Objetivo de aprendizaje", "Profesor especializado", "Modelo local", "Texto, imagen o archivo autorizado"], outputs: ["Profesor elegido", "Plan de trabajo", "Explicación o práctica", "Criterio de avance"], requiresActiveSession: false, allowedCapabilities: ["Listar profesores locales", "Elegir un agente especializado", "Elegir un modelo local disponible", "Crear una práctica adaptada"], confirmations: ["Conservar progreso o metas", "Guardar una nota de estudio"], forbiddenActions: ["Enviar material privado a servicios externos", "Cambiar de agente sin mostrar el modelo seleccionado", "Modificar archivos sin confirmación"] }
};
