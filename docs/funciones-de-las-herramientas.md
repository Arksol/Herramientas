# Funciones de las herramientas

Este documento define el alcance funcional inicial de las seis herramientas de la plataforma. Las funciones obligatorias forman parte del MVP; las funciones secundarias se implementarÃ¡n despuÃ©s de validar la navegaciÃ³n y la experiencia principal.

## Prioridades

- **Obligatoria:** necesaria para que la herramienta cumpla su propÃ³sito principal.
- **Secundaria:** mejora la experiencia, pero puede esperar a una iteraciÃ³n posterior.
- **Futura:** requiere integraciones, autenticaciÃ³n, almacenamiento o servicios que todavÃ­a no forman parte del MVP.

---

## 1. Resumidor acadÃ©mico y Obsidian

### FunciÃ³n principal

Convertir clases, pÃ¡ginas, documentos y recursos educativos en notas estructuradas y listas para organizarse en Obsidian.

### Funciones obligatorias

- Recibir texto pegado por el usuario.
- Recibir archivos compatibles.
- Identificar el tÃ­tulo, plataforma, curso, mÃ³dulo y lecciÃ³n.
- Generar un resumen ejecutivo.
- Generar un resumen detallado por temas.
- Extraer conceptos, definiciones, ejemplos y procedimientos.
- Generar preguntas de repaso.
- Generar un ejercicio prÃ¡ctico.
- Producir Markdown compatible con Obsidian.
- Mostrar claramente fuentes, limitaciones e informaciÃ³n complementaria.

### Funciones secundarias

- Generar diagramas Mermaid.
- Generar mapas conceptuales JSON Canvas.
- Organizar capturas relacionadas con la clase.
- Proponer enlaces internos entre notas.
- Crear nombres de archivo y estructura de carpetas.
- Crear versiones breve, detallada y de repaso.

### Funciones futuras

- IntegraciÃ³n directa con una bÃ³veda de Obsidian.
- NavegaciÃ³n autorizada en plataformas educativas.
- ExtracciÃ³n de transcripciones visibles.
- Historial de notas generadas.

---

## 2. Gestor de clases offline

### FunciÃ³n principal

Organizar materiales educativos autorizados para su consulta sin conexiÃ³n, respetando las condiciones de cada plataforma y propietario.

### Funciones obligatorias

- Registrar una clase o curso.
- Organizar materiales por plataforma, curso, mÃ³dulo y lecciÃ³n.
- Clasificar videos, PDFs, imÃ¡genes, subtÃ­tulos y documentos.
- Identificar si un recurso tiene una opciÃ³n oficial de descarga.
- Registrar el estado de cada recurso.
- Mostrar advertencias cuando no exista una descarga autorizada.
- Evitar mÃ©todos que extraigan DRM, cookies, tokens o transmisiones protegidas.
- Permitir consultar la estructura local de materiales.

### Funciones secundarias

- Generar nombres de archivo consistentes.
- Detectar recursos duplicados.
- Crear un Ã­ndice del curso.
- Asociar notas Markdown y capturas a cada clase.
- Verificar metadatos bÃ¡sicos de archivos.
- Preparar comandos seguros para procesar archivos que el usuario ya posee.

### Funciones futuras

- IntegraciÃ³n con botones oficiales de descarga de EBAC o Blackboard.
- ConversiÃ³n de videos autorizados.
- ExtracciÃ³n de audio y subtÃ­tulos de archivos propios.
- SincronizaciÃ³n con almacenamiento local o nube.

---

## 3. Profesor de inglÃ©s C1

### FunciÃ³n principal

Evaluar el nivel de inglÃ©s del usuario y ofrecer una ruta progresiva hasta el nivel C1.

### Funciones obligatorias

- Realizar una evaluaciÃ³n diagnÃ³stica inicial.
- Evaluar lectura, escritura, gramÃ¡tica, vocabulario y conversaciÃ³n.
- Identificar fortalezas y Ã¡reas de mejora.
- Estimar el nivel segÃºn el MCER.
- Crear un plan de estudio personalizado.
- Proponer ejercicios graduados.
- Corregir errores explicando causa y soluciÃ³n.
- Practicar vocabulario y expresiones naturales.
- Registrar el progreso de cada sesiÃ³n.
- Adaptar la dificultad al desempeÃ±o del usuario.

