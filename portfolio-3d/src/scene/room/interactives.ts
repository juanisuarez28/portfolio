import type { SectionId } from '../../content/types'
import type { Focus } from '../../store/useAppStore'

/**
 * Objetos clickeables del GLB (F05 v2). `nodes` son nombres de nodos del modelo de Blender;
 * el resaltado se aplica a todas sus mallas. `hotspot` = marcador visible en la vista general.
 */
export interface InteractiveDef {
  id: string
  label: string
  nodes: string[]
  /** nodos por prefijo (ej. todas las piezas de la ventana) */
  prefixes?: string[]
  action:
    | { type: 'section'; section: SectionId }
    | { type: 'focus'; focus: Focus }
    | { type: 'lamp' }
    | { type: 'tv' }
    | { type: 'remote' }
    | { type: 'mate' }
    | { type: 'figurita' }
  hotspot?: boolean
  /** corrimiento del marcador respecto del tope del objeto */
  hotspotOffset?: [number, number, number]
}

export const INTERACTIVES: InteractiveDef[] = [
  { id: 'computer', label: 'Proyectos', nodes: ['Monitor', 'Tower', 'Keyboard'], action: { type: 'section', section: 'projects' }, hotspot: true },
  { id: 'phone', label: 'Contacto', nodes: ['Phone'], action: { type: 'section', section: 'contact' }, hotspot: true, hotspotOffset: [0, 0.12, 0] },
  { id: 'diplomas', label: 'Formación', nodes: ['Diploma_tudai', 'Diploma_duia'], action: { type: 'section', section: 'education' }, hotspot: true },
  { id: 'bookshelf', label: 'Certificados', nodes: ['Bookshelf'], action: { type: 'section', section: 'education' } },
  { id: 'printer', label: 'CV', nodes: ['Printer', 'PrinterCabinet'], action: { type: 'section', section: 'cv' }, hotspot: true },
  { id: 'jersey', label: 'Sobre mí', nodes: ['Jersey'], action: { type: 'section', section: 'about' }, hotspot: true },
  { id: 'corkboard', label: 'Skills', nodes: ['Corkboard'], action: { type: 'section', section: 'skills' }, hotspot: true },
  { id: 'window', label: 'Mirar afuera', nodes: ['GLASS_Window', 'WinSill', 'SillPlant'], prefixes: ['WinFrame', 'WinMullion', 'Curtain'], action: { type: 'focus', focus: 'window' }, hotspot: true, hotspotOffset: [0, 0.12, 0.1] },
  { id: 'tv', label: 'Tele', nodes: ['TV'], action: { type: 'tv' }, hotspot: true, hotspotOffset: [0.15, 0.12, 0] },
  { id: 'remote', label: 'Control remoto', nodes: ['Remote', 'Console', 'Gamepad'], action: { type: 'remote' } },
  { id: 'lamp', label: 'Luz', nodes: ['Lamp'], action: { type: 'lamp' } },
  { id: 'mate', label: 'Mate', nodes: ['Mate', 'Termo'], action: { type: 'mate' } },
  { id: 'figurita', label: '¿Y esto?', nodes: ['Figurita'], action: { type: 'figurita' } },
]
