import { profile } from '../content/profile'
import { sections } from '../content/sections'
import { useAppStore } from '../store/useAppStore'
import { BackIcon, GithubIcon, LinkedinIcon, MoonIcon, SunIcon } from './icons'
import { useIsWide } from './useMediaQuery'

/** Capa de interfaz fija sobre la escena (F07). */
export function Hud() {
  const section = useAppStore((s) => s.section)
  const setSection = useAppStore((s) => s.setSection)
  const night = useAppStore((s) => s.night)
  const toggleNight = useAppStore((s) => s.toggleNight)
  const interacted = useAppStore((s) => s.interacted)
  const started = useAppStore((s) => s.started)
  const wide = useIsWide()
  const onScreen = section === 'projects' && wide

  return (
    <div className={`hud${started ? ' is-visible' : ''}`}>
      <header className="hud-top">
        <button className="brand" onClick={() => setSection(null)} aria-label="Volver a la vista general">
          <span className="brand-name">{profile.name}</span>
          <span className="brand-role">{profile.role}</span>
        </button>
        <div className="hud-actions">
          <a className="icon-btn" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GithubIcon />
          </a>
          <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <LinkedinIcon />
          </a>
          <button className="icon-btn" onClick={toggleNight} aria-label={night ? 'Pasar a modo día' : 'Pasar a modo noche'}>
            {night ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {section && (
        <button className="back-btn" onClick={() => setSection(null)}>
          <BackIcon /> Volver a la habitación
        </button>
      )}

      {onScreen && <p className="screen-hint">Navegá mis proyectos en la pantalla 🖥️ · <kbd>Esc</kbd> para volver</p>}

      <nav className={`hud-nav${section && !wide ? ' is-hidden' : ''}`} aria-label="Secciones">
        {sections.map((s) => (
          <button
            key={s.id}
            className={`nav-item${section === s.id ? ' is-active' : ''}`}
            onClick={() => setSection(section === s.id ? null : s.id)}
            aria-current={section === s.id ? 'true' : undefined}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <p className={`hint${!interacted && !section ? ' is-visible' : ''}`}>
        Hacé clic en los objetos para explorar · Arrastrá para girar
      </p>
    </div>
  )
}
