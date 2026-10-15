import type { SectionId } from '../content/types'

export type Vec3 = [number, number, number]

export interface CameraPreset {
  position: Vec3
  target: Vec3
  /** Ancho (m) que tiene que entrar en pantalla. En pantallas angostas la cámara se aleja para respetarlo. */
  fitWidth: number
}

export const FOV = 30

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

export const PRESETS: Record<SectionId, CameraPreset> = {
  projects: { position: [0.8, 1.24, -1.06], target: [0.8, 1.16, -2.73], fitWidth: 1.15 },
  education: { position: [1.3, 1.6, 2.0], target: [1.4, 1.65, -2.9], fitWidth: 3.1 },
  skills: { position: [-0.2, 1.75, 2.0], target: [-3, 1.6, 1.75], fitWidth: 1.5 },
  about: { position: [0.24, 1.7, 0.8], target: [-3, 1.45, -0.2], fitWidth: 2 },
  contact: { position: [1.1, 1.45, -1.25], target: [1.42, 0.86, -2.43], fitWidth: 0.7 },
  cv: { position: [0.95, 1.65, -0.3], target: [2.45, 0.75, -1.65], fitWidth: 1.3 },
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
