# Seguridad del proyecto

## Objetivo

Proteger los datos personales, acadÃ©micos, archivos, prompts, notas y configuraciones del usuario actual y de futuros usuarios.

La seguridad se diseÃ±arÃ¡ como una caracterÃ­stica transversal, no como una funciÃ³n aÃ±adida al final.

## Modelo de amenazas

Se consideran las siguientes amenazas:

- Acceso no autorizado a las dos primeras herramientas.
- ExposiciÃ³n de contraseÃ±as, API keys o tokens.
- Lectura o escritura fuera de la bÃ³veda autorizada.
- Subida de archivos maliciosos o excesivamente grandes.
- EjecuciÃ³n accidental de cÃ³digo o comandos.
- ExposiciÃ³n de Ollama o del backend a la red.
- EnvÃ­o involuntario de archivos a servicios externos.
- Sobrescritura o eliminaciÃ³n de notas.
- InyecciÃ³n de instrucciones desde documentos analizados.
- Uso indebido de OBS Studio o grabaciÃ³n sin autorizaciÃ³n.
- Dependencias vulnerables.
- PÃ©rdida o corrupciÃ³n de datos.

## Controles de acceso

- Proteger Resumidor acadÃ©mico y Descarga de clases mediante backend.
- Usar hash Argon2id o bcrypt para el cÃ³digo de acceso.
- Usar sesiones temporales con cookies `HttpOnly`, `Secure` y `SameSite`.
- Aplicar rate limiting al inicio de sesiÃ³n.
- No revelar si el cÃ³digo era parcialmente correcto.
- Revocar sesiones al cerrar sesiÃ³n.
- Mantener permisos separados por herramienta.
- No confiar en una protecciÃ³n implementada solo en el frontend.

## Secretos y configuraciÃ³n

- Usar `.env` local y `.env.example` sin valores reales.
- No subir secretos a GitHub.
- No imprimir tokens en logs.
- No incluir API keys en el bundle frontend.
- Usar variables separadas para el cÃ³digo de acceso, la API de Obsidian y los modelos locales.
- Rotar credenciales si existe sospecha de exposiciÃ³n.

## Seguridad de Obsidian

- Usar la API local REST autenticada.
- Mantener el servicio en `127.0.0.1`.
- Utilizar HTTPS local con certificado verificado.
- Permitir escritura Ãºnicamente en la carpeta configurada.
- Bloquear rutas absolutas y traversal (`..`).
- No borrar ni ejecutar comandos sin confirmaciÃ³n.
- Crear copia o pedir confirmaciÃ³n antes de sobrescribir.
- No exponer el puerto de Obsidian mediante tÃºneles o port forwarding.

## Seguridad de archivos

- Permitir Ãºnicamente extensiones necesarias.
- Validar MIME, extensiÃ³n, tamaÃ±o y cantidad.
- Generar nombres internos aleatorios.
- Guardar temporales fuera de la carpeta pÃºblica.
- Evitar que el nombre original controle una ruta.
- Escanear o rechazar archivos ejecutables.
- No ejecutar archivos analizados.
- Eliminar temporales al terminar o despuÃ©s de un periodo definido.
- Desactivar rutas que permitan descargar archivos arbitrarios.

## Seguridad de modelos locales

- Mantener Ollama en loopback.
- Desactivar funciones cloud cuando no sean necesarias.
- No exponer el puerto 11434 a internet.
- Separar modelos de confianza de documentos no confiables.
- Tratar el contenido de PDFs, pÃ¡ginas, imÃ¡genes y videos como datos, no como instrucciones.
- Aplicar lÃ­mites de contexto y tamaÃ±o.
- No permitir que un modelo ejecute comandos sin una capa de autorizaciÃ³n.
- Registrar mÃ©tricas sin guardar el contenido privado de prompts.

## Seguridad de anÃ¡lisis de documentos

Los documentos pueden contener instrucciones maliciosas o texto que intente manipular al modelo. El sistema deberÃ¡:

