import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
  useReducedMotion,
} from 'framer-motion'
import Particles from './Particles.jsx'
import { useAudio } from './useAudio.js'
import ThreeCake from './ThreeCake.jsx'
import { playSparkleSound } from './soundEffects.js'
import { chapters } from './data.js'

/* ─── shared easing ─────────────────────────────────────────────── */
const E  = [0.22, 0.82, 0.18, 1]
const ES = [0.34, 1.56, 0.64, 1] // spring-y ease for reveals

/* ─── tiny helpers ──────────────────────────────────────────────── */
function useIsMobile() {
  const [mob, setMob] = useState(() => window.innerWidth < 860)
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 860)
    window.addEventListener('resize', fn, { passive: true })
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mob
}

/* ─── QuotePill ─────────────────────────────────────────────────── */
function QuotePill({ text, delay = 0.15, style }) {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? false : { opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, delay, ease: E }}
      style={{
        position: 'absolute', zIndex: 3,
        maxWidth: 'min(88vw, 340px)',
        padding: '.48rem 1.0rem',
        borderRadius: 999,
        background: 'rgba(0,0,0,.54)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.18)',
        fontFamily: "'Nunito', sans-serif",
        fontStyle: 'italic',
        fontSize: 'clamp(.76rem, 2.1vw, .90rem)',
        lineHeight: 1.5,
        color: 'rgba(255,248,246,.95)',
        pointerEvents: 'none',
        textShadow: '0 1px 6px rgba(0,0,0,.8)',
        textAlign: 'center',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {text}
    </motion.div>
  )
}

/* ─── Words – Unified Swift Reveal ─────────────────────────────── */
function Words({ text, delay = 0, accent }) {
  const r = useReducedMotion()
  return (
    <motion.span
      style={{ display: 'inline-block', ...(accent ? { color: 'var(--ac)' } : {}) }}
      initial={r ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: E }}
    >
      {text}
    </motion.span>
  )
}

/* ─── FadeUp ────────────────────────────────────────────────────── */
function FadeUp({ delay = 0, children, style }) {
  const r = useReducedMotion()
  return (
    <motion.div style={style}
      initial={r ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: E }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Photo frame shapes ────────────────────────────────────────── */
const FRAMES = [
  { borderRadius: '70% 30% 70% 30% / 30% 70% 30% 70%' },
  { borderRadius: '30% 70% 30% 70% / 70% 30% 70% 30%' },
  { borderRadius: '65% 35% 65% 35% / 35% 65% 35% 65%' },
  { borderRadius: '55% 45% 55% 45% / 45% 55% 45% 55%' },
]

function PhotoFrame({ name, fi = 0, delay = 0.08, mx, my, depth = 16 }) {
  const r = useReducedMotion()
  const px = useTransform(mx, v => v * depth)
  const py = useTransform(my, v => v * depth)
  return (
    <motion.figure
      style={{
        position: 'absolute', inset: 0, margin: 0, overflow: 'hidden',
        ...FRAMES[fi % 4],
        border: '2px solid rgba(255,255,255,.22)',
        boxShadow: '0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.1),0 0 70px -12px var(--ac)',
        ...(r ? {} : { x: px, y: py }),
      }}
      initial={r ? false : { scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.38, delay, ease: E }}
      whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
    >
      <img
        src={`/images/${name}.jpg`} alt={name}
        loading="eager" decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', display: 'block' }}
      />
    </motion.figure>
  )
}

/* ─── Collage layouts ───────────────────────────────────────────── */
function Collage({ imgs, mx, my }) {
  const n = imgs.length
  const accent = 'var(--ac)'
  if (n === 1) return (
    <div style={{ position: 'relative', width: 'min(95%,420px)', aspectRatio: '3/4', margin: 'auto' }}>
      <PhotoFrame name={imgs[0]} fi={0} delay={0.06} mx={mx} my={my} depth={12} />
    </div>
  )
  if (n === 2) return (
    <div style={{ position: 'relative', width: 'min(98%,520px)', aspectRatio: '1/1.1', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '66%', height: '74%' }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.06} mx={mx} my={my} depth={14} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '58%', height: '63%', zIndex: 2 }}>
        <PhotoFrame name={imgs[1]} fi={1} delay={0.12} mx={mx} my={my} depth={22} />
      </div>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.35 }} transition={{ delay: 0.1, duration: 0.4, ease: E }}
        style={{ position: 'absolute', right: '20%', top: '28%', width: 'clamp(40px,9vw,60px)', height: 'clamp(40px,9vw,60px)', borderRadius: '50%', background: accent, filter: 'blur(20px)', zIndex: 0 }} />
    </div>
  )
  if (n === 3) return (
    <div style={{ position: 'relative', width: 'min(98%,540px)', aspectRatio: '1/1.08', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: '6%', width: '58%', height: '62%', zIndex: 2 }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.06} mx={mx} my={my} depth={12} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, width: '44%', height: '46%', zIndex: 1 }}>
        <PhotoFrame name={imgs[1]} fi={3} delay={0.12} mx={mx} my={my} depth={20} />
      </div>
      <div style={{ position: 'absolute', right: '3%', bottom: 0, width: '56%', height: '46%', zIndex: 3 }}>
        <PhotoFrame name={imgs[2]} fi={2} delay={0.18} mx={mx} my={my} depth={18} />
      </div>
    </div>
  )
  return (
    <div style={{ position: 'relative', width: 'min(98%,550px)', aspectRatio: '1/1.02', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '52%' }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.05} mx={mx} my={my} depth={10} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: '5%', width: '46%', height: '46%' }}>
        <PhotoFrame name={imgs[1]} fi={3} delay={0.10} mx={mx} my={my} depth={18} />
      </div>
      <div style={{ position: 'absolute', left: '4%', bottom: 0, width: '44%', height: '44%' }}>
        <PhotoFrame name={imgs[2]} fi={1} delay={0.15} mx={mx} my={my} depth={14} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50%', height: '46%' }}>
        <PhotoFrame name={imgs[3]} fi={2} delay={0.20} mx={mx} my={my} depth={20} />
      </div>
    </div>
  )
}

