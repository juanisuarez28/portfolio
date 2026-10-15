# F06 — Cámara y navegación
**Estado:** ✅ Hecho

## Objetivo
Movimientos de cámara cinematográficos y acotados: nunca perderse ni ver "detrás" de la habitación.

## Requisitos
- R1. Vista general en diagonal (pseudo-isométrica, FOV bajo) que encuadra toda la habitación.
- R2. Órbita limitada en azimut y altura, zoom limitado, sin paneo en vista general.
- R3. Cada sección tiene un preset (posición + objetivo); al cambiar, la cámara vuela con easing suave.
- R4. Con panel abierto en desktop, el objeto enfocado queda a la izquierda del panel.
- R5. Volver a la vista general con botón "Volver", tecla Esc o click en el fondo.
- R6. Animación de entrada: al terminar la carga la cámara se acerca desde lejos.
- R7. El encuadre general se adapta al aspect ratio (en vertical se aleja).

## Criterios de aceptación
- CA1. No se puede rotar para ver detrás de las paredes.
- CA2. Ir y volver de cualquier sección no deja la cámara en estado inconsistente.

## Diseño
- `scene/CameraRig.tsx` usando `CameraControls` de drei; escucha `section` del store.
- `scene/cameraPresets.ts`: `{ overview, projects, education, skills, about, contact, cv }`.

## Tareas
- [x] Presets y límites
- [x] Transiciones al cambiar sección + offset por panel
- [x] Esc / volver / click en vacío
- [x] Intro y encuadre responsive

## Notas de implementación
- Cada preset tiene `fitWidth`: si el ancho no entra (pantalla vertical o panel abierto) la cámara se aleja sobre la misma línea de visión (`fitPreset`).
- En mobile el objeto se centra en la franja libre entre el HUD y la hoja inferior.
- Ojo: en camera-controls un `focalOffset.y` positivo **baja** la cámara.
- En dev, `window.__cc` expone los controles para depurar.
