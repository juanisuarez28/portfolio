import * as THREE from 'three'
import type { Degree, Project, SkillGroup } from '../content/types'

// Texturas generadas en canvas (ADR-004): sin archivos ni red, memoizadas por clave.

export const FONT = "'Outfit', 'Segoe UI', system-ui, sans-serif"
export const HAND = "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive"
export const SERIF = "Georgia, 'Times New Roman', serif"

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

const cache = new Map<string, THREE.CanvasTexture>()

export function canvasTexture(
  key: string,
  w: number,
  h: number,
  draw: Draw,
  opts: { repeat?: [number, number] } = {},
): THREE.CanvasTexture {
  const cached = cache.get(key)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...opts.repeat)
  }
  cache.set(key, tex)
  return tex
}

/** PRNG determinístico para que las texturas sean iguales en cada carga */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function shade(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, amt)
  return `#${c.getHexString()}`
}

// ───────────────────────────── Piso y alfombra ─────────────────────────────

export function woodFloorTexture() {
  return canvasTexture(
    'wood-floor',
    1024,
    1024,
    (ctx, w, h) => {
      const r = rng(7)
      const rows = 8
      const rowH = h / rows
      for (let i = 0; i < rows; i++) {
        let x = -r() * 300
        while (x < w) {
          const len = 280 + r() * 360
          const base = new THREE.Color('#b8875a').offsetHSL((r() - 0.5) * 0.02, (r() - 0.5) * 0.08, (r() - 0.5) * 0.08)
          ctx.fillStyle = `#${base.getHexString()}`
          ctx.fillRect(x, i * rowH, len, rowH)
          // vetas
          for (let g = 0; g < 14; g++) {
            ctx.strokeStyle = `rgba(80,50,25,${0.05 + r() * 0.08})`
            ctx.lineWidth = 1 + r() * 2
            ctx.beginPath()
            const y = i * rowH + r() * rowH
            ctx.moveTo(x, y)
            ctx.bezierCurveTo(x + len * 0.3, y + (r() - 0.5) * 10, x + len * 0.6, y + (r() - 0.5) * 10, x + len, y)
            ctx.stroke()
          }
          // nudos
          if (r() > 0.75) {
            ctx.fillStyle = 'rgba(90,55,30,0.25)'
            ctx.beginPath()
            ctx.ellipse(x + r() * len, i * rowH + rowH / 2, 10 + r() * 8, 5 + r() * 3, 0, 0, Math.PI * 2)
            ctx.fill()
          }
          // junta
          ctx.fillStyle = 'rgba(50,30,15,0.55)'
          ctx.fillRect(x, i * rowH, 3, rowH)
          x += len
        }
        ctx.fillStyle = 'rgba(50,30,15,0.6)'
        ctx.fillRect(0, i * rowH, w, 3)
      }
    },
    { repeat: [1.5, 1.5] },
  )
}

