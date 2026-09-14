# DefiniciÃ³n del proyecto

## Nombre

**Herramientas**

## DescripciÃ³n ejecutiva

Herramientas es una plataforma web modular diseÃ±ada para centralizar un conjunto de asistentes digitales orientados al aprendizaje, la programaciÃ³n, la productividad y la creaciÃ³n de contenido. La plataforma comenzarÃ¡ como una herramienta personal y podrÃ¡ evolucionar posteriormente hacia un servicio disponible para otros usuarios.

La experiencia se organizarÃ¡ como una aplicaciÃ³n web de una sola pÃ¡gina. Desde la pantalla principal, el usuario podrÃ¡ seleccionar una herramienta mediante tarjetas visuales. Cada tarjeta abrirÃ¡ una subpÃ¡gina interna dentro de la misma aplicaciÃ³n, sin crear ventanas nuevas ni redirigir a sitios externos.

## Problema que resuelve

Las actividades de aprendizaje, creaciÃ³n de prompts, programaciÃ³n, organizaciÃ³n de clases y desarrollo profesional suelen realizarse en herramientas separadas. Esto fragmenta el flujo de trabajo, dificulta encontrar los recursos y obliga a repetir configuraciones e instrucciones.

Herramientas resolverÃ¡ esta fragmentaciÃ³n mediante una interfaz centralizada que permita acceder a distintas capacidades desde un mismo espacio, con una identidad visual y una navegaciÃ³n coherentes.

## PropÃ³sito

Proporcionar un punto de acceso Ãºnico a herramientas digitales especializadas que ayuden al usuario a aprender, crear, organizar informaciÃ³n y desarrollar proyectos tecnolÃ³gicos de forma estructurada.

## Objetivo principal

Construir una aplicaciÃ³n web modular en la que el usuario pueda descubrir y utilizar seis herramientas iniciales desde una interfaz central, con navegaciÃ³n interna, arquitectura extensible y capacidad para incorporar nuevas herramientas en el futuro.

## Usuarios

### Usuario principal

La primera versiÃ³n estarÃ¡ orientada al propietario del proyecto, quien utilizarÃ¡ la plataforma para organizar sus flujos de estudio, programaciÃ³n, creaciÃ³n de contenido y desarrollo profesional.

### Usuarios futuros

En etapas posteriores, la plataforma podrÃ¡ adaptarse para:

- Estudiantes.
- Desarrolladores.
- Creadores de contenido.
- Profesionales de tecnologÃ­a.
- Personas que necesiten centralizar herramientas de inteligencia artificial.

## Herramientas iniciales

La primera versiÃ³n incluirÃ¡ seis subpÃ¡ginas funcionales:

1. **Resumidor acadÃ©mico y Obsidian**
   - Analizar clases, pÃ¡ginas, documentos y recursos educativos.
   - Generar resÃºmenes estructurados.
   - Preparar notas compatibles con Obsidian.

2. **Descarga de clases**
   - Organizar clases y recursos autorizados.
   - Gestionar materiales disponibles sin conexiÃ³n.
   - Respetar las polÃ­ticas de descarga de cada plataforma.

3. **Profesor de inglÃ©s C1**
   - Evaluar el nivel inicial.
   - Crear rutas de aprendizaje.
   - Practicar conversaciÃ³n, escritura, comprensiÃ³n y pronunciaciÃ³n.

4. **Profesor integral de tecnologÃ­a**
   - EnseÃ±ar desarrollo fullstack, ciencia de datos, ciberseguridad, robÃ³tica, hardware y software.
   - Explicar fundamentos tÃ©cnicos, matemÃ¡ticos y fÃ­sicos.
   - Guiar ejercicios y proyectos prÃ¡cticos.

5. **Arquitecto de prompts visuales**
   - Convertir ideas en prompts precisos para crear o editar imÃ¡genes.
   - Adaptar prompts a distintas plataformas de generaciÃ³n visual.
   - Explicar los cambios realizados y los parÃ¡metros recomendados.

6. **Arquitecto de prompts de cÃ³digo**
   - Convertir requisitos e ideas en prompts tÃ©cnicos.
   - Definir stack, estructura, seguridad, pruebas y criterios de aceptaciÃ³n.
   - Ayudar a corregir y mejorar solicitudes para herramientas de programaciÃ³n.

## Funcionalidades obligatorias de la primera versiÃ³n

- Mostrar una pantalla principal con las seis herramientas.
- Representar cada herramienta mediante una tarjeta visual completa y clicable.
- Abrir cada herramienta dentro de una subpÃ¡gina de la misma aplicaciÃ³n.
- Mantener una navegaciÃ³n principal con Inicio, Herramientas y Acerca de.
- Incluir un apartado para crear o registrar nuevas herramientas.
- Mantener una identidad visual oscura, editorial y consistente.
- Permitir ampliar la plataforma sin rediseÃ±ar la navegaciÃ³n principal.
- Utilizar componentes reutilizables.
- Garantizar una experiencia responsive para mÃ³vil, tablet y escritorio.

## Funcionalidades posteriores

