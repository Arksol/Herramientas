# Extensión de navegador

## Objetivo

La extensión contextual conecta páginas autorizadas con el modo administrador local. Solo envía selección explícita o una transcripción visible; no gestiona sesiones de cursos ni automatiza acciones protegidas.

## Acciones

- Resumir una selección.
- Enviar transcripción al gestor de clases.
- Crear una práctica de inglés, tecnología o música.
- Preparar contexto para prompts visuales o de código.
- Abrir Herramientas de forma explícita después de enviar un contexto.

## Adaptadores

Platzi, EBAC, Blackboard UVM, Class UVM, Mastermind, Coursera y YouTube tienen selectores de transcripción y subtítulos. Los selectores priorizan nodos visibles específicos; no usan el contenido completo de la página como respaldo.

Los cambios de DOM en sitios de terceros pueden requerir actualizar un adaptador. La prueba se realiza únicamente con una cuenta autorizada y material que la persona pueda consultar legítimamente.

## Popup

El popup permite verificar la conexión local, activar o desactivar la burbuja y restablecer su posición. Requiere los permisos mínimos `storage`, `activeTab` y `tabs`; este último se usa solo para abrir Herramientas o enviar el restablecimiento a la pestaña activa.

## Desarrollo y verificación

Desde `apps/desktop`:

```powershell
npm run extension:build
npm run extension:verify
```

La verificación comprueba los tres manifiestos, la ruta de apertura local, la restauración de posición y el envío de transcripción al gestor de clases.