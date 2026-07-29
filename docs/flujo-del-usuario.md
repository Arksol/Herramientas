# Flujo del usuario

## Objetivo

Definir cómo una persona navegará por Herramientas y cómo utilizará las siete herramientas sin salir de la aplicación ni abrir ventanas del navegador.

## Navegación global

```text
Inicio
  ↓
Herramientas
  ├── Resumidor académico y Obsidian
  ├── Descarga de clases
  ├── Profesor de inglés C1
  ├── Profesor integral de tecnología
  ├── Arquitecto de prompts visuales
  ├── Arquitecto de prompts de código
  └── Crear nueva herramienta

Acerca de
```

Las herramientas se abrirán mediante rutas internas de la aplicación. El navegador no deberá crear nuevas ventanas ni pestañas.

## Flujo inicial

1. El usuario abre Herramientas en local.
2. La aplicacion carga el Agente Personal de Aaron, si esta configurado.
3. El agente revisa agenda, fechas de entrega, plataformas prioritarias y objetivos activos.
4. La aplicacion verifica que el frontend este disponible.
5. La aplicacion comprueba el estado del backend local.
6. La pantalla principal muestra las siete herramientas, pendientes del dia y linea de tiempo de objetivos.
7. El usuario selecciona una tarjeta completa.
8. La aplicacion navega a la subpagina correspondiente.

Si el backend o un modelo local no está disponible, la interfaz debe mostrar un mensaje claro y explicar cómo continuar sin exponer detalles técnicos innecesarios.

## Flujo del Agente Personal de Aaron

```text
Abrir Herramientas
  ->
Cargar perfil local autorizado
  ->
Leer agenda, cursos, entregas y objetivos configurados
  ->
Priorizar plataformas del dia
  ->
Mostrar plan diario, alertas y linea de tiempo
  ->
Enviar recordatorios locales cuando corresponda
```

Este agente debe crearse desde el primer paso funcional del producto porque coordina el uso real de las demas herramientas. Su funcion no es resumir clases directamente, sino decidir que conviene atender hoy, que plataforma visitar primero, que entrega esta mas cerca y que tarea se debe preparar.

Reglas:

- La agenda y el perfil se guardan localmente.
- Las notificaciones deben ser locales y configurables.
- El usuario confirma cada plataforma, curso, fecha de entrega y objetivo antes de que se agregue a memoria.
- El agente no debe guardar contraseñas, cookies ni tokens de plataformas.
- La linea de tiempo debe mostrar cercania a entregas, avance de cursos y distancia respecto a objetivos academicos o personales.
- Si OpenClaw se integra, debe actuar como capa de conexion local entre agentes, herramientas e integraciones autorizadas, no como servicio remoto obligatorio.

## Flujo de acceso protegido

Aplica a:

- Resumidor académico y Obsidian.
- Descarga de clases.

```text
Usuario selecciona la herramienta
  ↓
Pantalla de acceso
  ↓
Introduce código o contraseña
  ↓
Backend valida el código
  ↓
Sesión local temporal
  ↓
Acceso autorizado a la herramienta
```

Reglas:

- El frontend no valida por sí solo el acceso.
- El backend compara contra un hash seguro.
- Los intentos fallidos tienen límite.
- La sesión caduca.
- El usuario puede cerrar sesión.
- Un acceso válido a una herramienta no debe conceder permisos innecesarios a otra.

## Flujo del Resumidor académico y Obsidian

```text
Abrir herramienta
  ↓
Validar acceso
  ↓
Elegir fuente
  ├── Texto pegado
  ├── Archivo
  ├── Carpeta autorizada
  ├── Captura o imagen
  └── Transcripción
  ↓
Seleccionar tipo de resumen
  ↓
Analizar contenido con modelo local
  ↓
Revisar resultado
  ↓
Elegir carpeta de destino en Obsidian
  ↓
Confirmar nombre y ruta relativa
  ↓
Guardar nota mediante API local
  ↓
Mostrar enlace y ruta creada
```

La herramienta debe permitir editar el resultado antes de guardarlo. Nunca debe afirmar que la nota se guardó si la API local no confirmó la operación.

## Flujo de Descarga de clases

