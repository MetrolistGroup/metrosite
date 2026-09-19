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
  { icon: 'devices', shape: 'Ghostish', iconBackground: 'var(--md-sys-color-primary-container)', iconColor: 'var(--md-sys-color-on-primary-container)', title: 'Give your songs a bigger stage.', label: 'Cast wherever', body: 'Send playback to Chromecast, DLNA, and FCast devices directly from the player.' },
  { icon: 'download_for_offline', shape: 'Cookie7Sided', iconBackground: 'var(--md-sys-color-secondary-container)', iconColor: 'var(--md-sys-color-on-secondary-container)', title: 'Go touch grass once in a while.', label: 'Ready offline', body: 'Download songs or cache them as you listen so your library stays available without a connection.' },
  { icon: 'tune', shape: 'Pentagon', iconBackground: 'var(--md-sys-color-primary-container)', iconColor: 'var(--md-sys-color-on-primary-container)', title: 'Find your sweet spot.', label: 'Playback your way', body: 'Use skip silence, a sleep timer, audio normalization, tempo and pitch controls, and an equalizer.' },
] as const
</script>

<template>
  <DeviceShowcase />

  <section id="features" class="features" aria-labelledby="features-title">
    <div class="container">
      <div class="features__progress" aria-hidden="true" />
      <h2 id="features-title" class="sr-only">Metrolist features</h2>
      <div class="features__grid">
        <article v-for="(feature, index) in features" :key="feature.label" class="features__card" :class="`features__card--${index + 1}`">
          <div class="features__top"><ShapeBackdrop :shape="feature.shape" :color="feature.iconBackground" class="features__icon"><span class="features__icon-glyph material-symbols-rounded" :style="{ color: feature.iconColor }" aria-hidden="true">{{ feature.icon }}</span></ShapeBackdrop><span class="features__label">{{ feature.label }}</span><button v-if="index === 1" type="button" class="lyrics-toggle" :aria-label="lyricsPaused ? 'Resume lyrics animation' : 'Pause lyrics animation'" :aria-pressed="lyricsPaused" @click="lyricsPaused = !lyricsPaused"><span aria-hidden="true">{{ lyricsPaused ? '▶' : 'Ⅱ' }}</span></button></div>
          <div v-if="index === 0" class="features__ad-dodge" aria-hidden="true">
            <span class="features__app-icon features__app-icon--youtube"><img src="/icons/youtube-music.png" alt="" /></span>
            <span class="features__flying-ad">AD</span>
            <span class="features__app-icon features__app-icon--metrolist"><img src="/logo.svg" alt="" /></span>
          </div>
          <div v-if="index === 1" class="features__lyrics" :class="{ 'is-paused': lyricsPaused }" aria-hidden="true">
            <div v-for="(line, lineIndex) in lyrics" :key="line" class="lyrics-line" :style="{ '--line-delay': `${lineIndex === 0 ? 0 : (lineIndex - 3) * 3}s` }">
              <span v-for="(word, wordIndex) in line.split(' ')" :key="wordIndex" class="lyrics-word" :style="{ '--word': wordIndex }"><span v-for="(character, characterIndex) in word" :key="characterIndex" class="lyrics-character" :style="{ '--character': characterIndex }">{{ character }}</span></span>
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
          <span class="platforms__name"><strong>{{ platform.name }}</strong><small>{{ platform.detail }}</small></span>
        </button>
      </div>
      <DownloadDialog ref="downloadDialog" :show-trigger="false" />
    </div>
  </section>
</template>