export function rugTexture() {
  return canvasTexture('rug', 1024, 680, (ctx, w, h) => {
    ctx.fillStyle = '#e9dfcf'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#24324a'
    ctx.fillRect(28, 28, w - 56, h - 56)
    ctx.strokeStyle = '#e0a43a'
    ctx.lineWidth = 10
    ctx.strokeRect(62, 62, w - 124, h - 124)
    ctx.strokeStyle = '#00d2ff'
    ctx.lineWidth = 4
    ctx.strokeRect(86, 86, w - 172, h - 172)
    // rombos
    const cols = 7
    const rows = 4
    const cw = (w - 240) / cols
    const ch = (h - 240) / rows
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const cx = 120 + cw * (i + 0.5)
        const cy = 120 + ch * (j + 0.5)
        ctx.fillStyle = (i + j) % 2 ? '#c8674a' : '#e9dfcf'
        ctx.beginPath()
        ctx.moveTo(cx, cy - ch * 0.32)
        ctx.lineTo(cx + cw * 0.32, cy)
        ctx.lineTo(cx, cy + ch * 0.32)
        ctx.lineTo(cx - cw * 0.32, cy)
        ctx.closePath()
        ctx.fill()
      }
    // textura de tejido
    const r = rng(3)
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${r() * 0.07})`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
  })
}

// ───────────────────────────── Vista de Tandil ─────────────────────────────

function ridge(seed: number, w: number, base: number, amp: number, freq: number) {
  const r = rng(seed)
  const phases = [r() * 10, r() * 10, r() * 10]
  const pts: number[] = []
  for (let x = 0; x <= w; x += 8) {
    const t = x / w
    const y =
      base -
      amp *
        (0.55 * Math.sin(t * freq + phases[0]) +
          0.3 * Math.sin(t * freq * 2.3 + phases[1]) +
          0.15 * Math.sin(t * freq * 5.1 + phases[2]) +
          0.08 * (r() - 0.5))
    pts.push(y)
  }
  return pts
}

function fillRidge(ctx: CanvasRenderingContext2D, pts: number[], w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, h)
  pts.forEach((y, i) => ctx.lineTo(Math.min(i * 8, w), y))
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()
}

export function tandilViewTexture(night: boolean) {
  return canvasTexture(`tandil-${night ? 'night' : 'day'}`, 2048, 1024, (ctx, w, h) => {
    const r = rng(night ? 11 : 5)
    // cielo
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.75)
    if (night) {
      sky.addColorStop(0, '#060b1f')
      sky.addColorStop(0.6, '#15224a')
      sky.addColorStop(1, '#2c3c70')
    } else {
      sky.addColorStop(0, '#5ea4dd')
      sky.addColorStop(0.65, '#a9d2ee')
      sky.addColorStop(1, '#f6e2c0')
    }
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    if (night) {
      for (let i = 0; i < 380; i++) {
        const a = 0.3 + r() * 0.7
        ctx.fillStyle = `rgba(255,255,240,${a})`
        const s = r() < 0.08 ? 3 : 1.6
        ctx.fillRect(r() * w, r() * h * 0.55, s, s)
      }
      // luna
      const mx = w * 0.72
      const my = h * 0.2
      const glow = ctx.createRadialGradient(mx, my, 10, mx, my, 160)
      glow.addColorStop(0, 'rgba(255,248,220,0.5)')
      glow.addColorStop(1, 'rgba(255,248,220,0)')
      ctx.fillStyle = glow
      ctx.fillRect(mx - 160, my - 160, 320, 320)
      ctx.fillStyle = '#fff6dc'
      ctx.beginPath()
      ctx.arc(mx, my, 44, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(200,190,160,0.35)'
      ctx.beginPath()
      ctx.arc(mx - 12, my - 8, 9, 0, Math.PI * 2)
      ctx.arc(mx + 14, my + 12, 6, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // sol
      const sx = w * 0.7
      const sy = h * 0.22
      const glow = ctx.createRadialGradient(sx, sy, 20, sx, sy, 260)
      glow.addColorStop(0, 'rgba(255,240,200,0.9)')
      glow.addColorStop(1, 'rgba(255,240,200,0)')
      ctx.fillStyle = glow
      ctx.fillRect(sx - 260, sy - 260, 520, 520)
      ctx.fillStyle = '#fff7df'
      ctx.beginPath()
      ctx.arc(sx, sy, 56, 0, Math.PI * 2)
      ctx.fill()
      // nubes
      for (let i = 0; i < 7; i++) {
        const cx = r() * w
        const cy = h * (0.08 + r() * 0.3)
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        for (let k = 0; k < 6; k++) {
          ctx.beginPath()
          ctx.ellipse(cx + (k - 3) * 38 + r() * 20, cy + r() * 16, 50 + r() * 30, 22 + r() * 12, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // sierras (de atrás hacia adelante)
    const far = ridge(21, w, h * 0.52, h * 0.1, 9)
    fillRidge(ctx, far, w, h, night ? '#1f2c4f' : '#9db3c9')
    const mid = ridge(42, w, h * 0.6, h * 0.12, 6)
    // cerro con la Piedra Movediza
    const peakX = Math.floor(w * 0.36)
    const peakIdx = Math.floor(peakX / 8)
    for (let i = 0; i < mid.length; i++) {
      const d = Math.abs(i - peakIdx) / 30
      mid[i] = Math.min(mid[i], h * 0.43 + d * d * h * 0.06 + (d > 1.5 ? 999 : 0))
    }
    fillRidge(ctx, mid, w, h, night ? '#17223d' : '#7f9f7a')
    // Piedra Movediza: roca apoyada en la cima
    const py = mid[peakIdx]
    ctx.fillStyle = night ? '#0f1729' : '#6e6a66'
    ctx.beginPath()
    ctx.ellipse(peakX + 4, py - 30, 42, 30, -0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = night ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.18)'
    ctx.beginPath()
    ctx.ellipse(peakX - 6, py - 42, 18, 9, -0.25, 0, Math.PI * 2)
    ctx.fill()

    const near = ridge(77, w, h * 0.72, h * 0.06, 4)
    fillRidge(ctx, near, w, h, night ? '#111a2e' : '#5f8a52')

    // árboles
    for (let i = 0; i < 70; i++) {
      const x = r() * w
      const y = near[Math.floor(x / 8)] + 4 + r() * 30
      ctx.fillStyle = night ? '#0b1322' : shade('#3f6e3a', (r() - 0.5) * 0.08)
      ctx.beginPath()
      ctx.ellipse(x, y, 14 + r() * 12, 20 + r() * 14, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // ciudad
    const groundY = h * 0.8
    ctx.fillStyle = night ? '#0d1424' : '#8fae78'
    ctx.fillRect(0, groundY, w, h - groundY)
    for (let i = 0; i < 90; i++) {
      const x = r() * w
      const bw = 30 + r() * 50
      const bh = 26 + r() * 50
      const y = groundY + r() * (h - groundY) * 0.7
      ctx.fillStyle = night ? '#1a2238' : shade(['#efe6d8', '#e4d3bd', '#f3efe7', '#d9c3a5'][i % 4], 0)
      ctx.fillRect(x, y - bh, bw, bh)
      ctx.fillStyle = night ? '#141b2e' : ['#b5523b', '#9b4a35', '#c86b4a'][i % 3]
      ctx.beginPath()
      ctx.moveTo(x - 4, y - bh)
      ctx.lineTo(x + bw / 2, y - bh - 16 - r() * 10)
      ctx.lineTo(x + bw + 4, y - bh)
      ctx.closePath()
      ctx.fill()
      // ventanas
      const lit = night ? 0.55 : 0
      for (let k = 0; k < 3; k++) {
        if (r() < lit) {
          ctx.fillStyle = '#ffd27a'
          ctx.fillRect(x + 6 + k * (bw / 3), y - bh + 10, 7, 9)
        } else if (!night) {
          ctx.fillStyle = 'rgba(60,80,100,0.5)'
          ctx.fillRect(x + 6 + k * (bw / 3), y - bh + 10, 7, 9)
        }
      }
    }
    if (night) {
      // faroles
      for (let i = 0; i < 60; i++) {
        const x = r() * w
        const y = groundY + 10 + r() * (h - groundY - 20)
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14)
        g.addColorStop(0, 'rgba(255,210,122,0.9)')
        g.addColorStop(1, 'rgba(255,210,122,0)')
        ctx.fillStyle = g
        ctx.fillRect(x - 14, y - 14, 28, 28)
      }
    }
  })
}

// ───────────────────────────── Diplomas y certificados ─────────────────────────────

export function diplomaTexture(degree: Degree, name: string) {
  return canvasTexture(`diploma-${degree.id}`, 1024, 724, (ctx, w, h) => {
    ctx.fillStyle = '#f7f0dd'
    ctx.fillRect(0, 0, w, h)
    const r = rng(9)
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(150,120,70,${r() * 0.05})`
      ctx.fillRect(r() * w, r() * h, 2, 2)
    }
    ctx.strokeStyle = '#1f3a68'
    ctx.lineWidth = 10
    ctx.strokeRect(30, 30, w - 60, h - 60)
    ctx.strokeStyle = '#c9a24a'
    ctx.lineWidth = 3
    ctx.strokeRect(50, 50, w - 100, h - 100)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#1f3a68'
    ctx.font = `600 30px ${SERIF}`
    ctx.fillText('UNIVERSIDAD NACIONAL DEL CENTRO', w / 2, 130)
    ctx.font = `400 22px ${SERIF}`
    ctx.fillText('DE LA PROVINCIA DE BUENOS AIRES', w / 2, 164)
    ctx.font = `italic 26px ${SERIF}`
    ctx.fillStyle = '#5b4a33'
    ctx.fillText('otorga a', w / 2, 232)
    ctx.font = `700 58px ${SERIF}`
    ctx.fillStyle = '#1b1b1b'
    ctx.fillText(name, w / 2, 300)
    ctx.font = `italic 26px ${SERIF}`
    ctx.fillStyle = '#5b4a33'
    ctx.fillText(degree.id === 'duia' ? 'el diploma de' : 'el título de', w / 2, 358)
    ctx.font = `600 36px ${SERIF}`
    ctx.fillStyle = '#1f3a68'
    wrapText(ctx, degree.title, w - 240).forEach((line, i) => ctx.fillText(line, w / 2, 412 + i * 46))

    // sello
    ctx.fillStyle = '#b8323a'
    ctx.beginPath()
    ctx.arc(w - 170, h - 150, 58, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#c9a24a'
    ctx.beginPath()
    ctx.arc(w - 170, h - 150, 40, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#7a1e24'
    ctx.font = `700 22px ${SERIF}`
    ctx.fillText(degree.shortTitle, w - 170, h - 142)
    // firmas
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    ;[w * 0.25, w * 0.52].forEach((x) => {
      ctx.beginPath()
      ctx.moveTo(x - 110, h - 120)
      ctx.lineTo(x + 110, h - 120)
      ctx.stroke()
    })
    ctx.font = `400 18px ${SERIF}`
    ctx.fillStyle = '#555'
    ctx.fillText('Rector', w * 0.25, h - 94)
    ctx.fillText('Decano', w * 0.52, h - 94)
  })
}