```text
Abrir herramienta
  ↓
Validar acceso
  ↓
Elegir plataforma
  ↓
Indicar curso, módulo y clase
  ↓
Identificar tipo de plataforma
  ├── UVM/Class: existe grabacion o descarga oficial
  │     ↓
  │   Elegir carpeta
  │     ↓
  │   Descargar y verificar archivo
  │
  └── Plataforma extra o UVM sin grabacion oficial
        ↓
      Activar modo vivo/contextual para marcar temas y resumir en tiempo real
        ↓
      Mostrar reglas de autorizacion
        ↓
      Usuario confirma permiso de grabación
        ↓
      Indicar nombre de clase y carpeta
        ↓
      Abrir OBS Studio
        ↓
      Usuario inicia y detiene grabación
        ↓
      Organizar y verificar archivo resultante
```

La aplicacion debe tratar UVM/Class como el unico flujo de descarga de clases de carrera, siempre mediante opciones oficiales o autorizadas. En EBAC, Mastermind, Platzi, Coursera, YouTube y otras plataformas extra, el flujo principal sera vivo/contextual: marcar temas importantes, capturar seleccion/transcripcion visible permitida y generar resumen en tiempo real o incremental. La aplicacion no debe extraer transmisiones protegidas ni iniciar grabaciones silenciosas. La decision de grabar siempre debe ser visible y confirmada.

## Flujo del Profesor de inglés C1

```text
Abrir herramienta
  ↓
Completar diagnóstico inicial
  ↓
Evaluar lectura, escritura, gramática y vocabulario
  ↓
Practicar conversación y pronunciación cuando estén disponibles
  ↓
Calcular nivel estimado
  ↓
Crear plan de aprendizaje
  ↓
Iniciar sesión de estudio
  ↓
Recibir correcciones y ejercicios
  ↓
Guardar registro local de progreso
```

El progreso se conservará localmente en la primera versión. No se enviará a servicios externos por defecto.

## Flujo del Profesor integral de tecnología

```text
Abrir herramienta
  ↓
Evaluar conocimientos iniciales
  ↓
Seleccionar área
  ├── Fullstack
  ├── Ciencia de datos
  ├── Ciberseguridad
  ├── Robótica
  ├── Hardware
  └── Software
  ↓
Definir objetivo
  ↓
Explicar concepto
  ↓
Mostrar ejemplo
  ↓
Realizar ejercicio guiado
  ↓
Resolver ejercicio independiente
  ↓
Revisar resultado
  ↓
Registrar progreso y siguiente tema
```

Los ejercicios de ciberseguridad se limitarán a laboratorios, CTF, máquinas virtuales y sistemas autorizados.

## Flujo del Arquitecto de prompts visuales

```text
Abrir herramienta
  ↓
Escribir idea o prompt
  ↓
Opcionalmente seleccionar archivos
  ├── Imágenes
  ├── Videos
  ├── Capturas
  └── Carpeta de referencias
  ↓
Analizar archivos autorizados
  ↓
Identificar estilo, composición y elementos
  ↓
Modificar o crear prompt
  ↓
Mostrar referencias utilizadas
  ↓
Copiar o guardar resultado
```

Si no hay archivos, la herramienta trabajará únicamente con el texto recibido.

## Flujo del Arquitecto de prompts de código

```text
Abrir herramienta
  ↓
Escribir idea, error o requisito
  ↓
Opcionalmente seleccionar archivos
  ├── Código
  ├── Carpeta de proyecto
  ├── Capturas
  ├── Logs
  ├── Configuración
  └── Documentación
  ↓
Analizar estructura y contexto
  ↓
Detectar faltantes y riesgos
  ↓
Generar prompt técnico
  ↓
Mostrar archivos analizados y excluidos
  ↓
Copiar o guardar resultado
```

Antes de analizar, la herramienta debe excluir o enmascarar secretos como `.env`, tokens, certificados privados y claves API.

## Flujo para crear una nueva herramienta

1. El usuario selecciona “Crear nueva herramienta”.
2. La aplicación muestra un formulario interno.
3. El usuario indica nombre, propósito y descripción.
4. Define si requiere acceso protegido.
5. Define entradas y resultados esperados.
6. Guarda un borrador local.
7. La nueva herramienta aparece en el catálogo como borrador.
8. La implementación técnica se realiza posteriormente.

Una herramienta nueva no debe quedar disponible públicamente sin revisión de seguridad y validación del flujo.

## Estados comunes

Todas las herramientas deben contemplar:

- Estado vacío.
- Solicitud de acceso.
- Carga de archivo.
- Procesamiento.
- Resultado parcial.
- Resultado completo.
- Éxito.
- Error recuperable.
- Servicio local no disponible.
- Archivo no compatible.
- Cancelación por el usuario.

## Criterio de cierre del paso 6

El paso se considera completado cuando los flujos de navegación, acceso, procesamiento, confirmación, guardado y error están definidos para las siete herramientas y para la creación de futuras herramientas.

