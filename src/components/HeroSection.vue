<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const b = import.meta.env.BASE_URL
const screens = [
  { src: `${b}1.webp`, srcset: `${b}1-sm.webp 640w, ${b}1-md.webp 1280w, ${b}1.webp 2560w`, alt: 'Screenshot 1' },
  { src: `${b}2.webp`, srcset: `${b}2-sm.webp 640w, ${b}2-md.webp 1280w, ${b}2.webp 2560w`, alt: 'Screenshot 2' },
  { src: `${b}3.webp`, srcset: `${b}3-sm.webp 640w, ${b}3-md.webp 1280w, ${b}3.webp 2560w`, alt: 'Screenshot 3' },
  { src: `${b}4.webp`, srcset: `${b}4-sm.webp 640w, ${b}4-md.webp 1280w, ${b}4.webp 2560w`, alt: 'Screenshot 4' },
  { src: `${b}5.webp`, srcset: `${b}5-sm.webp 640w, ${b}5-md.webp 1280w, ${b}5.webp 2560w`, alt: 'Screenshot 5' },
  { src: `${b}6.webp`, srcset: `${b}6-sm.webp 640w, ${b}6-md.webp 1280w, ${b}6.webp 2560w`, alt: 'Screenshot 6' },
]

const galleryEl = ref<HTMLElement | null>(null)
const activeIndex = ref(Math.floor(screens.length / 2))
let scrollTicking = false

function updateGalleryCenter() {
  const g = galleryEl.value!
  const shots = Array.from(g.querySelectorAll<HTMLElement>('.hero__shot'))
  if (!shots.length) return
  const rect = g.getBoundingClientRect()
  const center = rect.left + rect.width / 2
  let best = 0
  let min = Infinity
  shots.forEach((s, i) => {
    const r = s.getBoundingClientRect()
    const c = r.left + r.width / 2
    const d = Math.abs(center - c)
    if (d < min) {
      min = d
      best = i
    }
  })
  activeIndex.value = best
}

function centerGallery() {
  const g = galleryEl.value!
  requestAnimationFrame(() => {
    g.scrollLeft = Math.max(0, (g.scrollWidth - g.clientWidth) / 2)
    updateGalleryCenter()
  })
}

function scrollHandler() {
  if (scrollTicking) return
  scrollTicking = true
  requestAnimationFrame(() => {
    updateGalleryCenter()
    scrollTicking = false
  })
}

let autoScrollInterval: ReturnType<typeof setInterval> | undefined

