# Profesores especializados locales

La aplicación incluye tres herramientas nuevas:

- **Profesor de Matemáticas**: procedimiento visible, comprobación de operaciones y ejercicios graduados.
- **Profesor de Física**: modelo físico, supuestos, unidades del SI y comprobación dimensional.
- **Profesores especializados**: selector unificado de Inglés C1, Tecnología, Música, Matemáticas y Física.

En el selector se elige el profesor, el modelo y la prioridad. El plan se ejecuta en Ollama local; si Ollama o el modelo elegido no están disponibles, la aplicación conserva una guía basada en reglas locales.

## Modelos ligeros

Para la GTX 1650 Ti Max-Q de 4 GB conviene empezar con un modelo de 1.5B a 3B y evitar modelos grandes que obliguen a usar demasiada RAM o CPU:

| Modelo | Tamaño aproximado | Uso recomendado | Comando |
| --- | ---: | --- | --- |
| `qwen2.5:3b` | 1.9 GB | Explicación general, español y práctica | `ollama pull qwen2.5:3b` |
| `deepseek-r1:1.5b` | 1.1 GB | Problemas cortos de matemáticas y física | `ollama pull deepseek-r1:1.5b` |
| `qwen3:4b` | 2.5 GB | Alternativa de razonamiento, si el equipo responde bien | `ollama pull qwen3:4b` |

El proyecto identifica `qwen2.5:3b-instruct` como perfil compatible si ya está instalado. Las descargas no se ejecutan automáticamente: el selector muestra el comando cuando el modelo aún no está disponible.

Qwen y DeepSeek se muestran como modelos locales de Ollama, pero “gratuito” no significa que todas las licencias sean iguales. Antes de redistribuir la aplicación o usar un modelo en un producto comercial, revisa la licencia vigente de su ficha oficial.

## Uso

1. Abre **Profesores especializados**, o entra directamente en Matemáticas o Física.
2. Elige el profesor y un modelo marcado como disponible.
3. Escribe un objetivo, problema o pregunta.
4. Pulsa **Empezar con este profesor**.
5. Revisa el procedimiento y practica el ejercicio sugerido antes de guardar una nota.