# Definición del proyecto

## Premisa vigente

**Herramientas** será una plataforma local-first para convertir aprendizaje autorizado en conocimiento accionable: notas verificables, práctica, proyectos y repaso. Debe ser útil para distintas personas en el futuro; la primera implementación se concentra en un **modo administrador privado** que permite adaptar el flujo a Aaron sin mezclar su información con la experiencia pública.

## Dos partes del producto

### Modo administrador: disponible ahora

La aplicación de escritorio administra perfiles, agentes, fuentes autorizadas, Obsidian, agenda, integraciones locales y políticas de retención. Aaron puede configurar su horario rotativo, cursos, objetivos, preferencias y progresos. Estos valores son privados, editables y no se publican.

### Producto público: pendiente

La futura aplicación pública tendrá perfiles aislados, permisos propios, documentación de privacidad, soporte, distribución y evaluación de costos. No puede leer el perfil de administrador, su bóveda, archivos locales, claves ni historial. Su implementación no empieza hasta definir autenticación, borrado de cuenta, telemetría mínima y un modelo de seguridad multicuenta.

## Problema que resuelve

Estudiar en varias plataformas y con horarios variables suele obligar a elegir entre atender una clase o copiar apuntes. Herramientas reduce la fricción entre una fuente autorizada y una nota útil: captura mínima confirmada, extracción local, resumen con evidencia, revisión humana, ejercicio y repaso. No sustituye el estudio ni duplica plataformas.

## Flujo principal

```text
Fuente autorizada y confirmada
  -> extracción local normalizada
  -> agente especializado con permisos mínimos
  -> síntesis con evidencia, dudas y limitaciones
  -> revisión humana
  -> nota de Obsidian, práctica y repaso
```

## Asistente personal configurable

El modo administrador contiene una configuración de proveedor para el asistente que coordina estudio, agenda y seguimiento de proyectos:

- **Local:** perfil privado almacenado en el equipo; su uso de modelos y herramientas permanece sujeto a los permisos de cada tarea.
- **Houston:** transferencia manual de una instrucción resumida hacia el agente creado por la persona en Houston. La aplicación no automatiza el inicio de sesión ni exporta el perfil sin pulsar la acción de copiar.

El asistente sugiere y organiza; no puede guardar, borrar, descargar, abrir OBS ni modificar Obsidian sin confirmación visible.

## Herramientas actuales

1. Resumidor académico y Obsidian.
2. Gestor de clases y recursos autorizados.
3. Profesor de inglés C1.
4. Profesor de tecnología.
5. Profesor de música.
6. Arquitecto de prompts visuales.
7. Arquitecto de prompts de código.

Cada herramienta debe declarar entradas, salida, agente responsable, memoria permitida, acciones prohibidas y confirmaciones.

## Principios no negociables

- Local-first y permisos mínimos.
- Legalidad, consentimiento y respeto a condiciones de cada plataforma.
- Revisión humana antes de cualquier guardado o acción externa.
- Evidencia antes que fluidez: fuente, marcas de tiempo, dudas y límites visibles.
- Separación estricta entre administrador y producto público.
- Memoria configurable y borrado claro.
- Caducidad semanal para capturas, caché, adjuntos temporales y contexto de agentes.
- Nunca borrar notas, archivos originales ni información fuera de Herramientas sin una acción explícita de la persona.

## Alcance de la primera versión útil

La versión inicial debe permitir registrar una fuente autorizada, extraer texto o transcripción, generar un resumen local editable, crear una nota Markdown con ejercicio y guardarla de forma confirmada en Obsidian. La burbuja contextual es complementaria: solo actúa en sitios permitidos y solo remite contenido confirmado.

Quedan fuera de este alcance: automatizar inicio de sesión, extraer material protegido, agentes autónomos con navegador, sincronización de bóvedas y publicación multicuenta.

## Criterio de cierre del paso 1

El paso 1 queda cerrado cuando toda decisión posterior distingue las dos superficies del producto, usa los principios anteriores y no introduce datos de administrador en el producto público.
