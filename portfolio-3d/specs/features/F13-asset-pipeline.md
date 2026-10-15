# F13 — Pipeline de assets: Blender + texturas PBR + AO horneado
**Estado:** ✅ Hecho · Ideas 1, 2 y 3 de la v2

## Objetivo
Que la habitación deje de verse "plana": geometría con más detalle, texturas reales y sombreado de contacto horneado,
sin perder el ciclo día/noche dinámico.

## Requisitos
- R1. Un script reproducible `blender/build_room.py` (bpy) construye la habitación y la exporta a `blender/out/room_raw.glb`;
  `npm run model:optimize` la comprime a `public/models/room.glb`. Uso: `blender -b --factory-startup -P blender/build_room.py -- --bake --export`.
- R2. Cada objeto interactivo es un nodo con nombre estable (`Desk`, `Bookshelf`, `Printer`, `Chair`, …) para poder envolverlo desde R3F.
- R3. Oclusión ambiental horneada en Cycles a un atlas compartido (segundo set de UVs) y usada como `aoMap` en three.js.
  Solo AO (no luz): así el día/noche sigue siendo en tiempo real.
- R4. Texturas PBR CC0 de Poly Haven (color, normal, rugosidad) para piso, paredes, maderas, telas, metal, alfombra y exterior,
  convertidas a WebP 1K en `public/textures/`.
- R5. Materiales físicos: laca con clearcoat en el escritorio, tela con sheen en cama/puff, vidrio con reflejo, pantallas brillantes.
- R6. Un script `scripts/fetch-textures.mjs` documenta y repite la descarga de texturas.

## Criterios de aceptación
- CA1. `npm run build` incluye el GLB y las texturas; peso total de modelos + texturas < 6 MB.
- CA2. Se ven sombras de contacto en esquinas, bajo la cama y entre libros aunque la luz se mueva.
- CA3. Día/noche sigue funcionando igual que en v1.

## Diseño
- Blender construye geometría con bevels, subdivisión y ruido (almohadas, manta con arrugas, cortinas con pliegues).
- Los materiales del GLB solo llevan **nombre**; en R3F `RoomMaterials` (`scene/room/materials.ts`) los reemplaza por `MeshStandardMaterial`/`MeshPhysicalMaterial`
  con las texturas PBR (UV0, tileadas por escala de mundo) y el AO horneado (UV1).
- Texturas que dependen del contenido (diplomas, corcho, pantallas, camiseta) siguen generándose en canvas (ADR-004).

## Tareas
- [x] Instalar Blender portable (fuera del repo)
- [x] Descargar texturas PBR y convertirlas a WebP
- [x] Script de construcción de la habitación + render de prueba
- [x] Horneado de AO al atlas y export GLB
- [x] Carga del GLB y reemplazo de materiales en R3F

## Notas de implementación
- Blender 4.5 LTS portable en `C:\Users\juani\tools` (fuera del repo). Corrida completa (build + horneado + export): ~11 min en la GT 1030.
- `lightmap_pack` (Python) era demasiado lento con 277 objetos: se usa `smart_project` + `pack_islands` (C).
- GLB 6,4 MB → 2,3 MB con meshopt; AO 2 MB PNG → 370 KB WebP. Texturas PBR: ~1 MB (normales/rugosidad a 512/256 px).
- El piso tenía las normales hacia abajo (AO negro): se agregó `flip` a `grid()`.
- Bug encontrado: el regex que limpiaba sufijos `.001` cortaba colores terminados en 3 dígitos (`C_2c3038` → verde).
