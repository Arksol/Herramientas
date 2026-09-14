# Decisión sobre el backend

## Decisión

El proyecto **sí necesita backend**.

La aplicación puede comenzar con una maqueta frontend y datos locales, pero las funciones reales de las herramientas protegidas requieren un servidor que controle autenticación, permisos, archivos, configuraciones y comunicaciones con servicios externos.

## Motivos principales

### 1. Proteger las dos primeras herramientas

El Resumidor académico y la Descarga de clases requerirán un código o contraseña. La validación no puede depender únicamente del frontend porque el código JavaScript del navegador puede inspeccionarse o modificarse.

El backend deberá:

- Validar el código de acceso.
- Compararlo contra un hash seguro.
- Crear sesiones temporales.
- Aplicar expiración y cierre de sesión.
- Limitar intentos fallidos.
- Proteger las rutas de ambas herramientas.

### 2. Gestionar archivos

Las herramientas deberán analizar documentos, carpetas, capturas, imágenes y videos. El backend permitirá:

- Recibir archivos autorizados.
- Validar tipo, tamaño y nombre.
- Gestionar archivos temporales.
- Procesar archivos pesados fuera del navegador.
- Eliminar temporales después de un periodo definido.
- Evitar que una ruta de archivo permita acceder a otros directorios.

### 3. Guardar notas en Obsidian

El navegador no debe escribir libremente en cualquier carpeta local. La escritura en una bóveda de Obsidian deberá realizarse mediante una integración local controlada, un servicio local autorizado o una acción explícita del usuario.

El backend o servicio local deberá:

- Conocer únicamente la bóveda autorizada.
- Validar que la carpeta de destino esté dentro de la bóveda.
- Crear notas Markdown.
- Evitar sobrescrituras accidentales.
- Informar la ruta final de cada archivo.

### 4. Gestionar descargas y OBS Studio

La herramienta Descarga de clases necesitará controlar un flujo local y autorizado para:

- Registrar la plataforma y la clase.
- Detectar una descarga oficial.
- Seleccionar una carpeta de destino.
- Organizar archivos.
- Abrir OBS Studio cuando la grabación esté permitida.
- Registrar el resultado de la grabación.

La grabación no debe ejecutarse en segundo plano ni comenzar sin confirmación del usuario.

### 5. Preparar la plataforma para el futuro

Si Herramientas se publica para otras personas, se necesitará backend para:

- Usuarios y sesiones.
- Permisos por herramienta.
- Configuraciones privadas.
- Historial de resultados.
- Límites de uso.
- Integraciones externas.
- Protección de claves y secretos.

## Arquitectura propuesta

```text
Frontend React
  ↓ HTTPS / API REST
Backend Node.js + Express + TypeScript
  ├── Autenticación y sesiones
  ├── Autorización por herramienta
  ├── Validación de archivos
  ├── Procesamiento de documentos y multimedia
  ├── Integración controlada con Obsidian
  ├── Integración local autorizada con OBS Studio
  └── Conectores externos
```

## Responsabilidades del frontend

- Mostrar la interfaz.
- Recibir interacciones del usuario.
- Mostrar formularios y estados.
- Presentar progreso y resultados.
- Enviar solicitudes al backend.
- No almacenar secretos.
- No ejecutar operaciones privilegiadas directamente.

## Responsabilidades del backend

- Autenticar y autorizar.
- Validar todas las entradas.
- Proteger rutas privadas.
- Gestionar archivos temporales.
- Procesar tareas que no deben ejecutarse en el navegador.
- Ocultar claves de servicios externos.
- Registrar eventos técnicos sin datos sensibles.
- Devolver errores seguros y comprensibles.

## Stack del backend

- Node.js.
- Express.
- TypeScript.
- API REST.
- `argon2` o `bcrypt` para hashes de contraseñas.
- Cookies `HttpOnly`, `Secure` y `SameSite` para sesiones.
- Helmet para cabeceras de seguridad.
- CORS restringido al frontend autorizado.
- Rate limiting para autenticación y carga de archivos.
- Validación de esquemas con Zod o una herramienta equivalente.
- Variables de entorno para secretos.

