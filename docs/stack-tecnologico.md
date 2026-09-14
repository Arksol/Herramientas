# Stack tecnolÃ³gico

## DecisiÃ³n general

La plataforma se desarrollarÃ¡ como una aplicaciÃ³n web local-first basada en React, TypeScript y Vite. El frontend serÃ¡ una aplicaciÃ³n de una sola pÃ¡gina con navegaciÃ³n interna entre Inicio, Herramientas, Acerca de y las subpÃ¡ginas de cada herramienta.

El frontend, el backend, los modelos de IA, los archivos y las integraciones con Obsidian y OBS Studio deberÃ¡n ejecutarse localmente durante el desarrollo y en la primera versiÃ³n personal. El uso de servicios remotos serÃ¡ opcional y no obligatorio.

## Frontend principal

### React

React serÃ¡ la base de la interfaz porque permite dividir la plataforma en componentes reutilizables y mantener cada herramienta como un mÃ³dulo independiente.

Se utilizarÃ¡ para:

- Pantalla principal de herramientas.
- Tarjetas clicables.
- SubpÃ¡ginas internas.
- Formularios y Ã¡reas de entrada.
- Estados de carga, Ã©xito y error.
- Componentes compartidos.

### TypeScript

TypeScript se utilizarÃ¡ para definir contratos claros entre componentes, herramientas, formularios y datos. Esto reducirÃ¡ errores al ampliar la plataforma con nuevas herramientas.

### Vite

Vite serÃ¡ el sistema de desarrollo y compilaciÃ³n del frontend. ProporcionarÃ¡ servidor local con recarga rÃ¡pida y una compilaciÃ³n optimizada para producciÃ³n.

Comandos previstos:

```bash
npm run dev
npm run build
npm run preview
```

### React Router

React Router gestionarÃ¡ la navegaciÃ³n interna sin abrir ventanas nuevas ni realizar redirecciones externas.

Rutas iniciales previstas:

```text
/
/herramientas
/herramientas/resumidor-academico
/herramientas/descarga-de-clases
/herramientas/profesor-ingles
/herramientas/profesor-tecnologia
/herramientas/prompts-visuales
/herramientas/prompts-codigo
/acerca-de
```

Las rutas deberÃ¡n conservar el diseÃ±o global y permitir volver a la pantalla de herramientas fÃ¡cilmente.

## Estilos y sistema visual

### Tailwind CSS

Tailwind CSS se utilizarÃ¡ para construir la interfaz responsive y aplicar de forma consistente el sistema visual aprobado.

Se definirÃ¡n tokens para:

- Fondo casi negro.
- Superficies oscuras.
- Texto principal claro.
- Texto secundario gris.
- Bordes sutiles.
- Gradiente azul de acento.
- Espaciado.
- Radios de borde.
- Sombras y efectos de brillo.

### TipografÃ­as

- **Inter:** texto de interfaz, descripciones, navegaciÃ³n y controles.
- **Instrument Serif:** encabezados y tÃ­tulos destacados en cursiva.

### DiseÃ±o responsive

Se aplicarÃ¡ un enfoque mobile-first:

- Una columna en pantallas pequeÃ±as.
- Dos columnas en tabletas cuando sea adecuado.
- Tres columnas para las tarjetas en escritorio.
- MenÃº compacto en dispositivos mÃ³viles.
- Ãreas clicables amplias.
- Sin depender Ãºnicamente de efectos hover.

## AnimaciÃ³n e interacciÃ³n

### GSAP

GSAP se utilizarÃ¡ para animaciones controladas por tiempo o scroll:

- Entrada del encabezado.
- Revelado del nombre de la plataforma.
- Transiciones suaves.
- Marquee del footer si se mantiene.
- Parallax y efectos visuales especiales.

Las animaciones deberÃ¡n limpiarse correctamente al desmontar componentes.

### Motion para React

