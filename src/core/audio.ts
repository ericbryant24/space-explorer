/**
 * Calm procedural audio: soft bell plucks in a pentatonic scale over a slow
 * drone. Everything is synthesised, so there are no assets to load.
 *
 * Browsers won't let us make noise before the first gesture, so the context is
 * created lazily by `ensure()` and every call is a no-op until then.
 */

// Major pentatonic — there are no wrong notes, which suits a toy.
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

class GameAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private padGain: GainNode | null = null
  private muted = false
  /** Walks up and down the scale so successive plucks feel melodic. */
  private melodyStep = 3
  private melodyDir = 1

  get ready(): boolean {
    return this.ctx !== null && !this.muted
  }

  /** Create (or resume) the audio context. Safe to call on every gesture. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const Ctor = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    try {
      this.ctx = new Ctor()
    } catch {
      return
    }
    this.master = this.ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.5
    this.master.connect(this.ctx.destination)
    this.startPad()
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.15)
    }
    return this.muted
  }

  get isMuted(): boolean {
    return this.muted
  }

  /** A low, slowly breathing drone that sits under everything. */
  private startPad() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const pad = ctx.createGain()
    pad.gain.value = 0
    pad.gain.setTargetAtTime(0.075, ctx.currentTime, 6)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 520
    filter.Q.value = 0.6
    pad.connect(filter).connect(this.master)

    // Root, fifth and a distant octave, each very slightly detuned so the
    // drone shimmers instead of sitting still.
    for (const [midi, detune] of [
      [38, -6],
      [45, 4],
      [57, -3],
      [50, 7],
    ] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = midiToHz(midi)
      osc.detune.value = detune
      const g = ctx.createGain()
      g.gain.value = midi > 52 ? 0.16 : 0.4
      osc.connect(g).connect(pad)
      osc.start()

      // Slow amplitude drift, different rate per voice.
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.03 + (midi % 7) * 0.011
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = g.gain.value * 0.6
      lfo.connect(lfoGain).connect(g.gain)
      lfo.start()
    }
    this.padGain = pad
  }

  /** Duck the pad, e.g. while warping between systems. */
  setPadLevel(level: number, seconds = 0.4) {
    if (!this.ctx || !this.padGain) return
    this.padGain.gain.setTargetAtTime(0.075 * level, this.ctx.currentTime, seconds)
  }

  /**
   * A soft bell. `scaleOffset` shifts within the pentatonic scale;
   * omit it to walk the scale automatically.
   */
  note(scaleOffset?: number, opts: { octave?: number; gain?: number; decay?: number } = {}) {
    const ctx = this.ctx
    if (!ctx || !this.master || this.muted) return
    let step: number
    if (scaleOffset === undefined) {
      this.melodyStep += this.melodyDir
      if (this.melodyStep >= PENTATONIC.length - 3) this.melodyDir = -1
      if (this.melodyStep <= 1) this.melodyDir = 1
      step = this.melodyStep
    } else {
      step = Math.max(0, Math.min(PENTATONIC.length - 1, scaleOffset))
    }
    const midi = 60 + PENTATONIC[step] + (opts.octave ?? 0) * 12
    this.tone(midiToHz(midi), {
      gain: opts.gain ?? 0.22,
      decay: opts.decay ?? 1.1,
      type: 'triangle',
    })
  }

  /** Raw tone with a plucked envelope. */
  private tone(
    hz: number,
    { gain = 0.2, decay = 1, type = 'sine', delay = 0 }: {
      gain?: number
      decay?: number
      type?: OscillatorType
      delay?: number
    } = {},
  ) {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = hz

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay)

    // Roll the top off so bells stay soft on phone speakers.
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(Math.min(6000, hz * 6), t)
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, hz * 1.6), t + decay)

    osc.connect(env).connect(lp).connect(this.master)
    osc.start(t)
    osc.stop(t + decay + 0.05)
  }

  /** Three rising notes — used when something new is discovered. */
  chime() {
    if (!this.ctx || this.muted) return
    ;[0, 2, 4].forEach((s, i) => {
      const midi = 60 + PENTATONIC[s + 2]
      this.tone(midiToHz(midi), { gain: 0.2, decay: 1.6, type: 'triangle', delay: i * 0.11 })
    })
  }

  /** Low bump for touching down on a planet. */
  thud() {
    if (!this.ctx || this.muted) return
    this.tone(96, { gain: 0.3, decay: 0.35, type: 'sine' })
    this.tone(150, { gain: 0.12, decay: 0.22, type: 'triangle' })
  }

  /** Airy sweep for warping between systems. */
  whoosh(duration = 1.6) {
    const ctx = this.ctx
    if (!ctx || !this.master || this.muted) return
    const t = ctx.currentTime
    const frames = Math.floor(ctx.sampleRate * duration)
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buf.getChannelData(0)
    // Pink-ish noise: cheap running average of white noise.
    let last = 0
    for (let i = 0; i < frames; i++) {
      const white = Math.random() * 2 - 1
      last = last * 0.92 + white * 0.08
      data[i] = last * 3
    }
    const src = ctx.createBufferSource()
    src.buffer = buf

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.4
    bp.frequency.setValueAtTime(200, t)
    bp.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.55)
    bp.frequency.exponentialRampToValueAtTime(180, t + duration)

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.3, t + duration * 0.35)
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration)

    src.connect(bp).connect(env).connect(this.master)
    src.start(t)
    src.stop(t + duration)
  }

  /** Tiny tick for UI touches. */
  tick() {
    if (!this.ctx || this.muted) return
    this.tone(880, { gain: 0.07, decay: 0.14, type: 'sine' })
  }
}

export const audio = new GameAudio()
