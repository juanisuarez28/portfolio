# F21 — Secretos coleccionables
**Estado:** ✅ Hecho · Idea 17

## Requisitos
- R1. 8 secretos, guardados en `localStorage`:
  1. Hacer 10 jueguitos (F18).
  2. Embocar la pelota en el cesto (F17).
  3. Ganar la tanda de penales (F20).
  4. Encontrar la figurita del Mundial escondida en la habitación.
  5. Ver los 4 canales de la tele (F19).
  6. Cebar el mate (F14).
  7. Mirar por la ventana de noche (F16 + F09).
  8. Código Konami (↑↑↓↓←→←→BA).
- R2. Al desbloquear: notificación con ícono y nombre del secreto.
- R3. Botón de trofeo en el HUD con contador (x/8) y lista; los bloqueados muestran una pista, no el nombre.
- R4. Con los 8: mensaje final y confeti.

## Diseño
- `content/secrets.ts` (lista), store `secrets: SecretId[]` + `unlock(id)` (persistido en `localStorage`), `ui/SecretsPanel.tsx`.

## Tareas
- [x] Modelo de datos y persistencia
- [x] Notificación y panel
- [x] Figurita escondida + Konami
- [x] Conectar los disparadores de cada feature
