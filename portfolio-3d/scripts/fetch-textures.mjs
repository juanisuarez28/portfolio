// Descarga texturas PBR CC0 de Poly Haven (https://polyhaven.com, licencia CC0) y las convierte a WebP.
// Uso: npm run textures
// Salida: public/textures/<id>_<mapa>.webp  (diff = color, nor = normal OpenGL, rough = rugosidad)
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('public/textures')
const SIZE = '1k'

// id de Poly Haven → mapas que usamos
const TEXTURES = {
  wood_floor: ['diff', 'nor', 'rough'], // piso
  painted_plaster_wall: ['diff', 'nor', 'rough'], // paredes
  oak_veneer_01: ['diff', 'nor', 'rough'], // escritorio, estante, muebles claros
  american_walnut_veneer: ['diff', 'nor', 'rough'], // cama, mueble de la tele, marcos
  plywood: ['diff', 'nor', 'rough'], // canto de la losa (look de maqueta)
  rough_linen: ['diff', 'nor', 'rough'], // sábanas, almohadas, cortinas
  poly_wool_herringbone: ['diff', 'nor', 'rough'], // manta
  velour_velvet: ['diff', 'nor', 'rough'], // puff
  fabric_leather_02: ['diff', 'nor', 'rough'], // silla gamer
  wool_boucle: ['nor', 'rough'], // fibra de la alfombra (el dibujo sale del canvas)
  metal_plate: ['nor', 'rough'], // metales
  aerial_grass_rock: ['diff', 'nor', 'rough'], // sierras (exterior)
  dry_ground_rocks: ['diff', 'nor', 'rough'], // rocas / Piedra Movediza
}

// texturas de superficies grandes (color a 1024 px)
const BIG = new Set(['wood_floor', 'painted_plaster_wall', 'oak_veneer_01', 'aerial_grass_rock'])

// nombres de mapas en la API de Poly Haven
const API_MAP = { diff: 'Diffuse', nor: 'nor_gl', rough: 'Rough' }

await mkdir(OUT, { recursive: true })

for (const [id, maps] of Object.entries(TEXTURES)) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json()
  for (const m of maps) {
    const entry = files[API_MAP[m]]?.[SIZE]?.jpg ?? files[API_MAP[m]]?.[SIZE]?.png
    if (!entry) {
      console.warn('sin mapa', id, m)
      continue
    }
    const buf = Buffer.from(await (await fetch(entry.url)).arrayBuffer())
    // color grande solo en superficies grandes; normal y rugosidad chicos (se repiten mucho y no se nota)
    const size = m === 'diff' ? (BIG.has(id) ? 1024 : 512) : m === 'nor' ? 512 : 256
    let img = sharp(buf).resize(size, size, { fit: 'inside' })
    if (m === 'rough') img = img.grayscale()
    const out = path.join(OUT, `${id}_${m}.webp`)
    await writeFile(out, await img.webp({ quality: m === 'nor' ? 80 : 72 }).toBuffer())
    console.log('ok', path.basename(out))
  }
}