### Funciones secundarias

- Practicar pronunciaciÃ³n mediante voz.
- Simular entrevistas laborales.
- Practicar inglÃ©s tÃ©cnico y profesional.
- Generar tareas semanales.
- Crear pruebas periÃ³dicas.
- Producir un archivo de progreso en Markdown.

### Funciones futuras

- Historial persistente del progreso.
- EvaluaciÃ³n automÃ¡tica de pronunciaciÃ³n.
- Planificador de sesiones.
- Recordatorios y metas.

---

## 4. Profesor integral de tecnologÃ­a

### FunciÃ³n principal

EnseÃ±ar fundamentos y aplicaciones prÃ¡cticas de tecnologÃ­a mediante explicaciones progresivas, ejercicios y proyectos.

### Funciones obligatorias

- Evaluar los conocimientos iniciales del usuario.
- Definir una ruta de aprendizaje.
- Explicar conceptos con lenguaje sencillo.
- Presentar la definiciÃ³n tÃ©cnica.
- Utilizar analogÃ­as y ejemplos.
- Explicar fundamentos matemÃ¡ticos y fÃ­sicos cuando correspondan.
- Mostrar ejemplos de cÃ³digo.
- Proponer ejercicios guiados e independientes.
- Revisar respuestas y explicar errores.
- Relacionar cada tema con un proyecto prÃ¡ctico.
- Registrar conceptos dominados y pendientes.

### Ãreas iniciales

- Desarrollo frontend y fullstack.
- Python y ciencia de datos.
- Bases de datos y SQL.
- Ciberseguridad defensiva.
- Redes y sistemas operativos.
- RobÃ³tica y microcontroladores.
- Hardware, electrÃ³nica y software.
- Inteligencia artificial.
- MatemÃ¡ticas y fÃ­sica aplicada.

### Funciones secundarias

- Generar diagramas tÃ©cnicos.
- Crear laboratorios guiados.
- Preparar proyectos por niveles.
- Revisar cÃ³digo y pruebas.
- Crear simulaciones conceptuales.
- Generar un archivo de progreso en Markdown.

### Funciones futuras

- Entornos de ejecuciÃ³n aislados.
- IntegraciÃ³n con repositorios GitHub.
- Seguimiento de proyectos.
- Evaluaciones automatizadas.

---

## 5. Arquitecto de prompts visuales

### FunciÃ³n principal

Transformar ideas visuales en prompts claros, completos y adaptados al generador de imÃ¡genes elegido.

### Funciones obligatorias

- Recibir una idea o prompt incompleto.
- Identificar sujeto, objetivo y contexto.
- Definir composiciÃ³n, encuadre y perspectiva.
- Definir iluminaciÃ³n, ambiente y paleta.
- Definir estilo, materiales y nivel de realismo.
- Eliminar contradicciones y ambigÃ¼edades.
- Conservar los elementos obligatorios del usuario.
- Generar un prompt final listo para copiar.
- Explicar los cambios realizados.
- Proponer parÃ¡metros relevantes cuando correspondan.

### Funciones secundarias

- Generar prompt negativo.
- Crear variaciones de una misma idea.
- Adaptar el resultado a distintas plataformas.
- Analizar una imagen de referencia.
- Entregar versiones en espaÃ±ol e inglÃ©s.
- Separar elementos que deben conservarse y modificarse.

### Funciones futuras

- Historial de prompts.
- ComparaciÃ³n entre versiones.
- IntegraciÃ³n directa con generadores de imÃ¡genes.
- Biblioteca de estilos y plantillas.

---

## 6. Arquitecto de prompts de cÃ³digo

### FunciÃ³n principal

Convertir ideas, requisitos y errores de programaciÃ³n en prompts tÃ©cnicos, verificables y orientados a resultados.