Motion para React, conocido anteriormente como Framer Motion, se utilizarÃ¡ para:

- Apariciones vinculadas al viewport.
- Transiciones de pÃ¡ginas internas.
- Animaciones de tarjetas.
- Presencia y salida de elementos.

GSAP y Motion no deberÃ¡n controlar simultÃ¡neamente la misma propiedad sin una razÃ³n clara.

### hls.js

hls.js se reservarÃ¡ para reproducir videos HLS autorizados en Ã¡reas visuales especÃ­ficas. No serÃ¡ una dependencia necesaria para la pantalla principal si el dashboard no utiliza video.

El uso de videos deberÃ¡ contemplar:

- ReproducciÃ³n silenciada.
- Fallback a HLS nativo cuando corresponda.
- Carga diferida.
- OptimizaciÃ³n para dispositivos mÃ³viles.
- Respeto de derechos y autorizaciones.

## Estado y datos

### Primera etapa

Los datos de las seis herramientas se mantendrÃ¡n en archivos TypeScript tipados. Esto permitirÃ¡ construir la navegaciÃ³n sin depender todavÃ­a de una base de datos.

### Etapas posteriores

Cuando se requiera persistencia se evaluarÃ¡n:

- React Context para estados globales pequeÃ±os.
- Zustand para estado global mÃ¡s complejo.
- API propia para configuraciones, historial y resultados.
- Supabase si se necesita autenticaciÃ³n, base de datos y almacenamiento.

No se aÃ±adirÃ¡ una soluciÃ³n de estado compleja antes de que exista una necesidad real.

## Backend previsto

El backend no forma parte de la primera maquetaciÃ³n, pero la arquitectura quedarÃ¡ preparada para incorporarlo.

Stack previsto:

- Node.js.
- Express.
- TypeScript.
- API REST.
- ValidaciÃ³n de entradas.
- Helmet.
- CORS restringido.
- Rate limiting.
- Variables de entorno.

El backend serÃ¡ necesario para:

- Guardar notas en una bÃ³veda mediante una integraciÃ³n autorizada.
- Procesar archivos pesados.
- Gestionar configuraciones privadas.
- Ocultar claves de API.
- Integrar servicios externos.
- Administrar usuarios e historial.

## Integraciones futuras

- Obsidian mediante escritura local controlada o integraciÃ³n autorizada.
- OBS Studio mediante apertura local y flujo confirmado por el usuario.
- Class de UVM, EBAC, Mastermind y Platzi respetando sus polÃ­ticas.
- Servicios de inteligencia artificial.
- Repositorios GitHub para proyectos y prompts.

## Calidad y pruebas

Herramientas previstas para etapas posteriores:

- ESLint para calidad de cÃ³digo.
- Prettier para formato consistente.
- Vitest para pruebas unitarias.
- React Testing Library para componentes.
- Playwright para pruebas de navegaciÃ³n.
- Lighthouse para rendimiento y accesibilidad.

## Despliegue

### AplicaciÃ³n principal

La aplicaciÃ³n principal se distribuirÃ¡ como escritorio local-first con Tauri v2. TendrÃ¡ instaladores por plataforma y empaquetarÃ¡ la interfaz, el servicio local y las integraciones autorizadas.

### Sitio pÃºblico

Vercel alojarÃ¡ Ãºnicamente un sitio Vite estÃ¡tico conectado a GitHub. MostrarÃ¡ el producto, su documentaciÃ³n y enlaces a instaladores verificados; no hospedarÃ¡ el backend local ni datos de usuarios.

### Backend remoto

No se contempla un backend remoto en la primera distribuciÃ³n. Si en el futuro se propone uno, deberÃ¡ aprobarse una arquitectura distinta de privacidad, costos y autenticaciÃ³n.

## MigraciÃ³n desde el proyecto actual

El proyecto actual es una plantilla HTML, CSS y JavaScript modular. La migraciÃ³n se realizarÃ¡ de forma controlada:

