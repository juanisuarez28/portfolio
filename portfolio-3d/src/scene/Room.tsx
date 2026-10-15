import { useMemo } from 'react'
import { rugTexture, woodFloorTexture } from '../lib/canvasTextures'
import { palette } from '../lib/palette'
import { Block } from './primitives'
import { WindowView } from './WindowView'

export const ROOM = {
  size: 6,
  height: 3.4,
  wall: 0.2,
  window: { x: -1.55, y: 1.8, w: 1.4, h: 1.3 },
}

/** Losa, paredes con hueco de ventana, zócalos, ventana, cortinas y alfombra. */
export function Room() {
  const floor = useMemo(() => woodFloorTexture(), [])
  const rug = useMemo(() => rugTexture(), [])
  const { height: H, wall: T, window: win } = ROOM
  const half = ROOM.size / 2

  const winLeft = win.x - win.w / 2
  const winRight = win.x + win.w / 2
  const winBottom = win.y - win.h / 2
  const winTop = win.y + win.h / 2
  const backZ = -half - T / 2
  const wallX0 = -half - T

  return (
    <group>
      {/* losa */}
      <Block size={[ROOM.size + T, 0.3, ROOM.size + T]} position={[-T / 2, -0.15, -T / 2]} color={palette.slab} radius={0.03} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[ROOM.size, ROOM.size]} />
        <meshStandardMaterial map={floor} roughness={0.55} />
      </mesh>

      {/* pared del fondo con hueco de ventana */}
      <group>
        <Block size={[winLeft - wallX0, H, T]} position={[(wallX0 + winLeft) / 2, H / 2, backZ]} color={palette.wall} radius={0.005} />
        <Block size={[half - winRight, H, T]} position={[(winRight + half) / 2, H / 2, backZ]} color={palette.wall} radius={0.005} />
        <Block size={[win.w, winBottom, T]} position={[win.x, winBottom / 2, backZ]} color={palette.wall} radius={0.005} />
        <Block size={[win.w, H - winTop, T]} position={[win.x, (winTop + H) / 2, backZ]} color={palette.wall} radius={0.005} />
      </group>

      {/* pared izquierda */}
      <Block size={[T, H, ROOM.size]} position={[-half - T / 2, H / 2, 0]} color={palette.wallLeft} radius={0.005} />

      {/* zócalos */}
      <Block size={[ROOM.size, 0.09, 0.02]} position={[0, 0.045, -half + 0.01]} color={palette.baseboard} radius={0.004} />
      <Block size={[0.02, 0.09, ROOM.size]} position={[-half + 0.01, 0.045, 0]} color={palette.baseboard} radius={0.004} />

      <Window x={win.x} y={win.y} w={win.w} h={win.h} z={-half} />
      <WindowView />

      {/* alfombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.006, 0.55]} receiveShadow>
        <planeGeometry args={[2.7, 1.8]} />
        <meshStandardMaterial map={rug} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Window({ x, y, w, h, z }: { x: number; y: number; w: number; h: number; z: number }) {
  const f = 0.06
  const depth = ROOM.wall + 0.04
  const zc = z - ROOM.wall / 2
  return (
    <group>
      {/* marco */}
      <Block size={[w + f, f, depth]} position={[x, y + h / 2, zc]} color={palette.white} radius={0.01} />
      <Block size={[w + f, f, depth]} position={[x, y - h / 2, zc]} color={palette.white} radius={0.01} />
      <Block size={[f, h, depth]} position={[x - w / 2, y, zc]} color={palette.white} radius={0.01} />
      <Block size={[f, h, depth]} position={[x + w / 2, y, zc]} color={palette.white} radius={0.01} />
      {/* parteluces */}
      <Block size={[0.03, h, 0.04]} position={[x, y, zc]} color={palette.white} radius={0.008} />
      <Block size={[w, 0.03, 0.04]} position={[x, y + 0.12, zc]} color={palette.white} radius={0.008} />
      {/* alféizar */}
      <Block size={[w + 0.24, 0.05, 0.22]} position={[x, y - h / 2 - 0.02, z + 0.08]} color={palette.white} radius={0.015} />
      {/* vidrio */}
      <mesh position={[x, y, zc]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#cfe8ff" transparent opacity={0.08} roughness={0.05} metalness={0} />
      </mesh>
      {/* cortinas + barral */}
      <Block size={[w + 0.9, 0.03, 0.03]} position={[x, y + h / 2 + 0.22, z + 0.12]} color={palette.woodDark} radius={0.012} metalness={0.3} />
      {[-1, 1].map((side) => (
        <group key={side} position={[x + side * (w / 2 + 0.24), y - 0.1, z + 0.12]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[(i - 1.5) * 0.075, 0, Math.sin(i * 1.7) * 0.025]} castShadow receiveShadow>
              <cylinderGeometry args={[0.045, 0.05, 1.75, 12]} />
              <meshStandardMaterial color={palette.fabricTerracotta} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
