import { useEffect } from 'react'
import { audio } from '../lib/audio'
import { useAppStore } from '../store/useAppStore'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

/** Lógica global sin UI: teclado, sonido, celular que suena y disparadores de secretos (F21–F23). */
export function Behaviors() {
  // Esc vuelve; código Konami
  useEffect(() => {
    let idx = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useAppStore.getState().goHome()
      idx = e.code === KONAMI[idx] ? idx + 1 : e.code === KONAMI[0] ? 1 : 0
      if (idx === KONAMI.length) {
        idx = 0
        useAppStore.getState().unlock('konami')
        useAppStore.getState().toggleNight()
        window.dispatchEvent(new CustomEvent('confetti', { detail: [0.4, 1.6, 0.6] }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // sonido: preferencia, día/noche
  useEffect(() => {
    const apply = (s = useAppStore.getState()) => {
      audio.setEnabled(s.soundOn)
      audio.setNight(s.night)
    }
    // el primer gesto habilita el AudioContext si el sonido estaba activo de antes
    const unlockAudio = () => apply()
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    const unsub = useAppStore.subscribe((s, prev) => {
      if (s.soundOn !== prev.soundOn || s.night !== prev.night) apply(s)
    })
    return () => {
      unsub()
      window.removeEventListener('pointerdown', unlockAudio)
    }
  }, [])

  // secretos: efecto de sonido, confeti final, "noche en Tandil"
  useEffect(() => {
    const onSecret = (e: Event) => {
      audio.play('secret')
      if ((e as CustomEvent).detail?.all) window.dispatchEvent(new CustomEvent('confetti', { detail: [0.4, 1.8, 0.6] }))
    }
    window.addEventListener('secret-unlocked', onSecret)
    const unsub = useAppStore.subscribe((s) => {
      if (s.focus === 'window' && s.night && s.cameraSettled) s.unlock('night')
    })
    return () => {
      window.removeEventListener('secret-unlocked', onSecret)
      unsub()
    }
  }, [])

  // el celular suena a los 25 s y después cada tanto, mientras nadie lo atendió
  useEffect(() => {
    let timer = 0
    let stop = 0
    let buzz = 0
    let answered = false
    const ring = () => {
      const s = useAppStore.getState()
      if (answered) return
      if (s.started && s.section === null && s.focus === null) {
        s.setPhoneRinging(true)
        audio.play('vibrate')
        buzz = window.setInterval(() => audio.play('vibrate'), 1600)
        stop = window.setTimeout(() => {
          useAppStore.getState().setPhoneRinging(false)
          clearInterval(buzz)
        }, 6500)
        timer = window.setTimeout(ring, 75000)
      } else timer = window.setTimeout(ring, 8000)
    }
    timer = window.setTimeout(ring, 25000)
    const unsub = useAppStore.subscribe((s) => {
      if (s.section === 'contact') {
        answered = true
        clearInterval(buzz)
      }
    })
    return () => {
      clearTimeout(timer)
      clearTimeout(stop)
      clearInterval(buzz)
      unsub()
    }
  }, [])

  return null
}
