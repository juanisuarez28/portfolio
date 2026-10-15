import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { BALL_RADIUS } from '../layout'
import { keepy, KEEPY_CENTER, ZONE_TOL, ZONE_Y } from './keepy'
import { SoccerBall } from './SoccerBall'

/** Escena del minijuego de jueguitos (F18): pelota animada + aro de golpeo + sombra. */
export function KeepyUppy() {
  const ball = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const shadow = useRef<THREE.Mesh>(null)

  useEffect(() => {
    keepy.reset()
    return () => keepy.reset()
  }, [])

  useFrame((_, dt) => {
    keepy.update(Math.min(dt, 0.05))
    const { pos, spin } = keepy
    if (ball.current) {
      ball.current.position.set(pos.x, pos.y, pos.z)
      ball.current.rotation.x += spin * dt
      ball.current.rotation.z += spin * 0.4 * dt
    }
    if (ring.current && ringMat.current) {
      ring.current.position.set(pos.x, ZONE_Y, pos.z)
      const phase = keepy.get().phase
      const inZone = keepy.inZone && phase === 'playing'
      ringMat.current.color.set(inZone ? '#51cf66' : '#ffffff')
      ringMat.current.opacity = phase === 'over' ? 0 : inZone ? 0.9 : 0.35
      const s = 1 + (inZone ? 0.08 : 0)
      ring.current.scale.setScalar(s)
    }
    if (shadow.current) {
      shadow.current.position.set(pos.x, 0.014, pos.z)
      const k = Math.max(0.3, 1 - pos.y / 2.5)
      shadow.current.scale.setScalar(k)
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * k
    }
  })

  return (
    <group>
      <group ref={ball} position={[KEEPY_CENTER.x, 1.4, KEEPY_CENTER.z]}>
        <SoccerBall radius={BALL_RADIUS} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BALL_RADIUS + ZONE_TOL * 0.35, 0.012, 8, 48]} />
        <meshBasicMaterial ref={ringMat} transparent toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 1.2, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}
