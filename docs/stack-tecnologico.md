# Stack tecnológico

## Decisión general

La plataforma se desarrollará como una aplicación web local-first basada en React, TypeScript y Vite. El frontend será una aplicación de una sola página con navegación interna entre Inicio, Herramientas, Acerca de y las subpáginas de cada herramienta.

El frontend, el backend, los modelos de IA, los archivos y las integraciones con Obsidian y OBS Studio deberán ejecutarse localmente durante el desarrollo y en la primera versión personal. El uso de servicios remotos será opcional y no obligatorio.

## Frontend principal

### React

React será la base de la interfaz porque permite dividir la plataforma en componentes reutilizables y mantener cada herramienta como un módulo independiente.

Se utilizará para:

- Pantalla principal de herramientas.
- Tarjetas clicables.
- Subpáginas internas.
- Formularios y áreas de entrada.
- Estados de carga, éxito y error.
- Componentes compartidos.

### TypeScript

TypeScript se utilizará para definir contratos claros entre componentes, herramientas, formularios y datos. Esto reducirá errores al ampliar la plataforma con nuevas herramientas.

### Vite

Vite será el sistema de desarrollo y compilación del frontend. Proporcionará servidor local con recarga rápida y una compilación optimizada para producción.

Comandos previstos:

```bash
npm run dev
npm run build
npm run preview
```

### React Router

React Router gestionará la navegación interna sin abrir ventanas nuevas ni realizar redirecciones externas.

Rutas iniciales previstas:

```text
/
/herramientas
/herramientas/resumidor-academico
/herramientas/descarga-de-clases
/herramientas/profesor-inglés
/herramientas/profesor-tecnología
/herramientas/prompts-visuales
/herramientas/prompts-codigo
/acerca-de
```

Las rutas deberán conservar el diseño global y permitir volver a la pantalla de herramientas fácilmente.

## Estilos y sistema visual

### Tailwind CSS

Tailwind CSS se utilizará para construir la interfaz responsive y aplicar de forma consistente el sistema visual aprobado.

Se definirán tokens para:

- Fondo casi negro.
- Superficies oscuras.
- Texto principal claro.
- Texto secundario gris.
- Bordes sutiles.
- Gradiente azul de acento.
- Espaciado.
- Radios de borde.
- Sombras y efectos de brillo.

### Tipografías

- **Inter:** texto de interfaz, descripciones, navegación y controles.
- **Instrument Serif:** encabezados y títulos destacados en cursiva.

### Diseño responsive

Se aplicará un enfoque mobile-first:

- Una columna en pantallas pequeñas.
- Dos columnas en tabletas cuando sea adecuado.
- Tres columnas para las tarjetas en escritorio.
- Menú compacto en dispositivos móviles.
- Áreas clicables amplias.
- Sin depender únicamente de efectos hover.

## Animación e interacción

### GSAP

GSAP se utilizará para animaciones controladas por tiempo o scroll:

- Entrada del encabezado.
- Revelado del nombre de la plataforma.
- Transiciones suaves.
- Marquee del footer si se mantiene.
- Parallax y efectos visuales especiales.

Las animaciones deberán limpiarse correctamente al desmontar componentes.

### Motion para React

Motion para React, conocido anteriormente como Framer Motion, se utilizará para:

- Apariciones vinculadas al viewport.
- Transiciones de páginas internas.
- Animaciones de tarjetas.
- Presencia y salida de elementos.

GSAP y Motion no deberán controlar simultáneamente la misma propiedad sin una razón clara.

### hls.js

hls.js se reservará para reproducir videos HLS autorizados en áreas visuales específicas. No será una dependencia necesaria para la pantalla principal si el dashboard no utiliza video.

El uso de videos deberá contemplar:

- Reproducción silenciada.
- Fallback a HLS nativo cuando corresponda.
- Carga diferida.
- Optimización para dispositivos móviles.
- Respeto de derechos y autorizaciones.

## Estado y datos

### Primera etapa

Los datos de las siete herramientas se mantendrán en archivos TypeScript tipados. Esto permitirá construir la navegación sin depender todavía de una base de datos.

### Etapas posteriores

Cuando se requiera persistencia se evaluarán:

- React Context para estados globales pequeños.
- Zustand para estado global más complejo.
- API propia para configuraciones, historial y resultados.
- Supabase si se necesita autenticación, base de datos y almacenamiento.

No se añadirá una solución de estado compleja antes de que exista una necesidad real.

## Backend previsto

El backend no forma parte de la primera maquetación, pero la arquitectura quedará preparada para incorporarlo.

Stack previsto:

