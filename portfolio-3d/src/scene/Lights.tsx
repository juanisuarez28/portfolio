import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import * as THREE from 'three'
import { nightMix, reducedMotion } from '../lib/nightMix'
import { useAppStore } from '../store/useAppStore'

const DAY = {
  sun: new THREE.Color('#fff1dc'),
  sunIntensity: 2.6,
  hemiSky: new THREE.Color('#dbe9ff'),
  hemiGround: new THREE.Color('#b98d68'),
  hemi: 1.0,
  window: new THREE.Color('#ffe2b8'),
  windowIntensity: 6,
  bg: new THREE.Color('#e9d9c6'),
  env: 0.75,
}
const NIGHT = {
  sun: new THREE.Color('#7d93ff'),
  sunIntensity: 0.35,
  hemiSky: new THREE.Color('#3a4a80'),
  hemiGround: new THREE.Color('#1c1a2a'),
  hemi: 0.22,
  window: new THREE.Color('#8fb0ff'),
  windowIntensity: 2.5,
  bg: new THREE.Color('#0d1222'),
  env: 0.18,
}

const tmp = new THREE.Color()

/** Luces globales de la escena. Interpola entre día y noche (F09). */
export function Lights() {
  const night = useAppStore((s) => s.night)
  const quality = useAppStore((s) => s.quality)
  const scene = useThree((s) => s.scene)
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const windowLight = useRef<THREE.PointLight>(null)

  if (!(scene.background instanceof THREE.Color)) scene.background = DAY.bg.clone()

  useFrame((_, dt) => {
    easing.damp(nightMix, 'value', night ? 1 : 0, reducedMotion ? 0.05 : 0.35, dt)
    const n = nightMix.value
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(DAY.sunIntensity, NIGHT.sunIntensity, n)
      sun.current.color.lerpColors(DAY.sun, NIGHT.sun, n)
    }
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(DAY.hemi, NIGHT.hemi, n)
      hemi.current.color.lerpColors(DAY.hemiSky, NIGHT.hemiSky, n)
      hemi.current.groundColor.lerpColors(DAY.hemiGround, NIGHT.hemiGround, n)
    }
    if (windowLight.current) {
      windowLight.current.intensity = THREE.MathUtils.lerp(DAY.windowIntensity, NIGHT.windowIntensity, n)
      windowLight.current.color.lerpColors(DAY.window, NIGHT.window, n)
    }
    ;(scene.background as THREE.Color).copy(tmp.lerpColors(DAY.bg, NIGHT.bg, n))
    scene.environmentIntensity = THREE.MathUtils.lerp(DAY.env, NIGHT.env, n)
  })

  const mapSize = quality === 'high' ? 2048 : 1024

  return (
    <>
      <hemisphereLight ref={hemi} args={[DAY.hemiSky, DAY.hemiGround, DAY.hemi]} />
      <directionalLight
        ref={sun}
        position={[6, 9, 6.5]}
        intensity={DAY.sunIntensity}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={6}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      {/* luz que entra por la ventana */}
      <pointLight ref={windowLight} position={[-1.55, 1.9, -2.3]} intensity={DAY.windowIntensity} distance={6} decay={1.6} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9b0" position={[6, 2, 6]} rotation-y={Math.atan2(6, 6)} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#b9d4ff" position={[-6, 2, 3]} rotation-y={Math.atan2(-6, 3)} scale={[6, 4, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#00d2ff" position={[0, 3, -6]} scale={2} />
      </Environment>
    </>
  )
}