/* ─── Dot navigation ────────────────────────────────────────────── */
function DotNav({ cur, total, onGo }) {
  return (
    <div style={{ position: 'fixed', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.button key={i} onClick={() => onGo(i)} aria-label={`Slide ${i + 1}`}
          whileHover={{ scale: 1.4 }}
          style={{
            width:  cur === i ? 6  : 5,
            height: cur === i ? 20 : 5,
            borderRadius: 999,
            border: 'none', cursor: 'pointer', padding: 0,
            background: cur === i ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)',
            transition: 'all .3s ease',
            boxShadow: cur === i ? '0 0 10px rgba(255,255,255,.5)' : 'none',
            outline: '8px solid transparent',
            outlineOffset: '0px',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Music button ──────────────────────────────────────────────── */
function MusicBtn({ muted, onToggle }) {
  return (
    <motion.button onClick={onToggle}
      style={{
        position: 'fixed',
        top: 'max(14px,env(safe-area-inset-top,0px))',
        left: 16, zIndex: 40,
        background: 'rgba(8,2,16,.52)', backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,.16)',
        borderRadius: 999, width: 44, height: 44,
        display: 'grid', placeItems: 'center',
        cursor: 'pointer', fontSize: '1.1rem', color: '#fff',
      }}
      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
    >{muted ? '🔇' : '🎵'}</motion.button>
  )
}

/* ─── Ambient floating petals for landing ───────────────────────── */
const LANDING_PETALS = ['🌸', '🌷', '✦', '💕', '🌹', '✨', '💫', '🌺']
function AmbientPetal({ idx }) {
  const r = useReducedMotion()
  if (r) return null
  const e = LANDING_PETALS[idx % LANDING_PETALS.length]
  const left = `${8 + (idx * 13.7) % 84}%`
  const delay = idx * 0.45
  const dur = 6 + (idx * 2) % 6
  const sz = 0.9 + (idx * 0.31) % 1.1
  return (
    <motion.span
      aria-hidden="true"
      style={{ position: 'absolute', top: '-8%', left, fontSize: `${sz}rem`, pointerEvents: 'none', zIndex: 0, willChange: 'transform, opacity' }}
      initial={{ y: 0, opacity: 0, rotate: 0 }}
      animate={{ y: '115vh', opacity: [0, 0.55, 0.55, 0], rotate: [0, 180, 360] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear', times: [0, 0.15, 0.85, 1] }}
    >{e}</motion.span>
  )
}

/* ─── Sparkle ring around the card ──────────────────────────────── */
function SparkleRing({ accent }) {
  const r = useReducedMotion()
  if (r) return null
  return (
    <>
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x = 50 + 46 * Math.cos(rad)
        const y = 50 + 46 * Math.sin(rad)
        return (
          <motion.span
            key={i} aria-hidden="true"
            style={{
              position: 'absolute', left: `${x}%`, top: `${y}%`,
              fontSize: 'clamp(.65rem,.9vw,.85rem)', pointerEvents: 'none', zIndex: 5,
              color: accent, filter: `drop-shadow(0 0 6px ${accent})`,
              transform: 'translate(-50%,-50%)',
            }}
            animate={{ scale: [0.6, 1.3, 0.6], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.2 + i * 0.35, delay: i * 0.25, repeat: Infinity, ease: 'easeInOut' }}
          >✦</motion.span>
        )
      })}
    </>
  )
}

/* ─── Confetti burst at card open ───────────────────────────────── */
const CONFETTI_EMOJIS = ['🌸', '💖', '✨', '💕', '🌷', '🌺', '💫', '🎀', '💝', '✦']
function ConfettiBurst({ onDone, accent }) {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    e: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    angle: (i / 40) * 360 + Math.random() * 9,
    dist: 90 + Math.random() * 180,
    dur: 0.85 + Math.random() * 0.5,
    sz: 0.9 + Math.random() * 0.7,
  }))
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8, overflow: 'hidden' }}>
      {pieces.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.span key={i}
            style={{ position: 'absolute', left: '50%', top: '50%', fontSize: `${p.sz}rem`, filter: `drop-shadow(0 0 4px ${accent})` }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, scale: 1.2, rotate: 360 }}
            transition={{ duration: p.dur, ease: [0.2, 0.8, 0.4, 1] }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          >{p.e}</motion.span>
        )
      })}
    </div>
  )
}

