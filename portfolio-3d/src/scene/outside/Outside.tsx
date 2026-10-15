import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { rng } from '../../lib/canvasTextures'
import { nightMix } from '../../lib/nightMix'
import { WINDOW } from '../layout'

/**
 * Paisaje de Tandil detrás de la ventana (F16): sierras con textura real, la Piedra Movediza, barrio, cielo y nubes.
 * Todo usa stencil: solo se dibuja donde la máscara de la ventana marcó el buffer, así no se asoma por fuera del diorama.
 */
export const STENCIL_REF = 1
const MASK_PROPS = {
  stencilWrite: true,
  stencilRef: STENCIL_REF,
  stencilFunc: THREE.EqualStencilFunc,
  stencilFail: THREE.KeepStencilOp,
  stencilZFail: THREE.KeepStencilOp,
  stencilZPass: THREE.KeepStencilOp,
}
const GROUND_Y = -7.5 // la habitación está en un segundo piso: se ve por encima de los techos

function masked<T extends THREE.Material>(m: T): T {
  Object.assign(m, MASK_PROPS)
  return m
}

// ───────────── ruido para el terreno ─────────────
function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function noise(x: number, z: number) {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const d = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x: number, z: number) {
  let s = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < 5; i++) {
    s += a * noise(x * f, z * f)
    a *= 0.5
    f *= 2.03
  }
  return s
}
const PIEDRA = { x: -30, z: -115 }
/** altura del terreno en (x, z) del mundo */
export function terrainHeight(x: number, z: number) {
  const dist = -z
  const town = 0.25 * fbm(x * 0.08, z * 0.08)
  // lomas suaves detrás del barrio y sierras redondeadas en la distancia, típicas de Tandil
  const hills = THREE.MathUtils.smoothstep(dist, 55, 90) * (2 + 5 * fbm(x * 0.03, z * 0.03))
  const ramp = THREE.MathUtils.smoothstep(dist, 95, 150)
  const ridges = 10 + 22 * Math.pow(fbm(x * 0.012 + 3, z * 0.02), 1.4) + 10 * Math.abs(Math.sin(x * 0.018 + fbm(x * 0.03, 1) * 2))
  // cerro de la Piedra Movediza
  const dp = Math.hypot(x - PIEDRA.x, z - PIEDRA.z)
  const piedraHill = 22 * Math.exp(-(dp * dp) / 700)
  return GROUND_Y + town + hills + ramp * ridges + piedraHill
}

function Mask() {
  return (
    <mesh position={[WINDOW.x, WINDOW.y, WINDOW.z]} renderOrder={-10}>
      <planeGeometry args={[WINDOW.w, WINDOW.h]} />
      <meshBasicMaterial
        colorWrite={false}
        depthWrite={false}
        stencilWrite
        stencilRef={STENCIL_REF}
        stencilFunc={THREE.AlwaysStencilFunc}
        stencilZPass={THREE.ReplaceStencilOp}
      />
    </mesh>
  )
}

// ───────────── cielo ─────────────
const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const skyFrag = /* glsl */ `
uniform float uNight;
uniform vec3 uSun;
varying vec3 vDir;
float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
void main() {
  float h = clamp(vDir.y, -0.1, 1.0);
  vec3 dayTop = vec3(0.25, 0.5, 0.85);
  vec3 dayHor = vec3(0.78, 0.86, 0.93);
  vec3 nightTop = vec3(0.01, 0.02, 0.06);
  vec3 nightHor = vec3(0.07, 0.1, 0.2);
  vec3 col = mix(mix(dayHor, dayTop, pow(max(h, 0.0), 0.5)), mix(nightHor, nightTop, pow(max(h, 0.0), 0.6)), uNight);
  // sol / luna
  float d = max(dot(normalize(vDir), normalize(uSun)), 0.0);
  col += mix(vec3(1.0, 0.85, 0.6) * (pow(d, 900.0) * 1.6 + pow(d, 14.0) * 0.12), vec3(0.85, 0.9, 1.0) * pow(d, 2000.0) * 3.0, uNight);
  // estrellas
  vec3 p = floor(vDir * 420.0);
  float s = step(0.9975, hash(p)) * smoothstep(0.05, 0.3, h);
  col += vec3(s) * uNight * 1.4;
  gl_FragColor = vec4(col, 1.0);
}`

