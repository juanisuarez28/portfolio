import { useEffect, useRef, useState } from 'react'
import { sectionById } from '../content/sections'
import type { SectionId } from '../content/types'
import { IN_WORLD_SECTIONS } from '../scene/CameraRig'
import { useAppStore } from '../store/useAppStore'
import { CloseIcon } from './icons'
import { sectionContent } from './sections'
import { useIsWide } from './useMediaQuery'

/**
 * Panel lateral (desktop) / hoja inferior (mobile) con el contenido de la sección (F07 + F24).
 * En mobile la hoja tiene dos alturas: compacta (se ve el objeto) y expandida (para leer).
 */
export function Panel() {
  const section = useAppStore((s) => s.section)
  const setSection = useAppStore((s) => s.setSection)
  const snap = useAppStore((s) => s.sheetSnap)
  const setSnap = useAppStore((s) => s.setSheetSnap)
  const wide = useIsWide()
  // en desktop proyectos y contacto se ven dentro del monitor y del celular (F08, F22)
  const visible = section !== null && !(wide && IN_WORLD_SECTIONS.includes(section))

  // conserva la última sección mientras se anima la salida
  const [shown, setShown] = useState<SectionId | null>(null)
  useEffect(() => {
    if (visible) setShown(section)
  }, [visible, section])

  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (visible) {
      bodyRef.current?.scrollTo({ top: 0 })
      if (wide) closeRef.current?.focus({ preventScroll: true })
    }
  }, [visible, section, wide])

  // gesto de arrastre de la hoja (solo mobile)
  const drag = useRef<{ y: number; dy: number } | null>(null)
  const [dragY, setDragY] = useState(0)
  const onDown = (e: React.PointerEvent) => {
    if (wide) return
    drag.current = { y: e.clientY, dy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    drag.current.dy = e.clientY - drag.current.y
    setDragY(drag.current.dy)
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    setDragY(0)
    if (!d) return
    if (Math.abs(d.dy) < 6) setSnap(snap === 'peek' ? 'full' : 'peek')
    else if (d.dy < -40) setSnap('full')
    else if (d.dy > 60) {
      if (snap === 'full') setSnap('peek')
      else setSection(null)
    }
  }

  const meta = shown ? sectionById[shown] : null
  const Content = shown ? sectionContent[shown] : null

  return (
    <aside
      className={`panel${visible ? ' is-open' : ''} snap-${snap}${dragY ? ' is-dragging' : ''}`}
      style={dragY ? ({ '--drag': `${dragY}px` } as React.CSSProperties) : undefined}
      role="dialog"
      aria-modal="false"
      aria-labelledby="panel-title"
      aria-hidden={!visible}
      inert={!visible}
    >
      {meta && Content && (
        <>
          <header className="panel-header" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <span className="sheet-handle" aria-hidden="true" />
            <div>
              <p className="eyebrow">{meta.object}</p>
              <h2 id="panel-title">{meta.title}</h2>
            </div>
            <button
              ref={closeRef}
              className="icon-btn"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setSection(null)}
              aria-label="Cerrar y volver a la habitación"
            >
              <CloseIcon />
            </button>
          </header>
          <div
            className="panel-body"
            ref={bodyRef}
            onScroll={(e) => {
              if (!wide && snap === 'peek' && e.currentTarget.scrollTop > 24) setSnap('full')
            }}
          >
            <Content />
          </div>
          {!wide && snap === 'peek' && (
            <button className="sheet-more" onClick={() => setSnap('full')}>
              Ver todo ↑
            </button>
          )}
        </>
      )}
    </aside>
  )
}
