# Plano de la habitación

Unidades en metros. Origen en el centro del piso. `+x` derecha, `+y` arriba, `+z` hacia la cámara.

```
            PARED DEL FONDO (z = -3)
   ┌──────────────────────────────────────────┐
   │ planta  [ VENTANA ]   [diploma][diploma]  │
   │                        [  ESCRITORIO  ][ESTANTE]
   │ ┌──┐                     monitor  lámpara │ certificados
 P │ │TV│ consola              silla     [IMPRESORA]
 A │ └──┘  puff                                │
 R │ camiseta          ┌───────────┐           │
 E │ ┌────────┐        │   ALFOMBRA │  pelota  │
 D │ │  CAMA  │ corcho └───────────┘           │
   │ └────────┘                                │
   └──────────────────────────────────────────┘
 (x=-3)                (abierto hacia la cámara)
```

## Estructura
| Elemento | Posición / medidas |
|---|---|
| Piso (losa) | 6 × 6, tapa en `y = 0`, espesor 0.25 |
| Pared fondo | `z = -3`, alto 3.4, con hueco de ventana |
| Pared izquierda | `x = -3`, alto 3.4 |
| Ventana | pared fondo, centro `(-1.55, 1.8)`, 1.4 × 1.3 |
| Vista exterior | plano en `z = -7` con las sierras de Tandil (textura canvas día/noche) |

## Objetos
| Objeto | Componente | Posición aprox. | Sección |
|---|---|---|---|
| Escritorio + monitor + teclado | `Desk`, `Computer` | `(0.8, 0, -2.5)` | `projects` |
| Torre PC (RGB) | `Computer` | bajo el escritorio, derecha | `projects` |
| Celular | `Phone` | sobre escritorio `(1.5, 0.77, -2.25)` | `contact` |
| Lámpara de escritorio | `DeskLamp` | `(1.6, 0.77, -2.8)` | día/noche |
| Diplomas (TUDAI, DUIA) | `Diplomas` | pared fondo, `y = 2.4`, `x = 0.35 / 1.25` | `education` |
| Estante con certificados | `Bookshelf` | `(2.45, 0, -2.8)` | `education` |
| Impresora sobre mueble | `Printer` | `(2.45, 0, -1.6)` | `cv` |
| TV + consola + puff | `GamingCorner` | pared izq., `z ≈ -1.2` | easter egg |
| Camiseta enmarcada | `Jersey` | pared izq., `(−2.95, 1.95, 0.4)` | `about` |
| Corcho con post-its | `Corkboard` | pared izq., `(−2.95, 1.75, 1.9)` | `skills` |
| Cama | `Bed` | pared izq., `z 0.6 … 2.6` | — |
| Pelota | `Ball` | sobre la alfombra | easter egg |
| Silla, alfombra, plantas | `Chair`, `Rug`, `Plant` | — | — |

Los presets de cámara de cada sección están en `src/scene/cameraPresets.ts`.
