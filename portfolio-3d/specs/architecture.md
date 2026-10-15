# Arquitectura

## Stack
- **Vite + React 19 + TypeScript**: build estático, compatible con Vercel sin configuración extra.
- **three.js + @react-three/fiber**: render 3D declarativo con componentes React.
- **@react-three/drei**: `CameraControls`, `Html`, `RoundedBox`, `ContactShadows`, `Environment`/`Lightformer`, `useTexture`, `useProgress`.
- **@react-three/postprocessing**: N8AO (oclusión ambiental), Bloom, Vignette, SMAA, tone mapping ACES.
- **zustand**: estado global chico (sección activa, hover, modo noche, flags de UI).
- **sharp** (dev): script que optimiza las imágenes del portfolio clásico a WebP.

## Estructura

```
portfolio-3d/
├─ specs/                 # SDD: visión, arquitectura, layout, features
├─ scripts/               # optimize-images.mjs
├─ public/
│  ├─ images/             # WebP generados (normal + -sm para texturas 3D)
│  └─ docs/               # CV y PDFs
└─ src/
   ├─ content/            # Datos del portfolio (perfil, proyectos, formación, skills)
   ├─ store/              # useAppStore (zustand)
   ├─ lib/                # utilidades: texturas en canvas, paleta, hooks
   ├─ scene/              # Experience, Room, Lights, Effects, CameraRig
   │  └─ objects/         # Un componente por objeto de la habitación
   └─ ui/                 # HUD, paneles, loader, componentes DOM
```

## Flujo de datos

```
click en objeto 3D ─┐
menú del HUD ───────┼─► useAppStore.setSection(id) ─┬─► CameraRig vuela al preset de la sección
tecla Esc / volver ─┘                                ├─► Panel muestra el contenido (o el monitor en desktop)
                                                     └─► objetos reaccionan (ej. impresora imprime)
```

- `src/content` es la única fuente de contenido; la UI 2D y los objetos 3D (pantallas, post-its, diplomas) la leen.
- Los presets de cámara viven en `src/scene/cameraPresets.ts`, junto a la posición de cada objeto (`scene-layout.md`).

## Decisiones (ADRs)

### ADR-001 — React Three Fiber en lugar de Three.js sobre Angular
El portfolio clásico es Angular 17. El ecosistema de R3F/drei resuelve de fábrica lo que necesitamos
(HTML dentro del monitor, transiciones de cámara, postprocesado, carga de texturas) y Juani ya conoce React.
Se crea un proyecto nuevo y el clásico queda intacto.

### ADR-002 — Geometría procedural en v1, Blender como mejora
Blender no está instalado en la máquina de desarrollo. La v1 modela todo con geometría paramétrica
(cajas redondeadas, cilindros, extrusiones) y texturas generadas en canvas (piso, diplomas, post-its,
vista de Tandil). Ventajas: cero archivos pesados, todo editable desde código, carga instantánea.
La calidad visual se obtiene con iluminación (sombras suaves, environment con lightformers, N8AO, bloom).
Cada objeto es un componente aislado, así que se puede reemplazar por un `.glb` de Blender sin tocar el resto.

### ADR-003 — Contenido en HTML real, no texto 3D
Los paneles son DOM (accesibles, seleccionables, indexables). Dentro del monitor se usa `drei/Html` con
`transform` solo cuando la cámara está enfocada en el escritorio y en pantallas anchas; en mobile se usa el panel.

### ADR-004 — Sin dependencias de red en runtime para la escena
Nada de HDRIs ni fuentes 3D desde CDNs: el environment se arma con `Lightformer`s y los textos 3D se dibujan
en canvas. Así la escena no se rompe si un CDN falla. La única dependencia externa es la fuente Outfit (Google Fonts), con fallback.

### ADR-005 — Resaltado por tinte emisivo en lugar de Outline
El efecto `Outline` de @react-three/postprocessing no se renderizaba con nuestra combinación de efectos.
`Interactive` ahora tiñe de cyan (emisivo) los materiales "apagados" del objeto al hacer hover. Es más barato (sin pasada extra)
y respeta los materiales que ya tienen emisivo propio (pantallas, LEDs).

### ADR-006 — Mismo repo, subcarpeta y proyecto de Vercel separado
Para no perder el portfolio Angular, el 3D vive en `portfolio-3d/` dentro del mismo repo (rama `portfolio-3d` mientras se prueba).
Se despliega con un proyecto de Vercel propio (Root Directory = `portfolio-3d`); el proyecto existente sigue publicando el Angular desde la raíz.
Cuando el 3D reemplace al clásico, basta con apuntar el dominio al proyecto nuevo.
