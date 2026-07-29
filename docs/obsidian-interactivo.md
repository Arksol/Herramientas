# Obsidian interactivo

## Implementado en el paso 6

Después de generar un resumen, la aplicación permite añadir un bloque de estudio interactivo antes de guardar. El bloque se incorpora al Markdown visible, por lo que el usuario puede editarlo, copiarlo o descartarlo antes de enviarlo a Obsidian.

El bloque contiene:

- Contexto de estudio opcional: curso, unidad, etiquetas y enlaces a notas relacionadas.
- Tareas Markdown para repaso activo.
- Callouts de Obsidian con preguntas y respuestas basadas en ideas clave.
- Una acción concreta para la próxima sesión de estudio.

## Uso

1. Generar y revisar el resumen.
2. Abrir `Repaso activo` en la vista previa.
3. Probar una pregunta sin ver la respuesta.
4. Completar los campos que aporten contexto a la bóveda.
5. Pulsar `Añadir bloque interactivo`.
6. Revisar el Markdown resultante y guardar o anexar la nota mediante la confirmación existente.

El marcador interno evita agregar el mismo bloque dos veces a una misma vista previa. No se modifica una nota existente hasta que el usuario pulse el botón de guardado de Obsidian.

## Compatibilidad

El formato utiliza Markdown estándar, tareas `- [ ]`, enlaces `[[Nota]]`, etiquetas y callouts de Obsidian. No depende de un complemento adicional.