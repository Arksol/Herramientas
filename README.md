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

Consulta [Profesores especializados locales](docs/profesores-locales.md), [IA local multimodal](docs/ia-local-multimodal.md), [Análisis legal](docs/analisis-legal.md), [Seguridad](docs/seguridad.md) y [Extensión de navegador](docs/extension-navegador.md).
## Instalar y conectar Ollama en Windows

Esta configuración está pensada para el uso personal en tu laptop con NVIDIA GTX 1650 Ti Max-Q de 4 GB. Ollama se ejecuta localmente: la aplicación de escritorio y la versión web local consultan `http://127.0.0.1:11434` sin enviar el material a un proveedor externo por defecto.

1. Instala Ollama desde la [página oficial para Windows](https://ollama.com/download/windows). La aplicación queda ejecutándose en segundo plano.
2. Abre PowerShell y confirma la instalación:

```powershell
ollama --version
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

3. Descarga los modelos ligeros recomendados:

```powershell
ollama pull qwen2.5:3b-instruct
ollama pull deepseek-r1:1.5b
ollama pull moondream
```

`qwen2.5:3b-instruct` es el modelo general para resúmenes, agentes y análisis legal; `deepseek-r1:1.5b` es una alternativa ligera para razonamiento matemático y físico; `moondream` se reserva para imágenes y fotogramas. Descarga solamente los modelos que vayas a usar.

4. Inicia la aplicación local:

```powershell
npm install
npm run dev
```

Abre `http://localhost:1420`. El servicio local se inicia en `http://127.0.0.1:3030` y consulta Ollama en `http://127.0.0.1:11434`. La aplicación de escritorio usa esos mismos servicios locales. Si el icono de Ollama no está activo, ejecuta `ollama serve` en otra consola y vuelve a comprobar `/api/tags`.

Para cambiar el modelo de texto o el endpoint local antes de iniciar el servicio:

```powershell
$env:HERRAMIENTAS_TEXT_MODEL = "qwen2.5:3b-instruct"
$env:HERRAMIENTAS_OLLAMA_ENDPOINT = "http://127.0.0.1:11434"
npm --prefix apps/desktop run service
```

La URL pública de Vercel sirve la interfaz web y la burbuja contextual, pero no puede acceder directamente al Ollama instalado en tu equipo desde Internet. Para usar resúmenes y agentes con tus modelos locales, abre la versión local (http://localhost:1420) o la aplicación de escritorio. No publiques el puerto de Ollama.

### Solución rápida de problemas con Ollama

- `ollama --version` falla: reinicia la terminal después de instalar Ollama o abre la aplicación desde el menú Inicio.
- `/api/tags` no responde: inicia Ollama o ejecuta `ollama serve`; revisa que el puerto `11434` no esté ocupado.
- Un modelo aparece como no instalado: ejecuta exactamente su comando `ollama pull` y revisa `ollama list`.
- La aplicación muestra “servicio local desconectado”: verifica que estén activos los puertos `1420`, `3030` y `11434`, y vuelve a cargar la aplicación.
- En Windows, los registros de Ollama suelen estar en `%LOCALAPPDATA%\Ollama`; no borres esa carpeta si quieres conservar los modelos.

Consulta la [documentación oficial de la API local de Ollama](https://docs.ollama.com/api/introduction) y la [documentación oficial de Windows](https://docs.ollama.com/windows) para cambios del instalador o del servicio.

## Accesos y Multi profesor

La aplicación tiene dos modos locales:

- **Invitado temporal:** puede usar todas las herramientas durante una sesión de una hora. Sus fuentes, planes y resultados no se guardan; tampoco puede crear herramientas ni configurar Obsidian.
- **Administrador:** se abre con el código local ya configurado. No tiene límite de tiempo dentro de la aplicación y puede guardar su perfil, borradores de herramientas y notas de Obsidian de forma explícita.

El catálogo docente se unificó en **Multi profesor**. Desde una sola herramienta se selecciona Inglés C1, Tecnología, Música, Matemáticas o Física, además del modelo local compatible de Ollama. Los modelos sugeridos se ejecutan localmente y se conservan los límites de privacidad del proyecto.