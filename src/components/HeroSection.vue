<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const currentScreenIndex = ref(0)
const screenCount = 6

const screens = [
  { src: '/s1.png', alt: 'Screenshot 1' },
  { src: '/s2.png', alt: 'Screenshot 2' },
  { src: '/s3.png', alt: 'Screenshot 3' },
  { src: '/s4.png', alt: 'Screenshot 4' },
  { src: '/s5.png', alt: 'Screenshot 5' },
  { src: '/s6.png', alt: 'Screenshot 6' },
]

const carouselInterval = setInterval(() => {
  currentScreenIndex.value = (currentScreenIndex.value + 1) % screenCount
}, 5000)

// ── Canvas CRT particle system ──────────────────────────────────────────────
const noiseTextEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let rafId = 0
let strength = 0       // 0–1, driven by mouse proximity
let targetStrength = 0

// Particle pool — reuse objects to avoid GC pressure
interface Particle {
  x: number; y: number
  w: number; h: number
  alpha: number
  gray: number   // 0–80 (dark end of spectrum)
}
const POOL_SIZE = 280
const pool: Particle[] = Array.from({ length: POOL_SIZE }, () => ({
  x: 0, y: 0, w: 2, h: 2, alpha: 0, gray: 0,
}))

function spawnParticle(p: Particle, cw: number, ch: number) {
  p.x = Math.random() * cw
  p.y = Math.random() * ch
  // Sharp rectangles: mix of thin scanline-like strips and square dots
  const type = Math.random()
  if (type < 0.35) {
    // horizontal scanline fragment
    p.w = 4 + Math.random() * 14
    p.h = 1
  } else if (type < 0.55) {
    // vertical strip
    p.w = 1
    p.h = 3 + Math.random() * 8
  } else {
    // square pixel dot
    p.w = 1 + Math.floor(Math.random() * 3)
    p.h = p.w
  }
  p.alpha = 0.25 + Math.random() * 0.65
  p.gray = Math.floor(Math.random() * 85)  // 0 = black, 85 = dark gray
}

function tick() {
  const canvas = canvasEl.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')!
  const cw = canvas.width
  const ch = canvas.height

  // Smooth approach toward target
  strength += (targetStrength - strength) * 0.12

  ctx.clearRect(0, 0, cw, ch)

  // Number of active particles scales with strength²  (feels more dramatic)
  const activeCount = Math.floor(strength * strength * POOL_SIZE)

  for (let i = 0; i < activeCount; i++) {
    const p = pool[i]!
    spawnParticle(p, cw, ch)  // re-randomise every frame → raw static feel
    ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${p.alpha})`
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h)
  }

  // Occasional bright "radiation spike" — a full-width scanline flash
  if (strength > 0.3 && Math.random() < strength * 0.06) {
    const lineY = Math.floor(Math.random() * ch)
    const grad = ctx.createLinearGradient(0, 0, cw, 0)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.2 + Math.random() * 0.2, `rgba(40,40,40,${strength * 0.5})`)
    grad.addColorStop(0.5 + Math.random() * 0.2, `rgba(10,10,10,${strength * 0.7})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, lineY, cw, 1)
  }

  rafId = requestAnimationFrame(tick)
}

function resizeCanvas() {
  const el = noiseTextEl.value
  const canvas = canvasEl.value
  if (!el || !canvas) return
  const rect = el.getBoundingClientRect()
  canvas.width = Math.ceil(rect.width)
  canvas.height = Math.ceil(rect.height)
}

let mouseMoveHandler: (e: MouseEvent) => void
let mouseLeaveHandler: () => void
let resizeObserver: ResizeObserver

onMounted(() => {
  resizeCanvas()

  resizeObserver = new ResizeObserver(resizeCanvas)
  if (noiseTextEl.value) resizeObserver.observe(noiseTextEl.value)

  mouseMoveHandler = (e: MouseEvent) => {
    const el = noiseTextEl.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    // Activation radius: 1.5× the larger dimension so it starts well outside the text
    const radius = Math.max(rect.width, rect.height) * 1.5
    targetStrength = Math.max(0, 1 - dist / radius)
  }

  mouseLeaveHandler = () => {
    targetStrength = 0
  }

  window.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseleave', mouseLeaveHandler)

  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  clearInterval(carouselInterval)
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', mouseMoveHandler)
  document.removeEventListener('mouseleave', mouseLeaveHandler)
  resizeObserver?.disconnect()
})
</script>

