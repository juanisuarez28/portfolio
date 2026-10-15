import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { profile } from '../../content/profile'
import { skillGroups } from '../../content/skills'
import { corkboardTexture, jerseyBackTexture } from '../../lib/canvasTextures'
import { reducedMotion } from '../../lib/nightMix'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { Interactive } from '../Interactive'
import { Block } from '../primitives'

export const JERSEY_POS: [number, number, number] = [-3, 1.8, -0.05]
export const CORK_POS: [number, number, number] = [-3, 1.68, 1.75]
export const BALL_HOME: [number, number, number] = [1.05, 0.11, 0.85]

function jerseyShape() {
  const s = new THREE.Shape()
  // contorno de una camiseta (unidades ≈ metros), centrada en el origen
  s.moveTo(-0.07, 0.25)
  s.quadraticCurveTo(0, 0.2, 0.07, 0.25)
  s.lineTo(0.17, 0.22)
  s.lineTo(0.3, 0.1)
  s.lineTo(0.24, 0.02)
  s.lineTo(0.17, 0.07)
  s.lineTo(0.17, -0.28)
  s.lineTo(-0.17, -0.28)
  s.lineTo(-0.17, 0.07)
  s.lineTo(-0.24, 0.02)
  s.lineTo(-0.3, 0.1)
  s.lineTo(-0.17, 0.22)
  s.closePath()
  return s
}

/** Camiseta enmarcada (Sobre mí) */
export function Jersey() {
  const setSection = useAppStore((s) => s.setSection)
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(jerseyShape(), { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3 })
    g.center()
    return g
  }, [])
  const back = useMemo(() => jerseyBackTexture(profile.shortName, '10'), [])
  return (
    <Interactive id="jersey" label="Sobre mí" onSelect={() => setSection('about')} hotspot={[JERSEY_POS[0] + 0.1, JERSEY_POS[1] + 0.5, JERSEY_POS[2]]}>
      <group position={[JERSEY_POS[0] + 0.035, JERSEY_POS[1], JERSEY_POS[2]]} rotation={[0, Math.PI / 2, 0]}>
        {/* marco tipo caja */}
        <Block size={[0.78, 0.8, 0.06]} color={palette.black} radius={0.01} roughness={0.4} />
        <Block size={[0.7, 0.72, 0.01]} position={[0, 0, 0.026]} color="#e7e2d8" radius={0.003} />
        <mesh geometry={geo} position={[0, 0.0, 0.05]} castShadow>
          <meshStandardMaterial color={palette.jersey} roughness={0.7} />
        </mesh>
        {/* vivos blancos en las mangas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.255, 0.065, 0.0695]} rotation={[0, 0, s * -0.9]}>
            <planeGeometry args={[0.012, 0.13]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, -0.03, 0.0695]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial map={back} transparent roughness={0.7} />
        </mesh>
      </group>
    </Interactive>
  )
}

/** Corcho con post-its de skills */
export function Corkboard() {
  const setSection = useAppStore((s) => s.setSection)
  const tex = useMemo(() => corkboardTexture(skillGroups), [])
  const w = 1.3
  const h = w / 1.4
  return (
    <Interactive id="corkboard" label="Skills" onSelect={() => setSection('skills')} hotspot={[CORK_POS[0] + 0.1, CORK_POS[1] + 0.58, CORK_POS[2]]}>
      <group position={[CORK_POS[0] + 0.025, CORK_POS[1], CORK_POS[2]]} rotation={[0, Math.PI / 2, 0]}>
        <Block size={[w + 0.07, h + 0.07, 0.035]} color={palette.woodLight} radius={0.012} />
        <mesh position={[0, 0, 0.0181]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.9} />
        </mesh>
      </group>
    </Interactive>
  )
}

/** Pelota de fútbol: los pentágonos están en los vértices de un icosaedro */
function SoccerBall({ radius }: { radius: number }) {
  const patches = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 0)
    const pos = ico.getAttribute('position')
    const seen: THREE.Vector3[] = []
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize()
      if (!seen.some((s) => s.distanceTo(v) < 0.01)) seen.push(v)
    }
    return seen.map((v) => {
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v)
      return { p: v.clone().multiplyScalar(radius * 0.985), q }
    })
  }, [radius])
  return (
    <group>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshStandardMaterial color="#f7f7f2" roughness={0.45} />
      </mesh>
      {patches.map((pt, i) => (
        <mesh key={i} position={pt.p} quaternion={pt.q}>
          <circleGeometry args={[radius * 0.36, 5]} />
          <meshStandardMaterial color="#1d1f24" roughness={0.45} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
    </group>
  )
}

/** Pelota para hacer jueguitos (F10) */
export function Ball() {
  const juggle = useAppStore((s) => s.juggle)
  const showToast = useAppStore((s) => s.showToast)
  const ref = useRef<THREE.Group>(null)
  const anim = useRef({ t: 1, from: 0, airborne: false, landedAt: 0, spin: new THREE.Vector3() })
  const R = BALL_HOME[1]

  const onKick = () => {
    const a = anim.current
    const g = ref.current
    if (!g) return
    a.from = g.position.y - R
    a.t = 0
    a.airborne = true
    a.spin.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 14)
    juggle()
    const n = useAppStore.getState().juggles
    if (n === 10) showToast('🏆 ¡10 jueguitos! Ya podés firmar contrato')
    else if (n === 25) showToast('🐐 25 jueguitos. Esto ya es nivel Selección')
    else showToast(`⚽ Jueguitos: ${n}`)
  }

  useFrame((_, dt) => {
    const a = anim.current
    const g = ref.current
    if (!g) return
    if (a.airborne) {
      const dur = reducedMotion ? 0.4 : 0.85
      a.t = Math.min(1, a.t + dt / dur)
      const peak = 0.75
      // parábola desde la altura actual hasta el piso
      const y = a.from * (1 - a.t) + 4 * peak * a.t * (1 - a.t)
      g.position.y = R + Math.max(0, y)
      g.rotation.x += a.spin.x * dt
      g.rotation.y += a.spin.y * dt
      g.rotation.z += a.spin.z * dt
      if (a.t >= 1) {
        a.airborne = false
        a.landedAt = performance.now()
      }
    } else if (a.landedAt && performance.now() - a.landedAt > 1200) {
      // se cayó: se reinicia la cuenta
      a.landedAt = 0
      if (useAppStore.getState().juggles > 0) useAppStore.getState().resetJuggles()
    }
  })

  return (
    <Interactive id="ball" label="Jueguitos" onSelect={onKick}>
      <group ref={ref} position={BALL_HOME}>
        <SoccerBall radius={R} />
      </group>
    </Interactive>
  )
}
