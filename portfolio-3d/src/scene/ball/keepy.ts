import { audio } from '../../lib/audio'
import { useAppStore } from '../../store/useAppStore'
import { BALL_RADIUS, RUG } from '../layout'

/**
 * Lógica del minijuego de jueguitos (F18), separada del render para que el HUD (DOM) y la escena (3D) la compartan.
 * Hay que tocar cuando la pelota pasa por el aro de golpeo (ZONE_Y ± ZONE_TOL).
 */
export const ZONE_Y = 0.42
export const ZONE_TOL = 0.2
const CENTER = { x: RUG.x + 0.3, z: RUG.z + 0.1 }

export type KeepyPhase = 'ready' | 'playing' | 'over'

export interface KeepySnapshot {
  phase: KeepyPhase
  count: number
  best: number
  feedback: string
  feedbackId: number
}

class KeepyGame {
  pos = { x: CENTER.x, y: 1.4, z: CENTER.z }
  vel = { x: 0, y: 0, z: 0 }
  spin = 0
  private snap: KeepySnapshot = { phase: 'ready', count: 0, best: 0, feedback: '', feedbackId: 0 }
  private listeners = new Set<() => void>()

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  get = () => this.snap
  private emit(patch: Partial<KeepySnapshot>) {
    this.snap = { ...this.snap, ...patch }
    this.listeners.forEach((l) => l())
  }

  get inZone() {
    return Math.abs(this.pos.y - ZONE_Y) < ZONE_TOL
  }

  /** primer toque: la pelota sale para arriba desde donde está flotando */
  start() {
    this.pos = { x: CENTER.x, y: ZONE_Y, z: CENTER.z }
    this.vel = { x: 0, y: Math.sqrt(2 * 9.8 * 0.5 * 1.0), z: 0 }
    this.spin = 8
    audio.play('kick', 0.5)
    this.emit({ phase: 'playing', count: 0, best: useAppStore.getState().juggleRecord, feedback: '¡Ahora tocá cuando baje al aro!', feedbackId: Date.now() })
  }

  private get gravity() {
    return 9.8 * Math.min(1.05, 0.5 + this.snap.count * 0.025)
  }

  tap() {
    if (this.snap.phase !== 'playing') {
      this.start()
      return
    }
    if (!this.inZone) {
      this.emit({ feedback: this.pos.y > ZONE_Y ? '¡Esperala!' : '¡Tarde!', feedbackId: Date.now() })
      return
    }
    const perfect = Math.abs(this.pos.y - ZONE_Y) < ZONE_TOL * 0.35
    const h = 0.85 + Math.random() * 0.45
    this.vel.y = Math.sqrt(2 * this.gravity * h)
    this.vel.x = (Math.random() - 0.5) * 0.5
    this.vel.z = (Math.random() - 0.5) * 0.5
    this.spin = (Math.random() - 0.5) * 20
    audio.play('kick', 0.6)
    const count = this.snap.count + 1
    const msgs = ['¡Bien!', '¡Eso!', '¡Seguí!', '¡Crack!', '¡Qué zurda!', '¡Fenómeno!']
    this.emit({ count, feedback: perfect ? '¡Perfecto!' : msgs[count % msgs.length], feedbackId: Date.now() })
    if (count === 10) useAppStore.getState().unlock('juggles')
  }

  private t = 0

  update(dt: number) {
    this.t += dt
    if (this.snap.phase === 'ready') {
      // flotando, esperando el primer toque
      this.pos.y = ZONE_Y + 0.12 + Math.sin(this.t * 2.4) * 0.05
      this.spin = 1.5
      return
    }
    this.vel.y -= this.gravity * dt
    this.pos.x += this.vel.x * dt
    this.pos.y += this.vel.y * dt
    this.pos.z += this.vel.z * dt
    // que no se vaya de la alfombra
    if (Math.abs(this.pos.x - CENTER.x) > 0.5) this.vel.x *= -1
    if (Math.abs(this.pos.z - CENTER.z) > 0.4) this.vel.z *= -1
    if (this.pos.y <= BALL_RADIUS) {
      this.pos.y = BALL_RADIUS
      if (this.snap.phase === 'playing') {
        const s = useAppStore.getState()
        const best = Math.max(s.juggleRecord, this.snap.count)
        if (best > s.juggleRecord) s.setJuggleRecord(best)
        audio.play('bounce', 1)
        this.emit({ phase: 'over', best, feedback: '', feedbackId: Date.now() })
      }
      // rebotes que se apagan
      this.vel.y = Math.abs(this.vel.y) * 0.45
      this.vel.x *= 0.7
      this.vel.z *= 0.7
      if (this.vel.y < 0.3) this.vel.y = 0
    }
  }

  reset() {
    this.pos = { x: CENTER.x, y: ZONE_Y + 0.12, z: CENTER.z }
    this.vel = { x: 0, y: 0, z: 0 }
    this.emit({ phase: 'ready', count: 0, best: useAppStore.getState().juggleRecord, feedback: '' })
  }
}

export const keepy = new KeepyGame()
export const KEEPY_CENTER = CENTER
