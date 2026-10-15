import type { SectionId } from '../content/types'
import type { Focus } from '../store/useAppStore'
import { KEEPY_CENTER } from './ball/keepy'
import { TV, WINDOW } from './layout'

export type Vec3 = [number, number, number]

export interface CameraPreset {
  position: Vec3
  target: Vec3
  /** Ancho (m) que tiene que entrar en pantalla. En pantallas angostas la cámara se aleja para respetarlo. */
  fitWidth: number
}

export const FOV = 30
/** FOV más abierto al asomarse a la ventana (con 30° el paisaje parece teleobjetivo) */
export const WINDOW_FOV = 55

export const OVERVIEW: CameraPreset = {
  position: [7.4, 5.6, 8.4],
  target: [-0.15, 1.0, -0.35],
  fitWidth: 9.4,
}

/** Posición inicial lejana para la animación de entrada */
export const INTRO: CameraPreset = {
  position: [15, 12, 17],
  target: [-0.15, 1.0, -0.35],
  fitWidth: 9.4,
}

// v2 (F14): el escritorio está en x = 0.35 y la impresora contra la pared del fondo
export const PRESETS: Record<SectionId, CameraPreset> = {
  projects: { position: [0.3, 1.24, -1.06], target: [0.3, 1.16, -2.8], fitWidth: 1.15 },
  education: { position: [1.4, 1.65, 2.0], target: [1.3, 1.75, -2.9], fitWidth: 3.2 },
  skills: { position: [-0.2, 1.75, 2.0], target: [-3, 1.6, 1.75], fitWidth: 1.5 },
  about: { position: [0.24, 1.7, 0.8], target: [-3, 1.45, -0.35], fitWidth: 2.7 },
  // de frente a la pantalla del celular (que está girado -0.4 rad e inclinado hacia atrás)
  contact: { position: [0.765, 0.975, -2.1], target: [0.902, 0.848, -2.426], fitWidth: 0.26 },
  cv: { position: [1.65, 1.55, -0.85], target: [1.6, 0.8, -2.75], fitWidth: 1.2 },
}

/** Vistas sin panel: asomarse a la ventana (F16) y los minijuegos (F18, F20) */
export const FOCUS_PRESETS: Record<Focus, CameraPreset> = {
  window: { position: [WINDOW.x + 0.3, 1.8, -2.2], target: [WINDOW.x - 1.2, 1.0, -12], fitWidth: 0.6 },
  keepy: { position: [KEEPY_CENTER.x + 2.0, 1.45, KEEPY_CENTER.z + 2.4], target: [KEEPY_CENTER.x, 0.65, KEEPY_CENTER.z], fitWidth: 1.8 },
  penalties: { position: [-1.6, 1.22, -1.28], target: [TV.x, TV.y, TV.z], fitWidth: 1.25 },
}

/**
 * Aleja la cámara (sobre la misma línea de visión) si `fitWidth` no entra con el aspect ratio actual.
 * `visibleFraction` / `visibleFractionY`: porción libre de UI (panel lateral en desktop, hoja inferior en mobile).
 */
export function fitPreset(preset: CameraPreset, aspect: number, visibleFraction = 1, visibleFractionY = 1): CameraPreset {
  const [px, py, pz] = preset.position
  const [tx, ty, tz] = preset.target
  const dist = Math.hypot(px - tx, py - ty, pz - tz)
  const tanV = Math.tan((FOV * Math.PI) / 360)
  const tanH = tanV * aspect * visibleFraction
  // alto aproximado del objeto: ~62% del ancho
  const needed = Math.max(preset.fitWidth / 2 / tanH, (preset.fitWidth * 0.62) / 2 / (tanV * visibleFractionY))
  const k = Math.max(1, needed / dist)
  return {
    ...preset,
    position: [tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k],
  }
}
