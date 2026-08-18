# Retención de datos

## Regla principal

Herramientas separa el perfil que una persona decide conservar de los datos transitorios creados para analizar una fuente. La limpieza automática solo opera sobre datos controlados por la aplicación y nunca borra información fuera de sus áreas temporales.

## Se conserva hasta editar o eliminar

- Perfil del asistente local: nombre, objetivos, horario y preferencias que la persona guarda explícitamente.
- Configuración elegida de proveedor: local o Houston.
- Notas de Obsidian guardadas mediante confirmación.
- Archivos originales y rutas que pertenecen a la persona.

## Se elimina a los siete días

- Capturas y transcripciones almacenadas en IndexedDB por la extensión.
- Contexto temporal recibido desde la burbuja por el servicio local.
- Adjuntos, fotogramas y directorios temporales creados por tareas de análisis.
- Memoria de trabajo de un agente que no sea perfil o progreso guardado explícitamente.

## Límites de seguridad

- Una purga no puede recorrer carpetas arbitrarias ni usar rutas proporcionadas por una página web.
- No se eliminan notas, bóvedas, archivos de clase, grabaciones originales ni contenido fuera de Herramientas.
- Las acciones de borrado manual deben explicar el alcance y pedir confirmación.
- Los proveedores externos no reciben datos por defecto. Houston solo recibe una instrucción cuando la persona la copia deliberadamente.
