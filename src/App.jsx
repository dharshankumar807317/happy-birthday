import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
  useReducedMotion,
} from 'framer-motion'
import Particles from './Particles.jsx'
import { useAudio } from './useAudio.js'
import { chapters } from './data.js'

/* ─── shared easing ─────────────────────────────────────────────── */
const E  = [0.22, 0.82, 0.18, 1]
const ES = [0.34, 1.56, 0.64, 1]   // spring-y ease for reveals

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
function QuotePill({ text, delay, style }) {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? false : { opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.3, delay, ease: E }}
      style={{
        position: 'absolute', zIndex: 3,
        maxWidth: 'min(88vw, 340px)',
        padding: '.55rem 1.1rem',
        borderRadius: 999,
        background: 'rgba(0,0,0,.52)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.18)',
        fontFamily: "'Nunito', sans-serif",
        fontStyle: 'italic',
        fontSize: 'clamp(.78rem, 2.2vw, .92rem)',
        lineHeight: 1.55,
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

/* ─── Words – word-by-word stagger ─────────────────────────────── */
function Words({ text, delay = 0, accent }) {
  const r = useReducedMotion()
  return (
    <span style={accent ? { color: 'var(--ac)' } : undefined}>
      {text.split(' ').map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '.1em', marginBottom: '-.1em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={r ? false : { y: '115%', rotateX: 16, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            transition={{ duration: 1.05, delay: delay + i * 0.072, ease: E }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ─── FadeUp ────────────────────────────────────────────────────── */
function FadeUp({ delay = 0, children, style }) {
  const r = useReducedMotion()
  return (
    <motion.div style={style}
      initial={r ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay, ease: E }}
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

function PhotoFrame({ name, fi = 0, delay = 0.7, mx, my, depth = 16 }) {
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
      initial={r ? false : { scale: 0.8, opacity: 0, filter: 'blur(14px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.6, delay, ease: E }}
      whileHover={{ scale: 1.03, transition: { duration: 0.5 } }}
    >
      <img
        src={`/images/${name}.jpg`} alt={name}
        loading="lazy" decoding="async"
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
      <PhotoFrame name={imgs[0]} fi={0} delay={0.7} mx={mx} my={my} depth={12} />
    </div>
  )
  if (n === 2) return (
    <div style={{ position: 'relative', width: 'min(98%,520px)', aspectRatio: '1/1.1', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '66%', height: '74%' }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.7} mx={mx} my={my} depth={14} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '58%', height: '63%', zIndex: 2 }}>
        <PhotoFrame name={imgs[1]} fi={1} delay={0.9} mx={mx} my={my} depth={22} />
      </div>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.35 }} transition={{ delay: 0.6, duration: 1.4, ease: E }}
        style={{ position: 'absolute', right: '20%', top: '28%', width: 'clamp(40px,9vw,60px)', height: 'clamp(40px,9vw,60px)', borderRadius: '50%', background: accent, filter: 'blur(20px)', zIndex: 0 }} />
    </div>
  )
  if (n === 3) return (
    <div style={{ position: 'relative', width: 'min(98%,540px)', aspectRatio: '1/1.08', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: '6%', width: '58%', height: '62%', zIndex: 2 }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.7} mx={mx} my={my} depth={12} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, width: '44%', height: '46%', zIndex: 1 }}>
        <PhotoFrame name={imgs[1]} fi={3} delay={0.86} mx={mx} my={my} depth={20} />
      </div>
      <div style={{ position: 'absolute', right: '3%', bottom: 0, width: '56%', height: '46%', zIndex: 3 }}>
        <PhotoFrame name={imgs[2]} fi={2} delay={1.02} mx={mx} my={my} depth={18} />
      </div>
    </div>
  )
  return (
    <div style={{ position: 'relative', width: 'min(98%,550px)', aspectRatio: '1/1.02', margin: 'auto' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '52%' }}>
        <PhotoFrame name={imgs[0]} fi={0} delay={0.7} mx={mx} my={my} depth={10} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: '5%', width: '46%', height: '46%' }}>
        <PhotoFrame name={imgs[1]} fi={3} delay={0.82} mx={mx} my={my} depth={18} />
      </div>
      <div style={{ position: 'absolute', left: '4%', bottom: 0, width: '44%', height: '44%' }}>
        <PhotoFrame name={imgs[2]} fi={1} delay={0.94} mx={mx} my={my} depth={14} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50%', height: '46%' }}>
        <PhotoFrame name={imgs[3]} fi={2} delay={1.06} mx={mx} my={my} depth={20} />
      </div>
    </div>
  )
}

