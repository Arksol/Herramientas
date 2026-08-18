# Burbuja contextual

La extensión para Chrome Dev, Firefox y Helium inserta una burbuja movible en páginas compatibles. Solo opera sobre texto visible que la persona selecciona o sobre subtítulos/transcripciones visibles.

## Flujo

1. Selecciona texto o pulsa **Enviar transcripción** cuando la plataforma muestra subtítulos accesibles.
2. Elige una herramienta en la burbuja.
3. La extensión envía el contexto local confirmado al servicio de Herramientas y conserva solo el identificador temporal.
4. Pulsa **Enviar y abrir Herramientas**. La aplicación abre la herramienta elegida con el texto precargado tras iniciar sesión cuando esa herramienta lo requiere.

La posición de la burbuja se guarda localmente. El popup permite ocultarla y restablecer su posición. El contexto temporal y la caché vencen en siete días.

## Límites

La burbuja no lee cookies, tokens, contraseñas ni contenido oculto. No descarga vídeo protegido ni evita DRM. En sitios privados, solo aprovecha el contenido que la persona puede ver desde su sesión legítima y decide enviar.

## Compatibilidad

La mensajería utiliza promesas en Firefox y callbacks en Chrome/Helium. Los adaptadores buscan pistas de subtítulos, transcripciones visibles y pistas de vídeo, sin hacer scraping genérico del contenido de cursos.
