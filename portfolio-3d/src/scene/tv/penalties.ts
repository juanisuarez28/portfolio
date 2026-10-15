import { FONT } from '../../lib/canvasTextures'
import { TV_H, TV_W } from './channels'

/**
 * Tanda de penales jugable en la tele (F20). Lógica + dibujo en el canvas de la tele.
 * Coordenadas del arco: x ∈ [-1, 1] de palo a palo, y ∈ [0, 1] del piso al travesaño.
 */
type Phase = 'aim' | 'flight' | 'result' | 'end'
type Outcome = 'gol' | 'atajada' | 'afuera' | 'palo'

const GOAL = { x0: 150, x1: 490, y0: 95, y1: 245 } // rectángulo del arco en pantalla
const SPOT = { x: TV_W / 2, y: 330 }
const SHOTS = 5

export interface PenaltyEvents {
  onShot?: (o: Outcome) => void
  onEnd?: (won: boolean, me: number, cpu: number) => void
}

export class PenaltyGame {
  phase: Phase = 'aim'
  aim = { x: 0, y: 0.5 }
  power = 0
  shot = 0
  me: (boolean | null)[] = Array(SHOTS).fill(null)
  cpu: (boolean | null)[] = Array(SHOTS).fill(null)
  private t = 0
  private phaseT = 0
  private target = { x: 0, y: 0 }
  private keeper = { x: 0, y: 0, dir: 0, lean: 0 }
  private outcome: Outcome = 'gol'
  private ev: PenaltyEvents

  constructor(ev: PenaltyEvents = {}) {
    this.ev = ev
  }

  get goalsMe() {
    return this.me.filter(Boolean).length
  }
  get goalsCpu() {
    return this.cpu.filter(Boolean).length
  }

  /** puntero normalizado de la pantalla (0..1) → apunte sobre el arco */
  pointer(nx: number, ny: number) {
    if (this.phase !== 'aim') return
    this.aim.x = Math.max(-1.35, Math.min(1.35, (nx - 0.5) * 3.2))
    this.aim.y = Math.max(0, Math.min(1.35, (0.72 - ny) * 2.2))
  }

  /** clic/tap: patear (o seguir/reiniciar) */
  press() {
    if (this.phase === 'aim') this.shoot()
    else if (this.phase === 'end') this.reset()
  }

  reset() {
    Object.assign(this, { phase: 'aim', shot: 0, me: Array(SHOTS).fill(null), cpu: Array(SHOTS).fill(null), phaseT: 0 })
    this.keeper = { x: 0, y: 0, dir: 0, lean: 0 }
  }

  private shoot() {
    const p = this.power
    // potencia: muy floja = fácil para el arquero, demasiada = se va por arriba
    const lift = p > 0.9 ? (p - 0.9) * 6 : (p - 0.55) * 0.35
    this.target = { x: this.aim.x + (Math.random() - 0.5) * 0.12, y: Math.max(0.03, this.aim.y + lift) }
    // el arquero "lee" el apunte la mitad de las veces
    const read = Math.random() < 0.45
    const dir = read ? Math.sign(this.target.x) * (Math.abs(this.target.x) > 0.25 ? 1 : 0) : [-1, 0, 1][Math.floor(Math.random() * 3)]
    this.keeper.dir = dir
    const { x, y } = this.target
    let o: Outcome
    if (Math.abs(x) > 1.04 || y > 1.04) o = 'afuera'
    else if (Math.abs(x) > 0.95 || y > 0.95) o = 'palo'
    else {
      const kx = dir * 0.62
      const reachX = p < 0.3 ? 0.7 : 0.42
      const reachY = Math.abs(x - kx) < 0.25 ? 0.95 : 0.72
      o = Math.abs(x - kx) < reachX && y < reachY ? 'atajada' : 'gol'
    }
    this.outcome = o
    this.phase = 'flight'
    this.phaseT = 0
  }

  update(dt: number) {
    this.t += dt
    this.phaseT += dt
    if (this.phase === 'aim') {
      this.power = 0.5 + 0.5 * Math.sin(this.t * 3.4)
      this.keeper.x += (Math.sin(this.t * 1.7) * 0.18 - this.keeper.x) * Math.min(1, dt * 4)
      this.keeper.lean = 0
    } else if (this.phase === 'flight') {
      const k = Math.min(1, this.phaseT / 0.55)
      this.keeper.x += (this.keeper.dir * 0.62 - this.keeper.x) * Math.min(1, dt * 7)
      this.keeper.lean = this.keeper.dir * Math.min(1, k * 1.6)
      if (k >= 1) {
        const scored = this.outcome === 'gol'
        this.me[this.shot] = scored
        // la CPU patea su penal (72% de efectividad)
        this.cpu[this.shot] = Math.random() < 0.72
        this.ev.onShot?.(this.outcome)
        this.phase = 'result'
        this.phaseT = 0
      }
    } else if (this.phase === 'result' && this.phaseT > 1.6) {
      this.shot++
      const left = SHOTS - this.shot
      const decided = this.goalsMe > this.goalsCpu + left || this.goalsCpu > this.goalsMe + left
      if (this.shot >= SHOTS || decided) {
        this.phase = 'end'
        this.ev.onEnd?.(this.goalsMe > this.goalsCpu, this.goalsMe, this.goalsCpu)
      } else {
        this.phase = 'aim'
        this.keeper = { x: 0, y: 0, dir: 0, lean: 0 }
      }
      this.phaseT = 0
    }
  }

