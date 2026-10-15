import { useEffect, useRef, useState } from 'react'
import { profile } from '../content/profile'
import { audio } from '../lib/audio'

interface Msg {
  from: 'juani' | 'you'
  text: string
}

const INTRO: string[] = [
  '¡Hola! 👋 Soy Juani.',
  'Gracias por pasar por mi habitación 😄',
  '¿Tenés un proyecto en mente o una propuesta laboral? Escribime por donde te quede más cómodo 👇',
]

interface Reply {
  label: string
  answer: string
  run: () => void
}

/** Contacto como chat (F22). `phone` = dentro del celular 3D; `panel` = en la hoja/panel. */
export function ContactChat({ variant }: { variant: 'phone' | 'panel' }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(true)
  const [ready, setReady] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const timers: number[] = []
    const next = () => {
      if (i >= INTRO.length) {
        setTyping(false)
        setReady(true)
        return
      }
      setTyping(true)
      timers.push(
        window.setTimeout(() => {
          // el texto se toma afuera del updater (StrictMode lo ejecuta dos veces)
          const text = INTRO[i++]
          setMsgs((m) => [...m, { from: 'juani', text }])
          audio.play('tap')
          timers.push(window.setTimeout(next, 250))
        }, 700),
      )
    }
    next()
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const open = (url: string, download?: string) => {
    const a = document.createElement('a')
    a.href = url
    if (download) a.download = download
    else {
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    }
    a.click()
  }

  const replies: Reply[] = [
    { label: '✉️ Mandame un mail', answer: '¡Dale! Te abro el mail 📬', run: () => open(`mailto:${profile.email}`) },
    {
      label: '📋 Copiar mail',
      answer: `Copiado: ${profile.email} ✅`,
      run: () => void navigator.clipboard?.writeText(profile.email).catch(() => undefined),
    },
    { label: '💼 LinkedIn', answer: '¡Conectemos en LinkedIn! 🚀', run: () => open(profile.linkedin) },
    { label: '🐙 GitHub', answer: 'Ahí está todo mi código 👨‍💻', run: () => open(profile.github) },
    { label: '📄 Mi CV', answer: 'Te mando mi CV 📄', run: () => open(profile.cv, profile.cvFileName) },
  ]

  const choose = (r: Reply) => {
    setMsgs((m) => [...m, { from: 'you', text: r.label.replace(/^\S+\s/, '') }])
    audio.play('tap')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { from: 'juani', text: r.answer }])
      r.run()
    }, 650)
  }

  return (
    <div className={`chat chat-${variant}`}>
      <header className="chat-header">
        <img src={profile.photo} alt="" />
        <div>
          <strong>{profile.name}</strong>
          <span>{typing ? 'escribiendo…' : 'en línea'}</span>
        </div>
      </header>
      <div className="chat-body" ref={scroller}>
        <p className="chat-day">Hoy</p>
        {msgs.map((m, i) => (
          <div key={i} className={`bubble bubble-${m.from}`}>
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="bubble bubble-juani bubble-typing" aria-label="escribiendo">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className={`chat-replies${ready ? ' is-ready' : ''}`}>
        {replies.map((r) => (
          <button key={r.label} className="chip" onClick={() => choose(r)} disabled={!ready}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
