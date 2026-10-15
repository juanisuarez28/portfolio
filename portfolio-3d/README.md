# Portfolio 3D — Juan Ignacio Suarez

Mi portfolio como una habitación en 3D que se recorre en el navegador. Cada objeto lleva a una sección:
la compu a los proyectos, los diplomas a la formación, el corcho a las skills, la camiseta a "sobre mí",
el celular al contacto y la impresora al CV. La lámpara cambia entre día y noche, y hay un par de easter eggs.

Hecho con **Vite + React + TypeScript + three.js (React Three Fiber)**. Todo el contenido vive en `src/content`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de producción
npm run images   # regenera public/images desde ../src/assets/imgs (portfolio Angular)
```

## Deploy

Este proyecto vive en la subcarpeta `portfolio-3d/` del repo del portfolio (el Angular sigue en la raíz).
En Vercel se usa un **proyecto aparte** importando el mismo repo con **Root Directory = `portfolio-3d`**;
Vercel detecta Vite solo (salida `dist/`, ver `vercel.json`). El proyecto de Vercel del Angular no cambia.

## Documentación (SDD)

El proyecto se trabaja con Spec-Driven Development: ver [`specs/README.md`](specs/README.md) para el roadmap,
la arquitectura, el plano de la habitación y la spec de cada feature.
