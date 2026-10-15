# F14 — Nuevo layout y objetos auténticos
**Estado:** ✅ Hecho · Idea 5 + pedidos de Juani

## Objetivo
Que la habitación se sienta vivida y real, y ajustar la distribución pedida.

## Requisitos
- R1. Cama invertida: cabecera hacia el frente de la habitación y pies hacia la tele.
- R2. Impresora contra la pared del fondo (la que se ve a la derecha), entre el escritorio y el estante.
- R3. Certificados en el estante más alto; lo que estaba arriba (planta y caja) pasa al estante de abajo de todo.
- R4. Desorden auténtico: mate y termo con vapor, auriculares, mochila, botines, campera en la silla, libros apilados, cables,
  medias, cesto de ropa (que además es el "arco" de F17).
- R5. Al hacer clic en el mate se "ceba" (animación del vapor + mensaje). Cuenta como secreto (F21).

## Criterios de aceptación
- CA1. Ningún objeto se atraviesa con otro ni con las paredes.
- CA2. El plano `scene-layout.md` refleja la nueva distribución.

## Diseño
- La distribución vive en `blender/build_room.py` (constantes de layout) y se espeja en `src/scene/layout.ts` para cámara, colisiones y hotspots.

## Tareas
- [x] Nueva distribución (cama, impresora, escritorio más angosto, estante)
- [x] Objetos de desorden en Blender
- [x] Mate interactivo con vapor
- [x] Actualizar `scene-layout.md`

## Notas de implementación
- Extras: guirnalda de luces sobre la cama (se prende de noche), campera colgada de la silla, cables del monitor y la torre.
