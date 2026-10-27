/**
 * 站点内置合成音源（占位）
 * ---------------------------------------------------------------
 * 演示版本不包含官方 BGM / 音效资源，使用 Web Audio 实时合成环境音，
 * 用于验证「进入页面不自动出声、可暂停、同一时刻一个音源」等交互规则。
 * 正式上线时应替换为核对后的官方音频，并沿用这里的播放状态接口。
 */

const MOODS = {
  somber: {
    chord: [110.0, 164.81, 220.0, 261.63],
    scale: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
    filter: 620,
    wind: 0.035,
    noteEvery: [4200, 6800],
    wave: 'sine',
  },
  tense: {
    chord: [98.0, 146.83, 196.0, 233.08],
    scale: [155.56, 174.61, 196.0, 233.08, 261.63],
    filter: 780,
    wind: 0.02,
    noteEvery: [2600, 4200],
    wave: 'triangle',
  },
  epic: {
    chord: [73.42, 146.83, 220.0, 293.66],
    scale: [146.83, 174.61, 220.0, 246.94, 293.66, 349.23],
    filter: 1100,
    wind: 0.03,
    noteEvery: [3200, 5600],
    wave: 'sine',
  },
  abyss: {
    chord: [65.41, 130.81, 155.56, 196.0],
    scale: [130.81, 155.56, 174.61, 196.0, 233.08],
    filter: 480,
    wind: 0.06,
    noteEvery: [5200, 8200],
    wave: 'sine',
  },
  cold: {
    chord: [130.81, 196.0, 261.63, 329.63],
    scale: [261.63, 293.66, 329.63, 392.0, 440.0],
    filter: 1500,
    wind: 0.05,
    noteEvery: [4600, 7600],
    wave: 'sine',
  },
  warm: {
    chord: [130.81, 196.0, 246.94, 293.66],
    scale: [246.94, 293.66, 329.63, 369.99, 440.0],
    filter: 900,
    wind: 0.015,
    noteEvery: [3600, 6000],
    wave: 'triangle',
  },
  space: {
    chord: [87.31, 130.81, 174.61, 261.63],
    scale: [174.61, 220.0, 261.63, 329.63, 392.0, 523.25],
    filter: 900,
    wind: 0.025,
    noteEvery: [3000, 5200],
    wave: 'sine',
  },
  oriental: {
    chord: [146.83, 220.0, 293.66, 329.63],
    scale: [293.66, 329.63, 440.0, 493.88, 587.33],
    filter: 1200,
    wind: 0.02,
    noteEvery: [3200, 5400],
    wave: 'triangle',
  },
  silence: { chord: [], scale: [], filter: 400, wind: 0, noteEvery: [0, 0], wave: 'sine' },
}

const SCENE_MOOD = {
  chernobog: 'tense',
  'chernobog-night': 'tense',
  'chernobog-fire': 'tense',
  'chernobog-ruins': 'tense',
  inferno: 'tense',
  ark: 'somber',
  'ark-night': 'somber',
  lungmen: 'tense',
  'lungmen-night': 'tense',
  'lungmen-alley': 'tense',
  tundra: 'cold',
  'snow-night': 'cold',
  'snow-mountain': 'cold',
  'snow-ruins': 'cold',
  'snow-peak': 'cold',
  crystal: 'abyss',
  'crystal-dark': 'abyss',
  sea: 'abyss',
  'sea-fog': 'abyss',
  'sea-deep': 'abyss',
  'coast-fog': 'abyss',
  desert: 'space',
  'desert-tower': 'space',
  'desert-dawn': 'space',
  'waste-storm': 'space',
  forest: 'warm',
  citadel: 'epic',
  'knight-arena': 'epic',
  'knight-city': 'epic',
  'knight-light': 'epic',
  factory: 'tense',
  'factory-fire': 'tense',
  lab: 'space',
  dawn: 'warm',
  'dawn-city': 'warm',
  'yan-mountain': 'oriental',
  'mountain-ink': 'oriental',
  'mountain': 'cold',
  'train-snow': 'cold',
  'dark-horizon': 'abyss',
}