/* ─── Landing Page – Card Opening Experience with All Original Text ─── */
function LandingPage({ onOpen }) {
  const r = useReducedMotion()
  const [isOpening, setIsOpening] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const tapLock = useRef(false)

  const handleOpen = () => {
    if (tapLock.current || isOpening) return
    tapLock.current = true
    setIsOpening(true)
    setShowBurst(true)
    playSparkleSound(false)
    // Smooth, celebratory 3D card unfold into flower pages
    setTimeout(() => { onOpen() }, 420)
  }

  const cornerOrbs = [
    { top: '6%', left: '4%', e: '🌸', delay: 0.6, dur: 6.2 },
    { top: '8%', right: '5%', e: '🌷', delay: 0.9, dur: 7 },
    { bottom: '10%', left: '3%', e: '✨', delay: 0.4, dur: 5.5 },
    { bottom: '8%', right: '4%', e: '💕', delay: 1.2, dur: 6.8 },
  ]

  return (
    <motion.section
      aria-label="Birthday greeting landing"
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,77,109,0.18) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 72% 78%, rgba(183,156,255,0.15) 0%, transparent 55%), linear-gradient(150deg, #0d0814 0%, #1a0a2e 30%, #16213e 70%, #0d1a3a 100%)',
        padding: 'clamp(1rem,3.5svh,2rem)',
        overflow: 'hidden',
        perspective: 1200,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
      transition={{ duration: r ? 0.15 : 0.35, ease: E }}
    >
      {Array.from({ length: 8 }).map((_, i) => <AmbientPetal key={i} idx={i} />)}

      {!r && cornerOrbs.map((o, i) => (
        <motion.span key={i} aria-hidden="true"
          style={{ position: 'absolute', fontSize: 'clamp(1.4rem,3.5vw,2.2rem)', opacity: 0.4, pointerEvents: 'none', zIndex: 1, ...o }}
          animate={{ y: [0, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        >{o.e}</motion.span>
      ))}

      {/* Radiant glow behind card */}
      <motion.div aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: r ? 0 : 1.2, ease: E }}
        style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          width: 'clamp(320px,90vw,680px)', height: 'clamp(320px,90vw,680px)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,77,109,0.14) 0%, rgba(183,156,255,0.08) 45%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* THE BIRTHDAY GREETING CARD */}
      <motion.div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Open your birthday card"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
        style={{
          position: 'relative',
          width: 'min(92vw, 500px)',
          maxHeight: '92svh',
          cursor: isOpening ? 'default' : 'pointer',
          zIndex: 2,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          transformStyle: 'preserve-3d',
        }}
        initial={r ? false : { scale: 0.88, opacity: 0, y: 20 }}
        animate={isOpening
          ? {
              scale: [1, 1.03, 1.08, 0.35],
              rotateX: [0, -8, -25, -65],
              y: [0, -6, -20, -50],
              opacity: [1, 1, 1, 0],
              transition: { duration: 0.44, ease: E }
            }
          : { scale: 1, opacity: 1, y: 0, rotateX: 0 }
        }
        transition={r ? { duration: 0.15 } : { duration: 0.7, delay: 0.1, ease: E }}
        whileHover={isOpening ? {} : { scale: 1.015, transition: { duration: 0.25 } }}
        whileTap={isOpening ? {} : { scale: 0.98, transition: { duration: 0.1 } }}
      >
        {/* Outer Glow Halo */}
        <motion.div aria-hidden="true"
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: '-12px', borderRadius: '36px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,77,109,0.25) 0%, rgba(183,156,255,0.14) 50%, transparent 75%)',
            filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Card Surface */}
        <motion.div
          className="card-scroll"
          style={{
            position: 'relative', zIndex: 1,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '28px',
            padding: 'clamp(1.6rem, 4svh, 2.6rem) clamp(1.2rem, 4.5vw, 2.4rem)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.14)',
            overflowY: 'auto',
            maxHeight: '90svh',
          }}
        >
          {/* Inner Ornate Borders */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', pointerEvents: 'none' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 8, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '20px', pointerEvents: 'none' }} />

          {/* Top ornament */}
          <motion.div
            initial={r ? false : { opacity: 0, scale: 0.7, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: r ? 0 : 0.5, delay: 0.15, ease: ES }}
            style={{ textAlign: 'center', marginBottom: 'clamp(.5rem, 1.5svh, .85rem)', fontSize: 'clamp(.95rem, 2.2vw, 1.25rem)', opacity: 0.75, letterSpacing: '.15em' }}
          >✦ ❀ ✦</motion.div>

          {/* "To" label */}
          <motion.p
            initial={r ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: r ? 0 : 0.45, delay: 0.22, ease: E }}
            style={{
              textAlign: 'center',
              fontSize: 'clamp(.72rem, 1.8vw, .86rem)',
              letterSpacing: '0.46em',
              color: 'rgba(255,143,210,0.95)',
              marginBottom: 'clamp(.5rem, 1.6svh, .9rem)',
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              textTransform: 'uppercase'
            }}
          >To</motion.p>

          {/* Recipient name: Kavanashree K M */}
          <motion.h1
            initial={r ? false : { opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: r ? 0 : 0.55, delay: 0.28, ease: E }}
            style={{
              fontFamily: "'Pacifico', cursive",
              fontWeight: 400,
              fontSize: 'clamp(1.5rem, 5.5vw, 2.5rem)',
              lineHeight: 1.2, textAlign: 'center',
              color: '#fff',
              textShadow: '0 4px 40px rgba(0,0,0,0.6), 0 0 28px rgba(255,77,109,0.35)',
              marginBottom: 'clamp(.9rem, 2.4svh, 1.4rem)',
              letterSpacing: '0.01em',
            }}
          >
            Kavanashree K M
          </motion.h1>

          {/* Full Birthday Message */}
          <motion.div
            initial={r ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: r ? 0 : 0.6, delay: 0.35, ease: E }}
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(0.92rem, 2.4vw, 1.12rem)',
              lineHeight: 1.75,
              color: 'rgba(255,248,246,0.96)',
              marginBottom: 'clamp(1.0rem, 2.5svh, 1.5rem)',
              textShadow: '0 2px 16px rgba(0,0,0,0.55)',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '.65rem' }}>Happiest birthday kandha 🥳🥳🥳🥳</p>
            <p style={{ marginBottom: '.65rem' }}>May all your dreams come true and may god give u lots of happiness in the comming years.</p>
            <p style={{ marginBottom: '.65rem' }}>Keep smiling kandha 💕</p>
            <p style={{ margin: 0 }}>Wish you many more happy returns of the day 🥳🥳🥳🥳</p>
          </motion.div>

          {/* Bottom ornament */}
          <motion.div
            initial={r ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: r ? 0 : 0.5, delay: 0.42, ease: ES }}
            style={{ textAlign: 'center', marginBottom: 'clamp(.8rem, 2.2svh, 1.3rem)', fontSize: 'clamp(.95rem, 2.2vw, 1.2rem)', opacity: 0.65, letterSpacing: '.1em' }}
          >~ 🌸 ~</motion.div>

          {/* CTA button */}
          <motion.div
            initial={r ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: r ? 0 : 0.5, delay: 0.48, ease: E }}
            style={{ textAlign: 'center', position: 'relative' }}
          >
            <motion.button
              onClick={e => { e.stopPropagation(); handleOpen() }}
              disabled={isOpening}
              whileHover={isOpening ? {} : { scale: 1.05, boxShadow: '0 18px 55px rgba(255,77,109,0.55)' }}
              whileTap={isOpening ? {} : { scale: 0.96 }}
              style={{
                background: 'linear-gradient(135deg, #ff4d6d 0%, #ff6b9d 50%, #ff8fd2 100%)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '999px',
                padding: 'clamp(.75rem, 2svh, .95rem) clamp(1.8rem, 6vw, 2.8rem)',
                fontSize: 'clamp(.82rem, 2.2vw, .95rem)',
                letterSpacing: '0.14em',
                color: '#fff', cursor: isOpening ? 'default' : 'pointer',
                fontWeight: 700,
                boxShadow: '0 12px 45px rgba(255,77,109,0.42)',
                fontFamily: "'Nunito', sans-serif",
                textTransform: 'uppercase',
                position: 'relative', overflow: 'hidden',
                opacity: isOpening ? 0.8 : 1,
              }}
              aria-label="Open your birthday card"
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {isOpening ? 'Opening Card… ✨' : 'Open Your Card ✨'}
              </span>
              {!isOpening && (
                <motion.div aria-hidden="true"
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)', zIndex: 0 }}
                />
              )}
            </motion.button>
            <p style={{ fontSize: '.76rem', letterSpacing: '.12em', color: 'rgba(255,248,246,0.65)', marginTop: '.55rem' }}>
              tap anywhere to open ✦
            </p>
          </motion.div>
        </motion.div>

        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <SparkleRing accent="rgba(255,143,210,0.9)" />
        </div>

        <AnimatePresence>
          {showBurst && <ConfettiBurst key="burst" accent="#ff6b9d" onDone={() => setShowBurst(false)} />}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  )
}

