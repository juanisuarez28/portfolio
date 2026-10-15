// Convierte las imágenes del portfolio clásico a WebP optimizado.
// Uso: npm run images  (lee de ../src/assets/imgs, el portfolio Angular en la raíz del repo)
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = path.resolve('../src/assets/imgs')
const OUT = path.resolve('public/images')

// [archivo origen, nombre destino, ancho máximo]
const IMAGES = [
  ['perfilnuevachica.PNG', 'perfil', 640],
  ['vtv.jfif', 'vidrieratv', 960],
  ['pasame-la-repe.jfif', 'pasamelarepe', 960],
  ['proyecto-via.jfif', 'proyectovia', 960],
  ['sassano.jfif', 'sassano', 960],
  ['syg-foods.jfif', 'sygfoods', 960],
  ['brometan.jfif', 'brometan', 960],
  ['agrowise.jfif', 'agrowise', 960],
  ['la-r.jfif', 'lar', 960],
  ['mack.png', 'mack', 960],
  ['havenscreen.jpeg', 'haven', 960],
  ['agileflow.jpeg', 'agileflow', 960],
  ['monopatinapp.webp', 'monopatines', 960],
  ['certificado.react.png', 'cert-react', 1400],
  ['CertificadoLamansys.jpeg', 'cert-lamansys', 1400],
  ['certificadoIngles.jpeg', 'cert-ingles', 1400],
]

await mkdir(OUT, { recursive: true })
for (const [file, name, width] of IMAGES) {
  const input = path.join(SRC, file)
  await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${name}.webp`))
  // Versión chica para texturas 3D (pantallas, cuadros)
  await sharp(input).rotate().resize({ width: 512, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(OUT, `${name}-sm.webp`))
  console.log('ok', name)
}