export function moodForScene(scene) {
  return SCENE_MOOD[scene] ?? 'somber'
}

class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.nodes = []
    this.timer = null
    this.noteTimer = null
    this.playing = false
    this.mood = 'somber'
    this.volume = 0.55
    this.startAt = 0
    this.listeners = new Set()
  }

  ensure() {
    if (typeof window === 'undefined') return null
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    if (!this.ctx) {
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  isSupported() {
    return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext)
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit() {
    for (const fn of this.listeners) fn({ playing: this.playing, mood: this.mood })
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setTargetAtTime(this.playing ? this.volume : 0, t, 0.2)
    }
  }

  /** 开始一个环境音场；同一时刻只有一个音源 */
  start(mood = 'somber', { volume } = {}) {
    const ctx = this.ensure()
    if (!ctx) return false
    if (volume != null) this.volume = volume
    this.stop({ silent: true })
    this.mood = mood
    this.playing = true
    this.startAt = ctx.currentTime
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 1.6)

    const cfg = MOODS[mood] ?? MOODS.somber
    if (!cfg.chord.length) {
      this.playing = false
      return false
    }

    // 低频和声
    cfg.chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = cfg.wave
      osc.frequency.value = freq
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * (3 + i)
      filter.type = 'lowpass'
      filter.frequency.value = cfg.filter
      filter.Q.value = 0.6
      gain.gain.value = 0.055 / (1 + i * 0.35)
      osc.connect(filter).connect(gain).connect(this.master)
      osc.start()
      this.nodes.push(osc, gain, filter)
    })

    // 空气噪声
    if (cfg.wind > 0) {
      const bufferSize = Math.floor(ctx.sampleRate * 2)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 3.2
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      const band = ctx.createBiquadFilter()
      band.type = 'bandpass'
      band.frequency.value = 420
      band.Q.value = 0.8
      const ng = ctx.createGain()
      ng.gain.value = cfg.wind
      src.connect(band).connect(ng).connect(this.master)
      src.start()
      this.nodes.push(src, band, ng)
    }

    // 稀疏旋律点
    const [min, max] = cfg.noteEvery
    if (max > 0) {
      const schedule = () => {
        if (!this.playing) return
        const delay = min + Math.random() * (max - min)
        this.noteTimer = setTimeout(() => {
          if (!this.playing) return
          this.bell(cfg.scale[Math.floor(Math.random() * cfg.scale.length)])
          schedule()
        }, delay)
      }
      schedule()
    }

    this.emit()
    return true
  }

  bell(freq) {
    if (!this.ctx || !this.playing) return
    const ctx = this.ctx
    const t = ctx.currentTime + 0.02
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
    osc.type = 'triangle'
    osc.frequency.value = freq * 2
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.35)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.6)
    osc.connect(gain)
    if (pan) {
      pan.pan.value = Math.random() * 1.2 - 0.6
      gain.connect(pan).connect(this.master)
    } else {
      gain.connect(this.master)
    }
    osc.start(t)
    osc.stop(t + 3.8)
  }

  stop({ silent = false } = {}) {
    if (this.noteTimer) {
      clearTimeout(this.noteTimer)
      this.noteTimer = null
    }
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    const wasPlaying = this.playing
    this.playing = false
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setTargetAtTime(0, t, 0.18)
    }
    const nodes = this.nodes
    this.nodes = []
    const ctx = this.ctx
    setTimeout(() => {
      nodes.forEach((node) => {
        try {
          if (node.stop) node.stop()
          node.disconnect()
        } catch {
          /* noop */
        }
      })
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
    }, 420)
    if (!silent && wasPlaying) this.emit()
    if (silent) this.emit()
  }

  elapsed() {
    if (!this.ctx || !this.playing) return 0
    return Math.max(0, this.ctx.currentTime - this.startAt)
  }
}

export const audioEngine = new AudioEngine()

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
