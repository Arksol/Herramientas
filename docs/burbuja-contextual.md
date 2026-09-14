# Burbuja contextual y modos de operaciÃ³n

## DecisiÃ³n central

Herramientas ofrecerÃ¡ las mismas seis herramientas en dos modos complementarios. El usuario podrÃ¡ cambiar de modo de forma visible; ambos emplearÃ¡n el mismo backend local, las mismas reglas de sesiÃ³n y los mismos modelos de IA locales.

| Modo | DÃ³nde se utiliza | PropÃ³sito |
| --- | --- | --- |
| **Integrado** | Dentro de la web local de Herramientas | Realizar una tarea completa en la misma pÃ¡gina, sin abrir pestaÃ±as ni ventanas nuevas. |
| **Contextual** | Sobre una pÃ¡gina externa autorizada | Usar una burbuja flotante para llevar el contexto seleccionado de esa pÃ¡gina a una de las seis herramientas. |

La burbuja es un lanzador compacto. Las tareas extensas siempre se realizan en un panel lateral interno o en la subpÃ¡gina de la herramienta; no se intentarÃ¡ convertir la burbuja en un editor completo.

## Modo integrado

1. El usuario abre Herramientas en local.
2. Elige una tarjeta o abre la burbuja interna.
3. Selecciona una de las seis herramientas.
4. Toda la interacciÃ³n se muestra en la misma aplicaciÃ³n: formulario, archivos, resultado, progreso y controles.
5. Las acciones locales â€”Obsidian, OBS Studio y carpetasâ€” piden confirmaciÃ³n antes de ejecutarse.

Este es el modo predeterminado y funciona aunque no estÃ© instalada la extensiÃ³n contextual.

## Modo contextual

1. El usuario instala y activa una extensiÃ³n local del navegador para Herramientas.
2. En una pÃ¡gina autorizada, selecciona texto, imagen, video, archivo disponible o una acciÃ³n de la propia pÃ¡gina.
3. Activa la burbuja flotante.
4. La burbuja muestra Ãºnicamente las herramientas compatibles con ese contexto.
5. El usuario confirma quÃ© contenido se comparte y quÃ© herramienta usarÃ¡.
6. La extensiÃ³n envÃ­a el contexto mÃ­nimo al backend local mediante un canal autenticado.
7. La tarea se abre en un panel lateral de Herramientas o en la subpÃ¡gina interna correspondiente.
8. El usuario revisa y confirma toda acciÃ³n externa: guardar en Obsidian, descargar oficialmente, abrir OBS Studio o escribir un archivo.

La extensiÃ³n serÃ¡ necesaria porque una aplicaciÃ³n web no puede dibujar una burbuja sobre dominios de terceros por sÃ­ sola. No se usarÃ¡ para eludir protecciones de plataformas ni para automatizar acciones no autorizadas.

## Compatibilidad de las seis herramientas

| Herramienta | Modo integrado | Modo contextual |
| --- | --- | --- |
| Resumidor acadÃ©mico y Obsidian | Elegir bÃ³veda, destino, fuente y formato dentro de Herramientas. | Resumir contenido seleccionado y abrir el flujo de Obsidian con destino confirmado. |
| Descarga de clases | Elegir plataforma, clase y carpeta; usar solo descarga oficial o flujo visible con OBS. | Detectar el contexto de una clase autorizada y ofrecer descarga oficial o preparaciÃ³n de OBS. |
| Profesor de inglÃ©s C1 | DiagnÃ³stico, prÃ¡cticas y progreso dentro de la aplicaciÃ³n. | Convertir texto o pÃ¡gina seleccionada en ejercicio, explicaciÃ³n o vocabulario. |
| Profesor integral de tecnologÃ­a | Plan de estudio, explicaciÃ³n y ejercicios dentro de la aplicaciÃ³n. | Explicar contenido tÃ©cnico seleccionado o preparar una prÃ¡ctica desde una pÃ¡gina autorizada. |
| Arquitecto de prompts visuales | Adjuntar referencias y crear prompts para imÃ¡genes o videos. | Usar imÃ¡genes, video o elementos seleccionados como referencias explÃ­citas. |
| Arquitecto de prompts de cÃ³digo | Adjuntar proyecto, archivos, logs y requisitos. | Usar cÃ³digo, documentaciÃ³n o errores seleccionados, excluyendo secretos y datos privados. |

