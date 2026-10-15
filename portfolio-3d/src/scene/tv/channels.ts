import { FONT } from '../../lib/canvasTextures'

/**
 * Canales de la tele (F19). Cada canal dibuja en un canvas de 640×360 según el tiempo t (segundos).
 * Son guiños a proyectos reales de Juani: VidrieraTV, PasameLaRepe y La "R".
 */
export const TV_W = 640
export const TV_H = 360

export interface Channel {
  id: number
  name: string
  /** color dominante: tiñe la luz que la tele proyecta en la habitación */
  glow: string
  draw: (ctx: CanvasRenderingContext2D, t: number, level: number) => void
}

const ADS = [
  { cat: '🚗', title: 'Vendo Fiat 147 modelo 86', body: 'Impecable, papeles al día. Escucho ofertas.', price: '$ 2.500.000' },
  { cat: '🏠', title: 'Alquilo casa en Lobería', body: '3 ambientes, patio y parrilla. Ideal familia.', price: '$ 380.000 / mes' },
  { cat: '🚲', title: 'Bici rodado 29', body: 'Poco uso, frenos a disco, cambios Shimano.', price: '$ 450.000' },
  { cat: '📚', title: 'Clases de apoyo', body: 'Matemática y física, todos los niveles.', price: 'Consultar' },
  { cat: '🐶', title: 'Cachorritos en adopción', body: 'Vacunados y desparasitados. Con mucho amor.', price: 'Gratis' },
  { cat: '🍕', title: 'Se busca ayudante de cocina', body: 'Turno noche, con o sin experiencia.', price: 'Llamar ya' },
]

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function liveBadge(ctx: CanvasRenderingContext2D, t: number, x: number, y: number, label = 'EN VIVO') {
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  rr(ctx, x, y, 96, 26, 13)
  ctx.fill()
  ctx.fillStyle = Math.sin(t * 5) > 0 ? '#ff3b3b' : '#7a1d1d'
  ctx.beginPath()
  ctx.arc(x + 15, y + 13, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `700 13px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(label, x + 27, y + 18)
}

// ───────────── Canal 1: clasificados (VidrieraTV) ─────────────
const classifieds: Channel = {
  id: 1,
  name: 'VIDRIERA',
  glow: '#7b5cff',
  draw(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, TV_W, TV_H)
    g.addColorStop(0, '#2b1468')
    g.addColorStop(1, '#0b3a8c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, TV_W, TV_H)
    // brillos que se mueven
    for (let i = 0; i < 6; i++) {
      const x = ((t * 30 + i * 140) % (TV_W + 200)) - 100
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.arc(x, 60 + i * 50, 60, 0, Math.PI * 2)
      ctx.fill()
    }
    // cabecera
    ctx.fillStyle = '#ffcf33'
    ctx.font = `800 22px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText('VIDRIERA', 22, 38)
    ctx.fillStyle = '#fff'
    ctx.fillText('TV', 132, 38)
    ctx.font = `500 13px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('CLASIFICADOS · LOBERÍA', 22, 56)
    liveBadge(ctx, t, TV_W - 118, 18)

    // ficha que entra deslizando cada 4 s
    const period = 4
    const idx = Math.floor(t / period) % ADS.length
    const p = (t % period) / period
    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, x), 3)
    const slide = p < 0.15 ? (1 - ease(p / 0.15)) * TV_W : p > 0.88 ? -ease((p - 0.88) / 0.12) * TV_W : 0
    const ad = ADS[idx]
    ctx.save()
    ctx.translate(slide, 0)
    ctx.fillStyle = 'rgba(255,255,255,0.96)'
    rr(ctx, 40, 82, TV_W - 80, 190, 18)
    ctx.fill()
    ctx.font = `64px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(ad.cat, 120, 190)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#1b1b2f'
    ctx.font = `800 28px ${FONT}`
    ctx.fillText(ad.title, 190, 140)
    ctx.font = `400 18px ${FONT}`
    ctx.fillStyle = '#44465a'
    ctx.fillText(ad.body, 190, 174)
    ctx.fillStyle = '#ff4f6d'
    rr(ctx, 190, 200, ctx.measureText(ad.price).width * 1.35 + 30, 44, 22)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 24px ${FONT}`
    ctx.fillText(ad.price, 205, 230)
    ctx.restore()

    // zócalo
    ctx.fillStyle = '#ffcf33'
    ctx.fillRect(0, TV_H - 52, TV_W, 52)
    ctx.fillStyle = '#1b1b2f'
    ctx.fillRect(0, TV_H - 52, 120, 52)
    ctx.fillStyle = '#ffcf33'
    ctx.font = `800 16px ${FONT}`
    ctx.fillText('ÚLTIMO', 22, TV_H - 22)
    ctx.save()
    ctx.beginPath()
    ctx.rect(120, TV_H - 52, TV_W - 120, 52)
    ctx.clip()
    ctx.fillStyle = '#1b1b2f'
    ctx.font = `700 18px ${FONT}`
    const ticker = ADS.map((a) => `${a.cat} ${a.title} — ${a.price}`).join('     •     ')
    const tw = ctx.measureText(ticker).width + 80
    const x = 130 - ((t * 90) % tw)
    ctx.fillText(ticker, x, TV_H - 20)
    ctx.fillText(ticker, x + tw, TV_H - 20)
    ctx.restore()
    // notita musical
    ctx.font = `22px ${FONT}`
    ctx.fillText('🎵', TV_W - 48, TV_H - 70 + Math.sin(t * 3) * 6)
  },
}

// ───────────── Canal 2: la repe (PasameLaRepe) ─────────────
function pitchPoint(nx: number, ny: number): [number, number] {
  // cancha en perspectiva: ny 0 = fondo, 1 = frente
  const top = 70
  const bottom = TV_H - 10
  const y = top + (bottom - top) * ny
  const half = 170 + 150 * ny
  return [TV_W / 2 + nx * half, y]
}

const replay: Channel = {
  id: 2,
  name: 'LA REPE',
  glow: '#37d67a',
  draw(ctx, t) {
    const LOOP = 9
    const lt = t % LOOP
    const isReplay = lt > 4.2
    // en la repetición el tiempo va en cámara lenta y repite la jugada
    const k = isReplay ? Math.min(1, (lt - 4.2) / 4.6) : Math.min(1, lt / 4)
    // cielo/tribuna
    ctx.fillStyle = '#16233a'
    ctx.fillRect(0, 0, TV_W, TV_H)
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = ['#e63946', '#f1faee', '#457b9d', '#ffd166'][i % 4]
      ctx.globalAlpha = 0.35
      ctx.fillRect((i * 37) % TV_W, 20 + ((i * 53) % 46), 4, 4)
    }
    ctx.globalAlpha = 1
    // césped en franjas
    for (let i = 0; i < 10; i++) {
      const [x0, y0] = pitchPoint(-1, i / 10)
      const [x1] = pitchPoint(1, i / 10)
      const [x2, y2] = pitchPoint(1, (i + 1) / 10)
      const [x3] = pitchPoint(-1, (i + 1) / 10)
      ctx.fillStyle = i % 2 ? '#2f9e44' : '#37b24d'
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y0)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y2)
      ctx.fill()
    }
    // área y arco del fondo
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    const a = [pitchPoint(-0.45, 0), pitchPoint(0.45, 0), pitchPoint(0.45, 0.28), pitchPoint(-0.45, 0.28)]
    ctx.beginPath()
    a.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.stroke()
    const [gx0, gy] = pitchPoint(-0.16, 0)
    const [gx1] = pitchPoint(0.16, 0)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(gx0, gy - 30, gx1 - gx0, 30)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.strokeRect(gx0, gy - 30, gx1 - gx0, 30)

    // jugada: el 10 conduce, gambetea y define
    const path = (p: number): [number, number] => {
      const nx = 0.45 - 0.5 * p + 0.12 * Math.sin(p * 7)
      const ny = 0.85 - 0.6 * p
      return [nx, ny]
    }
    const runP = Math.min(1, k / 0.7)
    const [px, py] = path(runP)
    const [sx, sy] = pitchPoint(px, py)
    // defensores
    ;[
      [0.1, 0.45],
      [-0.2, 0.35],
      [0.0, 0.2],
    ].forEach(([dx, dy], i) => {
      const [x, y] = pitchPoint(dx + Math.sin(t * 2 + i) * 0.03, dy)
      ctx.fillStyle = '#e03131'
      ctx.beginPath()
      ctx.arc(x, y - 10, 7 + dy * 4, 0, Math.PI * 2)
      ctx.fill()
    })
    // arquero
    const shotP = Math.max(0, (k - 0.7) / 0.3)
    const keeperX = -0.02 - shotP * 0.1
    const [kx, ky] = pitchPoint(keeperX, 0.04)
    ctx.fillStyle = '#ffd43b'
    ctx.beginPath()
    ctx.arc(kx, ky - 12, 7, 0, Math.PI * 2)
    ctx.fill()
    // jugador
    ctx.fillStyle = '#1f6fd1'
    ctx.beginPath()
    ctx.arc(sx, sy - 12, 9 + py * 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 10px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('10', sx, sy - 9)
    // pelota
    let bx = sx + 10
    let by = sy - 4
    if (shotP > 0) {
      const [tx, ty] = pitchPoint(0.12, 0)
      bx = sx + (tx - sx) * shotP
      by = sy - 4 + (ty - 18 - (sy - 4)) * shotP - Math.sin(shotP * Math.PI) * 30
    }
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(bx, by, 4, 0, Math.PI * 2)
    ctx.fill()

    // marcador
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    rr(ctx, 18, 16, 210, 32, 8)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `700 16px ${FONT}`
    ctx.textAlign = 'left'
    const goal = k >= 1
    ctx.fillText(`TANDIL ${goal || isReplay ? 2 : 1} - 1 AMIGOS`, 32, 38)
    if (goal && !isReplay) {
      ctx.fillStyle = '#ffd43b'
      ctx.font = `900 64px ${FONT}`
      ctx.textAlign = 'center'
      ctx.fillText('¡GOOOL!', TV_W / 2, 190)
    }
    if (isReplay) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, TV_H - 70, TV_W, 50)
      ctx.fillStyle = '#37d67a'
      ctx.fillRect(0, TV_H - 70, 8, 50)
      ctx.fillStyle = '#fff'
      ctx.font = `900 22px ${FONT}`
      ctx.textAlign = 'left'
      ctx.fillText('PASAME LA REPE', 24, TV_H - 40)
      ctx.font = `500 14px ${FONT}`
      ctx.fillText('Repetición en cámara lenta', 24, TV_H - 24)
      ctx.fillStyle = Math.sin(t * 6) > 0 ? '#ff3b3b' : '#fff'
      ctx.font = `800 16px ${FONT}`
      ctx.textAlign = 'right'
      ctx.fillText('● REPETICIÓN', TV_W - 22, 38)
    }
  },
}

// ───────────── Canal 3: radio (La "R") ─────────────
const radio: Channel = {
  id: 3,
  name: 'LA R',
  glow: '#ff6b3d',
  draw(ctx, t, level) {
    ctx.fillStyle = '#120d16'
    ctx.fillRect(0, 0, TV_W, TV_H)
    const g = ctx.createRadialGradient(TV_W / 2, TV_H / 2, 10, TV_W / 2, TV_H / 2, 320)
    g.addColorStop(0, 'rgba(255,107,61,0.35)')
    g.addColorStop(1, 'rgba(255,107,61,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, TV_W, TV_H)
    // logo
    ctx.fillStyle = '#ff6b3d'
    ctx.beginPath()
    ctx.arc(92, 92, 52, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `900 64px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('R', 92, 115)
    ctx.textAlign = 'left'
    ctx.font = `800 28px ${FONT}`
    ctx.fillText('La "R" Radio', 168, 84)
    ctx.font = `500 16px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('Ahora: lo-fi para programar · Juani FM', 168, 112)
    liveBadge(ctx, t, TV_W - 118, 22, 'AL AIRE')
    // ecualizador
    const bars = 32
    const bw = (TV_W - 80) / bars
    for (let i = 0; i < bars; i++) {
      const v =
        0.25 +
        0.35 * Math.abs(Math.sin(t * 3.1 + i * 0.6)) +
        0.25 * Math.abs(Math.sin(t * 7.3 + i * 1.7)) * (0.5 + level) +
        0.15 * Math.abs(Math.sin(t * 1.3 + i * 0.2))
      const h = v * 150
      const x = 40 + i * bw
      const grad = ctx.createLinearGradient(0, 330 - h, 0, 330)
      grad.addColorStop(0, '#ffd166')
      grad.addColorStop(1, '#ff6b3d')
      ctx.fillStyle = grad
      rr(ctx, x + 2, 330 - h, bw - 4, h, 4)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `500 13px ${FONT}`
    ctx.fillText(level > 0 ? '🔊 sonando' : '🔇 activá el sonido para escuchar', 40, 352)
  },
}

// ───────────── Canal 4: juego (pantalla de título) ─────────────
const game: Channel = {
  id: 4,
  name: 'JUEGO',
  glow: '#4dabf7',
  draw(ctx, t) {
    ctx.fillStyle = '#0b1d3a'
    ctx.fillRect(0, 0, TV_W, TV_H)
    // arco pixelado
    ctx.fillStyle = '#1c7c3c'
    ctx.fillRect(0, 230, TV_W, TV_H - 230)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 8
    ctx.strokeRect(170, 110, 300, 125)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    for (let i = 0; i < 30; i++) {
      ctx.beginPath()
      ctx.moveTo(170 + i * 10, 110)
      ctx.lineTo(170 + i * 10, 235)
      ctx.stroke()
    }
    // arquero que se balancea
    const kx = 320 + Math.sin(t * 2.2) * 70
    ctx.fillStyle = '#ffd43b'
    ctx.fillRect(kx - 14, 170, 28, 50)
    ctx.fillStyle = '#ffe3b0'
    ctx.fillRect(kx - 10, 150, 20, 20)
    ctx.fillStyle = '#ffd43b'
    ctx.fillRect(kx - 36, 176, 22, 8)
    ctx.fillRect(kx + 14, 176, 22, 8)
    ctx.fillStyle = '#fff'
    ctx.font = `900 46px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('PENALES', TV_W / 2, 70)
    ctx.font = `700 18px ${FONT}`
    ctx.fillStyle = Math.sin(t * 4) > 0 ? '#ffd43b' : '#fff'
    ctx.fillText('HACÉ CLIC EN LA TELE PARA JUGAR', TV_W / 2, 300)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(TV_W / 2, 262, 10, 0, Math.PI * 2)
    ctx.fill()
  },
}

export const CHANNELS: Channel[] = [classifieds, replay, radio, game]

/** Ruido de estática + número de canal al hacer zapping */
export function drawStatic(ctx: CanvasRenderingContext2D, channel: number) {
  const img = ctx.createImageData(TV_W / 4, TV_H / 4)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(ctx.canvas, 0, 0, TV_W / 4, TV_H / 4, 0, 0, TV_W, TV_H)
  drawOsd(ctx, channel)
}

export function drawOsd(ctx: CanvasRenderingContext2D, channel: number) {
  ctx.fillStyle = '#39ff6a'
  ctx.font = `700 34px monospace`
  ctx.textAlign = 'right'
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 6
  ctx.fillText(`CH ${channel}`, TV_W - 24, 50)
  ctx.shadowBlur = 0
}
