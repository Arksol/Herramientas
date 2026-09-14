# DiseÃƒÂ±o de API REST local

## Objetivo

Definir las rutas que utilizarÃƒÂ¡ el frontend para comunicarse con el backend local de Herramientas. La API se diseÃƒÂ±arÃƒÂ¡ para ejecutarse en el equipo del usuario y podrÃƒÂ¡ ampliarse posteriormente para una versiÃƒÂ³n pÃƒÂºblica.

## ConfiguraciÃƒÂ³n local

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
Ollama:   http://127.0.0.1:11434
```

El puerto puede cambiarse mediante variables de entorno. El backend no debe exponerse a internet por defecto.

## Convenciones generales

- Prefijo de API: `/api`.
- Formato principal: JSON.
- Archivos: `multipart/form-data`.
- AutenticaciÃƒÂ³n: sesiÃƒÂ³n local mediante cookie segura.
- Errores: respuesta consistente con cÃƒÂ³digo, mensaje y detalles seguros.
- Identificadores: UUID o identificadores aleatorios no predecibles.
- Fechas: ISO 8601.
- Todas las rutas privadas deben verificar autorizaciÃƒÂ³n en el backend.

## Respuesta de error estÃƒÂ¡ndar

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "La informaciÃƒÂ³n enviada no es vÃƒÂ¡lida.",
    "details": []
  },
  "requestId": "local-request-id"
}
```

No se incluirÃƒÂ¡n contraseÃƒÂ±as, tokens, rutas privadas completas ni trazas internas en las respuestas.

## Salud del servicio

### `GET /api/health`

Verifica que el backend estÃƒÂ© funcionando.

Respuesta:

```json
{
  "status": "ok",
  "service": "herramientas-api"
}
```

### `GET /api/health/ai`

Verifica si Ollama estÃƒÂ¡ disponible y quÃƒÂ© modelos locales estÃƒÂ¡n instalados.

No debe exponer informaciÃƒÂ³n sensible del sistema.

## AutenticaciÃƒÂ³n local

### `POST /api/auth/login`

Valida el cÃƒÂ³digo de acceso de las dos primeras herramientas.

Solicitud:

```json
{
  "accessCode": "codigo-introducido-por-el-usuario"
}
```

Respuesta exitosa:

```json
{
  "authenticated": true,
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```

Reglas:

- Comparar el cÃƒÂ³digo con un hash seguro.
- No almacenar el cÃƒÂ³digo en texto plano.
- No devolver el cÃƒÂ³digo ni el hash.
- Aplicar rate limiting.
- Usar mensajes genÃƒÂ©ricos ante fallos.
- Crear una cookie de sesiÃƒÂ³n `HttpOnly` y `SameSite`.

### `POST /api/auth/logout`

Finaliza la sesiÃƒÂ³n local.

### `GET /api/auth/session`

Devuelve si existe una sesiÃƒÂ³n vÃƒÂ¡lida y quÃƒÂ© herramientas puede utilizar.

## Herramientas

### `GET /api/tools`

Devuelve el catÃƒÂ¡logo de herramientas disponibles.

Respuesta conceptual:

```json
{
  "tools": [
    {
      "id": "resumidor-academico",
      "name": "Resumidor acadÃƒÂ©mico y Obsidian",
      "requiresAuth": true,
      "status": "available"
    }
  ]
}
```

### `GET /api/tools/:toolId`

Devuelve la configuraciÃƒÂ³n pÃƒÂºblica y las capacidades de una herramienta.

No debe devolver secretos, rutas privadas ni configuraciones internas.

## Resumidor acadÃƒÂ©mico y Obsidian

Todas estas rutas requieren sesiÃƒÂ³n autorizada.

### `POST /api/summarizer/analyze`

Analiza texto o archivos autorizados.

Admite:

- Texto.
- PDF.
- Markdown.
- Documentos compatibles.
- Capturas e imÃƒÂ¡genes.
- Transcripciones proporcionadas por el usuario.

El backend debe validar tamaÃƒÂ±o, extensiÃƒÂ³n, contenido y ubicaciÃƒÂ³n temporal.