- Registro y ediciÃ³n de nuevas herramientas.
- Persistencia de configuraciones.
- AutenticaciÃ³n de usuarios.
- IntegraciÃ³n con APIs externas.
- Historial de sesiones y resultados.
- SincronizaciÃ³n con Obsidian.
- Panel de administraciÃ³n.
- PublicaciÃ³n para otros usuarios.

## Alcance de la primera iteraciÃ³n

La primera iteraciÃ³n se concentrarÃ¡ en la arquitectura frontend, la identidad visual y la navegaciÃ³n interna. Las herramientas podrÃ¡n comenzar con interfaces y flujos representativos antes de integrar toda su lÃ³gica externa.

La implementaciÃ³n de servicios de IA, autenticaciÃ³n, almacenamiento, APIs y automatizaciÃ³n de plataformas se realizarÃ¡ en etapas posteriores, despuÃ©s de validar la experiencia de navegaciÃ³n.

## Principios de producto

- **CentralizaciÃ³n:** todas las herramientas deben ser accesibles desde un mismo entorno.
- **Modularidad:** cada herramienta debe poder evolucionar de forma independiente.
- **Extensibilidad:** aÃ±adir una herramienta nueva no debe requerir modificar toda la aplicaciÃ³n.
- **Claridad:** cada pantalla debe explicar de forma breve quÃ© hace la herramienta.
- **Continuidad:** la navegaciÃ³n debe mantenerse dentro de la aplicaciÃ³n.
- **Privacidad:** las credenciales, tokens y datos personales no deben exponerse en el frontend ni en el repositorio.
- **Accesibilidad:** las tarjetas, botones y rutas deben poder utilizarse con teclado y tecnologÃ­as de asistencia.
- **Rendimiento:** las animaciones y recursos visuales no deben impedir el uso de la aplicaciÃ³n.

## Criterios de aceptaciÃ³n del paso 1

El paso de definiciÃ³n se considera completado cuando:

- El propÃ³sito del proyecto estÃ¡ documentado.
- El usuario principal estÃ¡ identificado.
- Las seis herramientas iniciales estÃ¡n definidas.
- La navegaciÃ³n interna estÃ¡ establecida.
- El alcance inicial estÃ¡ separado de las funciones futuras.
- La arquitectura puede crecer para incorporar nuevas herramientas.
- La definiciÃ³n coincide con el dashboard visual aprobado.

## PrÃ³ximo paso

Definir las funciones obligatorias y secundarias de cada una de las seis herramientas antes de comenzar la implementaciÃ³n de componentes.

## ActualizaciÃ³n del paso 6: acceso contextual mediante burbuja flotante

La plataforma incorporarÃ¡ un lanzador flotante contextual que permitirÃ¡ acceder a las seis herramientas desde la aplicaciÃ³n y, cuando exista una integraciÃ³n autorizada, desde pÃ¡ginas especÃ­ficas o pÃ¡ginas generales. El lanzador se adaptarÃ¡ al contexto disponible sin abrir ventanas nuevas y siempre requerirÃ¡ confirmaciÃ³n antes de analizar contenido, guardar informaciÃ³n, descargar archivos o iniciar una grabaciÃ³n.

La especificaciÃ³n detallada se encuentra en [Burbuja flotante contextual](burbuja-contextual.md). Esta decisiÃ³n amplÃ­a el catÃ¡logo visual aprobado sin modificar el orden ni la identidad visual de las seis herramientas.

## Modelo de operaciÃ³n obligatorio: dos modos

La definiciÃ³n del producto queda ampliada: cada una de las seis herramientas estarÃ¡ disponible en modo **integrado**, dentro de la propia aplicaciÃ³n Herramientas, y en modo **contextual**, mediante una burbuja flotante sobre pÃ¡ginas externas autorizadas. El modo integrado es la experiencia principal; el modo contextual complementa la tarea usando solo contenido que el usuario seleccione y confirme. La especificaciÃ³n Ãºnica se encuentra en [Burbuja contextual y modos de operaciÃ³n](burbuja-contextual.md).

## ActualizaciÃ³n de plataforma: aplicaciÃ³n de escritorio y web pÃºblica

Herramientas pasa a ser una aplicaciÃ³n de escritorio local-first como producto principal. Las personas futuras podrÃ¡n descargar un instalador para usar las seis herramientas con sus datos locales. ExistirÃ¡ ademÃ¡s un sitio web pÃºblico en Vercel para presentar el producto y dirigir a descargas verificadas; no reemplazarÃ¡ las funciones privadas de escritorio. VÃ©ase [DistribuciÃ³n desktop y sitio web](distribucion-desktop-y-web.md).

## Actualizacion: herramientas con agentes locales

Cada una de las seis herramientas tendra un agente local especializado. El usuario seguira viendo herramientas simples en el catalogo, pero internamente cada herramienta tendra instrucciones, permisos, memoria local y capacidades de IA propias.

El producto queda organizado asi:

- Coordinador local de Herramientas: enruta solicitudes, valida sesion, modo, permisos y contexto.
- Agentes por herramienta: ejecutan la logica especializada.
- Pipeline multimodal local: extrae texto, analiza imagenes/videos y entrega contexto normalizado.
- Integraciones locales: Obsidian, OBS Studio, Ollama, archivos y extension contextual.

La arquitectura completa esta en [Arquitectura de agentes locales](arquitectura-de-agentes.md).