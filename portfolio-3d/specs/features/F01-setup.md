# F01 — Setup del proyecto y deploy
**Estado:** ✅ Hecho

## Objetivo
Proyecto nuevo, separado del portfolio clásico, que compile y se publique en Vercel sin configuración manual.

## Requisitos
- R1. Proyecto Vite + React + TypeScript en la subcarpeta `portfolio-3d/` del repo del portfolio (rama `portfolio-3d`), sin tocar el Angular de la raíz.
- R2. Dependencias 3D: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand.
- R3. `npm run build` genera `dist/` sin errores de TypeScript.
- R4. `vercel.json` con framework Vite, output `dist` y cache largo para assets con hash.
- R5. three.js y el ecosistema 3D en un chunk separado para aprovechar cache entre deploys.

## Criterios de aceptación
- CA1. `npm run build` termina sin errores.
- CA2. `npm run preview` sirve la app y la escena se ve.

## Diseño
- `vite.config.ts` con `manualChunks`: todo lo 3D en `vendor-3d`.
- `vercel.json` con `Cache-Control: public, max-age=31536000, immutable` para `/assets/*`.

## Tareas
- [x] Scaffold con `npm create vite` (react-ts) y git init
- [x] Instalar dependencias
- [x] Limpiar template
- [x] Configurar chunks y `vercel.json`
- [x] Verificar build

## Notas de implementación
- three.js, R3F, drei y postprocessing van en un único chunk `vendor-3d` (ver F11 por el peso).
- `.claude/launch.json` (local, sin commitear) tiene configs `portfolio-3d` (dev, puerto 5174) y `portfolio-3d-preview` (build, 4174) para probar desde Claude.
