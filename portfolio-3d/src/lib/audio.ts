/**
 * Sonido sintetizado con Web Audio (F23): sin archivos, sin licencias, cero peso.
 * - Ambiente: pajaritos de día, grillos de noche (fundido cruzado).
 * - Efectos cortos (sfx) y una radio lo-fi en loop para el canal 3 de la tele.
 * El contexto se crea recién en un gesto del usuario (requisito de los navegadores).
 */
type Sfx = 'click' | 'kick' | 'bounce' | 'goal' | 'whistle' | 'static' | 'vibrate' | 'pour' | 'secret' | 'tvOn' | 'save' | 'tap'

class AudioEngine {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private dayBus!: GainNode
  private nightBus!: GainNode
  private radioBus!: GainNode
  private analyser!: AnalyserNode
  private noise!: AudioBuffer
  private enabled = false
  private night = false
  private radioOn = false
  private timers: number[] = []
  private radioStep = 0
  private radioNext = 0
  private levelData = new Uint8Array(32)

  private ensure() {
    if (this.ctx) return this.ctx
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)
    this.dayBus = this.bus(0)
    this.nightBus = this.bus(0)
    this.radioBus = this.bus(0)
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 64
    this.radioBus.connect(this.analyser)
    // buffer de ruido blanco reutilizable
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = this.noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    this.startAmbience()
    return ctx
  }

  private bus(gain: number) {
    const g = this.ctx!.createGain()
    g.gain.value = gain
    g.connect(this.master)
    return g
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (!on && !this.ctx) return
    const ctx = this.ensure()
    if (on) void ctx.resume()
    this.master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.25)
  }

  setNight(night: boolean) {
    this.night = night
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.dayBus.gain.setTargetAtTime(night ? 0 : 0.5, t, 0.8)
    this.nightBus.gain.setTargetAtTime(night ? 0.45 : 0, t, 0.8)
  }

  setRadio(on: boolean) {
    this.radioOn = on
    if (!this.ctx) return
    this.radioBus.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.2)
    if (on) this.radioNext = this.ctx.currentTime + 0.05
  }

  /** nivel 0..1 de la radio (para el ecualizador de la tele) */
  radioLevel() {
    if (!this.ctx || !this.radioOn || !this.enabled) return 0
    this.analyser.getByteFrequencyData(this.levelData)
    let s = 0
    for (const v of this.levelData) s += v
    return s / (this.levelData.length * 255)
  }

  // ─────────── ambiente ───────────
  private startAmbience() {
    this.setNight(this.night)
    // tono de habitación: ruido marrón muy bajito
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 280
    const g = ctx.createGain()
    g.gain.value = 0.035
    src.connect(lp).connect(g).connect(this.master)
    src.start()

    const birds = () => {
      if (this.enabled && !this.night) this.birdPhrase()
      this.timers.push(window.setTimeout(birds, 1500 + Math.random() * 3500))
    }
    const crickets = () => {
      if (this.enabled && this.night) this.cricket()
      this.timers.push(window.setTimeout(crickets, 650 + Math.random() * 500))
    }
    birds()
    crickets()
    this.timers.push(window.setInterval(() => this.scheduleRadio(), 50))
  }

  private birdPhrase() {
    const ctx = this.ctx!
    const n = 2 + Math.floor(Math.random() * 4)
    const base = 2200 + Math.random() * 1600
    const pan = ctx.createStereoPanner()
    pan.pan.value = Math.random() * 1.6 - 0.8
    pan.connect(this.dayBus)
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * (0.09 + Math.random() * 0.06)
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(base, t)
      o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.5), t + 0.05)
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.08)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.05, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
      o.connect(g).connect(pan)
      o.start(t)
      o.stop(t + 0.1)
    }
  }

  private cricket() {
    const ctx = this.ctx!
    const t0 = ctx.currentTime
    const f = 4300 + Math.random() * 500
    const pan = ctx.createStereoPanner()
    pan.pan.value = Math.random() < 0.5 ? -0.6 : 0.6
    pan.connect(this.nightBus)
    for (let i = 0; i < 3; i++) {
      const t = t0 + i * 0.045
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = f
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.03, t + 0.008)
      g.gain.linearRampToValueAtTime(0, t + 0.03)
      o.connect(g).connect(pan)
      o.start(t)
      o.stop(t + 0.035)
    }
  }

  // ─────────── radio lo-fi ───────────
  private scheduleRadio() {
    if (!this.ctx || !this.radioOn || !this.enabled) return
    const ctx = this.ctx
    const spb = 60 / 78 / 2 // corcheas a 78 bpm
    const chords = [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [55, 59, 62, 65],
      [52, 55, 59, 62],
    ]
    while (this.radioNext < ctx.currentTime + 0.2) {
      const t = this.radioNext
      const step = this.radioStep % 64
      const chord = chords[Math.floor(step / 16)]
      if (step % 16 === 0) chord.forEach((m) => this.pad(m, t, spb * 16))
      if (step % 8 === 0 || step % 8 === 5) this.drum('kick', t)
      if (step % 8 === 4) this.drum('snare', t)
      if (step % 2 === 1) this.drum('hat', t)
      if (step % 4 === 2 && Math.random() < 0.6) this.pluck(chord[Math.floor(Math.random() * 4)] + 12, t)
      this.radioStep++
      this.radioNext += spb
    }
  }

  private mtof(m: number) {
    return 440 * Math.pow(2, (m - 69) / 12)
  }

  private pad(m: number, t: number, dur: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = this.mtof(m)
    o.detune.value = (Math.random() - 0.5) * 12
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.035, t + 0.4)
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.connect(lp).connect(g).connect(this.radioBus)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  private pluck(m: number, t: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = this.mtof(m)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    o.connect(g).connect(this.radioBus)
    o.start(t)
    o.stop(t + 0.55)
  }

  private drum(kind: 'kick' | 'snare' | 'hat', t: number) {
    const ctx = this.ctx!
    if (kind === 'kick') {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(110, t)
      o.frequency.exponentialRampToValueAtTime(45, t + 0.15)
      g.gain.setValueAtTime(0.25, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
      o.connect(g).connect(this.radioBus)
      o.start(t)
      o.stop(t + 0.25)
      return
    }
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const f = ctx.createBiquadFilter()
    f.type = kind === 'hat' ? 'highpass' : 'bandpass'
    f.frequency.value = kind === 'hat' ? 7000 : 1800
    const g = ctx.createGain()
    const len = kind === 'hat' ? 0.04 : 0.14
    g.gain.setValueAtTime(kind === 'hat' ? 0.03 : 0.09, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    src.connect(f).connect(g).connect(this.radioBus)
    src.start(t, Math.random())
    src.stop(t + len + 0.02)
  }

  // ─────────── efectos ───────────
  play(kind: Sfx, intensity = 1) {
    if (!this.enabled) return
    const ctx = this.ensure()
    const t = ctx.currentTime
    const out = ctx.createGain()
    out.gain.value = 0.9
    out.connect(this.master)
    const noise = (dur: number, type: BiquadFilterType, freq: number, gain: number, q = 1) => {
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const f = ctx.createBiquadFilter()
      f.type = type
      f.frequency.value = freq
      f.Q.value = q
      const g = ctx.createGain()
      g.gain.setValueAtTime(gain, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      src.connect(f).connect(g).connect(out)
      src.start(t, Math.random())
      src.stop(t + dur + 0.05)
      return g
    }
    const tone = (f0: number, f1: number, dur: number, gain: number, type: OscillatorType = 'sine', delay = 0) => {
      const o = ctx.createOscillator()
      o.type = type
      const g = ctx.createGain()
      o.frequency.setValueAtTime(f0, t + delay)
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + delay + dur)
      g.gain.setValueAtTime(0, t + delay)
      g.gain.linearRampToValueAtTime(gain, t + delay + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur)
      o.connect(g).connect(out)
      o.start(t + delay)
      o.stop(t + delay + dur + 0.05)
    }
    switch (kind) {
      case 'click':
        tone(1800, 1200, 0.05, 0.08)
        break
      case 'tap':
        tone(900, 600, 0.06, 0.1)
        break
      case 'kick':
        tone(150, 50, 0.18, 0.5 * intensity)
        noise(0.06, 'bandpass', 900, 0.35 * intensity, 0.8)
        break
      case 'bounce':
        tone(120, 60, 0.1, 0.3 * Math.min(1, intensity))
        break
      case 'save':
        noise(0.12, 'bandpass', 600, 0.4)
        tone(90, 50, 0.15, 0.3)
        break
      case 'whistle': {
        const o = ctx.createOscillator()
        const lfo = ctx.createOscillator()
        const lg = ctx.createGain()
        const g = ctx.createGain()
        o.frequency.value = 2900
        lfo.frequency.value = 28
        lg.gain.value = 120
        lfo.connect(lg).connect(o.frequency)
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.08, t + 0.02)
        g.gain.setValueAtTime(0.08, t + 0.35)
        g.gain.linearRampToValueAtTime(0, t + 0.45)
        o.connect(g).connect(out)
        o.start(t)
        lfo.start(t)
        o.stop(t + 0.5)
        lfo.stop(t + 0.5)
        break
      }
      case 'goal': {
        // hinchada: ruido filtrado que crece y se apaga
        const src = ctx.createBufferSource()
        src.buffer = this.noise
        src.loop = true
        const f = ctx.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.value = 900
        f.Q.value = 0.6
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.35, t + 0.4)
        g.gain.linearRampToValueAtTime(0.0001, t + 2.6)
        src.connect(f).connect(g).connect(out)
        src.start(t)
        src.stop(t + 2.7)
        ;[0, 0.12, 0.24].forEach((d, i) => tone(523 * [1, 1.26, 1.5][i], 523 * [1, 1.26, 1.5][i], 0.35, 0.06, 'square', d))
        break
      }
      case 'static':
        noise(0.3, 'highpass', 1500, 0.18)
        break
      case 'tvOn':
        tone(60, 40, 0.15, 0.2)
        tone(12000, 11000, 0.4, 0.015)
        break
      case 'vibrate': {
        for (let i = 0; i < 3; i++) {
          const o = ctx.createOscillator()
          o.type = 'sawtooth'
          o.frequency.value = 150
          const lp = ctx.createBiquadFilter()
          lp.type = 'lowpass'
          lp.frequency.value = 300
          const g = ctx.createGain()
          const s = t + i * 0.35
          g.gain.setValueAtTime(0, s)
          g.gain.linearRampToValueAtTime(0.18, s + 0.02)
          g.gain.setValueAtTime(0.18, s + 0.2)
          g.gain.linearRampToValueAtTime(0, s + 0.24)
          o.connect(lp).connect(g).connect(out)
          o.start(s)
          o.stop(s + 0.26)
        }
        break
      }
      case 'pour':
        for (let i = 0; i < 8; i++) {
          const d = i * 0.07 + Math.random() * 0.03
          tone(500 + Math.random() * 400, 900 + Math.random() * 300, 0.06, 0.04, 'sine', d)
        }
        noise(0.6, 'bandpass', 2500, 0.06, 2)
        break
      case 'secret':
        ;[0, 0.08, 0.16, 0.28].forEach((d, i) => tone([784, 988, 1175, 1568][i], [784, 988, 1175, 1568][i], 0.5, 0.07, 'triangle', d))
        break
    }
  }
}

export const audio = new AudioEngine()
