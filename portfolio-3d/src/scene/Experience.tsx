import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { BallSystem } from './ball/BallSystem'
import { CameraRig } from './CameraRig'
import { FOV, INTRO } from './cameraPresets'
import { Confetti } from './Confetti'
import { Effects } from './Effects'
import { Lights } from './Lights'
import { Outside } from './outside/Outside'
import { RoomModel } from './room/RoomModel'
import { SunBeam } from './SunBeam'

/** Canvas principal: habitación de Blender, exterior, luces, física, cámara y postprocesado. */
export function Experience() {
  const setQuality = useAppStore((s) => s.setQuality)
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio, 2))

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
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => {
          setDpr(1)
          setQuality('low')
        }}
      />
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