/* ─── Grand Finale Slide (Slide 05 - Flower & Cake Finale) ───────── */
function FinaleSlide({ c, onFind, onReplay, muted, smx, smy, direction = 1 }) {
  const r = useReducedMotion()
  const accent = c.palette.accent
  const bgX = useTransform(smx, v => `${50 + v * -2}%`)
  const bgY = useTransform(smy, v => `${50 + v * -2}%`)

  return (
    <motion.section
      id={c.id}
      style={{
        '--ac': accent,
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'max(76px, 12svh) clamp(16px, 4vw, 56px) max(48px, 8svh)',
        overflow: 'hidden', isolation: 'isolate',
      }}
      initial={{ opacity: 0, y: direction * 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -direction * 20 }}
      transition={{ duration: r ? 0 : 0.28, ease: E }}
    >
      {/* Background layers */}
      <motion.div aria-hidden="true" style={{ position: 'absolute', inset: '-10%', zIndex: 0, willChange: 'background-position' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.m})`, backgroundSize: 'cover' }} className={`bg-img bg-m-${c.id}`} />
        <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.d})`, backgroundSize: 'cover', backgroundPositionX: bgX, backgroundPositionY: bgY }} className={`bg-img bg-d-${c.id}`} />
      </motion.div>

      {/* Radiant Veil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(4,1,10,0.18) 0%, rgba(4,1,10,0.65) 85%), linear-gradient(180deg, rgba(4,1,10,0.48) 0%, rgba(4,1,10,0.12) 50%, rgba(4,1,10,0.62) 100%)',
      }} />

      <Particles palette={c.palette} count={c.palette.count} mode={c.palette.mode} active />

      {/* Floating Quotes placed safely in corners */}
      <QuotePill text={c.quotes[0]} delay={0.12} style={{ top: 'clamp(68px, 10svh, 90px)', left: 'clamp(12px, 3vw, 42px)' }} />
      <QuotePill text={c.quotes[1]} delay={0.22} style={{ bottom: 'clamp(54px, 8svh, 80px)', right: 'clamp(12px, 3vw, 42px)' }} />

      {/* Main Center Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(0.25rem, 1.2svh, 0.75rem)',
          textAlign: 'center',
        }}
      >
        <FadeUp delay={0.02}>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '.72rem',
            letterSpacing: '.28em',
            color: 'var(--ac)',
            opacity: 0.9,
            marginBottom: '.15em',
            textTransform: 'uppercase',
          }}>
            {c.n} / 05 &nbsp;✦&nbsp; Pink Blossom Finale
          </p>
        </FadeUp>

        {/* Clean, Elegant Birthday Headline */}
        <h2
          style={{
            fontFamily: "'Pacifico', cursive",
            fontWeight: 400,
            fontSize: 'clamp(1.45rem, 4.8vw, 2.7rem)',
            lineHeight: 1.25,
            textWrap: 'balance',
            textShadow: '0 2px 28px rgba(0,0,0,.85), 0 0 35px var(--ac)',
            margin: 0,
            color: 'var(--ac)',
          }}
        >
          Happy Birthday, chinnamma 🌸
        </h2>

        {/* Heartfelt Birthday Message */}
        <FadeUp delay={0.06}>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(0.92rem, 2.4vw, 1.15rem)',
              lineHeight: 1.45,
              color: 'rgba(255,248,246,0.92)',
              textShadow: '0 2px 18px rgba(0,0,0,0.8)',
              maxWidth: '44ch',
              margin: '0 auto',
            }}
          >
            {c.message || 'Many more happy returns of the day pa.'}
          </p>
        </FadeUp>

        {/* THE ELEGANT 3D CAKE */}
        <FadeUp delay={0.12} style={{ width: '100%', position: 'relative' }}>
          <ThreeCake
            onWish={() => onFind('cake', 'May all your wishes come true, chinnamma 💝')}
            accent={accent}
            muted={muted}
          />
        </FadeUp>

        {/* Replay button */}
        <FadeUp delay={0.18}>
          <button className="replay" onClick={onReplay}>
            ↺ Replay from the beginning
          </button>
        </FadeUp>
      </div>
    </motion.section>
  )
}

