import { Html, useGLTF, useTexture } from '@react-three/drei'
import { createPortal, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { certificates, degrees } from '../../content/education'
import { profile } from '../../content/profile'
import { projects } from '../../content/projects'
import { skillGroups } from '../../content/skills'
import { audio } from '../../lib/audio'
import {
  clockFaceTexture,
  corkboardTexture,
  desktopScreenTexture,
  diplomaTexture,
  figuritaTexture,
  forGltf,
  jerseyBackTexture,
  paperTexture,
  phoneCallTexture,
  phoneScreenTexture,
  posterTexture,
  rugTexture,
} from '../../lib/canvasTextures'
import { nightMix, reducedMotion } from '../../lib/nightMix'
import { useAppStore } from '../../store/useAppStore'
import { ContactChat } from '../../ui/ContactChat'
import { ProjectsBrowser } from '../../ui/ProjectsBrowser'
import { CHAIR, SCREEN } from '../layout'
import { TvScreen } from '../tv/TvScreen'
import { INTERACTIVES, type InteractiveDef } from './interactives'
import { RoomMaterials, textureUrls } from './materials'

const MODEL = '/models/room.glb'
const AO = '/models/room_ao.webp'
const CERT_IMAGES = certificates.map((c) => c.image.replace('.webp', '-sm.webp'))
const PHOTO = profile.photo.replace('.webp', '-sm.webp')

type Nodes = Record<string, THREE.Object3D>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SETUPS = new WeakMap<THREE.Object3D, any>()

/**
 * El export de Blender convierte cada nodo de Z-arriba a Y-arriba (L' = C·L·C⁻¹) y el ROOT trae la rotación inversa.
 * Deshacemos la conversión nodo por nodo para que todo quede en coordenadas de three.js puras
 * (posiciones/rotaciones locales iguales a las de build_room.py).
 */
function normalizeBlenderAxes(scene: THREE.Object3D) {
  // idempotente: el GLB queda cacheado por useGLTF y en dev el HMR puede volver a ejecutar esto
  if (scene.userData.axesNormalized) return
  scene.userData.axesNormalized = true
  const C = new THREE.Matrix4().makeRotationX(-Math.PI / 2)
  const Ci = new THREE.Matrix4().makeRotationX(Math.PI / 2)
  // la compresión deduplica buffers: varias geometrías pueden compartir el mismo atributo → se transforma una vez
  const done = new Set<THREE.BufferAttribute | THREE.InterleavedBufferAttribute>()
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(Ci)
  scene.traverse((o) => {
    if (o === scene) return
    if (o.name === 'ROOT') {
      o.position.set(0, 0, 0)
      o.quaternion.identity()
      o.scale.set(1, 1, 1)
    } else {
      o.updateMatrix()
      const m = Ci.clone().multiply(o.matrix).multiply(C)
      m.decompose(o.position, o.quaternion, o.scale)
    }
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) {
      const g = mesh.geometry
      const pos = g.attributes.position
      const nor = g.attributes.normal
      if (pos && !done.has(pos)) {
        pos.applyMatrix4(Ci)
        pos.needsUpdate = true
        done.add(pos)
      }
      if (nor && !done.has(nor)) {
        nor.applyNormalMatrix(normalMatrix)
        nor.needsUpdate = true
        done.add(nor)
      }
      g.computeBoundingBox()
      g.computeBoundingSphere()
    }
  })
  scene.updateMatrixWorld(true)
}

function meshesOf(o: THREE.Object3D) {
  const out: THREE.Mesh[] = []
  o.traverse((c) => (c as THREE.Mesh).isMesh && out.push(c as THREE.Mesh))
  return out
}

function emissive(color: string, intensity = 1) {
  return new THREE.MeshStandardMaterial({ color: '#111111', emissive: color, emissiveIntensity: intensity, toneMapped: false, fog: false })
}

