<script setup lang="ts">
import { computed, ref } from 'vue'
import { DOWNLOAD_PLATFORMS } from '../content/downloads'

const showcaseSlides = [
  {
    name: 'Home',
    desktopFile: 'desktop-home.webp',
    desktopSmallFile: 'desktop-home-sm.webp',
    androidFile: 'android-home.webp',
  },
  {
    name: 'Appearance',
    desktopFile: 'desktop-settings.webp',
    desktopSmallFile: 'desktop-settings-sm.webp',
    androidFile: 'android-appearance.webp',
  },
] as const

const currentSlide = ref(0)
const slide = computed(() => showcaseSlides[currentSlide.value]!)
const advanceSlide = () => currentSlide.value = (currentSlide.value + 1) % showcaseSlides.length

const features = [
  { icon: 'block', title: 'Ad-free listening', body: 'Stream songs and videos from YouTube Music with background playback and no interruptions.' },
  { icon: 'lyrics', title: 'Lyrics that keep up', body: 'Follow synchronized lyrics with word-by-word timing, translation, and romanization where available.' },
  { icon: 'groups', title: 'Listen Together', body: 'Create a room, share queue suggestions, and keep playback synchronized with friends.' },
  { icon: 'devices', title: 'Cast your way', body: 'Send playback to Chromecast, DLNA, and FCast devices from the same player.' },
  { icon: 'download_for_offline', title: 'Ready offline', body: 'Download songs or cache them as you listen so your library stays available without a connection.' },
  { icon: 'tune', title: 'Playback your way', body: 'Use skip silence, a sleep timer, audio normalization, tempo and pitch controls, and an equalizer.' },
]

</script>

<template>
  <section id="desktop" class="desktop">
    <div class="container">
      <header class="section-head">
        <h2>Designed for the room a desktop gives you.</h2>
        <p>Metrolist automatically adjusts its entire layout and navigation based on your screen size and platform.</p>
      </header>

      <div class="desktop__showcase">
        <figure class="desktop__device desktop__device--linux">
          <figcaption>
            <strong>Linux, Windows, and macOS</strong>
            <span class="desktop__slide-name">{{ slide.name }}</span>
            <span class="desktop__progress" aria-hidden="true">
              <span :key="currentSlide" class="desktop__progress-fill" @animationend="advanceSlide" />
            </span>
          </figcaption>
          <div class="desktop__computer">
            <div class="desktop__computer-screen">
              <div class="desktop__placeholder" role="img" :aria-label="`${slide.name} desktop screenshot placeholder`">
                <span class="material-symbols-rounded" aria-hidden="true">add_photo_alternate</span>
                <strong>{{ slide.name }} desktop screenshot</strong>
                <small>2000 × 1091 WebP + 1200 × 655 WebP</small>
                <code>public/images/kmp/{{ slide.desktopFile }}</code>
                <code>public/images/kmp/{{ slide.desktopSmallFile }}</code>
              </div>
            </div>
          </div>
        </figure>

        <figure class="desktop__device desktop__device--android">
          <figcaption><strong>Android</strong></figcaption>
          <div class="desktop__phone">
            <div class="desktop__placeholder" role="img" :aria-label="`${slide.name} Android screenshot placeholder`">
              <span class="material-symbols-rounded" aria-hidden="true">add_photo_alternate</span>
              <strong>{{ slide.name }}</strong>
              <small>Android screenshot<br />640 × 1387 WebP</small>
              <code>public/images/kmp/{{ slide.androidFile }}</code>
            </div>
          </div>
        </figure>
      </div>
    </div>
  </section>

  <section id="features" class="features">
    <div class="container">
      <header class="features__head">
        <h2>Everything between finding a song and playing it again.</h2>
        <p>The core listening experience follows Metrolist across every supported platform.</p>
      </header>

      <div class="features__carousel" tabindex="0" aria-label="Metrolist features">
        <article v-for="feature in features" :key="feature.title" class="features__card">
          <span class="features__icon material-symbols-rounded" aria-hidden="true">{{ feature.icon }}</span>
          <div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.body }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section id="platforms" class="platforms">
    <div class="container platforms__layout">
      <header>
        <h2>One codebase. Four places to press play.</h2>
        <p>Kotlin Multiplatform keeps the foundation shared while each interface fits the screen around it.</p>
      </header>

      <div class="platforms__list">
        <article v-for="platform in DOWNLOAD_PLATFORMS" :key="platform.name">
          <span class="platforms__icon"><img :src="`/icons/${platform.icon}.svg`" alt="" /></span>
          <span class="platforms__name"><strong>{{ platform.name }}</strong><small>{{ platform.detail }}</small></span>
          <span class="chip">{{ platform.package }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.desktop,
.features,
.platforms {
  padding: 108px 0;
}

.desktop,
.platforms {
  background: var(--md-sys-color-surface);
}

.features {
  background: var(--md-sys-color-surface-container-low);
}

.section-head,
.features__head {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.55fr);
  gap: 42px 88px;
  align-items: end;
  margin-bottom: 46px;
}