### Funciones obligatorias

- Identificar el problema y el resultado esperado.
- Determinar el nivel tÃ©cnico del usuario.
- Recomendar un stack apropiado.
- Separar requisitos funcionales y no funcionales.
- Definir estructura de archivos.
- Incluir seguridad, accesibilidad, rendimiento y mantenibilidad.
- Definir manejo de errores.
- Incluir pruebas necesarias.
- Crear criterios de aceptaciÃ³n verificables.
- Generar un prompt final listo para copiar.
- Para errores, solicitar cÃ³digo, mensaje y contexto antes de proponer cambios.

### Funciones secundarias

- Generar prompts para React, Python, SQL y backend.
- Crear prompts para Codex y otras herramientas de programaciÃ³n.
- Revisar si faltan requisitos.
- Generar listas de archivos afectados.
- Crear prompts de refactorizaciÃ³n.
- Incluir restricciones de seguridad para ciberseguridad autorizada.

### Funciones futuras

- IntegraciÃ³n directa con repositorios.
- AnÃ¡lisis automÃ¡tico de cÃ³digo.
- GeneraciÃ³n de issues y criterios de aceptaciÃ³n.
- Historial de prompts y proyectos.

---

## Funciones transversales de la plataforma

Estas funciones se aplicarÃ¡n a todas las herramientas:

- PÃ¡gina de presentaciÃ³n de cada herramienta.
- DescripciÃ³n clara del propÃ³sito.
- Formulario o Ã¡rea de entrada apropiada.
- Estado vacÃ­o.
- Estado de carga.
- Estado de Ã©xito.
- Estado de error.
- Acciones accesibles por teclado.
- NavegaciÃ³n interna sin ventanas nuevas.
- Enlace para regresar a Herramientas.
- DiseÃ±o responsive.
- ProtecciÃ³n de datos sensibles.
- Mensajes comprensibles para el usuario.

## Fuera del alcance del MVP

- Sistema pÃºblico de cuentas.
- Marketplace de herramientas.
- Pagos o suscripciones.
- EjecuciÃ³n arbitraria de cÃ³digo en el navegador.
- ExtracciÃ³n de contenido protegido.
- Descarga de videos sin opciÃ³n oficial.
- Almacenamiento permanente de credenciales.
- Integraciones externas no autorizadas.

## Criterio de cierre del paso 2

El paso se considera completado cuando cada herramienta tiene una funciÃ³n principal definida, funciones obligatorias separadas de las secundarias y lÃ­mites claros para la primera implementaciÃ³n.

---

# Modificaciones solicitadas para este paso

## Resumidor acadÃ©mico y Obsidian

La herramienta debe permitir configurar una ubicaciÃ³n especÃ­fica dentro de la bÃ³veda de Obsidian para guardar las notas generadas.

### Requisitos adicionales

- Solicitar o leer la ruta de la bÃ³veda configurada.
- Permitir definir una carpeta de destino para las notas acadÃ©micas.
- Validar que la carpeta de destino estÃ© dentro de la bÃ³veda seleccionada.
- Crear la carpeta si no existe, previa confirmaciÃ³n cuando corresponda.
- Guardar las notas en Markdown compatible con Obsidian.
- Mantener enlaces relativos, etiquetas y enlaces internos.
- Informar la ruta exacta del archivo creado.
- No guardar contraseÃ±as, tokens ni datos sensibles en las notas.
- No afirmar que una nota fue guardada si la escritura no fue confirmada.

Ejemplo de configuraciÃ³n conceptual:

```yaml
obsidian:
  vault_path: "C:\\ruta\\a\\MiBoveda"
  notes_path: "Cursos\\ResÃºmenes"
```

## Descarga de clases

El nombre â€œGestor de clases offlineâ€ se sustituye por **Descarga de clases**.

### FunciÃ³n principal actualizada

Ayudar a descargar y organizar clases grabadas de la plataforma Class de UVM, utilizando Ãºnicamente opciones oficiales o autorizadas, y permitir organizar materiales de otras plataformas cuando exista permiso para hacerlo.

