# Extension de navegador

## Objetivo

Herramientas tendra una extension contextual compatible con:

- Chrome Dev y navegadores Chromium compatibles.
- Firefox mediante WebExtensions.
- Helium usando el manifiesto Chromium mientras mantenga compatibilidad con extensiones MV3.

La extension permite que la app de escritorio y el sitio web expliquen y activen el modo contextual sin intentar inyectar codigo desde la web publica.

## Relacion entre escritorio, web y extension

```text
Sitio web publico
  -> explica capacidades y descarga/instalacion

Aplicacion de escritorio
  -> ejecuta backend local en 127.0.0.1
  -> recibe contexto autorizado
  -> procesa con agentes locales

Extension de navegador
  -> muestra burbuja contextual sobre paginas autorizadas
  -> captura solo seleccion explicita
  -> envia contexto minimo al backend local
```

## Paquetes generados

```text
apps/browser-extension/dist/chrome-dev
apps/browser-extension/dist/firefox
apps/browser-extension/dist/helium
```

## Seguridad

- La extension no lee cookies, tokens, contrasenas, campos ocultos ni otras pestanas.
- Solo envia seleccion visible confirmada por el usuario.
- El backend local valida origen, tamano, herramienta solicitada y consentimiento.
- La extension no ejecuta descargas, OBS, Obsidian ni escritura de archivos.
- Toda accion sensible ocurre despues dentro de Herramientas.

## Endpoints locales usados

- `GET /api/extension/health`: verifica que la app local esta disponible.
- `GET /api/context/capabilities`: lista herramientas disponibles para contexto.
- `POST /api/context/inspect`: envia seleccion confirmada y recibe un `contextSessionId`.

## Estado actual

Existe un scaffold funcional con background, content script, popup y manifiestos separados para Chrome Dev, Firefox y Helium. La siguiente etapa es vincular el `contextSessionId` con la apertura automatica de la herramienta correspondiente dentro de la app de escritorio.

## Sitios autorizados inicialmente

La extension se limita a dominios educativos concretos para reducir permisos:

- `*.platzi.com`
- `*.ebac.mx`
- `uvm.class.com`
- `*.class.com`
- `*.mastermind.com`

El backend local solo acepta comunicacion con `127.0.0.1:3030` o `localhost:3030`. Si una plataforma usa otro dominio, debe agregarse explicitamente al manifiesto y al adaptador correspondiente.

## Adaptadores de contenido

La burbuja debe intentar extraer contexto por capas:

1. Texto seleccionado por el usuario.
2. Transcripcion visible en el DOM de la plataforma.
3. `video.textTracks` cuando el navegador exponga subtitulos.
4. Archivos `.vtt` o `.srt` autorizados por allowlist y validados por el backend.
5. Pegado manual como fallback.

La burbuja del content script ya usa Shadow DOM, se puede mover manualmente y guarda su posicion por sitio para evitar conflictos con las paginas de clase.

## Compatibilidad MV3

Los manifiestos usan `service_worker` para Chromium/Helium y mantienen `background.scripts` en Firefox como ruta compatible de WebExtensions. El codigo de content script queda autocontenido porque los content scripts no dependen del empaquetado de modulos al copiar archivos.


## Implementado para clases

- Burbuja con Shadow DOM para aislar estilos.
- Movimiento manual de la burbuja y posicion guardada en `chrome.storage.local`.
- Cache local IndexedDB por URL para capturas y transcripciones enviadas.
- Adaptadores iniciales para Platzi, EBAC, UVM/Class y Mastermind.
- Extraccion por capas: seleccion visible, `video.textTracks`, transcript/caption DOM y fallback manual con VTT/SRT.

