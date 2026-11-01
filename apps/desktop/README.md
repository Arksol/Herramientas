# Herramientas Web Local

Aplicación web local de **Herramientas** construida con React, TypeScript y Vite.

## Desarrollo de la interfaz

```bash
npm install
npm run dev
```

## Aplicación web local lista para usar

```bash
npm run build
npm run service
```

Abre `http://127.0.0.1:3030/`. El servicio Node sirve la interfaz compilada y las funciones locales en la misma dirección. Escucha solo en este equipo.

Para desarrollar con recarga automática, ejecuta `npm run service` y `npm run dev` en terminales separadas; la interfaz estará en `http://127.0.0.1:5175/`.

## Aplicación de escritorio sin Rust

La misma interfaz React + Vite funciona en una ventana Electron con el servicio Node/Express integrado. Para abrirla durante el desarrollo, usa `npm run desktop`. Para generar el instalador de Windows x64, usa `npm run package:win`; el resultado queda en `release/` y no se publica automáticamente.

La aplicación de escritorio guarda cuentas y configuración en la carpeta de datos del usuario de Windows. Al abrirla desde este proyecto por primera vez, copia las cuentas y la configuración locales existentes si aún no hay datos en ese perfil. El instalador no incluye contraseñas, códigos A2F ni bases privadas.

## Cambios en vivo y actualizaciones

Desde `apps/desktop/`, ejecuta `npm run live`. El comando abre una ventana de escritorio de desarrollo y muestra una dirección local para el navegador. Ambas vistas usan el mismo servicio y los datos de la instalación en este equipo. Los cambios de React se reflejan al guardar; los cambios del servicio y del arranque de Electron reinician sus procesos.

Con `npm run live:sync` se añade la sincronización automática a la rama `codex/desktop-live-sync` de GitHub. Después de 15 segundos sin ediciones, el modo ejecuta las pruebas y la compilación, revisa los archivos destinados a GitHub y guarda y envía los cambios. Se detiene con `Ctrl+C`. Solo sincroniza el código de `apps/desktop/`, este flujo de publicación y `.gitignore`; no incluye datos privados, builds ni el sitio público.

Al recibir un cambio en esa rama, GitHub Actions genera una nueva versión de Windows y la publica como versión instalable. La app instalada comprueba las nuevas versiones al arrancar y cada 15 minutos; descarga la actualización y la instala al cerrar la app. **Hay que instalar una vez el nuevo instalador que incorpora este sistema de actualizaciones**: el instalador anterior no puede actualizarse por sí mismo. El instalador aún no tiene firma digital; Windows puede mostrar una advertencia.

La vista del navegador permanece en `127.0.0.1`: este modo no publica el sitio web.
## Servicio local y acceso protegido

En desarrollo, copia `.env.example` como `.env`, genera el hash con `npm run access-hash -- "tu-código"`, ejecuta `npm run service` y, en otra terminal, `npm run dev`.
## Resumidor académico inicial

La aplicación también puede leer archivos de texto y PDFs locales de hasta 10 MB. El PDF se carga al servicio Node que corre en `127.0.0.1`, se extrae con `pdf-parse` y vuelve al navegador para la lectura literal con las voces del sistema. El contenido no se envía a servicios externos.

### OBS Studio local

El servicio local detecta y abre OBS Studio en las rutas habituales de Windows. Si OBS está instalado en otra ubicación, define `HERRAMIENTAS_OBS_PATH` con la ruta completa a `obs64.exe` antes de iniciar `npm run service`. La herramienta solo abre OBS; la persona inicia y detiene la grabación manualmente y debe contar con autorización.
## Conectar Obsidian

1. Reinicia Obsidian después de instalar el complemento **Local REST API with MCP** en la bóveda deseada.
2. Abre los ajustes del complemento y copia su clave de API local.
3. En el Resumidor académico, pega la clave una sola vez en **Conectar Obsidian**.
4. Genera un resumen e indica una ruta relativa, por ejemplo `Resúmenes/Clase 1.md`.

La clave se almacena en el servicio local; no se añade a `.env`, Git ni a una nota.
