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
function QuotePill({ text, delay = 0.15, style, floatDuration = 4.5 }) {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? false : { opacity: 0, y: 10, scale: 0.95 }}
      animate={
        r
          ? { opacity: 1, y: 0, scale: 1 }
          : {
              opacity: 1,
              scale: 1,
              y: [0, -6, 0, 5, 0],
            }
      }
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.35, delay, ease: E },
        scale: { duration: 0.35, delay, ease: E },
        y: r
          ? { duration: 0.35, delay, ease: E }
          : {
              duration: floatDuration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: delay + 0.35,
            },
      }}
      style={{
        position: 'absolute', zIndex: 3,
        maxWidth: 'min(88vw, 340px)',
        padding: '.48rem 1.0rem',
        borderRadius: 999,
        background: 'rgba(0,0,0,.54)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.20)',
        boxShadow: '0 8px 24px rgba(0,0,0,.45)',
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

/* ─── BirthdayWishPill (Auto-cycling, interactive wish pills for Finale) ── */
function BirthdayWishPill({ quotes = [] }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (!quotes || !quotes.length) return
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % quotes.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [quotes])

  if (!quotes || !quotes.length) return null

  return (
    <div
      onClick={() => setActiveIdx(prev => (prev + 1) % quotes.length)}
      style={{
        margin: '0.35rem auto 0.6rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        position: 'relative',
        zIndex: 10,
      }}
      title="Tap to see next wish 💖"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.35, ease: E }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 1.1rem',
            borderRadius: 999,
            background: 'rgba(15, 3, 20, 0.72)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255, 143, 210, 0.45)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 0 20px rgba(255,143,210,0.3)',
            fontFamily: "'Nunito', sans-serif",
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 'clamp(0.74rem, 2.3vw, 0.88rem)',
            color: '#fff',
            maxWidth: 'min(92vw, 420px)',
            textAlign: 'center',
            lineHeight: 1.35,
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#ff8fd2' }}>✨</span>
          <span>{quotes[activeIdx]}</span>
          <span style={{ fontSize: '0.9rem', color: '#ff8fd2' }}>✨</span>
        </motion.div>
      </AnimatePresence>
    </div>
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

/* ─── Photo image source resolver (.jpg primary with auto fallback) ─── */
export function resolvePhotoSrc(name) {
  if (!name) return ''
  if (name.startsWith('/') || name.startsWith('http')) return name
  if (name.includes('.')) return `/images/${name}`
  return `/images/${name}.jpg`
}

/* ─── Fine-Art Keepsake Gallery Frame (Curved & Unlabelled) ────────── */
function PhotoFrame({
  name,
  fi = 0,
  delay = 0.08,
  mx,
  my,
  depth = 12,
  objectPosition = 'center 38%',
  onExpand,
  style = {},
}) {
  const r = useReducedMotion()
  const [src, setSrc] = useState(() => resolvePhotoSrc(name))
  const px = useTransform(mx, v => v * 1.5)
  const py = useTransform(my, v => v * 1.5)

  useEffect(() => {
    setSrc(resolvePhotoSrc(name))
  }, [name])

  const handleError = () => {
    if (src.endsWith('.jpg')) {
      setSrc(src.replace(/\.jpg$/, '.jpeg'))
    } else if (src.endsWith('.jpeg')) {
      setSrc(src.replace(/\.jpeg$/, '.png'))
    }
  }

  return (
    <motion.figure
      onClick={onExpand}
      role={onExpand ? 'button' : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onKeyDown={e => onExpand && (e.key === 'Enter' || e.key === ' ') && onExpand()}
      aria-label={`View photo ${name}`}
      style={{
        position: 'absolute', inset: 0, margin: 0, overflow: 'hidden',
        borderRadius: style.borderRadius || '24px',
        border: '2px solid rgba(255,255,255,.45)',
        boxShadow: '0 20px 48px rgba(0,0,0,.68), 0 0 0 1px rgba(255,255,255,.14), 0 0 32px -4px var(--ac, rgba(255,143,210,0.35))',
        background: 'linear-gradient(150deg, rgba(255,255,255,0.14) 0%, rgba(20,5,24,0.45) 100%)',
        cursor: onExpand ? 'pointer' : 'default',
        ...(r ? {} : { x: px, y: py }),
        ...style,
      }}
      initial={r ? false : { scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: E }}
      whileHover={{
        scale: 1.025,
        boxShadow: '0 28px 65px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.55), 0 0 45px var(--ac)',
        transition: { duration: 0.22 },
      }}
    >
      {/* Ambient background blur for cinematic depth */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', filter: 'blur(18px) brightness(0.6)',
          transform: 'scale(1.2)', opacity: 0.55,
        }}
      />

      {/* Main photo - uncropped, crisp and beautifully centered */}
      <img
        src={src}
        alt={name}
        onError={handleError}
        loading="eager" decoding="async"
        style={{
          position: 'relative',
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: objectPosition,
          display: 'block',
        }}
      />

      {/* Luxury Glass Sheen Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
          borderRadius: 'inherit',
        }}
      />
    </motion.figure>
  )
}

/* ─── Sculpted Blooming Botanical Flower for the Last Page ──────── */
function FlowerPhotoFrame({ name, mx, my, delay = 0.1, depth = 12, onExpand }) {
  const r = useReducedMotion()
  const [src, setSrc] = useState(() => resolvePhotoSrc(name))
  const px = useTransform(mx, v => v * depth)
  const py = useTransform(my, v => v * depth)

  useEffect(() => {
    setSrc(resolvePhotoSrc(name))
  }, [name])

  const handleError = () => {
    if (src.endsWith('.jpg')) {
      setSrc(src.replace(/\.jpg$/, '.jpeg'))
    } else if (src.endsWith('.jpeg')) {
      setSrc(src.replace(/\.jpeg$/, '.png'))
    }
  }

  // 16 Real Botanical Petals (8 outer sculpted petals + 8 inner offset petals)
  const outerPetalAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  const innerPetalAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]

  return (
    <motion.div
      onClick={onExpand}
      role={onExpand ? 'button' : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onKeyDown={e => onExpand && (e.key === 'Enter' || e.key === ' ') && onExpand()}
      aria-label="View flower photo"
      style={{
        position: 'relative', width: '100%', height: '100%',
        cursor: onExpand ? 'pointer' : 'default',
        ...(r ? {} : { x: px, y: py }),
      }}
      initial={r ? false : { scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: E }}
      whileHover={{ scale: 1.05, transition: { duration: 0.25 } }}
    >
      <svg
        viewBox="0 0 400 400"
        style={{
          width: '100%', height: '100%', overflow: 'visible',
          filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.75)) drop-shadow(0 0 35px rgba(255,143,210,0.55))',
        }}
      >
        <defs>
          <linearGradient id="fl-outer-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e83a65" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#ff70a6" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#ffe4f1" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id="fl-inner-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff4d88" stopOpacity="0.92" />
            <stop offset="60%" stopColor="#ffa0cb" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="fl-gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe699" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f39c12" />
          </linearGradient>

          <clipPath id="fl-center-photo-clip">
            <circle cx="200" cy="200" r="102" />
          </clipPath>
        </defs>

        {/* Ambient backlight */}
        <circle cx="200" cy="200" r="175" fill="rgba(255,100,160,0.28)" filter="blur(22px)" />

        {/* Tier 1: Outer Blooming Petals with pointed petal tips */}
        {outerPetalAngles.map(deg => (
          <g key={`out-${deg}`} transform={`translate(200, 200) rotate(${deg})`}>
            <path
              d="M 0 -70 C -38 -110 -46 -155 0 -195 C 46 -155 38 -110 0 -70 Z"
              fill="url(#fl-outer-grad)"
              stroke="rgba(255, 235, 245, 0.65)"
              strokeWidth="1.5"
            />
            <line x1="0" y1="-75" x2="0" y2="-182" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          </g>
        ))}

        {/* Tier 2: Inner Blooming Petals */}
        {innerPetalAngles.map(deg => (
          <g key={`in-${deg}`} transform={`translate(200, 200) rotate(${deg})`}>
            <path
              d="M 0 -60 C -30 -100 -38 -140 0 -178 C 38 -140 30 -100 0 -60 Z"
              fill="url(#fl-inner-grad)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.5"
            />
            <line x1="0" y1="-65" x2="0" y2="-165" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </g>
        ))}

        {/* Golden Central Aperture Medallion Frame Rim (Enlarged) */}
        <circle
          cx="200" cy="200" r="136"
          fill="#160312"
          stroke="url(#fl-gold-rim)"
          strokeWidth="3.5"
        />

        {/* Golden Stamen Ring */}
        <circle
          cx="200" cy="200" r="136"
          fill="none"
          stroke="rgba(255, 230, 160, 0.75)"
          strokeWidth="2"
          strokeDasharray="4 6"
        />

        {/* Stamen beads along the rim */}
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const bx = 200 + 136 * Math.cos(rad);
          const by = 200 + 136 * Math.sin(rad);
          return (
            <circle
              key={deg}
              cx={bx} cy={by} r="2.5"
              fill="#fff4d0" stroke="#e67e22" strokeWidth="0.8"
            />
          );
        })}
      </svg>

      {/* Enlarged Portrait Medallion: Zoomed out so entire face, hair & smile are fully visible */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '68%',
          height: '68%',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 32px rgba(255,143,210,0.65), inset 0 0 16px rgba(0,0,0,0.5)',
          border: '2.5px solid rgba(255, 230, 160, 0.95)',
          zIndex: 2,
        }}
      >
        <img
          src={src}
          alt={name}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '55% 10%',
            transform: 'scale(1.04)',
            transformOrigin: 'center center',
            display: 'block',
          }}
        />
        {/* Soft glass sheen */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 52%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Floating flower sparkles */}
      <span style={{ position: 'absolute', top: '-6px', right: '4px', fontSize: '1.1rem', filter: 'drop-shadow(0 0 6px #ff8fd2)', pointerEvents: 'none' }}>🌸</span>
      <span style={{ position: 'absolute', bottom: '2px', left: '6px', fontSize: '1.1rem', filter: 'drop-shadow(0 0 6px #ff8fd2)', pointerEvents: 'none' }}>✨</span>
    </motion.div>
  )
}