// ───────────────────────────── Corcho de skills ─────────────────────────────

export function corkboardTexture(groups: SkillGroup[]) {
  return canvasTexture('corkboard', 1400, 1000, (ctx, w, h) => {
    ctx.fillStyle = '#c49a6c'
    ctx.fillRect(0, 0, w, h)
    const r = rng(17)
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(90,55,25,${r() * 0.35})` : `rgba(240,210,160,${r() * 0.3})`
      ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3)
    }
    // título
    ctx.save()
    ctx.translate(w / 2, 86)
    ctx.rotate(-0.015)
    ctx.fillStyle = '#fbf7ef'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6
    ctx.fillRect(-230, -50, 460, 100)
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#1d1f24'
    ctx.font = `700 64px ${HAND}`
    ctx.textAlign = 'center'
    ctx.fillText('Mis skills ⚡', 0, 20)
    ctx.restore()

    const positions = [
      [60, 170],
      [510, 170],
      [960, 170],
      [280, 580],
      [740, 580],
    ]
    groups.forEach((g, i) => {
      const [x, y] = positions[i % positions.length]
      const pw = 380
      const ph = 380
      ctx.save()
      ctx.translate(x + pw / 2, y + ph / 2)
      ctx.rotate((r() - 0.5) * 0.08)
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 16
      ctx.shadowOffsetY = 8
      ctx.fillStyle = g.color
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph)
      ctx.shadowColor = 'transparent'
      // banda superior más oscura
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(-pw / 2, -ph / 2, pw, 46)
      ctx.fillStyle = '#1d1f24'
      ctx.textAlign = 'left'
      ctx.font = `700 50px ${HAND}`
      ctx.fillText(g.title, -pw / 2 + 24, -ph / 2 + 80)
      ctx.font = `500 38px ${HAND}`
      const lh = g.skills.length > 6 ? 36 : 42
      g.skills.forEach((s, k) => ctx.fillText(`• ${s}`, -pw / 2 + 30, -ph / 2 + 132 + k * lh))
      // chinche
      ctx.fillStyle = ['#e63946', '#1d6fd1', '#2a9d8f', '#f4a261', '#9b5de5'][i % 5]
      ctx.beginPath()
      ctx.arc(0, -ph / 2 + 18, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(-4, -ph / 2 + 13, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  })
}

// ───────────────────────────── Pantallas ─────────────────────────────

export function desktopScreenTexture(projects: Project[], name: string) {
  return canvasTexture('desktop-screen', 1280, 800, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#071a2e')
    bg.addColorStop(0.55, '#0b2d4f')
    bg.addColorStop(1, '#0350c3')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    // sierras en el wallpaper
    const ridgePts = ridge(5, w, h * 0.78, h * 0.08, 6)
    fillRidge(ctx, ridgePts, w, h, 'rgba(0,210,255,0.12)')
    const ridge2 = ridge(8, w, h * 0.86, h * 0.05, 4)
    fillRidge(ctx, ridge2, w, h, 'rgba(0,0,0,0.25)')

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = `700 92px ${FONT}`
    ctx.fillText('juani.dev', w * 0.62, h * 0.42)
    ctx.font = `400 34px ${FONT}`
    ctx.fillStyle = '#7fe8ff'
    ctx.fillText(`${name} · Full Stack`, w * 0.62, h * 0.42 + 56)
    ctx.font = `500 26px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('▶  Hacé clic para ver mis proyectos', w * 0.62, h * 0.42 + 120)

    // íconos del escritorio
    const icons = projects.slice(0, 8)
    icons.forEach((p, i) => {
      const col = Math.floor(i / 4)
      const row = i % 4
      const x = 40 + col * 150
      const y = 40 + row * 160
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.roundRect(x + 25, y, 90, 90, 22)
      ctx.fill()
      ctx.fillStyle = p.color === '#f1f1f1' ? '#1d1f24' : '#ffffff'
      ctx.font = `700 40px ${FONT}`
      ctx.fillText(p.name.replace(/[^A-Za-z]/g, '').slice(0, 2), x + 70, y + 60)
      ctx.fillStyle = '#ffffff'
      ctx.font = `500 20px ${FONT}`
      ctx.fillText(p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name, x + 70, y + 120)
    })

    // barra de tareas
    ctx.fillStyle = 'rgba(5,12,24,0.75)'
    ctx.fillRect(0, h - 56, w, 56)
    ctx.fillStyle = '#00d2ff'
    ctx.beginPath()
    ctx.roundRect(16, h - 46, 36, 36, 8)
    ctx.fill()
    ;['#ff8a3d', '#2ecc71', '#f5c542', '#9b59b6'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.roundRect(72 + i * 50, h - 44, 32, 32, 8)
      ctx.fill()
    })
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'right'
    ctx.font = `500 22px ${FONT}`
    ctx.fillText('Tandil · AR', w - 20, h - 20)
  })
}

