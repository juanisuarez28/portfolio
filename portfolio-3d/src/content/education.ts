import type { Certificate, Degree } from './types'

export const degrees: Degree[] = [
  {
    id: 'tudai',
    title: 'Técnico Universitario en Desarrollo de Aplicaciones Informáticas',
    shortTitle: 'TUDAI',
    institution: 'UNICEN',
  },
  {
    id: 'duia',
    title: 'Diplomatura Universitaria en Inteligencia Artificial',
    shortTitle: 'DUIA',
    institution: 'UNICEN',
  },
]

export const certificates: Certificate[] = [
  {
    id: 'react',
    title: 'Curso ReactJs en Coderhouse',
    issuer: 'Coderhouse',
    description:
      'Curso de 2 meses realizado en julio de 2024 donde realicé el proyecto "haven.", aprobando con un 10 como nota final.',
    image: '/images/cert-react.webp',
    url: '/images/cert-react.webp',
  },
  {
    id: 'lamansys',
    title: 'Bootcamp Frontend Angular en Lamansys',
    issuer: 'Lamansys',
    description:
      'Curso Front-end de 2 meses realizado en septiembre de 2023 donde realicé el proyecto "AgileFlow" como trabajo final.',
    image: '/images/cert-lamansys.webp',
    url: '/images/cert-lamansys.webp',
  },
  {
    id: 'efset',
    title: 'EFSET English Certificate 63/100 (C1 Advanced)',
    issuer: 'EF SET',
    description:
      'The achieved level is 63/100 on the EF SET score scale and C1 Advanced according to the Common European Framework of Reference (CEFR).',
    image: '/images/cert-ingles.webp',
    url: 'https://cert.efset.org/TYDXgd',
  },
]
