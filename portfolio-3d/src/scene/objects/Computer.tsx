import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { profile } from '../../content/profile'
import { projects } from '../../content/projects'
import { desktopScreenTexture } from '../../lib/canvasTextures'
import { nightMix } from '../../lib/nightMix'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { ProjectsBrowser } from '../../ui/ProjectsBrowser'
import { Interactive } from '../Interactive'
import { Block } from '../primitives'
import { DESK } from './Desk'

export const SCREEN = { w: 0.95, h: 0.575, px: 1280 }
/** Centro de la pantalla en coordenadas de mundo (lo usa el preset de cámara) */
export const SCREEN_CENTER: [number, number, number] = [DESK.x, DESK.h + 0.42, DESK.z - 0.2 + 0.018]

/** Monitor (con HTML real en desktop, F08) + torre con RGB animado (F10). */
export function Computer() {
  const setSection = useAppStore((s) => s.setSection)
  const showHtml = useAppStore((s) => s.section === 'projects' && s.cameraSettled)
  const wide = useThree((s) => s.size.width >= 900)
  const screenTex = useMemo(() => desktopScreenTexture(projects, profile.shortName), [])
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const rgb = useRef<THREE.MeshStandardMaterial[]>([])

  useFrame(({ clock }) => {
    const n = nightMix.value
    if (screenMat.current) screenMat.current.emissiveIntensity = 0.75 + n * 0.55
    const t = clock.elapsedTime
    rgb.current.forEach((m, i) => {
      m.emissive.setHSL((t * 0.08 + i * 0.12) % 1, 1, 0.5)
      m.emissiveIntensity = 1.4 + n * 2
    })
  })

  const pxH = Math.round((SCREEN.px * SCREEN.h) / SCREEN.w)

  return (
    <group>
      <Interactive id="computer" label="Proyectos" onSelect={() => setSection('projects')} hotspot={[DESK.x, 1.62, DESK.z - 0.2]}>
        <group position={[DESK.x, DESK.h, DESK.z - 0.2]}>
          {/* base y brazo */}
          <Block size={[0.28, 0.014, 0.19]} position={[0, 0.007, 0]} color={palette.darkGrey} metalness={0.5} roughness={0.35} radius={0.006} />
          <Block size={[0.05, 0.32, 0.03]} position={[0, 0.17, -0.05]} color={palette.darkGrey} metalness={0.5} roughness={0.35} radius={0.01} />
          {/* carcasa */}
          <Block size={[SCREEN.w + 0.04, SCREEN.h + 0.045, 0.035]} position={[0, 0.42, 0]} color={palette.black} roughness={0.4} radius={0.012} />
          {/* pantalla */}
          <mesh position={[0, 0.42 + 0.008, 0.0181]}>
            <planeGeometry args={[SCREEN.w, SCREEN.h]} />
            <meshStandardMaterial
              ref={screenMat}
              map={screenTex}
              emissiveMap={screenTex}
              emissive="#ffffff"
              emissiveIntensity={0.8}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          {showHtml && wide && (
            <Html
              transform
              position={[0, 0.42 + 0.008, 0.019]}
              distanceFactor={(SCREEN.w * 400) / SCREEN.px}
              zIndexRange={[12, 0]}
            >
              <div className="screen-html" style={{ width: SCREEN.px, height: pxH }} onPointerDown={(e) => e.stopPropagation()}>
                <ProjectsBrowser variant="screen" />
              </div>
            </Html>
          )}
        </group>

        {/* torre */}
        <group position={[DESK.x + 0.62, 0, DESK.z + 0.02]}>
          <Block size={[0.24, 0.5, 0.48]} position={[0, 0.25, 0]} color={palette.black} roughness={0.35} radius={0.015} />
          {/* panel lateral de vidrio (hacia la cámara, +x) */}
          <mesh position={[0.121, 0.27, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.4, 0.38]} />
            <meshStandardMaterial color="#0b0f18" roughness={0.1} metalness={0.4} />
          </mesh>
          {/* ventiladores frontales */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.12 + i * 0.13, 0.242]}>
              <torusGeometry args={[0.045, 0.008, 8, 32]} />
              <meshStandardMaterial ref={(m) => void (m && (rgb.current[i] = m))} color="#111" emissive="#ff00aa" />
            </mesh>
          ))}
          {/* tira RGB lateral */}
          <mesh position={[0.122, 0.27, 0.17]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.012, 0.36]} />
            <meshStandardMaterial ref={(m) => void (m && (rgb.current[3] = m))} color="#111" emissive="#00d2ff" />
          </mesh>
        </group>
      </Interactive>
    </group>
  )
}
