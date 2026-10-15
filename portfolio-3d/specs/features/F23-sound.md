# F23 — Sonido ambiente y efectos
**Estado:** ✅ Hecho · Idea 20

## Requisitos
- R1. Arranca en silencio; botón de sonido en el HUD (preferencia guardada).
- R2. Ambiente: pajaritos de día, grillos de noche, con fundido al cambiar.
- R3. Efectos: clic de objetos, pateo, rebote, red/gol + hinchada, estática de la tele, vibración del celular, cebar mate, secreto desbloqueado.
- R4. Radio (canal 3 de la tele): loop lo-fi.
- R5. Sin archivos de audio: todo sintetizado con Web Audio (cero peso y sin licencias).

## Diseño
- `lib/audio.ts`: `AudioEngine` singleton (contexto creado en el primer gesto), sintetizadores por efecto y loops de ambiente.

## Tareas
- [x] Motor + botón de mute
- [x] Ambiente día/noche
- [x] Efectos y radio

## Notas de implementación
- No verificable por captura: probado que el motor no rompe sin gesto previo (arranca en silencio).