/* ─── Lightbox Modal (100% Uncropped Full-Screen Inspection) ─────── */
function Lightbox({ data, onClose, onPrev, onNext }) {
  const r = useReducedMotion()
  if (!data) return null
  const { img, index, imgs, title } = data
  const hasMultiple = imgs && imgs.length > 1
  const [currentSrc, setCurrentSrc] = useState(() => resolvePhotoSrc(img))

  useEffect(() => {
    setCurrentSrc(resolvePhotoSrc(img))
  }, [img])

  const handleError = () => {
    if (currentSrc.endsWith('.jpg')) {
      setCurrentSrc(currentSrc.replace(/\.jpg$/, '.jpeg'))
    } else if (currentSrc.endsWith('.jpeg')) {
      setCurrentSrc(currentSrc.replace(/\.jpeg$/, '.png'))
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(4, 1, 10, 0.94)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(14px, 3svh, 28px)',
        userSelect: 'none',
      }}
    >
      {/* Top Header */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 'max(14px, env(safe-area-inset-top, 0px))',
          left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 36px)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '.35rem .9rem', borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              fontSize: '.82rem', color: '#fff',
              letterSpacing: '.12em',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
            }}
          >
            {hasMultiple ? `PHOTO ${index + 1} / ${imgs.length}` : 'FULL PHOTO'}
          </span>
          {title && (
            <span style={{ fontSize: '.84rem', color: 'rgba(255,248,246,0.75)', maxWidth: '40vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close photo preview"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.28)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Image Container */}
      <motion.div
        onClick={e => e.stopPropagation()}
        key={img}
        initial={r ? false : { scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: E }}
        style={{
          position: 'relative',
          maxWidth: 'min(94vw, 880px)',
          maxHeight: '78svh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: 'auto',
        }}
      >
        <img
          src={currentSrc}
          alt={img}
          onError={handleError}
          style={{
            maxWidth: '100%', maxHeight: '78svh',
            width: 'auto', height: 'auto',
            objectFit: 'contain',
            borderRadius: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.85), 0 0 50px -10px var(--ac, rgba(255,143,210,0.5))',
            display: 'block',
          }}
        />
      </motion.div>

      {/* Prev / Next controls */}
      {hasMultiple && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            aria-label="Previous photo"
            style={{
              position: 'absolute', left: 'clamp(8px, 2.5vw, 24px)', top: '50%',
              transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: '1.6rem',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', zIndex: 10,
            }}
          >
            ‹
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            aria-label="Next photo"
            style={{
              position: 'absolute', right: 'clamp(8px, 2.5vw, 24px)', top: '50%',
              transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: '1.6rem',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', zIndex: 10,
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Bottom Hint */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}
      >
        <p style={{ margin: 0, fontSize: '.78rem', color: 'rgba(255,248,246,0.65)', letterSpacing: '.12em', fontFamily: "'Nunito', sans-serif" }}>
          tap anywhere outside to close ✦
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Organic Fine-Art Scrapbook Collage (Curved, Overlapped & Tilted) ─ */
function Collage({ imgs, mx, my, onOpenLightbox }) {
  const n = imgs.length
  const accent = 'var(--ac)'
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (n === 1) {
    return (
      <div
        style={{
          position: 'relative',
          width: 'min(92vw, 360px)',
          aspectRatio: '3/4',
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        <motion.div
          initial={{ rotate: -1.8 }}
          whileHover={{ scale: 1.04, rotate: 0, y: -5, zIndex: 10 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[0]}
            delay={0.06}
            mx={mx}
            my={my}
            depth={12}
            onExpand={() => onOpenLightbox?.(imgs[0], 0)}
          />
        </motion.div>
      </div>
    )
  }

  if (n === 2) {
    // 2 Photos (Sunflower & Lotus):
    // Curved, slightly overlapping in center (~8%), with complementary organic tilts
    return (
      <div
        style={{
          position: 'relative',
          width: 'min(94vw, 480px)',
          aspectRatio: '1.18 / 1',
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        {/* Left card - tilted counter-clockwise */}
        <motion.div
          onMouseEnter={() => setHoveredIdx(0)}
          onMouseLeave={() => setHoveredIdx(null)}
          initial={{ rotate: -3.2 }}
          whileHover={{ scale: 1.05, rotate: 0, y: -6, zIndex: 12 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            left: '0%',
            top: '2%',
            width: '54%',
            height: '92%',
            zIndex: hoveredIdx === 0 ? 12 : 2,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[0]}
            delay={0.06}
            mx={mx}
            my={my}
            depth={12}
            onExpand={() => onOpenLightbox?.(imgs[0], 0)}
          />
        </motion.div>

        {/* Right card - tilted clockwise, slightly overlapping left card */}
        <motion.div
          onMouseEnter={() => setHoveredIdx(1)}
          onMouseLeave={() => setHoveredIdx(null)}
          initial={{ rotate: 3.5 }}
          whileHover={{ scale: 1.05, rotate: 0, y: -6, zIndex: 12 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            right: '0%',
            bottom: '2%',
            width: '54%',
            height: '92%',
            zIndex: hoveredIdx === 1 ? 12 : 3,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[1]}
            delay={0.12}
            mx={mx}
            my={my}
            depth={16}
            onExpand={() => onOpenLightbox?.(imgs[1], 1)}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ delay: 0.1, duration: 0.4, ease: E }}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 'clamp(50px, 12vw, 80px)', height: 'clamp(50px, 12vw, 80px)',
            borderRadius: '50%', background: accent,
            filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none',
          }}
        />
      </div>
    )
  }

  if (n === 3) {
    // 3 Photos (Rose):
    // Organic romantic scrapbook layout – no rigid uniform rectangles!
    // Card 1 (rose-1): Hero portrait card, gently tilted (-3.2°), layered on left
    // Card 2 (rose-2): Radiant smile card, tilted (+3.8°), overlapping on right
    // Card 3 (rose-3): Graceful traditional portrait, tilted (-1.4°), anchored at center-bottom
    return (
      <div
        style={{
          position: 'relative',
          width: 'min(94vw, 470px)',
          aspectRatio: '1.05 / 1',
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        {/* Card 1: rose-1 (Hero card, intimate portrait) */}
        <motion.div
          onMouseEnter={() => setHoveredIdx(0)}
          onMouseLeave={() => setHoveredIdx(null)}
          initial={{ rotate: -3.2 }}
          whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 14 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            left: '2%',
            top: '2%',
            width: '56%',
            height: '74%',
            zIndex: hoveredIdx === 0 ? 14 : 3,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[0]}
            delay={0.06}
            mx={mx}
            my={my}
            depth={12}
            objectPosition="center 36%"
            onExpand={() => onOpenLightbox?.(imgs[0], 0)}
          />
        </motion.div>

        {/* Card 2: rose-2 (Radiant smile card) */}
        <motion.div
          onMouseEnter={() => setHoveredIdx(1)}
          onMouseLeave={() => setHoveredIdx(null)}
          initial={{ rotate: 3.8 }}
          whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 14 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            right: '2%',
            top: '8%',
            width: '54%',
            height: '72%',
            zIndex: hoveredIdx === 1 ? 14 : 2,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[1]}
            delay={0.12}
            mx={mx}
            my={my}
            depth={14}
            objectPosition="center center"
            onExpand={() => onOpenLightbox?.(imgs[1], 1)}
          />
        </motion.div>

        {/* Card 3: rose-3 (Traditional outfit card, centered lower anchor) */}
        <motion.div
          onMouseEnter={() => setHoveredIdx(2)}
          onMouseLeave={() => setHoveredIdx(null)}
          initial={{ rotate: -1.4 }}
          whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 14 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'absolute',
            left: '24%',
            bottom: '2%',
            width: '54%',
            height: '66%',
            zIndex: hoveredIdx === 2 ? 14 : 4,
            transformOrigin: 'center center',
          }}
        >
          <PhotoFrame
            name={imgs[2]}
            delay={0.18}
            mx={mx}
            my={my}
            depth={14}
            objectPosition="center 20%"
            onExpand={() => onOpenLightbox?.(imgs[2], 2)}
          />
        </motion.div>

        {/* Romantic backlight glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.28 }}
          transition={{ delay: 0.12, duration: 0.4, ease: E }}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 'clamp(60px, 14vw, 90px)', height: 'clamp(60px, 14vw, 90px)',
            borderRadius: '50%', background: accent,
            filter: 'blur(32px)', zIndex: 0, pointerEvents: 'none',
          }}
        />
      </div>
    )
  }

  // 4 Photos (Waterlily):
  // 4 curved, overlapping, tilted scrapbook cards
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(96vw, 490px)',
        aspectRatio: '1 / 1.05',
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      {/* Top Left */}
      <motion.div
        onMouseEnter={() => setHoveredIdx(0)}
        onMouseLeave={() => setHoveredIdx(null)}
        initial={{ rotate: -2.6 }}
        whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 12 }}
        transition={{ duration: 0.25, ease: E }}
        style={{
          position: 'absolute',
          left: '1%',
          top: '1%',
          width: '53%',
          height: '52%',
          zIndex: hoveredIdx === 0 ? 12 : 2,
          transformOrigin: 'center center',
        }}
      >
        <PhotoFrame
          name={imgs[0]}
          delay={0.05}
          mx={mx}
          my={my}
          depth={10}
          onExpand={() => onOpenLightbox?.(imgs[0], 0)}
        />
      </motion.div>

      {/* Top Right (lily-2) */}
      <motion.div
        onMouseEnter={() => setHoveredIdx(1)}
        onMouseLeave={() => setHoveredIdx(null)}
        initial={{ rotate: 2.8 }}
        whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 12 }}
        transition={{ duration: 0.25, ease: E }}
        style={{
          position: 'absolute',
          right: '1%',
          top: '7%',
          width: '53%',
          height: '52%',
          zIndex: hoveredIdx === 1 ? 12 : 3,
          transformOrigin: 'center center',
        }}
      >
        <PhotoFrame
          name={imgs[1]}
          delay={0.10}
          mx={mx}
          my={my}
          depth={12}
          objectPosition="center 14%"
          onExpand={() => onOpenLightbox?.(imgs[1], 1)}
        />
      </motion.div>

      {/* Bottom Left */}
      <motion.div
        onMouseEnter={() => setHoveredIdx(2)}
        onMouseLeave={() => setHoveredIdx(null)}
        initial={{ rotate: 2.4 }}
        whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 12 }}
        transition={{ duration: 0.25, ease: E }}
        style={{
          position: 'absolute',
          left: '2%',
          bottom: '1%',
          width: '53%',
          height: '52%',
          zIndex: hoveredIdx === 2 ? 12 : 4,
          transformOrigin: 'center center',
        }}
      >
        <PhotoFrame
          name={imgs[2]}
          delay={0.15}
          mx={mx}
          my={my}
          depth={10}
          onExpand={() => onOpenLightbox?.(imgs[2], 2)}
        />
      </motion.div>

      {/* Bottom Right */}
      <motion.div
        onMouseEnter={() => setHoveredIdx(3)}
        onMouseLeave={() => setHoveredIdx(null)}
        initial={{ rotate: -2.5 }}
        whileHover={{ scale: 1.06, rotate: 0, y: -6, zIndex: 12 }}
        transition={{ duration: 0.25, ease: E }}
        style={{
          position: 'absolute',
          right: '1%',
          bottom: '1%',
          width: '53%',
          height: '52%',
          zIndex: hoveredIdx === 3 ? 12 : 5,
          transformOrigin: 'center center',
        }}
      >
        <PhotoFrame
          name={imgs[3]}
          delay={0.20}
          mx={mx}
          my={my}
          depth={12}
          onExpand={() => onOpenLightbox?.(imgs[3], 3)}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.25 }}
        transition={{ delay: 0.1, duration: 0.4, ease: E }}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'clamp(50px, 12vw, 80px)', height: 'clamp(50px, 12vw, 80px)',
          borderRadius: '50%', background: accent,
          filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none',
        }}
      />
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
function FinaleSlide({ c, onFind, onReplay, muted, smx, smy, direction = 1, onOpenLightbox }) {
  const r = useReducedMotion()
  const mob = useIsMobile()
  const accent = c.palette.accent

  return (
    <motion.section
      id={c.id}
      style={{
        '--ac': accent,
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: mob ? 'flex-start' : 'center', justifyContent: 'center',
        padding: mob
          ? 'clamp(46px, 6svh, 60px) clamp(10px, 2.5vw, 18px) clamp(28px, 4svh, 44px)'
          : 'clamp(52px, 8svh, 76px) clamp(20px, 3.5vw, 52px) clamp(40px, 6svh, 64px)',
        overflowY: mob ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        isolation: 'isolate',
      }}
      initial={{ opacity: 0, y: direction * 45, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -direction * 45, scale: 0.98 }}
      transition={{ duration: r ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background layers - stationary and calm */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.m})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} className={`bg-img bg-m-${c.id}`} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.d})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} className={`bg-img bg-d-${c.id}`} />
      </div>

      {/* Radiant Veil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(4,1,10,0.18) 0%, rgba(4,1,10,0.65) 85%), linear-gradient(180deg, rgba(4,1,10,0.48) 0%, rgba(4,1,10,0.12) 50%, rgba(4,1,10,0.62) 100%)',
      }} />

      <Particles palette={c.palette} count={c.palette.count} mode={c.palette.mode} active />

      {/* Floating Quotes placed safely around the scene on desktop */}
      {!mob && c.quotes?.[0] && (
        <QuotePill
          text={c.quotes[0]}
          delay={0.12}
          floatDuration={4.4}
          style={{
            top: 'clamp(60px, 8.5svh, 86px)',
            left: 'clamp(14px, 3.5vw, 42px)',
            maxWidth: 'min(38vw, 310px)',
          }}
        />
      )}
      {!mob && (c.quotes?.[2] || '“keep smiling kandha 😊😊”') && (
        <QuotePill
          text={c.quotes[2] || '“keep smiling kandha 😊😊”'}
          delay={0.20}
          floatDuration={5.2}
          style={{
            top: 'clamp(60px, 8.5svh, 86px)',
            right: 'clamp(14px, 3.5vw, 42px)',
            maxWidth: 'min(38vw, 310px)',
          }}
        />
      )}
      {!mob && c.quotes?.[1] && (
        <QuotePill
          text={c.quotes[1]}
          delay={0.28}
          floatDuration={4.8}
          style={{
            bottom: 'clamp(50px, 7.5svh, 74px)',
            right: 'clamp(14px, 3.5vw, 42px)',
            maxWidth: 'min(42vw, 320px)',
          }}
        />
      )}

      {/* Main Center Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1060,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(0.15rem, 0.8svh, 0.45rem)',
          textAlign: 'center',
          margin: mob ? '0 auto' : undefined,
        }}
      >
        {/* Clean, Elegant Birthday Headline – 100% visible, unobstructed */}
        <h2
          style={{
            fontFamily: "'Pacifico', cursive",
            fontWeight: 400,
            fontSize: mob ? 'clamp(1.25rem, 4.6vw, 1.8rem)' : 'clamp(1.55rem, 3.8vw, 2.5rem)',
            lineHeight: 1.25,
            textWrap: 'balance',
            textShadow: '0 2px 28px rgba(0,0,0,.85), 0 0 35px var(--ac)',
            margin: '0 auto',
            color: 'var(--ac)',
          }}
        >
          Happy Birthday, chinnamma 💖
        </h2>

        {/* Heartfelt Birthday Message */}
        <FadeUp delay={0.04}>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: mob ? 'clamp(0.80rem, 2.2vw, 0.95rem)' : 'clamp(0.88rem, 2vw, 1.08rem)',
              lineHeight: 1.4,
              color: 'rgba(255,248,246,0.92)',
              textShadow: '0 2px 18px rgba(0,0,0,0.8)',
              maxWidth: '46ch',
              margin: '0.15rem auto 0',
            }}
          >
            {c.message || 'Many more happy returns of the day pa.'}
          </p>
        </FadeUp>

        {/* All quotes included in an elegant auto-cycling interactive pill so none are left out */}
        <FadeUp delay={0.06}>
          <BirthdayWishPill quotes={c.quotes} />
        </FadeUp>

        {/* Showcase Row: Framed Flower Photo + 3D Cake */}
        <div
          style={{
            display: 'flex',
            flexDirection: mob ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: mob ? 'clamp(4px, 1.2svh, 12px)' : 'clamp(28px, 4.5vw, 60px)',
            width: '100%',
            marginTop: 'clamp(2px, 0.4svh, 6px)',
          }}
        >
          {/* Authentic Blooming Flower Photo Frame on the Last Page */}
          <FadeUp delay={0.08} style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: mob ? 'min(155px, 42vw)' : 'min(330px, 29vw)',
                aspectRatio: '1/1',
              }}
            >
              <FlowerPhotoFrame
                name={c.imgs?.[0] || 'pink-1'}
                delay={0.1}
                mx={smx}
                my={smy}
                depth={12}
                onExpand={() => onOpenLightbox?.(c.imgs?.[0] || 'pink-1', 0, c.imgs, c.title)}
              />
            </div>
          </FadeUp>

          {/* THE ELEGANT 3D CAKE */}
          <FadeUp delay={0.12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ThreeCake
              onWish={() => onFind('cake', 'May all your wishes come true, chinnamma 💝')}
              accent={accent}
              muted={muted}
            />
          </FadeUp>
        </div>

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
function Slide({ c, idx, onFind, onReplay, muted, direction = 1, onOpenLightbox }) {
  const r = useReducedMotion()
  const mob = useIsMobile()
  const mx = useMotionValue(0), my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 34, damping: 22 })
  const smy = useSpring(my, { stiffness: 34, damping: 22 })
  const cardRX = useTransform(smx, v => mob ? 0 : v * -1.5)
  const cardRY = useTransform(smy, v => mob ? 0 : v * 1.2)
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
    return <FinaleSlide c={c} onFind={onFind} onReplay={onReplay} muted={muted} smx={smx} smy={smy} direction={direction} onOpenLightbox={onOpenLightbox} />
  }

  return (
    <motion.section
      id={c.id}
      style={{
        '--ac': c.palette.accent,
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: mob ? 'flex-start' : 'center', justifyContent: 'center',
        padding: mob
          ? 'clamp(46px, 6svh, 60px) clamp(12px, 3vw, 24px) clamp(36px, 5svh, 48px)'
          : 'clamp(56px,9svh,96px) clamp(18px,4vw,68px) clamp(82px,11svh,108px)',
        overflowY: mob ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        isolation: 'isolate',
      }}
      initial={{ opacity: 0, y: direction * 45, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -direction * 45, scale: 0.98 }}
      transition={{ duration: r ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background - stationary and calm */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.m})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} className={`bg-img bg-m-${c.id}`} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.palette.bg.d})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} className={`bg-img bg-d-${c.id}`} />
      </div>

      {/* Veil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 48%,rgba(4,1,10,.1) 0%,rgba(4,1,10,.45) 82%),linear-gradient(180deg,rgba(4,1,10,.35) 0%,rgba(4,1,10,.04) 46%,rgba(4,1,10,.38) 100%)',
      }} />

      <Particles palette={c.palette} count={c.palette.count} mode={c.palette.mode} active images={c.imgs} />

      {/* Floating quote pills - safely positioned on the copy/text side away from photos on desktop */}
      {!mob && c.quotes?.[0] && (
        <QuotePill
          text={c.quotes[0]}
          delay={0.12}
          style={
            flip
              ? {
                  top: 'max(16px, env(safe-area-inset-top, 0px))',
                  right: 'clamp(20px, 4.5vw, 64px)',
                  left: 'auto',
                  transform: 'none',
                  maxWidth: 'clamp(320px, 38vw, 540px)',
                }
              : {
                  top: 'max(16px, env(safe-area-inset-top, 0px))',
                  left: 'clamp(20px, 4.5vw, 64px)',
                  right: 'auto',
                  transform: 'none',
                  maxWidth: 'clamp(320px, 38vw, 540px)',
                }
          }
        />
      )}
      {!mob && c.quotes?.[1] && (
        <QuotePill
          text={c.quotes[1]}
          delay={0.22}
          style={
            flip
              ? {
                  bottom: 'max(18px, env(safe-area-inset-bottom, 0px))',
                  right: 'clamp(20px, 4.5vw, 64px)',
                  left: 'auto',
                  transform: 'none',
                  maxWidth: 'clamp(320px, 38vw, 540px)',
                }
              : {
                  bottom: 'max(18px, env(safe-area-inset-bottom, 0px))',
                  left: 'clamp(20px, 4.5vw, 64px)',
                  right: 'auto',
                  transform: 'none',
                  maxWidth: 'clamp(320px, 38vw, 540px)',
                }
          }
        />
      )}

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
          gap: 'clamp(14px,3vw,58px)',
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
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '.73rem',
              letterSpacing: '.26em',
              color: 'var(--ac)',
              opacity: 0.88,
              marginBottom: '.5em',
              paddingTop: mob ? 'clamp(24px, 4svh, 36px)' : 0,
            }}>
              {c.n} / 05
            </p>
          </FadeUp>
          <h2 style={{
            fontFamily: "'Pacifico', cursive",
            fontWeight: 400,
            fontSize: mob ? 'clamp(1.2rem, 4.6vw, 1.7rem)' : 'clamp(1.45rem,5vw,3.2rem)',
            lineHeight: 1.25, textWrap: 'balance',
            textShadow: '0 2px 32px rgba(0,0,0,.82), 0 0 20px rgba(0,0,0,.5)', marginBottom: '.5em',
            letterSpacing: '0.01em',
          }}
          >
            <Words text={c.title} delay={0.04} />
            {c.title2 && <><br /><Words text={c.title2} delay={0.1} accent /></>}
          </h2>

          {/* Heartfelt note/quote rendered in-flow on mobile – prevents overlapping */}
          {mob && c.quotes?.[0] && (
            <FadeUp delay={0.06}>
              <div
                style={{
                  margin: '0.45rem auto 0.55rem',
                  padding: '0.42rem 0.95rem',
                  maxWidth: 'min(92vw, 360px)',
                  borderRadius: '16px',
                  background: 'rgba(8,2,16,0.62)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  fontFamily: "'Nunito', sans-serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(0.72rem, 2.3vw, 0.82rem)',
                  lineHeight: 1.45,
                  color: 'rgba(255,248,246,0.96)',
                  textAlign: 'center',
                  textWrap: 'balance',
                }}
              >
                {c.quotes[0]}
              </div>
            </FadeUp>
          )}

          {c.message && (
            <FadeUp delay={0.08}>
              <p style={{
                fontFamily: "'Nunito', sans-serif", fontWeight: 600,
                fontSize: mob ? 'clamp(0.85rem, 2.6vw, 1.1rem)' : 'clamp(1.0rem,3vw,1.5rem)', lineHeight: 1.6,
                textWrap: 'balance', textShadow: '0 2px 28px rgba(0,0,0,.82)',
                marginTop: '0.8em', color: 'rgba(255,248,246,.97)',
              }}>{c.message}</p>
            </FadeUp>
          )}

          {c.quotes?.[1] && (
            <FadeUp delay={0.11}>
              <p style={{
                fontFamily: "'Nunito', sans-serif",
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: mob ? 'clamp(0.74rem, 2.3vw, 0.86rem)' : 'clamp(0.88rem, 2vw, 1.05rem)',
                lineHeight: 1.45,
                color: 'rgba(255,240,245,0.88)',
                margin: '0.45rem auto 0',
                maxWidth: '42ch',
                textWrap: 'balance',
              }}>
                {c.quotes[1]}
              </p>
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
          <Collage imgs={c.imgs} mx={smx} my={smy} onOpenLightbox={(img, idx) => onOpenLightbox?.(img, idx, c.imgs, c.title)} />
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
  const [muted, setMuted] = useState(false) // Music ON by default as requested
  const [found, setFound] = useState([])
  const [toast, setToast] = useState(null)
  const [opened, setOpened] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const lightboxRef = useRef(null)
  lightboxRef.current = lightbox

  const N = chapters.length
  const lockUntil = useRef(0)
  const curRef = useRef(0)
  const tt = useRef()
  const { fadeOutCurrent, resumeAudio } = useAudio(cur, muted)

  // ── Auto-scroll state: 40s timer per page if user doesn't scroll ──
  const [lastUserAction, setLastUserAction] = useState(0)
  const resetAutoTimer = useCallback(() => {
    setLastUserAction(Date.now())
  }, [])

  // Preload all assets in browser memory (.jpg primary)
  useEffect(() => {
    const bgs = [
      '/bg/rose-d.jpg', '/bg/rose-m.jpg',
      '/bg/sunflower-d.jpg', '/bg/sunflower-m.jpg',
      '/bg/waterlily-d.jpg', '/bg/waterlily-m.jpg',
      '/bg/lotus-d.jpg', '/bg/lotus-m.jpg',
      '/bg/pink-d.jpg', '/bg/pink-m.jpg',
    ]
    const imgs = [
      '/images/rose-1.jpg', '/images/rose-2.jpg', '/images/rose-3.jpg',
      '/images/sunflower-1.jpg', '/images/sunflower-2.jpg',
      '/images/lily-1.jpg', '/images/lily-2.jpg', '/images/lily-3.jpg', '/images/lily-4.jpg',
      '/images/lotus-1.jpg', '/images/lotus-2.jpg', '/images/pink-1.jpg',
    ]

    ;[...bgs, ...imgs].forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  const handleOpenLightbox = useCallback((imgName, idx, imgsList, title) => {
    resetAutoTimer()
    setLightbox({
      img: imgName,
      index: idx >= 0 ? idx : 0,
      imgs: imgsList || [imgName],
      title: title || '',
    })
  }, [resetAutoTimer])

  const handleCloseLightbox = useCallback(() => {
    resetAutoTimer()
    setLightbox(null)
  }, [resetAutoTimer])

  const handlePrevLightbox = useCallback(() => {
    setLightbox(prev => {
      if (!prev || !prev.imgs || prev.imgs.length <= 1) return prev
      const nextIdx = (prev.index - 1 + prev.imgs.length) % prev.imgs.length
      return { ...prev, index: nextIdx, img: prev.imgs[nextIdx] }
    })
  }, [])

  const handleNextLightbox = useCallback(() => {
    setLightbox(prev => {
      if (!prev || !prev.imgs || prev.imgs.length <= 1) return prev
      const nextIdx = (prev.index + 1) % prev.imgs.length
      return { ...prev, index: nextIdx, img: prev.imgs[nextIdx] }
    })
  }, [])

  const goTo = useCallback((n, dir = 1) => {
    n = Math.max(0, Math.min(N - 1, n))
    const now = performance.now()
    if (n === curRef.current || now < lockUntil.current) return
    // Lock window calibrated to match silky smooth 0.65s transition
    lockUntil.current = now + 680
    setDirection(dir)
    curRef.current = n
    setCur(n)
    setLastUserAction(Date.now())
  }, [N])

  // ── Auto-scroll: 40s per page if they don't scroll, fade out music, stop at final cake page ──
  useEffect(() => {
    // Only auto-scroll when greeting is opened, on slides before final cake page (cur < N - 1),
    // and when lightbox is not open
    if (!opened || cur >= N - 1 || lightbox) return

    const AUTO_SECONDS = 40000 // 40 seconds per page
    const FADE_LEAD = 2000     // Fade out music 2 seconds before slide transition

    // 1. Fade out music 2 seconds before page change
    const fadeTimer = setTimeout(() => {
      fadeOutCurrent(2.0)
    }, AUTO_SECONDS - FADE_LEAD)

    // 2. Advance to next page at 40 seconds
    const advanceTimer = setTimeout(() => {
      goTo(curRef.current + 1, 1)
    }, AUTO_SECONDS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(advanceTimer)
    }
  }, [cur, opened, lightbox, lastUserAction, N, goTo, fadeOutCurrent])

  // Wheel, Touch, Keyboard gestures
  useEffect(() => {
    let tx = 0, ty = 0
    let accumulatedDelta = 0
    let decayTimer = null

    const wheel = e => {
      if (lightboxRef.current) return
      if (performance.now() < lockUntil.current) {
        accumulatedDelta = 0
        return
      }

      accumulatedDelta += e.deltaY

      clearTimeout(decayTimer)
      decayTimer = setTimeout(() => {
        accumulatedDelta = 0
      }, 180)

      if (Math.abs(accumulatedDelta) > 45) {
        const sign = Math.sign(accumulatedDelta)
        accumulatedDelta = 0
        clearTimeout(decayTimer)
        resetAutoTimer()
        goTo(curRef.current + sign, sign)
      }
    }

    const ts = e => {
      if (lightboxRef.current) return
      tx = e.touches[0].clientX
      ty = e.touches[0].clientY
    }

    const te = e => {
      if (lightboxRef.current) return
      if (performance.now() < lockUntil.current) return
      const dx = tx - e.changedTouches[0].clientX
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx) * 1.1) {
        const sign = Math.sign(dy)
        resetAutoTimer()
        goTo(curRef.current + sign, sign)
      } else if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        const sign = Math.sign(dx)
        resetAutoTimer()
        goTo(curRef.current + sign, sign)
      }
    }

    const kd = e => {
      if (lightboxRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setLightbox(null)
          return
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePrevLightbox()
          return
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNextLightbox()
          return
        }
        return
      }

      if ([' ', 'ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        resetAutoTimer()
        goTo(curRef.current + 1, 1)
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        resetAutoTimer()
        goTo(curRef.current - 1, -1)
      }
    }

    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    window.addEventListener('keydown', kd)
    return () => {
      clearTimeout(decayTimer)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchend', te)
      window.removeEventListener('keydown', kd)
    }
  }, [goTo, handleNextLightbox, handlePrevLightbox, resetAutoTimer])

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

      <AnimatePresence mode="wait">
        {!opened ? (
          <LandingPage
            key="landing"
            onOpen={() => {
              resumeAudio()
              setOpened(true)
            }}
          />
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
            onOpenLightbox={handleOpenLightbox}
          />
        )}
      </AnimatePresence>

      {/* Volume toggle button is always present across landing and all slides */}
      <MusicBtn muted={muted} onToggle={() => setMuted(m => !m)} />

      {opened && (
        <DotNav cur={cur} total={N} onGo={n => goTo(n, n > cur ? 1 : -1)} />
      )}

      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            data={lightbox}
            onClose={handleCloseLightbox}
            onPrev={handlePrevLightbox}
            onNext={handleNextLightbox}
          />
        )}
      </AnimatePresence>
    </>
  )
}
