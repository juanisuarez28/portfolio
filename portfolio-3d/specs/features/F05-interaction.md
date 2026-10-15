# F05 — Interacción con objetos
**Estado:** ✅ Hecho

## Objetivo
Que sea obvio qué se puede tocar y qué pasa al tocarlo.

## Requisitos
- R1. Los objetos interactivos se resaltan (tinte cyan) al pasar el mouse y el cursor cambia a "pointer".
- R2. Al hacer hover aparece una etiqueta con el nombre de la sección (ej. "Proyectos").
- R3. En la vista general hay marcadores pulsantes sobre cada objeto interactivo (útil en touch, donde no hay hover).
- R4. Click/tap en un objeto → `setSection(id)`. Click en objetos de acción (lámpara, consola, pelota) ejecuta su acción.
- R5. Un click que fue en realidad un arrastre de cámara no dispara la acción.

## Criterios de aceptación
- CA1. Hover sobre el monitor lo contornea y muestra "Proyectos".
- CA2. En mobile se ven los marcadores y al tocarlos se navega.

## Diseño
- `scene/Interactive.tsx`: wrapper que maneja pointer events, el resaltado emisivo y el marcador `Html` pulsante con etiqueta.
- Store: `hovered: string | null`.

## Tareas
- [x] Wrapper `Interactive` con resaltado y cursor
- [x] Etiquetas y marcadores
- [x] Filtrar clicks que fueron drags

## Notas de implementación
- **Cambio respecto al diseño:** el contorno con `Outline` de postprocessing no se veía; se reemplazó por un tinte emisivo cyan sobre los materiales del objeto (ver ADR-005). Más barato y confiable.
- En pantallas táctiles angostas se muestran solo los puntos (las etiquetas se superponían); en touch ≥ 900 px se muestran siempre.
