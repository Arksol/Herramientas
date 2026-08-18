# Distribución desktop y sitio web

## Decisión de plataforma

**Herramientas será una aplicación de escritorio local-first.** La versión de escritorio será el producto principal: ejecutará las siete herramientas, los modelos locales, los archivos, Obsidian, OBS Studio y el modo contextual. El sitio web publicado en Vercel será un complemento público para presentar el proyecto, mostrar las herramientas disponibles y dirigir a las personas a la descarga segura de la aplicación.

| Capacidad | Aplicación de escritorio | Sitio web en Vercel |
| --- | --- | --- |
| Siete herramientas completas | Sí | Catálogo y demostraciones no privadas |
| Modelos de IA locales | Sí | No |
| Archivos, Obsidian y OBS Studio | Sí, con confirmación | No |
| Burbuja contextual sobre otros sitios | Sí, mediante extensión local | No |
| Datos privados y sesiones locales | Sí | No se recopilan por defecto |
| Descarga e instalación | Genera instaladores | Explica y enlaza la descarga |

## Arquitectura de distribución

```text
Repositorio GitHub
  ├── Aplicación React compartida
  ├── Contenedor Tauri v2 para escritorio
  ├── Servicio local empaquetado
  ├── Extensión contextual del navegador
  └── Sitio público Vite para Vercel

Aplicación instalada
  ├── Interfaz React + Tauri
  ├── Servicio local en loopback
  ├── Ollama y modelos locales opcionales
  ├── Integraciones con Obsidian y OBS Studio
  └── Extensión contextual conectada al servicio local

Vercel
  └── Sitio público: información, demostración, documentación y enlace de descarga
```

## Aplicación de escritorio

Se utilizará **Tauri v2** como contenedor de escritorio para React y Vite. La aplicación se diseñará primero para Windows y mantendrá compatibilidad futura con macOS y Linux.

Responsabilidades de Tauri:

- Abrir la interfaz local sin depender de internet.
- Proteger las llamadas nativas mediante permisos explícitos.
- Elegir archivos y carpetas con diálogos del sistema.
- Abrir Obsidian u OBS Studio solo después de la confirmación del usuario.
- Iniciar y detener de forma controlada el servicio local requerido por las herramientas y por la extensión contextual.
- Abrir el sitio público de Vercel desde un enlace visible.

El servicio local seguirá escuchando solo en loopback y usará un token de emparejamiento de corta duración para la extensión contextual. No se expondrá como servidor público.

## Descarga para futuros usuarios

La primera distribución será para Windows mediante instalador `.msi` o `-setup.exe`. Las versiones firmadas y los instaladores se publicarán mediante versiones de GitHub; el sitio de Vercel mostrará un botón de descarga que lleve a la versión verificada.

Antes de distribuir a terceros se deberá:

1. Generar instaladores por plataforma.
2. Firmar el código y publicar checksums.
3. Incluir licencia, política de privacidad y notas de versión.
4. Probar instalación, desinstalación y actualización en un equipo limpio.
5. Mantener los datos del usuario fuera del repositorio y del instalador.
6. Implementar actualizaciones automáticas únicamente después de firmar los manifiestos y validar el flujo de actualización.

## Sitio público en Vercel

El sitio web será una compilación Vite independiente y estática. Contendrá:

- Presentación de Herramientas y de sus seis módulos.
- Capturas, explicación de los dos modos y requisitos de instalación.
- Enlace al instalador publicado y a las notas de versión.
- Enlace a GitHub, documentación y política de privacidad.
- Una demostración visual sin acceso a datos privados ni integraciones locales.

No contendrá el código de acceso de las herramientas privadas, tokens de Obsidian, endpoints locales, archivos de usuarios ni modelos instalados. El sitio no intentará conectarse a `localhost` automáticamente.

Cuando el repositorio se conecte a Vercel, se importará el directorio del sitio público desde GitHub. Las ramas de trabajo producirán vistas previas y `main` publicará el sitio de producción. Las credenciales de Vercel solo se guardarán como secretos del proveedor, nunca en Git.

## Relación con los dos modos

- **Modo integrado:** se ejecuta enteramente en la aplicación de escritorio.
- **Modo contextual:** se ejecuta por la extensión local y el servicio local de la aplicación instalada.
- **Sitio Vercel:** informa, demuestra y permite descargar la aplicación; no sustituye ninguno de los dos modos locales.

## Criterio de cierre

Esta decisión queda completa cuando el repositorio se organice para separar la aplicación de escritorio, el servicio local, la extensión y el sitio web, sin mezclar secretos, datos de usuarios o integraciones locales con el despliegue público.
## Distribucion de extension

La aplicacion de escritorio incluira instrucciones para instalar la extension contextual en Chrome Dev, Firefox y Helium. El sitio web publico mostrara enlaces o paquetes verificados, pero no se conectara automaticamente al backend local del usuario.

La extension se distribuira como paquete separado por navegador:

- Chrome Dev: carpeta Chromium MV3 para carga en modo desarrollador.
- Firefox: paquete WebExtensions compatible con `about:debugging` durante desarrollo.
- Helium: carpeta Chromium MV3 compatible mientras Helium soporte la API de extensiones usada.
## Actualizacion: aplicacion web instalable

Ademas de la aplicacion de escritorio, el proyecto tendra una aplicacion web instalable tipo PWA para iOS, Android, Linux y dispositivos Google como ChromeOS.

Objetivo de la PWA:

- Consultar agenda, pendientes, lineas de tiempo y notas generadas.
- Revisar resumenes y tarjetas de estudio.
- Marcar temas importantes durante sesiones en plataformas extra cuando el navegador lo permita.
- Sincronizar manualmente o mediante un backend futuro autorizado, sin enviar datos privados por defecto.
- Servir como companion app cuando el usuario no este en su laptop principal.

Limites de la PWA:

- No reemplaza la aplicacion de escritorio para Ollama, Obsidian local, OBS Studio, ffmpeg, Whisper local ni acceso completo a archivos.
- No descarga clases ni controla plataformas privadas desde iOS/Android.
- No inyecta burbujas sobre sitios externos sin extension o capacidad equivalente del navegador.
- Las funciones que requieran modelos locales, carpetas, OBS o integraciones profundas seguiran ejecutandose en escritorio.

Plataformas objetivo:

- iOS/iPadOS: instalacion desde Safari como app web cuando sea compatible.
- Android: instalacion desde Chrome u otros navegadores compatibles con PWA.
- Linux: instalacion desde navegadores Chromium/Firefox compatibles o uso directo en navegador.
- ChromeOS/dispositivos Google: instalacion desde Chrome como PWA y uso con extension cuando aplique.

## Actualización vigente: administrador, producto público y Profesor de música

El catálogo vigente contiene siete herramientas e incorpora el **Profesor de música**. Su agente crea planes adaptables de teoría, oído, instrumento, composición y práctica; recibe texto, objetivos o material autorizado y no conserva capturas ni archivos temporales después de siete días.

La aplicación de escritorio corresponde al modo administrador privado. El producto público queda pendiente y deberá aislar por completo cuentas, perfiles, notas y memoria. Ningún dato configurado por el administrador se reutiliza en la experiencia pública.