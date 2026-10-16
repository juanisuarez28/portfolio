import { Bloom, DepthOfField, EffectComposer, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { currentView, useAppStore } from '../store/useAppStore'
import { PRESETS, FOCUS_PRESETS } from './cameraPresets'

/**
 * Postprocesado (F03 + F15). El AO viene horneado de Blender (F13), así que no hace falta N8AO.
 * - Vista general: tilt-shift (efecto maqueta).
 * - Con una sección enfocada: desenfoque del fondo con foco en el objeto.
 * En calidad baja se omite el desenfoque de profundidad (lo más caro) y el tilt-shift usa menos muestras (F11, F25).
 */
export function Effects() {
  const quality = useAppStore((s) => s.quality)
  const view = useAppStore(currentView)
  const settled = useAppStore((s) => s.cameraSettled)
  const high = quality === 'high'
  const preset = view ? (view in PRESETS ? PRESETS[view as keyof typeof PRESETS] : FOCUS_PRESETS[view as keyof typeof FOCUS_PRESETS]) : null
  const dof = high && preset && settled && view !== 'projects' && view !== 'contact' && view !== 'penalties' && view !== 'keepy'
  const mode = !view ? 'tilt' : dof ? 'dof' : 'plain'

  return (
    <EffectComposer key={mode + quality} multisampling={0} enableNormalPass={false} stencilBuffer>
      {mode === 'tilt' ? <TiltShift2 blur={0.09} taper={0.6} start={[0.5, 0.2]} end={[0.5, 0.8]} samples={high ? 8 : 5} /> : <></>}
      {mode === 'dof' && preset ? <DepthOfField target={preset.target} focalLength={0.04} bokehScale={2.2} resolutionScale={0.5} /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.15} intensity={0.7} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
      <Vignette offset={0.3} darkness={0.45} />
    </EffectComposer>
  )
}