export function phoneScreenTexture() {
  return canvasTexture('phone-screen', 360, 720, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#0350c3')
    bg.addColorStop(1, '#00d2ff')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = `300 110px ${FONT}`
    ctx.fillText('10:28', w / 2, 200)
    ctx.font = `400 26px ${FONT}`
    ctx.fillText('Hacé clic para contactarme', w / 2, 250)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.beginPath()
    ctx.roundRect(24, 330, w - 48, 130, 26)
    ctx.fill()
    ctx.fillStyle = '#0350c3'
    ctx.textAlign = 'left'
    ctx.font = `700 28px ${FONT}`
    ctx.fillText('✉  Nuevo mensaje', 48, 380)
    ctx.fillStyle = '#333'
    ctx.font = `400 25px ${FONT}`
    ctx.fillText('¿Arrancamos un proyecto?', 48, 425)
  })
}

export function jerseyBackTexture(name: string, number: string) {
  return canvasTexture(`jersey-${name}-${number}`, 512, 512, (ctx, w) => {
    ctx.clearRect(0, 0, w, w)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 78px ${FONT}`
    ctx.fillText(name.toUpperCase(), w / 2, 130)
    ctx.font = `800 250px ${FONT}`
    ctx.fillText(number, w / 2, 370)
  })
}

export function paperTexture(name: string) {
  return canvasTexture('cv-paper', 512, 724, (ctx, w, h) => {
    ctx.fillStyle = '#fdfcf8'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#0350c3'
    ctx.fillRect(0, 0, w, 120)
    ctx.fillStyle = '#fff'
    ctx.font = `700 46px ${FONT}`
    ctx.fillText('CV', 40, 78)
    ctx.font = `400 26px ${FONT}`
    ctx.fillText(name, 120, 76)
    ctx.fillStyle = '#c9ced6'
    for (let i = 0; i < 14; i++) {
      const y = 170 + i * 38
      ctx.fillRect(40, y, (i % 4 === 0 ? 0.4 : 0.6 + ((i * 37) % 30) / 100) * (w - 80), 12)
    }
    ctx.fillStyle = '#00d2ff'
    ctx.fillRect(40, h - 60, 140, 10)
  })
}

export function bookSpineTexture(title: string, color: string) {
  return canvasTexture(`book-${title}`, 64, 256, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillRect(0, 20, w, 4)
    ctx.fillRect(0, h - 24, w, 4)
    ctx.save()
    ctx.translate(w / 2 + 8, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.font = `700 24px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(title, 0, 0)
    ctx.restore()
  })
}