function Sky() {
  const mat = useMemo(
    () =>
      masked(
        new THREE.ShaderMaterial({
          vertexShader: skyVert,
          fragmentShader: skyFrag,
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: { uNight: { value: 0 }, uSun: { value: new THREE.Vector3(0.7, 0.32, -1) } },
        }),
      ),
    [],
  )
  useFrame(() => {
    mat.uniforms.uNight.value = nightMix.value
  })
  return (
    <mesh material={mat} position={[WINDOW.x, 0, -3]} renderOrder={-5}>
      <sphereGeometry args={[340, 48, 24]} />
    </mesh>
  )
}

// ───────────── terreno ─────────────
function Terrain() {
  const [diff, nor] = useTexture(['/textures/aerial_grass_rock_diff.webp', '/textures/aerial_grass_rock_nor.webp'])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(480, 330, 220, 150)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -158)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = terrainHeight(x, z)
      pos.setY(i, y)
      // más roca arriba de las sierras, pasto más verde abajo
      const rock = THREE.MathUtils.smoothstep(y - GROUND_Y, 14, 34)
      c.setRGB(0.95 - rock * 0.1, 1.0 - rock * 0.15, 0.85 - rock * 0.05)
      c.toArray(colors, i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
  const mat = useMemo(() => {
    const d = diff.clone()
    d.wrapS = d.wrapT = THREE.RepeatWrapping
    d.repeat.set(24, 16)
    d.colorSpace = THREE.SRGBColorSpace
    d.needsUpdate = true
    const n = nor.clone()
    n.wrapS = n.wrapT = THREE.RepeatWrapping
    n.repeat.set(24, 16)
    n.needsUpdate = true
    return masked(new THREE.MeshStandardMaterial({ map: d, normalMap: n, vertexColors: true, roughness: 1, color: '#b9c79c' }))
  }, [diff, nor])
  return <mesh geometry={geo} material={mat} receiveShadow />
}

// ───────────── Piedra Movediza ─────────────
function Piedra() {
  const [diff, nor] = useTexture(['/textures/dry_ground_rocks_diff.webp', '/textures/dry_ground_rocks_nor.webp'])
  const { rock, outcrop, top } = useMemo(() => {
    const mk = (r: number, seed: number, sy: number) => {
      const g = new THREE.IcosahedronGeometry(r, 4)
      const p = g.attributes.position
      const v = new THREE.Vector3()
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i)
        const n = 1 + 0.18 * (fbm(v.x * 0.9 + seed, v.z * 0.9 + v.y) - 0.5)
        v.multiplyScalar(n)
        v.y *= sy
        p.setXYZ(i, v.x, v.y, v.z)
      }
      g.computeVertexNormals()
      return g
    }
    const top = terrainHeight(PIEDRA.x, PIEDRA.z)
    return { rock: mk(4.2, 1, 0.78), outcrop: mk(8, 5, 0.42), top }
  }, [])
  const mat = useMemo(() => {
    const d = diff.clone()
    d.colorSpace = THREE.SRGBColorSpace
    d.needsUpdate = true
    return masked(new THREE.MeshStandardMaterial({ map: d, normalMap: nor, roughness: 0.95, color: '#a6a39d' }))
  }, [diff, nor])
  return (
    <group position={[PIEDRA.x, top, PIEDRA.z]}>
      <mesh geometry={outcrop} material={mat} position={[1, -1.2, 0]} />
      {/* la piedra apoyada en el borde, levemente inclinada */}
      <mesh geometry={rock} material={mat} position={[2.2, 4.0, 1.8]} rotation={[0.1, 0.4, -0.35]} />
    </group>
  )
}

// ───────────── barrio ─────────────
interface House {
  x: number
  z: number
  w: number
  h: number
  d: number
  ry: number
  flat: boolean
  wall: string
  roof: string
}

function useHouses() {
  return useMemo(() => {
    const r = rng(21)
    const houses: House[] = []
    const walls = ['#f1ece2', '#e9dcc6', '#f3e1d3', '#d9d2c5', '#efe7d6', '#e4c9a8', '#cfd8dc']
    for (let row = 0; row < 4; row++) {
      for (let col = -9; col <= 9; col++) {
        if (r() < 0.18) continue
        const x = col * 9 + (r() - 0.5) * 3
        const z = -14 - row * 11 - (r() - 0.5) * 2
        houses.push({
          x,
          z,
          w: 5 + r() * 3,
          h: 2.8 + (r() < 0.3 ? 2.8 : 0) + r() * 0.6,
          d: 6 + r() * 3,
          ry: (r() - 0.5) * 0.08,
          flat: r() < 0.6,
          wall: walls[Math.floor(r() * walls.length)],
          roof: r() < 0.5 ? '#b5523b' : '#9b4a35',
        })
      }
    }
    return houses
  }, [])
}

