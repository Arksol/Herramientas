# Arquitectura local y permisos

## Propósito

Herramientas funciona primero en el equipo del usuario. La aplicación de escritorio, la aplicación web local y la extensión usan un servicio restringido a `127.0.0.1`. No existe una API pública ni un backend compartido para el modo administrador.

## Capas

1. Interfaz: React muestra herramientas, contratos, confirmaciones y resultados editables.
2. Aplicación de escritorio: Tauri valida rutas locales, usa el Administrador de credenciales de Windows para la clave de Obsidian y abre OBS únicamente bajo confirmación.
3. Servicio local: Express valida sesiones, dominios, entradas y políticas de herramienta. Solo escucha en loopback.
4. IA local: Ollama procesa texto e imágenes; Whisper y ffmpeg procesan vídeo cuando estén instalados localmente.
5. Integraciones opcionales: Obsidian Local REST API y Houston. Ninguna recibe datos sin una configuración y una acción explícitas del usuario.

## Políticas y auditoría

- `TOOL_POLICIES` registra acciones y tipos de fuente permitidos por herramienta.
- `/api/tools/validate-action` rechaza acciones no permitidas y registra solo metadatos: herramienta, acción, resultado y fecha.
- `/api/audit/recent` permite revisar esos eventos locales mientras haya una sesión activa.
- Los contextos de extensión, los planes de clase y la auditoría temporal vencen a los siete días.

## Aislamiento de permisos

- La sesión protege el resumidor, el gestor de clases y las operaciones de Obsidian.
- El servicio no recibe ni almacena contraseñas de Blackboard, Class, Coursera, Platzi, EBAC, Mastermind o YouTube.
- La extensión puede enviar contexto únicamente con consentimiento explícito; no puede extraer cookies, tokens ni contenido DRM.
- Las rutas locales deben existir antes de abrir OBS. El sistema no crea, borra ni mueve archivos en nombre del usuario.

## Producto público pendiente

El modo administrador de Aaron y el futuro producto público se mantienen separados. Antes de publicar se necesitarán identidad propia, consentimiento por cuenta, límites de uso, política de privacidad, soporte y una revisión legal de los proveedores que se integren.

## Criterio de aceptación del paso 3

El servicio local contiene contratos verificables, auditoría temporal y validaciones de permisos. Las integraciones sensibles se limitan a loopback o al Administrador de credenciales de Windows.