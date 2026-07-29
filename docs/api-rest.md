# API local

La API se ejecuta exclusivamente en `http://127.0.0.1:3030` durante desarrollo. Las rutas que procesan material académico requieren una sesión local activa.

## Contratos y auditoría

- `GET /api/tools/contracts`: devuelve acciones y tipos de fuente permitidos por herramienta.
- `POST /api/tools/validate-action`: valida una acción confirmada contra la política local.
- `GET /api/audit/recent`: muestra metadatos de auditoría temporal, sin contenido de clase ni credenciales.
- `POST /api/agents/plan`: valida la pareja agente-herramienta, genera un plan local y usa Ollama solo si está disponible.

## Clases

- `POST /api/classes/plan`: recibe plataforma, título, URL HTTPS, carpeta existente y dos confirmaciones de grabación. Devuelve un flujo de descarga oficial o estudio contextual; no descarga ni graba.

## Contexto y resumen

- `POST /api/context/inspect`: recibe una selección consentida desde la extensión y la conserva hasta siete días.
- `POST /api/summarizer/analyze`: normaliza texto, enlaces y archivos de texto autorizados.
- `POST /api/summarizer/generate`: genera una nota Markdown mediante Ollama local o un respaldo extractivo local.

## Obsidian

- `GET /api/obsidian/status`
- `POST /api/obsidian/configure`
- `POST /api/obsidian/test`
- `POST /api/obsidian/save`
- `POST /api/obsidian/append`

Las operaciones de Obsidian requieren sesión activa y una clave local configurada para la misma bóveda.