import * as THREE from 'three'

/**
 * Materiales PBR de la habitación (F13). El GLB trae solo nombres de material; acá se definen de verdad.
 * - Texturas de Poly Haven (CC0) en /textures, tileadas por metro (UV0 del GLB está en metros).
 * - El AO horneado va en UV1 (aoMap); las mallas sin UV1 usan la variante sin AO.
 */

export const TEXTURE_FILES = {
  wood_floor: ['diff', 'nor', 'rough'],
  painted_plaster_wall: ['diff', 'nor', 'rough'],
  oak_veneer_01: ['diff', 'nor', 'rough'],
  american_walnut_veneer: ['diff', 'nor', 'rough'],
  plywood: ['diff', 'nor', 'rough'],
  rough_linen: ['diff', 'nor', 'rough'],
  poly_wool_herringbone: ['diff', 'nor', 'rough'],
  velour_velvet: ['diff', 'nor', 'rough'],
  fabric_leather_02: ['diff', 'nor', 'rough'],
  wool_boucle: ['nor', 'rough'],
  metal_plate: ['nor', 'rough'],
} as const

type TexId = keyof typeof TEXTURE_FILES
export type TextureSet = Record<string, THREE.Texture>

export const textureUrls = () =>
  Object.entries(TEXTURE_FILES).flatMap(([id, maps]) => maps.map((m) => `/textures/${id}_${m}.webp`))

interface Spec {
  tex?: TexId
  /** metros que cubre una repetición de la textura */
  scale?: number
  color?: string
  /** usar el color de la textura (si no, la textura solo aporta relieve/rugosidad y se tiñe con `color`) */
  useDiff?: boolean
  roughness?: number
  metalness?: number
  normalScale?: number
  physical?: Partial<Pick<THREE.MeshPhysicalMaterial, 'clearcoat' | 'clearcoatRoughness' | 'sheen' | 'sheenRoughness'>> & {
    sheenColor?: string
  }
  side?: THREE.Side
}

const SPECS: Record<string, Spec> = {
  Floor: { tex: 'wood_floor', scale: 2.2, useDiff: true, color: '#e6c9a8', roughness: 1, normalScale: 0.8, physical: { clearcoat: 0.25, clearcoatRoughness: 0.35 } },
  Wall: { tex: 'painted_plaster_wall', scale: 2.5, color: '#efe4d3', roughness: 1, normalScale: 0.6 },
  WallLeft: { tex: 'painted_plaster_wall', scale: 2.5, color: '#e6d6c0', roughness: 1, normalScale: 0.6 },
  WallTrim: { color: '#f6f1e8', roughness: 0.45 },
  Slab: { tex: 'plywood', scale: 1.2, useDiff: true, color: '#ffffff', roughness: 1 },
  Oak: { tex: 'oak_veneer_01', scale: 1.4, useDiff: true, color: '#ffffff', roughness: 1, physical: { clearcoat: 0.35, clearcoatRoughness: 0.3 } },
  Walnut: { tex: 'american_walnut_veneer', scale: 1.4, useDiff: true, color: '#a0704f', roughness: 1, physical: { clearcoat: 0.25, clearcoatRoughness: 0.35 } },
  WhitePaint: { color: '#f1ede6', roughness: 0.42, physical: { clearcoat: 0.2, clearcoatRoughness: 0.4 } },
  Linen: { tex: 'rough_linen', scale: 0.6, color: '#f4f0ea', roughness: 1, physical: { sheen: 0.6, sheenRoughness: 0.6, sheenColor: '#ffffff' } },
  Blanket: { tex: 'poly_wool_herringbone', scale: 0.5, color: '#3a557c', roughness: 1, normalScale: 1.2, physical: { sheen: 0.8, sheenRoughness: 0.5, sheenColor: '#9fb6d9' } },
  Curtain: { tex: 'rough_linen', scale: 0.5, color: '#cf6b4c', roughness: 1, physical: { sheen: 0.7, sheenRoughness: 0.5, sheenColor: '#ffc2a8' } },
  Velvet: { tex: 'velour_velvet', scale: 0.5, color: '#e3a33a', roughness: 1, physical: { sheen: 1, sheenRoughness: 0.35, sheenColor: '#ffe0a0' } },
  Leather: { tex: 'fabric_leather_02', scale: 0.4, color: '#1f2228', roughness: 0.8 },
  LeatherAccent: { tex: 'fabric_leather_02', scale: 0.4, color: '#10b5dc', roughness: 0.8 },
  Metal: { tex: 'metal_plate', scale: 0.5, color: '#c3c8d0', roughness: 0.45, metalness: 0.9 },
  BlackMetal: { tex: 'metal_plate', scale: 0.5, color: '#2a2d33', roughness: 0.55, metalness: 0.7 },
  Plastic: { color: '#1c1e23', roughness: 0.38 },
  PlasticWhite: { color: '#efedea', roughness: 0.35 },
  Gold: { color: '#d9ab35', roughness: 0.22, metalness: 1 },
  Plant: { color: '#4f8f48', roughness: 0.55, side: THREE.DoubleSide, physical: { sheen: 0.4, sheenRoughness: 0.4, sheenColor: '#b6f0a0' } },
  PlantDark: { color: '#2f6a37', roughness: 0.55, side: THREE.DoubleSide },
  Terracotta: { color: '#cf7a52', roughness: 0.85 },
  Ceramic: { color: '#f3f1ec', roughness: 0.3, physical: { clearcoat: 0.6, clearcoatRoughness: 0.15 } },
  Paper: { color: '#fbf7ef', roughness: 0.9 },
  Rug: { tex: 'wool_boucle', scale: 0.3, color: '#24324a', roughness: 1 },
  Denim: { tex: 'rough_linen', scale: 0.3, color: '#3d5a80', roughness: 1 },
  Jacket: { tex: 'rough_linen', scale: 0.3, color: '#2f3d58', roughness: 1, physical: { sheen: 0.5, sheenRoughness: 0.5, sheenColor: '#8aa0c8' } },
  Rubber: { color: '#1d1d1f', roughness: 0.9 },
  Wicker: { tex: 'rough_linen', scale: 0.15, color: '#c49a63', roughness: 1, normalScale: 2 },
  Gourd: { tex: 'american_walnut_veneer', scale: 0.4, useDiff: true, color: '#c08a5a', roughness: 0.6, physical: { clearcoat: 0.5, clearcoatRoughness: 0.3 } },
  Termo: { color: '#2d6a4f', roughness: 0.35, metalness: 0.5, physical: { clearcoat: 0.6, clearcoatRoughness: 0.2 } },
  Jersey: { tex: 'rough_linen', scale: 0.2, color: '#1f6fd1', roughness: 1, physical: { sheen: 0.6, sheenRoughness: 0.4, sheenColor: '#9cc6ff' } },
  Soil: { color: '#3b2a1e', roughness: 1 },
  Yerba: { color: '#7a9a35', roughness: 1 },
  Cork: { color: '#c49a6c', roughness: 1 },
}

