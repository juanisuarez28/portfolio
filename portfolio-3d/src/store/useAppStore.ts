import { create } from 'zustand'
import type { SectionId } from '../content/types'
import { SECRETS, type SecretId } from '../content/secrets'

export type Quality = 'high' | 'low'
/** Vistas sin panel de contenido: ventana (F16) y minijuegos (F18, F20) */
export type Focus = 'window' | 'keepy' | 'penalties'
export type SheetSnap = 'peek' | 'full'

interface Toast {
  id: number
  text: string
  icon?: string
  /** botón opcional dentro del mensaje */
  action?: { label: string; run: () => void }
  ms?: number
}

const LS = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* modo privado: no persiste */
    }
  },
}

interface AppState {
  section: SectionId | null
  focus: Focus | null
  hovered: string | null
  night: boolean
  started: boolean
  cameraSettled: boolean
  interacted: boolean
  quality: Quality
  sceneReady: boolean

  // tele (F19): 0 = apagada, 1..4 canales
  tvChannel: number
  channelsSeen: number[]
  // pelota (F17)
  physicsOn: boolean
  /** dirección del primer pateo (x, z) para aplicarla al montar la física */
  pendingKick: [number, number] | null
  resetToken: number
  juggleRecord: number
  // secretos (F21)
  secrets: SecretId[]
  secretsOpen: boolean
  // sonido (F23)
  soundOn: boolean
  // celular (F22)
  phoneRinging: boolean
  // hoja mobile (F24)
  sheetSnap: SheetSnap
  toast: Toast | null

  setSection: (section: SectionId | null) => void
  setFocus: (focus: Focus | null) => void
  goHome: () => void
  setHovered: (id: string | null) => void
  toggleNight: () => void
  start: () => void
  setCameraSettled: (settled: boolean) => void
  setQuality: (quality: Quality) => void
  setSceneReady: () => void
  nextChannel: () => void
  setTvChannel: (ch: number) => void
  kick: (dir: [number, number]) => void
  consumeKick: () => [number, number] | null
  resetPhysics: () => void
  setJuggleRecord: (n: number) => void
  unlock: (id: SecretId) => void
  setSecretsOpen: (open: boolean) => void
  toggleSound: () => void
  setPhoneRinging: (ringing: boolean) => void
  setSheetSnap: (snap: SheetSnap) => void
  showToast: (toast: Omit<Toast, 'id'> | string) => void
}

const hour = new Date().getHours()

export const useAppStore = create<AppState>((set, get) => ({
  section: null,
  focus: null,
  hovered: null,
  night: hour >= 19 || hour < 7,
  started: false,
  cameraSettled: false,
  interacted: false,
  quality: 'high',
  sceneReady: false,
  tvChannel: 0,
  channelsSeen: [],
  physicsOn: false,
  pendingKick: null,
  resetToken: 0,
  juggleRecord: LS.get('juggleRecord', 0),
  secrets: LS.get<SecretId[]>('secrets', []).filter((id) => SECRETS.some((s) => s.id === id)),
  secretsOpen: false,
  soundOn: LS.get('soundOn', false),
  phoneRinging: false,
  sheetSnap: 'peek',
  toast: null,

  setSection: (section) => {
    if (get().section === section && !get().focus) return
    set({ section, focus: null, cameraSettled: false, interacted: true, hovered: null, sheetSnap: 'peek', phoneRinging: false })
  },
  setFocus: (focus) => set({ focus, section: null, cameraSettled: false, interacted: true, hovered: null }),
  goHome: () => set({ section: null, focus: null, cameraSettled: false, secretsOpen: false }),
  setHovered: (hovered) => set({ hovered }),
  toggleNight: () => set((s) => ({ night: !s.night, interacted: true })),
  start: () => set({ started: true }),
  setCameraSettled: (cameraSettled) => set({ cameraSettled }),
  setQuality: (quality) => set({ quality }),
  setSceneReady: () => set({ sceneReady: true }),
  nextChannel: () => {
    const ch = (get().tvChannel + 1) % 5
    get().setTvChannel(ch)
  },
  setTvChannel: (tvChannel) => {
    const seen = tvChannel && !get().channelsSeen.includes(tvChannel) ? [...get().channelsSeen, tvChannel] : get().channelsSeen
    set({ tvChannel, channelsSeen: seen, interacted: true })
    if (seen.length === 4) get().unlock('zapping')
  },
  kick: (dir) => set({ physicsOn: true, pendingKick: dir, interacted: true }),
  consumeKick: () => {
    const k = get().pendingKick
    if (k) set({ pendingKick: null })
    return k
  },
  resetPhysics: () => set((s) => ({ resetToken: s.resetToken + 1 })),
  setJuggleRecord: (n) => {
    LS.set('juggleRecord', n)
    set({ juggleRecord: n })
  },
  unlock: (id) => {
    if (get().secrets.includes(id)) return
    const secrets = [...get().secrets, id]
    LS.set('secrets', secrets)
    set({ secrets })
    const s = SECRETS.find((x) => x.id === id)!
    get().showToast({ text: `Secreto desbloqueado: ${s.title} (${secrets.length}/${SECRETS.length})`, icon: s.icon, ms: 3500 })
    window.dispatchEvent(new CustomEvent('secret-unlocked', { detail: { id, all: secrets.length === SECRETS.length } }))
  },
  setSecretsOpen: (secretsOpen) => set({ secretsOpen }),
  toggleSound: () => {
    const soundOn = !get().soundOn
    LS.set('soundOn', soundOn)
    set({ soundOn, interacted: true })
  },
  setPhoneRinging: (phoneRinging) => set({ phoneRinging }),
  setSheetSnap: (sheetSnap) => set({ sheetSnap }),
  showToast: (toast) => set({ toast: { id: Date.now() + Math.random(), ...(typeof toast === 'string' ? { text: toast } : toast) } }),
}))

/** Vista actual de la cámara: sección de contenido o foco especial */
export const currentView = (s: Pick<AppState, 'section' | 'focus'>) => s.section ?? s.focus

if (import.meta.env.DEV) (window as unknown as { __store: typeof useAppStore }).__store = useAppStore