## Versión vigente del paso 6: sesión, pausa e inactividad

Las siguientes reglas sustituyen y detallan las reglas generales de acceso descritas anteriormente:

```text
Ingreso correcto
  ↓
Inicio de sesión en la hora actual
  ↓
Vigencia absoluta de 24 horas
  ↓
Interacción normal: reinicia el contador de inactividad
  ↓
10 minutos sin interacción: estado inactivo y aviso
  ↓
Pausar / reanudar de forma explícita
  ↓
24 horas cumplidas: caducidad y nuevo acceso
```

- El código de acceso tiene un máximo de 3 intentos fallidos.
- La sesión caduca 24 horas después del ingreso, aunque exista actividad.
- La inactividad de 10 minutos pausa el procesamiento contextual y muestra un aviso; no amplía la sesión.
- El botón `Pausar sesión` permite detener voluntariamente la sesión. `Reanudar` exige que la sesión siga vigente.
- Los estados visibles serán `Activa`, `Pausada`, `Inactiva`, `Caducada` y `Bloqueada temporalmente`.

## Flujo vigente del Resumidor académico y Obsidian

El orden obligatorio se modifica así:

```text
Abrir el resumidor
  ↓
Validar acceso
  ↓
Abrir o enfocar la aplicación Obsidian
  ↓
Seleccionar la bóveda autorizada
  ↓
Seleccionar la nota o crear una nueva
  ↓
Seleccionar carpeta, archivo y ubicación exacta dentro de la bóveda
  ↓
Confirmar la ruta de destino
  ↓
Elegir la fuente del resumen
  ├── Texto pegado
  ├── Archivo
  ├── Carpeta autorizada
  ├── Captura o imagen
  └── Transcripción
  ↓
Analizar con el modelo local
  ↓
Revisar y editar el resultado
  ↓
Confirmar escritura en Obsidian
  ↓
Guardar mediante la API local
  ↓
Mostrar la ruta relativa y el enlace a la nota
```

La selección de bóveda, nota y ubicación debe hacerse mediante la aplicación de Obsidian o su integración local autorizada. El resumidor no debe inventar una bóveda ni guardar en una ruta predeterminada sin confirmación. Si Obsidian o su API local no están disponibles, debe detenerse antes de analizar la fuente y explicar cómo conectar la integración.

## Flujo vigente de la burbuja contextual

La burbuja flotante se muestra dentro de Herramientas y, cuando exista un adaptador autorizado, como acceso contextual sobre las páginas permitidas. Detecta solo el contexto mínimo, muestra las herramientas compatibles y abre la herramienta seleccionada dentro de la aplicación. La especificación completa está en [Burbuja flotante contextual](burbuja-contextual.md).

## Criterio actualizado de cierre del paso 6

El usuario aprobó el paso 6. Quedan validados el comportamiento visual de la burbuja en los modos integrado y contextual, el ciclo de sesión de 24 horas, los 3 intentos, la pausa, la inactividad de 10 minutos y el flujo de selección de destino en Obsidian.

## Actualización consolidada: elección de modo

Antes de iniciar una herramienta, el usuario puede elegir un modo o dejar que la aplicación proponga el adecuado:

```text
Abrir Herramientas
  ↓
Elegir modo
  ├── Integrado: usar herramienta dentro de Herramientas
  └── Contextual: activar burbuja sobre una página autorizada
        ↓
      Seleccionar y confirmar contenido
        ↓
      Abrir panel interno de la herramienta
```

En modo integrado, las siete herramientas operan en sus rutas internas actuales. En modo contextual, la burbuja solo entrega contexto confirmado al mismo flujo interno; no ejecuta acciones externas desde la página donde aparece.

Al cambiar de modo, la aplicación conserva únicamente el borrador o resultado que el usuario elija mantener. El contexto de una página no se reutiliza automáticamente en otra.

## Criterio actualizado de cierre de los pasos 1 a 6

Los pasos 1 a 6 estarán coherentes cuando la definición, funciones, stack, backend, API, seguridad y flujos describan los dos modos para las siete herramientas. La implementación comienza únicamente después de la confirmación del usuario sobre esta especificación.

## Flujo de instalación y acceso web

```text
Persona visita el sitio público en Vercel
  ↓
Consulta herramientas, requisitos y privacidad
  ↓
Descarga instalador verificado
  ↓
Instala y abre Herramientas en su equipo
  ↓
Configura de forma local los modelos, Obsidian, OBS Studio y permisos opcionales
  ↓
Usa el modo integrado o instala la extensión para el modo contextual
```

