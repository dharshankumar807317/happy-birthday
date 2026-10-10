import { useEffect, useRef } from 'react'

/**
 * Canvas-based particle system.
 *
 * Props:
 *   palette  – chapter palette (orbs[], petals[], accent)
 *   count    – total particle budget
 *   mode     – 'fall' | 'rise'
 *   active   – start / stop the loop
 *   burst    – truthy → fire a one-shot celebration burst
 *   onBurstDone – called when burst finishes
 */
export default function Particles({
  palette,
  count = 80,
  mode = 'fall',
  active,
  burst,
  onBurstDone,
}) {
  const cv       = useRef(null)
  const burstRef = useRef(burst)
  burstRef.current = burst

  useEffect(() => {
    const c = cv.current
    if (!c) return

    const ctx    = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches
    const dpr    = Math.min(window.devicePixelRatio || 1, 2)
    const isMob  = innerWidth < 700

    // Particle budgets – scaled down on mobile and reduce-motion
    const scaleFactor = reduce ? 0.25 : isMob ? 0.55 : 1
    const NO = Math.round(count * 0.60 * scaleFactor)  // orbs
    const NP = Math.round(count * 0.40 * scaleFactor)  // petals

    let w = 0, h = 0, raf = 0
    let orbs = [], petals = [], burstPieces = []
    let running = false, startTime = 0, burstActive = false
    const PETAL_STOP_MS = 4500

    const up = mode === 'rise'

    // ── orb factory ──────────────────────────────────────────────
    const mkO = (init = false) => {
      const col = palette.orbs[Math.random() * palette.orbs.length | 0]
      return {
        x   : Math.random() * w,
        y   : init ? Math.random() * h : up ? h + 20 : -20,
        r   : 1.6 + Math.random() * 5.5,
        vy  : (0.10 + Math.random() * 0.40) * (up ? -1 : 1),
        vx  : (Math.random() - 0.5) * 0.20,
        ph  : Math.random() * 6.28,
        sw  : 0.15 + Math.random() * 0.55,
        a   : 0.18 + Math.random() * 0.60,
        twk : 0.005 + Math.random() * 0.022,
        col,
      }
    }

    // ── petal factory ─────────────────────────────────────────────
    const mkP = (init = false) => ({
      e   : palette.petals[Math.random() * palette.petals.length | 0],
      x   : Math.random() * w,
      y   : init ? Math.random() * h : up ? h + 30 : -30,
      sz  : 9 + Math.random() * 15,
      vy  : (0.14 + Math.random() * 0.34) * (up ? -1 : 1),
      vx  : (Math.random() - 0.5) * 0.18,
      ph  : Math.random() * 6.28,
      sw  : 0.30 + Math.random() * 0.90,
      rot : Math.random() * 6.28,
      vr  : (Math.random() - 0.5) * 0.018,
      a   : 0.28 + Math.random() * 0.48,
      stopped: false,
    })

    // ── burst piece factory ───────────────────────────────────────
    const BURST_EMOJIS = ['🌸','💖','✨','💕','🌷','🌺','💫','🎀','💝','✦','🌟','🎊']
    const fireBurst = () => {
      if (burstActive) return
      burstActive = true
      const cx = w * 0.5, cy = h * 0.45
      const pieces = Array.from({ length: reduce ? 10 : 36 }, (_, i) => {
        const angle = (i / 36) * 6.283 + Math.random() * 0.3
        const dist  = 80 + Math.random() * 200
        const dur   = 1.1 + Math.random() * 0.9           // seconds
        return {
          e    : BURST_EMOJIS[i % BURST_EMOJIS.length],
          x    : cx, y: cy,
          tx   : cx + Math.cos(angle) * dist,
          ty   : cy + Math.sin(angle) * dist,
          sz   : 14 + Math.random() * 10,
          dur  : dur * 1000,
          born : performance.now(),
          rot  : Math.random() * 6.28,
          vr   : (Math.random() - 0.5) * 0.06,
        }
      })
      burstPieces = pieces
    }

    // ── resize ────────────────────────────────────────────────────
    const resize = () => {
      const rect = c.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      c.width  = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!orbs.length) {
        orbs   = Array.from({ length: NO }, () => mkO(true))
        petals = Array.from({ length: NP }, () => mkP(true))
      }
    }

    // ── draw ─────────────────────────────────────────────────────
    const draw = (step, ts) => {
      const elapsed = startTime ? ts - startTime : 0
      const shouldStop = elapsed > PETAL_STOP_MS

      ctx.clearRect(0, 0, w, h)

      // — orbs
      for (const o of orbs) {
        if (step) {
          o.ph += o.twk
          o.y  += o.vy
          o.x  += o.vx + Math.sin(o.ph) * o.sw
          if (o.y > h + 30 || o.y < -30) Object.assign(o, mkO(false))
        }
        const glow = o.a * (0.6 + 0.4 * Math.sin(o.ph * 3.5))
        const { r, g, b } = o.col

        // halo
        const gr = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 11)
        gr.addColorStop(0,   `rgba(${r},${g},${b},${glow * 0.50})`)
        gr.addColorStop(0.3, `rgba(${r},${g},${b},${glow * 0.18})`)
        gr.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gr
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 11, 0, 6.283); ctx.fill()

        // core
        const gc = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        gc.addColorStop(0,    `rgba(255,255,255,${glow * 0.95})`)
        gc.addColorStop(0.45, `rgba(${r},${g},${b},${glow * 0.88})`)
        gc.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gc
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.283); ctx.fill()
      }

      // — petals
      ctx.textAlign = 'center'
      for (const p of petals) {
        if (step && !p.stopped) {
          if (shouldStop && p.y > h * 0.25 && p.y < h * 0.75) {
            p.stopped = true; p.vy = 0; p.vx = 0
          } else {
            p.ph  += 0.009
            p.y   += p.vy
            p.x   += p.vx + Math.sin(p.ph) * p.sw
            p.rot += p.vr
            if (p.y > h + 44 || p.y < -44) Object.assign(p, mkP(false))
          }
        }
        ctx.globalAlpha = p.a * (0.52 + 0.48 * Math.sin(p.ph * 1.8))
        ctx.save()
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.font = `${p.sz}px serif`
        ctx.fillText(p.e, 0, 0)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // — burst pieces
      const now2 = performance.now()
      let allDone = burstActive && burstPieces.length > 0
      for (const p of burstPieces) {
        const t = Math.min((now2 - p.born) / p.dur, 1)
        if (t < 1) allDone = false
        const ease = 1 - Math.pow(1 - t, 3)     // cubic ease-out
        const bx   = p.x + (p.tx - p.x) * ease
        const by   = p.y + (p.ty - p.y) * ease
        const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3
        ctx.globalAlpha = alpha
        ctx.save()
        ctx.translate(bx, by); ctx.rotate(p.rot + p.vr * t * 40)
        ctx.font = `${p.sz}px serif`
        ctx.fillText(p.e, 0, 0)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      if (allDone) {
        burstPieces = []; burstActive = false
        onBurstDone?.()
      }
    }

    // ── animation loop ────────────────────────────────────────────
    let lastTs = 0
    const loop = (ts) => {
      draw(true, ts)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reduce) return
      running = true
      startTime = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    draw(false, 0)

    const ro = new ResizeObserver(resize)
    ro.observe(c.parentElement)

    if (active && !reduce) start()

    // visibility: pause when tab hidden to save battery
    const onVis = () => {
      if (document.hidden) stop()
      else if (active) start()
    }
    document.addEventListener('visibilitychange', onVis)

    // expose fireBurst to effect cleanup scope via ref
    c._fireBurst = fireBurst

    return () => {
      stop()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [active, palette, mode])   // intentionally omit burst/onBurstDone to avoid restart

  // Trigger burst imperatively via canvas ref
  useEffect(() => {
    if (burst && cv.current?._fireBurst) {
      cv.current._fireBurst()
    }
  }, [burst])

  return (
    <canvas
      ref={cv}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    />
  )
}
