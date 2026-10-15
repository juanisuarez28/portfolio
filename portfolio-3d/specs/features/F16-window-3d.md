# F16 — Ventana con vista 3D y acercamiento
**Estado:** ✅ Hecho · Ideas 7 y 8 (reemplaza la vista "dibujada" de F03)

## Requisitos
- R1. Detrás de la ventana hay un paisaje 3D: sierras de Tandil con textura de pasto y roca, la Piedra Movediza sobre un cerro,
  barrio con casas y árboles, cielo físico (atmósfera) y niebla de distancia.
- R2. De noche: cielo oscuro, estrellas, luna y ventanas de casas encendidas.
- R3. El exterior solo se ve a través del vidrio (máscara de stencil), así puede ser grande sin asomarse por fuera del diorama.
- R4. Clic en la ventana → la cámara se acerca al vidrio y se asoma; Esc / Volver regresa. No abre panel.
- R5. Cortinas con leve movimiento por la brisa.

## Diseño
- `scene/outside/Outside.tsx`: terreno con ruido (PlaneGeometry desplazada), rocas, casas instanciadas, árboles instanciados, `Sky`, `Stars`.
- Máscara propia (plano con `stencilFunc = Always / ReplaceStencilOp`, `renderOrder -10`) sobre el hueco de la ventana; el exterior usa `Equal`. El composer necesita `stencilBuffer` (ADR-008).
- Nuevo preset de cámara `window` (no es una `SectionId` de contenido: se maneja como "foco" sin panel).

## Criterios de aceptación
- CA1. Desde la vista general el paisaje se ve solo por la ventana.
- CA2. Al acercarse se ve el paisaje con profundidad (paralaje al moverse).

## Tareas
- [x] Máscara de stencil en la ventana
- [x] Terreno, Piedra Movediza, barrio, cielo, niebla
- [x] Versión nocturna
- [x] Preset y hotspot "Mirar afuera"

## Notas de implementación
- La habitación está en un segundo piso (suelo exterior en y = -7.5) para ver por encima de los techos.
- Al asomarse la cámara abre el FOV a 55° con transición; casas con fachada (ventanas/puerta) y tanques de agua.
