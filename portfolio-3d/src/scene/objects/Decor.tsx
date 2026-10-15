import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { BoxGeometry } from 'three'
import { posterTexture } from '../../lib/canvasTextures'
import { palette } from '../../lib/palette'
import { Block, Cylinder } from '../primitives'

type Vec3 = [number, number, number]

/** Planta en maceta (hojas = esferas alargadas) */
export function Plant({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + i * 0.4
        const tilt = 0.35 + (i % 3) * 0.18
        return { a, tilt, len: 0.32 + (i % 4) * 0.06, dark: i % 2 === 0 }
      }),
    [],
  )
  return (
    <group position={position} scale={scale}>
      <Cylinder args={[0.13, 0.1, 0.26, 24]} position={[0, 0.13, 0]} color={palette.pot} roughness={0.8} />
      <Cylinder args={[0.12, 0.12, 0.01, 24]} position={[0, 0.255, 0]} color="#3b2a1e" />
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.25, 0]} rotation={[0, l.a, 0]}>
          <mesh position={[0, l.len * 0.55, l.len * 0.35]} rotation={[l.tilt, 0, 0]} scale={[0.07, l.len * 0.55, 0.025]} castShadow>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={l.dark ? palette.plantDark : palette.plant} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Planta alta tipo costilla de Adán para la esquina */
export function TallPlant({ position }: { position: Vec3 }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }).map((_, i) => ({
        a: i * 2.4,
        h: 0.55 + (i % 5) * 0.17,
        tilt: 0.5 + (i % 3) * 0.2,
        s: 0.16 + (i % 3) * 0.03,
      })),
    [],
  )
  return (
    <group position={position}>
      <Cylinder args={[0.2, 0.16, 0.42, 24]} position={[0, 0.21, 0]} color={palette.white} roughness={0.6} />
      <Cylinder args={[0.19, 0.19, 0.01, 24]} position={[0, 0.41, 0]} color="#3b2a1e" />
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.4, 0]} rotation={[0, l.a, 0]}>
          <mesh position={[0, l.h * 0.5, 0.08]} rotation={[0.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.01, l.h, 6]} />
            <meshStandardMaterial color={palette.plantDark} />
          </mesh>
          <mesh position={[0, l.h, 0.12 + l.s * 0.6]} rotation={[l.tilt, 0, 0]} scale={[l.s, l.s * 1.2, 0.02]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={i % 2 ? palette.plant : palette.plantDark} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Reloj de pared que marca la hora real */
export function WallClock({ position }: { position: Vec3 }) {
  const hour = useRef<THREE.Mesh>(null)
  const minute = useRef<THREE.Mesh>(null)
  const second = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const m = d.getMinutes() + s / 60
    const h = (d.getHours() % 12) + m / 60
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2
  })
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <Cylinder args={[0.2, 0.2, 0.035, 48]} color={palette.black} />
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 48]} />
        <meshStandardMaterial color={palette.paper} />
      </mesh>
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(a) * 0.155, Math.cos(a) * 0.155, 0]} rotation={[0, 0, -a]}>
              <boxGeometry args={[0.008, i % 3 === 0 ? 0.03 : 0.015, 0.002]} />
              <meshStandardMaterial color={palette.black} />
            </mesh>
          )
        })}
        <ClockHand ref={hour} len={0.09} w={0.012} color={palette.black} z={0.003} />
        <ClockHand ref={minute} len={0.13} w={0.008} color={palette.black} z={0.006} />
        <ClockHand ref={second} len={0.14} w={0.003} color="#e63946" z={0.009} />
      </group>
    </group>
  )
}

function ClockHand({ ref, len, w, color, z }: { ref: React.Ref<THREE.Mesh>; len: number; w: number; color: string; z: number }) {
  // pivote en el centro del reloj: se corre la geometría hacia arriba
  const geo = useMemo(() => new BoxGeometry(w, len, 0.003).translate(0, len / 2 - 0.015, 0), [len, w])
  return (
    <mesh ref={ref} position={[0, 0, z]} geometry={geo}>
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

/** Póster de Tandil en la pared izquierda */
export function Poster({ position }: { position: Vec3 }) {
  const tex = useMemo(() => posterTexture(), [])
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <Block size={[0.52, 0.72, 0.02]} color={palette.black} radius={0.004} />
      <mesh position={[0, 0, 0.0105]}>
        <planeGeometry args={[0.48, 0.672]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  )
}

/** Cama contra la pared izquierda */
export function Bed() {
  const x = -2.3
  const z0 = 0.75
  const len = 2.0
  const zc = z0 + len / 2
  return (
    <group>
      <Block size={[1.4, 0.28, len]} position={[x, 0.16, zc]} color={palette.woodDark} radius={0.02} />
      {/* patas */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Block key={`${sx}${sz}`} size={[0.06, 0.04, 0.06]} position={[x + sx * 0.62, 0.02, zc + sz * 0.92]} color={palette.woodDark} radius={0.01} />
        )),
      )}
      <Block size={[1.34, 0.18, len - 0.06]} position={[x, 0.39, zc + 0.02]} color={palette.white} radius={0.06} roughness={0.95} />
      {/* manta */}
      <Block size={[1.4, 0.06, 1.3]} position={[x, 0.48, zc + 0.36]} color={palette.fabricNavy} radius={0.03} roughness={0.95} />
      <Block size={[1.42, 0.065, 0.2]} position={[x, 0.485, zc - 0.22]} color={palette.offWhite} radius={0.03} roughness={0.95} />
      {/* almohadas */}
      <Block size={[0.55, 0.14, 0.34]} position={[x - 0.3, 0.55, z0 + 0.25]} rotation={[0.25, 0, 0]} color={palette.paper} radius={0.06} roughness={0.95} />
      <Block size={[0.55, 0.14, 0.34]} position={[x + 0.32, 0.55, z0 + 0.25]} rotation={[0.25, 0.05, 0]} color={palette.paper} radius={0.06} roughness={0.95} />
      <Block size={[0.32, 0.26, 0.1]} position={[x + 0.1, 0.6, z0 + 0.45]} rotation={[-0.2, 0.3, 0]} color={palette.fabricMustard} radius={0.05} roughness={0.95} />
      {/* respaldo */}
      <Block size={[1.4, 0.95, 0.07]} position={[x, 0.48, z0 - 0.035]} color={palette.woodDark} radius={0.025} />
      <Block size={[1.3, 0.55, 0.03]} position={[x, 0.66, z0 + 0.005]} color={palette.wood} radius={0.02} />
    </group>
  )
}
