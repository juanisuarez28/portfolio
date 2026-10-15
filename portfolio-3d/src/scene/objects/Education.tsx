import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { certificates, degrees } from '../../content/education'
import { profile } from '../../content/profile'
import { bookSpineTexture, diplomaTexture } from '../../lib/canvasTextures'
import { nightMix } from '../../lib/nightMix'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { Interactive } from '../Interactive'
import { Block, Cylinder } from '../primitives'
import { Plant } from './Decor'

export const DIPLOMAS_CENTER: [number, number, number] = [0.8, 2.35, -3]
export const SHELF = { x: 2.45, z: -2.79, w: 0.9, d: 0.4, h: 2.0 }

/** Diplomas de la UNICEN (TUDAI y DUIA) colgados sobre el escritorio */
export function Diplomas() {
  const setSection = useAppStore((s) => s.setSection)
  const textures = useMemo(() => degrees.map((d) => diplomaTexture(d, profile.name)), [])
  const fw = 0.74
  const fh = fw / 1.414
  return (
    <Interactive
      id="diplomas"
      label="Formación"
      onSelect={() => setSection('education')}
      hotspot={[DIPLOMAS_CENTER[0], DIPLOMAS_CENTER[1] + 0.42, -2.9]}
    >
      {textures.map((tex, i) => (
        <group key={i} position={[DIPLOMAS_CENTER[0] + (i - 0.5) * 0.9, DIPLOMAS_CENTER[1], -3 + 0.022]} rotation={[0, 0, (i - 0.5) * 0.02]}>
          <Block size={[fw + 0.06, fh + 0.06, 0.035]} color={palette.woodDark} radius={0.008} roughness={0.5} />
          <mesh position={[0, 0, 0.0181]}>
            <planeGeometry args={[fw, fh]} />
            <meshStandardMaterial map={tex} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </Interactive>
  )
}

const BOOKS = [
  { t: 'JS', c: '#e9c46a' },
  { t: 'REACT', c: '#2a9d8f' },
  { t: 'SQL', c: '#264653' },
  { t: 'JAVA', c: '#e76f51' },
  { t: 'IA', c: '#6d597a' },
  { t: 'PHP', c: '#577590' },
  { t: 'UX', c: '#f4a261' },
]

/** Estante con libros, trofeo y certificados enmarcados */
export function Bookshelf() {
  const setSection = useAppStore((s) => s.setSection)
  const certTex = useTexture(certificates.map((c) => c.image.replace('.webp', '-sm.webp')))
  const spines = useMemo(() => BOOKS.map((b) => bookSpineTexture(b.t, b.c)), [])
  const led = useRef<THREE.MeshStandardMaterial[]>([])
  useFrame(() => {
    led.current.forEach((m) => (m.emissiveIntensity = 0.1 + nightMix.value * 3))
  })

  const { x, z, w, d, h } = SHELF
  const shelves = [0.06, 0.52, 0.98, 1.44]
  const t = 0.03

  return (
    <Interactive id="bookshelf" label="Certificados" onSelect={() => setSection('education')}>
      <group position={[x, 0, z]}>
        {/* estructura */}
        <Block size={[t, h, d]} position={[-w / 2 + t / 2, h / 2, 0]} color={palette.white} radius={0.006} />
        <Block size={[t, h, d]} position={[w / 2 - t / 2, h / 2, 0]} color={palette.white} radius={0.006} />
        <Block size={[w, t, d]} position={[0, h - t / 2, 0]} color={palette.white} radius={0.006} />
        <Block size={[w, h, 0.01]} position={[0, h / 2, -d / 2 + 0.005]} color={palette.offWhite} radius={0.003} />
        {shelves.map((y, i) => (
          <group key={i}>
            <Block size={[w - 2 * t, t, d - 0.01]} position={[0, y, 0.005]} color={palette.white} radius={0.006} />
            {/* tira LED bajo cada estante */}
            {i > 0 && (
              <mesh position={[0, y - t / 2 - 0.006, d / 2 - 0.004]}>
                <planeGeometry args={[w - 2 * t - 0.04, 0.012]} />
                <meshStandardMaterial ref={(m) => void (m && (led.current[i] = m))} color="#111" emissive={palette.accent} emissiveIntensity={0.1} toneMapped={false} />
              </mesh>
            )}
          </group>
        ))}

        {/* estante 1: libros */}
        {BOOKS.map((b, i) => {
          const bh = 0.3 + ((i * 37) % 9) / 100
          return (
            <group key={b.t} position={[-0.36 + i * 0.065, shelves[0] + t / 2 + bh / 2, 0.02]} rotation={[0, 0, i === 6 ? 0.25 : 0]}>
              <Block size={[0.055, bh, 0.26]} color={b.c} radius={0.006} />
              <mesh position={[0, 0, 0.1305]}>
                <planeGeometry args={[0.055, bh]} />
                <meshStandardMaterial map={spines[i]} roughness={0.7} />
              </mesh>
            </group>
          )
        })}
        <Block size={[0.28, 0.2, 0.26]} position={[0.24, shelves[0] + t / 2 + 0.1, 0.02]} color={palette.fabricNavy} radius={0.01} />

        {/* estante 2: certificados */}
        {certificates.map((c, i) => {
          const tex = certTex[i]
          const img = tex.image as { width: number; height: number }
          const fw = 0.25
          const fh = (fw * img.height) / img.width
          return (
            <group key={c.id} position={[-0.28 + i * 0.28, shelves[1] + t / 2 + fh / 2 + 0.02, 0.02]} rotation={[-0.08, (1 - i) * 0.08, 0]}>
              <Block size={[fw + 0.03, fh + 0.03, 0.02]} color={palette.black} radius={0.004} roughness={0.4} />
              <mesh position={[0, 0, 0.0101]}>
                <planeGeometry args={[fw, fh]} />
                <meshStandardMaterial map={tex} roughness={0.4} />
              </mesh>
            </group>
          )
        })}

        {/* estante 3: trofeo + libros apilados */}
        <group position={[-0.2, shelves[2] + t / 2, 0.03]}>
          <Block size={[0.12, 0.05, 0.12]} position={[0, 0.025, 0]} color={palette.black} radius={0.006} />
          <Cylinder args={[0.015, 0.025, 0.08]} position={[0, 0.09, 0]} color="#d4a72c" metalness={0.9} roughness={0.25} />
          <mesh position={[0, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.035, 0.11, 24, 1, true]} />
            <meshStandardMaterial color="#d4a72c" metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.075, 0.18, 0]} rotation={[0, 0, s * 0.3]} castShadow>
              <torusGeometry args={[0.03, 0.007, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#d4a72c" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
        </group>
        {[0, 1, 2].map((i) => (
          <Block
            key={i}
            size={[0.3 - i * 0.03, 0.045, 0.22]}
            position={[0.2, shelves[2] + t / 2 + 0.0225 + i * 0.046, 0.02]}
            rotation={[0, i * 0.12, 0]}
            color={[palette.fabricTerracotta, palette.fabricBlue, palette.fabricMustard][i]}
            radius={0.006}
          />
        ))}

        {/* estante 4: planta y caja */}
        <Plant position={[-0.24, shelves[3] + t / 2, 0.03]} scale={0.55} />
        <Block size={[0.3, 0.22, 0.26]} position={[0.18, shelves[3] + t / 2 + 0.11, 0.02]} color={palette.woodLight} radius={0.01} />

        {/* arriba: globo terráqueo */}
        <group position={[0.15, h, 0]}>
          <Cylinder args={[0.06, 0.07, 0.02]} position={[0, 0.01, 0]} color={palette.woodDark} />
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.12, 32, 24]} />
            <meshStandardMaterial color="#4a90c2" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </Interactive>
  )
}

useTexture.preload(certificates.map((c) => c.image.replace('.webp', '-sm.webp')))
