# Plano de la habitación (v2)

Unidades en metros. Origen en el centro del piso. `+x` derecha, `+y` arriba, `+z` hacia la cámara.
La fuente de verdad de la geometría es `blender/build_room.py`; las posiciones que usa la web (cámara, física,
marcadores) están espejadas en `src/scene/layout.ts`.

```
              PARED DEL FONDO (z = -3) — se ve a la derecha en la vista general
   ┌──────────────────────────────────────────────────────────────┐
   │ planta  [ VENTANA ]  [dipl][dipl]                  reloj      │
   │ póster  cortinas     [ ESCRITORIO ][IMPRESORA][ ESTANTE ]     │
   │ ┌──┐                  monitor·mate·cel   mueble   certific.  │
 P │ │TV│ consola  puff         silla                    cesto    │
 A │ └──┘                                                          │
 R │ camiseta        ┌──────────────┐                              │
 E │ ┌─────────┐pies │   ALFOMBRA   │ pelota   latas/libros        │
 D │ │  CAMA   │     └──────────────┘                              │
   │ └─cabecera┘ corcho + guirnalda                                │
   └──────────────────────────────────────────────────────────────┘
 (x=-3)                     (abierto hacia la cámara)
```

## Cambios v2 (F14)
- **Cama invertida:** cabecera hacia el frente (z ≈ 2.75), pies hacia la tele.
- **Impresora contra la pared del fondo**, en su mueble entre el escritorio (más angosto: 1.6 m) y el estante.
- **Estante:** certificados en el estante más alto (y = 1.44); planta y caja abajo de todo; libros en el segundo.

## Estructura
| Elemento | Posición / medidas |
|---|---|
| Piso (losa) | 6 × 6, tapa en `y = 0` |
| Pared fondo | `z = -3`, alto 3.4, hueco de ventana |
| Pared izquierda | `x = -3`, alto 3.4 |
| Ventana | centro `(-1.55, 1.8)`, 1.4 × 1.3 — máscara de stencil para el exterior (F16) |
| Exterior | suelo en `y = -7.5` (segundo piso), barrio z -14…-50, sierras z -95…-300, Piedra Movediza en `(-30, -115)` |

## Objetos
| Objeto (nodo del GLB) | Posición aprox. | Acción |
|---|---|---|
| `Monitor`, `Tower`, `Keyboard` | escritorio `(0.35, 0.76, -2.62)` | Proyectos (HTML en la pantalla) |
| `Phone` | `(0.9, 0.76, -2.42)` | Contacto (chat en el celular) |
| `Lamp` | `(1.01, 0.76, -2.84)` | Día / noche |
| `Mate`, `Termo` | `(-0.27, 0.76, -2.44)` | Cebar (secreto) |
| `Diploma_tudai`, `Diploma_duia` | pared fondo, `y = 2.3` | Formación |
| `Bookshelf` | `(2.47, 0, -2.8)` | Formación |
| `PrinterCabinet`, `Printer` | `(1.59, 0, -2.77)` | CV (imprime una hoja) |
| `TV` | pared izq. `(-2.96, 1.32, -1.3)` | Zapping / penales |
| `Remote`, `Console`, `Gamepad` | mueble de la tele | Zapping |
| `Jersey` | pared izq. `(-2.965, 1.8, -0.05)` | Sobre mí |
| `Corkboard` | pared izq. `(-2.975, 1.68, 1.75)` | Skills |
| `GLASS_Window` + marco + cortinas | ventana | Asomarse (vista 3D) |
| `Figurita` | piso junto a la cama `(-1.58, 0, 2.42)` | Secreto |
| `Basket` | `(2.4, 0, -1.55)` | Arco para la pelota (F17) |
| Pelota (código) | sobre la alfombra `(0.75, 0.11, 0.75)` | Física / jueguitos |
| Latas y libros (código) | `(2.05, 0, 0.95)` | Se voltean con la pelota |
| Decoración | cama, puff, plantas, póster, reloj, guirnalda, mochila, botines, medias, auriculares, cables | — |
