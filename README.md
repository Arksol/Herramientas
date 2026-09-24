# Herramientas

Proyecto base para desarrollar herramientas web y automatizaciones relacionadas con el estudio, la programacion y la organizacion de informacion en Obsidian.

## Estructura actual

```text
.
|-- index.html
|-- pages/
|   `-- sobre-mi.html
|-- assets/
|   |-- css/
|   |-- fonts/
|   |-- images/
|   `-- js/
|-- data/
`-- course-study-obsidian-skill.zip
```

## Estado

La aplicacion web es actualmente una plantilla inicial con HTML, CSS y JavaScript modular. El ZIP contiene un prototipo independiente de una skill para estudiar cursos y generar materiales para Obsidian.

## Proxima evolucion

El proyecto puede crecer hacia una aplicacion que integre configuracion de cursos, recopilacion autorizada de recursos, capturas, generacion de notas, mapas conceptuales y exportacion a Obsidian.

Antes de publicar cambios en GitHub deben resolverse las decisiones de arquitectura, las pruebas y la integracion real de la skill.

## Documentacion

- [Definicion del proyecto](docs/definicion-del-proyecto.md)
- [IA local multimodal](docs/ia-local-multimodal.md)
- [Extension de navegador](docs/extension-navegador.md)

## Plataforma prevista

El producto se desarrolla actualmente como una aplicacion web local-first con un sitio web publico complementario desplegado en Vercel. La futura aplicacion de escritorio sin Rust/Tauri queda como paso pendiente en [docs/distribucion-desktop-y-web.md](docs/distribucion-desktop-y-web.md).

## Arquitectura de agentes

El plan del producto incorpora agentes locales especializados por herramienta. La especificacion central esta en [Arquitectura de agentes locales](docs/arquitectura-de-agentes.md).
