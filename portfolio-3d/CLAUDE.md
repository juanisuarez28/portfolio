# Portfolio 3D — guía para agentes

Portfolio de Juan Ignacio Suarez como habitación 3D navegable (Vite + React + R3F). El portfolio clásico
en Angular vive en la raíz de este mismo repo (`../`) y no se modifica: este proyecto está en la subcarpeta `portfolio-3d/`.

## Trabajamos con SDD (Spec-Driven Development)
- Antes de implementar algo nuevo, crear o actualizar su spec en `specs/features/FXX-*.md` (requisitos, criterios, diseño, tareas).
- Al terminar tareas, marcarlas `- [x]` y actualizar el estado en la spec y en el roadmap de `specs/README.md`.
- Cambios de layout de la habitación → actualizar `specs/scene-layout.md`. Decisiones técnicas → nuevo ADR en `specs/architecture.md`.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — typecheck + build de producción (lo que corre Vercel)
- `npm run images` — regenera `public/images` desde `../src/assets/imgs` (el Angular, raíz del repo)

## Convenciones
- Contenido solo en `src/content/*` (nada de textos hardcodeados en la escena).
- Un componente por objeto en `src/scene/objects/`. Colores desde `src/lib/palette.ts`.
- Textos/texturas 3D se generan en canvas (`src/lib/canvasTextures.ts`); sin assets de red en runtime.
- UI en español rioplatense (voseo).
