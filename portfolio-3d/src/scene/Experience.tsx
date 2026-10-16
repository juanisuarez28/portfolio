import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { BallSystem } from './ball/BallSystem'
import { CameraRig } from './CameraRig'
import { FOV, INTRO } from './cameraPresets'
import { Confetti } from './Confetti'
import { Effects } from './Effects'
import { Lights } from './Lights'
import { Outside } from './outside/Outside'
import { RoomModel } from './room/RoomModel'
import { ShadowUpdater } from './ShadowUpdater'
import { SunBeam } from './SunBeam'

/**
 * Rango de resolución por calidad (F25). Más allá de 1.5 el costo crece mucho y casi no se nota con SMAA;
 * en calidad baja puede bajar un poco de 1 antes de rendirse.
 */
const DPR_RANGE = {
  high: [1, Math.min(window.devicePixelRatio, 1.5)],
  low: [Math.min(window.devicePixelRatio, 0.75), Math.min(window.devicePixelRatio, 1)],
} as const

/** Canvas principal: habitación de Blender, exterior, luces, física, cámara y postprocesado. */
export function Experience() {
  const quality = useAppStore((s) => s.quality)
  const setQuality = useAppStore((s) => s.setQuality)
  const [min, max] = DPR_RANGE[quality]
  const [factor, setFactor] = useState(1)
  const declines = useRef(0)
  // al cambiar de calidad se arranca de nuevo desde la resolución máxima de ese nivel
  useEffect(() => setFactor(1), [quality])
  const dpr = Math.round((min + (max - min) * factor) * 20) / 20

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: true }}
      camera={{ fov: FOV, near: 0.05, far: 400, position: INTRO.position }}
      onCreated={(s) => {
        if (import.meta.env.DEV) (window as unknown as { __scene: unknown }).__scene = s.scene
      }}
      onPointerMissed={() => {
        const s = useAppStore.getState()
        if (s.section || s.focus === 'window') s.goHome()
      }}
    >
      {/* primero baja la resolución de a poco; si sigue lento, pasa a calidad baja */}
      <PerformanceMonitor
        key={quality}
        factor={1}
        step={0.25}
        onChange={({ factor }) => setFactor(factor)}
        onIncline={() => (declines.current = 0)}
        onDecline={({ factor }) => {
          if (factor > 0.05 || ++declines.current < 2) return
          declines.current = 0
          setQuality('low')
        }}
      />
      <ShadowUpdater />
      <Lights />
      <Suspense fallback={null}>
        <Effects />
        <RoomModel />
        <Outside />
        <SunBeam />
        <BallSystem />
        <Confetti />
        <ReadySignal />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}

/** Se monta cuando todo lo suspendido (modelo y texturas) ya cargó */
function ReadySignal() {
  const setSceneReady = useAppStore((s) => s.setSceneReady)
  useEffect(() => {
    // un pequeño margen para que compilen los shaders antes de habilitar "Entrar"
    const id = setTimeout(setSceneReady, 150)
    return () => clearTimeout(id)
  }, [setSceneReady])
  return null
}