### `POST /api/summarizer/generate`

Genera un resumen con un modelo local configurado.

Solicitud conceptual:

```json
{
  "sourceId": "source-id",
  "format": "obsidian",
  "detail": "complete",
  "includeQuestions": true,
  "includeMermaid": true
}
```

## IntegraciÃƒÂ³n recomendada con Obsidian

La integraciÃƒÂ³n principal serÃƒÂ¡ el plugin gratuito y de cÃƒÂ³digo abierto **Obsidian Local REST API** de `coddingtonbear`.

El plugin ofrece una API local para leer, crear, actualizar, buscar, abrir y eliminar archivos de la bÃƒÂ³veda. TambiÃƒÂ©n incluye un servidor MCP y autenticaciÃƒÂ³n mediante API key. La comunicaciÃƒÂ³n HTTPS local utiliza un certificado autofirmado.

ConfiguraciÃƒÂ³n prevista:

```text
HTTPS: https://127.0.0.1:27124
HTTP opcional: http://127.0.0.1:27123
AutenticaciÃƒÂ³n: Authorization: Bearer <API_KEY>
```

La aplicaciÃƒÂ³n utilizarÃƒÂ¡ HTTPS local siempre que sea posible. El endpoint HTTP se mantendrÃƒÂ¡ desactivado salvo que exista una razÃƒÂ³n tÃƒÂ©cnica documentada.

Medidas obligatorias:

- Instalar el plugin ÃƒÂºnicamente desde una fuente verificable.
- Mantener el servidor ligado a `127.0.0.1`.
- No exponer el puerto a internet ni a la red local.
- Guardar la API key ÃƒÂºnicamente en variables de entorno o en el almacÃƒÂ©n seguro del sistema.
- Nunca incluir la API key en React, Git, logs, capturas o respuestas de la API.
- Validar y restringir las rutas relativas antes de enviarlas a Obsidian.
- Permitir inicialmente solo crear y actualizar notas dentro de la carpeta configurada.
- Deshabilitar operaciones de borrar y ejecutar comandos salvo que exista una confirmaciÃƒÂ³n explÃƒÂ­cita.
- Crear copias o rechazar sobrescrituras cuando una nota ya exista.
- Registrar solamente metadatos tÃƒÂ©cnicos, nunca el contenido privado de la bÃƒÂ³veda.
- Verificar el certificado local o configurar una excepciÃƒÂ³n limitada ÃƒÂºnicamente para `127.0.0.1`.

Alternativas evaluadas:

- `vigeron/obsidian-api`: otra implementaciÃƒÂ³n local con HTTPS, API key y comparaciÃƒÂ³n segura de tokens.
- `obsidian://` URI: ÃƒÂºtil para abrir archivos, pero insuficiente como API principal para escritura y lectura estructurada.
- Escritura directa del sistema de archivos: posible en un servicio local, pero se usarÃƒÂ¡ solo como alternativa controlada y con validaciÃƒÂ³n estricta de rutas.
### `POST /api/obsidian/notes`

Guarda una nota Markdown en la carpeta autorizada de la bÃƒÂ³veda.

Solicitud conceptual:

```json
{
  "vaultId": "configured-vault",
  "relativeDirectory": "Cursos/ResÃƒÂºmenes",
  "fileName": "clase-01.md",
  "content": "# Resumen de la clase"
}
```

Validaciones:

- La bÃƒÂ³veda debe estar configurada localmente.
- La carpeta debe permanecer dentro de la bÃƒÂ³veda.
- Se deben bloquear rutas absolutas y traversal (`..`).
- No sobrescribir una nota sin confirmaciÃƒÂ³n o estrategia de copia.
- Informar la ruta relativa creada.

## Descarga de clases

Todas estas rutas requieren sesiÃƒÂ³n autorizada.

### `GET /api/classes/platforms`

Devuelve las plataformas configuradas y sus polÃƒÂ­ticas.

Debe distinguir entre:

- Descarga oficial permitida.
- Solo recursos descargables.
- Sin descarga de video.
- GrabaciÃƒÂ³n externa ÃƒÂºnicamente con autorizaciÃƒÂ³n.

### `POST /api/classes/inspect`

Registra la plataforma, curso y clase que el usuario desea gestionar.

No debe extraer tokens, cookies, manifiestos ni archivos ocultos del reproductor.

### `POST /api/classes/download-official`

Solicita una descarga mediante un enlace o botÃƒÂ³n oficial previamente identificado por el usuario o por una integraciÃƒÂ³n autorizada.

Debe rechazar:

- URL de streaming protegidas.
- Manifiestos HLS o DASH.
- Enlaces temporales extraÃƒÂ­dos.
- Archivos obtenidos mediante cookies o tokens.

### `POST /api/classes/recording/request`

Inicia el flujo previo para una grabaciÃƒÂ³n autorizada mediante OBS Studio.

Solicitud conceptual:

```json
{
  "platform": "ebac",
  "course": "curso",
  "lesson": "clase-01",
  "outputDirectory": "C:/Videos/Clases",
  "authorized": true
}
```

La API debe:

- Confirmar que el usuario indicÃƒÂ³ autorizaciÃƒÂ³n.
- Preguntar el nombre de la clase si falta.
- Validar la carpeta de destino.
- Solicitar confirmaciÃƒÂ³n antes de abrir OBS Studio.
- No iniciar una grabaciÃƒÂ³n silenciosa.
- No capturar otras ventanas sin consentimiento.

### `POST /api/classes/recording/open-obs`

Abre OBS Studio con la configuraciÃƒÂ³n local definida, previa confirmaciÃƒÂ³n del usuario.

El backend solo podrÃƒÂ¡ hacerlo en el equipo local y si OBS Studio estÃƒÂ¡ instalado y configurado.

### `GET /api/classes/recording/:id`

Consulta el estado de una grabaciÃƒÂ³n iniciada por el usuario.

### `POST /api/classes/organize`

Organiza un archivo de video autorizado en la carpeta seleccionada y registra sus metadatos.

## AnÃƒÂ¡lisis de archivos

### `POST /api/files/inspect`

Analiza una selecciÃƒÂ³n de archivos o una carpeta autorizada.

Puede devolver:

- Nombre.
- Tipo.
- TamaÃƒÂ±o.
- ExtensiÃƒÂ³n.
- Dimensiones de imagen o video.
- DuraciÃƒÂ³n de video.
- Texto extraÃƒÂ­ble.
- Errores de lectura.

No debe ejecutar archivos ni cargar secretos a servicios externos.

### `POST /api/files/frames`

Extrae fotogramas representativos de un video autorizado para anÃƒÂ¡lisis visual.

### `DELETE /api/files/:id`

Elimina un archivo temporal creado por la aplicaciÃƒÂ³n despuÃƒÂ©s de solicitar confirmaciÃƒÂ³n cuando corresponda.

## Arquitecto de prompts visuales

### `POST /api/prompts/visual/analyze`

Analiza un prompt, imÃƒÂ¡genes, capturas, videos o una carpeta de referencias autorizada.

### `POST /api/prompts/visual/generate`

Genera un prompt optimizado para imÃƒÂ¡genes o videos utilizando el contexto analizado.

Debe devolver:

- Prompt principal.
- Prompt negativo, si aplica.
- ParÃƒÂ¡metros recomendados.
- Archivos utilizados como referencia.
- Limitaciones del anÃƒÂ¡lisis.

## Arquitecto de prompts de cÃƒÂ³digo

### `POST /api/prompts/code/analyze`

Analiza cÃƒÂ³digo, carpetas, configuraciones, capturas, logs y documentaciÃƒÂ³n proporcionados por el usuario.

Debe excluir del resultado:

- Claves API.
- ContraseÃƒÂ±as.
- Tokens.
- Certificados privados.
- Cookies.
- Secretos de variables de entorno.

### `POST /api/prompts/code/generate`

Genera un prompt tÃƒÂ©cnico basado en los archivos y requisitos analizados.

Puede incluir:

