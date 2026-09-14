# IA local multimodal

## Objetivo

Agregar una capa de IA local que mejore los resumenes de Obsidian y pueda reutilizarse en las seis herramientas sin enviar contenido privado a la nube.

## Hardware objetivo

```text
NVIDIA GeForce GTX 1650 Ti with Max-Q Design - 4 GB VRAM aprox.
Intel Iris Xe Graphics - 1 GB compartido aprox.
```

La configuracion debe asumir VRAM limitada. El sistema debe preferir modelos pequenos, cuantizados y con degradacion limpia a CPU cuando una tarea multimodal no quepa en GPU.

## Perfiles recomendados

| Uso | Perfil | Motivo |
| --- | --- | --- |
| Resumen, tutor, prompts y codigo | `qwen2.5:3b-instruct-q4_K_M` | Buen equilibrio para 4 GB de VRAM; `qwen2.5:7b-instruct-q4_K_M` queda como opcion si la memoria lo permite. |
| Imagenes | Modelo vision ligero cuantizado | Analisis de capturas, diagramas, diapositivas y referencias visuales. |
| Videos | Whisper base/small + fotogramas | Evita cargar video completo en el modelo; resume transcripcion y escenas clave. |
| Links | Extractor local HTML/Reader + modelo de texto | Limpia navegacion, menus y anuncios antes del resumen. |
| Archivos | Parsers locales por tipo | Convierte PDF, texto, Markdown, docx o codigo a texto seguro. |

## Flujo por fuente

```text
Fuente autorizada
  -> Validacion local de tipo, tamano y ruta
  -> Extraccion local segura
  -> Mascarado de secretos cuando aplique
  -> Fragmentacion por contexto o bloques de 6 a 8 minutos en clases largas
  -> Analisis map-reduce con modelo local cuando la fuente sea larga
  -> Resumen editable
  -> Guardado confirmado en Obsidian o uso en otra herramienta
```

## Uso por herramienta

- Resumidor academico: convierte texto, links, imagenes, videos y archivos en notas Markdown para Obsidian.
- Descarga de clases: resume transcripciones y archivos autorizados; no elude DRM ni protecciones.
- Profesor de ingles C1: genera ejercicios desde intereses, archivos y conversaciones locales.
- Profesor integral de tecnologia: explica codigo, diagramas, logs y capturas.
- Arquitecto de prompts visuales: analiza referencias visuales locales para producir prompts.
- Arquitecto de prompts de codigo: analiza estructura, errores y documentos excluyendo secretos.

## Controles

- Solo loopback: Ollama en `127.0.0.1:11434`.
- Sin subida automatica a servicios externos.
- Limites por tamano, tipo y cantidad de archivos.
- Confirmacion antes de guardar, descargar, abrir OBS o modificar archivos.
- Los documentos, paginas e imagenes se tratan como datos no confiables.
- Las acciones del modelo no ejecutan comandos ni escriben archivos sin capa de autorizacion.

## Estado actual

La app ya ejecuta un primer pipeline multimodal local desde el Resumidor academico:

- Texto: se normaliza y resume localmente.
- Links: se descargan desde este equipo, se limpia el HTML y se resume el texto resultante.
- Archivos: se leen rutas locales de texto, Markdown, codigo, csv, json, html, srt y vtt con limite de 2 MB.
- Imagenes: se analizan por ruta local con Ollama vision en `127.0.0.1:11434` usando el modelo configurado en `HERRAMIENTAS_VISION_MODEL` o `llava:7b-v1.6-mistral-q4_K_M` por defecto.
- Videos: se extraen hasta 4 fotogramas con `ffmpeg`, luego se analizan con Ollama vision y se resume la descripcion combinada.

Requisitos para imagenes y videos:

- Ollama activo en `127.0.0.1:11434`.
- Un modelo de vision local instalado. En esta laptop conviene preferir modelos cuantizados o ligeros por el limite de 4 GB de VRAM.
- `ffmpeg` disponible en PATH para videos.

Pendiente para una version posterior: selector visual de archivos, streaming visual token-a-token en la UI, vista de historial/cache y lectura avanzada de PDF/DOCX con parsers especificos. El parser VTT/SRT, Whisper local configurable y map-reduce con Ollama ya estan integrados.

## Uso por agentes

El pipeline multimodal queda como herramienta compartida para agentes. Ningun agente recibe archivos crudos sin validacion previa.

- Agente de Sintesis Academica: usa texto normalizado para crear notas Obsidian.
- Agente de Recursos Autorizados: usa metadatos y transcripciones de archivos propios para organizar clases.
- Agente Tutor C1: usa archivos y conversaciones locales para generar practica adaptada.
- Agente Tutor Tecnico: usa codigo, capturas, logs y diagramas para explicar y crear ejercicios.
- Agente Visual Prompt Architect: usa imagenes y fotogramas para construir prompts visuales.
- Agente Code Prompt Architect: usa estructura, errores y documentacion despues de excluir secretos.

La salida del pipeline debe indicar fuente, tipo, si uso IA local y limitaciones observadas para que el agente pueda distinguir hechos de inferencias.
## Estrategia recomendada para clases largas

- Dividir transcripciones por bloques de 6 a 8 minutos o por cambios de tema detectados.
- Resumir cada bloque con `qwen2.5:3b-instruct-q4_K_M` y `num_ctx` 4096.
- Unir los bloques en un resumen final con secciones: idea central, conceptos clave, pasos, dudas, ejemplos y tareas.
- Mantener citas temporales cuando existan timestamps VTT/SRT.
- Si la clase supera el contexto, guardar resultados intermedios localmente y no enviar texto crudo fuera del equipo.


## Configuracion local de Whisper

Para videos locales, Herramientas intenta usar Whisper cuando estas variables existen:

```text
HERRAMIENTAS_WHISPER_BIN=whisper-cli
HERRAMIENTAS_WHISPER_MODEL=C:\modelos\whisper\ggml-base.bin
```

Si Whisper no esta configurado, la app conserva el flujo local con fotogramas via ffmpeg y Ollama vision. Para tu laptop se recomienda `base` o `small` antes de probar modelos mayores.
