import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import CameraControlsImpl from 'camera-controls'
import { useEffect, useRef } from 'react'
import { reducedMotion } from '../lib/nightMix'
import { useAppStore } from '../store/useAppStore'
import { fitPreset, FOV, INTRO, OVERVIEW, PRESETS } from './cameraPresets'

const { ACTION } = CameraControlsImpl

/** Ancho del panel lateral en desktop (ver ui.css → .panel) */
export const PANEL_WIDTH = 460
/** Fracción de alto que tapa la hoja inferior en mobile */
export const SHEET_FRACTION = 0.58
export const WIDE_BREAKPOINT = 900
/** Alto (px) que ocupan marca + botón volver arriba en mobile */
const MOBILE_TOP_UI = 120

/** Controla la cámara según la sección activa (F06). */
export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null)
  const section = useAppStore((s) => s.section)
  const started = useAppStore((s) => s.started)
  const setCameraSettled = useAppStore((s) => s.setCameraSettled)
  const size = useThree((s) => s.size)
  const token = useRef(0)
  const introDone = useRef(false)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (import.meta.env.DEV) (window as unknown as { __cc: CameraControlsImpl }).__cc = c
    const aspect = size.width / size.height
    const wide = size.width >= WIDE_BREAKPOINT

    if (!started) {
      c.setLookAt(...INTRO.position, ...INTRO.target, false)
      c.maxDistance = Infinity
      return
    }

    const focused = section !== null
    const hasPanel = focused && !(section === 'projects' && wide)
    // con panel lateral, el objeto tiene que entrar en el espacio libre a la izquierda
    const freeX = hasPanel && wide ? 1 - (PANEL_WIDTH + 24) / size.width : 1
    // en mobile queda libre la franja entre el HUD de arriba y la hoja inferior
    const freeTop = MOBILE_TOP_UI / size.height
    const freeY = hasPanel && !wide ? 1 - SHEET_FRACTION - freeTop : 1
    const preset = fitPreset(section ? PRESETS[section] : OVERVIEW, aspect, freeX, freeY)

    // límites: en vista general órbita acotada; enfocado, la cámara la maneja el rig
    if (focused) {
      c.minPolarAngle = 0
      c.maxPolarAngle = Math.PI
      c.minAzimuthAngle = -Infinity
      c.maxAzimuthAngle = Infinity
      c.minDistance = 0
      c.maxDistance = Infinity
      c.mouseButtons.left = ACTION.NONE
      c.mouseButtons.wheel = ACTION.NONE
      c.touches.one = ACTION.NONE
      c.touches.two = ACTION.NONE
    } else {
      c.minPolarAngle = 0.45
      c.maxPolarAngle = 1.32
      c.minAzimuthAngle = -0.12
      c.maxAzimuthAngle = 1.48
      c.minDistance = 5.5
      c.maxDistance = Math.max(18, Math.hypot(...preset.position.map((p, i) => p - preset.target[i])) + 2)
      c.mouseButtons.left = ACTION.ROTATE
      c.mouseButtons.wheel = ACTION.DOLLY
      c.touches.one = ACTION.TOUCH_ROTATE
      c.touches.two = ACTION.TOUCH_DOLLY
    }
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE

    // corrimiento para que el objeto quede en la zona visible (no tapado por el panel)
    const dist = Math.hypot(...preset.position.map((p, i) => p - preset.target[i]))
    const viewH = 2 * dist * Math.tan((FOV * Math.PI) / 360)
    const viewW = viewH * aspect
    let ox = 0
    let oy = 0
    if (hasPanel && wide) ox = ((PANEL_WIDTH + 24) / 2 / size.width) * viewW
    // ojo: en camera-controls un focalOffset.y positivo baja la cámara (el objeto sube en pantalla)
    if (hasPanel && !wide) oy = (0.5 - (freeTop + freeY / 2)) * viewH

    const first = !introDone.current
    introDone.current = true
    c.smoothTime = reducedMotion ? 0.12 : first ? 1.1 : 0.55

    const my = ++token.current
    setCameraSettled(false)
    Promise.all([
      c.setLookAt(...preset.position, ...preset.target, true),
      c.setFocalOffset(ox, oy, 0, true),
    ]).then(() => {
      if (my === token.current) setCameraSettled(true)
    })
  }, [section, started, size.width, size.height, setCameraSettled])

  return <CameraControls ref={ref} makeDefault smoothTime={0.55} draggingSmoothTime={0.15} dollySpeed={0.6} azimuthRotateSpeed={0.6} polarRotateSpeed={0.6} />
}
