<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { DESKTOP_PLATFORMS, SHOWCASE_VIEWS, type DesktopPlatform, type ShowcaseDevice, type ShowcaseView } from '../content/showcase'
import ShowcaseScreen from './ShowcaseScreen.vue'

const platform = ref<DesktopPlatform>('windows')
const view = ref<ShowcaseView>('home')
const viewName = computed(() => SHOWCASE_VIEWS.find(item => item.key === view.value)!.name)
const folded = ref(false)
const desktop = computed(() => DESKTOP_PLATFORMS.find(item => item.key === platform.value)!)
const dialog = ref<HTMLDialogElement>()
const selectedDevice = ref<ShowcaseDevice>('desktop')
const modelView = ref(false)
const modelReady = ref(false)
const modelFailed = ref(false)
const modelLoading = ref(false)
const labels = computed(() => ({ ios: 'iPhone 17 Pro Max · iOS 27', desktop: desktop.value.device, android: `Pixel 10 Pro Fold · ${folded.value ? 'Cover screen' : 'Unfolded'}`, wear: 'Google Pixel Watch 4 · Wear OS' }))
const screenProps = computed(() => ({ view: view.value, platform: platform.value, folded: folded.value }))
let previousOverflow = ''

function openScreenshot(device: ShowcaseDevice) {
  selectedDevice.value = device
  modelView.value = false
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
}

function restoreScroll() {
  document.body.style.overflow = previousOverflow
}

async function showWatchModel() {
  modelView.value = true
  modelLoading.value = true
  modelFailed.value = false
  try {
    await import('@google/model-viewer')
    modelReady.value = true
  } catch {
    modelFailed.value = true
    modelLoading.value = false
  }
}

onBeforeUnmount(() => { if (dialog.value?.open) restoreScroll() })
</script>

