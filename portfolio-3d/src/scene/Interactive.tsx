import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'

interface Props {
  /** Id único del objeto (para hover/resaltado) */
  id: string
  /** Texto de la etiqueta ("Proyectos") */
  label: string
  onSelect: () => void
  children: ReactNode
  /** Posición del marcador pulsante en vista general. Sin valor = sin marcador. */
  hotspot?: [number, number, number]
}

const HIGHLIGHT = new THREE.Color('#38c8ff')

interface Tinted {
  mat: THREE.MeshStandardMaterial
  emissive: THREE.Color
  intensity: number
}

/** Envuelve un objeto clickeable: resaltado en hover, cursor, etiqueta y marcador (F05). */
export function Interactive({ id, label, onSelect, children, hotspot }: Props) {
  const hovered = useAppStore((s) => s.hovered === id)
  const setHovered = useAppStore((s) => s.setHovered)
  const overview = useAppStore((s) => s.section === null)
  const started = useAppStore((s) => s.started)
  const group = useRef<THREE.Group>(null)
  const tinted = useRef<Tinted[]>([])
  const amount = useRef(0)

  // materiales "apagados" (sin emisivo propio) que se tiñen al hacer hover
  useEffect(() => {
    const list: Tinted[] = []
    group.current?.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (!mesh.isMesh || !mat?.isMeshStandardMaterial) return
      if (mat.emissiveMap || mat.emissive.getHex() !== 0) return
      list.push({ mat, emissive: mat.emissive.clone(), intensity: mat.emissiveIntensity })
    })
    tinted.current = list
  }, [])

  useFrame((_, dt) => {
    const goal = hovered ? 1 : 0
    if (Math.abs(amount.current - goal) < 0.001) return
    amount.current = THREE.MathUtils.damp(amount.current, goal, 12, dt)
    for (const t of tinted.current) {
      t.mat.emissive.copy(t.emissive).lerp(HIGHLIGHT, amount.current)
      t.mat.emissiveIntensity = t.intensity + amount.current * 0.28
    }
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.pointerType === 'touch') return
    setHovered(id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    if (useAppStore.getState().hovered === id) setHovered(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // un arrastre de cámara no cuenta como click
    if (e.delta > 6) return
    onSelect()
  }

  return (
    <group>
      <group ref={group} onPointerOver={over} onPointerOut={out} onClick={click}>
        {children}
      </group>
      {hotspot && started && (
        <Html position={hotspot} center zIndexRange={[15, 0]} className="hotspot-wrap">
          <button
            type="button"
            className={`hotspot${hovered ? ' is-hovered' : ''}${overview ? '' : ' is-hidden'}`}
            onClick={onSelect}
            onPointerEnter={() => setHovered(id)}
            onPointerLeave={() => setHovered(null)}
            tabIndex={overview ? 0 : -1}
            aria-label={label}
          >
            <span className="hotspot-dot" />
            <span className="hotspot-label">{label}</span>
          </button>
        </Html>
      )}
    </group>
  )
}
