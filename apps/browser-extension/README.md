# Herramientas Browser Extension

Extensión contextual para conectar páginas autorizadas con la aplicación local de Herramientas.

## Objetivo

- Chrome Dev / Chromium: usa Manifest V3 con `background.service_worker`.
- Helium: usa el mismo manifiesto Chromium mientras conserve compatibilidad WebExtensions/MV3.
- Firefox: usa manifiesto WebExtensions MV3 con `background.scripts` y `browser_specific_settings`.

## Desarrollo local

```bash
npm run extension:build
```

Salidas:

```text
apps/browser-extension/dist/chrome-dev
apps/browser-extension/dist/firefox
apps/browser-extension/dist/helium
```

## Carga manual

- Chrome Dev: abrir `chrome://extensions`, activar Developer mode y cargar `dist/chrome-dev`.
- Helium: abrir la página de extensiones compatible y cargar `dist/helium` como extensión desempaquetada.
- Firefox: abrir `about:debugging#/runtime/this-firefox` y cargar `dist/firefox/manifest.json`.

## Seguridad

La extensión solo envía selección explícita, URL, título y origen al backend local en `http://127.0.0.1:3030`. No lee cookies, contraseñas, tokens, formularios ocultos ni otras pestañas.
