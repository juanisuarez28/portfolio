# F24 — Mobile: hoja de contenido legible
**Estado:** ✅ Hecho · Pedido de Juani

## Problema
En mobile, al abrir una sección la hoja ocupaba el 58 % de la pantalla con tipografía de desktop: el contenido quedaba apretado
y casi no se veía la habitación.

## Requisitos
- R1. Hoja inferior con dos alturas: **compacta** (~42 %) que deja ver el objeto, y **expandida** (~88 %) para leer cómodo.
- R2. Se cambia arrastrando la manija, tocando la manija o al scrollear el contenido hacia arriba.
- R3. Tipografía, márgenes y tarjetas adaptadas a mobile (texto 15 px, imágenes más bajas, chips compactos).
- R4. La cámara encuadra el objeto en el espacio libre según la altura actual de la hoja.
- R5. El encabezado de la hoja muestra título + botón cerrar; el HUD superior se achica para no competir.

## Diseño
- `Panel.tsx` con `sheetSnap: 'peek' | 'full'` en el store y gestos de puntero; `CameraRig` encuadra el objeto en la franja libre de la hoja compacta.

## Tareas
- [x] Gestos y alturas
- [x] Estilos mobile
- [x] Encuadre de cámara según la altura

## Notas de implementación
- Hoja compacta 44 dvh / expandida 90 dvh, manija + botón "Ver todo ↑". Tipografía mobile 0.88 rem.
