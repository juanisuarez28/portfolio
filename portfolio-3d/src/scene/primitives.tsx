import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import type { ReactNode } from 'react'
import type * as THREE from 'three'

type Vec3 = [number, number, number]

interface BlockProps {
  size: Vec3
  position?: Vec3
  rotation?: Vec3
  color?: string
  radius?: number
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  map?: THREE.Texture
  castShadow?: boolean
  receiveShadow?: boolean
  children?: ReactNode
  materialRef?: React.Ref<THREE.MeshStandardMaterial>
}

/** Caja con bordes redondeados y material estándar: la pieza base de casi todos los muebles. */
export function Block({
  size,
  position,
  rotation,
  color = '#ffffff',
  radius = 0.015,
  roughness = 0.75,
  metalness = 0,
  emissive,
  emissiveIntensity = 1,
  map,
  castShadow = true,
  receiveShadow = true,
  children,
  materialRef,
}: BlockProps) {
  const r = Math.min(radius, ...size.map((s) => s / 2 - 0.0005))
  return (
    <RoundedBox
      args={size}
      radius={Math.max(r, 0.0005)}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity}
        map={map}
      />
      {children}
    </RoundedBox>
  )
}

type MeshProps = Omit<ThreeElements['mesh'], 'args'>

/** Cilindro con sombras activadas */
export function Cylinder({
  args,
  color = '#ffffff',
  roughness = 0.7,
  metalness = 0,
  ...props
}: MeshProps & { args: [number, number, number, number?]; color?: string; roughness?: number; metalness?: number }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 32]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}