1. Crear la configuraciÃ³n de React + Vite + TypeScript.
2. Mantener el repositorio y la documentaciÃ³n existente.
3. Convertir el diseÃ±o global en componentes React.
4. Reutilizar los tokens visuales y la estructura conceptual.
5. Trasladar la navegaciÃ³n a React Router.
6. Migrar las seis tarjetas a datos tipados.
7. Crear las subpÃ¡ginas internas.
8. Eliminar gradualmente la lÃ³gica de prueba anterior.
9. Ejecutar las verificaciones de build y navegaciÃ³n.

## DecisiÃ³n de alcance

En el siguiente paso se implementarÃ¡ Ãºnicamente la base frontend y la navegaciÃ³n visual. No se integrarÃ¡n todavÃ­a APIs, autenticaciÃ³n, descargas, OBS Studio ni escritura automÃ¡tica en Obsidian.

## Fuentes tÃ©cnicas

- [GuÃ­a oficial de Vite](https://vite.dev/guide/)
- [CLI y compilaciÃ³n de Vite](https://vite.dev/guide/cli)
- [GSAP](https://gsap.com/docs/v3/)
- [Motion para React](https://motion.dev/docs/react)
- [hls.js](https://github.com/video-dev/hls.js/)

## Fondo animado del proyecto

El stack contempla explÃ­citamente el fondo animado definido en [Idea frontend del proyecto](C:\Users\ulise\.codex\visualizations\2026\07\23\019f8ccc-106b-7bf2-99e1-a2ffbd544a2a\Idea frontend del proyecto.md).

La implementaciÃ³n deberÃ¡ incluir:

- Fondo base casi negro.
- IluminaciÃ³n azul frÃ­a y abstracta en los bordes.
- Formas orgÃ¡nicas o partÃ­culas con movimiento lento.
- Degradados suaves y profundidad visual.
- AnimaciÃ³n sutil de posiciÃ³n, escala y opacidad.
- Efectos de brillo muy moderados.
- Capas visuales detrÃ¡s del contenido, sin afectar su legibilidad.
- DegradaciÃ³n controlada en dispositivos de bajo rendimiento.
- DesactivaciÃ³n o reducciÃ³n del movimiento cuando el usuario prefiera menos animaciones.

TecnologÃ­as previstas:

- CSS con `radial-gradient`, `linear-gradient` y pseudo-elementos para la base visual.
- GSAP para movimientos continuos y controlados.
- Motion para entradas y transiciones de elementos React.
- Canvas o imÃ¡genes generadas Ãºnicamente si aportan una mejora real.
- hls.js solo para fondos de video HLS autorizados; no serÃ¡ obligatorio para el fondo principal.

La prioridad serÃ¡ reproducir la atmÃ³sfera del diseÃ±o aprobado sin convertir el fondo en una distracciÃ³n ni perjudicar el rendimiento.

## Control de acceso para herramientas privadas

Las dos primeras herramientas requerirÃ¡n un cÃ³digo o contraseÃ±a antes de permitir su uso:

1. Resumidor acadÃ©mico y Obsidian.
2. Descarga de clases.

Para la primera versiÃ³n se contempla un cÃ³digo de acceso comÃºn. MÃ¡s adelante podrÃ¡ sustituirse por cÃ³digos independientes, cuentas de usuario o permisos por herramienta.

### Requisitos de seguridad

- La interfaz puede mostrar la pantalla de acceso, pero el backend debe aplicar la autorizaciÃ³n real.
- El cÃ³digo no debe estar escrito directamente en React, JavaScript, HTML ni archivos pÃºblicos.
- No se debe guardar la contraseÃ±a en texto plano.
- El backend debe comparar el cÃ³digo con un hash seguro almacenado en una variable de entorno o un gestor de secretos.
- La sesiÃ³n autorizada debe utilizar una cookie segura, `HttpOnly`, `SameSite` y, en producciÃ³n, `Secure`.
- Debe existir expiraciÃ³n de sesiÃ³n.
- Debe aplicarse rate limiting a los intentos de acceso.
- Los mensajes de error no deben revelar si el cÃ³digo estuvo parcialmente correcto.
- No se deben registrar contraseÃ±as, cÃ³digos ni tokens en logs.
- Las rutas y APIs de ambas herramientas deben verificar autorizaciÃ³n en cada solicitud.
- La protecciÃ³n debe mantenerse aunque el usuario intente entrar directamente a una URL interna.

### Arquitectura prevista

```text
Usuario
  â†“
Pantalla de acceso
  â†“
Backend valida cÃ³digo contra hash seguro
  â†“
SesiÃ³n autorizada
  â†“
Acceso a la herramienta protegida
```

La protecciÃ³n no se implementarÃ¡ como una simple condiciÃ³n visual del frontend, porque cualquier usuario podrÃ­a saltÃ¡rsela inspeccionando el cÃ³digo del navegador.

## Inteligencia artificial local y open source

Las herramientas que requieran inteligencia artificial deberÃ¡n priorizar modelos ejecutados en el equipo del usuario, sin pagar una API o suscripciÃ³n a una empresa externa.

### Runtime local principal

Se evaluarÃ¡ **Ollama** como runtime local para descargar y ejecutar modelos mediante una API en `localhost`. Ollama puede operar en modo exclusivamente local desactivando sus funciones cloud; la API local se mantiene en `127.0.0.1:11434` por defecto.

### Interfaz local opcional

Se podrÃ¡ utilizar **Open WebUI** como interfaz local opcional para administrar modelos, conversaciones, instrucciones y bases de conocimiento. No serÃ¡ obligatorio para que Herramientas funcione, porque la plataforma podrÃ¡ comunicarse directamente con la API local de Ollama.

### ClawCode

Se considerarÃ¡ **Claw Code** (`ultraworkers/claw-code`) como candidato prioritario para las tareas de programaciÃ³n y asistencia sobre el repositorio. El proyecto se presenta como un agente de cÃ³digo escrito en Rust y publicado bajo licencia MIT. Debe validarse localmente su instalaciÃ³n, sus dependencias, su modelo de ejecuciÃ³n y su compatibilidad con el flujo de Herramientas antes de integrarlo.

ClawCode serÃ¡ una herramienta de desarrollo y orquestaciÃ³n, no el modelo de inteligencia artificial en sÃ­. El modelo utilizado deberÃ¡ revisarse por separado, incluyendo licencia, tamaÃ±o, rendimiento y compatibilidad con el hardware del equipo.

### Modelos locales candidatos

La selecciÃ³n final dependerÃ¡ de la memoria RAM, GPU, almacenamiento y velocidad del equipo. Se evaluarÃ¡n modelos locales de familias como:

- Qwen para cÃ³digo, razonamiento y anÃ¡lisis general.
- Gemma para tareas generales y educativas.
- Mistral para texto y clasificaciÃ³n.
- Modelos de visiÃ³n compatibles para imÃ¡genes y capturas.
- Modelos de transcripciÃ³n locales para audio y video.
- Modelos de embeddings locales para bÃºsqueda en documentos.

No se asumirÃ¡ que todos los modelos son open source en sentido estricto. Antes de incorporarlos se verificarÃ¡ su licencia y se distinguirÃ¡ entre software open source, modelos de pesos abiertos y modelos con restricciones de uso.

### AsignaciÃ³n inicial por herramienta

- **Resumidor acadÃ©mico:** modelo local de texto, embeddings locales y, cuando sea necesario, transcripciÃ³n local.
- **Descarga de clases:** procesamiento local de metadatos, audio y video; IA Ãºnicamente para clasificaciÃ³n, transcripciÃ³n o generaciÃ³n de nombres y notas.
- **Profesor de inglÃ©s:** modelo local de texto y, posteriormente, modelos locales de voz y transcripciÃ³n.
- **Profesor de tecnologÃ­a:** modelo local orientado a explicaciÃ³n tÃ©cnica y cÃ³digo.
- **Arquitecto de prompts visuales:** modelo local de visiÃ³n para imÃ¡genes y fotogramas de video, ademÃ¡s de un modelo de texto.
- **Arquitecto de prompts de cÃ³digo:** ClawCode como candidato de asistencia de programaciÃ³n, junto con un modelo local compatible.

### Reglas de privacidad

- Los prompts, archivos y resultados deben permanecer en el equipo por defecto.
- Ollama deberÃ¡ configurarse en modo local-only cuando no se requieran funciones cloud.
- El servidor local no debe exponerse a internet ni a la red local sin autenticaciÃ³n y una razÃ³n explÃ­cita.
- No se enviarÃ¡n archivos privados a proveedores externos por defecto.
- Las descargas de modelos se realizarÃ¡n solamente desde fuentes verificables y se conservarÃ¡n sus licencias.
- La aplicaciÃ³n debe informar cuando una funciÃ³n requiere descargar un modelo grande o utilizar recursos importantes.

## ActualizaciÃ³n del paso 6: arquitectura de la burbuja

AdemÃ¡s de React Router, el frontend incorporarÃ¡ un componente `ContextualLauncher` y un `ContextAdapter` desacoplado por dominio. El adaptador enviarÃ¡ al backend solo metadatos y contenido seleccionado por el usuario. Los adaptadores de Class UVM, EBAC, Mastermind y Platzi se implementarÃ¡n de forma aislada y solo para acciones autorizadas.

La burbuja funcionarÃ¡ localmente, respetarÃ¡ el fondo animado aprobado y deberÃ¡ contemplar `prefers-reduced-motion`, navegaciÃ³n por teclado y una posiciÃ³n que no cubra controles importantes de la pÃ¡gina.

## ActualizaciÃ³n consolidada: soporte tÃ©cnico para dos modos

La arquitectura tendrÃ¡ tres piezas locales y tipadas con TypeScript:

- **AplicaciÃ³n React:** catÃ¡logo, subpÃ¡ginas, burbuja en modo integrado y panel de trabajo.
- **Servicio local Node/Express:** sesiones, IA local, archivos, Obsidian, OBS Studio y validaciÃ³n de contexto.
- **ExtensiÃ³n del navegador Manifest V3:** burbuja en modo contextual, selecciÃ³n explÃ­cita de contenido y comunicaciÃ³n autenticada con el servicio local.

Se crearÃ¡ un paquete compartido de tipos para `ToolId`, `OperationMode`, `ContextPayload`, `ContextPermission` y `SessionState`. La extensiÃ³n usarÃ¡ permisos opcionales por dominio y no serÃ¡ requisito para ejecutar Herramientas en modo integrado.

## ActualizaciÃ³n de plataforma: escritorio local-first y Vercel

El stack se amplÃ­a con **Tauri v2** como contenedor de escritorio para la interfaz React/Vite. El backend local de Node/Express se empaquetarÃ¡ como servicio auxiliar controlado por la aplicaciÃ³n; seguirÃ¡ siendo necesario para la extensiÃ³n contextual y las integraciones locales. La interfaz y tipos reutilizables se compartirÃ¡n con un sitio Vite estÃ¡tico separado para Vercel.

No se moverÃ¡n Ollama, Obsidian, OBS Studio, archivos ni secretos al despliegue de Vercel. El sitio pÃºblico serÃ¡ solo informativo y de distribuciÃ³n.

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

No se agregara un framework remoto de agentes como dependencia obligatoria. Si se usa un SDK de agentes en el futuro, debera poder operar con privacidad local o con consentimiento explicito del usuario.