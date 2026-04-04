<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const currentScreenIndex = ref(0)
const screenCount = 6
const isMobile = ref(false)
const isCarouselGlitching = ref(false)

const screens = [
  { src: '/1.webp', srcset: '/1-sm.webp 640w, /1-md.webp 1280w, /1.webp 2560w', alt: 'Screenshot 1' },
  { src: '/2.webp', srcset: '/2-sm.webp 640w, /2-md.webp 1280w, /2.webp 2560w', alt: 'Screenshot 2' },
  { src: '/3.webp', srcset: '/3-sm.webp 640w, /3-md.webp 1280w, /3.webp 2560w', alt: 'Screenshot 3' },
  { src: '/4.webp', srcset: '/4-sm.webp 640w, /4-md.webp 1280w, /4.webp 2560w', alt: 'Screenshot 4' },
  { src: '/5.webp', srcset: '/5-sm.webp 640w, /5-md.webp 1280w, /5.webp 2560w', alt: 'Screenshot 5' },
  { src: '/6.webp', srcset: '/6-sm.webp 640w, /6-md.webp 1280w, /6.webp 2560w', alt: 'Screenshot 6' },
]

// Desktop auto-rotate carousel (lifecycle-safe: no hooks inside functions)
let carouselInterval: ReturnType<typeof setInterval> | undefined

function startAutoCarousel() {
  if (isMobile.value || carouselInterval) return
  carouselInterval = window.setInterval(() => {
    advanceCarouselWithNoise()
  }, 5000)
}

function stopAutoCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = undefined
  }
  stopCarouselBurst()
}

function stopCarouselBurst() {
  carouselTargetStrength = 0
  isCarouselGlitching.value = false
  if (carouselBurstTimeout) {
    clearTimeout(carouselBurstTimeout)
    carouselBurstTimeout = undefined
  }
  if (carouselSwitchTimeout) {
    clearTimeout(carouselSwitchTimeout)
    carouselSwitchTimeout = undefined
  }
  if (carouselGlitchEndTimeout) {
    clearTimeout(carouselGlitchEndTimeout)
    carouselGlitchEndTimeout = undefined
  }
}

function advanceCarouselWithNoise() {
  if (isMobile.value) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    currentScreenIndex.value = (currentScreenIndex.value + 1) % screenCount
    return
  }

  stopCarouselBurst()
  isCarouselGlitching.value = true
  carouselTargetStrength = 0.92

  // Switch near peak for a glitch-cut feel.
  carouselSwitchTimeout = window.setTimeout(() => {
    currentScreenIndex.value = (currentScreenIndex.value + 1) % screenCount
  }, 170)

  carouselBurstTimeout = window.setTimeout(() => {
    carouselTargetStrength = 0
  }, 560)

  carouselGlitchEndTimeout = window.setTimeout(() => {
    isCarouselGlitching.value = false
  }, 620)
}

// -- Canvas CRT particle system
const noiseTextEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const phoneCarouselEl = ref<HTMLElement | null>(null)
const carouselCanvasEl = ref<HTMLCanvasElement | null>(null)

let rafId = 0
let strength = 0       // 0–1, driven by mouse proximity
let targetStrength = 0

let carouselStrength = 0 // 0–1, short bursts during screen changes
let carouselTargetStrength = 0

let carouselBurstTimeout: ReturnType<typeof setTimeout> | undefined
let carouselSwitchTimeout: ReturnType<typeof setTimeout> | undefined
let carouselGlitchEndTimeout: ReturnType<typeof setTimeout> | undefined

// Particle pool - reuse objects to avoid GC pressure
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

