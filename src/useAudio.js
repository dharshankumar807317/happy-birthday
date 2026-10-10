import { useEffect, useRef } from 'react'

const TRACKS = [
  '/audio/01-rose.mp3',
  '/audio/02-sunflower.mp3',
  '/audio/03-waterlily.mp3',
  '/audio/04-lotus.mp3',
  '/audio/05-pink.mp3',
]
const FADE = 1.4   // seconds to cross-fade
const VOL  = 0.72

export function useAudio(idx, muted) {
  const nodes = useRef([])   // { el, gain } per track
  const ctx   = useRef(null)

  // lazy-init AudioContext + nodes on first un-mute
  const init = () => {
    if (ctx.current) return
    const AC = new (window.AudioContext || window.webkitAudioContext)()
    ctx.current = AC
    nodes.current = TRACKS.map((src) => {
      const el  = new Audio(src)
      el.loop   = true
      el.preload = 'none'
      const src_ = AC.createMediaElementSource(el)
      const gain = AC.createGain()
      gain.gain.value = 0
      src_.connect(gain).connect(AC.destination)
      return { el, gain }
    })
  }

  // fade in/out on idx change
  useEffect(() => {
    if (muted) return
    init()
    const AC = ctx.current; if (!AC) return
    const now = AC.currentTime

    nodes.current.forEach(({ el, gain }, i) => {
      const g = gain.gain
      if (i === idx) {
        // resume if suspended (autoplay policy)
        if (AC.state === 'suspended') AC.resume()
        el.load()
        el.play().catch(() => {})
        g.cancelScheduledValues(now)
        g.setValueAtTime(g.value, now)
        g.linearRampToValueAtTime(VOL, now + FADE)
      } else {
        g.cancelScheduledValues(now)
        g.setValueAtTime(g.value, now)
        g.linearRampToValueAtTime(0, now + FADE)
        setTimeout(() => { if (g.value < 0.02) el.pause() }, (FADE + 0.2) * 1000)
      }
    })
  }, [idx, muted])

  // stop all on unmute→mute
  useEffect(() => {
    if (!muted || !ctx.current) return
    nodes.current.forEach(({ el, gain }) => {
      gain.gain.value = 0; el.pause()
    })
  }, [muted])
}