- Separar instrucciones del sistema, entrada del usuario y contenido de archivos.
- Marcar el contenido de archivos como no confiable.
- No obedecer instrucciones encontradas dentro de documentos por defecto.
- Confirmar operaciones que escriban, borren, descarguen o ejecuten algo.
- Mostrar quÃ© archivos se analizaron.
- Permitir al usuario cancelar el procesamiento.

## Seguridad de OBS Studio y grabaciones

- Solicitar confirmaciÃ³n antes de abrir OBS Studio.
- Solicitar confirmaciÃ³n expresa de que la grabaciÃ³n estÃ¡ autorizada.
- No iniciar grabaciones silenciosamente.
- No capturar ventanas ajenas sin consentimiento.
- Permitir elegir carpeta de salida.
- Validar que la ruta de salida sea accesible.
- Registrar la grabaciÃ³n sin almacenar credenciales de la plataforma.

## Seguridad de red local

- Backend y Ollama deben escuchar en localhost por defecto.
- CORS debe aceptar Ãºnicamente el origen del frontend local.
- Rechazar solicitudes con orÃ­genes desconocidos.
- Aplicar lÃ­mites de solicitudes.
- Usar HTTPS si el servicio se expone mÃ¡s allÃ¡ del loopback.
- No habilitar UPnP, tÃºneles ni port forwarding automÃ¡ticamente.

## Registro y privacidad

Los logs podrÃ¡n contener:

- Fecha y hora.
- Tipo de operaciÃ³n.
- Herramienta utilizada.
- Resultado tÃ©cnico.
- Identificador de solicitud.

Los logs no deben contener:

- ContraseÃ±as.
- API keys.
- Tokens.
- Contenido completo de notas.
- Archivos privados.
- Cookies.
- Transcripciones completas.

## Copias y recuperaciÃ³n

- No sobrescribir notas sin confirmaciÃ³n o copia.
- Mantener backups de la bÃ³veda fuera del repositorio pÃºblico.
- No subir una bÃ³veda privada a GitHub sin cifrado y revisiÃ³n.
- Probar restauraciÃ³n antes de confiar en un backup.
- Separar datos de usuario de cÃ³digo fuente.

## Verificaciones obligatorias antes de publicar

- Revisar `.gitignore`.
- Buscar secretos con un detector automatizado.
- Ejecutar `npm audit` cuando exista `package.json`.
- Revisar dependencias y licencias.
- Comprobar que Ollama y Obsidian no escuchen fuera de localhost.
- Probar autenticaciÃ³n, expiraciÃ³n y rate limiting.
- Probar traversal de rutas.
- Probar archivos excesivamente grandes y tipos invÃ¡lidos.
- Probar que los errores no expongan rutas ni trazas.
- Revisar accesibilidad y privacidad.

## Estado de implementaciÃ³n

Actualmente estos controles estÃ¡n definidos en la arquitectura y documentaciÃ³n. La implementaciÃ³n ejecutable se realizarÃ¡ junto con el backend local, antes de conectar datos reales, la bÃ³veda de Obsidian o archivos personales.

## Controles del paso 6: sesiones y burbuja contextual

### SesiÃ³n de herramienta

- La sesiÃ³n comienza en el momento en que el backend acepta el cÃ³digo o contraseÃ±a.
- La sesiÃ³n caduca exactamente 24 horas despuÃ©s de ese inicio; la actividad no prolonga ese lÃ­mite absoluto.
- Mientras la sesiÃ³n siga vigente, cada interacciÃ³n vÃ¡lida reinicia un temporizador de inactividad.
- DespuÃ©s de 10 minutos sin interacciÃ³n, la herramienta cambia a estado `inactiva`, muestra el aviso correspondiente y deja de procesar contexto. El usuario puede reanudarla de forma explÃ­cita si la sesiÃ³n de 24 horas aÃºn estÃ¡ vigente.
- La interfaz incluye un botÃ³n visible `Pausar sesiÃ³n`. Pausar detiene el procesamiento y la lectura de contexto, pero no reinicia ni extiende el lÃ­mite de 24 horas.
- El acceso protegido admite un mÃ¡ximo de 3 intentos fallidos. Al superar ese lÃ­mite se aplica un bloqueo temporal mediante rate limiting y se registra Ãºnicamente el evento tÃ©cnico, nunca el cÃ³digo introducido.
- El backend debe aplicar estas reglas; el frontend solo muestra el estado.

