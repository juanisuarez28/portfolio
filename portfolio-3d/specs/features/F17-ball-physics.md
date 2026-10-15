# F17 — Pelota con física y cesto
**Estado:** ✅ Hecho · Ideas 10 y 12

## Requisitos
- R1. La pelota tiene física real: al patearla rebota contra piso, paredes y muebles.
- R2. La dirección del pateo depende de dónde se hace clic en la pelota (clic a la izquierda la manda a la derecha) → se puede apuntar.
- R3. Hay objetos livianos que se pueden voltear (pila de latas/botellas y libros en el piso).
- R4. Cesto de la ropa como arco: si la pelota entra → festejo (confeti + mensaje "¡GOOOL!" + sonido) y secreto (F21).
- R5. Botón "Acomodar" para devolver pelota y objetos a su lugar.
- R6. El motor de física se carga en diferido (recién al primer pateo) para no sumar peso a la carga inicial.

## Diseño
- `@react-three/rapier`, cargado con `lazy()`. Antes del primer pateo la pelota es estática.
- Colisionadores cuboides aproximados por mueble (desde `layout.ts`); sensor dentro del cesto.

## Criterios de aceptación
- CA1. La pelota nunca sale de la habitación (paredes invisibles en el lado abierto).
- CA2. Embocar en el cesto dispara el festejo una sola vez por entrada.

## Tareas
- [x] Física diferida con colisionadores de la habitación
- [x] Pateo con dirección
- [x] Objetos volteables + "Acomodar"
- [x] Cesto con sensor y festejo

## Notas de implementación
- Rapier se baja en un chunk aparte recién al primer pateo.
