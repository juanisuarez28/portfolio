import { useEffect, useRef, useSyncExternalStore } from 'react'
import { keepy } from '../scene/ball/keepy'
import { penalty } from '../scene/tv/TvScreen'
import { useAppStore } from '../store/useAppStore'
import { useIsWide } from './useMediaQuery'

/** HUD del minijuego de jueguitos (F18): se toca en cualquier parte de la pantalla o con la barra espaciadora */
function KeepyHud() {
  const snap = useSyncExternalStore(keepy.subscribe, keepy.get)
  const goHome = useAppStore((s) => s.goHome)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        keepy.tap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="game-layer" onPointerDown={() => keepy.tap()}>
      <div className="game-top">
        <p className="eyebrow">Jueguitos</p>
        <p className="game-count">{snap.count}</p>
        <p className="game-best">Récord: {Math.max(snap.best, snap.count)}</p>
      </div>
      {snap.phase === 'ready' && <p className="game-feedback is-static">Tocá para arrancar</p>}
      {snap.feedback && (
        <p key={snap.feedbackId} className="game-feedback">
          {snap.feedback}
        </p>
      )}
      {snap.phase === 'over' && (
        <div className="game-card" onPointerDown={(e) => e.stopPropagation()}>
          <p className="game-card-title">{snap.count >= 10 ? '¡Fenómeno! 🏆' : snap.count >= 5 ? '¡Bien ahí!' : '¡Se cayó!'}</p>
          <p>
            Hiciste <strong>{snap.count}</strong> jueguitos · Récord {snap.best}
          </p>
          <div className="game-actions">
            <button className="btn btn-primary" onClick={() => keepy.start()}>
              Otra vez
            </button>
            <button className="btn btn-ghost" onClick={goHome}>
              Salir
            </button>
          </div>
        </div>
      )}
      <p className="game-help">Tocá (o barra espaciadora) cuando la pelota pase por el aro</p>
    </div>
  )
}

/** Control de los penales (F20): el puntero apunta, clic/tap patea */
function PenaltyOverlay() {
  const wide = useIsWide()
  const holder = useRef<HTMLDivElement>(null)

  // en mobile la tele 3D queda chica: se muestra el mismo canvas en grande
  useEffect(() => {
    const c = penalty.canvas
    const h = holder.current
    if (wide || !c || !h) return
    c.className = 'tv-canvas'
    h.appendChild(c)
    return () => {
      if (c.parentElement === h) h.removeChild(c)
    }
  }, [wide])

  const move = (e: React.PointerEvent) => {
    const c = !wide ? penalty.canvas : null
    if (c?.isConnected) {
      const r = c.getBoundingClientRect()
      penalty.game.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
    } else penalty.game.pointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
  }
  return (
    <div
      className="game-layer is-aim"
      onPointerMove={move}
      onPointerDown={(e) => {
        move(e)
        penalty.game.press()
      }}
    >
      {!wide && <div className="tv-overlay" ref={holder} />}
      <p className="game-help">Mové para apuntar · clic / tap para patear · mirá la barra de potencia</p>
    </div>
  )
}

export function GameOverlays() {
  const focus = useAppStore((s) => s.focus)
  const settled = useAppStore((s) => s.cameraSettled)
  if (focus === 'keepy') return <KeepyHud />
  if (focus === 'penalties' && settled) return <PenaltyOverlay />
  return null
}