/** Fachada simple (ventanas + puerta) que se tiñe con el color de cada casa */
function facadeTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(0, 118, 128, 10)
  const win = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#e9e4da'
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6)
    ctx.fillStyle = '#3d4b5c'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillRect(x, y, w / 2, h)
  }
  win(16, 30, 26, 30)
  win(86, 30, 26, 30)
  ctx.fillStyle = '#6b4630'
  ctx.fillRect(52, 70, 24, 48)
  win(16, 78, 26, 24)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Neighborhood() {
  const houses = useHouses()
  const bodies = useRef<THREE.InstancedMesh>(null)
  const roofs = useRef<THREE.InstancedMesh>(null)
  const tanks = useRef<THREE.InstancedMesh>(null)
  const lit = useRef<THREE.InstancedMesh>(null)
  const roofGeo = useMemo(() => {
    // prisma a dos aguas de 1×1×1
    const s = new THREE.Shape()
    s.moveTo(-0.5, 0)
    s.lineTo(0.5, 0)
    s.lineTo(0, 0.55)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false })
    g.translate(0, 0, -0.5)
    return g
  }, [])
  const mats = useMemo(
    () => ({
      body: masked(new THREE.MeshStandardMaterial({ roughness: 0.9, map: facadeTexture() })),
      roof: masked(new THREE.MeshStandardMaterial({ roughness: 0.8 })),
      tank: masked(new THREE.MeshStandardMaterial({ color: '#2f3a44', roughness: 0.5, metalness: 0.3 })),
      win: masked(new THREE.MeshBasicMaterial({ color: '#ffcf7a', transparent: true, opacity: 0, toneMapped: false })),
    }),
    [],
  )
  const flats = houses.filter((h) => h.flat)
  const gables = houses.filter((h) => !h.flat)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    houses.forEach((h, i) => {
      const y = terrainHeight(h.x, h.z)
      q.setFromEuler(new THREE.Euler(0, h.ry, 0))
      m.compose(new THREE.Vector3(h.x, y + h.h / 2, h.z), q, new THREE.Vector3(h.w, h.h, h.d))
      bodies.current!.setMatrixAt(i, m)
      bodies.current!.setColorAt(i, c.set(h.wall))
    })
    gables.forEach((h, i) => {
      const y = terrainHeight(h.x, h.z) + h.h
      q.setFromEuler(new THREE.Euler(0, h.ry + Math.PI / 2, 0))
      m.compose(new THREE.Vector3(h.x, y, h.z), q, new THREE.Vector3(h.d + 0.4, h.w * 0.9, h.w + 0.4))
      roofs.current!.setMatrixAt(i, m)
      roofs.current!.setColorAt(i, c.set(h.roof))
    })
    flats.forEach((h, i) => {
      const y = terrainHeight(h.x, h.z) + h.h
      m.compose(new THREE.Vector3(h.x + h.w * 0.25, y + 0.55, h.z - h.d * 0.2), q.identity(), new THREE.Vector3(1, 1, 1))
      tanks.current!.setMatrixAt(i, m)
    })
    // ventanas encendidas de noche (frente que mira a la habitación)
    const r = rng(5)
    let k = 0
    houses.forEach((h) => {
      const y = terrainHeight(h.x, h.z)
      const floors = h.h > 4 ? 2 : 1
      for (let f = 0; f < floors; f++)
        for (let w = 0; w < 2; w++) {
          if (r() < 0.45) continue
          m.compose(new THREE.Vector3(h.x - h.w * 0.25 + w * h.w * 0.5, y + 1.4 + f * 2.8, h.z + h.d / 2 + 0.02), q.identity(), new THREE.Vector3(0.9, 1, 1))
          lit.current!.setMatrixAt(k++, m)
        }
    })
    lit.current!.count = k
    for (const im of [bodies, roofs, tanks, lit]) {
      im.current!.instanceMatrix.needsUpdate = true
      if (im.current!.instanceColor) im.current!.instanceColor.needsUpdate = true
    }
  }, [houses, gables, flats])

  useFrame(() => {
    mats.win.opacity = nightMix.value
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, mats.body, houses.length]} receiveShadow>
        <boxGeometry />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[roofGeo, mats.roof, gables.length]} />
      <instancedMesh ref={tanks} args={[undefined, mats.tank, flats.length]}>
        <cylinderGeometry args={[0.55, 0.55, 1.1, 12]} />
      </instancedMesh>
      <instancedMesh ref={lit} args={[undefined, mats.win, 400]}>
        <planeGeometry args={[0.8, 1]} />
      </instancedMesh>
    </group>
  )
}