/* ─── Flower Slide (Slides 01 - 04) ─────────────────────────────── */
function Slide({ c, idx, onFind, onReplay, muted, direction = 1 }) {
  const r = useReducedMotion()
  const mob = useIsMobile()
  const mx = useMotionValue(0), my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 34, damping: 22 })
  const smy = useSpring(my, { stiffness: 34, damping: 22 })
  const bgX = useTransform(smx, v => `${50 + v * -2.2}%`)
  const bgY = useTransform(smy, v => `${50 + v * -2.2}%`)
  const cardRX = useTransform(smx, v => mob ? 0 : v * -7)
  const cardRY = useTransform(smy, v => mob ? 0 : v * 6)
  const flip = idx % 2 !== 0

  useEffect(() => {
    if (r || mob) return
    const h = (e) => {
      if (e.pointerType !== 'mouse') return
      mx.set((e.clientX / innerWidth - 0.5) * 2)
      my.set((e.clientY / innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', h, { passive: true })
    return () => window.removeEventListener('pointermove', h)
  }, [r, mob])

  if (c.last) {
    return <FinaleSlide c={c} onFind={onFind} onReplay={onReplay} muted={muted} smx={smx} smy={smy} direction={direction} />
  }

  return (
    <motion.section
      id={c.id}
      style={{
        '--ac': c.palette.accent,
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(56px,9svh,96px) clamp(18px,4vw,68px) clamp(82px,11svh,108px)',
        overflow: 'hidden', isolation: 'isolate',
      }}
      initial={{ opacity: 0, y: direction * 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -direction * 20 }}
      transition={{ duration: r ? 0 : 0.28, ease: E }}
    >
      {/* Background */}
      <motion.div aria-hidden="true" style={{ position: 'absolute', inset: '-10%', zIndex: 0, willChange: 'background-position' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.m})`, backgroundSize: 'cover' }} className={`bg-img bg-m-${c.id}`} />
        <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.d})`, backgroundSize: 'cover', backgroundPositionX: bgX, backgroundPositionY: bgY }} className={`bg-img bg-d-${c.id}`} />
      </motion.div>

      {/* Veil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 48%,rgba(4,1,10,.1) 0%,rgba(4,1,10,.45) 82%),linear-gradient(180deg,rgba(4,1,10,.35) 0%,rgba(4,1,10,.04) 46%,rgba(4,1,10,.38) 100%)',
      }} />

      <Particles palette={c.palette} count={c.palette.count} mode={c.palette.mode} active images={c.imgs} />

      {/* Floating quote pills */}
      <QuotePill text={c.quotes[0]} delay={0.12} style={{ top: 'max(14px,env(safe-area-inset-top,0px))', left: '50%', transform: 'translateX(-50%)' }} />
      <QuotePill text={c.quotes[1]} delay={0.22} style={{ bottom: 'max(56px,env(safe-area-inset-bottom,0px))', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Easter egg */}
      {c.egg && (
        <button className="egg" style={c.egg.pos} aria-label="Secret surprise" onClick={() => onFind(c.id, c.egg.msg)}>
          {c.egg.e}
        </button>
      )}

      {/* Content grid */}
      <motion.div
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1160,
          display: 'grid', alignItems: 'center',
          gap: 'clamp(16px,3.5vw,58px)',
          gridTemplateColumns: '1fr',
          gridTemplateAreas: '"copy" "photo"',
          ...(r ? {} : { rotateX: cardRY, rotateY: cardRX }),
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        className={`grid-main${flip ? ' flip' : ''}`}
      >
        <div style={{ gridArea: 'copy', textAlign: 'center' }} className="copy-side">
          <FadeUp delay={0.02}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '.73rem', letterSpacing: '.26em', color: 'var(--ac)', opacity: 0.88, marginBottom: '.65em' }}>{c.n} / 05</p>
          </FadeUp>
          <h2 style={{
            fontFamily: "'Pacifico', cursive",
            fontWeight: 400,
            fontSize: 'clamp(1.45rem,5vw,3.2rem)',
            lineHeight: 1.2, textWrap: 'balance',
            textShadow: '0 2px 32px rgba(0,0,0,.82), 0 0 20px rgba(0,0,0,.5)', marginBottom: '.5em',
            letterSpacing: '0.01em',
          }}
          >
            <Words text={c.title} delay={0.04} />
            {c.title2 && <><br /><Words text={c.title2} delay={0.1} accent /></>}
          </h2>
          {c.message && (
            <FadeUp delay={0.08}>
              <p style={{
                fontFamily: "'Nunito', sans-serif", fontWeight: 600,
                fontSize: 'clamp(1.0rem,3vw,1.5rem)', lineHeight: 1.6,
                textWrap: 'balance', textShadow: '0 2px 28px rgba(0,0,0,.82)',
                marginTop: '1.2em', color: 'rgba(255,248,246,.97)',
              }}>{c.message}</p>
            </FadeUp>
          )}
          {c.hint && (
            <FadeUp delay={0.14}>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '.87rem', letterSpacing: '.14em', opacity: 0.75, marginTop: '1.1rem' }}>
                Scroll or swipe to continue&nbsp;
                <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ display: 'inline-block' }}>✦</motion.span>
              </p>
            </FadeUp>
          )}
        </div>

        <div style={{ gridArea: 'photo', display: 'grid', placeItems: 'center' }} className="photo-side">
          <Collage imgs={c.imgs} mx={smx} my={smy} />
        </div>
      </motion.div>
    </motion.section>
  )
}