.section-head h2,
.features h2,
.platforms h2 {
  max-width: 800px;
  font-size: clamp(2.8rem, 5.5vw, 5.1rem);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 0.96;
}

.section-head > p,
.features__head > p,
.platforms header > p:last-child {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.05rem;
}

.desktop__showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: clamp(24px, 4vw, 52px);
  border-radius: 42px 42px 18px 42px;
  background: var(--md-sys-color-surface-container-low);
}

.desktop__device {
  margin: 0;
}

.desktop__device figcaption {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin: 0 8px 12px;
}

.desktop__device figcaption strong {
  font-size: 1rem;
  font-weight: 740;
}

.desktop__slide-name {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8rem;
}

.desktop__device--linux figcaption {
  display: grid;
  grid-template-columns: max-content max-content minmax(60px, 1fr);
  align-items: center;
}

.desktop__progress {
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--md-sys-color-outline-variant);
}

.desktop__progress-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--md-sys-color-primary);
  transform-origin: left;
  animation: desktop-progress 7s linear forwards;
}

@keyframes desktop-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.desktop__device--linux {
  z-index: 1;
  width: min(82%, 900px);
  transform: perspective(1400px) rotateY(3deg);
}

.desktop__computer {
  position: relative;
  padding: 8px 8px 11px;
  border-radius: 22px 22px 15px 15px;
  background: var(--md-sys-color-surface-container-highest);
}

.desktop__computer::after {
  position: absolute;
  right: -4%;
  bottom: -11px;
  left: -4%;
  height: 12px;
  border-radius: 0 0 14px 14px;
  background: var(--md-sys-color-surface-container-highest);
  clip-path: polygon(4% 0, 96% 0, 100% 100%, 0 100%);
  content: '';
}

.desktop__computer-screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1200 / 655;
  border-radius: 14px 14px 9px 9px;
}

