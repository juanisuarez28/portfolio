import { BallCollider, CuboidCollider, CylinderCollider, Physics, RigidBody, useAfterPhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { audio } from '../../lib/audio'
import { markShadowsDirty } from '../../lib/shadows'
import { useAppStore } from '../../store/useAppStore'
import { BALL_HOME, BALL_RADIUS, BASKET, KNOCKABLES_ORIGIN, ROOM, STATIC_COLLIDERS } from '../layout'
import { kickDirection } from './BallSystem'
import { SoccerBall } from './SoccerBall'

/**
 * Mundo físico de la habitación (F17): pelota, colisionadores de muebles, objetos volteables y el cesto-arco.
 * Se carga en diferido. `resetToken` remonta todo para "Acomodar".
 */
export default function PhysicsWorld() {
  const resetToken = useAppStore((s) => s.resetToken)
  return (
    <Physics key={resetToken} gravity={[0, -9.81, 0]} timeStep={1 / 60}>
      <RoomColliders />
      <Basket />
      <Ball />
      <Knockables />
      <ShadowWake />
    </Physics>
  )
}

function RoomColliders() {
  const H = ROOM.height
  return (
    <RigidBody type="fixed" colliders={false} friction={0.7} restitution={0.4}>
      {/* piso, paredes reales e invisibles en los lados abiertos, techo */}
      <CuboidCollider args={[3.2, 0.1, 3.2]} position={[0, -0.1, 0]} />
      <CuboidCollider args={[0.1, H / 2, 3.2]} position={[-3.1, H / 2, 0]} />
      <CuboidCollider args={[3.2, H / 2, 0.1]} position={[0, H / 2, -3.1]} />
      <CuboidCollider args={[0.1, H / 2, 3.2]} position={[3.1, H / 2, 0]} />
      <CuboidCollider args={[3.2, H / 2, 0.1]} position={[0, H / 2, 3.1]} />
      <CuboidCollider args={[3.2, 0.1, 3.2]} position={[0, H + 0.1, 0]} />
      {STATIC_COLLIDERS.map((c, i) => (
        <CuboidCollider key={i} args={c.half} position={c.pos} />
      ))}
    </RigidBody>
  )
}

/** Cesto: paredes huecas (anillo de cajitas) + sensor adentro para detectar el gol */
function Basket() {
  const unlock = useAppStore((s) => s.unlock)
  const showToast = useAppStore((s) => s.showToast)
  const cooldown = useRef(0)
  const walls = useMemo(() => Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2), [])
  return (
    <group position={[BASKET.x, 0, BASKET.z]}>
      <RigidBody type="fixed" colliders={false} restitution={0.2}>
        {walls.map((a) => (
          <CuboidCollider
            key={a}
            args={[0.055, BASKET.h / 2, 0.012]}
            position={[Math.cos(a) * (BASKET.r - 0.01), BASKET.h / 2, Math.sin(a) * (BASKET.r - 0.01)]}
            rotation={[0, -a + Math.PI / 2, 0]}
          />
        ))}
        <CuboidCollider args={[BASKET.r, 0.02, BASKET.r]} position={[0, 0.02, 0]} />
        <CuboidCollider
          sensor
          args={[BASKET.r * 0.6, 0.1, BASKET.r * 0.6]}
          position={[0, 0.2, 0]}
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name !== 'ball' || performance.now() < cooldown.current) return
            cooldown.current = performance.now() + 2500
            audio.play('goal')
            showToast({ text: '¡GOOOL! La clavaste en el cesto 🧺', ms: 2600 })
            window.dispatchEvent(new CustomEvent('confetti', { detail: [BASKET.x, 0.6, BASKET.z] }))
            unlock('basket')
          }}
        />
      </RigidBody>
    </group>
  )
}

function Ball() {
  const rb = useRef<RapierRigidBody>(null)
  const consumeKick = useAppStore((s) => s.consumeKick)
  const showToast = useAppStore((s) => s.showToast)
  const setFocus = useAppStore((s) => s.setFocus)
  const kicks = useRef(0)
  const lastBounce = useRef(0)

  const kick = (dir: [number, number]) => {
    const b = rb.current
    if (!b) return
    const power = 2.6 + Math.random() * 1.2
    b.setLinvel({ x: dir[0] * power, y: 2.4 + Math.random() * 1.2, z: dir[1] * power }, true)
    b.setAngvel({ x: dir[1] * 18, y: (Math.random() - 0.5) * 6, z: -dir[0] * 18 }, true)
    kicks.current++
    if (kicks.current === 1 || kicks.current % 6 === 0) {
      showToast({ text: '⚽ ¿Te animás a los jueguitos?', action: { label: 'Jugar', run: () => setFocus('keepy') }, ms: 5000 })
    }
  }

  useEffect(() => {
    const k = consumeKick()
    if (k) requestAnimationFrame(() => kick(k))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RigidBody
      ref={rb}
      name="ball"
      position={BALL_HOME}
      colliders={false}
      linearDamping={0.25}
      angularDamping={0.5}
      ccd
      onCollisionEnter={() => {
        const v = rb.current?.linvel()
        const speed = v ? Math.hypot(v.x, v.y, v.z) : 0
        if (speed > 0.8 && performance.now() - lastBounce.current > 90) {
          lastBounce.current = performance.now()
          audio.play('bounce', speed / 4)
        }
      }}
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.72} friction={0.6} density={330} />
      <group
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 6 || !rb.current) return
          audio.play('kick')
          const p = rb.current.translation()
          kick(kickDirection(e, { x: p.x, z: p.z }))
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <SoccerBall radius={BALL_RADIUS} />
      </group>
    </RigidBody>
  )
}

/** Latas apiladas y libros parados en el piso: la pelota los puede voltear */
function Knockables() {
  const [ox, , oz] = KNOCKABLES_ORIGIN
  const cans = [
    { p: [ox - 0.04, 0.061, oz], c: '#d62828' },
    { p: [ox + 0.04, 0.061, oz], c: '#2a9d8f' },
    { p: [ox, 0.183, oz], c: '#f4a261' },
  ] as const
  return (
    <>
      {cans.map((can, i) => (
        <RigidBody key={i} position={[...can.p]} colliders={false} restitution={0.3} friction={0.6}>
          <CylinderCollider args={[0.06, 0.033]} density={120} />
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.033, 0.033, 0.12, 20]} />
            <meshStandardMaterial color={can.c} metalness={0.7} roughness={0.3} fog={false} />
          </mesh>
          <mesh position={[0, 0.0605, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.002, 20]} />
            <meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.25} fog={false} />
          </mesh>
        </RigidBody>
      ))}
      {[0, 1].map((i) => (
        <RigidBody key={`b${i}`} position={[ox + 0.25 + i * 0.07, 0.12, oz - 0.15]} rotation={[0, 0.3, 0]} colliders="cuboid" restitution={0.1} friction={0.8}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.05, 0.24, 0.17]} />
            <meshStandardMaterial color={i ? '#3d5a80' : '#e9c46a'} roughness={0.7} fog={false} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/** Mientras haya cuerpos despiertos (pelota rodando, latas cayendo) las sombras se recalculan (F25) */
function ShadowWake() {
  useAfterPhysicsStep((world) => {
    let awake = false
    world.forEachActiveRigidBody((b) => {
      if (b.isDynamic()) awake = true
    })
    if (awake) markShadowsDirty()
  })
  return null
}