### Plataforma Class

- URL inicial configurable: `https://uvm.class.com`
- Requiere que el usuario inicie sesiÃ³n manualmente.
- No se deben almacenar contraseÃ±as, cookies, tokens ni cÃ³digos MFA.
- Debe localizar Ãºnicamente botones o enlaces oficiales de descarga.
- El usuario debe poder seleccionar la carpeta de destino.
- Debe registrar nombre, plataforma, clase, fecha, tamaÃ±o y estado del archivo.
- No debe extraer archivos ocultos del reproductor ni inspeccionar transmisiones protegidas.

### EBAC, Mastermind y Platzi

Cuando no exista una opciÃ³n oficial de descarga, la herramienta podrÃ¡ ofrecer un apartado para iniciar OBS Studio, pero solamente si:

- El usuario tiene autorizaciÃ³n para grabar la clase.
- La instituciÃ³n, el profesor y la plataforma permiten la grabaciÃ³n.
- La grabaciÃ³n se realiza para uso personal autorizado.
- No se intenta evadir DRM, controles de acceso, pagos o restricciones tÃ©cnicas.

### Flujo autorizado con OBS Studio

1. La herramienta informa que no encontrÃ³ una descarga oficial.
2. Solicita confirmaciÃ³n de que la grabaciÃ³n estÃ¡ autorizada.
3. Pregunta quÃ© clase se desea grabar.
4. Permite elegir la carpeta de destino.
5. Permite configurar o abrir OBS Studio.
6. El usuario inicia y detiene la grabaciÃ³n desde OBS Studio.
7. La herramienta organiza el archivo resultante.
8. Se registra el estado de la grabaciÃ³n y la ruta final.

La aplicaciÃ³n no debe iniciar grabaciones de forma silenciosa, grabar sin confirmaciÃ³n ni capturar contenido de otras ventanas sin autorizaciÃ³n explÃ­cita.

### Funciones secundarias actualizadas

- Selector de carpeta de destino.
- Historial de clases descargadas o grabadas legalmente.
- OrganizaciÃ³n por plataforma, curso, mÃ³dulo y clase.
- ValidaciÃ³n bÃ¡sica de existencia y tamaÃ±o del archivo.
- AsociaciÃ³n con notas, capturas y recursos.
- ConfiguraciÃ³n de la ruta del ejecutable de OBS Studio.
- Plantillas de nombres para archivos de video.

## Arquitecto de prompts visuales

La herramienta debe aceptar imÃ¡genes y videos como fuentes de anÃ¡lisis para modificar o crear prompts.

### Entradas admitidas

- Texto escrito por el usuario.
- ImÃ¡genes individuales.
- Videos autorizados.
- Capturas de pantalla.
- Carpetas con imÃ¡genes y videos.
- Archivos de referencia visual.
- Materiales relacionados con un proyecto.

### Funciones adicionales

- Analizar composiciÃ³n, iluminaciÃ³n, colores, estilo, objetos y elementos relevantes de imÃ¡genes.
- Analizar fotogramas representativos de videos autorizados.
- Identificar patrones visuales comunes en una carpeta.
- Separar elementos que deben conservarse de los que deben modificarse.
- Basar el prompt corregido en los archivos proporcionados.
- Crear prompts para generar o editar imÃ¡genes y videos.
- Indicar quÃ© archivos fueron utilizados como referencia.
- Informar cuando un video no pueda analizarse completamente y explicar quÃ© muestra el anÃ¡lisis disponible.
- Ignorar archivos que no sean relevantes para el prompt.

Si no se proporcionan archivos, debe trabajar Ãºnicamente con el prompt escrito por el usuario.

## Arquitecto de prompts de cÃ³digo

La herramienta debe aceptar archivos y carpetas como contexto tÃ©cnico para mejorar o corregir prompts de programaciÃ³n.

### Entradas admitidas

