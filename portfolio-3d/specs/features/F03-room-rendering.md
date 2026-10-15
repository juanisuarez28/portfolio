# F03 — Habitación: estructura, luces y render
**Estado:** ✅ Hecho

## Objetivo
Un diorama de habitación que se vea "renderizado": materiales cálidos, sombras suaves y oclusión ambiental.

## Requisitos
- R1. Losa de piso + pared del fondo (con hueco de ventana) + pared izquierda, lado abierto hacia la cámara.
- R2. Piso de madera y alfombra con texturas generadas en canvas (sin archivos).
- R3. Vista de las sierras de Tandil (con la Piedra Movediza) detrás de la ventana.
- R4. Iluminación: luz principal con sombras suaves, relleno ambiental, environment con lightformers, luz que entra por la ventana.
- R5. Postprocesado: N8AO, Bloom selectivo (solo emisivos), Vignette, SMAA; tone mapping ACES.
- R6. Fondo de la página con gradiente que combine con la escena.

## Criterios de aceptación
- CA1. Las paredes y muebles proyectan sombras suaves sobre el piso.
- CA2. Se aprecia oclusión en esquinas y bajo los muebles.
- CA3. La vista de la ventana muestra sierras y cielo.

## Diseño
- `scene/Experience.tsx` (Canvas), `scene/Room.tsx`, `scene/Lights.tsx`, `scene/Effects.tsx`, `scene/WindowView.tsx`.
- `lib/canvasTextures.ts`: generadores `woodFloor`, `rug`, `tandilView(day|night)`, etc. memoizados.
- `lib/palette.ts`: paleta de colores de la habitación.

## Tareas
- [x] Losa, paredes, zócalos y ventana con marco y vidrio
- [x] Texturas canvas de piso, alfombra y vista
- [x] Luces + sombras + environment
- [x] Postprocesado

## Notas de implementación
- **v2:** la estructura y los muebles vienen del GLB de Blender (F13); la vista dibujada en canvas se reemplazó por el exterior 3D (F16); N8AO se quitó (AO horneado).
- La vista de Tandil es un plano de 3.6 × 1.8 m pegado detrás de la ventana (`z = -3.7`): uno más grande y lejano se veía por fuera de la habitación porque el diorama está abierto.
- Environment con `Lightformer`s orientados con `rotation` (la prop `lookAt` rompe en drei 10).
