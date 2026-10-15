export type SectionId = 'about' | 'projects' | 'education' | 'skills' | 'contact' | 'cv'

export interface Section {
  id: SectionId
  title: string
  /** Texto corto para el menú */
  label: string
  /** Objeto de la habitación que lleva a esta sección */
  object: string
}

export interface Link {
  label: string
  url: string
  kind: 'site' | 'repo' | 'instagram' | 'figma' | 'doc'
  /** true para descargar en vez de abrir */
  download?: string
}

export interface Project {
  id: string
  name: string
  category: 'freelance' | 'university'
  description: string
  /** Nota extra (ej. credenciales de demo) */
  note?: string
  image: string
  tags: string[]
  links: Link[]
  /** Color de acento para el ícono en el monitor */
  color: string
}

export interface Degree {
  id: string
  title: string
  shortTitle: string
  institution: string
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  description: string
  image: string
  url: string
}

export interface SkillGroup {
  id: string
  title: string
  color: string
  skills: string[]
}