- Objetivo.
- Contexto.
- Stack.
- Requisitos.
- Estructura de archivos.
- Seguridad.
- Pruebas.
- Criterios de aceptaciÃƒÂ³n.

## Modelos locales

### `POST /api/ai/chat`

EnvÃƒÂ­a una solicitud al modelo local configurado mediante Ollama.

El backend actuarÃƒÂ¡ como intermediario para:

- Elegir el modelo.
- Aplicar instrucciones de la herramienta.
- Limitar tamaÃƒÂ±o de entrada.
- Registrar mÃƒÂ©tricas sin contenido privado.
- Devolver respuestas en streaming cuando se implemente.

El frontend no deberÃƒÂ¡ comunicarse directamente con modelos que requieran reglas privadas o procesamiento adicional.

## Seguridad de la API

- Escuchar en localhost por defecto.
- Configurar CORS ÃƒÂºnicamente para el frontend local.
- Aplicar rate limiting a login, archivos y generaciÃƒÂ³n.
- Validar cada cuerpo y parÃƒÂ¡metro.
- Limitar tamaÃƒÂ±o y cantidad de archivos.
- Normalizar nombres y rutas.
- Eliminar temporales.
- No ejecutar comandos construidos desde la entrada del usuario.
- No registrar contenido sensible.
- Requerir confirmaciÃƒÂ³n para acciones externas o destructivas.
- Mantener las integraciones de OBS y archivos bajo control local.

## Criterio de cierre del paso 5

El paso se considera completado cuando las rutas principales, sus entradas, respuestas, permisos y lÃƒÂ­mites de seguridad estÃƒÂ¡n documentados y pueden convertirse en contratos de implementaciÃƒÂ³n.

## Endpoints aÃƒÂ±adidos para la burbuja contextual

### `GET /api/context/capabilities`

Devuelve las capacidades disponibles para el dominio o aplicaciÃƒÂ³n que el usuario haya autorizado. No recibe ni devuelve cookies, contraseÃƒÂ±as ni tokens de plataformas.

### `POST /api/context/inspect`

Analiza metadatos y contenido seleccionado explÃƒÂ­citamente por el usuario. Debe recibir el origen, el tipo de contenido y el consentimiento de la operaciÃƒÂ³n. El backend debe aplicar allowlist de dominios, lÃƒÂ­mites de tamaÃƒÂ±o y limpieza de contenido.

### `POST /api/context/pause`

Pausa la lectura de contexto y cualquier procesamiento en curso que pueda detenerse de forma segura.

### `POST /api/context/resume`

Reanuda una sesiÃƒÂ³n pausada si todavÃƒÂ­a no caducÃƒÂ³ y si el usuario vuelve a confirmar el contexto cuando sea necesario.

No se implementarÃƒÂ¡n endpoints que permitan recorrer cualquier pÃƒÂ¡gina, extraer credenciales, interceptar sesiones o automatizar plataformas fuera de sus mecanismos autorizados.

## Contrato consolidado para los dos modos

Todas las solicitudes de herramienta incluirÃƒÂ¡n `operationMode: "integrated" | "contextual"`. En modo contextual tambiÃƒÂ©n incluirÃƒÂ¡n un `contextSessionId` emitido por el backend; el frontend nunca aceptarÃƒÂ¡ contexto externo sin ese identificador validado.

### `POST /api/context/sessions`

Crea una sesiÃƒÂ³n de contexto despuÃƒÂ©s de verificar la extensiÃƒÂ³n, el dominio autorizado y el consentimiento explÃƒÂ­cito. Devuelve las herramientas compatibles y un identificador de vida corta.

### `POST /api/context/sessions/:id/payload`

Recibe solo el contenido que el usuario seleccionÃƒÂ³. Debe validar esquema, tamaÃƒÂ±o, origen, permisos y reglas de redacciÃƒÂ³n de secretos.

### `POST /api/context/sessions/:id/close`

Revoca el contexto al cerrar la burbuja, cambiar de dominio, pausar la sesiÃƒÂ³n o caducar la autorizaciÃƒÂ³n.

