import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { audio } from '../../lib/audio'
import { useAppStore } from '../../store/useAppStore'
import { TV } from '../layout'
import { CHANNELS, drawOsd, drawStatic, TV_H, TV_W } from './channels'
import { PenaltyGame } from './penalties'

/** Instancia compartida del juego de penales: el overlay DOM le pasa el puntero (F20). */
export const penalty: { game: PenaltyGame; canvas: HTMLCanvasElement | null } = {
  canvas: null,
  game: new PenaltyGame({
    onShot: (o) => {
      audio.play(o === 'gol' ? 'goal' : o === 'atajada' ? 'save' : 'bounce')
    },
    onEnd: (won) => {
      audio.play('whistle')
      if (won) useAppStore.getState().unlock('penalties')
    },
  }),
}

/** Pantalla de la tele (F19): canales, estática al hacer zapping, penales y luz de color en la habitación. */
export function TvScreen({ screen }: { screen?: THREE.Mesh }) {
  const channel = useAppStore((s) => s.tvChannel)
  const playing = useAppStore((s) => s.focus === 'penalties')
  const { canvas, ctx, tex } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TV_W
    canvas.height = TV_H
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    return { canvas, ctx: canvas.getContext('2d')!, tex }
  }, [])
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0a0c10', roughness: 0.55, metalness: 0, envMapIntensity: 0.3, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0, toneMapped: false, fog: false }),
    [tex],
  )
  const light = useRef<THREE.PointLight>(null)
  const staticUntil = useRef(0)
  const t0 = useRef(0)
  const glow = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    if (screen) screen.material = mat
    // el overlay de mobile muestra este mismo canvas en grande
    penalty.canvas = canvas
  }, [screen, mat, canvas])

  useEffect(() => {
    if (channel > 0) staticUntil.current = performance.now() + 320
    audio.setRadio(channel === 3)
    if (channel === 4) useAppStore.getState().showToast({ text: 'Canal de juegos: hacé clic en la tele para patear penales 🥅', ms: 3200 })
  }, [channel])

  useEffect(() => {
    if (playing) penalty.game.reset()
  }, [playing])

  useFrame(({ clock }, dt) => {
    const on = channel > 0 || playing
    mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, on ? 1.05 : 0, 8, dt)
    if (light.current) light.current.intensity = THREE.MathUtils.damp(light.current.intensity, on ? 2.2 : 0, 6, dt)
    if (!on) return
    const t = clock.elapsedTime - t0.current
    if (playing) {
      penalty.game.update(Math.min(dt, 0.05))
      penalty.game.draw(ctx)
      glow.set('#2f9e44')
    } else if (performance.now() < staticUntil.current) {
      drawStatic(ctx, channel)
      glow.set('#bbbbbb')
    } else {
      const ch = CHANNELS[channel - 1]
      ch.draw(ctx, t, audio.radioLevel())
      if (performance.now() < staticUntil.current + 1500) drawOsd(ctx, channel)
      glow.set(ch.glow)
    }
    if (light.current) light.current.color.lerp(glow, Math.min(1, dt * 4))
    tex.needsUpdate = true
  })

  return <pointLight ref={light} position={[TV.x + 0.6, TV.y, TV.z]} distance={3.5} decay={1.6} intensity={0} />
}
