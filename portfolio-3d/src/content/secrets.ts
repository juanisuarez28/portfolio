// Secretos coleccionables (F21). La pista se muestra mientras está bloqueado.
export const SECRETS = [
  { id: 'juggles', icon: '⚽', title: '10 jueguitos', hint: 'La pelota sabe hacer más que rodar…' },
  { id: 'basket', icon: '🧺', title: 'Gol en el cesto', hint: 'Hay un arco donde menos lo esperás.' },
  { id: 'penalties', icon: '🥅', title: 'Campeón de penales', hint: 'Sintonizá el canal correcto y ganá la tanda.' },
  { id: 'figurita', icon: '🃏', title: 'La figurita difícil', hint: 'A alguien se le cayó algo cerca de la cama.' },
  { id: 'zapping', icon: '📺', title: 'Rey del zapping', hint: 'Recorré todos los canales de la tele.' },
  { id: 'mate', icon: '🧉', title: '¿Uno más?', hint: 'En el escritorio hay algo para compartir.' },
  { id: 'night', icon: '🌙', title: 'Noche en Tandil', hint: 'Asomate a la ventana cuando oscurece.' },
  { id: 'konami', icon: '🎮', title: 'Código secreto', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
] as const

export type SecretId = (typeof SECRETS)[number]['id']
