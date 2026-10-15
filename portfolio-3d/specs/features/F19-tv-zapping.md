# F19 — Tele con zapping
**Estado:** ✅ Hecho · Idea 13 (reemplaza el "partidito" de F10)

## Requisitos
- R1. Control remoto sobre el mueble. Clic en tele/remoto: la prende; clics siguientes cambian de canal; botón para apagar.
- R2. Canales (cada uno guiña a un proyecto real):
  1. **Clasificados** al estilo VidrieraTV: fichas que pasan con precio y zócalo.
  2. **La Repe**: jugada animada con "REPETICIÓN" en cámara lenta, al estilo PasameLaRepe.
  3. **Radio**: ecualizador "EN VIVO" al estilo La R; suena música si el sonido está activo (F23).
  4. **Juego**: "Apretá para jugar" → penales (F20).
- R3. Al cambiar de canal: ruido de estática de 0,3 s y número de canal en pantalla.
- R4. La luz de la tele tiñe la habitación con el color del canal.
- R5. Ver los 4 canales desbloquea un secreto.

## Diseño
- `scene/tv/channels.ts`: cada canal es `draw(ctx, t)` sobre un canvas 640×360 que se sube como textura solo con la tele prendida.

## Tareas
- [x] Remoto + estados de la tele
- [x] 4 canales animados + estática
- [x] Luz de color según canal

## Notas de implementación
- Se apaga con el quinto clic (apagada → 1 → 2 → 3 → 4 → apagada). En el canal 4, clic en la tele = jugar.