/** Habitación modelada en Blender (F13) con materiales PBR, texturas de canvas e interacciones. */
export function RoomModel() {
  const gltf = useGLTF(MODEL)
  const urls = useMemo(textureUrls, [])
  const texList = useTexture(urls)
  const aoTex = useTexture(AO)
  const certTex = useTexture(CERT_IMAGES)
  const photoTex = useTexture(PHOTO)
  const woolNor = texList[urls.indexOf('/textures/wool_boucle_nor.webp')]

  const setup = useMemo(() => {
    // en dev (StrictMode) useMemo puede correr dos veces: la preparación muta el GLB, así que se cachea
    const cached = SETUPS.get(gltf.scene)
    if (cached) return cached
    const ao = aoTex.clone()
    ao.flipY = false
    ao.channel = 1
    ao.colorSpace = THREE.NoColorSpace
    ao.needsUpdate = true
    const texMap = Object.fromEntries(urls.map((u, i) => [u, texList[i]]))
    const mats = new RoomMaterials(texMap, ao)
    const nodes = gltf.nodes as Nodes
    const scene = gltf.scene
    normalizeBlenderAxes(scene)

    // materiales base (PBR + AO) para todas las mallas
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const src = m.material as THREE.Material
      m.material = mats.get(src.name, !!m.geometry.attributes.uv1)
      const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3())
      m.castShadow = Math.max(size.x, size.y, size.z) > 0.06
      m.receiveShadow = true
    })

    // planos con texturas de canvas / imágenes
    const plane = (name: string, mat: THREE.Material) => {
      const o = nodes[name] as THREE.Mesh | undefined
      if (o) o.material = mat
      return o
    }
    const img = (t: THREE.Texture, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ map: forGltf(t), roughness: 0.55, fog: false, ...extra })
    degrees.forEach((d) => plane(`IMG_Diploma_${d.id}`, img(diplomaTexture(d, profile.name), { roughness: 0.4 })))
    certTex.forEach((t, i) => plane(`IMG_Cert_${i}`, img(t, { roughness: 0.35 })))
    plane('IMG_Photo', img(photoTex, { roughness: 0.3 }))
    plane('IMG_Corkboard', img(corkboardTexture(skillGroups), { roughness: 0.95 }))
    plane('IMG_Poster', img(posterTexture(), { roughness: 0.5 }))
    plane('IMG_JerseyBack', img(jerseyBackTexture(profile.shortName, '10'), { transparent: true, roughness: 0.8 }))
    plane('IMG_ClockFace', img(clockFaceTexture(), { roughness: 0.4 }))
    plane('IMG_Figurita', img(figuritaTexture(profile.shortName), { roughness: 0.3, side: THREE.DoubleSide }))
    const rugMat = new THREE.MeshStandardMaterial({ map: forGltf(rugTexture()), normalMap: woolNor.clone(), roughness: 1, fog: false, aoMap: ao })
    rugMat.normalMap!.wrapS = rugMat.normalMap!.wrapT = THREE.RepeatWrapping
    rugMat.normalMap!.repeat.set(9, 6)
    rugMat.normalMap!.needsUpdate = true
    plane('IMG_Rug', rugMat)
    plane('PAPER_CV', img(paperTexture(profile.name), { side: THREE.DoubleSide, roughness: 0.8 }))

    const desktop = forGltf(desktopScreenTexture(projects, profile.shortName))
    const screenMonitor = plane('SCREEN_Monitor', new THREE.MeshStandardMaterial({ map: desktop, emissiveMap: desktop, emissive: '#ffffff', emissiveIntensity: 0.8, roughness: 0.2, toneMapped: false, fog: false }))
    const phoneIdle = forGltf(phoneScreenTexture())
    const phoneCall = forGltf(phoneCallTexture(profile.shortName))
    const screenPhone = plane('SCREEN_Phone', new THREE.MeshStandardMaterial({ map: phoneIdle, emissiveMap: phoneIdle, emissive: '#ffffff', emissiveIntensity: 0.8, toneMapped: false, fog: false }))
    plane('GLASS_Window', new THREE.MeshPhysicalMaterial({ color: '#dfefff', transparent: true, opacity: 0.05, roughness: 0.04, metalness: 0, clearcoat: 1, fog: false, depthWrite: false }))
    plane('GLASS_Tower', new THREE.MeshStandardMaterial({ color: '#0b0f18', roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.85, fog: false }))

    // emisivos animados
    const leds = { shelf: [] as THREE.MeshStandardMaterial[], fairy: [] as THREE.MeshStandardMaterial[], rgb: [] as THREE.MeshStandardMaterial[] }
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      if (m.name.startsWith('LED_Shelf')) leds.shelf.push((m.material = emissive('#00d2ff', 0.1)) as THREE.MeshStandardMaterial)
      else if (m.name.startsWith('LED_Fairy')) leds.fairy.push((m.material = emissive('#ffcf87', 0.2)) as THREE.MeshStandardMaterial)
      else if (m.name.startsWith('RGB_')) leds.rgb.push((m.material = emissive('#ff00aa', 1.5)) as THREE.MeshStandardMaterial)
    })
    const consoleLed = plane('LED_Console', emissive('#00d2ff', 3))
    const printerLed = plane('LED_Printer', emissive('#38d39f', 1.2))
    const bulb = plane('BULB_Lamp', emissive('#ffc46b', 0.2))
    leds.fairy.forEach((m) => (m.emissiveIntensity = 0))
    void consoleLed

    // cortinas con brisa (desplazamiento en el vertex shader)
    const breeze = { value: 0 }
    ;['Curtain_L', 'Curtain_R'].forEach((n) => {
      const c = nodes[n] as THREE.Mesh | undefined
      if (!c) return
      const m = (c.material as THREE.MeshStandardMaterial).clone()
      m.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = breeze
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uTime;')
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float hang = clamp((2.65 - position.y) / 2.3, 0.0, 1.0);
            transformed.z += sin(uTime * 1.1 + position.y * 2.2 + position.x * 4.0) * 0.018 * hang * hang;
            transformed.x += sin(uTime * 0.7 + position.y * 1.5) * 0.008 * hang;`,
          )
      }
      c.material = m
    })

    // interactivos: mapa objeto → definición y materiales propios para poder resaltarlos
    const owner = new Map<THREE.Object3D, InteractiveDef>()
    const tintable = new Map<string, { mat: THREE.MeshStandardMaterial; base: THREE.Color; baseInt: number }[]>()
    const roots = new Map<string, THREE.Object3D[]>()
    for (const def of INTERACTIVES) {
      const objs = [
        ...def.nodes.map((n) => nodes[n]).filter(Boolean),
        ...Object.values(nodes).filter((o) => def.prefixes?.some((p) => o.name.startsWith(p)) && o.parent?.name === 'ROOT'),
      ]
      roots.set(def.id, objs)
      const list: { mat: THREE.MeshStandardMaterial; base: THREE.Color; baseInt: number }[] = []
      objs.forEach((o) => {
        owner.set(o, def)
        meshesOf(o).forEach((m) => {
          const mat = m.material as THREE.MeshStandardMaterial
          if (!mat.isMeshStandardMaterial || mat.emissiveMap || mat.transparent || mat.toneMapped === false) return
          const own = mat.clone()
          // mantener el shader custom de las cortinas
          own.onBeforeCompile = mat.onBeforeCompile
          m.material = own
          list.push({ mat: own, base: own.emissive.clone(), baseInt: own.emissiveIntensity })
        })
      })
      tintable.set(def.id, list)
    }

    const result = { scene, nodes, owner, tintable, roots, screenMonitor, screenPhone, phoneIdle, phoneCall, leds, printerLed, bulb, breeze }
    SETUPS.set(gltf.scene, result)
    return result
  }, [gltf, texList, aoTex, certTex, photoTex, urls, woolNor])

  return (
    <>
      <RoomInteractions setup={setup} />
      <RoomAnimations setup={setup} />
      <TvScreen screen={setup.nodes.SCREEN_TV as THREE.Mesh} />
      {setup.nodes.Monitor && createPortal(<MonitorHtml />, setup.nodes.Monitor)}
      {setup.nodes.Phone_Body && createPortal(<PhoneHtml />, setup.nodes.Phone_Body)}
      {setup.nodes.Clock && createPortal(<ClockHands />, setup.nodes.Clock)}
    </>
  )
}

type Setup = ReturnType<typeof useSetupType>
// helper solo para inferir el tipo del setup
function useSetupType() {
  return null as unknown as {
    scene: THREE.Group
    nodes: Nodes
    owner: Map<THREE.Object3D, InteractiveDef>
    tintable: Map<string, { mat: THREE.MeshStandardMaterial; base: THREE.Color; baseInt: number }[]>
    roots: Map<string, THREE.Object3D[]>
    screenMonitor?: THREE.Mesh
    screenPhone?: THREE.Mesh
    phoneIdle: THREE.Texture
    phoneCall: THREE.Texture
    leds: { shelf: THREE.MeshStandardMaterial[]; fairy: THREE.MeshStandardMaterial[]; rgb: THREE.MeshStandardMaterial[] }
    printerLed?: THREE.Mesh
    bulb?: THREE.Mesh
    breeze: { value: number }
  }
}

const HIGHLIGHT = new THREE.Color('#38c8ff')

/** Ruteo de eventos del GLB + resaltado + marcadores (F05) */
function RoomInteractions({ setup }: { setup: Setup }) {
  const hovered = useAppStore((s) => s.hovered)
  const overview = useAppStore((s) => s.section === null && s.focus === null)
  const started = useAppStore((s) => s.started)
  const amounts = useRef(new Map<string, number>())

  const findDef = (o: THREE.Object3D | null) => {
    while (o) {
      const d = setup.owner.get(o)
      if (d) return d
      o = o.parent
    }
    return null
  }

  const run = (def: InteractiveDef) => {
    const s = useAppStore.getState()
    audio.play('click')
    switch (def.action.type) {
      case 'section':
        s.setSection(def.action.section)
        break
      case 'focus':
        s.setFocus(def.action.focus)
        break
      case 'lamp':
        s.toggleNight()
        break
      case 'tv':
        if (s.tvChannel === 4) s.setFocus('penalties')
        else {
          s.nextChannel()
          audio.play(s.tvChannel === 0 ? 'tvOn' : 'static')
        }
        break
      case 'remote':
        s.nextChannel()
        audio.play('static')
        break
      case 'mate':
        window.dispatchEvent(new CustomEvent('mate'))
        audio.play('pour')
        s.showToast({ text: '¿Uno más? Este mate está para compartirlo 🧉', ms: 2600 })
        s.unlock('mate')
        break
      case 'figurita':
        audio.play('secret')
        s.unlock('figurita')
        break
    }
  }

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === 'touch') return
    const def = findDef(e.object)
    const id = def?.id ?? null
    if (useAppStore.getState().hovered !== id) useAppStore.getState().setHovered(id)
    document.body.style.cursor = id ? 'pointer' : ''
  }
  const onOut = () => {
    useAppStore.getState().setHovered(null)
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const def = findDef(e.object)
    if (!def) return
    e.stopPropagation()
    if (e.delta > 6) return
    run(def)
  }

  useFrame((_, dt) => {
    for (const [id, list] of setup.tintable) {
      const goal = hovered === id ? 1 : 0
      const cur = amounts.current.get(id) ?? 0
      if (Math.abs(cur - goal) < 0.002) continue
      const next = THREE.MathUtils.damp(cur, goal, 12, dt)
      amounts.current.set(id, next)
      for (const t of list) {
        t.mat.emissive.copy(t.base).lerp(HIGHLIGHT, next)
        t.mat.emissiveIntensity = t.baseInt + next * 0.28
      }
    }
  })

  // posiciones de los marcadores: tope del primer objeto + corrimiento
  const hotspots = useMemo(() => {
    return INTERACTIVES.filter((d) => d.hotspot).map((d) => {
      const box = new THREE.Box3()
      setup.roots.get(d.id)?.forEach((o) => box.expandByObject(o))
      const c = box.getCenter(new THREE.Vector3())
      const off = d.hotspotOffset ?? [0, 0.1, 0]
      return { def: d, pos: [c.x + off[0], box.max.y + off[1], c.z + off[2]] as [number, number, number] }
    })
  }, [setup])

  return (
    <>
      <primitive object={setup.scene} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick} />
      {started &&
        hotspots.map(({ def, pos }) => (
          <Html key={def.id} position={pos} center zIndexRange={[15, 0]} className="hotspot-wrap">
            <button
              type="button"
              className={`hotspot${hovered === def.id ? ' is-hovered' : ''}${overview ? '' : ' is-hidden'}`}
              onClick={() => run(def)}
              onPointerEnter={() => useAppStore.getState().setHovered(def.id)}
              onPointerLeave={() => useAppStore.getState().setHovered(null)}
              tabIndex={overview ? 0 : -1}
              aria-label={def.label}
            >
              <span className="hotspot-dot" />
              <span className="hotspot-label">{def.label}</span>
            </button>
          </Html>
        ))}
    </>
  )
}

/** Animaciones de piezas del GLB: silla, hoja de la impresora, LEDs, celular, cortinas, lámpara */
function RoomAnimations({ setup }: { setup: Setup }) {
  const { nodes } = setup
  const lampLight = useRef<THREE.SpotLight>(null)
  const lampGlow = useRef<THREE.PointLight>(null)
  const lampTarget = useMemo(() => new THREE.Object3D(), [])
  const scene = useThree((s) => s.scene)
  const steam = useRef<{ boost: number }>({ boost: 0 })

  useEffect(() => {
    scene.add(lampTarget)
    const onMate = () => (steam.current.boost = 1)
    window.addEventListener('mate', onMate)
    return () => {
      scene.remove(lampTarget)
      window.removeEventListener('mate', onMate)
    }
  }, [scene, lampTarget])

  // ubicar la luz de la lámpara en el cabezal
  const lampPos = useMemo(() => {
    const head = nodes.Lamp_Head
    const p = new THREE.Vector3()
    head?.getWorldPosition(p)
    lampTarget.position.set(p.x - 0.35, 0.76, p.z + 0.35)
    return p
  }, [nodes, lampTarget])

  useFrame(({ clock }, dt) => {
    const s = useAppStore.getState()
    const t = clock.elapsedTime
    const n = nightMix.value
    // silla: rueda a un costado cuando se enfoca la compu
    const chair = nodes.Chair
    if (chair) {
      const aside = s.section === 'projects'
      easing.damp(chair.position, 'x', CHAIR.x + (aside ? 1.0 : 0), 0.35, dt)
      easing.damp(chair.position, 'z', CHAIR.z + (aside ? 0.4 : 0), 0.35, dt)
      easing.damp(chair.rotation, 'y', aside ? -1.1 : CHAIR.rot, 0.35, dt)
    }
    // hoja que sale de la impresora
    const paper = nodes.PAPER_CV
    if (paper) easing.damp(paper.position, 'z', s.section === 'cv' ? 0.3 : -0.03, s.section === 'cv' ? 0.6 : 0.2, dt)
    const pled = setup.printerLed?.material as THREE.MeshStandardMaterial | undefined
    if (pled) pled.emissiveIntensity = s.section === 'cv' ? 2 + Math.sin(t * 8) * 1.5 : 1.2
    // LEDs y RGB
    setup.leds.shelf.forEach((m) => (m.emissiveIntensity = 0.05 + n * 3))
    setup.leds.fairy.forEach((m, i) => (m.emissiveIntensity = n * (2.2 + Math.sin(t * 1.5 + i * 0.9) * 0.6)))
    setup.leds.rgb.forEach((m, i) => {
      m.emissive.setHSL((t * 0.08 + i * 0.12) % 1, 1, 0.5)
      m.emissiveIntensity = 1.4 + n * 2
    })
    const bulb = setup.bulb?.material as THREE.MeshStandardMaterial | undefined
    if (bulb) bulb.emissiveIntensity = 0.2 + n * 6
    if (lampLight.current) lampLight.current.intensity = n * 9
    if (lampGlow.current) lampGlow.current.intensity = n * 2.4
    const mon = setup.screenMonitor?.material as THREE.MeshStandardMaterial | undefined
    if (mon) mon.emissiveIntensity = 0.75 + n * 0.55
    // celular: vibra cuando suena
    const body = nodes.Phone_Body
    const scr = setup.screenPhone?.material as THREE.MeshStandardMaterial | undefined
    if (body && scr) {
      const ringing = s.phoneRinging
      const buzz = ringing && Math.sin(t * 2.6) > -0.2 ? Math.sin(t * 90) * 0.035 : 0
      body.rotation.z = buzz
      const map = ringing ? setup.phoneCall : setup.phoneIdle
      if (scr.map !== map) {
        scr.map = map
        scr.emissiveMap = map
        scr.needsUpdate = true
      }
      scr.emissiveIntensity = 0.75 + n * 0.4 + (ringing ? Math.sin(t * 6) * 0.25 : 0)
    }
    setup.breeze.value = reducedMotion ? 0 : t
    steam.current.boost = Math.max(0, steam.current.boost - dt * 0.25)
  })

  return (
    <>
      <spotLight
        ref={lampLight}
        position={lampPos}
        target={lampTarget}
        angle={0.95}
        penumbra={0.85}
        distance={4}
        decay={1.5}
        color="#ffbf73"
        intensity={0}
      />
      <pointLight ref={lampGlow} position={[lampPos.x + 0.05, lampPos.y - 0.1, lampPos.z + 0.25]} color="#ffb766" distance={5} decay={1.4} intensity={0} />
      <Steam boost={steam} />
    </>
  )
}

/** Vapor del mate (F14): partículas suaves que suben; al cebar salen más */
function Steam({ boost }: { boost: React.RefObject<{ boost: number }> }) {
  const N = 16
  const ref = useRef<THREE.Points>(null)
  const { geo, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3))
    return { geo: g, seeds: Array.from({ length: N }, (_, i) => i / N) }
  }, [])
  const mat = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.07, transparent: true, depthWrite: false, opacity: 0.35, fog: false })
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const b = boost.current?.boost ?? 0
    const pos = geo.attributes.position as THREE.BufferAttribute
    const base = [-0.27, 0.87, -2.44] // boca del mate
    seeds.forEach((sd, i) => {
      const life = (t * (0.25 + b * 0.4) + sd) % 1
      pos.setXYZ(i, base[0] + Math.sin(t * 2 + i) * 0.015 * life, base[1] + life * (0.18 + b * 0.25), base[2] + Math.cos(t * 1.7 + i) * 0.015 * life)
    })
    pos.needsUpdate = true
    mat.opacity = 0.18 + b * 0.5
  })
  return <points ref={ref} geometry={geo} material={mat} />
}

/** HTML real dentro del monitor (F08) — anclado al nodo Monitor del GLB */
function MonitorHtml() {
  const show = useAppStore((s) => s.section === 'projects' && s.cameraSettled)
  const wide = useThree((s) => s.size.width >= 900)
  if (!show || !wide) return null
  const pxH = Math.round((SCREEN.px * SCREEN.h) / SCREEN.w)
  return (
    <group>
      <Html transform position={[0, 0.428, 0.019]} distanceFactor={(SCREEN.w * 400) / SCREEN.px} zIndexRange={[12, 0]}>
        <div className="screen-html" style={{ width: SCREEN.px, height: pxH }} onPointerDown={(e) => e.stopPropagation()}>
          <ProjectsBrowser variant="screen" />
        </div>
      </Html>
    </group>
  )
}

/** Chat de contacto dentro del celular (F22) */
function PhoneHtml() {
  const show = useAppStore((s) => s.section === 'contact' && s.cameraSettled)
  const wide = useThree((s) => s.size.width >= 900)
  if (!show || !wide) return null
  const W = 360
  const H = 760
  return (
    <group>
      <Html transform position={[0, 0, 0.0056]} distanceFactor={(0.07 * 400) / W} zIndexRange={[12, 0]}>
        <div className="phone-html" style={{ width: W, height: H }} onPointerDown={(e) => e.stopPropagation()}>
          <ContactChat variant="phone" />
        </div>
      </Html>
    </group>
  )
}

/** Agujas del reloj con la hora real */
function ClockHands() {
  const h = useRef<THREE.Mesh>(null)
  const m = useRef<THREE.Mesh>(null)
  const s = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => {
    const mk = (len: number, w: number) => new THREE.BoxGeometry(w, len, 0.003).translate(0, len / 2 - 0.015, 0)
    return { h: mk(0.09, 0.012), m: mk(0.13, 0.008), s: mk(0.14, 0.003) }
  }, [])
  useFrame(() => {
    const d = new Date()
    const sec = d.getSeconds() + d.getMilliseconds() / 1000
    const min = d.getMinutes() + sec / 60
    const hr = (d.getHours() % 12) + min / 60
    if (s.current) s.current.rotation.z = -(sec / 60) * Math.PI * 2
    if (m.current) m.current.rotation.z = -(min / 60) * Math.PI * 2
    if (h.current) h.current.rotation.z = -(hr / 12) * Math.PI * 2
  })
  return (
    <group>
      <group position={[0, 0, 0.022]}>
        <mesh ref={h} geometry={geo.h}>
          <meshStandardMaterial color="#1d1f24" />
        </mesh>
        <mesh ref={m} geometry={geo.m} position={[0, 0, 0.003]}>
          <meshStandardMaterial color="#1d1f24" />
        </mesh>
        <mesh ref={s} geometry={geo.s} position={[0, 0, 0.006]}>
          <meshStandardMaterial color="#e63946" />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL)
