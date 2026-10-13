import { useEffect, useRef, useCallback } from 'react'

const TRACKS = [
  '/audio/01-rose.mp3',
  '/audio/02-sunflower.mp3',
  '/audio/03-waterlily.mp3',
  '/audio/04-lotus.mp3',
  '/audio/05-pink.mp3',
]
const FADE = 1.6   // seconds to cross-fade
const VOL  = 0.72  // comfortable listening volume

export function useAudio(idx, muted) {
  const nodes = useRef([])   // { el, gain } per track
  const ctx   = useRef(null)
  const isFadingOut = useRef(false)
  const fadeOutTimeout = useRef(null)

  // Initialize AudioContext & buffer audio elements eagerly
  const init = useCallback(() => {
    if (ctx.current) return ctx.current
    const AC = new (window.AudioContext || window.webkitAudioContext)()
    ctx.current = AC
    nodes.current = TRACKS.map((src) => {
      const el  = new Audio(src)
      el.loop   = true
      el.preload = 'auto'
      try {
        const src_ = AC.createMediaElementSource(el)
        const gain = AC.createGain()
        gain.gain.value = 0
        src_.connect(gain).connect(AC.destination)
        return { el, gain }
      } catch {
        return { el, gain: null }
      }
    })
    return AC
  }, [])

  // Explicit audio resume on user gesture
  const resumeAudio = useCallback(() => {
    const AC = init()
    if (AC && AC.state === 'suspended') {
      AC.resume().catch(() => {})
    }
  }, [init])

  // Fade out the current track smoothly before an automated page scroll
  const fadeOutCurrent = useCallback((duration = 2.0) => {
    const AC = ctx.current
    if (!AC || muted) return
    isFadingOut.current = true
    const now = AC.currentTime
    const curr = nodes.current[idx]
    if (curr && curr.gain) {
      const g = curr.gain.gain
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(0, now + duration)
      clearTimeout(fadeOutTimeout.current)
      fadeOutTimeout.current = setTimeout(() => {
        isFadingOut.current = false
      }, duration * 1000)
    }
  }, [idx, muted])

  // Manage playback and smooth cross-fades when idx or muted changes
  useEffect(() => {
    if (muted) {
      // Smooth fade-out on mute
      const AC = ctx.current
      if (AC) {
        const now = AC.currentTime
        nodes.current.forEach(({ el, gain }) => {
          if (!gain) {
            el.pause()
            return
          }
          const g = gain.gain
          g.cancelScheduledValues(now)
          g.setValueAtTime(g.value, now)
          g.linearRampToValueAtTime(0, now + 1.0)
          setTimeout(() => {
            if (muted) el.pause()
          }, 1100)
        })
      }
      return
    }

    const AC = init()
    if (!AC) return

    if (AC.state === 'suspended') {
      AC.resume().catch(() => {})
    }

    isFadingOut.current = false
    clearTimeout(fadeOutTimeout.current)

    const now = AC.currentTime

    nodes.current.forEach(({ el, gain }, i) => {
      if (!gain) return
      const g = gain.gain
      if (i === idx) {
        // Active track: fade in smoothly
        el.play().catch(() => {})
        g.cancelScheduledValues(now)
        g.setValueAtTime(g.value, now)
        g.linearRampToValueAtTime(VOL, now + FADE)
      } else {
        // Other tracks: fade out smoothly
        g.cancelScheduledValues(now)
        g.setValueAtTime(g.value, now)
        g.linearRampToValueAtTime(0, now + FADE)
        setTimeout(() => {
          if (i !== idx) el.pause()
        }, (FADE + 0.3) * 1000)
      }
    })
  }, [idx, muted, init])

  // Global listener for first user interaction to unlock suspended AudioContext
  useEffect(() => {
    if (muted) return
    const unlock = () => {
      resumeAudio()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('click', unlock, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }
  }, [muted, resumeAudio])

  return { fadeOutCurrent, resumeAudio }
}
