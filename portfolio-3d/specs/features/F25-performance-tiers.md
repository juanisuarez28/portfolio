# F25 — Rendimiento en PCs comunes
**Estado:** ✅ Hecho

## Objetivo
Que la habitación ande fluida en la mayoría de las PCs (incluidas notebooks con gráficos integrados) sin perder el look.

## Requisitos
- R1. Calidad inicial según el hardware: "low" en touch, ≤4 núcleos, ≤4 GB de RAM o GPU integrada/por software.
- R2. Resolución adaptativa: "high" entre 1 y 1.5 de DPR, "low" entre 0.75 y 1; el `PerformanceMonitor` baja la resolución de a poco y, si sigue lento, pasa a "low".
- R3. Sombras bajo demanda: no se recalculan cada frame, solo cuando algo se mueve (cámara en transición, física despierta, jueguitos) y unas veces por segundo en reposo.
- R4. Calidad "low" conserva bloom, tilt-shift, SMAA, viñeta y sombras; pierde desenfoque de profundidad, clearcoat/sheen y baja el tamaño de los shadow maps.
- R5. Botón en el HUD para elegir a mano entre calidad alta y modo liviano; la elección se guarda y el ajuste automático no la pisa.

## Criterios de aceptación
- CA1. Sin errores de consola en ambas calidades; la sombra de la pelota sigue a la pelota.
- CA2. En calidad baja la escena se ve igual de reconocible (mismas luces, sombras y postprocesado principal).

## Diseño
- `lib/webgl.ts → detectQuality()`, store `quality` + `qualityLocked` + `toggleQuality()` (localStorage `quality`).
- `scene/ShadowUpdater.tsx` + `lib/shadows.ts` (`markShadowsDirty`); `PhysicsWorld` marca sucio mientras haya cuerpos activos.
- `room/materials.ts → applyMaterialQuality()` pone clearcoat/sheen en 0 (three los saca del shader).

## Tareas
- [x] Detección de hardware y calidad inicial
- [x] DPR adaptativo por calidad
- [x] Sombras bajo demanda
- [x] Calidad baja sin perder el look
- [x] Botón de calidad en el HUD
