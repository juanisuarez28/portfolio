# F11 — Carga, rendimiento y mobile
**Estado:** ✅ Hecho (CA1 pendiente, ver notas)

## Objetivo
Carga rápida y fluida en desktop y celulares de gama media.

## Requisitos
- R1. Pantalla de carga con progreso y botón "Entrar" que inicia la intro.
- R2. DPR adaptativo con `PerformanceMonitor` (baja calidad si caen los FPS): desactiva N8AO y reduce sombras.
- R3. En touch: órbita con un dedo, pinch-zoom limitado, sin hover.
- R4. Texturas 3D pequeñas (`-sm.webp`), texturas canvas memoizadas.
- R5. Respeta `prefers-reduced-motion` (transiciones más cortas).

## Criterios de aceptación
- CA1. Bundle JS inicial gzip < 450 KB. ❌ hoy ~537 KB
- CA2. Funciona en viewport 375×812.

## Diseño
- `ui/Loader.tsx` con `useProgress`. Store `quality: 'high' | 'low'`, `started`.

## Tareas
- [x] Loader + botón entrar
- [x] PerformanceMonitor y calidad
- [x] Ajustes touch y reduced motion

## Notas de implementación
- **Medido:** `vendor-3d` pesa 507 KB gzip y el resto de la app ~30 KB. No se cumple el objetivo de 450 KB; queda en el backlog revisar qué trae drei (Environment arrastra loaders de three-stdlib).
- La señal de "escena lista" la da un componente dentro del `Suspense` del canvas.
