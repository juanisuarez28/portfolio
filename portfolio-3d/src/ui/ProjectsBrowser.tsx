import { useState } from 'react'
import { freelanceProjects, universityProjects } from '../content/projects'
import type { Link, Project } from '../content/types'
import { linkIcon } from './icons'

type Tab = 'freelance' | 'university'

const TABS: { id: Tab; label: string; intro: string }[] = [
  { id: 'freelance', label: 'Freelance', intro: 'Plataformas y desarrollos web creados para clientes reales.' },
  { id: 'university', label: 'Universidad', intro: 'Trabajos prácticos y finales destacados a lo largo de mis estudios.' },
]

export function ProjectLinks({ links }: { links: Link[] }) {
  if (!links.length) return null
  return (
    <div className="project-links">
      {links.map((l) => {
        const Icon = linkIcon[l.kind]
        return (
          <a
            key={l.url}
            href={l.url}
            className="btn btn-ghost"
            {...(l.download ? { download: l.download } : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <Icon /> {l.label}
          </a>
        )
      })}
    </div>
  )
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="tags" aria-label="Tecnologías">
      {tags.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  )
}

/**
 * Navegador de proyectos.
 * - `screen`: dentro del monitor 3D (grilla + detalle, estilo ventana de escritorio). F08
 * - `panel`: lista completa en el panel lateral / hoja inferior. F07
 */
export function ProjectsBrowser({ variant }: { variant: 'screen' | 'panel' }) {
  const [tab, setTab] = useState<Tab>('freelance')
  const [selected, setSelected] = useState<Project | null>(null)
  const list = tab === 'freelance' ? freelanceProjects : universityProjects
  const current = TABS.find((t) => t.id === tab)!

  const tabs = (
    <div className="tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          className={`tab${tab === t.id ? ' is-active' : ''}`}
          onClick={() => {
            setTab(t.id)
            setSelected(null)
          }}
        >
          {t.label}
          <span className="tab-count">{(t.id === 'freelance' ? freelanceProjects : universityProjects).length}</span>
        </button>
      ))}
    </div>
  )

  if (variant === 'panel') {
    return (
      <div className="projects-panel">
        {tabs}
        <p className="muted">{current.intro}</p>
        <div className="project-list">
          {list.map((p) => (
            <article key={p.id} className="project-card">
              <img src={p.image} alt={p.name} loading="lazy" />
              <div className="project-card-body">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                {p.note && <p className="note">{p.note}</p>}
                <Tags tags={p.tags} />
                <ProjectLinks links={p.links} />
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="os">
      <div className="os-titlebar">
        <span className="os-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="os-title">{selected ? `proyectos/${selected.id}` : 'proyectos/'} — JuaniOS</span>
        <span />
      </div>
      <div className="os-body">
        {selected ? (
          <div className="os-detail">
            <button className="btn btn-ghost os-back" onClick={() => setSelected(null)}>
              ← Volver
            </button>
            <div className="os-detail-grid">
              <img src={selected.image} alt={selected.name} />
              <div>
                <h2>{selected.name}</h2>
                <p className="os-desc">{selected.description}</p>
                {selected.note && <p className="note">{selected.note}</p>}
                <Tags tags={selected.tags} />
                <ProjectLinks links={selected.links} />
                {!selected.links.length && <p className="muted">Proyecto privado del cliente.</p>}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="os-head">
              {tabs}
              <p className="muted">{current.intro}</p>
            </div>
            <div className="os-grid">
              {list.map((p) => (
                <button key={p.id} className="os-item" onClick={() => setSelected(p)}>
                  <img src={p.image.replace('.webp', '-sm.webp')} alt="" />
                  <span className="os-item-name">
                    <i style={{ background: p.color }} />
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
