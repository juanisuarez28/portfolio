# Specs — Portfolio 3D (SDD)

Este proyecto se desarrolla con **Spec-Driven Development**: cada funcionalidad se define primero
en una spec (qué y por qué), después se diseña (cómo) y recién ahí se implementa siguiendo una lista
de tareas. Las specs son la fuente de verdad; si el código cambia de comportamiento, la spec se
actualiza en el mismo cambio.

## Documentos

| Documento | Contenido |
|---|---|
| [vision.md](vision.md) | Objetivo del producto, audiencia, principios y alcance |
| [architecture.md](architecture.md) | Stack, estructura de carpetas, flujo de datos y decisiones (ADRs) |
| [scene-layout.md](scene-layout.md) | Plano de la habitación: coordenadas, objetos y a qué sección lleva cada uno |
| [features/](features/) | Una spec por feature: requisitos, criterios de aceptación, diseño y tareas |

## Flujo de trabajo

1. **Spec**: crear `features/FXX-nombre.md` con objetivo, requisitos (`R1`, `R2`…) y criterios de aceptación (`CA1`…).
2. **Diseño**: completar la sección *Diseño* (componentes, estado, archivos afectados).
3. **Tareas**: checklist `- [ ]` chico y verificable.
4. **Implementación**: marcar tareas `- [x]` a medida que se completan.
5. **Verificación**: chequear cada criterio de aceptación (build + prueba en navegador) y pasar el estado a `✅ Hecho`.

Estados: `📝 Spec` · `🚧 En curso` · `✅ Hecho` · `⏸️ Pospuesto`

## Roadmap

| ID | Feature | Estado |
|---|---|---|
| F01 | [Setup del proyecto y deploy](features/F01-setup.md) | ✅ Hecho |
| F02 | [Capa de contenido](features/F02-content.md) | ✅ Hecho |
| F03 | [Habitación: estructura, luces y render](features/F03-room-rendering.md) | ✅ Hecho |
| F04 | [Mobiliario y objetos](features/F04-furniture.md) | ✅ Hecho |
| F05 | [Interacción con objetos](features/F05-interaction.md) | ✅ Hecho |
| F06 | [Cámara y navegación](features/F06-camera.md) | ✅ Hecho |
| F07 | [Interfaz y paneles de contenido](features/F07-ui-panels.md) | ✅ Hecho |
| F08 | [Monitor interactivo (proyectos)](features/F08-monitor.md) | ✅ Hecho |
| F09 | [Modo día / noche](features/F09-day-night.md) | ✅ Hecho |
| F10 | [Easter eggs](features/F10-easter-eggs.md) | ✅ Hecho |
| F11 | [Carga, rendimiento y mobile](features/F11-loading-performance.md) | ✅ Hecho (CA1 pendiente) |
| F12 | [Accesibilidad y SEO](features/F12-a11y-seo.md) | ✅ Hecho |

## Backlog (ideas para próximas versiones)

- Modelos hechos en Blender con iluminación horneada (ver ADR-002) para reemplazar piezas procedurales.
- Sonido ambiente y efectos (clicks, pelota, consola) con botón de mute.
- Versión en inglés (i18n del contenido en `src/content`).
- Imagen Open Graph para compartir el link (captura de la habitación).
- Bajar el peso del bundle 3D (hoy ~507 KB gzip, ver F11).
- Link a la "versión clásica" del portfolio (falta la URL pública: `classicUrl` en `src/content/profile.ts`).
- Escena exterior "Mi barrio de clientes" al hacer clic en la ventana.
