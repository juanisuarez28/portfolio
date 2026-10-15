import { lazy, Suspense, useEffect, useState } from 'react'
import { profile } from './content/profile'
import { sections } from './content/sections'
import { hasWebGL } from './lib/webgl'
import { useAppStore } from './store/useAppStore'
import { Behaviors } from './ui/Behaviors'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { GameOverlays } from './ui/GameOverlays'
import { Hud } from './ui/Hud'
import { Loader } from './ui/Loader'
import { Panel } from './ui/Panel'
import { SecretsPanel } from './ui/SecretsPanel'
import { sectionContent } from './ui/sections'
import { Toast } from './ui/Toast'

const Experience = lazy(() => import('./scene/Experience').then((m) => ({ default: m.Experience })))

/** Espera las fuentes para que las texturas dibujadas en canvas usen Outfit/Caveat (con timeout). */
function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const fonts = Promise.all([
      document.fonts.load("700 40px 'Outfit'"),
      document.fonts.load("400 40px 'Outfit'"),
      document.fonts.load("700 40px 'Caveat'"),
    ])
    const timeout = new Promise((r) => setTimeout(r, 2500))
    Promise.race([fonts, timeout]).finally(() => setReady(true))
  }, [])
  return ready
}

export default function App() {
  const fontsReady = useFontsReady()
  const [webgl] = useState(hasWebGL)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useAppStore.getState().setSection(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!webgl) return <Fallback />

  return (
    <ErrorBoundary fallback={<Fallback />}>
      <div className="canvas-wrap">
        {fontsReady && (
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        )}
      </div>
      <Behaviors />
      <GameOverlays />
      <Hud />
      <Panel />
      <SecretsPanel />
      <Toast />
      <Loader />
    </ErrorBoundary>
  )
}

/** Versión sin 3D para navegadores sin WebGL (F12) */
function Fallback() {
  return (
    <main className="fallback">
      <header>
        <h1>{profile.name}</h1>
        <p className="accent">{profile.role}</p>
        <p className="muted">No se pudo cargar la experiencia 3D en este navegador, así que te muestro la versión simple del portfolio.</p>
      </header>
      {sections.map((s) => {
        const Content = sectionContent[s.id]
        return (
          <section key={s.id} className="fallback-section">
            <h2>{s.title}</h2>
            <Content />
          </section>
        )
      })}
    </main>
  )
}
