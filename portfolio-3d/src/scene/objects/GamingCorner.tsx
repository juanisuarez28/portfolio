import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FONT } from '../../lib/canvasTextures'
import { palette } from '../../lib/palette'
import { useAppStore } from '../../store/useAppStore'
import { Interactive } from '../Interactive'
import { Block } from '../primitives'

const STAND = { x: -2.76, z: -1.3, w: 1.5, d: 0.44, h: 0.42 }

/** Partidito pixelado que se dibuja en la TV cuando está prendida */
function useTvGame() {
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.magFilter = THREE.NearestFilter
    return { canvas, tex }
  }, [])
  const state = useRef({ bx: 160, by: 90, vx: 95, vy: 60, p1: 90, p2: 90, s1: 0, s2: 0 })

  const draw = (dt: number) => {
    const ctx = canvas.getContext('2d')!
    const s = state.current
    const W = canvas.width
    const H = canvas.height
    s.bx += s.vx * dt
    s.by += s.vy * dt
    if (s.by < 14 || s.by > H - 14) s.vy *= -1
    // los jugadores siguen la pelota con algo de retraso
    s.p1 += (s.by - s.p1) * Math.min(1, dt * 3.2)
    s.p2 += (s.by - s.p2) * Math.min(1, dt * 2.6)
    if (s.bx < 30 && Math.abs(s.by - s.p1) < 22) s.vx = Math.abs(s.vx)
    if (s.bx > W - 30 && Math.abs(s.by - s.p2) < 22) s.vx = -Math.abs(s.vx)
    if (s.bx < 0 || s.bx > W) {
      if (s.bx < 0) s.s2++
      else s.s1++
      Object.assign(s, { bx: W / 2, by: H / 2, vx: (Math.random() > 0.5 ? 1 : -1) * 95, vy: (Math.random() - 0.5) * 140 })
    }
    // cancha
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#2f9e44' : '#37b24d'
      ctx.fillRect((i * W) / 8, 0, W / 8, H)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.strokeRect(6, 6, W - 12, H - 12)
    ctx.beginPath()
    ctx.moveTo(W / 2, 6)
    ctx.lineTo(W / 2, H - 6)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 24, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeRect(6, H / 2 - 36, 30, 72)
    ctx.strokeRect(W - 36, H / 2 - 36, 30, 72)
    // jugadores
    ctx.fillStyle = '#1f6fd1'
    ctx.fillRect(22, s.p1 - 10, 8, 20)
    ctx.fillStyle = '#e03131'
    ctx.fillRect(W - 30, s.p2 - 10, 8, 20)
    // pelota
    ctx.fillStyle = '#fff'
    ctx.fillRect(s.bx - 3, s.by - 3, 6, 6)
    // marcador
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(W / 2 - 46, 10, 92, 22)
    ctx.fillStyle = '#fff'
    ctx.font = `700 15px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(`JUA ${s.s1} - ${s.s2} CPU`, W / 2, 26)
    tex.needsUpdate = true
  }
  return { tex, draw }
}

/** Rincón gamer: mueble, TV en la pared, consola, joystick y puff. Click → prende la TV (F10). */
export function GamingCorner() {
  const tvOn = useAppStore((s) => s.tvOn)
  const toggleTv = useAppStore((s) => s.toggleTv)
  const showToast = useAppStore((s) => s.showToast)
  const { tex, draw } = useTvGame()
  const screen = useRef<THREE.MeshStandardMaterial>(null)
  const tvLight = useRef<THREE.PointLight>(null)

  useEffect(() => {
    if (tvOn) showToast('🎮 ¡Partidito encendido! Juani vs CPU')
  }, [tvOn, showToast])

  useFrame((_, dt) => {
    if (tvOn) draw(Math.min(dt, 0.05))
    if (screen.current) {
      screen.current.emissiveIntensity = THREE.MathUtils.damp(screen.current.emissiveIntensity, tvOn ? 1.1 : 0, 6, dt)
    }
    if (tvLight.current) tvLight.current.intensity = THREE.MathUtils.damp(tvLight.current.intensity, tvOn ? 1.8 : 0, 6, dt)
  })

  const { x, z, w, d, h } = STAND
  return (
    <Interactive id="console" label="Consola" onSelect={toggleTv}>
      {/* mueble bajo */}
      <group position={[x, 0, z]}>
        <Block size={[d, h, w]} position={[0, h / 2 + 0.04, 0]} color={palette.woodDark} radius={0.015} />
        {[-1, 1].map((s) => (
          <Block key={s} size={[0.04, 0.04, 0.04]} position={[-0.15, 0.02, s * (w / 2 - 0.06)]} color={palette.black} radius={0.01} />
        ))}
        {[-1, 0, 1].map((i) => (
          <Block key={i} size={[0.01, h - 0.06, w / 3 - 0.04]} position={[d / 2 + 0.001, h / 2 + 0.04, i * (w / 3)]} color={palette.wood} radius={0.004} />
        ))}
        {/* consola */}
        <group position={[0.02, h + 0.04, -0.35]}>
          <Block size={[0.26, 0.07, 0.32]} position={[0, 0.035, 0]} color={palette.white} radius={0.02} roughness={0.35} />
          <Block size={[0.27, 0.02, 0.33]} position={[0, 0.035, 0]} color={palette.black} radius={0.008} />
          <mesh position={[0.131, 0.05, 0.1]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.012, 0.012]} />
            <meshStandardMaterial color="#000" emissive={palette.accent} emissiveIntensity={3} toneMapped={false} />
          </mesh>
        </group>
        {/* joystick */}
        <group position={[0.05, h + 0.06, 0.25]} rotation={[0, -0.6, 0]}>
          <Block size={[0.16, 0.04, 0.09]} color={palette.black} radius={0.02} roughness={0.4} />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.065, -0.005, 0.03]} scale={[0.03, 0.03, 0.05]} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={palette.black} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0.03, 0.022, 0]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial color="#e03131" />
          </mesh>
        </group>
        {/* parlante */}
        <Block size={[0.16, 0.26, 0.16]} position={[0, h + 0.17, 0.58]} color={palette.black} radius={0.02} />
      </group>

      {/* TV en la pared */}
      <group position={[-3 + 0.04, 1.32, z]} rotation={[0, Math.PI / 2, 0]}>
        <Block size={[1.12, 0.66, 0.045]} color={palette.black} radius={0.012} roughness={0.3} />
        <mesh position={[0, 0, 0.0231]}>
          <planeGeometry args={[1.08, 0.61]} />
          <meshStandardMaterial
            ref={screen}
            color="#0a0c10"
            roughness={0.18}
            metalness={0.2}
            emissiveMap={tex}
            emissive="#ffffff"
            emissiveIntensity={0}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight ref={tvLight} position={[-2.5, 1.3, z]} color="#7ee0a0" distance={3} intensity={0} />

      {/* puff */}
      <mesh position={[-1.75, 0.2, -1.05]} scale={[0.36, 0.22, 0.36]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={palette.fabricMustard} roughness={0.95} />
      </mesh>
    </Interactive>
  )
}
