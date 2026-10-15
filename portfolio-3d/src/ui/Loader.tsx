import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { profile } from '../content/profile'
import { useAppStore } from '../store/useAppStore'

/** Pantalla de carga con progreso y botón "Entrar" (F11). */
export function Loader() {
  const { progress, active } = useProgress()
  const started = useAppStore((s) => s.started)
  const start = useAppStore((s) => s.start)
  const sceneReady = useAppStore((s) => s.sceneReady)
  const ready = sceneReady && !active
  const shown = ready ? 100 : Math.min(progress, 95)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setGone(true), 900)
      return () => clearTimeout(t)
    }
  }, [started])

  if (gone) return null

  return (
    <div className={`loader${started ? ' is-leaving' : ''}`}>
      <div className="loader-card">
        <p className="eyebrow">Portfolio</p>
        <h1>{profile.name}</h1>
        <p className="accent">{profile.role}</p>
        <p className="muted loader-copy">Pasá a mi habitación: cada objeto cuenta una parte de mi historia.</p>
        <div className="loader-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(shown, 4) / 100})` }} />
        </div>
        <button className="btn btn-primary loader-btn" onClick={start} disabled={!ready} autoFocus>
          {ready ? 'Entrar' : `Cargando… ${Math.round(shown)}%`}
        </button>
      </div>
    </div>
  )
}
