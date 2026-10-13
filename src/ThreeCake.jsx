import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import confetti from 'canvas-confetti'
import { playSparkleSound, playWhooshSound, playCelebrationSound } from './soundEffects.js'

const E = [0.22, 0.82, 0.18, 1]

// Multi-cannon full-screen celebratory confetti burst
export function triggerCelebrationConfetti() {
  // Center blast with celebratory colors
  confetti({
    particleCount: 95,
    spread: 100,
    origin: { y: 0.65 },
    colors: ['#ff4d6d', '#ff8fd2', '#ffd700', '#ffccd5', '#ffffff', '#ffb703'],
    startVelocity: 45,
    gravity: 0.85,
    ticks: 260,
    zIndex: 99999,
  })

  // Left cannon launch
  setTimeout(() => {
    confetti({
      particleCount: 75,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.72 },
      colors: ['#ff8fd2', '#ffd700', '#ff4d6d', '#ffffff', '#c9184a'],
      startVelocity: 55,
      gravity: 0.8,
      ticks: 280,
      zIndex: 99999,
    })
  }, 120)

  // Right cannon launch
  setTimeout(() => {
    confetti({
      particleCount: 75,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.72 },
      colors: ['#ff8fd2', '#ffd700', '#ff4d6d', '#ffffff', '#c9184a'],
      startVelocity: 55,
      gravity: 0.8,
      ticks: 280,
      zIndex: 99999,
    })
  }, 240)

  // Secondary glittering cascade from above
  setTimeout(() => {
    confetti({
      particleCount: 65,
      spread: 120,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#ffd700', '#ffffff', '#ff9e00', '#ff8fd2', '#ff4d6d'],
      scalar: 1.25,
      startVelocity: 35,
      gravity: 0.72,
      ticks: 300,
      zIndex: 99999,
    })
  }, 420)
}

// Procedural red velvet crumb bump map for realistic sponge depth
function createCrumbTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 256, 256)
  const imgData = ctx.getImageData(0, 0, 256, 256)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 65
    const val = Math.max(0, Math.min(255, 128 + noise))
    d[i] = val
    d[i + 1] = val
    d[i + 2] = val
  }
  ctx.putImageData(imgData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 2)
  return tex
}

