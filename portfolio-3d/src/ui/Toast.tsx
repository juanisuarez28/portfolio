import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

/** Mensajes cortos (easter eggs). Se ocultan solos. */
export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div className={`toast${visible ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {toast?.text}
    </div>
  )
}
