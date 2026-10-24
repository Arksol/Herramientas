# Herramientas — guía para agentes

Espacio local-first que reúne agentes especializados para leer documentos,
estudiar, trabajar con código y organizar conocimiento en Obsidian. Producto y
marca en `PRODUCT.md`; decisiones en `docs/`.

## Partes del repositorio

| Ruta | Qué es | Stack |
|---|---|---|
| `apps/desktop/` | Aplicación principal (web local) | React + TypeScript + Vite · servicio Node/Express · SQLite |
| `apps/browser-extension/` | Extensión para Chrome, Firefox y Helium | JS vanilla, build propio |
| `index.html`, `pages/`, `assets/`, `data/` | Sitio público complementario (Vercel) | HTML, CSS y JS modular |
| `docs/` | Definición, arquitectura de agentes, seguridad, API | — |

## Comandos (desde `apps/desktop/`)

```bash
npm install
npm run service        # servicio local en 127.0.0.1 (necesita .env, ver README)
npm run dev            # interfaz
npm run build          # tsc -b && vite build
npm test               # node --test service/*.test.mjs
npm run extension:build
```

## Estructura del frontend (`apps/desktop/src/`)

```
api/          llamadas al servicio local (classes, session, summarizer, localAi)
components/   paneles de interfaz
data/         catálogo de herramientas (tools.ts)
App.tsx       vista principal
```

Una llamada nueva al servicio va en `api/`; un panel nuevo, en `components/`;
lógica de estado reutilizable, en `hooks/`.

## Seguridad

- Las claves de servicios de pago viven en el servicio local o en el backend,
  **nunca** en el frontend.
- No se versionan `.env`, `.auth.local.json`, `.users.local.json`,
  `.obsidian.local.json` ni las bases `data/*.sqlite`.
- El servicio escucha solo en loopback. Los archivos del usuario no salen a
  servicios externos.
- OBS solo se abre; la grabación la inicia y detiene la persona.
- "Herramientas de 3ros" está limitada a cuentas autorizadas.

## Estilo

- Español en interfaz, comentarios y commits.
- Identidad oscura, editorial y técnica; iconos consistentes (`PRODUCT.md`).
- El lector se llama "Lector general" y lee el texto literalmente.
- Modelo local principal: `qwen2.5:3b-instruct-q4_K_M`.
- Cambios en `service/` llevan su prueba `*.test.mjs`.