/* ─── Birthday cake finale ──────────────────────────────────────── */
function BirthdayFinale({ onFind, accent }) {
  const [phase, setPhase] = useState(0) // 0=idle 1=lit 2=blown
  const [bursts, setBursts] = useState([])
  const fireLock = useRef(false)

  const fire = () => {
    if (fireLock.current) return
    fireLock.current = true
    setTimeout(() => { fireLock.current = false }, 1200)
    const id = Date.now()
    const pieces = Array.from({ length: 32 }, (_, i) => ({
      e: ['💕', '💖', '🌸', '✦', '🎈', '🍫', '🧁', '💝', '🌟', '🎊', '💫', '🎀'][i % 12],
      angle: (i / 32) * 360,
      dist: 130 + Math.random() * 200,
      dur: 1.5 + Math.random() * 0.9,
    }))
    setBursts(b => [...b.slice(-5), { id, pieces }])
    onFind('cake', '🎂✨ Wish made!')
  }

  const handleTap = () => {
    if (phase === 0) { setPhase(1); return }
    if (phase === 1) { setPhase(2); fire(); return }
    fire()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.9rem', position: 'relative', paddingTop: '.4rem' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleTap}>
        <motion.div
          animate={phase > 0 ? { filter: [`drop-shadow(0 0 18px ${accent})`, `drop-shadow(0 0 48px ${accent})`, `drop-shadow(0 0 18px ${accent})`] } : {}}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{ fontSize: 'clamp(4rem,15vw,7.5rem)', lineHeight: 1, filter: `drop-shadow(0 0 16px ${accent})` }}
        >🎂</motion.div>
        {phase === 1 && Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', top: '-10px', left: `${14 + i * 15}%`, fontSize: '1rem', transformOrigin: '50% 100%' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, scaleY: [1, .82, 1], rotate: [-6, 6, -6] }}
            transition={{ opacity: { duration: 0.3 }, scaleY: { duration: 0.55 + i * 0.07, repeat: Infinity }, rotate: { duration: 0.7 + i * 0.08, repeat: Infinity } }}
          >🕯️</motion.div>
        ))}
        <p style={{ textAlign: 'center', fontSize: '.76rem', letterSpacing: '.12em', opacity: 0.7, marginTop: '.25rem' }}>
          {phase === 0 ? 'tap to light ✨' : phase === 1 ? 'tap to blow out 🌟' : phase === 2 ? 'may all ur wishes come true kandha' : 'tap for more fireworks 🎆'}
        </p>
      </div>
      {bursts.map(burst => (
        <div key={burst.id} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, top: '38%', left: '50%' }}>
          {burst.pieces.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180
            return (
              <motion.span key={i} style={{ position: 'absolute', fontSize: '1.35rem' }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, scale: 1.3 }}
                transition={{ duration: p.dur, ease: [0.2, 0.8, 0.4, 1] }}
              >{p.e}</motion.span>
            )
          })}
        </div>
      ))}
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
            /* Active: narrow pill (6 × 20). Inactive: small dot (5 × 5) */
            width:  cur === i ? 6  : 5,
            height: cur === i ? 20 : 5,
            borderRadius: 999,
            border: 'none', cursor: 'pointer', padding: 0,
            background: cur === i ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)',
            transition: 'all .4s ease',
            boxShadow: cur === i ? '0 0 10px rgba(255,255,255,.5)' : 'none',
            /* Touch target via outline trick – invisible but tappable */
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
  const delay = idx * 0.65
  const dur = 7 + (idx * 2.3) % 7
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
            transition={{ duration: 2.2 + i * 0.35, delay: i * 0.44, repeat: Infinity, ease: 'easeInOut' }}
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
    dur: 1.2 + Math.random() * 0.8,
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