## Fases de implementación

### Fase 1: frontend sin backend real

- Crear la interfaz.
- Crear la navegación interna.
- Crear las seis subpáginas.
- Utilizar datos simulados.
- Validar el diseño responsive.

### Fase 2: backend local

- Crear API local.
- Implementar acceso protegido.
- Probar sesiones.
- Validar archivos.
- Simular generación de notas.
- Probar rutas de herramienta.

### Fase 3: integraciones autorizadas

- Guardar notas en la bóveda configurada.
- Procesar archivos.
- Abrir OBS Studio mediante un flujo confirmado.
- Conectar servicios de IA.
- Añadir descargas oficiales cuando corresponda.

### Fase 4: publicación

- Separar frontend y backend si es necesario.
- Configurar variables de entorno en el hosting.
- Añadir autenticación para usuarios públicos.
- Configurar almacenamiento seguro.
- Revisar privacidad, costos y límites.

## Decisión de despliegue

Durante el desarrollo y la primera distribución pública, el backend se ejecutará dentro de la aplicación de escritorio. Vercel alojará solo el sitio informativo y de distribución; no habrá backend remoto para las funciones locales.

Las funciones que dependan de rutas locales, Obsidian y OBS Studio deberán permanecer en un servicio local o utilizar una integración explícita, porque un backend remoto no puede acceder directamente a las carpetas y aplicaciones del equipo del usuario.

## Criterio de cierre del paso 4

El paso se considera completado cuando queda aceptado que:

- El frontend y el backend tendrán responsabilidades separadas.
- Las dos primeras herramientas estarán protegidas por backend.
- Los secretos no se almacenarán en el frontend.
- Los archivos y rutas locales se validarán.
- Las integraciones locales se ejecutarán con autorización explícita.
- La maqueta frontend podrá desarrollarse antes de terminar el backend.

## Enfoque local-first

La primera versión debe ejecutarse en el equipo del usuario:

```text
Aplicación de escritorio Tauri
  ↓
Frontend en localhost
  ↓
Backend local en localhost
  ├── Ollama y modelos locales
  ├── Archivos temporales autorizados
  ├── Bóveda local de Obsidian
  └── OBS Studio instalado localmente
```

No se dependerá de un servidor remoto para usar las herramientas personales. Esto permite conservar los archivos y prompts en el equipo y evita costos por consumo de APIs.

### Servicios locales previstos

- Frontend: Vite en `localhost`.
- Backend: Node.js + Express en otro puerto local.
- Modelos: Ollama en `127.0.0.1:11434`.
- Interfaz opcional de modelos: Open WebUI en `localhost`.
- Automatización de código: ClawCode, sujeto a validación local.
- Obsidian: bóveda en una ruta local autorizada.
- OBS Studio: aplicación instalada en Windows.

### Publicación futura

La publicación para otros usuarios se estudiará después. Un backend remoto no tendrá acceso directo a la bóveda de Obsidian, OBS Studio ni carpetas locales; por eso, esas capacidades requerirán un agente local, una aplicación de escritorio o una integración explícita.

## Actualización consolidada: backend para la burbuja contextual

El backend local será también el punto de control entre la extensión contextual y las seis herramientas. Validará la sesión, el origen permitido, el consentimiento, el tipo y tamaño del contexto antes de crear una tarea. No permitirá que la extensión invoque directamente Obsidian, OBS Studio, comandos locales o escritura de archivos; esas acciones pasan siempre por rutas específicas del backend y confirmación del usuario.

La versión pública futura requerirá un agente local separado para conservar esta misma separación de privilegios.

## Actualización de plataforma: backend dentro de la aplicación de escritorio

El backend local se iniciará y supervisará desde el contenedor Tauri. Dejará de considerarse un servidor que el usuario deba ejecutar manualmente en la versión distribuida. Tauri será responsable del ciclo de vida del servicio auxiliar y de las operaciones nativas; Express conservará la API local para la interfaz, modelos y extensión contextual.

Vercel no alojará este backend local. Cualquier futura versión web con procesamiento remoto requerirá una decisión de privacidad, autenticación y costos independiente.
