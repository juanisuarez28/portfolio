import { useTexture } from '@react-three/drei'
import { palette } from '../../lib/palette'
import { profile } from '../../content/profile'
import { Block, Cylinder } from '../primitives'

export const DESK = { x: 0.8, z: -2.55, w: 1.9, d: 0.8, h: 0.76 }

/** Escritorio con cajonera, alfombrilla, teclado, mouse, taza y portarretrato. */
export function Desk() {
  const { x, z, w, d, h } = DESK
  const photo = useTexture(profile.photo.replace('.webp', '-sm.webp'))
  const top = h
  return (
    <group>
      {/* tapa */}
      <Block size={[w, 0.05, d]} position={[x, top - 0.025, z]} color={palette.woodLight} radius={0.012} roughness={0.6} />
      {/* patas metálicas */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Block
            key={`${sx}${sz}`}
            size={[0.045, top - 0.05, 0.045]}
            position={[x + sx * (w / 2 - 0.08), (top - 0.05) / 2, z + sz * (d / 2 - 0.08)]}
            color={palette.black}
            metalness={0.6}
            roughness={0.35}
            radius={0.01}
          />
        )),
      )}
      {/* cajonera */}
      <group position={[x - w / 2 + 0.3, 0, z + 0.02]}>
        <Block size={[0.45, 0.62, 0.62]} position={[0, 0.33, 0]} color={palette.white} radius={0.015} />
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <Block size={[0.41, 0.17, 0.01]} position={[0, 0.13 + i * 0.2, 0.31]} color={palette.offWhite} radius={0.005} />
            <Block size={[0.12, 0.015, 0.02]} position={[0, 0.17 + i * 0.2, 0.32]} color={palette.metal} metalness={0.7} roughness={0.3} radius={0.006} />
          </group>
        ))}
      </group>

      {/* alfombrilla */}
      <Block size={[1.0, 0.006, 0.36]} position={[x - 0.02, top + 0.003, z + 0.2]} color={palette.darkGrey} radius={0.003} roughness={0.95} />
      {/* teclado */}
      <group position={[x - 0.1, top + 0.012, z + 0.2]}>
        <Block size={[0.48, 0.02, 0.15]} color={palette.black} radius={0.008} />
        {Array.from({ length: 4 }).map((_, row) => (
          <Block
            key={row}
            size={[0.44, 0.008, 0.026]}
            position={[0, 0.013, -0.05 + row * 0.033]}
            color="#3b4150"
            radius={0.003}
            castShadow={false}
          />
        ))}
        {/* luz RGB bajo el teclado */}
        <mesh position={[0, -0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.17]} />
          <meshStandardMaterial color="#000" emissive={palette.accent} emissiveIntensity={0.6} transparent opacity={0.6} />
        </mesh>
      </group>
      {/* mouse */}
      <mesh position={[x + 0.3, top + 0.018, z + 0.22]} scale={[0.035, 0.018, 0.06]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={palette.black} roughness={0.4} />
      </mesh>

      {/* taza */}
      <group position={[x - 0.75, top, z + 0.27]}>
        <Cylinder args={[0.042, 0.038, 0.1]} position={[0, 0.05, 0]} color={palette.accentDeep} roughness={0.35} />
        <mesh position={[0.045, 0.05, 0]} castShadow>
          <torusGeometry args={[0.024, 0.008, 8, 16]} />
          <meshStandardMaterial color={palette.accentDeep} roughness={0.35} />
        </mesh>
        <Cylinder args={[0.037, 0.037, 0.005]} position={[0, 0.095, 0]} color="#3b2414" roughness={0.2} />
      </group>

      {/* portarretrato con foto */}
      <group position={[x - 0.66, top, z - 0.22]} rotation={[0, 0.35, 0]}>
        <Block size={[0.2, 0.185, 0.015]} position={[0, 0.093, 0]} rotation={[-0.12, 0, 0]} color={palette.woodDark} radius={0.006} />
        <mesh position={[0, 0.095, 0.009]} rotation={[-0.12, 0, 0]}>
          <planeGeometry args={[0.165, 0.151]} />
          <meshStandardMaterial map={photo} roughness={0.4} />
        </mesh>
      </group>

      {/* libretas */}
      <Block size={[0.22, 0.02, 0.3]} position={[x - 0.7, top + 0.01, z + 0.0]} rotation={[0, 0.2, 0]} color={palette.fabricTerracotta} radius={0.004} />
    </group>
  )
}

useTexture.preload(profile.photo.replace('.webp', '-sm.webp'))