  private toScreen(x: number, y: number): [number, number] {
    return [GOAL.x0 + ((x + 1) / 2) * (GOAL.x1 - GOAL.x0), GOAL.y1 - y * (GOAL.y1 - GOAL.y0)]
  }

  draw(ctx: CanvasRenderingContext2D) {
    // cielo de estadio + tribuna
    const sky = ctx.createLinearGradient(0, 0, 0, 120)
    sky.addColorStop(0, '#0a1630')
    sky.addColorStop(1, '#1d3461')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, TV_W, TV_H)
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = ['#e63946', '#f1faee', '#1f6fd1', '#ffd166', '#2a9d8f'][i % 5]
      ctx.globalAlpha = 0.45
      const bob = this.phase === 'result' && this.outcome === 'gol' ? Math.sin(this.t * 18 + i) * 2 : 0
      ctx.fillRect((i * 29) % TV_W, 12 + ((i * 47) % 64) + bob, 4, 4)
    }
    ctx.globalAlpha = 1
    // césped
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#2b8a3e' : '#2f9e44'
      ctx.fillRect(0, 210 + i * 19, TV_W, 19)
    }
    ctx.fillStyle = '#2b8a3e'
    ctx.fillRect(0, 95, TV_W, 115)
    ctx.fillStyle = '#237032'
    ctx.fillRect(0, 95, TV_W, 8)
    // línea y área chica
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, 247)
    ctx.lineTo(TV_W, 247)
    ctx.moveTo(110, 247)
    ctx.lineTo(80, 290)
    ctx.lineTo(560, 290)
    ctx.lineTo(530, 247)
    ctx.stroke()
    // red
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(GOAL.x0, GOAL.y0, GOAL.x1 - GOAL.x0, GOAL.y1 - GOAL.y0)
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 1
    for (let x = GOAL.x0; x <= GOAL.x1; x += 12) {
      ctx.beginPath()
      ctx.moveTo(x, GOAL.y0)
      ctx.lineTo(x + 6, GOAL.y1)
      ctx.stroke()
    }
    for (let y = GOAL.y0; y <= GOAL.y1; y += 12) {
      ctx.beginPath()
      ctx.moveTo(GOAL.x0, y)
      ctx.lineTo(GOAL.x1, y)
      ctx.stroke()
    }
    // palos
    ctx.fillStyle = '#fff'
    ctx.fillRect(GOAL.x0 - 6, GOAL.y0 - 6, 6, GOAL.y1 - GOAL.y0 + 6)
    ctx.fillRect(GOAL.x1, GOAL.y0 - 6, 6, GOAL.y1 - GOAL.y0 + 6)
    ctx.fillRect(GOAL.x0 - 6, GOAL.y0 - 6, GOAL.x1 - GOAL.x0 + 12, 6)

    // arquero
    const [kx, ky] = this.toScreen(this.keeper.x, 0)
    ctx.save()
    ctx.translate(kx, ky)
    ctx.rotate(this.keeper.lean * 1.15)
    ctx.translate(0, -Math.abs(this.keeper.lean) * 18)
    ctx.fillStyle = '#ffd43b'
    ctx.fillRect(-18, -86, 36, 50) // torso
    ctx.fillStyle = '#1d1f24'
    ctx.fillRect(-18, -38, 36, 14) // short
    ctx.fillStyle = '#ffe0bd'
    ctx.fillRect(-14, -24, 10, 24)
    ctx.fillRect(4, -24, 10, 24)
    ctx.beginPath()
    ctx.arc(0, -98, 13, 0, Math.PI * 2)
    ctx.fill()
    const arms = this.phase === 'aim' ? 0.4 + Math.sin(this.t * 6) * 0.15 : 1
    const hands: [number, number][] = [
      [-18 - Math.cos(arms) * 36, -80 - Math.sin(arms) * 36],
      [18 + Math.cos(arms) * 36, -80 - Math.sin(arms) * 36],
    ]
    ctx.strokeStyle = '#ffd43b'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-16, -80)
    ctx.lineTo(...hands[0])
    ctx.moveTo(16, -80)
    ctx.lineTo(...hands[1])
    ctx.stroke()
    ctx.fillStyle = '#e8590c'
    hands.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()

    // pelota
    let bx = SPOT.x
    let by = SPOT.y
    let br = 13
    if (this.phase !== 'aim') {
      const k = this.phase === 'flight' ? Math.min(1, this.phaseT / 0.55) : 1
      let [tx, ty] = this.toScreen(this.target.x, this.target.y)
      if (this.phase === 'result' && this.outcome === 'atajada') {
        tx = kx + this.keeper.dir * 30
        ty = ky - 70
      }
      bx = SPOT.x + (tx - SPOT.x) * k
      by = SPOT.y + (ty - SPOT.y) * k - Math.sin(k * Math.PI) * 40
      br = 13 - 6 * k
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(bx, Math.max(by + br, this.phase === 'aim' ? SPOT.y + 12 : by + br), br, br * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d1f24'
    ctx.beginPath()
    ctx.arc(bx + br * 0.2, by - br * 0.1, br * 0.35, 0, Math.PI * 2)
    ctx.fill()

    // mira y barra de potencia
    if (this.phase === 'aim') {
      const [ax, ay] = this.toScreen(this.aim.x, this.aim.y)
      ctx.strokeStyle = '#ffd43b'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(ax, ay, 14, 0, Math.PI * 2)
      ctx.moveTo(ax - 22, ay)
      ctx.lineTo(ax + 22, ay)
      ctx.moveTo(ax, ay - 22)
      ctx.lineTo(ax, ay + 22)
      ctx.stroke()
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(TV_W - 46, 110, 22, 170)
      const ph = 166 * this.power
      ctx.fillStyle = this.power > 0.9 ? '#ff3b3b' : this.power > 0.55 ? '#ffd43b' : '#51cf66'
      ctx.fillRect(TV_W - 44, 278 - ph, 18, ph)
      ctx.fillStyle = '#fff'
      ctx.font = `700 12px ${FONT}`
      ctx.textAlign = 'center'
      ctx.fillText('POT', TV_W - 35, 298)
    }

    // marcador con los 5 tiros
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.beginPath()
    ctx.roundRect(14, 12, 250, 62, 10)
    ctx.fill()
    ctx.font = `700 15px ${FONT}`
    ctx.textAlign = 'left'
    const row = (label: string, arr: (boolean | null)[], y: number) => {
      ctx.fillStyle = '#fff'
      ctx.fillText(label, 26, y + 5)
      arr.forEach((v, i) => {
        ctx.fillStyle = v === null ? 'rgba(255,255,255,0.25)' : v ? '#51cf66' : '#ff6b6b'
        ctx.beginPath()
        ctx.arc(120 + i * 26, y, 8, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    row('JUANI', this.me, 32)
    row('CPU', this.cpu, 58)

    // carteles
    ctx.textAlign = 'center'
    if (this.phase === 'result') {
      const text = { gol: '¡GOOOL!', atajada: '¡ATAJÓ!', afuera: '¡AFUERA!', palo: '¡PALO!' }[this.outcome]
      ctx.fillStyle = this.outcome === 'gol' ? '#ffd43b' : '#ff6b6b'
      ctx.font = `900 ${60 + Math.sin(this.phaseT * 10) * 3}px ${FONT}`
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 6
      ctx.strokeText(text, TV_W / 2, 190)
      ctx.fillText(text, TV_W / 2, 190)
    } else if (this.phase === 'end') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, TV_W, TV_H)
      const won = this.goalsMe > this.goalsCpu
      ctx.fillStyle = won ? '#ffd43b' : '#fff'
      ctx.font = `900 48px ${FONT}`
      ctx.fillText(won ? '¡CAMPEÓN! 🏆' : this.goalsMe === this.goalsCpu ? 'EMPATE' : 'PERDISTE', TV_W / 2, 150)
      ctx.fillStyle = '#fff'
      ctx.font = `700 30px ${FONT}`
      ctx.fillText(`${this.goalsMe} - ${this.goalsCpu}`, TV_W / 2, 200)
      ctx.font = `600 18px ${FONT}`
      ctx.fillText('Clic para jugar otra vez', TV_W / 2, 260)
    } else if (this.phase === 'aim' && this.shot === 0 && this.t < 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.beginPath()
      ctx.roundRect(120, 300, 400, 44, 22)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `600 16px ${FONT}`
      ctx.fillText('Mové para apuntar · clic para patear (ojo la potencia)', TV_W / 2, 328)
    }
  }
}