<template>
  <section class="hero">
    <div class="hero__bg" aria-hidden="true" />

    <div class="container hero__inner">

      <!-- Copy column -->
      <div class="hero__copy">
        <div class="hero__badges">
          <span class="badge">
            <span class="icon" style="font-size: 0.875rem" aria-hidden="true">crowdsource</span>
            Open Source
          </span>
          <span class="badge"><span class="icon" style="font-size: 0.875rem"
              aria-hidden="true">license</span>GPL-3.0</span>
          <span class="badge"><span class="icon" style="font-size: 0.875rem"
              aria-hidden="true">android</span>Android</span>
        </div>

        <h1 class="hero__headline">
          Music without<br />
          <span class="hero__noise-wrap">
            <span ref="noiseTextEl" class="hero__noise">the noise.</span>
            <!-- Canvas sits over the text, blends multiplicatively so particles darken the gradient -->
            <canvas ref="canvasEl" class="hero__noise-canvas" aria-hidden="true" />
          </span>
        </h1>

        <p class="hero__sub">
          An open-source, ad-free YouTube Music client for Android.
          No subscriptions required - just your music, uninterrupted.
        </p>

        <div class="hero__actions">
          <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="btn btn-filled btn-lg" target="_blank"
            rel="noopener noreferrer">
            <span class="icon" aria-hidden="true">download</span>
            Download APK
          </a>
          <a href="https://github.com/MetrolistGroup/Metrolist" class="btn btn-outlined btn-lg" target="_blank"
            rel="noopener noreferrer">
            <span class="icon" aria-hidden="true">code</span>
            View on GitHub
          </a>
        </div>
      </div>

      <!-- Mockup column -->
      <div class="hero__visual" aria-hidden="true">
        <div class="hero__mockup-wrap">
          <div class="hero__phone-carousel">
            <img v-for="(screen, index) in screens" :key="index" :src="screen.src" :alt="screen.alt"
              class="hero__phone-screen" :class="{ 'hero__phone-screen--active': index === currentScreenIndex }"
              width="280" height="560" loading="lazy" />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  padding: 80px 0 100px;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 65% 65% at 85% 45%, var(--md-primary-container) 0%, transparent 65%),
    radial-gradient(ellipse 55% 65% at 5% 95%, var(--md-secondary-container) 0%, transparent 55%),
    radial-gradient(ellipse 35% 45% at 55% 5%, var(--md-tertiary-container) 0%, transparent 50%);
  z-index: 0;
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: var(--r-full);
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  font-size: 0.8125rem;
  font-weight: 600;
}

.hero__headline {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(2.75rem, 5.5vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--md-on-background);
  margin-bottom: 20px;
}

/* Wrapper so canvas can be positioned over text */
.hero__noise-wrap {
  position: relative;
  display: inline-block;
}

.hero__noise {
  font-family: 'Climate Crisis', cursive;
  display: inline-block;
  background: linear-gradient(90deg,
      var(--md-primary) 0%,
      var(--md-tertiary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Canvas overlay — multiply blends dark particles into the gradient text */
.hero__noise-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: multiply;
  /* Crisp pixels — no browser smoothing */
  image-rendering: pixelated;
}

.hero__sub {
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  color: var(--md-on-surface-variant);
  max-width: 44ch;
  margin-bottom: 36px;
  line-height: 1.7;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* ── Visual / Mockup ── */
.hero__visual {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  perspective: 1200px;
}

.hero__mockup-wrap {
  position: relative;
  width: 280px;
  height: 560px;
  transform-style: preserve-3d;
}

.hero__phone-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.hero__phone-screen {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 26px;
  box-shadow: 0 20px 70px rgba(108, 75, 204, 0.06), 0 10px 32px rgba(0, 0, 0, 0.10);
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
  transform: rotateX(10deg) rotateZ(5deg);
}

.hero__phone-screen--active {
  opacity: 1;
  transform: rotateX(10deg) rotateZ(5deg);
}

.hero__phone-screen:nth-child(1) {
  z-index: 6;
}

.hero__phone-screen:nth-child(2) {
  z-index: 5;
}

.hero__phone-screen:nth-child(3) {
  z-index: 4;
}

.hero__phone-screen:nth-child(4) {
  z-index: 3;
}

.hero__phone-screen:nth-child(5) {
  z-index: 2;
}

.hero__phone-screen:nth-child(6) {
  z-index: 1;
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .hero {
    padding: 60px 0 80px;
    min-height: auto;
  }

  .hero__inner {
    grid-template-columns: 1fr;
    gap: 52px;
    text-align: center;
  }

  .hero__sub {
    max-width: 100%;
  }

  .hero__badges,
  .hero__actions {
    justify-content: center;
  }

  .hero__visual {
    order: -1;
  }

  .hero__mockup-wrap {
    width: 200px;
    height: 400px;
  }

  .hero__phone-screen {
    width: 100%;
    height: 100%;
  }
}
</style>