### Burbuja contextual

- La allowlist de dominios se configura localmente y se verifica en el backend.
- El usuario debe confirmar el contenido antes de enviarlo al anÃ¡lisis.
- No se leerÃ¡n cookies, contraseÃ±as, tokens, campos ocultos ni datos de otras pestaÃ±as.
- El contenido de una pÃ¡gina se considera no confiable y no puede cambiar las instrucciones de seguridad.
- Los adaptadores de plataformas solo podrÃ¡n usar funciones oficiales o acciones iniciadas y confirmadas por el usuario.
- La burbuja debe poder pausarse por dominio y desactivarse por completo.
- Los logs conservarÃ¡n dominio, herramienta, hora y resultado tÃ©cnico, sin almacenar el contenido de la pÃ¡gina.

## ActualizaciÃ³n consolidada: seguridad de los dos modos

El modo integrado y el contextual comparten autenticaciÃ³n, caducidad de 24 horas, lÃ­mite de 3 intentos y pausa por 10 minutos de inactividad. El modo contextual aÃ±ade estos controles:

- La extensiÃ³n se identifica ante el backend local y solo puede usar sesiones de contexto de vida corta.
- Los permisos de host son opcionales, visibles y revocables por dominio.
- El contexto se limita a la selecciÃ³n explÃ­cita, metadatos mÃ­nimos de la pÃ¡gina y archivos que el usuario adjunte.
- La burbuja se desactiva en orÃ­genes sensibles y no puede inspeccionar DOM oculto, almacenamiento del navegador ni credenciales.
- Un cambio de dominio, pestaÃ±a o modo invalida el contexto anterior y exige una nueva confirmaciÃ³n.
- Las acciones de alto impacto â€”guardar, descargar, abrir OBS, modificar archivosâ€” requieren una confirmaciÃ³n adicional dentro de Herramientas.

## DistribuciÃ³n segura de la aplicaciÃ³n de escritorio

- El instalador serÃ¡ firmado antes de distribuirse a terceros.
- Las versiones publicadas incluirÃ¡n checksum, versiÃ³n y notas de lanzamiento verificables.
- La aplicaciÃ³n no iniciarÃ¡ servicios accesibles desde internet.
- El servicio local se limitarÃ¡ a loopback y requerirÃ¡ autenticaciÃ³n de emparejamiento para la extensiÃ³n.
- Vercel no recibirÃ¡ archivos, bÃ³vedas, credenciales, telemetrÃ­a privada ni secretos de la aplicaciÃ³n.
- La actualizaciÃ³n automÃ¡tica se implementarÃ¡ solo con artefactos y manifiestos firmados.

## Privacidad del Profesor de inglÃ©s C1

- La memoria de conversaciones, nivel, intereses y progreso se guarda localmente por perfil.
- La memoria se puede desactivar, editar y eliminar de forma granular.
- Los archivos adjuntos se consideran privados, se procesan localmente por defecto y se eliminan al finalizar o cuando el usuario lo solicite.
- Los intereses se usan exclusivamente para adaptar ejercicios y no se comparten con servicios externos sin una autorizaciÃ³n separada.
- El modelo recibe solo el contexto necesario para cada prÃ¡ctica; no debe cargar todo el historial de conversaciones sin necesidad.
## ImplementaciÃ³n del paso 8: autenticaciÃ³n local nativa

La aplicaciÃ³n de escritorio usa comandos nativos de Tauri para configurar, validar, pausar, reanudar y cerrar las sesiones de las dos primeras herramientas. El cÃ³digo se transforma con bcrypt antes de guardarse en el directorio local de datos de la aplicaciÃ³n; no se almacena en el frontend, el instalador ni Git. El servidor Node/Express conserva la misma polÃ­tica para desarrollo y para la futura extensiÃ³n contextual, siempre limitado a `127.0.0.1`.
## ImplementaciÃ³n del paso 9: resumen local protegido

