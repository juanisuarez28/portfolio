# F15 — Luz y atmósfera
**Estado:** ✅ Hecho · Ideas 4 y 6

## Requisitos
- R1. Rayo de sol volumétrico que entra por la ventana y cae sobre el piso, con partículas de polvo flotando dentro del haz.
- R2. De noche el haz pasa a ser luz de luna, tenue y azulada.
- R3. Efecto miniatura (tilt-shift) en la vista general.
- R4. Desenfoque de fondo (profundidad de campo) cuando la cámara enfoca un objeto.
- R5. En calidad baja (F11) se desactivan tilt-shift y desenfoque.

## Diseño
- `scene/SunBeam.tsx`: volumen (caja extruida desde la ventana) con shader aditivo de gradiente + `Points` con ruido para el polvo.
- `Effects.tsx`: `TiltShift2` cuando `section === null`; `DepthOfField` con foco en el target del preset cuando hay sección.

## Criterios de aceptación
- CA1. El haz y el polvo se ven en la vista general de día; de noche cambia a luz de luna.

## Tareas
- [x] Haz de luz + polvo
- [x] Tilt-shift / DOF según el estado

## Notas de implementación
- La luz de la ventana es un `spotLight` con sombras desde afuera: el marco de la ventana proyecta su forma en el piso.
- El haz y el polvo se ocultan al asomarse a la ventana (la cámara queda adentro del haz).
- Bloom con umbral 1.15 para que solo brillen los emisivos (antes "quemaba" la alfombra).
