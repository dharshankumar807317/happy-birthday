import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { playSparkleSound, playWhooshSound, playCelebrationSound } from './soundEffects.js'

const E = [0.22, 0.82, 0.18, 1]

// Delicate luxury sparkle & petal celebration (non-cluttered, elegant)
function ElegantCelebration({ active, accent = '#ff8fd2' }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn 65 delicate golden sparkles and soft rose blossom petals
    const newParticles = []
    const w = canvas.width
    const h = canvas.height

    for (let i = 0; i < 65; i++) {
      const isPetal = i % 3 === 0
      newParticles.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.4),
        vx: (Math.random() - 0.5) * 1.8,
        vy: isPetal ? 0.8 + Math.random() * 1.4 : 1.2 + Math.random() * 2.2,
        size: isPetal ? 7 + Math.random() * 6 : 1.8 + Math.random() * 3.2,
        color: isPetal ? '#ffb3c6' : Math.random() > 0.4 ? '#ffd700' : '#ffffff',
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 2.5,
        isPetal,
        life: 1,
        decay: 0.004 + Math.random() * 0.004,
      })
    }
    particlesRef.current = newParticles

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const list = particlesRef.current

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i]
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vRot
        p.life -= p.decay

        if (p.life <= 0 || p.y > canvas.height + 20) {
          list.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.life * (p.isPetal ? 0.85 : 0.95))

        if (p.isPetal) {
          // Delicate organic blossom petal
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 0.9, p.size * 0.5, 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Radiant 4-point sparkle star
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          const s = p.size
          ctx.beginPath()
          ctx.moveTo(0, -s * 2)
          ctx.lineTo(s * 0.4, -s * 0.4)
          ctx.lineTo(s * 2, 0)
          ctx.lineTo(s * 0.4, s * 0.4)
          ctx.lineTo(0, s * 2)
          ctx.lineTo(-s * 0.4, s * 0.4)
          ctx.lineTo(-s * 2, 0)
          ctx.lineTo(-s * 0.4, -s * 0.4)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }

      if (list.length > 0) {
        animId = requestAnimationFrame(loop)
      }
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        width: '100%',
        height: '100%',
      }}
    />
  )
}