- Node.js.
- Express.
- TypeScript.
- API REST.
- Validación de entradas.
- Helmet.
- CORS restringido.
- Rate limiting.
- Variables de entorno.

El backend será necesario para:

- Guardar notas en una bóveda mediante una integración autorizada.
- Procesar archivos pesados.
- Gestionar configuraciones privadas.
- Ocultar claves de API.
- Integrar servicios externos.
- Administrar usuarios e historial.

## Integraciones futuras

- Obsidian mediante escritura local controlada o integración autorizada.
- OBS Studio mediante apertura local y flujo confirmado por el usuario.
- Class de UVM, EBAC, Mastermind y Platzi respetando sus políticas.
- Servicios de inteligencia artificial.
- Repositorios GitHub para proyectos y prompts.

## Calidad y pruebas

Herramientas previstas para etapas posteriores:

- ESLint para calidad de código.
- Prettier para formato consistente.
- Vitest para pruebas unitarias.
- React Testing Library para componentes.
- Playwright para pruebas de navegación.
- Lighthouse para rendimiento y accesibilidad.

## Despliegue

### Aplicación principal

La aplicación principal se distribuirá como escritorio local-first con Tauri v2. Tendrá instaladores por plataforma y empaquetará la interfaz, el servicio local y las integraciones autorizadas.

### Sitio público

Vercel alojará únicamente un sitio Vite estático conectado a GitHub. Mostrará el producto, su documentación y enlaces a instaladores verificados; no hospedará el backend local ni datos de usuarios.

### Backend remoto

No se contempla un backend remoto en la primera distribución. Si en el futuro se propone uno, deberá aprobarse una arquitectura distinta de privacidad, costos y autenticación.

## Migración desde el proyecto actual

El proyecto actual es una plantilla HTML, CSS y JavaScript modular. La migración se realizará de forma controlada:

1. Crear la configuración de React + Vite + TypeScript.
2. Mantener el repositorio y la documentación existente.
3. Convertir el diseño global en componentes React.
4. Reutilizar los tokens visuales y la estructura conceptual.
5. Trasladar la navegación a React Router.
6. Migrar las siete tarjetas a datos tipados.
7. Crear las subpáginas internas.
8. Eliminar gradualmente la lógica de prueba anterior.
9. Ejecutar las verificaciones de build y navegación.

## Decisión de alcance

En el siguiente paso se implementará únicamente la base frontend y la navegación visual. No se integrarán todavía APIs, autenticación, descargas, OBS Studio ni escritura automática en Obsidian.

## Fuentes técnicas

