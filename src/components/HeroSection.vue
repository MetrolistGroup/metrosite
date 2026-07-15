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

const phoneCarouselEl = ref<HTMLElement | null>(null)
const carouselCanvasEl = ref<HTMLCanvasElement | null>(null)

let rafId = 0

let carouselStrength = 0 // 0–1, short bursts during screen changes
let carouselTargetStrength = 0

let carouselBurstTimeout: ReturnType<typeof setTimeout> | undefined
let carouselSwitchTimeout: ReturnType<typeof setTimeout> | undefined
let carouselGlitchEndTimeout: ReturnType<typeof setTimeout> | undefined

interface Particle {
  x: number; y: number
  w: number; h: number
  alpha: number
  gray: number
}

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
  carouselStrength += (carouselTargetStrength - carouselStrength) * 0.14

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

let resizeObserver: ResizeObserver

onMounted(() => {
  detectMobile()
  startAutoCarousel() // starts only when !isMobile
  window.addEventListener('resize', detectMobile)
  resizeCarouselCanvas()

  resizeObserver = new ResizeObserver(() => {
    resizeCarouselCanvas()
  })
  if (phoneCarouselEl.value) resizeObserver.observe(phoneCarouselEl.value)

  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  stopAutoCarousel()
  cancelAnimationFrame(rafId)
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
          <span class="hero__noise">the noise.</span>
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
        <div class="hero__annotation hero__annotation--left">
          ADS? NEVER HEARD OF THEM! 🙅‍♀️
        </div>
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
              :class="{
                'hero__phone-screen--center': index === currentScreenIndex && !isMobile,
                'hero__phone-screen--left': index === (currentScreenIndex - 1 + screenCount) % screenCount && !isMobile,
                'hero__phone-screen--right': index === (currentScreenIndex + 1) % screenCount && !isMobile
              }" width="280"
              height="560" />
            <canvas ref="carouselCanvasEl" class="hero__phone-carousel-noise-canvas" aria-hidden="true" />
          </div>
        </div>
        <div class="hero__annotation hero__annotation--right">
          CACHED SONGS GO BRRRR! 🧊
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 0 120px;
  overflow: hidden;
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 56px;
  width: 100%;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 860px;
}

.hero__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px;
  border-radius: var(--r-full);
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.hero__headline {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(3.2rem, 7vw, 5.2rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--md-on-background);
  margin-bottom: 24px;
}

.hero__noise {
  font-family: 'Climate Crisis', cursive;
  display: inline-block;
  background: linear-gradient(
    120deg,
    #a582ff 0%,
    #d0bcff 30%,
    #80e2ff 55%,
    #ff94cc 80%,
    #a582ff 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: noiseAnim 8s linear infinite;
  filter: drop-shadow(0 0 6px rgba(208, 188, 255, 0.35));
  transition: filter 0.3s ease;
}

.hero__noise:hover {
  filter: drop-shadow(0 0 12px rgba(208, 188, 255, 0.6));
}

@keyframes noiseAnim {
  0% {
    background-position: 200% 0;
    filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(208, 188, 255, 0.35));
  }
  50% {
    filter: hue-rotate(180deg) drop-shadow(0 0 12px rgba(242, 184, 181, 0.5));
  }
  100% {
    background-position: -200% 0;
    filter: hue-rotate(360deg) drop-shadow(0 0 6px rgba(208, 188, 255, 0.35));
  }
}

.hero__sub {
  font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
  color: var(--md-on-surface-variant);
  max-width: 52ch;
  margin-bottom: 40px;
  line-height: 1.75;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  align-items: center;
}

.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  width: 100%;
  height: 580px;
  margin-top: 100px;
}

.hero__mockup-wrap {
  position: relative;
  width: 280px;
  height: 520px;
  transform-style: preserve-3d;
}

.hero__phone-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  contain: layout;
  --glitch-x: 0px;
  --glitch-y: 0px;
  --glitch-skew: 0deg;
}

.hero__phone-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  object-fit: contain;
  transition: transform var(--t-std), opacity var(--t-std), filter var(--t-std), box-shadow var(--t-std);
  will-change: transform, opacity, filter;
  opacity: 0;
  pointer-events: none;
  border: 4px solid #000;
  background-color: var(--md-primary-container);
}

.hero__phone-screen--center {
  opacity: 1;
  z-index: 10;
  transform: translate3d(0, 0, 80px) scale(1.05);
  box-shadow: 10px 10px 0px var(--md-primary);
  pointer-events: auto;
}

.hero__phone-screen--left {
  opacity: 0.65;
  z-index: 5;
  transform: translate3d(-200px, 0, 0) rotateY(32deg) scale(0.85);
  filter: blur(1.5px) brightness(0.7);
  box-shadow: 8px 8px 0px rgba(108, 75, 204, 0.5);
}

.hero__phone-screen--right {
  opacity: 0.65;
  z-index: 5;
  transform: translate3d(200px, 0, 0) rotateY(-32deg) scale(0.85);
  filter: blur(1.5px) brightness(0.7);
  box-shadow: -8px 8px 0px rgba(108, 75, 204, 0.5);
}

.hero__phone-carousel--glitching .hero__phone-screen--center {
  transform: translate3d(var(--glitch-x), var(--glitch-y), 80px) skewX(var(--glitch-skew)) scale(1.05);
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
  border-radius: 28px;
  z-index: 20;
}

.hero__annotation {
  position: absolute;
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
  border: 3px solid #000;
  padding: 10px 16px;
  border-radius: var(--r-md);
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 4px 4px 0px #000;
  z-index: 15;
  white-space: nowrap;
  pointer-events: none;
  transition: transform var(--t-std), opacity var(--t-std);
}

.hero__annotation--left {
  left: 10%;
  top: 30%;
  transform: rotate(-8deg);
  animation: floatLeft 4s ease-in-out infinite alternate;
}

.hero__annotation--right {
  right: 10%;
  top: 50%;
  transform: rotate(8deg);
  animation: floatRight 4.5s ease-in-out infinite alternate;
}

@keyframes floatLeft {
  0% {
    transform: translateY(0) rotate(-8deg);
  }
  100% {
    transform: translateY(-10px) rotate(-6deg);
  }
}

@keyframes floatRight {
  0% {
    transform: translateY(0) rotate(8deg);
  }
  100% {
    transform: translateY(-10px) rotate(10deg);
  }
}

@media (max-width: 1000px) {
  .hero__annotation {
    display: none;
  }
}

@media (max-width: 820px) {
  .hero {
    padding: 40px 0 60px;
    min-height: auto;
  }

  .hero__inner {
    gap: 32px;
    width: 100%;
  }

  .hero__headline {
    font-size: clamp(2.4rem, 6vw, 3.4rem);
  }

  .hero__sub {
    max-width: 100%;
    margin-bottom: 24px;
  }

  .hero__visual {
    height: 480px;
    margin-top: 32px;
  }

  .hero__mockup-wrap {
    width: 100%;
    height: 460px;
  }

  .hero__phone-carousel--mobile {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 16px;
    padding: 10px 16px;
    justify-content: flex-start;
  }

  .hero__phone-carousel--mobile .hero__phone-screen {
    position: relative;
    scroll-snap-align: center;
    margin: 0;
    flex: 0 0 220px;
    width: 220px;
    height: 440px;
    opacity: 1;
    transform: none;
    filter: none;
    border-radius: 20px;
    border: 3px solid #000;
    box-shadow: 6px 6px 0px var(--md-primary);
    pointer-events: auto;
  }

  .hero__phone-carousel--mobile .hero__phone-carousel-noise-canvas {
    display: none;
  }
}
</style>
