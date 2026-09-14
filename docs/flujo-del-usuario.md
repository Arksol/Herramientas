# Flujo del usuario

## Objetivo

Definir cÃ³mo una persona navegarÃ¡ por Herramientas y cÃ³mo utilizarÃ¡ las seis herramientas sin salir de la aplicaciÃ³n ni abrir ventanas del navegador.

## NavegaciÃ³n global

```text
Inicio
  â†“
Herramientas
  â”œâ”€â”€ Resumidor acadÃ©mico y Obsidian
  â”œâ”€â”€ Descarga de clases
  â”œâ”€â”€ Profesor de inglÃ©s C1
  â”œâ”€â”€ Profesor integral de tecnologÃ­a
  â”œâ”€â”€ Arquitecto de prompts visuales
  â”œâ”€â”€ Arquitecto de prompts de cÃ³digo
  â””â”€â”€ Crear nueva herramienta

Acerca de
```

Las herramientas se abrirÃ¡n mediante rutas internas de la aplicaciÃ³n. El navegador no deberÃ¡ crear nuevas ventanas ni pestaÃ±as.

## Flujo inicial

1. El usuario abre Herramientas en local.
2. La aplicaciÃ³n verifica que el frontend estÃ© disponible.
3. La aplicaciÃ³n comprueba el estado del backend local.
4. La pantalla principal muestra las seis herramientas.
5. El usuario selecciona una tarjeta completa.
6. La aplicaciÃ³n navega a la subpÃ¡gina correspondiente.

Si el backend o un modelo local no estÃ¡ disponible, la interfaz debe mostrar un mensaje claro y explicar cÃ³mo continuar sin exponer detalles tÃ©cnicos innecesarios.

## Flujo de acceso protegido

Aplica a:

- Resumidor acadÃ©mico y Obsidian.
- Descarga de clases.

```text
Usuario selecciona la herramienta
  â†“
Pantalla de acceso
  â†“
Introduce cÃ³digo o contraseÃ±a
  â†“
Backend valida el cÃ³digo
  â†“
SesiÃ³n local temporal
  â†“
Acceso autorizado a la herramienta
```

Reglas:

- El frontend no valida por sÃ­ solo el acceso.
- El backend compara contra un hash seguro.
- Los intentos fallidos tienen lÃ­mite.
- La sesiÃ³n caduca.
- El usuario puede cerrar sesiÃ³n.
- Un acceso vÃ¡lido a una herramienta no debe conceder permisos innecesarios a otra.

## Flujo del Resumidor acadÃ©mico y Obsidian

```text
Abrir herramienta
  â†“
Validar acceso
  â†“
Elegir fuente
  â”œâ”€â”€ Texto pegado
  â”œâ”€â”€ Archivo
  â”œâ”€â”€ Carpeta autorizada
  â”œâ”€â”€ Captura o imagen
  â””â”€â”€ TranscripciÃ³n
  â†“
Seleccionar tipo de resumen
  â†“
Analizar contenido con modelo local
  â†“
Revisar resultado
  â†“
Elegir carpeta de destino en Obsidian
  â†“
Confirmar nombre y ruta relativa
  â†“
Guardar nota mediante API local
  â†“
Mostrar enlace y ruta creada
```

La herramienta debe permitir editar el resultado antes de guardarlo. Nunca debe afirmar que la nota se guardÃ³ si la API local no confirmÃ³ la operaciÃ³n.

## Flujo de Descarga de clases

```text
Abrir herramienta
  â†“
Validar acceso
  â†“
Elegir plataforma
  â†“
Indicar curso, mÃ³dulo y clase
  â†“
Buscar opciÃ³n oficial
  â”œâ”€â”€ Existe descarga oficial
  â”‚     â†“
  â”‚   Elegir carpeta
  â”‚     â†“
  â”‚   Descargar y verificar archivo
  â”‚
  â””â”€â”€ No existe descarga oficial
        â†“
      Mostrar reglas de autorizaciÃ³n
        â†“
      Usuario confirma permiso de grabaciÃ³n
        â†“
      Indicar nombre de clase y carpeta
        â†“
      Abrir OBS Studio
        â†“
      Usuario inicia y detiene grabaciÃ³n
        â†“
      Organizar y verificar archivo resultante
```