- CÃ³digo fuente.
- Carpetas de proyectos.
- Capturas de errores.
- Logs.
- Archivos de configuraciÃ³n.
- DocumentaciÃ³n tÃ©cnica.
- Diagramas y esquemas.
- Videos autorizados de demostraciÃ³n.
- Repositorios o archivos exportados por el usuario.

### Funciones adicionales

- Analizar la estructura de carpetas.
- Identificar tecnologÃ­as, dependencias y patrones existentes.
- Leer los archivos relevantes antes de modificar el prompt.
- Analizar capturas de errores y mensajes visibles.
- Analizar videos de demostraciÃ³n mediante fotogramas, texto visible o transcripciones disponibles.
- Detectar archivos faltantes, inconsistencias y riesgos tÃ©cnicos.
- Basar el prompt corregido en el contexto real del proyecto.
- Indicar quÃ© archivos fueron analizados.
- Excluir secretos, claves, tokens y credenciales del resultado.
- Solicitar solo los archivos necesarios cuando el conjunto sea demasiado grande.

Si no se proporciona ningÃºn archivo, debe mejorar el prompt Ãºnicamente con la informaciÃ³n escrita por el usuario.

## Reglas comunes para anÃ¡lisis de archivos

- Analizar Ãºnicamente archivos proporcionados por el usuario o ubicados en una ruta autorizada.
- No ejecutar cÃ³digo desconocido solo por analizarlo.
- No subir archivos privados a servicios externos sin confirmaciÃ³n.
- No incluir credenciales ni secretos en prompts, notas o registros.
- Informar quÃ© archivos se pudieron leer y cuÃ¡les no.
- Distinguir hechos observados, inferencias y recomendaciones.
- Permitir continuar sin archivos cuando el usuario solo necesite corregir un prompt.


## Control de acceso de las dos primeras herramientas

Las siguientes herramientas deberÃ¡n solicitar un cÃ³digo o contraseÃ±a antes de habilitar sus funciones:

- Resumidor acadÃ©mico y Obsidian.
- Descarga de clases.

En el MVP se contempla un cÃ³digo comÃºn para ambas. La validaciÃ³n real deberÃ¡ realizarse en el backend, mediante un hash seguro y una sesiÃ³n temporal. El frontend solo mostrarÃ¡ la interfaz de acceso y el estado de autorizaciÃ³n; no contendrÃ¡ el secreto.

## ActualizaciÃ³n del paso 6: acceso desde burbuja contextual

Las seis herramientas deberÃ¡n poder abrirse desde un lanzador flotante comÃºn. El lanzador mostrarÃ¡ accesos contextuales segÃºn la pÃ¡gina o aplicaciÃ³n autorizada y conservarÃ¡ un acceso manual al catÃ¡logo completo. El resultado se abrirÃ¡ dentro de Herramientas, en un panel o subpÃ¡gina interna.

La burbuja deberÃ¡ incluir controles de expandir, minimizar, pausar, reanudar y cerrar. No leerÃ¡ credenciales, cookies ni contenido privado sin una selecciÃ³n y confirmaciÃ³n explÃ­citas.

## ActualizaciÃ³n consolidada: capacidades en modo integrado y contextual

Cada funciÃ³n deberÃ¡ declararse con dos entradas: `integrada`, para el trabajo completo dentro de Herramientas, y `contextual`, para usar contenido seleccionado desde una pÃ¡gina autorizada. El modo contextual no duplica las herramientas: inicia la misma herramienta con el contexto ya confirmado.

Reglas por herramienta:

- Resumidor: en contexto recibe contenido seleccionado; antes de procesarlo abre el selector de bÃ³veda, nota y ubicaciÃ³n de Obsidian.
- Descarga de clases: en contexto identifica la clase indicada por el usuario; solo ofrece mecanismos oficiales o el flujo visible de OBS Studio.
- Profesor de inglÃ©s y profesor de tecnologÃ­a: convierten la selecciÃ³n en explicaciÃ³n, ejercicio o plan, manteniendo la sesiÃ³n y progreso locales.
- Arquitectos de prompts: analizan Ãºnicamente referencias, cÃ³digo, errores, imÃ¡genes o videos seleccionados; excluyen secretos y archivos no autorizados.

