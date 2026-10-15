import { useEffect, useRef, useState } from 'react'
import { sectionById } from '../content/sections'
import type { SectionId } from '../content/types'
import { useAppStore } from '../store/useAppStore'
import { CloseIcon } from './icons'
import { sectionContent } from './sections'
import { useIsWide } from './useMediaQuery'

/** Panel lateral (desktop) / hoja inferior (mobile) con el contenido de la sección (F07). */
export function Panel() {
  const section = useAppStore((s) => s.section)
  const setSection = useAppStore((s) => s.setSection)
  const wide = useIsWide()
  // en desktop los proyectos se ven en el monitor (F08)
  const visible = section !== null && !(section === 'projects' && wide)

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
      closeRef.current?.focus({ preventScroll: true })
    }
  }, [visible, section])

  const meta = shown ? sectionById[shown] : null
  const Content = shown ? sectionContent[shown] : null

  return (
    <aside
      className={`panel${visible ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="panel-title"
      aria-hidden={!visible}
      inert={!visible}
    >
      {meta && Content && (
        <>
          <header className="panel-header">
            <div>
              <p className="eyebrow">{meta.object}</p>
              <h2 id="panel-title">{meta.title}</h2>
            </div>
            <button ref={closeRef} className="icon-btn" onClick={() => setSection(null)} aria-label="Cerrar y volver a la habitación">
              <CloseIcon />
            </button>
          </header>
          <div className="panel-body" ref={bodyRef}>
            <Content />
          </div>
        </>
      )}
    </aside>
  )
}
