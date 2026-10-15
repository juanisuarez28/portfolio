import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { CameraRig } from './CameraRig'
import { FOV, INTRO } from './cameraPresets'
import { Effects } from './Effects'
import { Lights } from './Lights'
import { Furniture } from './objects'
import { Room } from './Room'

/** Canvas principal: habitación, luces, cámara y postprocesado. */
export function Experience() {
  const setQuality = useAppStore((s) => s.setQuality)
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio, 2))

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: FOV, near: 0.1, far: 80, position: INTRO.position }}
      onPointerMissed={() => {
        if (useAppStore.getState().section) useAppStore.getState().setSection(null)
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
        <Room />
        <Furniture />
        <ReadySignal />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}

/** Se monta cuando todo lo suspendido (texturas) ya cargó */
function ReadySignal() {
  const setSceneReady = useAppStore((s) => s.setSceneReady)
  useEffect(() => {
    // un pequeño margen para que compilen los shaders antes de habilitar "Entrar"
    const id = setTimeout(setSceneReady, 150)
    return () => clearTimeout(id)
  }, [setSceneReady])
  return null
}
