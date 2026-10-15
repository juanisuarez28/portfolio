import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useAppStore } from '../store/useAppStore'

/** Postprocesado (F03). En calidad baja se omite la oclusión ambiental (F11). */
export function Effects() {
  const quality = useAppStore((s) => s.quality)
  const high = quality === 'high'
  return (
    <EffectComposer key={quality} multisampling={0} enableNormalPass={false}>
      {high ? (
        <N8AO halfRes aoRadius={0.55} intensity={2.4} distanceFalloff={0.9} color="#2b1a10" quality="medium" />
      ) : (
        <></>
      )}
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.7} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  )
}