// Procedural soft contact shadow texture for realistic ground ambient occlusion
function createContactShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 124)
  grad.addColorStop(0, 'rgba(12, 2, 6, 0.85)')
  grad.addColorStop(0.35, 'rgba(25, 4, 12, 0.52)')
  grad.addColorStop(0.7, 'rgba(40, 8, 18, 0.18)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(canvas)
  return tex
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
    camera.position.set(0, 2.05, 5.7)
    camera.lookAt(0, 0.2, 0)

    // Renderer with transparent background and high precision soft shadows
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Procedural textures for realistic tactile crumb & grounding contact shadow
    const crumbTex = createCrumbTexture()
    const contactShadowTex = createContactShadowTexture()

    // ── Studio Lighting Setup with Shadow Mapping ──
    const ambientLight = new THREE.AmbientLight(0xffe8ec, 0.62)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(3.6, 5.5, 4.2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 18
    keyLight.shadow.camera.left = -3.2
    keyLight.shadow.camera.right = 3.2
    keyLight.shadow.camera.top = 3.8
    keyLight.shadow.camera.bottom = -2.8
    keyLight.shadow.bias = -0.0003
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.radius = 2.4
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffb6c1, 0.95)
    fillLight.position.set(-3.5, 3.2, -2.5)
    scene.add(fillLight)

    const topLight = new THREE.DirectionalLight(0xfff5ea, 0.7)
    topLight.position.set(0, 6, 1.2)
    scene.add(topLight)

    const rimLight = new THREE.PointLight(0xffd1dc, 1.4, 12)
    rimLight.position.set(0, 4.2, -3.2)
    scene.add(rimLight)

    // ── Master Cake Group ──
    const cakeGroup = new THREE.Group()
    cakeGroup.position.y = -0.42
    scene.add(cakeGroup)

    // ── Ground Contact Shadows ──
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.42 })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -0.892
    shadowPlane.receiveShadow = true
    cakeGroup.add(shadowPlane)

    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    )
    contactShadow.rotation.x = -Math.PI / 2
    contactShadow.position.y = -0.89
    cakeGroup.add(contactShadow)

    // ── 1. Pedestal Stand (Polished Silver & Champagne Chrome) ──
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xf6f6f8,
      metalness: 0.82,
      roughness: 0.16,
    })

    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.62, 0.08, 64), standMat)
    standBase.position.y = -0.85
    standBase.castShadow = true
    standBase.receiveShadow = true
    cakeGroup.add(standBase)

    const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.46, 0.42, 48), standMat)
    standStem.position.y = -0.61
    standStem.castShadow = true
    standStem.receiveShadow = true
    cakeGroup.add(standStem)

    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.88, 0.08, 64), standMat)
    standPlate.position.y = -0.38
    standPlate.castShadow = true
    standPlate.receiveShadow = true
    cakeGroup.add(standPlate)

    // ── 2. Bottom Tier (Deep Crimson Red Velvet Sponge) ──
    const redVelvetBottomMat = new THREE.MeshStandardMaterial({
      color: 0x820e23, // authentic rich cocoa crimson red velvet
      roughness: 0.62,
      metalness: 0.03,
      bumpMap: crumbTex,
      bumpScale: 0.018,
    })
    const bottomTier = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.52, 64), redVelvetBottomMat)
    bottomTier.position.y = -0.1
    bottomTier.castShadow = true
    bottomTier.receiveShadow = true
    cakeGroup.add(bottomTier)

    // Vanilla Cream Cheese frosting pearls along bottom tier base
    const creamCheeseMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7, // silky warm cream cheese frosting
      roughness: 0.22,
      metalness: 0.04,
    })
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), creamCheeseMat)
      pearl.position.set(Math.cos(angle) * 1.42, -0.33, Math.sin(angle) * 1.42)
      pearl.castShadow = true
      pearl.receiveShadow = true
      cakeGroup.add(pearl)
    }

    // ── 3. Middle Tier (Rich Crimson Red Velvet with Cream Cheese Drips) ──
    const redVelvetMiddleMat = new THREE.MeshStandardMaterial({
      color: 0x8f1027,
      roughness: 0.6,
      metalness: 0.03,
      bumpMap: crumbTex,
      bumpScale: 0.018,
    })
    const middleTier = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.48, 64), redVelvetMiddleMat)
    middleTier.position.y = 0.4
    middleTier.castShadow = true
    middleTier.receiveShadow = true
    cakeGroup.add(middleTier)

    // Luscious Cream Cheese Frosting Torus & Drips
    const frostingDripMat = new THREE.MeshStandardMaterial({
      color: 0xfffdf8,
      roughness: 0.2,
      metalness: 0.05,
    })
    const glazeRim = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.058, 16, 64), frostingDripMat)
    glazeRim.position.y = 0.63
    glazeRim.rotation.x = Math.PI / 2
    glazeRim.castShadow = true
    glazeRim.receiveShadow = true
    cakeGroup.add(glazeRim)

    // Cream cheese drips running down the crimson cake
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const dripLen = 0.12 + (i % 3) * 0.09
      const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.016, dripLen, 16), frostingDripMat)
      drip.position.set(Math.cos(angle) * 1.05, 0.62 - dripLen / 2, Math.sin(angle) * 1.05)
      drip.castShadow = true
      drip.receiveShadow = true
      cakeGroup.add(drip)
    }

    // ── 4. Top Tier (Vibrant Red Velvet with Cream Cheese Rosettes) ──
    const redVelvetTopMat = new THREE.MeshStandardMaterial({
      color: 0x9b122e,
      roughness: 0.58,
      metalness: 0.03,
      bumpMap: crumbTex,
      bumpScale: 0.018,
    })
    const topTier = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.42, 64), redVelvetTopMat)
    topTier.position.y = 0.85
    topTier.castShadow = true
    topTier.receiveShadow = true
    cakeGroup.add(topTier)

    // Cream cheese rosettes on top rim
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 16), creamCheeseMat)
      rosette.position.set(Math.cos(angle) * 0.66, 1.05, Math.sin(angle) * 0.66)
      rosette.castShadow = true
      rosette.receiveShadow = true
      cakeGroup.add(rosette)
    }

    // Confection topper (ruby glazed berry with gold leaf luster)
    const topperMat = new THREE.MeshStandardMaterial({
      color: 0xc41443,
      roughness: 0.1,
      metalness: 0.18,
    })
    const topper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 28), topperMat)
    topper.position.y = 1.15
    topper.castShadow = true
    topper.receiveShadow = true
    cakeGroup.add(topper)

    // ── 5. Candles (Gold, Champagne, Cream Taper Candles) ──
    const candleColors = [0xffd700, 0xfff0db, 0xffb703, 0xffccd5, 0xffd700]
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
        roughness: 0.28,
        metalness: i % 2 === 0 ? 0.35 : 0.08,
      })
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.35, 20), cMat)
      candle.position.set(cx, 1.22, cz)
      candle.castShadow = true
      candle.receiveShadow = true
      cakeGroup.add(candle)

      // Wick
      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8),
        new THREE.MeshBasicMaterial({ color: 0x1f1f1f })
      )
      wick.position.set(cx, 1.42, cz)
      wick.castShadow = true
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

      // Real-time warm candle point light illuminating top tier
      const pLight = new THREE.PointLight(0xffaa33, 0, 2.2, 1.8)
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
      crumbTex.dispose()
      contactShadowTex.dispose()
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

  const handleMakeAnotherWish = () => {
    // Relight candles so user can make another wish
    setPhase(1)
    playSparkleSound(muted)
  }

  const handleMoreCelebration = () => {
    playCelebrationSound(muted)
    triggerCelebrationConfetti()
  }

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
        triggerCelebrationConfetti()
        onWish?.()
      }, 350)
    } else if (phase === 2) {
      // Re-trigger celebration if cake clicked
      handleMoreCelebration()
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
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCeremonyClick}
        style={{
          width: 'min(360px, 88vw)',
          height: 'clamp(180px, 28svh, 290px)',
          position: 'relative',
          cursor: 'grab',
          filter: phase === 1 ? 'drop-shadow(0 12px 30px rgba(255,160,50,0.35))' : 'drop-shadow(0 14px 28px rgba(0,0,0,0.5))',
          transition: 'filter 0.5s ease',
        }}
        title="Click to interact, drag to rotate in 3D"
      />

      {/* Elegant Action Button */}
      <div style={{ marginTop: '0.4rem', textAlign: 'center', position: 'relative', zIndex: 12 }}>
        {phase === 2 ? (
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={handleMakeAnotherWish}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 24px rgba(255,158,0,0.55)` }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.52rem 1.35rem',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff9e00 0%, #ff5400 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'clamp(0.82rem, 2.2vw, 0.92rem)',
                letterSpacing: '0.08em',
                boxShadow: '0 6px 20px rgba(255,158,0,0.45)',
                cursor: 'pointer',
              }}
            >
              🕯️ Make Another Wish ✨
            </motion.button>
            <motion.button
              onClick={handleMoreCelebration}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 24px ${accent}66` }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.52rem 1.25rem',
                borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'clamp(0.82rem, 2.2vw, 0.92rem)',
                letterSpacing: '0.08em',
                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                cursor: 'pointer',
              }}
            >
              💖 Celebrate ✨
            </motion.button>
          </div>
        ) : (
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
          </motion.button>
        )}

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
