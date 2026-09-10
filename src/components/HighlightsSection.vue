<script setup lang="ts">
import { ref } from 'vue'
import { DOWNLOAD_PLATFORMS, type DownloadPlatformKey } from '../content/downloads'
import DeviceShowcase from './DeviceShowcase.vue'
import DownloadDialog from './DownloadDialog.vue'

const downloadDialog = ref<InstanceType<typeof DownloadDialog>>()
function openDownload(platform: DownloadPlatformKey) {
  downloadDialog.value?.open(platform)
}

const features = [
  { icon: 'block', title: 'Just you and the music.', label: 'Ad-free listening', body: 'Stream songs and videos from YouTube Music with background playback and no interruptions.' },
  { icon: 'lyrics', title: 'Know every word.', label: 'Synchronized lyrics', body: 'Follow synchronized lyrics with word-by-word timing, translation, and romanization where available.' },
  { icon: 'groups', title: 'Good music. Better company.', label: 'Listen Together', body: 'Create a room, share queue suggestions, and keep playback synchronized with friends.' },
  { icon: 'devices', title: 'Give it a bigger stage.', label: 'Cast your way', body: 'Send playback to Chromecast, DLNA, and FCast devices from the same player.' },
  { icon: 'download_for_offline', title: 'Go a little off-grid.', label: 'Ready offline', body: 'Download songs or cache them as you listen so your library stays available without a connection.' },
  { icon: 'tune', title: 'Find your sweet spot.', label: 'Playback your way', body: 'Use skip silence, a sleep timer, audio normalization, tempo and pitch controls, and an equalizer.' },
]
</script>

<template>
  <DeviceShowcase />

  <section id="features" class="features" aria-labelledby="features-title">
    <div class="container">
      <header class="features__head"><div><p class="section-label">Less friction. More feeling.</p><h2 id="features-title">All the right notes.<br />None of the noise.</h2></div><p>Everything between finding a song and playing it again. Built around the way you listen.</p></header>
      <div class="features__grid">
        <article v-for="(feature, index) in features" :key="feature.label" class="features__card" :class="`features__card--${index + 1}`">
          <div class="features__top"><span class="features__icon material-symbols-rounded" aria-hidden="true">{{ feature.icon }}</span><span class="features__label">{{ feature.label }}</span></div>
          <div v-if="index === 0" class="features__wave" aria-hidden="true"><i v-for="bar in 25" :key="bar" :style="{ '--bar': `${18 + ((bar * 37) % 70)}%` }" /></div>
          <div v-if="index === 1" class="features__lyrics" aria-hidden="true"><span>One more song.</span><span>One more time.</span><span>Just one more.</span></div>
          <div class="features__copy"><h3>{{ feature.title }}</h3><p>{{ feature.body }}</p></div>
        </article>
      </div>
    </div>
  </section>

  <section id="platforms" class="platforms">
    <div class="container platforms__layout">
      <header><p class="section-label">No device left behind</p><h2>One codebase.<br />Every place to press play.</h2><p>Kotlin Multiplatform keeps the foundation shared while each interface fits the screen around it.</p></header>
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
.features__card { position: relative; isolation: isolate; display: flex; grid-column: span 2; flex-direction: column; justify-content: space-between; min-height: 295px; gap: 36px; padding: 28px; overflow: hidden; border-radius: 28px; background: var(--md-sys-color-surface-container); }
.features__card--1, .features__card--2 { grid-column: span 3; min-height: 395px; }
.features__card--1 { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border-radius: 28px 72px 28px 28px; }
.features__card--2 { background: #302d21; border-radius: 28px 28px 72px 28px; }
.features__card--3 { grid-column: span 2; }
.features__card--6 { grid-column: span 6; min-height: 180px; flex-direction: row; align-items: center; background: var(--md-sys-color-surface-container-high); }
.features__top { display: flex; align-items: center; gap: 14px; }
.features__icon { width: 48px; height: 48px; border-radius: 16px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-size: 26px; }
.features__card--1 .features__icon { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
.features__card--2 .features__icon, .features__card--5 .features__icon { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); border-radius: 50%; }
.features__card--3 .features__icon { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
.features__label { font-size: 0.73rem; font-weight: 650; }
.features__card h3 { margin-bottom: 10px; max-width: 20ch; font-size: clamp(1.4rem, 2.3vw, 2rem); font-weight: 740; letter-spacing: -0.04em; line-height: 1.08; }
.features__card p { max-width: 46ch; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; }
.features__card--1 p { color: var(--md-sys-color-on-primary-container); }
.features__card--6 .features__copy { max-width: 65%; }.features__card--6 p { max-width: 65ch; }
.features__wave { display: flex; justify-content: center; align-items: center; gap: 5px; height: 90px; padding-inline: 10px; transform: rotate(-3deg); }
.features__wave i { width: 9px; height: var(--bar); border-radius: 99px; background: var(--md-sys-color-primary); }
.features__wave i:nth-child(3n) { background: var(--md-sys-color-on-primary-container); }
.features__lyrics { display: grid; gap: 0; padding-left: 16px; font-size: clamp(1.5rem, 2.5vw, 2.1rem); font-weight: 760; letter-spacing: -0.04em; line-height: 1.18; transform: rotate(-3deg); }
.features__lyrics span:first-child { color: #c0b791; }.features__lyrics span:nth-child(2) { color: var(--md-sys-color-on-secondary-container); }.features__lyrics span:last-child { color: #958b6b; }
.platforms { position: relative; overflow: hidden; isolation: isolate; background: var(--md-sys-color-surface); }
.platforms::before { position: absolute; inset: 0; z-index: -1; background: url('/images/platform-pattern.svg') left top / 666px auto repeat; content: ''; pointer-events: none; }
.platforms__layout { display: grid; grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr); gap: clamp(56px, 9vw, 130px); align-items: start; }
.platforms header > p:last-child { max-width: 520px; margin-top: 24px; }
.platforms__list { display: grid; gap: 6px; padding: 10px; border-radius: 36px; background: rgb(24 22 27 / 88%); backdrop-filter: blur(28px); }
.platforms__list button { display: grid; grid-template-columns: 54px minmax(120px, 1fr) auto; gap: 16px; align-items: center; min-height: 82px; padding: 10px 12px; border: 0; border-radius: 20px; background: transparent; color: var(--md-sys-color-on-surface); cursor: pointer; font: inherit; text-align: left; }
.platforms__list button:hover { background: var(--md-sys-color-surface-container-high); }
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
