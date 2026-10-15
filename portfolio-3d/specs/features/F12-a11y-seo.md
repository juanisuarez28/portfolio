# F12 — Accesibilidad y SEO
**Estado:** ✅ Hecho

## Objetivo
Que el contenido sea accesible e indexable aunque la experiencia sea 3D.

## Requisitos
- R1. `index.html` en español con title, description, Open Graph (sin imagen todavía) y favicon propio.
- R2. `<noscript>` con resumen y links (email, LinkedIn, GitHub, CV).
- R3. Menú y paneles navegables con teclado; foco visible; Esc cierra.
- R4. Botones con `aria-label`; panel con `role="dialog"` y título.
- R5. Fallback si WebGL no está disponible: se muestran los paneles sin escena.

## Criterios de aceptación
- CA1. Con Tab se recorre el menú y se abre una sección con Enter.

## Diseño
- `lib/webgl.ts` detecta soporte. `App.tsx` decide escena o fallback.

## Tareas
- [x] Meta tags y noscript
- [x] Teclado y ARIA
- [x] Fallback sin WebGL

## Notas de implementación
- Se agregó un `ErrorBoundary`: si la escena falla se muestra la versión 2D con todas las secciones.
- Falta la imagen Open Graph (`og:image`): se quitó la meta hasta tener una captura.
