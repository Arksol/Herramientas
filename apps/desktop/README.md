# Herramientas Web Local

Aplicación web local de **Herramientas** construida con React, TypeScript y Vite.

## Desarrollo de la interfaz

```bash
npm install
npm run dev
```

## Compilación web local

```bash
npm run build
```

## Estado de escritorio

La aplicación se ejecuta actualmente como web local con React + Vite y se comunica con el servicio Node/Express en loopback. El contenedor Rust/Tauri fue retirado para mantener el stack web definido.

### Paso pendiente

Investigar y elegir una estrategia para construir una aplicación de escritorio sin Rust/Tauri, conservando React + Vite, Node/Express, SQLite, la lectura de archivos, Ollama y las integraciones autorizadas. Hasta completar ese diseño no se genera un instalador nativo.
## Servicio local y acceso protegido

En desarrollo, copia `.env.example` como `.env`, genera el hash con `npm run access-hash -- "tu-código"`, ejecuta `npm run service` y, en otra terminal, `npm run dev`.
## Resumidor académico inicial

La primera herramienta protegida ya resume texto pegado de forma local y no requiere Ollama ni conexión a internet. El guardado en Obsidian aparece como una integración pendiente: se habilitará cuando se configure una API local autorizada y el selector de bóveda, nota y destino.
## Conectar Obsidian

1. Reinicia Obsidian después de instalar el complemento **Local REST API with MCP** en la bóveda deseada.
2. Abre los ajustes del complemento y copia su clave de API local.
3. En el Resumidor académico, pega la clave una sola vez en **Conectar Obsidian**.
4. Genera un resumen e indica una ruta relativa, por ejemplo `Resúmenes/Clase 1.md`.

La clave se almacena en el servicio local; no se añade a `.env`, Git ni a una nota.
