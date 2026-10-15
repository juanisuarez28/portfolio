# F07 — Interfaz y paneles de contenido
**Estado:** ✅ Hecho

## Objetivo
UI 2D limpia sobre la escena con todo el contenido del portfolio.

## Requisitos
- R1. HUD: nombre y rol arriba a la izquierda; menú de secciones; links a GitHub/LinkedIn; toggle día/noche.
- R2. Pista inicial "Hacé clic en los objetos para explorar" que desaparece al primer click.
- R3. Panel lateral (desktop) / hoja inferior (mobile) con animación de entrada, scroll propio y botón cerrar.
- R4. Paneles: Sobre mí, Proyectos, Formación, Skills, Contacto, CV.
- R5. Estética coherente con el portfolio clásico: fuente Outfit, fondo oscuro translúcido con blur, acento `#00d2ff`.
- R6. Las imágenes de los paneles se cargan en lazy.

## Criterios de aceptación
- CA1. Desde el menú se llega a cualquier sección en 1 click.
- CA2. En 375 px de ancho no hay scroll horizontal y todo es legible.

## Diseño
- `ui/Hud.tsx`, `ui/Panel.tsx`, `ui/sections.tsx`, `ui/icons.tsx`, `ui/Loader.tsx`, `ui/Toast.tsx`; estilos en `src/index.css`.
- `ui/ProjectsBrowser.tsx` reutilizable (panel y monitor).

## Tareas
- [x] HUD + menú
- [x] Contenedor de panel responsive
- [x] Secciones de contenido
- [x] Estilos

## Notas de implementación
- En desktop el panel arranca debajo del HUD (`top: 76px`) para no tapar los íconos.
