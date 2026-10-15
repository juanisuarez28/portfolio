import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/** Confeti al embocar (y al completar los secretos) */
export function Confetti() {
  const N = 120
  const ref = useRef<THREE.InstancedMesh>(null)
  const [origin, setOrigin] = useState<[number, number, number] | null>(null)
  const parts = useRef<{ p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; w: THREE.Vector3 }[]>([])
  const colors = useMemo(() => ['#ffd43b', '#00d2ff', '#ff6b6b', '#51cf66', '#ffffff', '#cc5de8'].map((c) => new THREE.Color(c)), [])
  const t0 = useRef(0)

  useEffect(() => {
    const on = (e: Event) => setOrigin((e as CustomEvent).detail)
    window.addEventListener('confetti', on)
    return () => window.removeEventListener('confetti', on)
  }, [])

  useEffect(() => {
    if (!origin || !ref.current) return
    t0.current = performance.now()
    parts.current = Array.from({ length: N }, () => ({
      p: new THREE.Vector3(...origin),
      v: new THREE.Vector3((Math.random() - 0.5) * 2.4, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 2.4),
      r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0),
      w: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
    }))
    for (let i = 0; i < N; i++) ref.current.setColorAt(i, colors[i % colors.length])
    ref.current.instanceColor!.needsUpdate = true
  }, [origin, colors])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const s = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  useFrame((_, dt) => {
    const im = ref.current
    if (!im || !origin) return
    const age = (performance.now() - t0.current) / 1000
    parts.current.forEach((pt, i) => {
      pt.v.y -= 6 * dt
      pt.v.multiplyScalar(0.985)
      pt.p.addScaledVector(pt.v, dt)
      if (pt.p.y < 0.01) {
        pt.p.y = 0.01
        pt.v.set(0, 0, 0)
      }
      pt.r.x += pt.w.x * dt
      pt.r.y += pt.w.y * dt
      q.setFromEuler(pt.r)
      s.setScalar(age > 4 ? Math.max(0, 1 - (age - 4)) : 1)
      m.compose(pt.p, q, s)
      im.setMatrixAt(i, m)
    })
    im.instanceMatrix.needsUpdate = true
    if (age > 5) setOrigin(null)
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} visible={!!origin}>
      <planeGeometry args={[0.025, 0.04]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.6} fog={false} />
    </instancedMesh>
  )
}
