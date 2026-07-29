# IA local multimodal

## Objetivo

Procesar material autorizado en el equipo local para crear resúmenes, planes y notas de Obsidian sin subir fuentes privadas por defecto.

## Perfil de hardware

- NVIDIA GeForce GTX 1650 Ti Max-Q: aproximadamente 4 GB de VRAM.
- Intel Iris Xe Graphics: aproximadamente 1 GB compartido.

La aplicación prioriza modelos pequeños y cuantizados. Si la VRAM no alcanza, Ollama puede usar CPU; la interfaz conserva una ruta de reglas locales cuando el modelo no está disponible.

| Uso | Modelo o componente | Motivo |
| --- | --- | --- |
| Resúmenes, agentes y análisis legal | `qwen2.5:3b-instruct` | Modelo multilingüe ligero para texto y razonamiento estructurado. |
| Imágenes y fotogramas | `moondream` | Modelo de visión de 1.8B, más razonable para 4 GB de VRAM. |
| Vídeos | Whisper local + `ffmpeg` + fotogramas | Transcribe el audio y evita cargar el vídeo completo en un modelo. |
| Enlaces | Extractor HTML local | Limpia navegación y contenido superfluo antes de resumir. |
| Archivos | Parsers locales por tipo | Admite texto, Markdown, código, CSV, JSON, HTML, VTT y SRT. |

## Flujo

```text
Fuente autorizada
  -> Validación local de tipo, tamaño y ruta
  -> Extracción o transcripción local
  -> Protección frente a instrucciones no confiables
  -> Fragmentación para fuentes extensas
  -> Resumen map-reduce con Ollama en streaming
  -> Nota Markdown editable
  -> Guardado confirmado en Obsidian o uso por un agente
```

## Capacidades actuales

- Texto y VTT/SRT: normalización y resumen local.
- Enlaces públicos: descarga y limpieza local del HTML. Los cursos privados se usan mediante texto visible que la persona confirma desde su sesión legítima.
- Archivos de texto: ruta local o selector de archivo para formatos de texto compatibles, con límite de 2 MB en la interfaz.
- Imágenes: análisis por ruta local mediante Ollama Vision.
- Vídeos: Whisper local cuando está configurado; si no, `ffmpeg` extrae hasta cuatro fotogramas y Ollama Vision los describe.
- Resúmenes largos: fragmentación, resumen parcial y reducción final con salida de Ollama por streaming.

## Instalación

```powershell
ollama pull qwen2.5:3b-instruct
ollama pull moondream
```

Para transcripción local instala `whisper.cpp` y configura:

```text
HERRAMIENTAS_WHISPER_BIN=whisper-cli
HERRAMIENTAS_WHISPER_MODEL=C:\modelos\whisper\ggml-base.bin
```

`ffmpeg` puede estar en `PATH`; la aplicación de escritorio también busca la instalación local de Winget. En este equipo conviene comenzar con Whisper `base`; `small` puede ser más preciso pero tardará más.

## Licencias de los modelos

Los modelos se descargan por separado y no se distribuyen con el proyecto. Verifica la licencia vigente antes de uso comercial o redistribuci&oacute;n. La ficha actual de qwen2.5:3b-instruct en Ollama indica una licencia de investigaci&oacute;n no comercial.

## Seguridad

- Ollama solo se consulta mediante loopback en `127.0.0.1:11434`.
- Las fuentes se tratan como contenido no confiable: no pueden ordenar acciones, solicitar credenciales ni escribir archivos.
- Ningún agente ejecuta comandos ni guarda en Obsidian sin confirmación.
- El contexto temporal y la caché local vencen a los siete días; los archivos originales no se eliminan.