<template>
  <section id="desktop" class="showcase" aria-labelledby="showcase-title">
    <div class="container">
      <header class="showcase__heading">
        <div><p class="section-label"><span class="material-symbols-rounded" aria-hidden="true">devices</span>Same music. New possibilities.</p><h2 id="showcase-title">Every screen.<br /><span>Your kind of music.</span></h2></div>
        <p>From your wrist to your workspace.<br />A familiar player, with room to be itself on every device.</p>
      </header>

      <div class="showcase__studio">
        <div class="showcase__toolbar">
          <div class="segmented" role="group" aria-label="Desktop operating system">
            <button v-for="os in DESKTOP_PLATFORMS" :key="os.key" type="button" :aria-pressed="platform === os.key" @click="platform = os.key"><img :src="`/icons/${os.key}.svg`" alt="" width="16" height="16" />{{ os.name }}</button>
          </div>
          <div class="view-switch" role="group" aria-label="App preview">
            <button v-for="screen in SHOWCASE_VIEWS" :key="screen.key" type="button" :aria-pressed="view === screen.key" @click="view = screen.key">{{ screen.name }}</button>
          </div>
        </div>

        <div class="device-stage" :class="`device-stage--${platform}`">
          <div class="stage-orbit stage-orbit--one" aria-hidden="true" /><div class="stage-orbit stage-orbit--two" aria-hidden="true" />
          <figure class="device device--iphone">
            <div class="phone phone--iphone">
              <span class="hardware-button hardware-button--action" aria-hidden="true" /><span class="hardware-button hardware-button--volume-up" aria-hidden="true" /><span class="hardware-button hardware-button--volume-down" aria-hidden="true" /><span class="hardware-button hardware-button--power" aria-hidden="true" /><span class="hardware-button hardware-button--camera" aria-hidden="true" />
              <button class="device-screen" type="button" aria-label="Enlarge iPhone 17 Pro Max app preview" aria-haspopup="dialog" @click="openScreenshot('ios')"><ShowcaseScreen device="ios" v-bind="screenProps" /></button>
              <span class="dynamic-island" aria-hidden="true"><i /></span>
            </div>
            <figcaption><strong>iPhone 17 Pro Max</strong><span>iOS 27 · Illustrative preview</span></figcaption>
          </figure>

          <figure class="device device--desktop">
            <div class="computer" :class="`computer--${platform}`">
              <div class="computer__lid">
                <span class="webcam" aria-hidden="true" />
                <div class="computer__display">
                  <button class="computer__screen" type="button" :aria-label="`Enlarge ${desktop.name} app preview`" aria-haspopup="dialog" @click="openScreenshot('desktop')"><ShowcaseScreen device="desktop" v-bind="screenProps" /></button>
                </div>
              </div>
              <div v-if="platform === 'windows'" class="monitor-stand" aria-hidden="true" />
              <div v-else class="laptop-base" aria-hidden="true"><span /></div>
            </div>
            <figcaption><strong>{{ desktop.device }}</strong><span>{{ desktop.name }} · Made for the big screen</span></figcaption>
          </figure>

          <figure class="device device--watch">
            <div class="pixel-watch">
              <div class="watch-strap" aria-hidden="true" />
              <div class="watch-case"><span class="watch-crown" aria-hidden="true" /><button type="button" class="watch-screen" aria-label="Enlarge Google Pixel Watch app preview" aria-haspopup="dialog" @click="openScreenshot('wear')"><ShowcaseScreen device="wear" v-bind="screenProps" /></button></div>
            </div>
            <figcaption><strong>Pixel Watch 4</strong><span>Player preview</span></figcaption>
          </figure>

          <figure class="device device--fold">
            <div class="fold-footprint"><div class="phone phone--fold" :class="{ 'phone--folded': folded }">
              <span class="fold-hinge" aria-hidden="true" /><span class="hardware-button hardware-button--power" aria-hidden="true" /><span class="hardware-button hardware-button--volume" aria-hidden="true" />
              <button class="device-screen" type="button" :aria-label="`Enlarge Pixel 10 Pro Fold ${folded ? 'cover screen' : 'unfolded'} app preview`" aria-haspopup="dialog" @click="openScreenshot('android')"><ShowcaseScreen device="android" v-bind="screenProps" /></button>
              <span class="punch-camera" aria-hidden="true" /><span v-if="!folded" class="fold-crease" aria-hidden="true" />
            </div></div>
            <figcaption><strong>Pixel 10 Pro Fold</strong><span>{{ folded ? 'Cover screen' : 'Unfolded. More to explore.' }}</span></figcaption>
          </figure>
        </div>

        <div class="showcase__footer"><p><span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>Select a screen for a closer look.</p><button class="fold-toggle" type="button" :aria-pressed="folded" @click="folded = !folded"><span class="fold-toggle__icon" :class="{ 'is-folded': folded }" aria-hidden="true" />{{ folded ? 'Unfold Pixel' : 'Fold Pixel' }}<span aria-hidden="true">↔</span></button></div>
      </div>
      <p class="showcase__note">App captures in illustrative device frames. Desktop previews share one capture set; watch UI is illustrative.</p>
      <div class="showcase__benefits"><span><i aria-hidden="true" />One shared foundation</span><span><i aria-hidden="true" />Layouts that adapt</span><span><i aria-hidden="true" />Always open source</span></div>
    </div>
  </section>

  <Teleport to="body">
    <dialog ref="dialog" class="preview-dialog" aria-labelledby="preview-dialog-title" @close="restoreScroll" @click="(event) => { if (event.target === dialog) dialog?.close() }">
      <div class="preview-dialog__content">
        <header><div><span class="section-label">{{ modelView ? 'Interactive hardware' : `${selectedDevice === 'wear' ? 'Now Playing' : viewName} preview` }}</span><h2 id="preview-dialog-title">{{ labels[selectedDevice] }}</h2></div><form method="dialog"><button class="icon-button" aria-label="Close preview" autofocus><span class="material-symbols-rounded" aria-hidden="true">close</span></button></form></header>
        <div v-if="modelView" class="preview-dialog__model">
          <p v-if="modelLoading && !modelFailed" role="status">Loading the 3D model…</p>
          <p v-if="modelFailed" role="status">The 3D model couldn't load. The app preview is still available.</p>
          <model-viewer v-if="modelReady && !modelFailed" src="/models/pixel-watch-4.glb" alt="Interactive Obsidian Google Pixel Watch 4; drag to rotate, pinch or scroll to zoom" variant-name="Obsidian" camera-controls camera-orbit="-12deg 80deg 105%" field-of-view="25deg" environment-image="neutral" shadow-intensity="1" interaction-prompt="none" @load="modelLoading = false" @error="modelFailed = true; modelLoading = false" />
        </div>
        <div v-else class="preview-dialog__screen" :class="{ 'preview-dialog__screen--desktop': selectedDevice === 'desktop', 'preview-dialog__screen--phone': selectedDevice === 'ios' || (selectedDevice === 'android' && folded), 'preview-dialog__screen--fold': selectedDevice === 'android' && !folded, 'preview-dialog__screen--watch': selectedDevice === 'wear' }"><ShowcaseScreen :device="selectedDevice" v-bind="screenProps" /></div>
        <footer><p>{{ modelView ? 'Drag to rotate · Pinch or scroll to zoom · Stock watch face' : selectedDevice === 'wear' ? 'Illustrative watch UI; an app capture will replace this preview.' : selectedDevice === 'desktop' ? 'App capture shared across the Windows, Linux, and macOS previews.' : 'Metrolist app capture. Device hardware is illustrated in the showcase.' }}</p><button v-if="selectedDevice === 'wear'" type="button" class="btn btn-outlined" @click="modelView ? modelView = false : showWatchModel()">{{ modelView ? 'App preview' : 'Explore watch in 3D' }}</button></footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.showcase { padding: 44px 0 92px; background: var(--md-sys-color-surface); }
