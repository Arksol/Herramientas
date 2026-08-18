# Herramientas Browser Extension

Extensión contextual para conectar páginas autorizadas con la aplicación local de Herramientas.

## Objetivo

- Chrome general y Chrome Dev / Chromium: usan Manifest V3 con `background.service_worker`; ambos paquetes se generan por separado.
- Helium: usa el mismo manifiesto Chromium mientras conserve compatibilidad WebExtensions/MV3.
- Firefox: usa manifiesto WebExtensions MV3 con `background.scripts` y `browser_specific_settings`.

## Desarrollo local

```bash
npm run extension:build
```

Salidas:

```text
apps/browser-extension/dist/chrome
apps/browser-extension/dist/chrome-dev
apps/browser-extension/dist/firefox
apps/browser-extension/dist/helium
```

## Carga manual

- Chrome general: abrir `chrome://extensions`, activar Developer mode y cargar `dist/chrome`.
- Chrome Dev: abrir `chrome://extensions`, activar Developer mode y cargar `dist/chrome-dev`.
- Helium: abrir la página de extensiones compatible y cargar `dist/helium` como extensión desempaquetada.
- Firefox: abrir `about:debugging#/runtime/this-firefox` y cargar `dist/firefox/manifest.json`.

## Seguridad

La extensión se inyecta en páginas HTTP/HTTPS normales de todas las pestañas y ventanas donde esté habilitada. Solo envía selección explícita, URL, título y origen al backend local en `http://127.0.0.1:3030`; no lee cookies, contraseñas, tokens, formularios ocultos ni otras pestañas.
