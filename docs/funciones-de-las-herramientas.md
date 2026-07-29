# Contratos funcionales de las herramientas

Este documento define lo que cada herramienta puede recibir, producir y hacer. Los contratos se muestran dentro de la aplicación y se reflejan en las políticas del servicio local.

## Reglas transversales

- Toda operación que procese material protegido de estudio requiere una sesión local activa.
- Guardar o anexar una nota en Obsidian requiere confirmación explícita.
- Los adjuntos, capturas, contextos de la extensión y planes de clase expiran a los siete días.
- Ningún agente lee contraseñas, cookies, tokens, historiales privados ni archivos ajenos al flujo autorizado.
- Las integraciones externas, incluido Houston, son opcionales y requieren activación manual.

## 01. Resumidor académico y Obsidian

Entradas: texto, enlaces públicos autorizados, archivos locales permitidos, imágenes y vídeos locales.

Salidas: Markdown editable, ideas clave, preguntas de repaso y una nota de Obsidian confirmada.

Permitido: analizar, resumir con IA local y guardar o anexar una nota después de la confirmación.

Bloqueado: leer credenciales, modificar notas sin confirmación o subir fuentes privadas de forma predeterminada.

## 02. Gestor de clases

Entradas: URL oficial, título, carpeta local existente y una transcripción o archivo autorizado.

Salidas: plan de recurso autorizado, resumen de clase e instrucciones para OBS.

Permitido: validar la URL contra la plataforma elegida, organizar recursos propios, resumir transcripciones y abrir OBS con dos confirmaciones.

Bloqueado: descargar transmisiones protegidas, inspeccionar cookies o tokens e iniciar o detener OBS automáticamente.

## 03. Profesor de inglés C1

Entradas: objetivo, selección autorizada y preferencias de estudio.

Salidas: práctica adaptada, corrección explicada y progreso local editable.

Bloqueado: enviar conversaciones a terceros o acceder a cuentas de cursos.

## 04. Profesor integral de tecnología

Entradas: pregunta, código o documento autorizado, nivel y objetivo.

Salidas: explicación, ejercicios y ruta de proyecto.

Bloqueado: ejecutar código desconocido o modificar repositorios sin confirmación.

## 05. Profesor de música

Entradas: objetivo musical, referencia autorizada e instrumento o nivel.

Salidas: plan de práctica, ejercicios y explicaciones de teoría o composición.

Bloqueado: retener audio temporal o distribuir partituras y material protegido.

## 06. Arquitecto de prompts visuales

Entradas: idea, imagen o vídeo local autorizado y restricciones de estilo.

Salidas: prompts visuales, variaciones y cambios explicados.

Bloqueado: enviar referencias privadas a un generador externo de forma predeterminada.

## 07. Arquitecto de prompts de código

Entradas: requisito, código o error autorizado y criterios de aceptación.

Salidas: prompt técnico, plan de implementación y pruebas propuestas.

Bloqueado: ejecutar código, leer secretos o modificar archivos sin confirmación.

## Criterio de aceptación del paso 2

Cada herramienta tiene entradas, salidas, permisos, confirmaciones y acciones bloqueadas visibles en la interfaz y definidas en `apps/desktop/src/data/toolContracts.ts`. En el paso 5, la acción `plan` activa únicamente al agente asignado a esa herramienta y nunca concede permisos adicionales.