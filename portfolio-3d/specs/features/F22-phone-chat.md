# F22 — Celular que suena y contacto tipo chat
**Estado:** ✅ Hecho · Idea 19 (reemplaza el panel de Contacto de F07)

## Requisitos
- R1. A los ~25 s en la vista general (y luego cada tanto) el celular vibra: se sacude, la pantalla muestra "Llamada entrante · Juani" y suena (si hay sonido).
- R2. El contacto se presenta como un chat: mensajes de Juani que van apareciendo ("escribiendo…") y respuestas rápidas:
  enviar mail, copiar mail, LinkedIn, GitHub, descargar CV.
- R3. En desktop el chat se ve dentro de la pantalla del celular 3D (como el monitor, F08); en mobile, en la hoja de contenido.

## Diseño
- `ui/ContactChat.tsx` con `variant: 'phone' | 'panel'`. `PhoneHtml` (en `scene/room/RoomModel.tsx`) monta `Html transform` en el nodo `Phone_Body`.
- La llamada entrante la dispara `ui/Behaviors.tsx` (store `phoneRinging`).

## Tareas
- [x] Animación de llamada entrante
- [x] Chat con mensajes escalonados y respuestas rápidas
- [x] Montaje en el celular 3D

## Notas de implementación
- Cámara de frente a la pantalla (que está girada e inclinada). En desktop se oculta el menú inferior para no tapar las respuestas.
- Bug de StrictMode: el `i++` dentro del updater de estado salteaba un mensaje.
