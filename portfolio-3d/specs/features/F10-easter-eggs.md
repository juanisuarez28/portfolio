# F10 — Easter eggs
**Estado:** ✅ Hecho

## Objetivo
Detalles que muestran personalidad (fútbol y videojuegos).

## Requisitos
- R1. Pelota: al clickearla salta girando ("jueguitos") y suma un contador que se muestra en un toast.
- R2. Consola: al clickearla prende/apaga la TV, que muestra un partidito pixelado animado.
- R3. Impresora: al abrir la sección CV, imprime una hoja animada.
- R4. Torre PC con ventiladores/RGB animados.

## Criterios de aceptación
- CA1. 10 jueguitos seguidos muestran un mensaje especial.

## Diseño
- `Ball.tsx` con animación por `useFrame` (parábola + rotación) y store `juggles`.
- TV con `CanvasTexture` actualizada por frame cuando está encendida.

## Tareas
- [x] Pelota con jueguitos + toast
- [x] TV con juego animado
- [x] Hoja de impresora
- [x] RGB animado en la torre

## Notas de implementación
- Si la pelota cae y pasan 1.2 s sin tocarla, el contador vuelve a 0.
