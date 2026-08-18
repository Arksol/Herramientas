# Incidencias del paso 9

Este registro prepara las incidencias que se publicar&aacute;n en GitHub cuando se renueve la autenticaci&oacute;n de la cuenta.

## Corregidas

### La burbuja no abr&iacute;a el contenido seleccionado en la herramienta

- **Causa:** la extensi&oacute;n enviaba el contexto al servicio local, pero no conservaba el identificador ni constru&iacute;a una URL hacia la herramienta solicitada.
- **Correcci&oacute;n:** el `service_worker` guarda el identificador temporal y abre `Herramientas` con `tool` y `context`. La aplicaci&oacute;n recupera el texto local tras la sesi&oacute;n y lo precarga en Resumidor o An&aacute;lisis legal.
- **Cobertura:** el verificador est&aacute;tico de la extensi&oacute;n comprueba el almacenamiento del contexto y el enrutamiento.

### La burbuja fallaba en Firefox

- **Causa:** el script de contenido asum&iacute;a la API de callbacks de Chromium aunque Firefox usa `browser.runtime.sendMessage` basado en promesas.
- **Correcci&oacute;n:** se detecta `globalThis.browser` y se espera la promesa; Chromium conserva la ruta de callback.

### Selector de archivo deshabilitado en el resumidor

- **Causa:** la interfaz solo mostraba un control pendiente.
- **Correcci&oacute;n:** se incorpor&oacute; un selector local para texto, Markdown, CSV, JSON, c&oacute;digo, VTT y SRT; el contenido se queda en la vista hasta procesarlo.

## Abierta

### Rendimiento lento de Qwen 3B en la GTX 1650 Ti Max-Q

- **Severidad:** media.
- **Reproducci&oacute;n:** con `qwen2.5:3b-instruct` cargado por Ollama, una prueba breve produjo aproximadamente 0.5 tokens por segundo aunque el modelo ocup&oacute; cerca de 2 GB de VRAM.
- **Impacto:** los res&uacute;menes largos pueden tardar demasiado para un flujo cotidiano.
- **Siguiente acci&oacute;n:** medir con el equipo conectado a corriente y el proceso configurado en Windows para GPU de alto rendimiento; comparar con `qwen2.5:1.5b` como perfil r&aacute;pido sin reemplazar el perfil 3B de calidad.
