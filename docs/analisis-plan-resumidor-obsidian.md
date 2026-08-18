# Análisis del plan_resumidor_obsidian.md

## Lectura aplicada

El archivo propone convertir el resumidor en una burbuja de clase que captura contenido autorizado, lo transforma en Markdown para Obsidian y evita escribir automaticamente en una boveda sin confirmacion. La idea encaja con el proyecto actual, pero se adapta asi: Herramientas conserva la integracion local segura con Obsidian y tambien ofrece salida editable, copiar Markdown y descarga `.md` para que el usuario tenga control total.

## Cambios adoptados ahora

- El Resumidor academico muestra el Markdown como editor, no como bloque fijo.
- Se agregan acciones de exportacion: copiar Markdown y descargar `.md`.
- La app mantiene guardado/anexado a Obsidian solo con confirmacion y clave local.
- El perfil de IA local para esta laptop cambia a `qwen2.5:3b-instruct-q4_K_M` con contexto 4096, adecuado para GTX 1650 Ti Max-Q de 4 GB.
- Los manifiestos de Chrome Dev, Firefox y Helium dejan de inyectarse en todo internet y se limitan a plataformas educativas objetivo.
- La documentacion de extension queda alineada con burbuja contextual, sitios autorizados y backend local loopback.

## Recomendaciones del plan integradas al rumbo

- Usar extension de navegador para paginas externas, no una web intentando controlar otros sitios.
- El plan proponia aislar la burbuja con Shadow DOM; ya quedo aplicado en el content script.
- Crear adaptadores por plataforma: Platzi, EBAC, UVM/Class y Mastermind.
- Extraer contenido por capas: transcripcion DOM, `video.textTracks`, archivos `.vtt/.srt` permitidos y pegado manual como fallback.
- Fragmentar clases largas por bloques de 6 a 8 minutos antes de resumir.
- Usar estrategia map-reduce para resumen final: resumen por bloque, union de conceptos, Markdown final.
- Guardar cache/historial local con IndexedDB y preferencias con `chrome.storage.local`.

## Diferencias intencionales

- El plan recomienda no escribir automaticamente en Obsidian. En este proyecto no se hace escritura automatica: el guardado requiere accion explicita del usuario. Por eso se conserva la integracion Obsidian, pero ya no es el unico flujo.
- El plan se centra en el resumidor de clases. Herramientas necesita que la misma IA local sirva tambien a inglés C1, tecnología, prompts visuales, prompts de codigo, extension y agentes. Por eso el pipeline queda compartido.
- El plan habla de backend/proxy para subtitulos. Aqui se mantiene la regla de loopback y allowlist; cualquier descarga de subtitulos debe validar origen, tamano y tipo.

## Faltante recomendado

- Shadow DOM real, burbuja draggable y posicion guardada ya aplicados en `content-script.js`.
- Adaptadores iniciales para Platzi, EBAC, UVM/Class y Mastermind ya aplicados; falta afinarlos contra cada DOM real cuando se prueben sesiones.
- Parser dedicado VTT/SRT ya aplicado en backend web y escritorio; faltan tests automatizados de fixtures.
- Map-reduce con Ollama local via protocolo streaming ya aplicado; falta streaming visual token-a-token en UI.
- Cache local IndexedDB ya aplicado en la extension para capturas por URL; falta una vista de historial en la app.
- Agregar selector visual de archivos en Tauri.
- Whisper local ya integrado para videos cuando `HERRAMIENTAS_WHISPER_BIN` y `HERRAMIENTAS_WHISPER_MODEL` estan configurados.
- Agregar sanitizacion Markdown/HTML si se renderiza Markdown enriquecido en lugar de textarea.

## Prioridad sugerida

1. Probar adaptadores contra sesiones reales de Platzi, EBAC, UVM/Class y Mastermind.
2. Agregar vista de historial/cache dentro de la app.
3. Agregar streaming visual token-a-token en la UI.
4. Agregar selector visual de archivos en Tauri.
5. Agregar fixtures y tests automatizados VTT/SRT.
