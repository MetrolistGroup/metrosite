<script setup lang="ts">
import { ref } from 'vue'
import { ShapeBackdrop } from 'material-shapes-ts/vue'
import { DOWNLOAD_PLATFORMS, type DownloadPlatformKey } from '../content/downloads'
import DeviceShowcase from './DeviceShowcase.vue'
import DownloadDialog from './DownloadDialog.vue'

const lyrics = ['Never gonna give you up', 'Never gonna let you down', 'Never gonna say goodbye']
const lyricsPaused = ref(false)
const downloadDialog = ref<InstanceType<typeof DownloadDialog>>()
function openDownload(platform: DownloadPlatformKey) {
  downloadDialog.value?.open(platform)
}

const features = [
  { icon: 'block', shape: 'Arch', iconBackground: 'var(--md-sys-color-primary)', iconColor: 'var(--md-sys-color-on-primary)', title: 'Just you and the music.', label: 'Ad-free listening', body: 'Stream songs and videos from YouTube Music with background playback and no interruptions.' },
  { icon: 'lyrics', shape: 'Slanted', iconBackground: 'var(--md-sys-color-secondary-container)', iconColor: 'var(--md-sys-color-on-secondary-container)', title: 'Know every word.', label: 'Synchronized lyrics', body: 'Follow synchronized lyrics with word-by-word timing, translation, and romanization where available.' },
  { icon: 'groups', shape: 'Sunny', iconBackground: 'var(--md-sys-color-tertiary-container)', iconColor: 'var(--md-sys-color-on-tertiary-container)', title: 'Good music. Better company.', label: 'Listen Together', body: 'Create a room, share queue suggestions, and keep playback synchronized with friends.' },
  { icon: 'devices', shape: 'Ghostish', iconBackground: 'var(--md-sys-color-primary-container)', iconColor: 'var(--md-sys-color-on-primary-container)', title: 'Give it a bigger stage.', label: 'Cast wherever', body: 'Send playback to Chromecast, DLNA, and FCast devices directly from the player.' },
  { icon: 'download_for_offline', shape: 'Cookie7Sided', iconBackground: 'var(--md-sys-color-secondary-container)', iconColor: 'var(--md-sys-color-on-secondary-container)', title: 'Go touch grass once in a while.', label: 'Ready offline', body: 'Download songs or cache them as you listen so your library stays available without a connection.' },
  { icon: 'tune', shape: 'Pentagon', iconBackground: 'var(--md-sys-color-primary-container)', iconColor: 'var(--md-sys-color-on-primary-container)', title: 'Find your sweet spot.', label: 'Playback your way', body: 'Use skip silence, a sleep timer, audio normalization, tempo and pitch controls, and an equalizer.' },
] as const
</script>

<template>
  <DeviceShowcase />

  <section id="features" class="features" aria-labelledby="features-title">
    <div class="container">
      <div class="features__grid">
        <article v-for="(feature, index) in features" :key="feature.label" class="features__card" :class="`features__card--${index + 1}`">
          <div class="features__top"><ShapeBackdrop :shape="feature.shape" :color="feature.iconBackground" class="features__icon"><span class="features__icon-glyph material-symbols-rounded" :style="{ color: feature.iconColor }" aria-hidden="true">{{ feature.icon }}</span></ShapeBackdrop><span class="features__label">{{ feature.label }}</span><button v-if="index === 1" type="button" class="lyrics-toggle" :aria-label="lyricsPaused ? 'Resume lyrics animation' : 'Pause lyrics animation'" :aria-pressed="lyricsPaused" @click="lyricsPaused = !lyricsPaused"><span aria-hidden="true">{{ lyricsPaused ? '▶' : 'Ⅱ' }}</span></button></div>
          <div v-if="index === 0" class="features__wave" aria-hidden="true"><i v-for="bar in 25" :key="bar" :style="{ '--bar': `${18 + ((bar * 37) % 70)}%` }" /></div>
          <div v-if="index === 1" class="features__lyrics" :class="{ 'is-paused': lyricsPaused }" aria-hidden="true">
            <div v-for="(line, lineIndex) in lyrics" :key="line" class="lyrics-line" :style="{ '--line-delay': `${lineIndex === 0 ? 0 : (lineIndex - 3) * 3}s` }">
              <span v-for="(word, wordIndex) in line.split(' ')" :key="wordIndex" class="lyrics-word" :style="{ '--word': wordIndex }">{{ word }}</span>
            </div>
          </div>
          <div class="features__copy"><h3>{{ feature.title }}</h3><p>{{ feature.body }}</p></div>
        </article>
      </div>
    </div>
  </section>

  <section id="platforms" class="platforms">
    <div class="container platforms__layout">
      <header><h2>One codebase.<br />Every place to press play.</h2><p>Kotlin Multiplatform keeps the foundation shared while each interface fits the screen around it.</p></header>
      <div class="platforms__list">
        <button v-for="platform in DOWNLOAD_PLATFORMS" :key="platform.name" type="button" aria-haspopup="dialog" @click="openDownload(platform.key)">
          <span class="platforms__icon"><img :src="`/icons/${platform.icon}.svg`" alt="" /></span>
          <span class="platforms__name"><strong>{{ platform.name }}</strong><small>{{ platform.detail }}</small></span><span class="chip">{{ platform.package }}</span>
        </button>
      </div>
      <DownloadDialog ref="downloadDialog" :show-trigger="false" />
    </div>
  </section>