function Trees() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const trunks = useRef<THREE.InstancedMesh>(null)
  const N = 260
  const mat = useMemo(() => masked(new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true })), [])
  const trunkMat = useMemo(() => masked(new THREE.MeshStandardMaterial({ color: '#5b4330', roughness: 1 })), [])
  useLayoutEffect(() => {
    const r = rng(9)
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const q = new THREE.Quaternion()
    for (let i = 0; i < N; i++) {
      const x = (r() - 0.5) * 180
      const z = -12 - r() * 70
      // nada de árboles pegados a la ventana
      if (Math.abs(x - WINDOW.x) < 14 && z > -20) continue
      const y = terrainHeight(x, z)
      const s = 1.1 + r() * 1.5
      m.compose(new THREE.Vector3(x, y + s * 1.1, z), q, new THREE.Vector3(s, s * (1 + r() * 0.5), s))
      ref.current!.setMatrixAt(i, m)
      ref.current!.setColorAt(i, c.setHSL(0.27 + r() * 0.06, 0.35 + r() * 0.2, 0.22 + r() * 0.12))
      m.compose(new THREE.Vector3(x, y + s * 0.3, z), q, new THREE.Vector3(s * 0.12, s * 0.6, s * 0.12))
      trunks.current!.setMatrixAt(i, m)
    }
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.instanceColor!.needsUpdate = true
    trunks.current!.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, mat, N]}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, trunkMat, N]}>
        <cylinderGeometry args={[0.5, 0.7, 1, 6]} />
      </instancedMesh>
    </group>
  )
}

/** Luces de calle (solo de noche) */
function StreetLights() {
  const geo = useMemo(() => {
    const pts: number[] = []
    for (let row = 0; row < 4; row++)
      for (let i = -12; i <= 12; i++) {
        const x = i * 7 + 2
        const z = -9 - row * 11
        pts.push(x, terrainHeight(x, z) + 4, z)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  const mat = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,220,150,1)')
    g.addColorStop(0.25, 'rgba(255,190,110,0.6)')
    g.addColorStop(1, 'rgba(255,170,90,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    return masked(new THREE.PointsMaterial({ map: t, size: 2.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false }))
  }, [])
  useFrame(() => {
    mat.opacity = nightMix.value
  })
  return <points geometry={geo} material={mat} />
}

/** Nubes: billboards suaves que se desplazan lento */
function Clouds() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    const r = rng(4)
    for (let i = 0; i < 26; i++) {
      const x = 40 + r() * 176
      const y = 50 + r() * 40
      const rad = 18 + r() * 30
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
      g.addColorStop(0, 'rgba(255,255,255,0.85)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 256, 128)
    }
    return new THREE.CanvasTexture(c)
  }, [])
  const clouds = useMemo(() => {
    const r = rng(12)
    return Array.from({ length: 10 }, () => ({ x: (r() - 0.5) * 360, y: 55 + r() * 40, z: -200 - r() * 90, s: 50 + r() * 50, v: 0.8 + r() }))
  }, [])
  const group = useRef<THREE.Group>(null)
  const mat = useMemo(() => masked(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })), [tex])
  useFrame((_, dt) => {
    group.current?.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt
      if (c.position.x > 200) c.position.x = -200
    })
    const n = nightMix.value
    mat.color.setRGB(1 - n * 0.75, 1 - n * 0.72, 1 - n * 0.6)
    mat.opacity = 0.9 - n * 0.4
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <sprite key={i} material={mat} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.5, 1]} />
      ))}
    </group>
  )
}

/** Niebla de distancia solo para el exterior (el interior tiene `fog: false`) */
function Fog() {
  const fog = useMemo(() => new THREE.Fog('#c9d9e8', 60, 360), [])
  const day = useMemo(() => new THREE.Color('#c9d9e8'), [])
  const night = useMemo(() => new THREE.Color('#0d1530'), [])
  useFrame(({ scene }) => {
    if (scene.fog !== fog) scene.fog = fog
    fog.color.lerpColors(day, night, nightMix.value)
  })
  return null
}

export function Outside() {
  return (
    <group>
      <Mask />
      <Fog />
      <Sky />
      <Terrain />
      <Piedra />
      <Neighborhood />
      <Trees />
      <StreetLights />
      <Clouds />
    </group>
  )
}

useTexture.preload(['/textures/aerial_grass_rock_diff.webp', '/textures/aerial_grass_rock_nor.webp', '/textures/dry_ground_rocks_diff.webp', '/textures/dry_ground_rocks_nor.webp'])