export function posterTexture() {
  return canvasTexture('poster', 600, 840, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#f4a261')
    bg.addColorStop(1, '#e76f51')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff3d6'
    ctx.beginPath()
    ctx.arc(w / 2, h * 0.36, 130, 0, Math.PI * 2)
    ctx.fill()
    const pts = ridge(31, w, h * 0.62, h * 0.07, 5)
    fillRidge(ctx, pts, w, h, '#264653')
    const peak = Math.floor(w * 0.5)
    const py = pts[Math.floor(peak / 8)]
    ctx.fillStyle = '#1b3440'
    ctx.beginPath()
    ctx.ellipse(peak, py - 26, 40, 28, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#264653'
    ctx.fillRect(0, h * 0.72, w, h)
    ctx.fillStyle = '#fff3d6'
    ctx.textAlign = 'center'
    ctx.font = `800 96px ${FONT}`
    ctx.fillText('TANDIL', w / 2, h * 0.86)
    ctx.font = `500 28px ${FONT}`
    ctx.fillText('Piedra Movediza · Buenos Aires', w / 2, h * 0.92)
  })
}

// ───────────────────────────── v2: reloj, figurita, llamada ─────────────────────────────

export function clockFaceTexture() {
  return canvasTexture('clock-face', 512, 512, (ctx, w) => {
    const c = w / 2
    ctx.fillStyle = '#fbf7ef'
    ctx.beginPath()
    ctx.arc(c, c, c, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d1f24'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 52px ${FONT}`
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.fillText(String(i), c + Math.sin(a) * 190, c - Math.cos(a) * 190)
    }
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const r0 = i % 5 === 0 ? 228 : 236
      ctx.lineWidth = i % 5 === 0 ? 5 : 2
      ctx.strokeStyle = '#1d1f24'
      ctx.beginPath()
      ctx.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0)
      ctx.lineTo(c + Math.sin(a) * 248, c - Math.cos(a) * 248)
      ctx.stroke()
    }
    ctx.font = `500 22px ${FONT}`
    ctx.fillStyle = '#00a3c7'
    ctx.fillText('TANDIL', c, c + 90)
  })
}

