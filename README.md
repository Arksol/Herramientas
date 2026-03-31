# Estructura recomendada para proyecto web mediano

Esta organizacion esta pensada para proyectos con HTML, CSS y JavaScript sin frameworks, pero con buena escalabilidad.

## Estructura

```text
.
|-- index.html
|-- pages/
|   `-- sobre-mi.html
|-- assets/
|   |-- css/
|   |   |-- base/
|   |   |   |-- reset.css
|   |   |   |-- variables.css
|   |   |   `-- global.css
|   |   |-- layout/
|   |   |   |-- header.css
|   |   |   `-- footer.css
|   |   |-- components/
|   |   |   `-- button.css
|   |   `-- pages/
|   |       `-- home.css
|   |-- js/
|   |   |-- main.js
|   |   |-- modules/
|   |   |   `-- home.js
|   |   `-- utils/
|   |       `-- dom.js
|   |-- images/
|   `-- fonts/
`-- data/
    `-- site.json
```

## Por que es una buena practica para proyectos medianos

1. **Separacion por responsabilidad**: cada carpeta tiene un rol claro (base, layout, components, pages, modules, utils).
2. **Escalable**: puedes agregar paginas y modulos sin mezclar archivos.
3. **Mantenible**: localizar errores y hacer cambios es mas rapido.
4. **Reutilizable**: estilos y funciones comunes se comparten entre paginas.
5. **Orden para trabajo en equipo**: facilita que varias personas colaboren sin conflictos.

## Convenciones de nombres recomendadas

- HTML: `kebab-case` (ejemplo: `sobre-mi.html`)
- CSS: por tipo y alcance (`header.css`, `button.css`, `home.css`)
- JS: `main.js` como entrada, `modules/` para funcionalidades, `utils/` para helpers
- Imagenes: nombres descriptivos (`hero-home.webp`, `logo-principal.svg`)

## Siguiente evolucion (si el proyecto crece)

- Agregar `assets/css/pages/` para cada pagina nueva.
- Agregar `assets/js/modules/` por funcionalidad (auth, forms, gallery).
- Incorporar herramienta de build (Vite o Parcel) cuando haya mucho JS/CSS.
- Integrar linters/formatters (ESLint + Prettier + Stylelint).