const CAROUSEL_POOL_SIZE = 360
const carouselPool: Particle[] = Array.from({ length: CAROUSEL_POOL_SIZE }, () => ({
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

function drawNoiseFrame(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  s: number,
  particles: Particle[],
) {
  ctx.clearRect(0, 0, cw, ch)

  const activeCount = Math.floor(s * s * particles.length)
  for (let i = 0; i < activeCount; i++) {
    const p = particles[i]!
    spawnParticle(p, cw, ch) // re-randomise every frame → raw static feel
    ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${p.alpha})`
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h)
  }

  // Occasional full-width scanline flash
  if (s > 0.3 && Math.random() < s * 0.06) {
    const lineY = Math.floor(Math.random() * ch)
    const grad = ctx.createLinearGradient(0, 0, cw, 0)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.2 + Math.random() * 0.2, `rgba(40,40,40,${s * 0.5})`)
    grad.addColorStop(0.5 + Math.random() * 0.2, `rgba(10,10,10,${s * 0.7})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, lineY, cw, 1)
  }
}

function tick() {
  // Smooth approach toward targets
  strength += (targetStrength - strength) * 0.12
  carouselStrength += (carouselTargetStrength - carouselStrength) * 0.14

  const textCanvas = canvasEl.value
  if (textCanvas) {
    const ctx = textCanvas.getContext('2d')
    if (ctx) {
      let cw = textCanvas.width
      let ch = textCanvas.height
      if (cw === 0 || ch === 0) {
        resizeTextCanvas()
        cw = textCanvas.width
        ch = textCanvas.height
      }
      if (cw > 0 && ch > 0) drawNoiseFrame(ctx, cw, ch, strength, pool)
    }
  }

  const carouselCanvas = carouselCanvasEl.value
  if (carouselCanvas) {
    const ctx = carouselCanvas.getContext('2d')
    if (ctx) {
      let cw = carouselCanvas.width
      let ch = carouselCanvas.height
      if (cw === 0 || ch === 0) {
        resizeCarouselCanvas()
        cw = carouselCanvas.width
        ch = carouselCanvas.height
      }

      if (cw > 0 && ch > 0) {
        if (carouselStrength < 0.01) ctx.clearRect(0, 0, cw, ch)
        else drawNoiseFrame(ctx, cw, ch, carouselStrength, carouselPool)
      }
    }
  }

  // Jitter the carousel during glitch bursts (GPU-only transforms).
  const carouselEl = phoneCarouselEl.value
  if (carouselEl) {
    if (isCarouselGlitching.value && carouselStrength > 0.05) {
      // Keep the shake subtle: the noise canvas sells the glitch.
      const amp = Math.min(1, carouselStrength) * 2.2
      const x = (Math.random() * 2 - 1) * amp
      const y = (Math.random() * 2 - 1) * (amp * 0.35)
      const skew = (Math.random() * 2 - 1) * (carouselStrength * 0.35)
      carouselEl.style.setProperty('--glitch-x', `${x.toFixed(2)}px`)
      carouselEl.style.setProperty('--glitch-y', `${y.toFixed(2)}px`)
      carouselEl.style.setProperty('--glitch-skew', `${skew.toFixed(2)}deg`)
    } else {
      carouselEl.style.setProperty('--glitch-x', '0px')
      carouselEl.style.setProperty('--glitch-y', '0px')
      carouselEl.style.setProperty('--glitch-skew', '0deg')
    }
  }

  rafId = requestAnimationFrame(tick)
}

function resizeTextCanvas() {
  const el = noiseTextEl.value
  const canvas = canvasEl.value
  if (!el || !canvas) return
  const rect = el.getBoundingClientRect()
  canvas.width = Math.ceil(rect.width)
  canvas.height = Math.ceil(rect.height)
}

function resizeCarouselCanvas() {
  const el = phoneCarouselEl.value
  const canvas = carouselCanvasEl.value
  if (!el || !canvas) return
  const rect = el.getBoundingClientRect()
  canvas.width = Math.ceil(rect.width)
  canvas.height = Math.ceil(rect.height)
}

function detectMobile() {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 820
  if (wasMobile !== isMobile.value) {
    if (isMobile.value) stopAutoCarousel()
    else startAutoCarousel()
  }
}

let mouseMoveHandler: (e: MouseEvent) => void
let mouseLeaveHandler: () => void
let resizeObserver: ResizeObserver

onMounted(() => {
  detectMobile()
  startAutoCarousel() // starts only when !isMobile
  window.addEventListener('resize', detectMobile)
  resizeTextCanvas()
  resizeCarouselCanvas()

  resizeObserver = new ResizeObserver(() => {
    resizeTextCanvas()
    resizeCarouselCanvas()
  })
  if (noiseTextEl.value) resizeObserver.observe(noiseTextEl.value)
  if (phoneCarouselEl.value) resizeObserver.observe(phoneCarouselEl.value)

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
  stopAutoCarousel()
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', mouseMoveHandler)
  document.removeEventListener('mouseleave', mouseLeaveHandler)
  window.removeEventListener('resize', detectMobile)
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
        <div class="hero__mockup-wrap" :class="{ 'hero__mockup-wrap--mobile': isMobile }">
          <div
            ref="phoneCarouselEl"
            class="hero__phone-carousel"
            :class="{
              'hero__phone-carousel--mobile': isMobile,
              'hero__phone-carousel--glitching': isCarouselGlitching && !isMobile,
            }"
          >
            <img v-for="(screen, index) in screens" :key="index" :src="screen.src" :srcset="screen.srcset"
              sizes="(max-width: 640px) 280px, (max-width: 1280px) 280px, 280px" :alt="screen.alt"
              :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async"
              class="hero__phone-screen"
              :class="{ 'hero__phone-screen--active': index === currentScreenIndex && !isMobile }" width="280"
              height="560" />
            <canvas ref="carouselCanvasEl" class="hero__phone-carousel-noise-canvas" aria-hidden="true" />
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
  /* Reserve space to reduce CLS when web font replaces fallback (2 lines) */
  min-height: 2.2em;
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

/* Canvas overlay - multiply blends dark particles into the gradient text */
.hero__noise-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: multiply;
  /* Crisp pixels - no browser smoothing */
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

/* -- Visual / Mockup -- */
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
  aspect-ratio: 1 / 2;
  transform-style: preserve-3d;
  /* Reserve space before images load to avoid CLS */
  min-height: 360px;
}

.hero__mockup-wrap--mobile {
  width: 100%;
}

.hero__phone-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  transform-style: preserve-3d;
  contain: layout;
  --glitch-x: 0px;
  --glitch-y: 0px;
  --glitch-skew: 0deg;
}