/* ─── Landing Page ───────────────────────────────────────────────── */
function LandingPage({ onOpen }) {
  const r = useReducedMotion()
  const [tapped, setTapped] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const tapLock = useRef(false)

  const handleOpen = () => {
    if (tapLock.current || isOpening) return
    tapLock.current = true
    setTapped(true)
    setIsOpening(true)
    setShowBurst(true)
    // small delay so burst is visible before transition
    setTimeout(() => { onOpen() }, 900)
  }

  // Decorative corner roses
  const cornerOrbs = [
    { top: '6%', left: '4%', e: '🌸', delay: 1.8, dur: 6.2 },
    { top: '8%', right: '5%', e: '🌷', delay: 2.1, dur: 7 },
    { bottom: '10%', left: '3%', e: '✨', delay: 1.4, dur: 5.5 },
    { bottom: '8%', right: '4%', e: '💕', delay: 2.4, dur: 6.8 },
    { top: '38%', left: '1%', e: '🌺', delay: 1.1, dur: 8 },
    { top: '44%', right: '1%', e: '🌹', delay: 1.9, dur: 7.3 },
  ]

  return (
    <motion.section
      aria-label="Birthday greeting landing"
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,77,109,0.18) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 72% 78%, rgba(183,156,255,0.15) 0%, transparent 55%), linear-gradient(150deg, #0d0814 0%, #1a0a2e 30%, #16213e 70%, #0d1a3a 100%)',
        padding: 'clamp(1rem,4svh,2rem)',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
      transition={{ duration: r ? 0.2 : 1.3, ease: E }}
    >
      {/* Ambient drifting petals */}
      {Array.from({ length: 10 }).map((_, i) => <AmbientPetal key={i} idx={i} />)}

      {/* Corner floating decorations */}
      {!r && cornerOrbs.map((o, i) => (
        <motion.span key={i} aria-hidden="true"
          style={{ position: 'absolute', fontSize: 'clamp(1.4rem,3.5vw,2.2rem)', opacity: 0.4, pointerEvents: 'none', zIndex: 1, ...o }}
          animate={{ y: [0, -12, 0], rotate: [0, o.delay > 2 ? -8 : 6, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        >{o.e}</motion.span>
      ))}

      {/* Soft radial glow behind card */}
      <motion.div aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: r ? 0 : 2.2, ease: E }}
        style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          width: 'clamp(320px,90vw,680px)', height: 'clamp(320px,90vw,680px)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,77,109,0.12) 0%, rgba(183,156,255,0.08) 45%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* THE CARD */}
      <motion.div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Open your birthday card"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
        style={{
          position: 'relative',
          width: 'min(92vw, 480px)',
          maxHeight: '90svh',
          cursor: isOpening ? 'default' : 'pointer',
          zIndex: 2,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        initial={r ? false : { scale: 0.82, opacity: 0, y: 36 }}
        animate={tapped
          ? { scale: [1, 0.96, 1.04, 0], opacity: [1, 1, 1, 0], y: [0, 4, -6, -40], transition: { duration: 0.85, ease: E } }
          : { scale: 1, opacity: 1, y: 0 }
        }
        transition={r ? { duration: 0.15 } : { duration: 1.2, delay: 0.25, ease: E }}
        whileTap={isOpening ? {} : { scale: 0.97, transition: { duration: 0.12 } }}
      >
        {/* Card outer glow */}
        <motion.div aria-hidden="true"
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: '-12px', borderRadius: '36px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,77,109,0.22) 0%, rgba(183,156,255,0.12) 50%, transparent 75%)',
            filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Card surface */}
        <motion.div
          style={{
            position: 'relative', zIndex: 1,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.055) 100%)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '28px',
            padding: 'clamp(2rem,5svh,3.2rem) clamp(1.4rem,4.5vw,2.8rem)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Inner refined border */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', pointerEvents: 'none' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 8, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '20px', pointerEvents: 'none' }} />

          {/* Top ornament row */}
          <motion.div
            initial={r ? false : { opacity: 0, scale: 0.7, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: r ? 0 : 1.1, delay: 0.55, ease: ES }}
            style={{ textAlign: 'center', marginBottom: 'clamp(.7rem,2svh,1.1rem)', fontSize: 'clamp(1rem,2.5vw,1.3rem)', opacity: 0.75, letterSpacing: '.15em' }}
          >✦ ❀ ✦</motion.div>

          {/* "To" label */}
          <motion.p
            initial={r ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: r ? 0 : 0.95, delay: 0.75, ease: E }}
            style={{ textAlign: 'center', fontSize: 'clamp(.72rem,1.8vw,.88rem)', letterSpacing: '0.46em', color: 'rgba(255,143,210,0.95)', marginBottom: 'clamp(.9rem,2.5svh,1.6rem)', fontWeight: 700, fontFamily: "'Nunito', sans-serif", textTransform: 'uppercase' }}
          >To</motion.p>

          {/* Recipient name */}
          <motion.h1
            initial={r ? false : { opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: r ? 0 : 1.1, delay: 0.92, ease: E }}
            style={{
              fontFamily: "'Pacifico', cursive",
              fontWeight: 400,
              fontSize: 'clamp(1.6rem,6vw,2.8rem)',
              lineHeight: 1.2, textAlign: 'center',
              color: '#fff',
              textShadow: '0 4px 40px rgba(0,0,0,0.6), 0 0 28px rgba(255,77,109,0.35), 0 2px 0 rgba(255,120,150,0.4)',
              marginBottom: 'clamp(1.2rem,3.5svh,2rem)',
              letterSpacing: '0.01em',
            }}
          >Kavanashree K M</motion.h1>

          {/* Birthday message — preserved exactly */}
          <motion.div
            initial={r ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: r ? 0 : 1.15, delay: 1.1, ease: E }}
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(1.0rem,2.8vw,1.2rem)',
              lineHeight: 1.9,
              color: 'rgba(255,248,246,0.96)',
              marginBottom: 'clamp(1.2rem,3svh,1.8rem)',
              textShadow: '0 2px 16px rgba(0,0,0,0.55)',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '.9rem' }}>Happiest birthday kandha 🥳🥳🥳🥳</p>
            <p style={{ marginBottom: '.9rem' }}>May all your dreams come true and may god give u lots of happiness in the comming years.</p>
            <p style={{ marginBottom: '.9rem' }}>Keep smiling kandha 💕</p>
            <p>Wish you many more happy returns of the day 🥳🥳🥳🥳</p>
          </motion.div>

          {/* Bottom ornament */}
          <motion.div
            initial={r ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: r ? 0 : 1, delay: 1.32, ease: ES }}
            style={{ textAlign: 'center', marginBottom: 'clamp(.9rem,2.5svh,1.5rem)', fontSize: 'clamp(.95rem,2.2vw,1.2rem)', opacity: 0.6, letterSpacing: '.1em' }}
          >~ 🌸 ~</motion.div>

          {/* CTA button */}
          <motion.div
            initial={r ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: r ? 0 : 1.1, delay: 1.52, ease: E }}
            style={{ textAlign: 'center', position: 'relative' }}
          >
            <motion.button
              onClick={e => { e.stopPropagation(); handleOpen() }}
              disabled={isOpening}
              whileHover={isOpening ? {} : { scale: 1.06, boxShadow: '0 18px 55px rgba(255,77,109,0.55)' }}
              whileTap={isOpening ? {} : { scale: 0.96 }}
              style={{
                background: 'linear-gradient(135deg, #ff4d6d 0%, #ff6b9d 50%, #ff8fd2 100%)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '999px',
                padding: 'clamp(.85rem,2.5svh,1.1rem) clamp(1.8rem,6vw,3rem)',
                fontSize: 'clamp(.82rem,2.2vw,.95rem)',
                letterSpacing: '0.14em',
                color: '#fff', cursor: isOpening ? 'default' : 'pointer',
                fontWeight: 700,
                boxShadow: '0 12px 45px rgba(255,77,109,0.42)',
                fontFamily: "'Nunito', sans-serif",
                textTransform: 'uppercase',
                position: 'relative', overflow: 'hidden',
                opacity: isOpening ? 0.7 : 1,
                transition: 'opacity 0.3s',
              }}
              aria-label="Open your birthday card"
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {isOpening ? 'Opening… ✨' : 'Open Your Card ✨'}
              </span>
              {/* shimmer sweep */}
              {!isOpening && (
                <motion.div aria-hidden="true"
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)', zIndex: 0 }}
                />
              )}
            </motion.button>

            {/* tap cue */}
            <AnimatePresence>
              {!isOpening && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 0.65 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 2.0 }}
                  style={{ fontSize: 'clamp(.65rem,1.7vw,.78rem)', letterSpacing: '.14em', marginTop: '.7rem', color: 'rgba(255,248,246,0.65)' }}
                >
                  or tap anywhere on the card&nbsp;
                  <motion.span aria-hidden="true" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>✦</motion.span>
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Sparkle ring ornaments */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <SparkleRing accent="rgba(255,143,210,0.9)" />
        </div>

        {/* Confetti burst on open */}
        <AnimatePresence>
          {showBurst && <ConfettiBurst key="burst" accent="#ff6b9d" onDone={() => setShowBurst(false)} />}
        </AnimatePresence>
      </motion.div>

      {/* Subtle light sweep across the whole page */}
      {!r && (
        <motion.div aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.025) 50%, transparent 70%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
        />
      )}
    </motion.section>
  )
}

