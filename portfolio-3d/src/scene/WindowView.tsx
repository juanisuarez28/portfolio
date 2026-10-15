import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { tandilViewTexture } from '../lib/canvasTextures'
import { nightMix } from '../lib/nightMix'

/** Paisaje de las sierras de Tandil detrás de la ventana, con fundido día → noche. */
export function WindowView() {
  const day = useMemo(() => tandilViewTexture(false), [])
  const night = useMemo(() => tandilViewTexture(true), [])
  const nightMat = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(() => {
    if (nightMat.current) nightMat.current.opacity = nightMix.value
  })

  return (
    <group position={[-1.5, 1.8, -3.7]}>
      <mesh>
        <planeGeometry args={[3.6, 1.8]} />
        <meshBasicMaterial map={day} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.6, 1.8]} />
        <meshBasicMaterial ref={nightMat} map={night} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}