/* ─── 3D Three.js Birthday Cake Component ────────────────────────── */
export default function ThreeCake({ onWish, accent = '#ff8fd2', muted = false }) {
  const mountRef = useRef(null)
  const [phase, setPhase] = useState(0) // 0: unlit, 1: lit, 2: blown
  const [celebrationTrigger, setCelebrationTrigger] = useState(0)
  const isDragging = useRef(false)
  const prevMouseX = useRef(0)
  const rotationY = useRef(0)

  // References to dynamic 3D elements
  const flamesRef = useRef([])
  const pointLightsRef = useRef([])
  const smokeParticlesRef = useRef([])
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera with flattering perspective angle
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 2.0, 5.8)
    camera.lookAt(0, 0.25, 0)

    // Renderer with transparent background and high shadow precision
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // ── Studio Lighting Setup ──
    const ambientLight = new THREE.AmbientLight(0xffe4e6, 0.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(3.5, 5, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffb6c1, 1.2)
    fillLight.position.set(-3.5, 3, -2)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0xffd1dc, 1.5, 10)
    rimLight.position.set(0, 4, -3)
    scene.add(rimLight)

    // ── Master Cake Group ──
    const cakeGroup = new THREE.Group()
    cakeGroup.position.y = -0.45
    scene.add(cakeGroup)

    // ── 1. Pedestal Stand (Silver & Crystal Sheen) ──
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.75,
      roughness: 0.18,
    })

    // Stand base
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, 0.08, 48), standMat)
    standBase.position.y = -0.85
    cakeGroup.add(standBase)

    // Stand stem
    const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.4, 32), standMat)
    standStem.position.y = -0.62
    cakeGroup.add(standStem)

    // Stand plate
    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.08, 48), standMat)
    standPlate.position.y = -0.4
    cakeGroup.add(standPlate)

    // ── 2. Bottom Tier (Rich Rose Velvet) ──
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0xee527a,
      roughness: 0.38,
      metalness: 0.05,
    })
    const bottomTier = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.52, 48), bottomMat)
    bottomTier.position.y = -0.1
    cakeGroup.add(bottomTier)

    // Cream pearls along bottom tier base
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.25,
      metalness: 0.1,
    })
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), pearlMat)
      pearl.position.set(Math.cos(angle) * 1.42, -0.34, Math.sin(angle) * 1.42)
      cakeGroup.add(pearl)
    }

    // ── 3. Middle Tier (Champagne Cream & Strawberry Glaze) ──
    const middleMat = new THREE.MeshStandardMaterial({
      color: 0xffeef2,
      roughness: 0.3,
    })
    const middleTier = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.48, 48), middleMat)
    middleTier.position.y = 0.4
    cakeGroup.add(middleTier)

    // Glossy Strawberry Glaze Torus & Drips
    const glazeMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      roughness: 0.12,
      metalness: 0.08,
    })
    const glazeRim = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.05, 16, 48), glazeMat)
    glazeRim.position.y = 0.63
    glazeRim.rotation.x = Math.PI / 2
    cakeGroup.add(glazeRim)

    // Organic sculpted drips
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const dripLen = 0.12 + (i % 3) * 0.09
      const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.015, dripLen, 12), glazeMat)
      drip.position.set(Math.cos(angle) * 1.05, 0.62 - dripLen / 2, Math.sin(angle) * 1.05)
      cakeGroup.add(drip)
    }

    // ── 4. Top Tier (Soft Blush Whipped Cream) ──
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xffd1dc,
      roughness: 0.32,
    })
    const topTier = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.42, 48), topMat)
    topTier.position.y = 0.85
    cakeGroup.add(topTier)

    // Piped cream rosettes on top rim
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), pearlMat)
      rosette.position.set(Math.cos(angle) * 0.66, 1.05, Math.sin(angle) * 0.66)
      cakeGroup.add(rosette)
    }

    // Confection topper (glazed cherry & gold leaf)
    const topperMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      roughness: 0.15,
      metalness: 0.1,
    })
    const topper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), topperMat)
    topper.position.y = 1.15
    cakeGroup.add(topper)

    // ── 5. Candles, Wicks, Dynamic Flames & Point Lights ──
    const candleColors = [0xff80bf, 0xa78bfa, 0xfbbf24, 0x34d399, 0xf472b6]
    const candlePositions = [
      [-0.42, 0.08],
      [-0.22, -0.16],
      [0.0, 0.18],
      [0.22, -0.16],
      [0.42, 0.08],
    ]

    const flames = []
    const lights = []

    candlePositions.forEach(([cx, cz], i) => {
      // Candle stick
      const cMat = new THREE.MeshStandardMaterial({
        color: candleColors[i],
        roughness: 0.3,
      })
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.35, 16), cMat)
      candle.position.set(cx, 1.22, cz)
      cakeGroup.add(candle)

      // Wick
      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8),
        new THREE.MeshBasicMaterial({ color: 0x222222 })
      )
      wick.position.set(cx, 1.42, cz)
      cakeGroup.add(wick)

      // Flame Group (anchored at wick tip)
      const flameGroup = new THREE.Group()
      flameGroup.position.set(cx, 1.46, cz)
      flameGroup.scale.set(0.001, 0.001, 0.001) // initially unlit
      cakeGroup.add(flameGroup)

      // Outer warm flame mesh
      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.18, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff7b00,
          emissive: 0xff4400,
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.88,
        })
      )
      outerFlame.position.y = 0.09
      flameGroup.add(outerFlame)

      // Inner brilliant white core
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.11, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
      innerFlame.position.y = 0.06
      flameGroup.add(innerFlame)

      // Real-time warm candle point light
      const pLight = new THREE.PointLight(0xffa200, 0, 1.8)
      pLight.position.set(cx, 1.52, cz)
      cakeGroup.add(pLight)

      flames.push(flameGroup)
      lights.push(pLight)
    })

    flamesRef.current = flames
    pointLightsRef.current = lights

    // ── Mouse Drag Orbit Controls ──
    const onMouseDown = (e) => {
      isDragging.current = true
      prevMouseX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0
    }
    const onMouseMove = (e) => {
      if (!isDragging.current) return
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
      const deltaX = clientX - prevMouseX.current
      rotationY.current += deltaX * 0.008
      prevMouseX.current = clientX
    }
    const onMouseUp = () => {
      isDragging.current = false
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('touchstart', onMouseDown, { passive: true })
    window.addEventListener('touchmove', onMouseMove, { passive: true })
    window.addEventListener('touchend', onMouseUp)

    // ── Render & Animation Loop ──
    let animId
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Gentle continuous rotation + user drag
      if (!isDragging.current) {
        rotationY.current += 0.0035
      }
      cakeGroup.rotation.y = rotationY.current

      // Fluid flame dancing physics
      flames.forEach((flame, idx) => {
        if (flame.scale.y > 0.1) {
          const flutter = Math.sin(elapsedTime * 9 + idx * 1.5) * 0.06
          const sway = Math.cos(elapsedTime * 7 + idx * 2.0) * 0.07
          flame.scale.y = 1.0 + flutter
          flame.scale.x = 1.0 - flutter * 0.5
          flame.rotation.z = sway
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ──
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('touchstart', onMouseDown)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Animate flames lighting / blowing out
  useEffect(() => {
    const flames = flamesRef.current
    const lights = pointLightsRef.current

    if (phase === 1) {
      // Light candles sequentially with fluid blossoming
      flames.forEach((flame, i) => {
        setTimeout(() => {
          let progress = 0
          const interval = setInterval(() => {
            progress += 0.15
            if (progress >= 1) {
              flame.scale.set(1, 1, 1)
              lights[i].intensity = 0.85
              clearInterval(interval)
            } else {
              flame.scale.set(progress * 1.1, progress * 1.3, progress * 1.1)
              lights[i].intensity = progress * 0.85
            }
          }, 20)
        }, i * 90)
      })
    } else if (phase === 2) {
      // Extinguish flames smoothly
      flames.forEach((flame, i) => {
        let progress = 1
        const interval = setInterval(() => {
          progress -= 0.18
          if (progress <= 0) {
            flame.scale.set(0.001, 0.001, 0.001)
            lights[i].intensity = 0
            clearInterval(interval)
          } else {
            flame.scale.set(progress, progress * 1.4, progress)
            lights[i].intensity = progress * 0.8
          }
        }, 20)
      })
    } else if (phase === 0) {
      flames.forEach((f) => f.scale.set(0.001, 0.001, 0.001))
      lights.forEach((l) => (l.intensity = 0))
    }
  }, [phase])

  const handleCeremonyClick = () => {
    if (phase === 0) {
      // Light candles
      setPhase(1)
      playSparkleSound(muted)
    } else if (phase === 1) {
      // Blow out candles
      setPhase(2)
      playWhooshSound(muted)
      setTimeout(() => {
        playCelebrationSound(muted)
        setCelebrationTrigger((c) => c + 1)
        onWish?.()
      }, 350)
    } else if (phase === 2) {
      // Re-trigger celebration
      playCelebrationSound(muted)
      setCelebrationTrigger((c) => c + 1)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      <ElegantCelebration active={celebrationTrigger > 0} accent={accent} />

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCeremonyClick}
        style={{
          width: 'min(380px, 86vw)',
          height: 'min(320px, 44svh)',
          position: 'relative',
          cursor: 'grab',
          filter: phase === 1 ? 'drop-shadow(0 12px 30px rgba(255,160,50,0.35))' : 'drop-shadow(0 14px 28px rgba(0,0,0,0.5))',
          transition: 'filter 0.5s ease',
        }}
        title="Click to interact, drag to rotate in 3D"
      />

      {/* Elegant Action Button */}
      <div style={{ marginTop: '0.4rem', textAlign: 'center', position: 'relative', zIndex: 12 }}>
        <motion.button
          onClick={handleCeremonyClick}
          whileHover={{ scale: 1.04, boxShadow: `0 8px 24px ${accent}66` }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: '0.52rem 1.45rem',
            borderRadius: 999,
            background:
              phase === 1
                ? 'linear-gradient(135deg, #ff9e00 0%, #ff5400 100%)'
                : phase === 2
                ? 'linear-gradient(135deg, #ff4d6d 0%, #b79cff 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 'clamp(0.82rem, 2.2vw, 0.92rem)',
            letterSpacing: '0.08em',
            boxShadow:
              phase === 1
                ? '0 6px 20px rgba(255,158,0,0.45)'
                : '0 6px 18px rgba(0,0,0,0.35)',
            cursor: 'pointer',
            transition: 'all 0.35s ease',
          }}
        >
          {phase === 0 && '✨ Tap to light the candles ✨'}
          {phase === 1 && '🌬️ Blow them out & make a wish'}
          {phase === 2 && '✨ Tap for more celebration ✨'}
        </motion.button>

        {/* Elegant Wish Card on Phase 2 */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: E }}
              style={{ marginTop: '0.65rem' }}
            >
              <h3
                style={{
                  fontFamily: "'Pacifico', cursive",
                  fontSize: 'clamp(1.25rem, 3.8vw, 1.8rem)',
                  color: accent,
                  textShadow: `0 0 25px ${accent}, 0 2px 14px rgba(0,0,0,0.8)`,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                May all your wishes come true, chinnamma 💝
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