/* ─── Progress bar ──────────────────────────────────────────────── */
function ProgressBar({ value }) {
  const prog = useSpring(value, { stiffness: 80, damping: 24 })
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        transformOrigin: '0 50%', scaleX: prog,
        background: 'linear-gradient(90deg,#ff4d6d,#ffc83d,#b79cff)',
        zIndex: 40,
      }}
    />
  )
}

/* ─── Toast ──────────────────────────────────────────────────────── */
function Toast({ message }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', zIndex: 50,
        top: 'max(68px,env(safe-area-inset-top,0px))',
        left: '50%', translate: '-50% 0',
        padding: '.55rem 1.2rem', borderRadius: 18,
        background: 'rgba(6,1,14,.9)',
        border: '1px solid rgba(255,255,255,.18)',
        fontSize: '.95rem', pointerEvents: 'none', whiteSpace: 'nowrap',
      }}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
    >{message}</motion.div>
  )
}

/* ─── App root ───────────────────────────────────────────────────── */
export default function App() {
  const [cur, setCur] = useState(0)
  const [direction, setDirection] = useState(1) // 1 forward, -1 backward
  const [muted, setMuted] = useState(true)
  const [found, setFound] = useState([])
  const [toast, setToast] = useState(null)
  const [opened, setOpened] = useState(false)
  const N = chapters.length
  const lockUntil = useRef(0)
  const curRef = useRef(0)
  const tt = useRef()
  useAudio(cur, muted)

  // Preload all assets in browser memory so slide loading is instant
  useEffect(() => {
    const bgs = [
      '/bg/rose-d.jpg', '/bg/rose-m.jpg',
      '/bg/sunflower-d.jpg', '/bg/sunflower-m.jpg',
      '/bg/waterlily-d.jpg', '/bg/waterlily-m.jpg',
      '/bg/lotus-d.jpg', '/bg/lotus-m.jpg',
      '/bg/pink-d.jpg', '/bg/pink-m.jpg',
    ]
    const imgs = [
      'rose-1', 'rose-2', 'rose-3',
      'sunflower-1', 'sunflower-2',
      'lily-1', 'lily-2', 'lily-3', 'lily-4',
      'lotus-1', 'lotus-2', 'pink-1'
    ].map(n => `/images/${n}.jpg`)

    ;[...bgs, ...imgs].forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  const goTo = useCallback((n, dir = 1) => {
    n = Math.max(0, Math.min(N - 1, n))
    const now = performance.now()
    if (n === curRef.current || now < lockUntil.current) return
    // Snappy, silky 380ms transition lock for fast scrolling
    lockUntil.current = now + 380
    setDirection(dir)
    curRef.current = n
    setCur(n)
  }, [N])

  useEffect(() => {
    let tx = 0, ty = 0
    let accumulatedDelta = 0

    const wheel = e => {
      if (performance.now() < lockUntil.current) return
      accumulatedDelta += e.deltaY
      if (Math.abs(accumulatedDelta) > 12 || Math.abs(e.deltaY) > 10) {
        const sign = Math.sign(accumulatedDelta || e.deltaY)
        accumulatedDelta = 0
        goTo(curRef.current + sign, sign)
      }
    }

    const ts = e => {
      tx = e.touches[0].clientX
      ty = e.touches[0].clientY
    }

    const te = e => {
      if (performance.now() < lockUntil.current) return
      const dx = tx - e.changedTouches[0].clientX
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) > 25 && Math.abs(dy) > Math.abs(dx)) {
        const sign = Math.sign(dy)
        goTo(curRef.current + sign, sign)
      } else if (Math.abs(dx) > 25) {
        const sign = Math.sign(dx)
        goTo(curRef.current + sign, sign)
      }
    }

    const kd = e => {
      if ([' ', 'ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        goTo(curRef.current + 1, 1)
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        goTo(curRef.current - 1, -1)
      }
    }

    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    window.addEventListener('keydown', kd)
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchend', te)
      window.removeEventListener('keydown', kd)
    }
  }, [goTo])

  const onFind = (id, msg) => {
    setFound(f => {
      const next = f.includes(id) ? f : [...f, id]
      setToast(msg)
      return next
    })
    clearTimeout(tt.current)
    tt.current = setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <ProgressBar value={(cur + 1) / N} />

      <AnimatePresence>
        {!opened ? (
          <LandingPage key="landing" onOpen={() => setOpened(true)} />
        ) : (
          <Slide
            key={chapters[cur].id}
            c={chapters[cur]}
            idx={cur}
            direction={direction}
            onFind={onFind}
            onReplay={() => {
              lockUntil.current = 0
              goTo(0, -1)
            }}
            muted={muted}
          />
        )}
      </AnimatePresence>

      {opened && (
        <>
          <MusicBtn muted={muted} onToggle={() => setMuted(m => !m)} />
          <DotNav cur={cur} total={N} onGo={n => goTo(n, n > cur ? 1 : -1)} />
        </>
      )}

      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </>
  )
}
