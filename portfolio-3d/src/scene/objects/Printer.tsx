import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { profile } from '../../content/profile'
import { paperTexture } from '../../lib/canvasTextures'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { Interactive } from '../Interactive'
import { Block } from '../primitives'

export const PRINTER_POS: [number, number, number] = [2.45, 0, -1.65]

/** Mueble con impresora: lleva al CV y "imprime" una hoja al abrir la sección (F10). */
export function Printer() {
  const setSection = useAppStore((s) => s.setSection)
  const printing = useAppStore((s) => s.section === 'cv')
  const paper = useRef<THREE.Group>(null)
  const tex = useMemo(() => paperTexture(profile.name), [])
  const led = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }, dt) => {
    if (paper.current) easing.damp(paper.current.position, 'z', printing ? 0.3 : -0.03, printing ? 0.6 : 0.2, dt)
    if (led.current) led.current.emissiveIntensity = printing ? 2 + Math.sin(clock.elapsedTime * 8) * 1.5 : 1.2
  })

  const top = 0.62
  return (
    <Interactive id="printer" label="CV" onSelect={() => setSection('cv')} hotspot={[PRINTER_POS[0], 1.15, PRINTER_POS[2]]}>
      <group position={PRINTER_POS}>
        {/* mueble */}
        <Block size={[0.78, top - 0.03, 0.46]} position={[0, (top - 0.03) / 2, 0]} color={palette.white} radius={0.015} />
        <Block size={[0.82, 0.03, 0.5]} position={[0, top - 0.015, 0]} color={palette.woodLight} radius={0.01} />
        {[0, 1].map((i) => (
          <group key={i}>
            <Block size={[0.36, 0.5, 0.01]} position={[-0.19 + i * 0.38, 0.3, 0.231]} color={palette.offWhite} radius={0.006} />
            <Block size={[0.015, 0.12, 0.02]} position={[-0.04 + i * 0.08, 0.36, 0.24]} color={palette.woodDark} radius={0.006} />
          </group>
        ))}

        {/* impresora */}
        <group position={[0.05, top, 0]}>
          <Block size={[0.46, 0.18, 0.34]} position={[0, 0.09, 0]} color={palette.offWhite} radius={0.025} roughness={0.5} />
          <Block size={[0.44, 0.03, 0.3]} position={[0, 0.195, -0.01]} color={palette.darkGrey} radius={0.012} roughness={0.4} />
          {/* bandeja trasera con hojas */}
          <Block size={[0.3, 0.16, 0.02]} position={[0, 0.24, -0.15]} rotation={[-0.35, 0, 0]} color={palette.darkGrey} radius={0.006} />
          <Block size={[0.26, 0.14, 0.005]} position={[0, 0.25, -0.13]} rotation={[-0.35, 0, 0]} color={palette.paper} radius={0.002} />
          {/* ranura de salida */}
          <Block size={[0.32, 0.015, 0.02]} position={[0, 0.07, 0.165]} color={palette.black} radius={0.004} />
          {/* hoja impresa que sale */}
          <group ref={paper} position={[0, 0.072, -0.03]}>
            <mesh rotation={[-Math.PI / 2 + 0.06, 0, 0]} castShadow>
              <planeGeometry args={[0.26, 0.36]} />
              <meshStandardMaterial map={tex} roughness={0.8} />
            </mesh>
          </group>
          {/* led */}
          <mesh position={[0.18, 0.15, 0.171]}>
            <circleGeometry args={[0.01, 16]} />
            <meshStandardMaterial ref={led} color="#111" emissive="#38d39f" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          <Block size={[0.08, 0.03, 0.01]} position={[0.1, 0.15, 0.17]} color={palette.grey} radius={0.004} />
        </group>
      </group>
    </Interactive>
  )
}
