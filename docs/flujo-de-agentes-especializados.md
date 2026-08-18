# Flujo de agentes especializados

## Qué quedó implementado en el paso 5

Cada una de las siete herramientas cuenta con un agente especializado que genera un plan de trabajo antes de procesar contenido. El plan siempre parte de reglas locales y, si Ollama está disponible, puede añadir una recomendación breve generada en el equipo.

| Herramienta | Agente | Resultado del plan |
| --- | --- | --- |
| Resumidor académico y Obsidian | Síntesis académica | Fuente delimitada, nota revisable y repaso activo. |
| Gestor de clases | Recursos autorizados | Ruta permitida y fuente válida para estudiar. |
| Profesor de inglés C1 | Tutor C1 | Práctica, producción, corrección y meta de mejora. |
| Profesor integral de tecnología | Tutor técnico | Concepto, ejercicio seguro y verificación. |
| Profesor de música | Tutor de música | Sesión de práctica deliberada y métrica. |
| Arquitecto visual | Prompts visuales | Brief, prompt y variaciones revisables. |
| Arquitecto de código | Prompts de código | Criterios, riesgos, pruebas y prompt técnico. |

## Secuencia

1. Elegir la herramienta y describir un objetivo inmediato.
2. Seleccionar prioridad: hoy, esta semana o profundizar.
3. Decidir si el agente puede adaptar el plan con el perfil personal guardado localmente. Esta casilla está desactivada al abrir el panel.
4. Crear el plan. El servicio valida que el agente corresponda a la herramienta y que la acción esté permitida.
5. Ejecutar las acciones propuestas con las herramientas específicas: resumidor, gestor de clases o práctica guiada.
6. Conservar un objetivo recurrente solo si se marca `Conservar objetivo`. Puede eliminarse desde el mismo panel.

## IA local y respaldo

La API local intenta usar Ollama para una recomendación breve con el modelo configurado. La aplicación de escritorio usa el mismo planificador mediante Tauri. El modelo recibe la tarea como contenido no confiable y se le prohíbe obedecer instrucciones dentro de ella, solicitar credenciales o modificar información. Si Ollama no está disponible, el plan sigue funcionando con reglas locales. No se envía la tarea a servicios externos.

## Memoria y privacidad

- El perfil personal se mantiene en `localStorage` hasta que el administrador lo cambie o borre.
- Un objetivo por agente se conserva solo tras consentimiento explícito. No se guardan automáticamente tareas, respuestas, adjuntos, capturas ni transcripciones.
- El servicio conserva únicamente el metadato de auditoría de la acción durante siete días: herramienta, acción, resultado y fecha.
- El contexto temporal de extensiones, planes de clase y archivos temporales sigue sujeto a la purga semanal.

## Houston

Houston continúa siendo un conector manual. Herramientas puede preparar instrucciones para copiar al agente que ya existe en Houston, pero no inicia sesión, no lee su cuenta ni transfiere tareas, perfil, archivos o historial automáticamente.

## Criterio de aceptación

Los agentes son utilizables en la interfaz, respetan los contratos por herramienta, cuentan con una ruta local sin Ollama y no obtienen capacidades autónomas de lectura, escritura, descarga, grabación o acceso a cuentas.