La generaciÃ³n inicial de resÃºmenes se ejecuta localmente y no envÃ­a el texto a un proveedor externo. En desarrollo, el endpoint del resumidor exige la misma sesiÃ³n autenticada que las herramientas protegidas; una solicitud sin sesiÃ³n recibe `401`. La aplicaciÃ³n de escritorio aplica esa polÃ­tica mediante sus comandos nativos de sesiÃ³n.

La conexiÃ³n con Obsidian no se activa ni almacena claves hasta que el usuario instale y autorice explÃ­citamente la integraciÃ³n local correspondiente.
## ProtecciÃ³n de la conexiÃ³n con Obsidian

El complemento se limita a `https://127.0.0.1:27124`. La aplicaciÃ³n acepta el certificado local autofirmado Ãºnicamente para ese origen de loopback, usa autenticaciÃ³n Bearer y rechaza rutas con ascensos de directorio (`..`) o fuera de una nota Markdown. La clave se conserva mediante el Administrador de credenciales de Windows y se exige una sesiÃ³n autorizada antes de configurarla o guardar una nota.
## Correccion del paso 8: acciones protegidas solo con sesion activa

La autenticacion local nativa distingue entre una sesion vigente y una sesion usable. La vigencia de 24 horas permite reanudar, pausar o cerrar sesion, pero las acciones sensibles requieren estado `active`.

Acciones que deben rechazar sesiones `paused` o `inactive`:

- Generar resumen protegido.
- Configurar, probar, guardar o anexar contenido en Obsidian.
- Consultar o abrir OBS Studio desde la herramienta de clases.
- Registrar actividad automatica que intente reactivar una sesion inactiva sin confirmacion del usuario.

El servidor Node de desarrollo replica esta politica con `/api/auth/configure`, `/api/auth/login`, `/api/auth/pause`, `/api/auth/resume`, `/api/auth/activity` y proteccion activa en `/api/summarizer/generate`.

## Paso 9: IA local multimodal para Obsidian y demas herramientas

La IA local se prepara para funcionar con el hardware del equipo del usuario:

- NVIDIA GeForce GTX 1650 Ti with Max-Q Design, 4 GB VRAM aproximados.
- Intel Iris Xe Graphics, 1 GB compartido aproximado.

Politica de modelos:

- Priorizar modelos de texto 3B/4B cuantizados para resumen, tutorias, prompts y explicaciones.
- Usar modelos de vision ligeros y cuantizados para imagenes individuales; si la VRAM no alcanza, degradar a CPU o a un modelo menor.
- Procesar video por etapas: extraer audio/transcripcion, seleccionar fotogramas, analizar fotogramas y resumir el resultado textual.
- Procesar links con extractor local de contenido, sin enviar la pagina a servicios externos.
- Procesar archivos con parsers locales, limites de tamano y mascarado de secretos antes de entregarlos al modelo.

La aplicacion consulta Ollama solo en `http://127.0.0.1:11434` y muestra perfiles recomendados. Si Ollama no esta disponible, la interfaz debe explicar que el resumen de texto pegado sigue funcionando y que la parte multimodal requiere instalar o activar el runtime local.

## Seguridad de agentes locales

Los agentes no amplian permisos por si solos. Todo agente hereda las reglas de seguridad del coordinador local.

Reglas obligatorias:

- Un agente solo puede usar herramientas declaradas en su contrato.
- Las herramientas protegidas requieren sesion activa, no solo sesion vigente.
- Los documentos, paginas, imagenes y videos son datos no confiables.
- Un agente no debe obedecer instrucciones contenidas dentro de archivos analizados.
- Un agente no puede ejecutar codigo desconocido solo por haberlo leido.
- Un agente no puede guardar, borrar, descargar, abrir OBS ni modificar archivos sin confirmacion visible.
- La memoria local de un agente no se comparte con otro sin consentimiento.
- Los logs por agente guardan agente, hora, resultado tecnico y errores, no contenido privado completo.

Acciones prohibidas por defecto:

- Extraer DRM, cookies, tokens o transmisiones protegidas.
- Subir archivos privados a proveedores externos.
- Exponer Ollama, Obsidian o el backend fuera de loopback.
- Usar contexto de una pagina en otra sin nueva confirmacion.