import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { nightMix } from '../lib/nightMix'
import { useAppStore } from '../store/useAppStore'
import { WINDOW } from './layout'

/** Dirección de la luz que entra por la ventana (hacia adentro y abajo) */
export const BEAM_DIR = new THREE.Vector3(0.18, -0.55, 1).normalize()
const LENGTH = 3.7

const vert = /* glsl */ `
attribute vec3 beam; // x: a lo ancho (0..1), y: a lo alto (0..1), z: a lo largo (0..1)
varying vec3 vBeam;
void main() {
  vBeam = beam;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const frag = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vBeam;
void main() {
  float edge = smoothstep(0.0, 0.18, vBeam.x) * smoothstep(1.0, 0.82, vBeam.x) * smoothstep(0.0, 0.18, vBeam.y) * smoothstep(1.0, 0.82, vBeam.y);
  float fade = (1.0 - vBeam.z) * smoothstep(0.0, 0.08, vBeam.z);
  gl_FragColor = vec4(uColor, uOpacity * edge * fade);
}`

/** Haz de luz volumétrico + polvo flotando (F15) + luz real con sombras de la ventana */
export function SunBeam() {
  const quality = useAppStore((s) => s.quality)
  const { geo, corners } = useMemo(() => {
    const x0 = WINDOW.x - WINDOW.w / 2
    const x1 = WINDOW.x + WINDOW.w / 2
    const y0 = WINDOW.y - WINDOW.h / 2
    const y1 = WINDOW.y + WINDOW.h / 2
    const z = -3.0
    // malla del volumen: grilla en el sentido largo para que el degradé sea suave
    const segs = 12
    const pos: number[] = []
    const beam: number[] = []
    const idx: number[] = []
    const ring: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]
    for (let s = 0; s <= segs; s++) {
      const t = s / segs
      for (const [u, v] of ring) {
        const p = new THREE.Vector3(x0 + (x1 - x0) * u, y0 + (y1 - y0) * v, z).addScaledVector(BEAM_DIR, t * LENGTH)
        pos.push(p.x, p.y, p.z)
        beam.push(u, v, t)
      }
    }
    for (let s = 0; s < segs; s++)
      for (let k = 0; k < 4; k++) {
        const a = s * 4 + k
        const b = s * 4 + ((k + 1) % 4)
        idx.push(a, b, b + 4, a, b + 4, a + 4)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('beam', new THREE.Float32BufferAttribute(beam, 3))
    g.setIndex(idx)
    return { geo: g, corners: { x0, x1, y0, y1, z } }
  }, [])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: { uColor: { value: new THREE.Color('#ffe2b0') }, uOpacity: { value: 0.16 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  // polvo
  const N = 240
  const dust = useMemo(() => {
    const p = new Float32Array(N * 3)
    const seeds = Array.from({ length: N }, () => [Math.random(), Math.random(), Math.random(), Math.random() * 10])
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return { g, seeds }
  }, [])
  const dustMat = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const ctx = c.getContext('2d')!
    const gr = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gr.addColorStop(0, 'rgba(255,255,255,1)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gr
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.PointsMaterial({
      map: new THREE.CanvasTexture(c),
      size: 0.022,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: '#fff1d0',
      fog: false,
    })
  }, [])

  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(WINDOW.x, WINDOW.y, WINDOW.z).addScaledVector(BEAM_DIR, 3.2)
    return o
  }, [])
  const lightPos = useMemo(() => new THREE.Vector3(WINDOW.x, WINDOW.y, WINDOW.z).addScaledVector(BEAM_DIR, -7), [])
  const day = useMemo(() => new THREE.Color('#ffd9a3'), [])
  const moon = useMemo(() => new THREE.Color('#9db4ff'), [])

  const fade = useRef(1)
  useFrame(({ clock }, dt) => {
    const n = nightMix.value
    // al asomarse a la ventana la cámara queda dentro del haz: se oculta para que no encandile
    fade.current = THREE.MathUtils.damp(fade.current, useAppStore.getState().focus === 'window' ? 0 : 1, 6, dt)
    mat.uniforms.uOpacity.value = (0.16 * (1 - n) + 0.05 * n) * fade.current
    mat.uniforms.uColor.value.lerpColors(day, moon, n)
    dustMat.opacity = (0.75 * (1 - n) + 0.25 * n) * fade.current
    dustMat.color.lerpColors(day, moon, n)
    if (light.current) {
      light.current.intensity = 9 * (1 - n) + 2 * n
      light.current.color.lerpColors(day, moon, n)
    }
    const t = clock.elapsedTime
    const pos = dust.g.attributes.position as THREE.BufferAttribute
    const { x0, x1, y0, y1, z } = corners
    dust.seeds.forEach(([u, v, w, ph], i) => {
      const uu = (u + Math.sin(t * 0.07 + ph) * 0.08 + 1) % 1
      const vv = (v + t * 0.008 + Math.sin(t * 0.11 + ph) * 0.05 + 1) % 1
      const ww = 0.08 + ((w + t * 0.004) % 1) * 0.85
      pos.setXYZ(
        i,
        x0 + (x1 - x0) * uu + BEAM_DIR.x * ww * LENGTH,
        y0 + (y1 - y0) * vv + BEAM_DIR.y * ww * LENGTH,
        z + BEAM_DIR.z * ww * LENGTH,
      )
    })
    pos.needsUpdate = true
  })

  const mapSize = quality === 'high' ? 1024 : 512
  return (
    <group>
      <mesh geometry={geo} material={mat} renderOrder={5} />
      <points geometry={dust.g} material={dustMat} renderOrder={6} />
      <primitive object={target} />
      <spotLight
        ref={light}
        position={lightPos}
        target={target}
        angle={0.2}
        penumbra={0.25}
        distance={16}
        decay={1.2}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
    </group>
  )
}
