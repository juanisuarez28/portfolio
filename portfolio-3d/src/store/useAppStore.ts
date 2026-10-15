import { create } from 'zustand'
import type { SectionId } from '../content/types'

export type Quality = 'high' | 'low'

interface Toast {
  id: number
  text: string
}

interface AppState {
  /** Sección abierta (null = vista general) */
  section: SectionId | null
  /** Id del objeto interactivo bajo el puntero */
  hovered: string | null
  night: boolean
  /** El usuario apretó "Entrar" */
  started: boolean
  /** La cámara terminó su transición */
  cameraSettled: boolean
  /** Ya interactuó alguna vez (oculta la pista inicial) */
  interacted: boolean
  quality: Quality
  /** La escena terminó de montar (Suspense resuelto) */
  sceneReady: boolean
  tvOn: boolean
  juggles: number
  toast: Toast | null

  setSection: (section: SectionId | null) => void
  setHovered: (id: string | null) => void
  toggleNight: () => void
  start: () => void
  setCameraSettled: (settled: boolean) => void
  setQuality: (quality: Quality) => void
  setSceneReady: () => void
  toggleTv: () => void
  juggle: () => void
  resetJuggles: () => void
  showToast: (text: string) => void
}

const hour = new Date().getHours()

export const useAppStore = create<AppState>((set, get) => ({
  section: null,
  hovered: null,
  night: hour >= 19 || hour < 7,
  started: false,
  cameraSettled: false,
  interacted: false,
  quality: 'high',
  sceneReady: false,
  tvOn: false,
  juggles: 0,
  toast: null,

  setSection: (section) => {
    if (get().section === section) return
    set({ section, cameraSettled: false, interacted: true, hovered: null })
  },
  setHovered: (hovered) => set({ hovered }),
  toggleNight: () => set((s) => ({ night: !s.night, interacted: true })),
  start: () => set({ started: true }),
  setCameraSettled: (cameraSettled) => set({ cameraSettled }),
  setQuality: (quality) => set({ quality }),
  setSceneReady: () => set({ sceneReady: true }),
  toggleTv: () => set((s) => ({ tvOn: !s.tvOn, interacted: true })),
  juggle: () => set((s) => ({ juggles: s.juggles + 1, interacted: true })),
  resetJuggles: () => set({ juggles: 0 }),
  showToast: (text) => set({ toast: { id: Date.now(), text } }),
}))
