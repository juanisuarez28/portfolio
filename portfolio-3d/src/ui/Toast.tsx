import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

/** Mensajes cortos con ícono y botón opcional (easter eggs, secretos). Se ocultan solos. */
export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), toast.ms ?? 2400)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div className={`toast${visible ? ' is-visible' : ''}${toast?.action ? ' has-action' : ''}`} role="status" aria-live="polite">
      {toast?.icon && <span className="toast-icon">{toast.icon}</span>}
      <span>{toast?.text}</span>
      {toast?.action && (
        <button
          className="toast-action"
          onClick={() => {
            toast.action!.run()
            setVisible(false)
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
