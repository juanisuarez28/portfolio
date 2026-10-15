import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { phoneScreenTexture } from '../../lib/canvasTextures'
import { nightMix } from '../../lib/nightMix'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { Interactive } from '../Interactive'
import { Block, Cylinder } from '../primitives'
import { DESK } from './Desk'

export const PHONE_POS: [number, number, number] = [DESK.x + 0.62, DESK.h, DESK.z + 0.12]

/** Celular en su soporte → sección Contacto */
export function Phone() {
  const setSection = useAppStore((s) => s.setSection)
  const tex = useMemo(() => phoneScreenTexture(), [])
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.7 + nightMix.value * 0.4 + Math.sin(clock.elapsedTime * 3) * 0.08
  })
  return (
    <Interactive id="phone" label="Contacto" onSelect={() => setSection('contact')} hotspot={[PHONE_POS[0], PHONE_POS[1] + 0.3, PHONE_POS[2]]}>
      <group position={PHONE_POS} rotation={[0, -0.35, 0]}>
        {/* soporte */}
        <Block size={[0.09, 0.012, 0.08]} position={[0, 0.006, 0]} color={palette.offWhite} radius={0.004} />
        <Block size={[0.09, 0.09, 0.01]} position={[0, 0.05, -0.02]} rotation={[-0.35, 0, 0]} color={palette.offWhite} radius={0.004} />
        {/* teléfono */}
        <group position={[0, 0.088, -0.006]} rotation={[-0.35, 0, 0]}>
          <Block size={[0.078, 0.16, 0.009]} color={palette.black} radius={0.008} roughness={0.3} />
          <mesh position={[0, 0, 0.0051]}>
            <planeGeometry args={[0.07, 0.148]} />
            <meshStandardMaterial ref={mat} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </Interactive>
  )
}

/** Lámpara de escritorio: al hacer click alterna día/noche (F09). */
export function DeskLamp() {
  const toggleNight = useAppStore((s) => s.toggleNight)
  const light = useRef<THREE.SpotLight>(null)
  const bulb = useRef<THREE.MeshStandardMaterial>(null)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(DESK.x + 0.45, DESK.h, DESK.z + 0.1)
    return o
  }, [])

  useFrame(() => {
    const n = nightMix.value
    if (light.current) light.current.intensity = n * 9
    if (bulb.current) bulb.current.emissiveIntensity = 0.2 + n * 6
  })

  const base: [number, number, number] = [DESK.x + 0.82, DESK.h, DESK.z - 0.25]
  return (
    <Interactive id="lamp" label="Luz" onSelect={toggleNight}>
      <group position={base}>
        <Cylinder args={[0.08, 0.09, 0.025]} position={[0, 0.0125, 0]} color={palette.black} metalness={0.4} roughness={0.4} />
        <Block size={[0.022, 0.42, 0.022]} position={[0, 0.22, 0]} rotation={[0, 0, 0.18]} color={palette.black} radius={0.008} />
        <Block size={[0.022, 0.3, 0.022]} position={[-0.11, 0.48, 0.03]} rotation={[0.2, 0, 1.1]} color={palette.black} radius={0.008} />
        {/* cabezal */}
        <group position={[-0.24, 0.52, 0.08]} rotation={[0.5, 0, 0.6]}>
          <mesh castShadow>
            <coneGeometry args={[0.085, 0.14, 24, 1, true]} />
            <meshStandardMaterial color={palette.fabricMustard} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.035, 16, 12]} />
            <meshStandardMaterial ref={bulb} color="#fff4d6" emissive="#ffc46b" emissiveIntensity={0.2} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[base[0] - 0.24, base[1] + 0.48, base[2] + 0.1]}
        target={target}
        angle={0.9}
        penumbra={0.8}
        distance={4}
        decay={1.5}
        color="#ffbf73"
        intensity={0}
      />
      {/* resplandor cálido general de la lámpara */}
      <LampGlow position={[base[0] - 0.2, base[1] + 0.35, base[2] + 0.3]} />
    </Interactive>
  )
}

function LampGlow({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(() => {
    if (ref.current) ref.current.intensity = nightMix.value * 2.2
  })
  return <pointLight ref={ref} position={position} color="#ffb766" distance={5} decay={1.4} intensity={0} />
}

/** Silla gamer frente al escritorio. Al enfocar la compu rueda a un costado para no tapar la pantalla. */
export function Chair() {
  const legs = [0, 1, 2, 3, 4]
  const ref = useRef<THREE.Group>(null)
  const aside = useAppStore((s) => s.section === 'projects')
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    easing.damp(g.position, 'x', DESK.x - 0.05 + (aside ? 1.0 : 0), 0.35, dt)
    easing.damp(g.position, 'z', DESK.z + 0.95 + (aside ? 0.4 : 0), 0.35, dt)
    easing.damp(g.rotation, 'y', aside ? -1.1 : 0.25, 0.35, dt)
  })
  return (
    <group ref={ref} position={[DESK.x - 0.05, 0, DESK.z + 0.95]} rotation={[0, 0.25, 0]}>
      {legs.map((i) => {
        const a = (i / legs.length) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Block size={[0.04, 0.035, 0.3]} position={[0, 0.07, 0.15]} color={palette.black} metalness={0.4} roughness={0.4} radius={0.01} />
            <mesh position={[0, 0.03, 0.29]} castShadow>
              <sphereGeometry args={[0.03, 12, 8]} />
              <meshStandardMaterial color={palette.darkGrey} />
            </mesh>
          </group>
        )
      })}
      <Cylinder args={[0.03, 0.03, 0.34]} position={[0, 0.25, 0]} color={palette.metal} metalness={0.8} roughness={0.25} />
      {/* asiento */}
      <Block size={[0.54, 0.1, 0.52]} position={[0, 0.47, 0]} color={palette.black} radius={0.04} roughness={0.6} />
      <Block size={[0.06, 0.12, 0.5]} position={[-0.26, 0.53, 0]} color={palette.accent} radius={0.025} roughness={0.6} />
      <Block size={[0.06, 0.12, 0.5]} position={[0.26, 0.53, 0]} color={palette.accent} radius={0.025} roughness={0.6} />
      {/* respaldo (del lado de la cámara) */}
      <group position={[0, 0.95, 0.25]} rotation={[0.12, 0, 0]}>
        <Block size={[0.52, 0.8, 0.1]} color={palette.black} radius={0.05} roughness={0.6} />
        <Block size={[0.16, 0.74, 0.02]} position={[0, 0, 0.05]} color={palette.accent} radius={0.008} roughness={0.6} />
        <Block size={[0.3, 0.12, 0.08]} position={[0, 0.3, -0.07]} color={palette.darkGrey} radius={0.04} />
      </group>
      {/* apoyabrazos */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Block size={[0.04, 0.2, 0.04]} position={[s * 0.3, 0.6, 0.02]} color={palette.black} radius={0.01} />
          <Block size={[0.08, 0.03, 0.26]} position={[s * 0.3, 0.71, 0.02]} color={palette.darkGrey} radius={0.012} />
        </group>
      ))}
    </group>
  )
}