/* ─── Slide ──────────────────────────────────────────────────────── */
function Slide({ c, idx, onFind, onReplay }) {
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

  return (
    <motion.section
      id={c.id}
      style={{
        '--ac': c.palette.accent,
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        /* Horizontal padding: generous on mobile so heading never clips */
        padding: 'clamp(52px,9svh,96px) clamp(18px,4vw,68px) clamp(82px,11svh,108px)',
        overflow: 'hidden', isolation: 'isolate',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: r ? 0 : 1.55, ease: 'easeInOut' }}
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

      {/* Floating quote pills — pinned to top/bottom edges, never over the heading */}
      <QuotePill text={c.quotes[0]} delay={1.9} style={{ top: 'max(14px,env(safe-area-inset-top,0px))', left: '50%', transform: 'translateX(-50%)' }} />
      <QuotePill text={c.quotes[1]} delay={2.4} style={{ bottom: 'max(56px,env(safe-area-inset-bottom,0px))', left: '50%', transform: 'translateX(-50%)' }} />

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
          <FadeUp delay={0.45}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '.73rem', letterSpacing: '.26em', color: 'var(--ac)', opacity: 0.88, marginBottom: '.65em' }}>{c.n} / 05</p>
          </FadeUp>
          <h2 style={{
            fontFamily: "'Pacifico', cursive",
            fontWeight: 400,
            fontSize: 'clamp(1.45rem,5vw,3.2rem)',
            lineHeight: 1.2, textWrap: 'balance',
            textShadow: '0 2px 32px rgba(0,0,0,.82), 0 0 20px rgba(0,0,0,.5)', marginBottom: '.5em',
            letterSpacing: '0.01em',
          }}>
            <Words text={c.title} delay={0.6} />
            {c.title2 && <><br /><Words text={c.title2} delay={1.35} accent /></>}
          </h2>
          {c.message && (
            <FadeUp delay={1.2}>
              <p style={{
                fontFamily: "'Nunito', sans-serif", fontWeight: 600,
                fontSize: 'clamp(1.0rem,3vw,1.5rem)', lineHeight: 1.6,
                textWrap: 'balance', textShadow: '0 2px 28px rgba(0,0,0,.82)',
                marginTop: '1.2em', color: 'rgba(255,248,246,.97)',
              }}>{c.message}</p>
            </FadeUp>
          )}
          {c.last && (
            <FadeUp delay={1.6}>
              <BirthdayFinale onFind={onFind} accent={c.palette.accent} />
            </FadeUp>
          )}
          {c.last && (
            <FadeUp delay={2.1}>
              <button className="replay" onClick={onReplay}>↺ Replay from the beginning</button>
            </FadeUp>
          )}
          {c.hint && (
            <FadeUp delay={2.1}>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '.87rem', letterSpacing: '.14em', opacity: 0.75, marginTop: '1.1rem' }}>
                Scroll or swipe to begin&nbsp;
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
  const [muted, setMuted] = useState(true)
  const [found, setFound] = useState([])
  const [toast, setToast] = useState(null)
  const [opened, setOpened] = useState(false)
  const N = chapters.length
  const lockUntil = useRef(0)
  const curRef = useRef(0)
  const tt = useRef()
  useAudio(cur, muted)

  const goTo = useCallback(n => {
    n = Math.max(0, Math.min(N - 1, n))
    const now = performance.now()
    if (n === curRef.current || now < lockUntil.current) return
    lockUntil.current = now + 1500
    curRef.current = n
    setCur(n)
  }, [N])

  useEffect(() => {
    let ty = 0
    const wheel = e => { if (performance.now() < lockUntil.current) return; if (Math.abs(e.deltaY) > 14) goTo(curRef.current + Math.sign(e.deltaY)) }
    const ts = e => { ty = e.touches[0].clientY }
    const te = e => { const d = ty - e.changedTouches[0].clientY; if (Math.abs(d) > 50) goTo(curRef.current + Math.sign(d)) }
    const kd = e => {
      if ([' ', 'ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); goTo(curRef.current + 1) }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(curRef.current - 1) }
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
      setToast(f.includes(id) ? 'Already found ✦' : `${msg}  (${next.length}/5)`)
      return next
    })
    clearTimeout(tt.current)
    tt.current = setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!opened
          ? <LandingPage key="landing" onOpen={() => setOpened(true)} />
          : <Slide key={chapters[cur].id} c={chapters[cur]} idx={cur} onFind={onFind} onReplay={() => { lockUntil.current = 0; goTo(0) }} />
        }
      </AnimatePresence>

      {opened && (
        <>
          <MusicBtn muted={muted} onToggle={() => setMuted(m => !m)} />
          <DotNav cur={cur} total={N} onGo={goTo} />
        </>
      )}

      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </>
  )
}
