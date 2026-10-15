# F09 — Modo día / noche
**Estado:** ✅ Hecho

## Objetivo
Darle vida a la habitación con dos ambientes.

## Requisitos
- R1. Toggle desde el HUD y haciendo click en la lámpara del escritorio.
- R2. Noche: luz principal tenue y azulada, lámpara encendida con luz cálida, tira LED cyan bajo el estante, pantallas brillantes con bloom, vista con estrellas, luna y luces de la ciudad.
- R3. Transición animada (no un corte) de luces y fondo.
- R4. El modo inicial sigue la hora local (19 a 7 h → noche).

## Criterios de aceptación
- CA1. Cambiar el modo anima luces durante ~1 s y cambia la vista de la ventana.

## Diseño
- Store `night: boolean`; `Lights.tsx` interpola intensidades/colores en `useFrame` con `maath/easing`.
- `WindowView` cruza dos texturas (día/noche) con opacidad.

## Tareas
- [x] Estado y toggle
- [x] Interpolación de luces
- [x] Vista nocturna y emisivos

## Notas de implementación
- Las tiras LED del estante miran hacia la cámara para que se vean de noche.
