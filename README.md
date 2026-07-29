# Herramientas

Herramientas es una aplicación de escritorio local-first para convertir material autorizado en notas, planes de estudio y análisis revisables. Sus fuentes se procesan en el equipo de la persona; no inicia sesión en plataformas educativas, no elude controles de acceso y no envía contenido privado a servicios externos por defecto.

## Qué incluye

- Resumidor académico con exportación Markdown y guardado confirmado en Obsidian.
- Procesamiento local de texto, enlaces públicos, archivos de texto, imágenes y vídeos, con degradación cuando falte una dependencia.
- Gestor de clases para flujos autorizados, sin descargar DRM ni inspeccionar cookies o credenciales.
- Agentes para inglés C1, tecnología, música, prompts visuales, código y análisis legal.
- Extensión contextual para Chrome Dev, Firefox y Helium: burbuja movible que solo envía texto visible confirmado, con adaptador para Finanzas - Academia Eduardo Rosas.
- Análisis legal informativo de términos, políticas de privacidad y acuerdos: identifica datos, terceros, retención, identidad digital, cláusulas de licencia y preguntas antes de aceptar. No sustituye asesoría jurídica.

## IA local recomendada

El perfil está diseñado para una NVIDIA GTX 1650 Ti Max-Q de 4 GB de VRAM:

```powershell
ollama pull qwen2.5:3b-instruct
ollama pull moondream
```

`qwen2.5:3b-instruct` se usa para resúmenes, agentes y análisis legal. `moondream` analiza imágenes y fotogramas sin exigir un modelo visual grande. Para vídeos, instala también `ffmpeg` y configura Whisper local si necesitas transcribir el audio.

Ollama expone su API local en `http://127.0.0.1:11434`. La aplicación utiliza reglas locales si Ollama no está disponible.
### Licencias de modelos

Los modelos se descargan por separado y no se incluyen en este repositorio. Antes de cualquier uso comercial o redistribuci&oacute;n, verifica la licencia vigente de cada modelo. En particular, el modelo Qwen indicado por este perfil se publica con una licencia de investigaci&oacute;n no comercial en su ficha de Ollama.

## Ejecutar y verificar

```powershell
npm install
npm run dev
```

En otra consola, verifica el proyecto:

```powershell
cd apps/desktop
npm run verify
```

## Privacidad y límites

- Capturas, caché de extensión y contexto transitorio caducan a los siete días.
- Las notas de Obsidian y archivos originales no se borran automáticamente.
- El análisis legal es información general. No determina una infracción, responsabilidad o validez de un contrato; las decisiones relevantes requieren revisar el documento completo y, cuando corresponda, asesoría profesional en la jurisdicción aplicable.

Curso registrado: [Finanzas - Academia Eduardo Rosas](https://academia.eduardorosas.mx/courses/enrolled/882564).

Consulta [IA local multimodal](docs/ia-local-multimodal.md), [Análisis legal](docs/analisis-legal.md), [Seguridad](docs/seguridad.md) y [Extensión de navegador](docs/extension-navegador.md).
