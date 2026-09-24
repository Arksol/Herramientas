# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Personas que estudian, programan y organizan información desde una aplicación local-first. Las cuentas autorizadas también pueden conectar herramientas de terceros, servicios y aplicaciones propias.

## Product Purpose

Herramientas reúne agentes especializados para leer documentos, estudiar, trabajar con código, crear prompts, organizar conocimiento y conectar servicios desde un mismo espacio de escritorio y web.

## Positioning

Una capa de trabajo local que permite combinar agentes, modelos locales o de pago, terminales y conexiones API/MCP sin obligar a enviar el contenido privado fuera del equipo.

## Operating Context

La persona trabaja desde Herramientas, una aplicación web y de escritorio con servicio local, extensiones de navegador, Ollama, terminales de Windows/WSL/Python y conexiones autorizadas.

## Capabilities and Constraints

- El lector se llama “Lector general” y debe leer texto literalmente, incluyendo libros, documentos, páginas web y PDFs.
- El modelo local principal es `qwen2.5:3b-instruct-q4_K_M`.
- La sección “Herramientas de 3ros” está limitada a cuentas autorizadas.
- Las configuraciones deben centralizar agentes, idioma, tipo de cuenta, sesión, modelos, terminales, APIs y MCPs.
- Las claves de servicios de pago deben permanecer en el servicio local o backend, nunca en el frontend.

## Brand Commitments

El producto se llama Herramientas. La interfaz conserva una identidad oscura, editorial y técnica, con iconos gráficos consistentes, atribución visible al autor y favicon propio.

## Evidence on Hand

- Frontend: `apps/desktop/src/App.tsx` y `apps/desktop/src/styles.css`.
- Catálogo: `apps/desktop/src/data/tools.ts`.
- Servicio local: `apps/desktop/service/server.mjs`.
- Favicon: `apps/desktop/public/favicon.svg`.

## Product Principles

- Privacidad local por defecto.
- Conexiones explícitas y configurables.
- Acciones sensibles protegidas por cuenta y permisos.
- Agentes y modelos intercambiables.
- La interfaz debe explicar el estado sin esconderlo.

## Accessibility & Inclusion

Controles con nombres accesibles, foco visible, interfaz responsive y lectura en español e inglés mediante voces instaladas en el equipo.