.showcase__heading { display: grid; grid-template-columns: 1.5fr 0.7fr; align-items: end; gap: 32px; margin-bottom: 36px; }
.showcase__heading .section-label { margin-bottom: 22px; }.section-label .material-symbols-rounded { font-size: 17px; }
.showcase h2 { font-size: clamp(2.7rem, 5.1vw, 4.7rem); letter-spacing: -0.055em; font-weight: 760; line-height: 1; }
.showcase h2 span { color: var(--md-sys-color-primary); }
.showcase__heading > p { max-width: 32ch; padding-bottom: 5px; color: var(--md-sys-color-on-surface-variant); font-size: 1.06rem; }
.showcase__studio { overflow: hidden; border: 1px solid #ffffff0d; border-radius: 36px; background: var(--md-sys-color-surface-container-low); }
.showcase__toolbar { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px 28px; }
.segmented, .view-switch { display: flex; gap: 4px; padding: 5px; border-radius: 999px; background: var(--md-sys-color-surface-container-lowest); }
.segmented button, .view-switch button { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 17px; border: 0; border-radius: 999px; background: transparent; color: var(--md-sys-color-on-surface-variant); cursor: pointer; font-size: 0.82rem; font-weight: 650; transition: background 180ms, color 180ms; }
.segmented img { width: 16px; height: 16px; }
.segmented button[aria-pressed='true'] { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }.segmented button[aria-pressed='true'] img { filter: brightness(0); }
.view-switch button[aria-pressed='true'] { background: var(--md-sys-color-surface-container-highest); color: var(--md-sys-color-on-surface); }
.segmented button:hover:not([aria-pressed='true']), .view-switch button:hover:not([aria-pressed='true']) { background: var(--md-sys-color-surface-container); }
.device-stage { position: relative; isolation: isolate; display: grid; grid-template-columns: 16% 47% 9% 23%; column-gap: 1.666%; align-items: end; padding: 28px 28px 20px; min-height: 440px; background: radial-gradient(ellipse at 45% 80%, #a782ca17, transparent 65%); }
.stage-orbit { position: absolute; z-index: -1; width: 70%; height: 70%; border: 1px solid #d9b9ff0c; border-radius: 50%; transform: rotate(-16deg); pointer-events: none; }
.stage-orbit--one { top: 10%; left: 15%; }.stage-orbit--two { top: 20%; left: 18%; width: 85%; }
.device { position: relative; min-width: 0; margin: 0; }
.device figcaption { display: flex; flex-direction: column; justify-content: start; min-height: 53px; gap: 3px; margin-top: 25px; text-align: center; }
.device figcaption strong { font-size: clamp(0.68rem, 1vw, 0.87rem); font-weight: 650; }.device figcaption > span { color: var(--md-sys-color-on-surface-variant); font-size: clamp(0.58rem, 0.8vw, 0.7rem); }
.phone { position: relative; padding: 1px; border: 1px solid #b7a8a180; box-shadow: 0 20px 28px #0007, 0 2px 5px #000; }
/* Match the capture ratio, with 60 source pixels of top clearance for the iPhone status row. */
.phone--iphone { --screen-ratio: 1320 / 2928; --screen-top: calc(100% * 60 / 1320); border-radius: 12% / 5.4%; background: linear-gradient(100deg, #bfb3a4, #4b4540 12%, #746a60 80%, #d5c8ba); transform: perspective(1000px) rotateY(8deg) rotateZ(-2deg); }
.device-screen { position: relative; display: block; width: 100%; aspect-ratio: var(--screen-ratio); padding: var(--screen-top, 0px) 0 0; overflow: hidden; border: 0; border-radius: inherit; background: #141217; cursor: zoom-in; }
.device-screen:focus-visible, .computer__screen:focus-visible, .watch-screen:focus-visible { outline-offset: -4px; }
.hardware-button { position: absolute; width: 3px; border-radius: 2px; background: linear-gradient(90deg, #655e57, #c8baaa, #655e57); box-shadow: 0 1px 2px #0008; }
.hardware-button--action { top: 18%; left: -3px; height: 5%; }.hardware-button--volume-up { top: 28%; left: -3px; height: 9%; }.hardware-button--volume-down { top: 40%; left: -3px; height: 9%; }.hardware-button--power { right: -3px; top: 29%; height: 13%; }.hardware-button--camera { right: 0; top: 65%; width: 2px; height: 10%; background: #796f64; box-shadow: inset 0 0 1px #302922; }
.dynamic-island { position: absolute; z-index: 1; top: 2.2%; left: 35%; width: 30%; height: 2.5%; border-radius: 99px; background: #030304; box-shadow: 0 1px 1px #ffffff09; pointer-events: none; }
.dynamic-island i { position: absolute; top: 24%; right: 10%; height: 50%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #253255, #090b14 55%); border: 1px solid #141622; }
.device--desktop { align-self: end; }
.computer { position: relative; padding-bottom: 17px; }
.computer__lid { position: relative; padding: 12px 7px 8px; border: 1px solid #77737b; border-radius: 14px 14px 7px 7px; background: linear-gradient(120deg, #4c494f, #1e1d22 40%, #65606a); box-shadow: 0 20px 40px #0006, inset 0 0 0 2px #151418; }
.computer__display { display: flex; flex-direction: column; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 4px; background: #141217; }
.webcam { position: absolute; top: 4px; left: calc(50% - 2px); width: 4px; height: 4px; border: 1px solid #303947; border-radius: 50%; background: #0a0b10; }
.computer__screen { display: block; flex: 1; min-height: 0; width: 100%; padding: 0; border: 0; background: #141217; cursor: zoom-in; }
.monitor-stand { position: relative; width: 18%; height: 60px; margin: 0 auto; background: linear-gradient(90deg, #48464d, #79767e 48%, #333137); clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%); }
.computer--windows { padding-bottom: 10px; }.computer--windows::after { content: ''; position: absolute; bottom: 5px; left: 33%; width: 34%; height: 8px; border: 1px solid #8b8592; border-radius: 50% 50% 4px 4px; background: linear-gradient(#77727f, #3c3841); box-shadow: 0 10px 15px #0008; }
.laptop-base { position: absolute; left: -4%; right: -4%; bottom: 5px; height: 17px; border-top: 2px solid #b8b4bf; border-radius: 2px 2px 45% 45%; background: linear-gradient(#8d8994, #4b4651 65%, #27232d); box-shadow: 0 12px 16px #0006; }
.laptop-base span { display: block; width: 18%; height: 5px; margin: -1px auto 0; border-radius: 0 0 8px 8px; background: #45414b; }
.computer--macos .computer__lid { border-color: #bcc8b2; background: linear-gradient(120deg, #c1ceb5, #707e66 50%, #d3ddc9); }.computer--macos .laptop-base { border-color: #d2ddc8; background: linear-gradient(#b0bda3, #68765c); }
.pixel-watch { position: relative; display: grid; width: 100%; aspect-ratio: 0.6; align-items: center; filter: drop-shadow(0 14px 10px #0007); transform: rotate(-7deg); }
.watch-strap { position: absolute; top: 0; bottom: 0; left: 18%; right: 18%; border: 1px solid #575d53; border-radius: 22%; background: linear-gradient(90deg, #242923, #41483b 45%, #252b23); }
.watch-strap::after { content: ''; position: absolute; left: 43%; bottom: 4%; width: 14%; height: 18%; background: radial-gradient(ellipse, #131711 30%, transparent 40%) center / 100% 7px; }
.watch-case { position: relative; aspect-ratio: 1; border: 1px solid #b3b5aa; border-radius: 50%; background: linear-gradient(140deg, #c1c5b8, #444a40 20%, #060806 52%, #5b6255 87%, #a4ac9c); box-shadow: inset 1px 2px 2px #e6edde70, 0 2px 3px #000; }
.watch-screen { position: absolute; inset: 5%; width: 90%; height: 90%; padding: 0; border: 2px solid #020302; border-radius: 50%; overflow: hidden; background: #090b09; cursor: zoom-in; }
.watch-crown { position: absolute; right: -6%; top: 40%; width: 8%; height: 18%; border: 1px solid #969e8f; border-radius: 2px 4px 4px 2px; background: repeating-linear-gradient(0deg, #495043 0 1px, #89917f 1px 2px); }
.device--watch figcaption { margin-top: 25px; }.device--watch figcaption strong { font-size: 0.65rem; }
.fold-footprint { display: flex; align-items: end; justify-content: center; aspect-ratio: 1; }
.phone--fold { --screen-ratio: 2076 / 2152; width: 100%; border-radius: 5.5% / 5.3%; background: linear-gradient(100deg, #71796e, #b1b9a9 2%, #454d41 5%, #3a4036 93%, #c3ccbb); border-color: #aab29e; transform: perspective(1000px) rotateY(-9deg) rotateZ(1.5deg); transition: width 450ms var(--md-sys-motion-expressive); }
.phone--fold .hardware-button { background: linear-gradient(90deg, #46513d, #b2bfa6, #57654c); }.phone--fold .hardware-button--power { top: 20%; height: 10%; }.hardware-button--volume { top: 35%; right: -3px; height: 18%; }
.fold-hinge { position: absolute; top: 7%; bottom: 7%; left: -3px; width: 4px; border-radius: 2px; background: linear-gradient(90deg, #424c3b, #c4ccbc, #4d5846); }
.punch-camera { position: absolute; top: 4%; right: 23%; width: 5px; height: 5px; border-radius: 50%; border: 1px solid #292c33; background: radial-gradient(circle at 35% 35%, #2c3751, #030405 60%); pointer-events: none; }
.fold-crease { position: absolute; top: 8px; bottom: 8px; left: 49%; width: 2%; background: linear-gradient(90deg, transparent, #0002, #ffffff06, transparent); pointer-events: none; }
.phone--folded { --screen-ratio: 1080 / 2364; width: 47.5%; border-radius: 10% / 4.6%; }.phone--folded .punch-camera { right: calc(50% - 2px); }
.showcase__footer { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 28px; border-top: 1px solid #ffffff09; }
.showcase__footer p { display: flex; align-items: center; gap: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 0.75rem; }.showcase__footer .material-symbols-rounded { font-size: 16px; }
.fold-toggle { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 44px; padding: 8px 16px; border: 1px solid var(--md-sys-color-outline-variant); border-radius: 999px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-primary); cursor: pointer; font-size: 0.8rem; font-weight: 650; }
.fold-toggle:hover { background: var(--md-sys-color-surface-container-high); }.fold-toggle__icon { width: 20px; height: 18px; border: 1.5px solid currentColor; border-radius: 3px; background: linear-gradient(90deg, transparent 47%, currentColor 48% 52%, transparent 53%); transition: width 250ms; }.fold-toggle__icon.is-folded { width: 11px; background: none; }
.showcase__note { margin-top: 14px; color: var(--md-sys-color-on-surface-variant); font-size: 0.7rem; text-align: center; }
.showcase__benefits { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px 38px; margin-top: 28px; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }.showcase__benefits > span { display: flex; align-items: center; gap: 8px; }.showcase__benefits i { width: 7px; height: 7px; border-radius: 2px; background: var(--md-sys-color-primary); transform: rotate(45deg); }.showcase__benefits > span:nth-child(2) i { background: var(--md-sys-color-secondary); }.showcase__benefits > span:nth-child(3) i { background: var(--md-sys-color-tertiary); }
.preview-dialog { width: calc(100% - 32px); max-width: 1280px; max-height: calc(100dvh - 32px); margin: auto; padding: 24px; border: 1px solid var(--md-sys-color-outline-variant); border-radius: 28px; background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface); }
.preview-dialog::backdrop { background: #050307e8; backdrop-filter: blur(10px); }
.preview-dialog__content { display: grid; gap: 20px; }.preview-dialog header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }.preview-dialog h2 { margin-top: 8px; font-size: clamp(1rem, 2vw, 1.4rem); letter-spacing: -0.03em; }.preview-dialog .section-label { min-height: 24px; font-size: 0.6rem; padding: 4px 8px; }.preview-dialog form { flex-shrink: 0; }
.preview-dialog__screen { justify-self: center; overflow: hidden; border: 1px solid #ffffff14; border-radius: 4px; box-shadow: 0 18px 50px #0005; }
.preview-dialog__screen--desktop { width: min(100%, calc((100dvh - 240px) * 2000 / 1091)); aspect-ratio: 2000 / 1091; }
.preview-dialog__screen--phone { width: min(100%, calc((100dvh - 240px) * 1320 / 2868)); aspect-ratio: 1320 / 2868; }
.preview-dialog__screen--fold { width: min(100%, calc((100dvh - 240px) * 2076 / 2152)); aspect-ratio: 2076 / 2152; }
.preview-dialog__screen--watch { width: min(100%, 420px, calc(100dvh - 240px)); aspect-ratio: 1; border-radius: 50%; }
.preview-dialog footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }.preview-dialog footer p { color: var(--md-sys-color-on-surface-variant); font-size: 0.75rem; }
.preview-dialog__model { position: relative; min-height: 280px; height: min(520px, 55dvh); }.preview-dialog__model p { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }.preview-dialog model-viewer { width: 100%; height: 100%; --poster-color: transparent; }
@media (min-width: 1101px) { .device--iphone { padding-bottom: 9px; }.device--desktop { padding-bottom: 36px; }.device--fold { padding-bottom: 8px; } }
@media (max-width: 1100px) {
  .device-stage { grid-template-columns: minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 1.4fr); gap: 36px 7%; padding: 20px 6% 28px; }
  .device--desktop { grid-row: 1; grid-column: 1 / -1; width: 85%; justify-self: center; }.device--iphone { grid-row: 2; max-width: 200px; width: 100%; justify-self: center; }.device--watch { grid-row: 2; width: 100%; max-width: 115px; justify-self: center; }.device--fold { grid-row: 2; width: 100%; max-width: 300px; justify-self: center; }
  .device figcaption strong { font-size: 0.8rem; }.device figcaption > span { font-size: 0.65rem; }.device--watch figcaption strong { font-size: 0.7rem; }.device--desktop figcaption { margin-top: 15px; min-height: 0; }
  .monitor-stand { height: 45px; }.stage-orbit { height: 45%; top: 35%; }
}
@media (max-width: 700px) {
  .showcase { padding: 24px 0 64px; }.showcase__heading { grid-template-columns: 1fr; gap: 20px; }.showcase__heading > p { max-width: 40ch; font-size: 0.96rem; }.showcase__heading .section-label { font-size: 0.6rem; }
  .showcase__studio { border-radius: 24px; }.showcase__toolbar { flex-direction: column; gap: 12px; padding: 18px 12px 8px; }.segmented { width: 100%; max-width: 370px; }.segmented button { flex: 1; padding-inline: 10px; }.view-switch button { min-height: 40px; padding: 8px 20px; }
  .device-stage { grid-template-columns: 30% 17% 43%; column-gap: 5%; row-gap: 28px; padding: 20px 16px 12px; }.device--desktop { width: 96%; }.device figcaption { margin-top: 18px; min-height: 52px; }.device figcaption strong, .device--watch figcaption strong { font-size: 0.65rem; }.device figcaption > span { font-size: 0.57rem; }.device--desktop figcaption { min-height: 0; }
  .punch-camera { width: 4px; height: 4px; }.hardware-button { width: 2px; }.watch-screen { border-width: 1px; }
  .computer__lid { padding: 9px 5px 5px; border-radius: 10px 10px 5px 5px; }.webcam { top: 3px; width: 3px; height: 3px; }.monitor-stand { height: 30px; }.laptop-base { height: 12px; }.computer { padding-bottom: 12px; }
  .showcase__footer { padding: 12px 16px; }.showcase__footer p { font-size: 0.65rem; max-width: 19ch; }.showcase__footer p .material-symbols-rounded { display: none; }.fold-toggle { padding-inline: 12px; font-size: 0.72rem; white-space: nowrap; }.showcase__benefits { gap: 12px 20px; font-size: 0.7rem; }
  .preview-dialog { padding: 16px; width: calc(100% - 20px); max-height: calc(100dvh - 20px); border-radius: 22px; }.preview-dialog__content { gap: 16px; }
}
@media (prefers-reduced-motion: reduce) { .phone--fold, .fold-toggle__icon { transition: none; } }
@media (forced-colors: active) { .segmented button[aria-pressed='true'], .view-switch button[aria-pressed='true'] { outline: 2px solid Highlight; }.phone, .computer__lid, .watch-case { border-color: CanvasText; } }
</style>
