// Synthesized celebratory audio effects via Web Audio API (zero external assets needed)

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playSparkleSound(muted = false) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Ascending crystalline arpeggio (C6, E6, G6, B6, C7)
  const freqs = [1046.5, 1318.5, 1567.98, 1975.5, 2093]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now + i * 0.06)

    gain.gain.setValueAtTime(0, now + i * 0.06)
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.06 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.06)
    osc.stop(now + i * 0.06 + 0.5)
  })
}

export function playWhooshSound(muted = false) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Filtered white noise puff (breath blowing candles)
  const bufferSize = ctx.sampleRate * 0.45
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(800, now)
  filter.frequency.exponentialRampToValueAtTime(150, now + 0.4)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start(now)
  noise.stop(now + 0.45)
}

export function playCelebrationSound(muted = false) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Festive major chord fanfare with glittering harmonics
  const chords = [
    { freq: 523.25, time: 0 },    // C5
    { freq: 659.25, time: 0.08 }, // E5
    { freq: 783.99, time: 0.16 }, // G5
    { freq: 1046.5, time: 0.24 }, // C6
    { freq: 1318.5, time: 0.32 }, // E6
    { freq: 1567.98, time: 0.40 },// G6
    { freq: 2093.0, time: 0.48 }, // C7
  ]

  chords.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + time)

    gain.gain.setValueAtTime(0, now + time)
    gain.gain.linearRampToValueAtTime(0.1, now + time + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + time)
    osc.stop(now + time + 0.85)
  })
}
