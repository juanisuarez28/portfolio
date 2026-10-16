export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Calidad inicial según el hardware (F25). Arranca en "low" en celulares, CPUs/RAM chicas y GPUs integradas o por software;
 * el resto arranca en "high" y el PerformanceMonitor baja si caen los FPS.
 */
export function detectQuality(): 'high' | 'low' {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (window.matchMedia('(pointer: coarse)').matches) return 'low'
    if ((nav.hardwareConcurrency ?? 8) <= 4) return 'low'
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return 'low'
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return 'low'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|software|basic render|microsoft basic|intel|mali|adreno|powervr|videocore/i.test(renderer)) return 'low'
  } catch {
    /* sin info: se asume alta y decide el PerformanceMonitor */
  }
  return 'high'
}
