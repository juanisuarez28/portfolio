import type { SkillGroup } from './types'

// Mismas skills que el portfolio clásico, agrupadas por categoría.
// El color se usa para los post-its del corcho.
export const skillGroups: SkillGroup[] = [
  { id: 'frontend', title: 'Frontend', color: '#ffe066', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Bootstrap'] },
  { id: 'backend', title: 'Backend y datos', color: '#8ce99a', skills: ['Java', 'PHP', 'Python', 'SQL Databases', 'Firebase', 'Supabase'] },
  { id: 'ai', title: 'IA y automatización', color: '#ffa8a8', skills: ['OpenAI API', 'Gemini API', 'n8n'] },
  { id: 'cms', title: 'CMS y hosting', color: '#a5d8ff', skills: ['WordPress', 'PrestaShop', 'Plesk', 'cPanel', 'FTP'] },
  { id: 'tools', title: 'Herramientas', color: '#d0bfff', skills: ['GitHub', 'Bitbucket', 'Figma', 'Trello', 'Jira', 'Confluence', 'Slack'] },
]

export const softSkills = [
  'Creatividad',
  'Compromiso',
  'Responsabilidad',
  'Proactividad',
  'Organización',
  'Comunicación efectiva',
  'Disciplina',
  'Autodidacta',
  'Trabajo en equipo',
  'Adaptabilidad',
  'Colaboración',
  'Empatía',
]
