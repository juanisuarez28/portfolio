# F08 — Monitor interactivo (proyectos)
**Estado:** ✅ Hecho

## Objetivo
El efecto "wow": en desktop, los proyectos se navegan dentro de la pantalla del monitor 3D.

## Requisitos
- R1. En reposo, el monitor muestra un escritorio ("JuaniOS") con wallpaper, íconos y reloj (textura canvas).
- R2. Al enfocar Proyectos en pantallas ≥ 900 px, se monta HTML real dentro de la pantalla (drei `Html transform`) con el navegador de proyectos.
- R3. En pantallas chicas los proyectos se muestran en el panel normal.
- R4. Dentro del monitor: pestañas Freelance / Universidad, grilla de proyectos, vista detalle con imagen, tags y links.

## Criterios de aceptación
- CA1. En desktop, al hacer click en el monitor, la cámara se acerca y se puede clickear un proyecto dentro de la pantalla y abrir su link.
- CA2. El HTML no aparece flotando cuando la cámara no está enfocada en el monitor.

## Diseño
- `scene/objects/Computer.tsx` monta `<Html transform>` solo si `section === 'projects' && wide && cameraSettled`.
- `ProjectsBrowser` con prop `variant: 'panel' | 'screen'`.

## Tareas
- [x] Textura de escritorio en reposo
- [x] Montaje condicional del HTML en la pantalla
- [x] Variante `screen` del navegador de proyectos

## Notas de implementación
- Escala del HTML: `distanceFactor = ancho_pantalla_m × 400 / ancho_px` (1280 px ↔ 0.95 m).
