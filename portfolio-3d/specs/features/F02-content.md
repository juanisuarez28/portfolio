# F02 — Capa de contenido
**Estado:** ✅ Hecho

## Objetivo
Todo el contenido del portfolio clásico disponible como datos tipados, para que la UI y la escena lo consuman.

## Requisitos
- R1. Perfil: nombre, rol, ubicación, edad, bio, pasiones, email, redes, CV.
- R2. Proyectos freelance (9) y universitarios (3) con descripción, imagen, tags y links, idénticos al portfolio clásico.
- R3. Formación: TUDAI y Diplomatura en IA (UNICEN) + 3 certificados con imagen/enlace.
- R4. Skills técnicas agrupadas por categoría y soft skills.
- R5. Imágenes optimizadas a WebP (versión normal y `-sm` para texturas 3D) con un script reproducible.
- R6. Secciones navegables con id, título, objeto asociado e ícono para el menú.

## Criterios de aceptación
- CA1. Cada proyecto/certificado del portfolio clásico existe en `src/content` con sus links.
- CA2. `npm run images` regenera `public/images` desde `../src/assets/imgs` (el Angular, raíz del repo).
- CA3. Peso total de `public/images` < 1.5 MB.

## Diseño
- `src/content/types.ts`: `Project`, `Certificate`, `Degree`, `SkillGroup`, `SectionId`.
- `src/content/profile.ts`, `projects.ts`, `education.ts`, `skills.ts`, `sections.ts`.
- `scripts/optimize-images.mjs` con sharp.

## Tareas
- [x] Definir tipos
- [x] Migrar perfil, proyectos, formación y skills
- [x] Script de imágenes + ejecutarlo
- [x] Copiar CV y consigna de MonopatinesApp a `public/docs`

## Notas de implementación
- 9 proyectos freelance + 3 universitarios, 2 carreras y 3 certificados migrados 1:1.
- `public/images` pesa ~760 KB (32 WebP).
- `profile.classicUrl` quedó vacío: falta la URL pública del portfolio clásico.
