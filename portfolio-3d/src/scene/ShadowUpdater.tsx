import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { shadowState } from '../lib/shadows'
import { useAppStore } from '../store/useAppStore'

/** Cada cuántos frames se refrescan igual las sombras (cortinas con brisa, agujas del reloj) */
const IDLE_EVERY = 20

/**
 * Apaga el recálculo automático de sombras (F25): con dos luces que proyectan sombra, eso eran 3 renders
 * de la escena por frame. Se recalculan solo mientras algo se mueve, y unas pocas veces por segundo en reposo.
 */
export function ShadowUpdater() {
  const gl = useThree((s) => s.gl)
  const frame = useRef(0)

  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    return () => {
      gl.shadowMap.autoUpdate = true
    }
  }, [gl])

  useFrame(() => {
    const s = useAppStore.getState()
    frame.current++
    // la silla y la hoja de la impresora se mueven durante las transiciones de cámara; la pelota en los jueguitos
    const moving = !s.sceneReady || !s.cameraSettled || s.focus === 'keepy'
    if (moving || shadowState.dirty || frame.current % IDLE_EVERY === 0) {
      gl.shadowMap.needsUpdate = true
      shadowState.dirty = false
    }
  })
  return null
}