<style scoped>
.features, .platforms { padding: 92px 0; }
.features { background: linear-gradient(to bottom, var(--md-sys-color-surface), var(--md-sys-color-surface-container-low) 32px); }
.features > .container { position: relative; }
.features__progress { position: absolute; top: -99px; inset-inline: 0; height: 14px; background: var(--md-sys-color-primary); opacity: 0.6; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 14'%3E%3Cpath d='M0 7Q7 0 14 7T28 7' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E") repeat-x left center / 28px 14px; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 14'%3E%3Cpath d='M0 7Q7 0 14 7T28 7' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E") repeat-x left center / 28px 14px; animation: progress-wave 900ms linear infinite; }
@keyframes progress-wave { to { -webkit-mask-position: 28px center; mask-position: 28px center; } }
.platforms h2 { font-size: clamp(2.7rem, 5vw, 4.7rem); font-weight: 760; letter-spacing: -0.055em; line-height: 1; }
.platforms header > p:last-child { color: var(--md-sys-color-on-surface-variant); font-size: 1.05rem; }
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
.features__ad-dodge { position: relative; width: min(100%, 320px); height: 120px; margin-inline: auto; user-select: none; }
.features__app-icon { position: absolute; bottom: 0; display: grid; width: 82px; height: 82px; place-items: center; border-radius: 24px; }
.features__app-icon--metrolist { right: 22px; background: var(--md-sys-color-surface-container-lowest); }
.features__app-icon--metrolist img { width: 74px; height: 74px; }
.features__app-icon--youtube { left: 22px; animation: youtube-throw 3.2s var(--md-sys-motion-expressive) infinite; }
.features__app-icon--youtube img { width: 82px; height: 82px; border-radius: 24px; }
.features__flying-ad { position: absolute; bottom: 28px; left: 64px; display: grid; width: 58px; height: 36px; place-items: center; border-radius: 10px; background: #b3261e; color: white; font-size: 0.8rem; font-weight: 850; letter-spacing: 0.08em; animation: ad-toss 3.2s linear infinite; }
@keyframes youtube-throw { 0%, 5%, 20%, 100% { transform: none; } 10% { transform: translate(-2px, 2px) rotate(-8deg); } 15% { transform: translate(3px, -2px) rotate(8deg); } }
@keyframes ad-toss { 0%, 10% { opacity: 0; transform: translate(-8px, 18px) rotate(-18deg) scale(0.75); } 14% { opacity: 1; } 32% { opacity: 1; transform: translate(70px, -72px) rotate(-2deg) scale(0.95); } 48% { opacity: 1; transform: translate(105px, -72px) rotate(8deg) scale(1); } 78% { opacity: 1; transform: translate(185px, -72px) rotate(22deg) scale(0.92); } 88% { opacity: 1; transform: translate(240px, -72px) rotate(30deg) scale(0.82); } 96%, 100% { opacity: 0; transform: translate(270px, -10px) rotate(42deg) scale(0.65); } }
.lyrics-toggle { display: grid; place-items: center; flex: 0 0 44px; height: 44px; margin-left: auto; border: 0; border-radius: 50%; background: #ffffff0c; color: var(--md-sys-color-on-secondary-container); cursor: pointer; font-size: 0.85rem; }
.lyrics-toggle:hover { background: #ffffff18; }
.features__lyrics { --lyrics-play-state: running; position: relative; height: 144px; flex: none; overflow: hidden; font-size: clamp(1rem, 7cqw, 2.1rem); font-weight: 760; letter-spacing: -0.04em; line-height: 1.2; mask-image: linear-gradient(transparent, #000 18% 82%, transparent); }
.features__lyrics.is-paused { --lyrics-play-state: paused; }
.lyrics-line { position: absolute; top: calc(50% - 0.85em); inset-inline: 4px; display: flex; flex-wrap: wrap; align-content: center; column-gap: 0.24em; height: 1.7em; transform-origin: left center; animation: lyrics-line 9s cubic-bezier(0.22, 1, 0.36, 1) infinite; animation-delay: var(--line-delay); animation-play-state: var(--lyrics-play-state); }
.lyrics-word { display: inline-flex; background-position: 100% 0; animation: lyrics-word 9s linear infinite; animation-delay: calc(var(--line-delay) + var(--word) * 0.32s); animation-play-state: var(--lyrics-play-state); }
.lyrics-character { display: inline-block; color: #fff5d666; transform-origin: center bottom; animation: lyrics-character 9s linear infinite; animation-delay: calc(var(--line-delay) + var(--word) * 0.32s + var(--character) * 0.045s); animation-play-state: var(--lyrics-play-state); }
@keyframes lyrics-line {
  0%, 25%, 100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
  33%, 58% { transform: translateY(-100%) scale(0.94); opacity: 0.5; filter: blur(1.5px); }
  62% { transform: translateY(-110%) scale(0.94); opacity: 0; filter: blur(2px); }
  63% { transform: translateY(110%) scale(0.94); opacity: 0; filter: blur(2px); }
  66%, 92% { transform: translateY(100%) scale(0.94); opacity: 0.5; filter: blur(1.5px); }
}
@keyframes lyrics-word {
  0% { background-position: 100% 0; }
  5%, 24% { background-position: 0 0; }
  34%, 100% { background-position: 100% 0; }
}
@keyframes lyrics-character {
  0%, 100% { color: #fff5d666; transform: translateY(0) scale(1); text-shadow: none; }
  3% { color: #fff5d6; transform: translateY(-0.055em) scale(1.08); text-shadow: 0 0 0.22em #fff5d699; }
  8%, 24% { color: #fff5d6; transform: translateY(0) scale(1); text-shadow: 0 0 0.08em #fff5d633; }
  34% { color: #fff5d666; transform: translateY(0) scale(1); text-shadow: none; }
}
@media (prefers-reduced-motion: reduce) {
  .features__card, .platforms__list button { transition: none; }
  .features__progress { animation: none; }
  .features__app-icon { animation: none; }
  .features__flying-ad { opacity: 1; transform: translate(120px, -72px) rotate(8deg); animation: none; }
  .lyrics-toggle { display: none; }
  .lyrics-line, .lyrics-word, .lyrics-character { animation: none; }
  .lyrics-line:not(:first-child) { visibility: hidden; }
  .lyrics-character { color: var(--md-sys-color-on-secondary-container); }
}
@media (forced-colors: active) { .lyrics-character { color: CanvasText; } }
.platforms { position: relative; overflow: hidden; isolation: isolate; background: var(--md-sys-color-surface); }
.platforms::before { position: absolute; inset: 0; z-index: -1; background: url('/images/platform-pattern.svg') left top / 666px auto repeat; content: ''; pointer-events: none; }
.platforms__layout { display: grid; grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr); gap: clamp(56px, 9vw, 130px); align-items: start; }
.platforms header > p:last-child { max-width: 520px; margin-top: 24px; }
.platforms__list { display: grid; gap: 3px; border-radius: 16px; }
.platforms__list button { display: grid; grid-template-columns: 54px minmax(120px, 1fr); gap: 16px; align-items: center; min-height: 82px; padding: 10px 12px; border: 0; border-radius: 4px; background: rgb(24 22 27 / 68%); color: var(--md-sys-color-on-surface); cursor: pointer; font: inherit; text-align: left; -webkit-backdrop-filter: blur(28px); backdrop-filter: blur(28px); transition: background 120ms, box-shadow 160ms var(--md-sys-motion-expressive); }
.platforms__list button:first-child { border-radius: 16px 16px 4px 4px; }
.platforms__list button:last-child { border-radius: 4px 4px 16px 16px; }
.platforms__list button:hover, .platforms__list button:focus-visible { background: var(--md-sys-color-surface-container-high); box-shadow: 0 8px 20px #0004; }
.platforms__icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 16px; background: var(--md-sys-color-surface-container-highest); }
.platforms__icon img { width: 23px; height: 23px; object-fit: contain; }
.platforms__name { display: flex; flex-direction: column; }.platforms__name strong { font-size: 1rem; font-weight: 720; }.platforms__name small { color: var(--md-sys-color-on-surface-variant); font-size: 0.8rem; }
@media (max-width: 940px) {
  .features, .platforms { padding: 72px 0; }.features__progress { top: -79px; }.platforms__layout { grid-template-columns: 1fr; gap: 28px; }
  .features__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.features__card, .features__card--1, .features__card--2, .features__card--3, .features__card--6 { grid-column: auto; min-height: 280px; }.features__card--6 { flex-direction: column; align-items: start; }.features__card--6 .features__copy { max-width: none; }
}
@media (max-width: 600px) {
  .features__grid { grid-template-columns: 1fr; }.features__card { padding: 24px; min-height: 250px; gap: 28px; }.features__card--1, .features__card--2 { min-height: 360px; }
  .platforms__list button { grid-template-columns: 52px 1fr; gap: 12px; }
}
</style>
