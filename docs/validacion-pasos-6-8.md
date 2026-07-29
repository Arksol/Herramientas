# Validación de los pasos 6, 7 y 8

## Paso 6: Obsidian interactivo

- El resumen genera preguntas desde ideas clave.
- El bloque de estudio se muestra y edita antes de guardar.
- Las tareas, enlaces y callouts se guardan mediante el flujo confirmado de Obsidian.
- No se modifica una nota por la simple generación del resumen.

## Paso 7: extensión y adaptadores

- La burbuja es draggable, conserva posición y puede restablecerse desde el popup.
- El usuario puede habilitarla o deshabilitarla por navegador.
- Los adaptadores de Platzi, EBAC, Blackboard UVM, Class UVM, Mastermind, Coursera y YouTube buscan únicamente transcripción, subtítulos o texto visible.
- La acción de transcripción se dirige al gestor de clases.
- Abrir Herramientas es una acción explícita del usuario.

## Paso 8: verificación y salida pública

Ejecutar desde `apps/desktop`:

```powershell
npm run verify
```

El comando compila la aplicación, genera y verifica las extensiones y arranca un servicio efímero para probar salud local, CORS de extensión, plan de agente permitido, rechazo de agente incorrecto y protección de rutas privadas.

Los requisitos de salida del producto público están en `docs/preparacion-producto-publico.md`.