- [Guía oficial de Vite](https://vite.dev/guide/)
- [CLI y compilación de Vite](https://vite.dev/guide/cli)
- [GSAP](https://gsap.com/docs/v3/)
- [Motion para React](https://motion.dev/docs/react)
- [hls.js](https://github.com/video-dev/hls.js/)

## Fondo animado del proyecto

El stack contempla explícitamente el fondo animado definido en [Idea frontend del proyecto](C:\Users\ulise\.codex\visualizations\2026\07\23\019f8ccc-106b-7bf2-99e1-a2ffbd544a2a\Idea frontend del proyecto.md).

La implementación deberá incluir:

- Fondo base casi negro.
- Iluminación azul fría y abstracta en los bordes.
- Formas orgánicas o partículas con movimiento lento.
- Degradados suaves y profundidad visual.
- Animación sutil de posición, escala y opacidad.
- Efectos de brillo muy moderados.
- Capas visuales detrás del contenido, sin afectar su legibilidad.
- Degradación controlada en dispositivos de bajo rendimiento.
- Desactivación o reducción del movimiento cuando el usuario prefiera menos animaciones.

Tecnologías previstas:

- CSS con `radial-gradient`, `linear-gradient` y pseudo-elementos para la base visual.
- GSAP para movimientos continuos y controlados.
- Motion para entradas y transiciones de elementos React.
- Canvas o imágenes generadas únicamente si aportan una mejora real.
- hls.js solo para fondos de video HLS autorizados; no será obligatorio para el fondo principal.

La prioridad será reproducir la atmósfera del diseño aprobado sin convertir el fondo en una distracción ni perjudicar el rendimiento.

## Control de acceso para herramientas privadas

Las dos primeras herramientas requerirán un código o contraseña antes de permitir su uso:

1. Resumidor académico y Obsidian.
2. Descarga de clases.

Para la primera versión se contempla un código de acceso común. Más adelante podrá sustituirse por códigos independientes, cuentas de usuario o permisos por herramienta.

### Requisitos de seguridad

- La interfaz puede mostrar la pantalla de acceso, pero el backend debe aplicar la autorización real.
- El código no debe estar escrito directamente en React, JavaScript, HTML ni archivos públicos.
- No se debe guardar la contraseña en texto plano.
- El backend debe comparar el código con un hash seguro almacenado en una variable de entorno o un gestor de secretos.
- La sesión autorizada debe utilizar una cookie segura, `HttpOnly`, `SameSite` y, en producción, `Secure`.
- Debe existir expiración de sesión.
- Debe aplicarse rate limiting a los intentos de acceso.
- Los mensajes de error no deben revelar si el código estuvo parcialmente correcto.
- No se deben registrar contraseñas, códigos ni tokens en logs.
- Las rutas y APIs de ambas herramientas deben verificar autorización en cada solicitud.
- La protección debe mantenerse aunque el usuario intente entrar directamente a una URL interna.

### Arquitectura prevista

```text
Usuario
  ↓
Pantalla de acceso
  ↓
Backend valida código contra hash seguro
  ↓
Sesión autorizada
  ↓
Acceso a la herramienta protegida
```

La protección no se implementará como una simple condición visual del frontend, porque cualquier usuario podría saltársela inspeccionando el código del navegador.

## Inteligencia artificial local y open source

Las herramientas que requieran inteligencia artificial deberán priorizar modelos ejecutados en el equipo del usuario, sin pagar una API o suscripción a una empresa externa.

### Runtime local principal

Se evaluará **Ollama** como runtime local para descargar y ejecutar modelos mediante una API en `localhost`. Ollama puede operar en modo exclusivamente local desactivando sus funciones cloud; la API local se mantiene en `127.0.0.1:11434` por defecto.

### Interfaz local opcional

Se podrá utilizar **Open WebUI** como interfaz local opcional para administrar modelos, conversaciones, instrucciones y bases de conocimiento. No será obligatorio para que Herramientas funcione, porque la plataforma podrá comunicarse directamente con la API local de Ollama.

### OpenClaw / ClawCode

Se considerará **Claw Code** (`ultraworkers/claw-code`) como candidato prioritario para las tareas de programación y asistencia sobre el repositorio. El proyecto se presenta como un agente de código escrito en Rust y publicado bajo licencia MIT. Debe validarse localmente su instalación, sus dependencias, su modelo de ejecución y su compatibilidad con el flujo de Herramientas antes de integrarlo.

OpenClaw/ClawCode seran herramientas de conexion, desarrollo u orquestacion, no el modelo de inteligencia artificial en si. El modelo utilizado deberá revisarse por separado, incluyendo licencia, tamaño, rendimiento y compatibilidad con el hardware del equipo.

### Modelos locales candidatos

La selección final dependerá de la memoria RAM, GPU, almacenamiento y velocidad del equipo. Se evaluarán modelos locales de familias como:

- Qwen para código, razonamiento y análisis general.
- Gemma para tareas generales y educativas.
- Mistral para texto y clasificación.
- Modelos de visión compatibles para imágenes y capturas.
- Modelos de transcripción locales para audio y video.
- Modelos de embeddings locales para búsqueda en documentos.

No se asumirá que todos los modelos son open source en sentido estricto. Antes de incorporarlos se verificará su licencia y se distinguirá entre software open source, modelos de pesos abiertos y modelos con restricciones de uso.

### Asignación inicial por herramienta

- **Resumidor académico:** modelo local de texto, embeddings locales y, cuando sea necesario, transcripción local.
- **Descarga de clases:** procesamiento local de metadatos, audio y video; IA únicamente para clasificación, transcripción o generación de nombres y notas.
- **Profesor de inglés:** modelo local de texto y, posteriormente, modelos locales de voz y transcripción.
- **Profesor de tecnología:** modelo local orientado a explicación técnica y código.
- **Arquitecto de prompts visuales:** modelo local de visión para imágenes y fotogramas de video, además de un modelo de texto.
- **Arquitecto de prompts de código:** ClawCode como candidato de asistencia de programación, junto con un modelo local compatible.

### Reglas de privacidad

- Los prompts, archivos y resultados deben permanecer en el equipo por defecto.
- Ollama deberá configurarse en modo local-only cuando no se requieran funciones cloud.
- El servidor local no debe exponerse a internet ni a la red local sin autenticación y una razón explícita.
- No se enviarán archivos privados a proveedores externos por defecto.
- Las descargas de modelos se realizarán solamente desde fuentes verificables y se conservarán sus licencias.
- La aplicación debe informar cuando una función requiere descargar un modelo grande o utilizar recursos importantes.

## Actualización del paso 6: arquitectura de la burbuja

Además de React Router, el frontend incorporará un componente `ContextualLauncher` y un `ContextAdapter` desacoplado por dominio. El adaptador enviará al backend solo metadatos y contenido seleccionado por el usuario. Los adaptadores de Class UVM, EBAC, Mastermind y Platzi se implementarán de forma aislada y solo para acciones autorizadas.

La burbuja funcionará localmente, respetará el fondo animado aprobado y deberá contemplar `prefers-reduced-motion`, navegación por teclado y una posición que no cubra controles importantes de la página.

## Actualización consolidada: soporte técnico para dos modos

La arquitectura tendrá tres piezas locales y tipadas con TypeScript:

- **Aplicación React:** catálogo, subpáginas, burbuja en modo integrado y panel de trabajo.
- **Servicio local Node/Express:** sesiones, IA local, archivos, Obsidian, OBS Studio y validación de contexto.
- **Extensión del navegador Manifest V3:** burbuja en modo contextual, selección explícita de contenido y comunicación autenticada con el servicio local.

Se creará un paquete compartido de tipos para `ToolId`, `OperationMode`, `ContextPayload`, `ContextPermission` y `SessionState`. La extensión usará permisos opcionales por dominio y no será requisito para ejecutar Herramientas en modo integrado.

## Actualización de plataforma: escritorio local-first y Vercel

El stack se amplía con **Tauri v2** como contenedor de escritorio para la interfaz React/Vite. El backend local de Node/Express se empaquetará como servicio auxiliar controlado por la aplicación; seguirá siendo necesario para la extensión contextual y las integraciones locales. La interfaz y tipos reutilizables se compartirán con un sitio Vite estático separado para Vercel.

No se moverán Ollama, Obsidian, OBS Studio, archivos ni secretos al despliegue de Vercel. El sitio público será solo informativo y de distribución.

## Actualizacion: capa de agentes locales

El stack incorpora una capa de agentes locales sobre el backend/Tauri:

```text
React UI
  -> Coordinador local
  -> Registro de agentes
  -> Pipeline multimodal local
  -> Ollama / ffmpeg / Obsidian / OBS / archivos
```

Implementacion prevista:

- Declaracion tipada de agentes en TypeScript para la interfaz.
- Contratos Rust/Tauri y Node/Express para invocar agentes.
- Runtime local con Ollama para texto y vision.
- Extractores locales compartidos para links, archivos, imagenes y video.
- Memoria local por agente y perfil en una etapa posterior.
- Notificaciones locales y linea de tiempo para agenda, entregas, cursos y objetivos personales.

No se agregara un framework remoto de agentes como dependencia obligatoria. OpenClaw solo se aceptara si puede funcionar como conexion local controlada, con permisos explicitos y sin exponer datos privados por defecto. Si se usa un SDK de agentes en el futuro, debera poder operar con privacidad local o con consentimiento explicito del usuario.
## Actualizacion: PWA y separacion por plataforma educativa

El frontend web tambien debera poder publicarse como PWA instalable para iOS, Android, Linux y ChromeOS/dispositivos Google.

Requisitos tecnicos de la PWA:

- `manifest.webmanifest` con nombre, iconos, color de tema y modo standalone.
- Service worker para cache de shell, recursos estaticos y modo offline limitado.
- Diseno responsive y tactil para telefono, tablet y escritorio ligero.
- Almacenamiento local seguro para preferencias no sensibles, agenda visible y estado de repaso.
- Separacion estricta entre capacidades PWA y capacidades desktop/Tauri.

La PWA no ejecutara modelos locales pesados ni controlara OBS, Obsidian o archivos del sistema. Es una aplicacion companion para consulta, agenda, repaso, resumenes ya generados y flujos vivos/contextuales cuando la plataforma y el navegador lo permitan.

Separacion educativa:

- UVM/Class: unico flujo previsto para descargar clases de carrera, siempre mediante opciones oficiales o autorizadas.
- EBAC, Mastermind, Platzi, Coursera y YouTube: modo vivo/contextual para marcar temas, dudas y momentos importantes; generar resumen en tiempo real o incremental; evitar descarga salvo opcion oficial clara y permitida.

## Actualización vigente: administrador, producto público y Profesor de música

El catálogo vigente contiene siete herramientas e incorpora el **Profesor de música**. Su agente crea planes adaptables de teoría, oído, instrumento, composición y práctica; recibe texto, objetivos o material autorizado y no conserva capturas ni archivos temporales después de siete días.

La aplicación de escritorio corresponde al modo administrador privado. El producto público queda pendiente y deberá aislar por completo cuentas, perfiles, notas y memoria. Ningún dato configurado por el administrador se reutiliza en la experiencia pública.