La aplicación de escritorio incluirá un enlace visible `Ver sitio web` para abrir la página pública. El sitio web incluirá un enlace `Descargar aplicación` hacia el instalador publicado. Ninguno de los dos enlaces transferirá automáticamente datos locales del usuario.

## Flujo vigente del Profesor de inglés C1: memoria, intereses y archivos

```text
Abrir Profesor de inglés C1
  ↓
Crear o seleccionar perfil local
  ↓
Diagnóstico de nivel y objetivos
  ↓
Preguntar intereses, temas preferidos y contexto de uso del inglés
  ↓
Guardar preferencias y progreso localmente
  ↓
Elegir actividad
  ├── Conversación
  ├── Prueba personalizada
  ├── Explicación de tema
  ├── Corrección de texto
  └── Archivo adjunto autorizado
        ↓
      Analizar contenido y explicar con mayor detalle
  ↓
Generar práctica adaptada al nivel, historial e intereses
  ↓
Registrar resultados, vocabulario y errores recurrentes
  ↓
Mostrar controles para editar o borrar memoria local
```

Las conversaciones previas solo se recuperarán desde el perfil local seleccionado. El usuario podrá desactivar la memoria, borrar una conversación, eliminar un archivo temporal o reiniciar su nivel y preferencias.

## Implementacion del paso 7: base de escritorio y borradores

El paso 7 queda definido como la primera base funcional de la aplicacion de escritorio. Incluye catalogo de siete herramientas, navegacion interna, selector de modo integrado/contextual, lanzador contextual, paneles iniciales por herramienta y formulario local para crear una nueva herramienta como borrador.

Una herramienta creada desde este formulario no se activa ni se publica automaticamente. El borrador conserva nombre, proposito, entradas, salidas y si requiere acceso protegido; la implementacion tecnica se realiza despues de revisar seguridad y flujo.

Criterio de cierre del paso 7:

- La pantalla principal permite abrir las siete herramientas desde tarjetas completas.
- El modo integrado y contextual se muestran de forma clara sin compartir contexto automaticamente entre paginas.
- Las herramientas protegidas solicitan acceso antes de abrir funciones sensibles.
- Existe un formulario real para registrar borradores de nuevas herramientas.
- La interfaz muestra estado local, estado de sesion, pausa/reanudacion y cierre de sesion.
- La aplicacion de escritorio conserva una CSP basica y conexiones limitadas a servicios locales permitidos.

## Actualizacion del paso 8: sesiones activas obligatorias

El paso 8 exige que las acciones protegidas se ejecuten solo con sesion activa. Una sesion autenticada pero pausada o inactiva ya no puede resumir, guardar en Obsidian, consultar OBS ni iniciar acciones sensibles hasta que el usuario pulse `Reanudar sesion`.

Estados vigentes:

- `Activa`: permite procesar contenido protegido.
- `Pausada`: conserva vigencia, pero detiene procesamiento.
- `Inactiva`: aparece tras 10 minutos sin actividad y exige reanudacion explicita.
- `Caducada`: ocurre al cumplir 24 horas desde el ingreso.
- `Bloqueada temporalmente`: ocurre tras 3 intentos fallidos.

## Actualizacion: flujo con agentes

Cada herramienta muestra su agente local asignado antes de procesar contenido.

```text
Abrir herramienta
  -> Ver agente asignado
  -> Confirmar o aportar contexto
  -> Coordinador valida sesion, modo y permisos
  -> Agente especializado analiza la tarea
  -> Agente propone resultado o accion
  -> Usuario revisa
  -> Usuario confirma guardado, descarga, OBS o modificacion si aplica
```

En modo contextual, la burbuja no ejecuta agentes directamente. Solo entrega contexto confirmado al coordinador local, que luego activa el agente correspondiente dentro de Herramientas.

Si el agente necesita una capacidad no disponible, como Ollama vision, ffmpeg, Obsidian o OBS Studio, debe mostrar el requisito faltante y permitir continuar con capacidades reducidas cuando sea posible.
## Actualización vigente: administrador, producto público y Profesor de música

El catálogo vigente contiene siete herramientas e incorpora el **Profesor de música**. Su agente crea planes adaptables de teoría, oído, instrumento, composición y práctica; recibe texto, objetivos o material autorizado y no conserva capturas ni archivos temporales después de siete días.

La aplicación de escritorio corresponde al modo administrador privado. El producto público queda pendiente y deberá aislar por completo cuentas, perfiles, notas y memoria. Ningún dato configurado por el administrador se reutiliza en la experiencia pública.