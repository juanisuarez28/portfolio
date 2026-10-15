import type { ThreeEvent } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { audio } from '../../lib/audio'
import { useAppStore } from '../../store/useAppStore'
import { BALL_HOME, BALL_RADIUS } from '../layout'
import { KeepyUppy } from './KeepyUppy'
import { SoccerBall } from './SoccerBall'

// el motor de física (Rapier, wasm) se baja recién al primer pateo (F17 R6)
const PhysicsWorld = lazy(() => import('./PhysicsWorld'))

/** Dirección del pateo según dónde se hizo clic sobre la pelota: se patea "alejándose" del punto */
export function kickDirection(e: ThreeEvent<MouseEvent>, center: { x: number; z: number }): [number, number] {
  const cam = e.camera.position
  // si se clickea el centro, sale hacia adelante de la cámara
  let dx = center.x - e.point.x + (center.x - cam.x) * 0.04
  let dz = center.z - e.point.z + (center.z - cam.z) * 0.04
  const len = Math.hypot(dx, dz) || 1
  dx /= len
  dz /= len
  return [dx, dz]
}

function StaticBall() {
  const kick = useAppStore((s) => s.kick)
  return (
    <group
      position={BALL_HOME}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 6) return
        audio.play('kick')
        kick(kickDirection(e, { x: BALL_HOME[0], z: BALL_HOME[2] }))
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <SoccerBall radius={BALL_RADIUS} />
    </group>
  )
}

export function BallSystem() {
  const physicsOn = useAppStore((s) => s.physicsOn)
  const keepy = useAppStore((s) => s.focus === 'keepy')
  if (keepy) return <KeepyUppy />
  if (!physicsOn) return <StaticBall />
  return (
    <Suspense fallback={<StaticBall />}>
      <PhysicsWorld />
    </Suspense>
  )
}
