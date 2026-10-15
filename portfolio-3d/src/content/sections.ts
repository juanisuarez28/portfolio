import type { Section, SectionId } from './types'

export const sections: Section[] = [
  { id: 'about', title: 'Sobre mí', label: 'Sobre mí', object: 'La camiseta' },
  { id: 'projects', title: 'Proyectos', label: 'Proyectos', object: 'La compu' },
  { id: 'education', title: 'Formación', label: 'Formación', object: 'Diplomas y certificados' },
  { id: 'skills', title: 'Skills', label: 'Skills', object: 'El corcho' },
  { id: 'contact', title: 'Contacto', label: 'Contacto', object: 'El celular' },
  { id: 'cv', title: 'Mi CV', label: 'CV', object: 'La impresora' },
]

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<SectionId, Section>