.desktop__placeholder {
  display: grid;
  height: 100%;
  padding: 24px;
  place-content: center;
  justify-items: center;
  gap: 7px;
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: inherit;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

.desktop__placeholder > .material-symbols-rounded {
  margin-bottom: 4px;
  color: var(--md-sys-color-primary);
  font-size: clamp(32px, 5vw, 52px);
}

.desktop__placeholder strong {
  color: var(--md-sys-color-on-surface);
  font-size: clamp(0.9rem, 2vw, 1.2rem);
}

.desktop__placeholder small {
  font-size: 0.72rem;
}

.desktop__placeholder code {
  color: var(--md-sys-color-primary);
  font-family: ui-monospace, monospace;
  font-size: clamp(0.55rem, 1.1vw, 0.72rem);
}

.desktop__device--android {
  z-index: 2;
  width: clamp(155px, 16vw, 210px);
  margin: 52px 0 0 clamp(-76px, -5vw, -42px);
  transform: perspective(900px) rotateY(-7deg) rotateZ(1deg);
}

.desktop__phone {
  position: relative;
  aspect-ratio: 76.7 / 161.4;
  padding: 5px 7px 5px 5px;
  border-radius: 27px;
  background: var(--md-sys-color-surface-container-highest);
}

.desktop__phone::before {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 1;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(8 8 10 / 82%);
  content: '';
  transform: translateX(-50%);
}

.desktop__phone::after {
  position: absolute;
  top: 28%;
  right: -3px;
  width: 3px;
  height: 18%;
  border-radius: 0 3px 3px 0;
  background: var(--md-sys-color-surface-bright);
  content: '';
}

.desktop__phone .desktop__placeholder {
  position: absolute;
  inset: 5px 7px 5px 5px;
  height: auto;
  padding: 12px 6px;
  gap: 5px;
  border-radius: 22px;
}

.desktop__phone .desktop__placeholder > .material-symbols-rounded {
  font-size: 30px;
}

.desktop__phone .desktop__placeholder strong {
  font-size: 0.8rem;
}

.desktop__phone .desktop__placeholder small,
.desktop__phone .desktop__placeholder code {
  font-size: 0.55rem;
  line-height: 1.25;
}

.desktop__phone .desktop__placeholder code {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.features__carousel {
  display: grid;
  grid-auto-columns: minmax(280px, 32vw);
  grid-auto-flow: column;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 18px;
  scroll-padding-inline: 4px;
  scroll-snap-type: x mandatory;
  scrollbar-color: var(--md-sys-color-primary) var(--md-sys-color-surface-container);
}

.features__card {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  scroll-snap-align: start;
}

.features__icon {
  width: 60px;
  height: 60px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-size: 30px;
}

.features__card h3 {
  margin-bottom: 8px;
  font-size: clamp(1.45rem, 2.4vw, 2rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.features__card p {
  max-width: 32ch;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.92rem;
}

.platforms {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.platforms::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: url('/images/platform-pattern.svg') left top / 666px auto repeat;
  content: '';
  pointer-events: none;
}

.platforms__layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr);
  gap: clamp(56px, 9vw, 130px);
  align-items: start;
}

.platforms h2 {
  font-size: clamp(2.8rem, 5vw, 4.7rem);
}

.platforms header > p:last-child {
  max-width: 520px;
  margin-top: 24px;
}

.platforms__list {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-radius: var(--md-sys-shape-corner-extra-large-increased);
  background: rgb(24 22 27 / 68%);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}

.platforms__list article {
  display: grid;
  grid-template-columns: 54px minmax(120px, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 82px;
  padding: 10px 12px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  color: var(--md-sys-color-on-surface);
}

.platforms__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-highest);
}

.platforms__icon img {
  width: 23px;
  height: 23px;
  object-fit: contain;
}

.platforms__name {
  display: flex;
  flex-direction: column;
}

.platforms__name strong {
  font-size: 1rem;
  font-weight: 720;
}

.platforms__name small {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8rem;
}

@media (max-width: 940px) {
  .desktop,
  .features,
  .platforms {
    padding: 82px 0;
  }

  .section-head,
  .features__head,
  .platforms__layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .desktop__device--linux {
    width: min(84%, 760px);
  }

  .desktop__device--android {
    width: clamp(145px, 19vw, 180px);
  }
}

@media (max-width: 680px) {
  .desktop__showcase {
    position: relative;
    display: block;
    min-height: 410px;
    padding: 18px;
    border-radius: 30px 30px 14px 30px;
  }

  .desktop__device--linux figcaption {
    grid-template-columns: 1fr;
  }

  .desktop__slide-name {
    display: none;
  }

  .desktop__progress {
    grid-row: 2;
    grid-column: 1 / -1;
  }

  .desktop__device--linux {
    width: 100%;
    transform: none;
  }

  .desktop__device--android {
    position: absolute;
    right: 20px;
    bottom: 16px;
    width: 132px;
    margin: 0;
    transform: rotate(2deg);
  }

  .features__carousel {
    grid-auto-columns: min(82vw, 330px);
  }

  .platforms__list article {
    grid-template-columns: 52px 1fr;
    gap: 12px;
  }

  .platforms__list .chip {
    grid-column: 2;
    justify-self: start;
    min-height: 32px;
    padding-block: 4px;
  }
}
</style>