El lanzador contextual tendrÃ¡ acceso manual a las seis herramientas aun cuando no exista una sugerencia automÃ¡tica.

## Disponibilidad por plataforma

Las funciones completas de las seis herramientas se ejecutarÃ¡n Ãºnicamente en la aplicaciÃ³n de escritorio. El sitio web pÃºblico mostrarÃ¡ sus capacidades y demostraciones sin procesar datos privados. Las funciones que requieren archivos, bÃ³vedas, OBS Studio, modelos locales o la burbuja contextual exigirÃ¡n la aplicaciÃ³n instalada.

## ActualizaciÃ³n: memoria y personalizaciÃ³n del Profesor de inglÃ©s C1

El Profesor de inglÃ©s C1 conservarÃ¡ localmente, por perfil, un registro editable de conversaciones, nivel estimado, objetivos, errores recurrentes, vocabulario practicado y progreso. Al comenzar, preguntarÃ¡ quÃ© temas, actividades, medios, Ã¡mbitos profesionales o intereses disfruta la persona. Con esa informaciÃ³n generarÃ¡ pruebas, ejercicios, conversaciones y ejemplos relacionados con sus gustos.

TambiÃ©n permitirÃ¡ adjuntar archivos autorizados â€”por ejemplo PDF, documento, texto, imagen, audio o transcripciÃ³nâ€” para explicar vocabulario, corregir redacciÃ³n, crear preguntas de comprensiÃ³n o preparar una prÃ¡ctica basada en ese material. Los archivos no se enviarÃ¡n a servicios externos por defecto y la persona podrÃ¡ excluirlos, eliminarlos o borrar su memoria local.

## ImplementaciÃ³n inicial del resumidor acadÃ©mico

El primer componente funcional del resumidor procesa texto pegado dentro de la aplicaciÃ³n y produce localmente un resumen estructurado, ideas principales y siguientes pasos. No necesita internet, cuentas externas ni un modelo de pago. Su ruta de desarrollo exige una sesiÃ³n activa de la herramienta protegida.

El guardado en Obsidian permanece desactivado hasta que la persona configure y autorice una integraciÃ³n local. En la siguiente iteraciÃ³n se aÃ±adirÃ¡ el selector de bÃ³veda, nota y ubicaciÃ³n antes de procesar la fuente, junto con el envÃ­o local autorizado a Obsidian. La carga de archivos y el uso opcional de modelos locales tambiÃ©n quedan para iteraciones posteriores.
## ConexiÃ³n local con Obsidian

La aplicaciÃ³n usa el complemento oficial Local REST API with MCP dentro de la bÃ³veda elegida. La persona configura su clave de API una sola vez desde Herramientas; la clave se guarda en el Administrador de credenciales de Windows y nunca en el repositorio, notas o archivos de configuraciÃ³n. Para guardar, indica una ruta Markdown relativa dentro de la bÃ³veda habilitada, por ejemplo `ResÃºmenes/Clase 1.md`.
## Actualizacion: agentes por herramienta

Cada herramienta queda asociada a un agente local:

- Resumidor academico y Obsidian: Agente de Sintesis Academica.
- Descarga de clases: Agente de Recursos Autorizados.
- Profesor de ingles C1: Agente Tutor C1.
- Profesor integral de tecnologia: Agente Tutor Tecnico.
- Arquitecto de prompts visuales: Agente Visual Prompt Architect.
- Arquitecto de prompts de codigo: Agente Code Prompt Architect.
- Crear nueva herramienta: Agente Scaffold de Herramientas.

Funciones transversales nuevas:

- Mostrar que agente esta activo en cada herramienta.
- Declarar que memoria local puede usar cada agente.
- Separar herramientas permitidas, acciones prohibidas y confirmaciones requeridas.
- Permitir que los agentes compartan el pipeline multimodal local sin mezclar memorias entre herramientas.
- Registrar solo metadatos tecnicos por agente, nunca contenido privado completo.