La aplicaciÃ³n no debe extraer transmisiones protegidas ni iniciar grabaciones silenciosas. La decisiÃ³n de grabar siempre debe ser visible y confirmada.

## Flujo del Profesor de inglÃ©s C1

```text
Abrir herramienta
  â†“
Completar diagnÃ³stico inicial
  â†“
Evaluar lectura, escritura, gramÃ¡tica y vocabulario
  â†“
Practicar conversaciÃ³n y pronunciaciÃ³n cuando estÃ©n disponibles
  â†“
Calcular nivel estimado
  â†“
Crear plan de aprendizaje
  â†“
Iniciar sesiÃ³n de estudio
  â†“
Recibir correcciones y ejercicios
  â†“
Guardar registro local de progreso
```

El progreso se conservarÃ¡ localmente en la primera versiÃ³n. No se enviarÃ¡ a servicios externos por defecto.

## Flujo del Profesor integral de tecnologÃ­a

```text
Abrir herramienta
  â†“
Evaluar conocimientos iniciales
  â†“
Seleccionar Ã¡rea
  â”œâ”€â”€ Fullstack
  â”œâ”€â”€ Ciencia de datos
  â”œâ”€â”€ Ciberseguridad
  â”œâ”€â”€ RobÃ³tica
  â”œâ”€â”€ Hardware
  â””â”€â”€ Software
  â†“
Definir objetivo
  â†“
Explicar concepto
  â†“
Mostrar ejemplo
  â†“
Realizar ejercicio guiado
  â†“
Resolver ejercicio independiente
  â†“
Revisar resultado
  â†“
Registrar progreso y siguiente tema
```

Los ejercicios de ciberseguridad se limitarÃ¡n a laboratorios, CTF, mÃ¡quinas virtuales y sistemas autorizados.

## Flujo del Arquitecto de prompts visuales

```text
Abrir herramienta
  â†“
Escribir idea o prompt
  â†“
Opcionalmente seleccionar archivos
  â”œâ”€â”€ ImÃ¡genes
  â”œâ”€â”€ Videos
  â”œâ”€â”€ Capturas
  â””â”€â”€ Carpeta de referencias
  â†“
Analizar archivos autorizados
  â†“
Identificar estilo, composiciÃ³n y elementos
  â†“
Modificar o crear prompt
  â†“
Mostrar referencias utilizadas
  â†“
Copiar o guardar resultado
```

Si no hay archivos, la herramienta trabajarÃ¡ Ãºnicamente con el texto recibido.

## Flujo del Arquitecto de prompts de cÃ³digo

```text
Abrir herramienta
  â†“
Escribir idea, error o requisito
  â†“
Opcionalmente seleccionar archivos
  â”œâ”€â”€ CÃ³digo
  â”œâ”€â”€ Carpeta de proyecto
  â”œâ”€â”€ Capturas
  â”œâ”€â”€ Logs
  â”œâ”€â”€ ConfiguraciÃ³n
  â””â”€â”€ DocumentaciÃ³n
  â†“
Analizar estructura y contexto
  â†“
Detectar faltantes y riesgos
  â†“
Generar prompt tÃ©cnico
  â†“
Mostrar archivos analizados y excluidos
  â†“
Copiar o guardar resultado
```

Antes de analizar, la herramienta debe excluir o enmascarar secretos como `.env`, tokens, certificados privados y claves API.

## Flujo para crear una nueva herramienta

1. El usuario selecciona â€œCrear nueva herramientaâ€.
2. La aplicaciÃ³n muestra un formulario interno.
3. El usuario indica nombre, propÃ³sito y descripciÃ³n.
4. Define si requiere acceso protegido.
5. Define entradas y resultados esperados.
6. Guarda un borrador local.
7. La nueva herramienta aparece en el catÃ¡logo como borrador.
8. La implementaciÃ³n tÃ©cnica se realiza posteriormente.

Una herramienta nueva no debe quedar disponible pÃºblicamente sin revisiÃ³n de seguridad y validaciÃ³n del flujo.

## Estados comunes

Todas las herramientas deben contemplar:

- Estado vacÃ­o.
- Solicitud de acceso.
- Carga de archivo.
- Procesamiento.
- Resultado parcial.
- Resultado completo.
- Ã‰xito.
- Error recuperable.
- Servicio local no disponible.
- Archivo no compatible.
- CancelaciÃ³n por el usuario.

## Criterio de cierre del paso 6

El paso se considera completado cuando los flujos de navegaciÃ³n, acceso, procesamiento, confirmaciÃ³n, guardado y error estÃ¡n definidos para las seis herramientas y para la creaciÃ³n de futuras herramientas.

## VersiÃ³n vigente del paso 6: sesiÃ³n, pausa e inactividad

Las siguientes reglas sustituyen y detallan las reglas generales de acceso descritas anteriormente:

```text
Ingreso correcto
  â†“
Inicio de sesiÃ³n en la hora actual
  â†“
Vigencia absoluta de 24 horas
  â†“
InteracciÃ³n normal: reinicia el contador de inactividad
  â†“
10 minutos sin interacciÃ³n: estado inactivo y aviso
  â†“
Pausar / reanudar de forma explÃ­cita
  â†“
24 horas cumplidas: caducidad y nuevo acceso
```

- El cÃ³digo de acceso tiene un mÃ¡ximo de 3 intentos fallidos.
- La sesiÃ³n caduca 24 horas despuÃ©s del ingreso, aunque exista actividad.
- La inactividad de 10 minutos pausa el procesamiento contextual y muestra un aviso; no amplÃ­a la sesiÃ³n.
- El botÃ³n `Pausar sesiÃ³n` permite detener voluntariamente la sesiÃ³n. `Reanudar` exige que la sesiÃ³n siga vigente.
- Los estados visibles serÃ¡n `Activa`, `Pausada`, `Inactiva`, `Caducada` y `Bloqueada temporalmente`.

## Flujo vigente del Resumidor acadÃ©mico y Obsidian

El orden obligatorio se modifica asÃ­:

```text
Abrir el resumidor
  â†“
Validar acceso
  â†“
Abrir o enfocar la aplicaciÃ³n Obsidian
  â†“
Seleccionar la bÃ³veda autorizada
  â†“
Seleccionar la nota o crear una nueva
  â†“
Seleccionar carpeta, archivo y ubicaciÃ³n exacta dentro de la bÃ³veda
  â†“
Confirmar la ruta de destino
  â†“
Elegir la fuente del resumen
  â”œâ”€â”€ Texto pegado
  â”œâ”€â”€ Archivo
  â”œâ”€â”€ Carpeta autorizada
  â”œâ”€â”€ Captura o imagen
  â””â”€â”€ TranscripciÃ³n
  â†“
Analizar con el modelo local
  â†“
Revisar y editar el resultado
  â†“
Confirmar escritura en Obsidian
  â†“
Guardar mediante la API local
  â†“
Mostrar la ruta relativa y el enlace a la nota
```

La selecciÃ³n de bÃ³veda, nota y ubicaciÃ³n debe hacerse mediante la aplicaciÃ³n de Obsidian o su integraciÃ³n local autorizada. El resumidor no debe inventar una bÃ³veda ni guardar en una ruta predeterminada sin confirmaciÃ³n. Si Obsidian o su API local no estÃ¡n disponibles, debe detenerse antes de analizar la fuente y explicar cÃ³mo conectar la integraciÃ³n.

## Flujo vigente de la burbuja contextual

La burbuja flotante se muestra dentro de Herramientas y, cuando exista un adaptador autorizado, como acceso contextual sobre las pÃ¡ginas permitidas. Detecta solo el contexto mÃ­nimo, muestra las herramientas compatibles y abre la herramienta seleccionada dentro de la aplicaciÃ³n. La especificaciÃ³n completa estÃ¡ en [Burbuja flotante contextual](burbuja-contextual.md).

## Criterio actualizado de cierre del paso 6

El usuario aprobÃ³ el paso 6. Quedan validados el comportamiento visual de la burbuja en los modos integrado y contextual, el ciclo de sesiÃ³n de 24 horas, los 3 intentos, la pausa, la inactividad de 10 minutos y el flujo de selecciÃ³n de destino en Obsidian.

