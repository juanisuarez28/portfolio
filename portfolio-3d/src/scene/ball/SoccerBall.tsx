import { useMemo } from 'react'
import * as THREE from 'three'

/** Pelota de fútbol: 12 pentágonos negros en los vértices de un icosaedro sobre una esfera blanca. */
export function SoccerBall({ radius }: { radius: number }) {
  const patches = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 0)
    const pos = ico.getAttribute('position')
    const seen: THREE.Vector3[] = []
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize()
      if (!seen.some((s) => s.distanceTo(v) < 0.01)) seen.push(v)
    }
    return seen.map((v) => ({
      p: v.clone().multiplyScalar(radius * 0.992),
      q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v),
    }))
  }, [radius])
  const patchGeo = useMemo(() => {
    // pentágono levemente curvo para que acompañe la esfera
    const g = new THREE.CircleGeometry(radius * 0.25, 5, Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const y = p.getY(i)
      p.setZ(i, -(x * x + y * y) / (2 * radius))
    }
    g.computeVertexNormals()
    return g
  }, [radius])
  return (
    <group>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 40, 28]} />
        <meshPhysicalMaterial color="#f7f7f2" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} fog={false} />
      </mesh>
      {patches.map((pt, i) => (
        <mesh key={i} position={pt.p} quaternion={pt.q} geometry={patchGeo}>
          <meshPhysicalMaterial color="#16181c" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} polygonOffset polygonOffsetFactor={-2} fog={false} />
        </mesh>
      ))}
    </group>
  )
}
