# DistribuciÃ³n desktop y sitio web

## DecisiÃ³n de plataforma

**Herramientas serÃ¡ una aplicaciÃ³n de escritorio local-first.** La versiÃ³n de escritorio serÃ¡ el producto principal: ejecutarÃ¡ las seis herramientas, los modelos locales, los archivos, Obsidian, OBS Studio y el modo contextual. El sitio web publicado en Vercel serÃ¡ un complemento pÃºblico para presentar el proyecto, mostrar las herramientas disponibles y dirigir a las personas a la descarga segura de la aplicaciÃ³n.

| Capacidad | AplicaciÃ³n de escritorio | Sitio web en Vercel |
| --- | --- | --- |
| Seis herramientas completas | SÃ­ | CatÃ¡logo y demostraciones no privadas |
| Modelos de IA locales | SÃ­ | No |
| Archivos, Obsidian y OBS Studio | SÃ­, con confirmaciÃ³n | No |
| Burbuja contextual sobre otros sitios | SÃ­, mediante extensiÃ³n local | No |
| Datos privados y sesiones locales | SÃ­ | No se recopilan por defecto |
| Descarga e instalaciÃ³n | Genera instaladores | Explica y enlaza la descarga |

## Arquitectura de distribuciÃ³n

```text
Repositorio GitHub
  â”œâ”€â”€ AplicaciÃ³n React compartida
  â”œâ”€â”€ Contenedor Tauri v2 para escritorio
  â”œâ”€â”€ Servicio local empaquetado
  â”œâ”€â”€ ExtensiÃ³n contextual del navegador
  â””â”€â”€ Sitio pÃºblico Vite para Vercel

AplicaciÃ³n instalada
  â”œâ”€â”€ Interfaz React + Tauri
  â”œâ”€â”€ Servicio local en loopback
  â”œâ”€â”€ Ollama y modelos locales opcionales
  â”œâ”€â”€ Integraciones con Obsidian y OBS Studio
  â””â”€â”€ ExtensiÃ³n contextual conectada al servicio local

Vercel
  â””â”€â”€ Sitio pÃºblico: informaciÃ³n, demostraciÃ³n, documentaciÃ³n y enlace de descarga
```

## AplicaciÃ³n de escritorio

Se utilizarÃ¡ **Tauri v2** como contenedor de escritorio para React y Vite. La aplicaciÃ³n se diseÃ±arÃ¡ primero para Windows y mantendrÃ¡ compatibilidad futura con macOS y Linux.

Responsabilidades de Tauri:

- Abrir la interfaz local sin depender de internet.
- Proteger las llamadas nativas mediante permisos explÃ­citos.
- Elegir archivos y carpetas con diÃ¡logos del sistema.
- Abrir Obsidian u OBS Studio solo despuÃ©s de la confirmaciÃ³n del usuario.
- Iniciar y detener de forma controlada el servicio local requerido por las herramientas y por la extensiÃ³n contextual.
- Abrir el sitio pÃºblico de Vercel desde un enlace visible.

El servicio local seguirÃ¡ escuchando solo en loopback y usarÃ¡ un token de emparejamiento de corta duraciÃ³n para la extensiÃ³n contextual. No se expondrÃ¡ como servidor pÃºblico.

## Descarga para futuros usuarios

La primera distribuciÃ³n serÃ¡ para Windows mediante instalador `.msi` o `-setup.exe`. Las versiones firmadas y los instaladores se publicarÃ¡n mediante versiones de GitHub; el sitio de Vercel mostrarÃ¡ un botÃ³n de descarga que lleve a la versiÃ³n verificada.

Antes de distribuir a terceros se deberÃ¡:

1. Generar instaladores por plataforma.
2. Firmar el cÃ³digo y publicar checksums.
3. Incluir licencia, polÃ­tica de privacidad y notas de versiÃ³n.
4. Probar instalaciÃ³n, desinstalaciÃ³n y actualizaciÃ³n en un equipo limpio.
5. Mantener los datos del usuario fuera del repositorio y del instalador.
6. Implementar actualizaciones automÃ¡ticas Ãºnicamente despuÃ©s de firmar los manifiestos y validar el flujo de actualizaciÃ³n.

## Sitio pÃºblico en Vercel

El sitio web serÃ¡ una compilaciÃ³n Vite independiente y estÃ¡tica. ContendrÃ¡:

- PresentaciÃ³n de Herramientas y de sus seis mÃ³dulos.
- Capturas, explicaciÃ³n de los dos modos y requisitos de instalaciÃ³n.
- Enlace al instalador publicado y a las notas de versiÃ³n.
- Enlace a GitHub, documentaciÃ³n y polÃ­tica de privacidad.
- Una demostraciÃ³n visual sin acceso a datos privados ni integraciones locales.

No contendrÃ¡ el cÃ³digo de acceso de las herramientas privadas, tokens de Obsidian, endpoints locales, archivos de usuarios ni modelos instalados. El sitio no intentarÃ¡ conectarse a `localhost` automÃ¡ticamente.

Cuando el repositorio se conecte a Vercel, se importarÃ¡ el directorio del sitio pÃºblico desde GitHub. Las ramas de trabajo producirÃ¡n vistas previas y `main` publicarÃ¡ el sitio de producciÃ³n. Las credenciales de Vercel solo se guardarÃ¡n como secretos del proveedor, nunca en Git.

## RelaciÃ³n con los dos modos

- **Modo integrado:** se ejecuta enteramente en la aplicaciÃ³n de escritorio.
- **Modo contextual:** se ejecuta por la extensiÃ³n local y el servicio local de la aplicaciÃ³n instalada.
- **Sitio Vercel:** informa, demuestra y permite descargar la aplicaciÃ³n; no sustituye ninguno de los dos modos locales.

## Criterio de cierre

Esta decisiÃ³n queda completa cuando el repositorio se organice para separar la aplicaciÃ³n de escritorio, el servicio local, la extensiÃ³n y el sitio web, sin mezclar secretos, datos de usuarios o integraciones locales con el despliegue pÃºblico.
## Distribucion de extension

La aplicacion de escritorio incluira instrucciones para instalar la extension contextual en Chrome Dev, Firefox y Helium. El sitio web publico mostrara enlaces o paquetes verificados, pero no se conectara automaticamente al backend local del usuario.

La extension se distribuira como paquete separado por navegador:

- Chrome Dev: carpeta Chromium MV3 para carga en modo desarrollador.
- Firefox: paquete WebExtensions compatible con `about:debugging` durante desarrollo.
- Helium: carpeta Chromium MV3 compatible mientras Helium soporte la API de extensiones usada.