function startAutoScroll() {
  if (autoScrollInterval) return
  autoScrollInterval = setInterval(() => {
    if (!galleryEl.value) return
    const nextIndex = (activeIndex.value + 1) % screens.length
    const shots = galleryEl.value.querySelectorAll<HTMLElement>('.hero__shot')
    const g = galleryEl.value
    const shot = shots[nextIndex]
    if (shot) {
      const scrollLeft = shot.offsetLeft - g.clientWidth / 2 + shot.offsetWidth / 2
      g.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, 4000)
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = undefined
  }
}

function focusShot(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const g = galleryEl.value!
  const scrollLeft = el.offsetLeft - g.clientWidth / 2 + el.offsetWidth / 2
  g.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  stopAutoScroll()
  startAutoScroll()
}

const noiseTextEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let rafId = 0
let strength = 0
let targetStrength = 0

interface Particle {
  x: number; y: number
  w: number; h: number
  alpha: number
  gray: number
}
const POOL_SIZE = 280
const pool: Particle[] = Array.from({ length: POOL_SIZE }, () => ({
  x: 0, y: 0, w: 2, h: 2, alpha: 0, gray: 0,
}))

function spawnParticle(p: Particle, cw: number, ch: number) {
  p.x = Math.random() * cw
  p.y = Math.random() * ch
  const type = Math.random()
  if (type < 0.35) {
    p.w = 4 + Math.random() * 14
    p.h = 1
  } else if (type < 0.55) {
    p.w = 1
    p.h = 3 + Math.random() * 8
  } else {
    p.w = 1 + Math.floor(Math.random() * 3)
    p.h = p.w
  }
  p.alpha = 0.25 + Math.random() * 0.65
  p.gray = Math.floor(Math.random() * 85)
}

function drawNoiseFrame(ctx: CanvasRenderingContext2D, cw: number, ch: number, s: number) {
  ctx.clearRect(0, 0, cw, ch)
  const activeCount = Math.floor(s * s * pool.length)
  for (let i = 0; i < activeCount; i++) {
    const p = pool[i]!
    spawnParticle(p, cw, ch)
    ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${p.alpha})`
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h)
  }
}

function resizeTextCanvas() {
  const el = noiseTextEl.value!
  const canvas = canvasEl.value!
  const rect = el.getBoundingClientRect()
  canvas.width = Math.ceil(rect.width)
  canvas.height = Math.ceil(rect.height)
}

let running = false

function clearTextCanvas() {
  const c = canvasEl.value!
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
}

function startLoop() {
  if (running) return
  running = true
  rafId = requestAnimationFrame(tick)
}

function tick() {
  strength += (targetStrength - strength) * 0.12
  targetStrength *= 0.9

  if (strength < 0.005 && targetStrength < 0.005) {
    strength = 0
    clearTextCanvas()
    running = false
    return
  }

  const textCanvas = canvasEl.value!
  const ctx = textCanvas.getContext('2d')!
  let cw = textCanvas.width
  let ch = textCanvas.height
  if (cw === 0 || ch === 0) {
    resizeTextCanvas()
    cw = textCanvas.width
    ch = textCanvas.height
  }
  if (cw > 0 && ch > 0) drawNoiseFrame(ctx, cw, ch, strength)
  rafId = requestAnimationFrame(tick)
}

function mouseMoveHandler(e: MouseEvent) {
  const el = noiseTextEl.value!
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const radius = Math.max(rect.width, rect.height) * 1.5
  targetStrength = Math.max(0, 1 - dist / radius)
  if (targetStrength > 0.005) startLoop()
}

function mouseLeaveHandler() {
  targetStrength = 0
  startLoop()
}

function onResize() {
  resizeTextCanvas()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')

  centerGallery()
  galleryEl.value!.addEventListener('scroll', scrollHandler, { passive: true })
  
  galleryEl.value!.addEventListener('mouseenter', stopAutoScroll)
  galleryEl.value!.addEventListener('mouseleave', startAutoScroll)
  galleryEl.value!.addEventListener('touchstart', stopAutoScroll, { passive: true })
  galleryEl.value!.addEventListener('touchend', startAutoScroll, { passive: true })

  resizeTextCanvas()
  resizeObserver = new ResizeObserver(() => resizeTextCanvas())
  resizeObserver.observe(noiseTextEl.value!)

  window.addEventListener('resize', onResize)

  if (!reduceMotionMq.matches) {
    window.addEventListener('mousemove', mouseMoveHandler, { passive: true })
    document.addEventListener('mouseleave', mouseLeaveHandler)
  }

  startAutoScroll()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  running = false
  stopAutoScroll()
  galleryEl.value?.removeEventListener('scroll', scrollHandler)
  galleryEl.value?.removeEventListener('mouseenter', stopAutoScroll)
  galleryEl.value?.removeEventListener('mouseleave', startAutoScroll)
  galleryEl.value?.removeEventListener('touchstart', stopAutoScroll)
  galleryEl.value?.removeEventListener('touchend', startAutoScroll)
  window.removeEventListener('mousemove', mouseMoveHandler)
  document.removeEventListener('mouseleave', mouseLeaveHandler)
  window.removeEventListener('resize', onResize)
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
        <div ref="galleryEl" class="hero__gallery">
          <div v-for="(screen, index) in screens" :key="index" class="hero__shot"
            :class="{ 'is-active': index === activeIndex }" @click="focusShot">
            <img :src="screen.src" :srcset="screen.srcset" sizes="(max-width: 640px) 260px, 300px" :alt="screen.alt"
              :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async"
              class="hero__shot-img" width="280" height="560" />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  margin-top: -64px;
  padding: 120px 0 80px;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 65% 65% at 85% 45%, var(--md-primary-container) 0%, transparent 65%),
    radial-gradient(ellipse 64% 72% at 2% 80%, var(--md-secondary-container) 0%, transparent 62%),
    radial-gradient(ellipse 58% 45% at 26% 5%, var(--md-tertiary-container) 0%, transparent 55%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 62%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0, #000 62%, transparent 100%);
  z-index: 0;
}

html[data-theme="light"] .hero__bg {
  background:
    radial-gradient(ellipse 65% 65% at 85% 45%, color-mix(in srgb, var(--md-primary) 32%, transparent) 0%, transparent 65%),
    radial-gradient(ellipse 64% 72% at 2% 80%, color-mix(in srgb, var(--md-tertiary) 30%, transparent) 0%, transparent 62%),
    radial-gradient(ellipse 58% 45% at 26% 5%, color-mix(in srgb, var(--md-tertiary) 36%, transparent) 0%, transparent 55%);
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.hero__visual {
  position: relative;
  width: 100%;
  min-width: 0;
}

.hero__copy {
  max-width: 680px;
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
  min-height: 2.2em;
}

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

.hero__noise-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: multiply;
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



.hero__gallery {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 64px 30%;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 18%, #000 82%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 18%, #000 82%, transparent 100%);
}

.hero__gallery::-webkit-scrollbar {
  display: none;
}

.hero__shot {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  flex-shrink: 0;
  height: 430px;
  border-radius: 24px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  transform: scale(0.86);
  transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.4s ease;
}

.hero__shot-img {
  display: block;
  height: 100%;
  width: auto;
  border-radius: inherit;
}

.hero__shot.is-active {
  transform: scale(1.05);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.55);
}

/* -- Responsive -- */
@media (max-width: 820px) {
  .hero {
    padding: 104px 0 56px;
    min-height: auto;
  }

  .hero__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
    text-align: center;
    min-width: 0;
  }

  .hero__copy {
    width: 100%;
    min-width: 0;
  }

  .hero__visual {
    min-width: 0;
  }

  .hero__headline {
    font-size: clamp(2.9rem, 12.5vw, 3.6rem);
    white-space: nowrap;
  }

  .hero__sub {
    max-width: 38ch;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 28px;
  }

  .hero__badges {
    justify-content: center;
    flex-wrap: nowrap;
    gap: 6px;
  }

  .badge {
    padding: 5px 11px;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .hero__actions {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .hero__actions .btn {
    flex: 0 0 auto;
    max-width: 100%;
  }

  .hero__actions .btn-filled {
    width: 240px;
  }

  .hero__actions .btn-outlined {
    width: auto;
  }

  .hero__visual {
    width: 100vw;
    max-width: 100vw;
  }

  .hero__gallery {
    padding: 62px 24%;
    gap: 16px;
  }

  .hero__shot {
    height: 56vh;
  }
}
</style>
