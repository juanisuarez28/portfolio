# Portfolio 3D — Juan Ignacio Suarez

Mi portfolio como una habitación en 3D que se recorre en el navegador. Cada objeto lleva a una sección:
la compu a los proyectos (que se navegan dentro del monitor), los diplomas y el estante a la formación, el corcho a las skills,
la camiseta a "sobre mí", el celular al contacto (un chat) y la impresora al CV.

Además: la ventana muestra Tandil en 3D (sierras, la Piedra Movediza y el barrio), la tele hace zapping por canales
que guiñan a proyectos reales y tiene penales jugables, la pelota tiene física y minijuego de jueguitos, hay modo
día/noche, sonido sintetizado y 8 secretos para encontrar.

Hecho con **Vite + React + TypeScript + three.js (React Three Fiber)** y una habitación modelada en **Blender**.
Todo el contenido vive en `src/content`.

## Desarrollo

```bash
npm install
npm run dev              # http://localhost:5173
npm run build            # typecheck + build de producción
npm run images           # regenera public/images desde ../src/assets/imgs (portfolio Angular)
npm run textures         # vuelve a bajar las texturas PBR (Poly Haven, CC0) a public/textures
```

### Modelo de la habitación (Blender)

La habitación se genera por script con Blender 4.5 LTS (no hace falta abrir la interfaz):

```bash
blender -b --factory-startup -P blender/build_room.py -- --bake --export   # ~11 min: geometría + AO horneado
npm run model:optimize                                                      # comprime a public/models/
```

Opcional: `-- --preview render.png` hace un render de prueba con Cycles. Ver `specs/features/F13-asset-pipeline.md`.

## Deploy

Este proyecto vive en la subcarpeta `portfolio-3d/` del repo del portfolio (el Angular sigue en la raíz).
En Vercel se usa un **proyecto aparte** importando el mismo repo con **Root Directory = `portfolio-3d`**;
Vercel detecta Vite solo (salida `dist/`, ver `vercel.json`). El proyecto de Vercel del Angular no cambia.

## Documentación (SDD)

El proyecto se trabaja con Spec-Driven Development: ver [`specs/README.md`](specs/README.md) para el roadmap,
la arquitectura, el plano de la habitación y la spec de cada feature.