## ActualizaciÃ³n consolidada: elecciÃ³n de modo

Antes de iniciar una herramienta, el usuario puede elegir un modo o dejar que la aplicaciÃ³n proponga el adecuado:

```text
Abrir Herramientas
  â†“
Elegir modo
  â”œâ”€â”€ Integrado: usar herramienta dentro de Herramientas
  â””â”€â”€ Contextual: activar burbuja sobre una pÃ¡gina autorizada
        â†“
      Seleccionar y confirmar contenido
        â†“
      Abrir panel interno de la herramienta
```

En modo integrado, las seis herramientas operan en sus rutas internas actuales. En modo contextual, la burbuja solo entrega contexto confirmado al mismo flujo interno; no ejecuta acciones externas desde la pÃ¡gina donde aparece.

Al cambiar de modo, la aplicaciÃ³n conserva Ãºnicamente el borrador o resultado que el usuario elija mantener. El contexto de una pÃ¡gina no se reutiliza automÃ¡ticamente en otra.

## Criterio actualizado de cierre de los pasos 1 a 6

Los pasos 1 a 6 estarÃ¡n coherentes cuando la definiciÃ³n, funciones, stack, backend, API, seguridad y flujos describan los dos modos para las seis herramientas. La implementaciÃ³n comienza Ãºnicamente despuÃ©s de la confirmaciÃ³n del usuario sobre esta especificaciÃ³n.

## Flujo de instalaciÃ³n y acceso web

```text
Persona visita el sitio pÃºblico en Vercel
  â†“
Consulta herramientas, requisitos y privacidad
  â†“
Descarga instalador verificado
  â†“
Instala y abre Herramientas en su equipo
  â†“
Configura de forma local los modelos, Obsidian, OBS Studio y permisos opcionales
  â†“
Usa el modo integrado o instala la extensiÃ³n para el modo contextual
```

La aplicaciÃ³n de escritorio incluirÃ¡ un enlace visible `Ver sitio web` para abrir la pÃ¡gina pÃºblica. El sitio web incluirÃ¡ un enlace `Descargar aplicaciÃ³n` hacia el instalador publicado. Ninguno de los dos enlaces transferirÃ¡ automÃ¡ticamente datos locales del usuario.

## Flujo vigente del Profesor de inglÃ©s C1: memoria, intereses y archivos

```text
Abrir Profesor de inglÃ©s C1
  â†“
Crear o seleccionar perfil local
  â†“
DiagnÃ³stico de nivel y objetivos
  â†“
Preguntar intereses, temas preferidos y contexto de uso del inglÃ©s
  â†“
Guardar preferencias y progreso localmente
  â†“
Elegir actividad
  â”œâ”€â”€ ConversaciÃ³n
  â”œâ”€â”€ Prueba personalizada
  â”œâ”€â”€ ExplicaciÃ³n de tema
  â”œâ”€â”€ CorrecciÃ³n de texto
  â””â”€â”€ Archivo adjunto autorizado
        â†“
      Analizar contenido y explicar con mayor detalle
  â†“
Generar prÃ¡ctica adaptada al nivel, historial e intereses
  â†“
Registrar resultados, vocabulario y errores recurrentes
  â†“
Mostrar controles para editar o borrar memoria local
```

Las conversaciones previas solo se recuperarÃ¡n desde el perfil local seleccionado. El usuario podrÃ¡ desactivar la memoria, borrar una conversaciÃ³n, eliminar un archivo temporal o reiniciar su nivel y preferencias.

## Implementacion del paso 7: base de escritorio y borradores

El paso 7 queda definido como la primera base funcional de la aplicacion de escritorio. Incluye catalogo de seis herramientas, navegacion interna, selector de modo integrado/contextual, lanzador contextual, paneles iniciales por herramienta y formulario local para crear una nueva herramienta como borrador.

Una herramienta creada desde este formulario no se activa ni se publica automaticamente. El borrador conserva nombre, proposito, entradas, salidas y si requiere acceso protegido; la implementacion tecnica se realiza despues de revisar seguridad y flujo.

Criterio de cierre del paso 7:

- La pantalla principal permite abrir las seis herramientas desde tarjetas completas.
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