# Seguridad, privacidad y límites

## Controles implementados

- Código de acceso local con hash bcrypt, bloqueo temporal tras intentos fallidos y sesiones de veinticuatro horas.
- Pausa e inactividad de sesión antes de procesar contenido protegido.
- Servicio en `127.0.0.1` con cabeceras de seguridad, CORS limitado a las aplicaciones locales y extensiones instaladas.
- Validación de tamaño, tipo y formato para texto, VTT, SRT, archivos locales, enlaces e imágenes.
- Clave de Obsidian guardada en el Administrador de credenciales de Windows desde la aplicación de escritorio.
- Retención de siete días para contexto temporal, planes de clase y auditoría. La limpieza nunca toca carpetas, notas o archivos externos al proyecto.

## Clases y material privado

La aplicación puede operar sobre recursos a los que el usuario ya tiene acceso legítimo, pero no automatiza inicios de sesión, no lee cookies o tokens, no evita DRM y no descarga vídeos protegidos. El gestor solo prepara un flujo: descarga oficial cuando la plataforma la ofrece, o estudio contextual mediante texto, subtítulos y archivos propios.

Abrir OBS exige dos declaraciones: autorización para grabar y comprensión de que Herramientas no controla la grabación. OBS nunca se inicia, detiene o configura de forma automática.

## Límites actuales

- La extensión no sustituye una autorización de la institución o del docente.
- Los resúmenes pueden equivocarse; deben revisarse antes de estudiar, compartir o guardar como fuente final.
- Houston y cualquier proveedor externo deben tratarse como una transferencia de datos independiente y opcional.
- El modo público no está publicado ni debe recibir información personal hasta completar su diseño de privacidad y seguridad.