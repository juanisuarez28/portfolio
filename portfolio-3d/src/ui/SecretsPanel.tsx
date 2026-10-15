import { SECRETS } from '../content/secrets'
import { useAppStore } from '../store/useAppStore'
import { CloseIcon } from './icons'

/** Lista de secretos (F21): desbloqueados con nombre, bloqueados con pista */
export function SecretsPanel() {
  const open = useAppStore((s) => s.secretsOpen)
  const secrets = useAppStore((s) => s.secrets)
  const setOpen = useAppStore((s) => s.setSecretsOpen)
  if (!open) return null
  const done = secrets.length === SECRETS.length
  return (
    <div className="secrets-backdrop" onClick={() => setOpen(false)}>
      <section className="secrets" role="dialog" aria-labelledby="secrets-title" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">Explorá la habitación</p>
            <h2 id="secrets-title">
              Secretos {secrets.length}/{SECRETS.length}
            </h2>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </header>
        <div className="secrets-bar">
          <span style={{ transform: `scaleX(${secrets.length / SECRETS.length})` }} />
        </div>
        <ul>
          {SECRETS.map((s) => {
            const got = secrets.includes(s.id)
            return (
              <li key={s.id} className={got ? 'is-got' : ''}>
                <span className="secret-icon">{got ? s.icon : '🔒'}</span>
                <div>
                  <strong>{got ? s.title : '???'}</strong>
                  <p>{got ? '¡Encontrado!' : s.hint}</p>
                </div>
              </li>
            )
          })}
        </ul>
        {done && <p className="secrets-done">🏆 ¡Encontraste todo! Ahora sí, escribime que te invito un mate.</p>}
      </section>
    </div>
  )
}
