# Herramientas Desktop

Base local de la aplicación de escritorio de **Herramientas**.

## Desarrollo de la interfaz

```bash
npm install
npm run dev
```

## Compilación web local

```bash
npm run build
```

## Aplicación de escritorio

La estructura de Tauri v2 está en `src-tauri/`. Para ejecutar o generar un instalador se requiere tener Rust/Cargo y los requisitos de Tauri instalados en el equipo.

```bash
npm run tauri dev
npm run tauri build
```

Los modelos locales, Obsidian, OBS Studio, la extensión contextual y Vercel se conectarán en etapas posteriores. Esta base no transmite archivos ni datos a servicios externos.
## Servicio local y acceso protegido

En desarrollo, copia `.env.example` como `.env`, genera el hash con `npm run access-hash -- "tu-código"` y ejecuta `npm run service`. La aplicación de escritorio instalada no depende de ese proceso: configura el código una sola vez desde la primera herramienta protegida y Tauri guarda únicamente su hash en el directorio local de datos de la aplicación.
## Resumidor académico inicial

La primera herramienta protegida ya resume texto pegado de forma local y no requiere Ollama ni conexión a internet. El guardado en Obsidian aparece como una integración pendiente: se habilitará cuando se configure una API local autorizada y el selector de bóveda, nota y destino.
## Conectar Obsidian

1. Reinicia Obsidian después de instalar el complemento **Local REST API with MCP** en la bóveda deseada.
2. Abre los ajustes del complemento y copia su clave de API local.
3. En el Resumidor académico, pega la clave una sola vez en **Conectar Obsidian**.
4. Genera un resumen e indica una ruta relativa, por ejemplo `Resúmenes/Clase 1.md`.

La clave se almacena en el Administrador de credenciales de Windows; no se añade a `.env`, Git ni a una nota.