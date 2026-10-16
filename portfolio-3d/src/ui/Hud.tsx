import { profile } from '../content/profile'
import { SECRETS } from '../content/secrets'
import { sections } from '../content/sections'
import { audio } from '../lib/audio'
import { currentView, useAppStore } from '../store/useAppStore'
import { BackIcon, GaugeIcon, GithubIcon, LinkedinIcon, MoonIcon, ResetIcon, SoundOffIcon, SoundOnIcon, SunIcon, TrophyIcon } from './icons'
import { useIsWide } from './useMediaQuery'

const BACK_LABEL: Record<string, string> = {
  window: 'Volver adentro',
  keepy: 'Dejar la pelota',
  penalties: 'Salir del juego',
}

/** Capa de interfaz fija sobre la escena (F07 + v2). */
export function Hud() {
  const section = useAppStore((s) => s.section)
  const focus = useAppStore((s) => s.focus)
  const view = useAppStore(currentView)
  const setSection = useAppStore((s) => s.setSection)
  const goHome = useAppStore((s) => s.goHome)
  const night = useAppStore((s) => s.night)
  const toggleNight = useAppStore((s) => s.toggleNight)
  const lite = useAppStore((s) => s.quality === 'low')
  const toggleQuality = useAppStore((s) => s.toggleQuality)
  const showToast = useAppStore((s) => s.showToast)
  const soundOn = useAppStore((s) => s.soundOn)
  const toggleSound = useAppStore((s) => s.toggleSound)
  const secrets = useAppStore((s) => s.secrets.length)
  const setSecretsOpen = useAppStore((s) => s.setSecretsOpen)
  const physicsOn = useAppStore((s) => s.physicsOn)
  const resetPhysics = useAppStore((s) => s.resetPhysics)
  const interacted = useAppStore((s) => s.interacted)
  const started = useAppStore((s) => s.started)
  const wide = useIsWide()
  const inGame = focus === 'keepy' || focus === 'penalties'
  // en desktop proyectos y contacto se ven dentro de objetos 3D: el menú taparía la pantalla
  const inWorld = wide && (section === 'projects' || section === 'contact')

  return (
    <div className={`hud${started ? ' is-visible' : ''}${view ? ' is-focused' : ''}`}>
      <header className="hud-top">
        <button className="brand" onClick={goHome} aria-label="Volver a la vista general">
          <span className="brand-name">{profile.name}</span>
          <span className="brand-role">{profile.role}</span>
        </button>
        <div className="hud-actions">
          <button className="icon-btn trophy-btn" onClick={() => setSecretsOpen(true)} aria-label={`Secretos: ${secrets} de ${SECRETS.length}`}>
            <TrophyIcon />
            <span className="trophy-count">
              {secrets}/{SECRETS.length}
            </span>
          </button>
          <button
            className={`icon-btn${soundOn ? ' is-on' : ''}`}
            onClick={() => {
              toggleSound()
              audio.play('click')
            }}
            aria-label={soundOn ? 'Silenciar' : 'Activar sonido'}
            aria-pressed={soundOn}
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button className="icon-btn" onClick={toggleNight} aria-label={night ? 'Pasar a modo día' : 'Pasar a modo noche'}>
            {night ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={`icon-btn${lite ? ' is-on' : ''}`}
            onClick={() => {
              toggleQuality()
              showToast(lite ? 'Calidad alta activada' : 'Modo liviano: menos carga para la placa de video')
            }}
            aria-label={lite ? 'Usar calidad alta' : 'Usar modo liviano'}
            aria-pressed={lite}
            title={lite ? 'Modo liviano activo' : 'Calidad alta'}
          >
            <GaugeIcon />
          </button>
          {wide && (
            <>
              <a className="icon-btn" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubIcon />
              </a>
              <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
            </>
          )}
        </div>
      </header>

      {view && (
        <button className="back-btn" onClick={goHome}>
          <BackIcon /> {focus ? BACK_LABEL[focus] : 'Volver a la habitación'}
        </button>
      )}

      {section === 'projects' && wide && <p className="screen-hint">Navegá mis proyectos en la pantalla · <kbd>Esc</kbd> para volver</p>}
      {focus === 'window' && <p className="screen-hint">Las sierras de Tandil y la Piedra Movediza · <kbd>Esc</kbd> para volver</p>}

      {physicsOn && !view && (
        <button className="pill-btn reset-btn" onClick={resetPhysics}>
          <ResetIcon width={15} height={15} /> Acomodar
        </button>
      )}

      <nav className={`hud-nav${(section && !wide) || inGame || inWorld ? ' is-hidden' : ''}`} aria-label="Secciones">
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

      <p className={`hint${!interacted && !view ? ' is-visible' : ''}`}>Hacé clic en los objetos para explorar · Arrastrá para girar</p>
    </div>
  )
}
