# F18 — Minijuego de jueguitos
**Estado:** ✅ Hecho · Idea 11

## Requisitos
- R1. Desde la pelota (botón "Jugar jueguitos" en el mensaje que aparece al patearla) se entra al minijuego.
- R2. La cámara se acerca a la alfombra. La pelota sube y baja; hay que tocar/hacer clic cuando entra en el anillo de golpeo (timing).
- R3. Cada toque bien sincronizado suma 1 y la pelota sube con un desvío aleatorio; si se pasa, termina.
- R4. Récord guardado en `localStorage`. 10 jueguitos desbloquean un secreto.
- R5. Funciona con mouse, touch y barra espaciadora.

## Diseño
- `scene/ball/keepy.ts` (lógica compartida) + `scene/ball/KeepyUppy.tsx` (escena) + `KeepyHud` en `ui/GameOverlays.tsx`.
- Estado `focus: 'keepy' | 'penalties' | 'window' | null` en el store; mientras hay juego, la cámara usa su preset y se ocultan los paneles.

## Tareas
- [x] Lógica de timing y dificultad creciente
- [x] HUD con contador / récord / reintentar / salir

## Notas de implementación
- Arranca en espera: la pelota flota hasta el primer toque (antes se caía sola mientras la cámara llegaba).