export function figuritaTexture(name: string) {
  return canvasTexture('figurita', 256, 350, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#75aadb')
    g.addColorStop(0.5, '#ffffff')
    g.addColorStop(1, '#75aadb')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#d4a72c'
    ctx.lineWidth = 10
    ctx.strokeRect(8, 8, w - 16, h - 16)
    // silueta del jugador
    ctx.fillStyle = '#1d1f24'
    ctx.beginPath()
    ctx.arc(w / 2, 120, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(w / 2 - 70, 165, 140, 110, 30)
    ctx.fill()
    ctx.fillStyle = '#d4a72c'
    ctx.font = `800 24px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('★ ★ ★', w / 2, 52)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(18, 280, w - 36, 52)
    ctx.fillStyle = '#1d1f24'
    ctx.font = `800 26px ${FONT}`
    ctx.fillText(name.toUpperCase(), w / 2, 316)
  })
}

export function phoneCallTexture(name: string) {
  return canvasTexture('phone-call', 360, 720, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#0b3d2e')
    bg.addColorStop(1, '#13191f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.textAlign = 'center'
    ctx.font = `400 26px ${FONT}`
    ctx.fillText('Llamada entrante', w / 2, 120)
    ctx.fillStyle = '#25d366'
    ctx.beginPath()
    ctx.arc(w / 2, 260, 80, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 80px ${FONT}`
    ctx.fillText(name[0], w / 2, 290)
    ctx.font = `700 40px ${FONT}`
    ctx.fillText(name, w / 2, 400)
    ctx.font = `400 22px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('Tocá para atender', w / 2, 440)
    ctx.fillStyle = '#e03131'
    ctx.beginPath()
    ctx.arc(w * 0.28, 600, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#25d366'
    ctx.beginPath()
    ctx.arc(w * 0.72, 600, 42, 0, Math.PI * 2)
    ctx.fill()
  })
}

/** Copia de una textura con flipY = false, para planos con UV de glTF */
const gltfCache = new Map<string, THREE.Texture>()
export function forGltf(t: THREE.Texture) {
  let c = gltfCache.get(t.uuid)
  if (!c) {
    c = t.clone()
    c.flipY = false
    c.needsUpdate = true
    gltfCache.set(t.uuid, c)
  }
  return c
}
