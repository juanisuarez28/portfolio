# F20 — Penales jugables en la tele
**Estado:** ✅ Hecho · Idea 14

## Requisitos
- R1. Desde el canal 4 se entra al juego: la cámara se sienta en el puff mirando la tele (en mobile la tele ocupa el ancho).
- R2. Tanda de 5 penales contra la CPU: apuntás moviendo el mouse/dedo sobre el arco y pateás con clic/tap; potencia con barra oscilante.
- R3. El arquero elige un lado (con algo de "lectura" del apunte); tiros afuera o al palo posibles.
- R4. Gráfica en pseudo-3D (perspectiva del arco, red, arquero animado, pelota con escala), marcador y resultado final.
- R5. Ganar la tanda desbloquea un secreto. Esc o "Salir" vuelve a la habitación.

## Diseño
- `scene/tv/penalties.ts`: lógica + dibujo en el mismo canvas de la tele. Un overlay DOM transparente toma el puntero y lo mapea al arco.

## Tareas
- [x] Modo juego + cámara del puff
- [x] Apuntado, potencia, arquero, resultado
- [x] Marcador de la tanda y pantalla final

## Notas de implementación
- En mobile la tele 3D queda chica: el mismo canvas se muestra en grande como overlay 2D y el apunte se mapea sobre él.
