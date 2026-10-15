# F04 — Mobiliario y objetos
**Estado:** ✅ Hecho

## Objetivo
Llenar la habitación con objetos que cuenten quién es Juani y sirvan de puertas a cada sección.

## Requisitos
- R1. Escritorio con monitor, teclado, mouse, taza, foto, lámpara y torre PC con RGB.
- R2. Silla gamer frente al escritorio.
- R3. Dos diplomas en la pared (TUDAI y Diplomatura en IA, UNICEN) con texto legible.
- R4. Estante con libros, trofeo, planta y los 3 certificados enmarcados (imagen real).
- R5. Mueble con impresora y papel.
- R6. Rincón gamer: mueble, TV, consola con joystick y puff.
- R7. Camiseta de fútbol enmarcada, pelota sobre la alfombra.
- R8. Corcho con post-its que muestran las skills (texto desde `src/content/skills.ts`).
- R9. Cama con almohadas y manta, plantas decorativas.
- R10. Cada objeto es un componente independiente en `scene/objects/`.

## Criterios de aceptación
- CA1. Todos los objetos del plano (`scene-layout.md`) existen y no se atraviesan entre sí.
- CA2. Los textos de diplomas y post-its se leen al enfocar.

## Diseño
- Geometría con `RoundedBox`, cilindros, `ExtrudeGeometry` (camiseta) y texturas canvas para textos.
- Materiales `meshStandardMaterial` con la paleta de `lib/palette.ts`.

## Tareas
- [x] Desk, Computer, Chair, DeskLamp, Phone
- [x] Diplomas, Bookshelf (con certificados)
- [x] Printer
- [x] GamingCorner (TV, consola, puff)
- [x] Jersey, Ball, Corkboard
- [x] Bed, Plant, Rug

## Notas de implementación
- Extra: reloj de pared con la hora real, póster de Tandil, puff, cortinas, globo terráqueo.
- La silla rueda a un costado cuando se enfoca la compu (si no, tapa la pantalla).
