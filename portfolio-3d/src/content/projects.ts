import type { Project } from './types'

export const projects: Project[] = [
  {
    id: 'vidrieratv',
    name: 'VidrieraTV',
    category: 'freelance',
    description:
      'Canal de televisión de clasificados en Lobería. Desarrollé una plataforma que permite cargar y transmitir en vivo el catálogo de clasificados con música de fondo y propagandas.',
    image: '/images/vidrieratv.webp',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind', 'Cloudinary', 'Firebase'],
    links: [],
    color: '#ff8a3d',
  },
  {
    id: 'pasamelarepe',
    name: 'PasameLaRepe',
    category: 'freelance',
    description:
      'Servicio de grabación de partidos de fútbol de la ciudad de Tandil. Plataforma automatizada de acceso a videos.',
    image: '/images/pasamelarepe.webp',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Supabase'],
    links: [
      { label: 'Visitar', url: 'https://pasamelarepe.com/', kind: 'site' },
      { label: 'Instagram', url: 'https://www.instagram.com/pasame_larepe/', kind: 'instagram' },
    ],
    color: '#2ecc71',
  },
  {
    id: 'proyectovia',
    name: 'Proyecto VIA',
    category: 'freelance',
    description:
      'Fundación cristiana de España. Proyecto realizado totalmente desde cero, incluyendo el diseño UX/UI inicial y la programación.',
    image: '/images/proyectovia.webp',
    tags: ['UX/UI', 'CSS', 'JavaScript', 'React', 'Supabase'],
    links: [{ label: 'Visitar', url: 'https://proyectovia.org', kind: 'site' }],
    color: '#f5c542',
  },
  {
    id: 'sassano',
    name: 'Sassano Alta Costura',
    category: 'freelance',
    description:
      'Sastrería italiana oriunda de Mar Del Plata. Migración y modernización del sitio anterior en WordPress a una versión robusta y actualizada.',
    image: '/images/sassano.webp',
    tags: ['React', 'WordPress', 'Supabase'],
    links: [{ label: 'Visitar', url: 'https://www.sassanoaltacostura.com/', kind: 'site' }],
    color: '#c9a36a',
  },
  {
    id: 'sygfoods',
    name: 'SyG Foods',
    category: 'freelance',
    description:
      'Distribuidor de alimentos brasileros oriundo de Balcarce. Proyecto realizado desde 0 (diseño, configuración de panel de control y carga de catálogo).',
    image: '/images/sygfoods.webp',
    tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'cPanel'],
    links: [{ label: 'Visitar', url: 'https://sygfoods.com.ar/', kind: 'site' }],
    color: '#27ae60',
  },
  {
    id: 'brometan',
    name: 'Brometan',
    category: 'freelance',
    description:
      'Distribuidor de productos agrícolas. Modernización visual, mantenimiento en páginas ya existentes y desarrollo de nuevos elementos y pestañas.',
    image: '/images/brometan.webp',
    tags: ['CSS', 'PHP', 'MySQL', 'WordPress'],
    links: [{ label: 'Visitar', url: 'https://brometan.com.ar/', kind: 'site' }],
    color: '#3f8f4a',
  },
  {
    id: 'agrowise',
    name: 'Agrowise',
    category: 'freelance',
    description:
      'Soluciones y productos para el sector agrícola. Rediseño general de la interfaz actual estructurando el agregado de nuevos productos en catálogo.',
    image: '/images/agrowise.webp',
    tags: ['CSS', 'PHP', 'MySQL', 'WordPress'],
    links: [{ label: 'Visitar', url: 'https://agrowise.com.ar/', kind: 'site' }],
    color: '#8bc34a',
  },
  {
    id: 'lar',
    name: 'La "R"',
    category: 'freelance',
    description:
      'Cadena de radios internacional con transmisión múltiple. Realicé modificaciones visuales e implementé nuevas secciones interactivas adaptadas al diseño.',
    image: '/images/lar.webp',
    tags: ['CSS', 'PHP', 'WordPress'],
    links: [{ label: 'Visitar', url: 'https://www.larradio.com/', kind: 'site' }],
    color: '#e74c3c',
  },
  {
    id: 'mack',
    name: 'Mack Studio',
    category: 'freelance',
    description: 'Sitio web completo para equipo de agromarketing, implementando una navegación moderna al scrollear.',
    image: '/images/mack.webp',
    tags: ['React', 'Supabase'],
    links: [{ label: 'Visitar', url: 'https://www.mackstudio.com.ar/', kind: 'site' }],
    color: '#9b59b6',
  },
  {
    id: 'haven',
    name: 'haven.',
    category: 'university',
    description: 'E-commerce ficticio para una página web de ropa, con visualización de productos y carrito incluido.',
    image: '/images/haven.webp',
    tags: ['React', 'TailwindCSS', 'Chakra', 'Firebase'],
    links: [
      { label: 'Visitar', url: 'https://havenn.vercel.app/', kind: 'site' },
      { label: 'Repositorio', url: 'https://github.com/juanisuarez28/haven', kind: 'repo' },
    ],
    color: '#f1f1f1',
  },
  {
    id: 'agileflow',
    name: 'AgileFlow',
    category: 'university',
    description: 'Agile Flow es una herramienta para gestión de proyectos, inspirada en aplicaciones como Jira o Taiga.',
    note: 'Usuario: juanis · Contraseña: 1234',
    image: '/images/agileflow.webp',
    tags: ['HTML', 'SCSS', 'TypeScript', 'Angular'],
    links: [
      { label: 'Visitar', url: 'https://agile-flow-bootcamp.vercel.app/login', kind: 'site' },
      { label: 'Repositorio', url: 'https://github.com/juanisuarez28/AgileFlowBootcamp', kind: 'repo' },
      {
        label: 'Figma',
        url: 'https://www.figma.com/design/jmKqZep3iR8GA3SBCUOObT/Figma-TP-Final?node-id=0-1&t=UaSoxM2sZqvrWxsX-1',
        kind: 'figma',
      },
    ],
    color: '#dd0031',
  },
  {
    id: 'monopatines',
    name: 'MonopatinesApp',
    category: 'university',
    description:
      'Proyecto back-end de servicios REST para una aplicación de monopatines eléctricos, estructurado con una arquitectura de microservicios.',
    image: '/images/monopatines.webp',
    tags: ['Java', 'SpringBoot', 'Maven', 'MongoDB'],
    links: [
      { label: 'Consigna', url: '/docs/TPE-ArqWeb-2023.pdf', kind: 'doc', download: 'ConsignaMonopatinesApp.pdf' },
      { label: 'Repositorio', url: 'https://github.com/juanisuarez28/MonopatinesApp', kind: 'repo' },
    ],
    color: '#6db33f',
  },
]

export const freelanceProjects = projects.filter((p) => p.category === 'freelance')
export const universityProjects = projects.filter((p) => p.category === 'university')