Las rutas existentes de anÃƒÂ¡lisis, resumen, prompts, clases y aprendizaje reciben el contexto ya normalizado. No aceptarÃƒÂ¡n URL arbitrarias para navegar, cookies de plataformas ni credenciales.

## Alcance por entorno de ejecuciÃƒÂ³n

La API REST descrita en este documento pertenece a la aplicaciÃƒÂ³n de escritorio y se expondrÃƒÂ¡ ÃƒÂºnicamente en loopback. El sitio de Vercel no consumirÃƒÂ¡ estas rutas ni podrÃƒÂ¡ llamar a Obsidian, OBS Studio, archivos o modelos locales. La extensiÃƒÂ³n contextual se emparejarÃƒÂ¡ con la aplicaciÃƒÂ³n instalada mediante un token efÃƒÂ­mero, no mediante una API pÃƒÂºblica.

## Profesor de inglÃƒÂ©s C1: memoria y personalizaciÃƒÂ³n

### `GET /api/english/profiles/:id/memory`

Devuelve ÃƒÂºnicamente la memoria local autorizada del perfil: nivel, objetivos, intereses, progreso, vocabulario y resÃƒÂºmenes de conversaciÃƒÂ³n. No devuelve datos de otros perfiles.

### `PUT /api/english/profiles/:id/preferences`

Actualiza los temas de interÃƒÂ©s, objetivos y preferencias de prÃƒÂ¡ctica tras validaciÃƒÂ³n.

### `POST /api/english/profiles/:id/attachments`

Recibe un archivo autorizado para anÃƒÂ¡lisis educativo. Debe aplicar los lÃƒÂ­mites de tipo, tamaÃƒÂ±o, temporales y privacidad definidos para archivos.

### `POST /api/english/profiles/:id/practice`

Genera una prÃƒÂ¡ctica basada en el nivel, intereses seleccionados, historial permitido y, opcionalmente, un archivo ya analizado.

### `DELETE /api/english/profiles/:id/memory`

Elimina la memoria local del perfil despuÃƒÂ©s de confirmaciÃƒÂ³n explÃƒÂ­cita. Debe permitir borrar conversaciones, archivos temporales, preferencias o el perfil completo de manera granular.

## Endpoints previstos para agentes

### `GET /api/agents`

Devuelve el registro publico de agentes disponibles: identificador, herramienta, nombre, rol y estado. No devuelve prompts internos, secretos ni memoria privada.

### `GET /api/agents/:agentId`

Devuelve capacidades visibles del agente, modelos sugeridos, permisos y acciones que requieren confirmacion.

### `POST /api/agents/:agentId/run`

Ejecuta una tarea del agente con contexto ya validado. Debe incluir:

```json
{
  "toolId": "resumidor",
  "operationMode": "integrated",
  "sourceId": "contexto-normalizado",
  "userInstruction": "resumir para Obsidian"
}
```

Reglas:

- Verificar sesion activa cuando el agente pertenezca a una herramienta protegida.
- Validar que el agente tenga permiso para usar las capacidades solicitadas.
- No aceptar archivos o links sin pasar por extractores locales.
- Devolver acciones propuestas separadas de acciones ejecutadas.
- Exigir confirmacion adicional para guardar, descargar, abrir OBS o modificar archivos.

### `GET /api/agents/:agentId/memory`

Devuelve memoria local permitida para el perfil/herramienta actual. Debe poder desactivarse y borrarse por el usuario.

### `DELETE /api/agents/:agentId/memory`

Borra memoria local del agente tras confirmacion explicita.
## Endpoints reales de extension contextual

La implementacion inicial expone:

- `GET /api/extension/health`: devuelve estado del puente local de extension.
- `GET /api/context/capabilities`: devuelve herramientas que aceptan contexto seleccionado.
- `POST /api/context/inspect`: recibe seleccion explicita, origen, URL, titulo, herramienta solicitada y consentimiento.

Estos endpoints no aceptan cookies de plataformas, tokens ni DOM completo. El contexto recibido queda como sesion corta y debe continuar dentro de Herramientas.