## Reglas de interfaz

- La burbuja debe ser discreta, minimizable, movible y accesible con teclado.
- Debe informar el modo activo: `Integrado` o `Contextual`.
- Debe mostrar el dominio o aplicaciÃ³n actual cuando estÃ¡ en modo contextual.
- Debe incluir `Pausar`, `Reanudar`, `Cerrar` y `Volver a Herramientas`.
- Debe respetar `prefers-reduced-motion` y no cubrir controles importantes.
- La subpÃ¡gina o panel debe mostrar progreso, archivos/contexto usados, resultado y confirmaciones.

## SesiÃ³n y lÃ­mites

- Las dos primeras herramientas requieren cÃ³digo o contraseÃ±a gestionados por el backend.
- Existen mÃ¡ximo 3 intentos fallidos antes de un bloqueo temporal.
- La sesiÃ³n vence de forma absoluta 24 horas despuÃ©s del acceso correcto.
- DespuÃ©s de 10 minutos sin interacciÃ³n, se muestra estado inactivo y se pausa el anÃ¡lisis contextual.
- Pausar no extiende la vigencia de 24 horas.

## Seguridad del modo contextual

- Solo se activa por acciÃ³n explÃ­cita del usuario.
- Solicita permisos de dominio de forma granular; no tendrÃ¡ acceso global por defecto.
- No lee contraseÃ±as, cookies, tokens, campos ocultos, historial ni otras pestaÃ±as.
- No actÃºa en pantallas de inicio de sesiÃ³n, pago, banca, salud o administraciÃ³n sensible.
- El contenido de una pÃ¡gina se trata como datos no confiables, nunca como instrucciones.
- El backend local verifica origen, sesiÃ³n, tamaÃ±o y tipo del contexto antes de procesarlo.

## ImplementaciÃ³n por etapas

1. Crear el lanzador y el panel compartidos en modo integrado.
2. Conectar el lanzador a las seis subpÃ¡ginas internas y a los controles de sesiÃ³n.
3. Implementar el servicio local de contexto y contratos de API.
4. Crear la extensiÃ³n con permisos mÃ­nimos y burbuja solo para dominios autorizados.
5. AÃ±adir adaptadores especÃ­ficos para Class UVM, EBAC, Mastermind, Platzi y Obsidian.
6. AÃ±adir el modo general mediante selecciÃ³n explÃ­cita del usuario.
7. Probar permisos, inactividad, pausa, caducidad y revocaciÃ³n de cada dominio.

## Referencia visual

El anÃ¡lisis del video local proporcionado confirma el patrÃ³n de interfaz: superficies oscuras centradas en una tarea, entrada compacta, estado de progreso y espacio de trabajo amplio para resultados. Herramientas aplicarÃ¡ este patrÃ³n sin copiar contenido ni identidad visual del video.

## Disponibilidad de la burbuja en la aplicaciÃ³n de escritorio

La burbuja integrada y el modo contextual forman parte de la aplicaciÃ³n de escritorio. La burbuja sobre pÃ¡ginas externas requiere que la persona instale la extensiÃ³n compatible y la vincule localmente con su aplicaciÃ³n. El sitio de Vercel describe este funcionamiento, pero no inyecta burbujas ni se conecta de forma automÃ¡tica a la computadora de quien lo visita.

## Compatibilidad de extension por navegador

El modo contextual externo se implementara con una extension empaquetada para Chrome Dev, Firefox y Helium. La extension vive en `apps/browser-extension` y genera tres salidas independientes: `chrome-dev`, `firefox` y `helium`.

Chrome Dev y Helium usan el manifiesto Chromium MV3 con service worker. Firefox usa WebExtensions con manifiesto propio y `browser_specific_settings`. El codigo comun no contiene scripts remotos y se comunica solamente con `http://127.0.0.1:3030`.