const repeatCache = new Map<string, THREE.Texture>()

function tiled(base: THREE.Texture, scale: number, color: boolean) {
  const key = `${base.uuid}-${scale}`
  let t = repeatCache.get(key)
  if (!t) {
    t = base.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1 / scale, 1 / scale)
    t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    repeatCache.set(key, t)
  }
  return t
}

function build(spec: Spec, tex: TextureSet, ao: THREE.Texture | null): THREE.MeshStandardMaterial {
  const physical = !!spec.physical
  const m: THREE.MeshStandardMaterial = physical ? new THREE.MeshPhysicalMaterial() : new THREE.MeshStandardMaterial()
  m.color.set(spec.color ?? '#ffffff')
  m.roughness = spec.roughness ?? 0.7
  m.metalness = spec.metalness ?? 0
  m.side = spec.side ?? THREE.FrontSide
  m.fog = false
  if (spec.tex) {
    const id = spec.tex
    const s = spec.scale ?? 1
    const maps = TEXTURE_FILES[id] as readonly string[]
    if (spec.useDiff && maps.includes('diff')) m.map = tiled(tex[`/textures/${id}_diff.webp`], s, true)
    if (maps.includes('nor')) {
      m.normalMap = tiled(tex[`/textures/${id}_nor.webp`], s, false)
      m.normalScale.setScalar(spec.normalScale ?? 1)
    }
    if (maps.includes('rough')) m.roughnessMap = tiled(tex[`/textures/${id}_rough.webp`], s, false)
  }
  if (physical && spec.physical) {
    const p = m as THREE.MeshPhysicalMaterial
    const { sheenColor, ...rest } = spec.physical
    Object.assign(p, rest)
    if (sheenColor) p.sheenColor.set(sheenColor)
  }
  if (ao) {
    m.aoMap = ao
    m.aoMapIntensity = 1
  }
  return m
}

/** Material liso para nombres "C_<hex>[_<rugosidad>]" */
function flat(name: string, ao: THREE.Texture | null) {
  const [, hex, rough] = name.split('_')
  return build({ color: `#${hex.slice(0, 6)}`, roughness: rough ? parseFloat(rough) : 0.6 }, {}, ao)
}

export class RoomMaterials {
  private cache = new Map<string, THREE.MeshStandardMaterial>()
  private tex: TextureSet
  private ao: THREE.Texture

  constructor(tex: TextureSet, ao: THREE.Texture) {
    this.tex = tex
    this.ao = ao
  }

  get(name: string, withAo: boolean): THREE.MeshStandardMaterial {
    // los nombres de Blender pueden venir con sufijo (.001 → 001)
    const base = name.replace(/\.\d{3}$/, '')
    const key = `${base}|${withAo}`
    let m = this.cache.get(key)
    if (!m) {
      const ao = withAo ? this.ao : null
      if (base.startsWith('C_')) m = flat(base, ao)
      else if (SPECS[base]) m = build(SPECS[base], this.tex, ao)
      else m = build({ color: '#cccccc' }, this.tex, ao)
      m.name = base
      this.cache.set(key, m)
    }
    return m
  }

  all() {
    return [...this.cache.values()]
  }
}

/**
 * Calidad baja (F25): sin clearcoat ni sheen. En three esos efectos solo entran al shader si son > 0,
 * así que ponerlos en 0 abarata cada píxel; los valores originales quedan en userData para volver.
 */
export function applyMaterialQuality(root: THREE.Object3D, high: boolean) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const p = mesh.material as THREE.MeshPhysicalMaterial
    if (!p.isMeshPhysicalMaterial) return
    const orig = (p.userData.fullQuality ??= { clearcoat: p.clearcoat, sheen: p.sheen }) as { clearcoat: number; sheen: number }
    p.clearcoat = high ? orig.clearcoat : 0
    p.sheen = high ? orig.sheen : 0
  })
}