.hero__phone-carousel--mobile {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  cursor: grab;
  gap: 6px;
}

.hero__phone-screen {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 26px;
  box-shadow: 0 20px 70px rgba(108, 75, 204, 0.06), 0 10px 32px rgba(0, 0, 0, 0.10);
  opacity: 0;
  transition: none;
  object-fit: contain;
  will-change: transform, filter;
}

.hero__phone-screen--active {
  opacity: 1;
}

.hero__phone-carousel--glitching .hero__phone-screen--active {
  transform: translate3d(var(--glitch-x), var(--glitch-y), 0) skewX(var(--glitch-skew));
  animation: heroPhoneGlitchFlicker 620ms steps(1, end) both;
}

.hero__phone-carousel--glitching .hero__phone-carousel-noise-canvas {
  animation: heroPhoneGlitchCanvas 620ms steps(1, end) both;
}

@keyframes heroPhoneGlitchFlicker {
  0% { filter: none; }
  8% { filter: contrast(1.18) saturate(0.85) brightness(1.04); }
  12% { filter: none; }
  20% { filter: contrast(1.22) saturate(0.8) brightness(1.06); }
  24% { filter: none; }
  40% { filter: contrast(1.14) saturate(0.9) brightness(1.03); }
  56% { filter: contrast(1.1) saturate(0.95); }
  100% { filter: none; }
}

@keyframes heroPhoneGlitchCanvas {
  0% { opacity: 0; }
  8% { opacity: 0.8; }
  12% { opacity: 0.25; }
  20% { opacity: 1; }
  28% { opacity: 0.55; }
  46% { opacity: 0.9; }
  70% { opacity: 0.35; }
  100% { opacity: 0; }
}

.hero__phone-carousel-noise-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: multiply;
  image-rendering: pixelated;
  border-radius: 26px;
  z-index: 20;
}

.hero__phone-carousel--mobile .hero__phone-screen {
  position: relative;
  flex-shrink: 0;
  width: auto;
  padding-right: 4px;
  padding-left: 4px;
  max-width: 100%;
  opacity: 1;
  transform: none;
  border-radius: 26px;
  box-shadow: 0 20px 70px rgba(108, 75, 204, 0.06), 0 10px 32px rgba(0, 0, 0, 0.10);
}

.hero__phone-carousel--mobile .hero__phone-carousel-noise-canvas {
  display: none;
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

/* -- Responsive -- */
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
    height: auto;
  }

  .hero__mockup-wrap--mobile {
    width: 100%;
    margin-left: 0;
  }

  .hero__phone-carousel--mobile {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .hero__phone-carousel--mobile .hero__phone-screen {
    scroll-snap-align: center;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
    flex: 0 0 70%;
    width: auto;
    height: auto;
  }
}
</style>