</template>

<style scoped>
.features, .platforms { padding: 92px 0; }
.features { background: var(--md-sys-color-surface-container-low); }
.features__head { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.6fr); gap: 36px; align-items: end; margin-bottom: 36px; }
.section-label { margin-bottom: 22px; }
.features h2, .platforms h2 { font-size: clamp(2.7rem, 5vw, 4.7rem); font-weight: 760; letter-spacing: -0.055em; line-height: 1; }
.features__head > p, .platforms header > p:last-child { color: var(--md-sys-color-on-surface-variant); font-size: 1.05rem; }
.features__grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.features__card { position: relative; isolation: isolate; display: flex; grid-column: span 2; flex-direction: column; justify-content: space-between; min-height: 250px; gap: 20px; padding: 28px; overflow: hidden; border-radius: 28px; background: var(--md-sys-color-surface-container); transition: box-shadow 160ms var(--md-sys-motion-expressive); }
.features__card:hover { box-shadow: 0 16px 32px #0004; }
.features__card--1, .features__card--2 { grid-column: span 3; min-height: 395px; }
.features__card--1 { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border-radius: 28px 72px 28px 28px; }
.features__card--2 { container-type: inline-size; background: #302d21; border-radius: 28px 28px 72px 28px; }
.features__card--3 { grid-column: span 2; }
.features__card--3, .features__card--4, .features__card--5 { justify-content: flex-start; }
.features__card--6 { grid-column: span 6; min-height: 180px; flex-direction: row; align-items: center; background: var(--md-sys-color-surface-container-high); }
.features__top { display: flex; align-items: center; gap: 10px; }
.features__icon { flex: 0 0 48px; width: 48px; height: 48px; }
.features__icon-glyph { display: grid; width: 48px; height: 48px; place-items: center; font-size: 26px; line-height: 1; }
.features__label { font-size: 1rem; font-weight: 650; }
.features__card h3 { margin-bottom: 10px; max-width: 20ch; font-size: clamp(1.4rem, 2.3vw, 2rem); font-weight: 740; letter-spacing: -0.04em; line-height: 1.08; }
.features__card p { max-width: 46ch; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; }
.features__card--1 p { color: var(--md-sys-color-on-primary-container); }
.features__card--6 .features__copy { max-width: 65%; }.features__card--6 p { max-width: 65ch; }
.features__wave { display: flex; justify-content: center; align-items: center; gap: 5px; height: 90px; padding-inline: 10px; transform: rotate(-3deg); }
.features__wave i { width: 9px; height: var(--bar); border-radius: 99px; background: var(--md-sys-color-primary); }
.features__wave i:nth-child(3n) { background: var(--md-sys-color-on-primary-container); }
.lyrics-toggle { display: grid; place-items: center; flex: 0 0 44px; height: 44px; margin-left: auto; border: 0; border-radius: 50%; background: #ffffff0c; color: var(--md-sys-color-on-secondary-container); cursor: pointer; font-size: 0.85rem; }
.lyrics-toggle:hover { background: #ffffff18; }
.features__lyrics { --lyrics-play-state: running; position: relative; height: 144px; flex: none; overflow: hidden; font-size: clamp(1rem, 7cqw, 2.1rem); font-weight: 760; letter-spacing: -0.04em; line-height: 1.2; mask-image: linear-gradient(transparent, #000 18% 82%, transparent); }
.features__lyrics.is-paused { --lyrics-play-state: paused; }
.lyrics-line { position: absolute; top: calc(50% - 0.85em); inset-inline: 4px; display: flex; flex-wrap: wrap; align-content: center; column-gap: 0.24em; height: 1.7em; transform-origin: left center; animation: lyrics-line 9s cubic-bezier(0.22, 1, 0.36, 1) infinite; animation-delay: var(--line-delay); animation-play-state: var(--lyrics-play-state); }
.lyrics-word { display: inline-block; color: transparent; background: linear-gradient(90deg, #fff5d6 50%, #fff5d666 50%); background-size: 200% 100%; background-position: 100% 0; background-clip: text; animation: lyrics-word 9s linear infinite; animation-delay: calc(var(--line-delay) + var(--word) * 0.32s); animation-play-state: var(--lyrics-play-state); }
@keyframes lyrics-line {
  0%, 25%, 100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
  33%, 58% { transform: translateY(-100%) scale(0.94); opacity: 0.5; filter: blur(1.5px); }
  62% { transform: translateY(-110%) scale(0.94); opacity: 0; filter: blur(2px); }
  63% { transform: translateY(110%) scale(0.94); opacity: 0; filter: blur(2px); }
  66%, 92% { transform: translateY(100%) scale(0.94); opacity: 0.5; filter: blur(1.5px); }
}
@keyframes lyrics-word {
  0% { background-position: 100% 0; transform: translateY(0); text-shadow: none; }
  5%, 24% { background-position: 0 0; transform: translateY(-0.035em); text-shadow: 0 0 18px #ffe79630; }
  34%, 100% { background-position: 100% 0; transform: translateY(0); text-shadow: none; }
}
@media (prefers-reduced-motion: reduce) {
  .features__card, .platforms__list button { transition: none; }
  .lyrics-toggle { display: none; }
  .lyrics-line, .lyrics-word { animation: none; }
  .lyrics-line:not(:first-child) { visibility: hidden; }
  .lyrics-word { color: var(--md-sys-color-on-secondary-container); background: none; }
}
@media (forced-colors: active) { .lyrics-word { color: CanvasText; background: none; } }
.platforms { position: relative; overflow: hidden; isolation: isolate; background: var(--md-sys-color-surface); }
.platforms::before { position: absolute; inset: 0; z-index: -1; background: url('/images/platform-pattern.svg') left top / 666px auto repeat; content: ''; pointer-events: none; }
.platforms__layout { display: grid; grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr); gap: clamp(56px, 9vw, 130px); align-items: start; }
.platforms header > p:last-child { max-width: 520px; margin-top: 24px; }
.platforms__list { display: grid; gap: 6px; padding: 10px; border-radius: 36px; background: rgb(24 22 27 / 88%); backdrop-filter: blur(28px); }
.platforms__list button { display: grid; grid-template-columns: 54px minmax(120px, 1fr) auto; gap: 16px; align-items: center; min-height: 82px; padding: 10px 12px; border: 0; border-radius: 20px; background: transparent; color: var(--md-sys-color-on-surface); cursor: pointer; font: inherit; text-align: left; transition: background 120ms, box-shadow 160ms var(--md-sys-motion-expressive); }
.platforms__list button:hover, .platforms__list button:focus-visible { background: var(--md-sys-color-surface-container-high); box-shadow: 0 8px 20px #0004; }
.platforms__icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 16px; background: var(--md-sys-color-surface-container-highest); }
.platforms__icon img { width: 23px; height: 23px; object-fit: contain; }
.platforms__name { display: flex; flex-direction: column; }.platforms__name strong { font-size: 1rem; font-weight: 720; }.platforms__name small { color: var(--md-sys-color-on-surface-variant); font-size: 0.8rem; }
@media (max-width: 940px) {
  .features, .platforms { padding: 72px 0; }.features__head, .platforms__layout { grid-template-columns: 1fr; gap: 28px; }
  .features__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.features__card, .features__card--1, .features__card--2, .features__card--3, .features__card--6 { grid-column: auto; min-height: 280px; }.features__card--6 { flex-direction: column; align-items: start; }.features__card--6 .features__copy { max-width: none; }
}
@media (max-width: 600px) {
  .features__grid { grid-template-columns: 1fr; }.features__card { padding: 24px; min-height: 250px; gap: 28px; }.features__card--1, .features__card--2 { min-height: 360px; }
  .platforms__list button { grid-template-columns: 52px 1fr; gap: 12px; }.platforms__list .chip { grid-column: 2; justify-self: start; min-height: 32px; padding-block: 4px; }
}
</style>
