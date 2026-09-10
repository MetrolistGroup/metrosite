<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { DESKTOP_PLATFORMS, SHOWCASE_VIEWS, type DesktopPlatform, type ShowcaseDevice, type ShowcaseView } from '../content/showcase'
import ShowcaseScreen from './ShowcaseScreen.vue'

const platform = ref<DesktopPlatform>('windows')
const view = ref<ShowcaseView>('home')
const viewName = computed(() => SHOWCASE_VIEWS.find(item => item.key === view.value)!.name)
const folded = ref(false)
const desktop = computed(() => DESKTOP_PLATFORMS.find(item => item.key === platform.value)!)
const dialog = ref<HTMLDialogElement>()
const selectedDevice = ref<ShowcaseDevice>('desktop')
const labels = computed(() => ({ ios: 'iPhone 17 Pro Max · iOS 27', desktop: desktop.value.device, android: `Pixel 10 Pro Fold · ${folded.value ? 'Cover screen' : 'Unfolded'}`, wear: 'Google Pixel Watch 4 · Wear OS' }))
const screenProps = computed(() => ({ view: view.value, platform: platform.value, folded: folded.value }))
let previousOverflow = ''

async function openScreenshot(device: ShowcaseDevice) {
  selectedDevice.value = device
  await nextTick()
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
}

function restoreScroll() {
  document.body.style.overflow = previousOverflow
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
              <div class="monitor-stand" aria-hidden="true" />
              <div class="computer__base" aria-hidden="true"><span /></div>
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

          <figure class="device device--fold" :class="{ 'is-folded': folded }">
            <div class="fold-footprint">
              <button class="fold-device" type="button" :aria-label="`Enlarge Pixel 10 Pro Fold ${folded ? 'cover screen' : 'unfolded'} app preview`" aria-haspopup="dialog" @click="openScreenshot('android')">
                <div class="fold-body" aria-hidden="true">
                  <div class="fold-leaf fold-leaf--right">
                    <div class="fold-face fold-face--right">
                      <div class="fold-viewport"><div class="fold-capture"><ShowcaseScreen device="android" :view="view" :platform="platform" :folded="false" /></div></div>
                      <span class="punch-camera" /><span class="hardware-button hardware-button--power" /><span class="hardware-button hardware-button--volume" />
                    </div>
                  </div>
                  <span class="fold-hinge" />
                  <div class="fold-leaf fold-leaf--turning">
                    <div class="fold-face fold-face--left">
                      <div class="fold-viewport"><div class="fold-capture"><ShowcaseScreen device="android" :view="view" :platform="platform" :folded="false" /></div></div>
                    </div>
                    <div class="fold-face fold-face--cover">
                      <div class="fold-viewport"><ShowcaseScreen device="android" :view="view" :platform="platform" :folded="true" /></div>
                      <span class="punch-camera" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <figcaption><strong>Pixel 10 Pro Fold</strong><span class="fold-caption"><span :aria-hidden="folded">Unfolded. More to explore.</span><span :aria-hidden="!folded">Cover screen</span></span></figcaption>
          </figure>
        </div>

        <div class="showcase__footer"><p><span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>Select a screen for a closer look.</p><button class="fold-toggle" type="button" :aria-pressed="folded" @click="folded = !folded"><span class="fold-toggle__icon" :class="{ 'is-folded': folded }" aria-hidden="true" />{{ folded ? 'Unfold Pixel' : 'Fold Pixel' }}<span aria-hidden="true">↔</span></button></div>
      </div>
      <p class="showcase__note">App captures in illustrative device frames. Desktop previews share one capture set; watch UI is illustrative.</p>
      <div class="showcase__benefits"><span><i aria-hidden="true" />One shared foundation</span><span><i aria-hidden="true" />Layouts that adapt</span><span><i aria-hidden="true" />Always open source</span></div>
    </div>
  </section>

  <Teleport to="body">
    <dialog ref="dialog" class="preview-dialog" :aria-label="`${labels[selectedDevice]} · ${selectedDevice === 'wear' ? 'Now Playing' : viewName} preview`" @close="restoreScroll" @click="(event) => { if (event.target === dialog) dialog?.close() }">
      <form method="dialog" class="preview-dialog__close"><button class="icon-button" aria-label="Close preview" autofocus><span class="material-symbols-rounded" aria-hidden="true">close</span></button></form>
      <div class="preview-dialog__screen" :class="{ 'preview-dialog__screen--desktop': selectedDevice === 'desktop', 'preview-dialog__screen--phone': selectedDevice === 'ios', 'preview-dialog__screen--cover': selectedDevice === 'android' && folded, 'preview-dialog__screen--fold': selectedDevice === 'android' && !folded, 'preview-dialog__screen--watch': selectedDevice === 'wear' }"><ShowcaseScreen :key="selectedDevice" :device="selectedDevice" v-bind="screenProps" /></div>
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
.showcase__studio { overflow: hidden; border-radius: 36px; background: var(--md-sys-color-surface-container-low); }
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
/* Reserve the monitor's height even as its stand retracts into a laptop base. */
.computer { --stand-space: 70px; --base-height: 17px; --morph: 700ms cubic-bezier(0.4, 0, 0.2, 1); position: relative; padding-bottom: var(--stand-space); perspective: 1200px; }
.computer__lid { position: relative; z-index: 1; padding: 12px 7px 8px; border: 1px solid #77737b; border-radius: 14px 14px 7px 7px; background: linear-gradient(120deg, #4c494f, #1e1d22 40%, #65606a); box-shadow: 0 20px 40px #0006, inset 0 0 0 2px #151418; transform-origin: center bottom; transform: translateY(0) rotateX(0deg); transition: transform var(--morph), border-color var(--morph), border-radius var(--morph); }
.computer__lid::before, .computer__base::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(120deg, #c1ceb5, #707e66 50%, #d3ddc9); opacity: 0; transition: opacity var(--morph); }
.computer__display { position: relative; display: flex; flex-direction: column; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 4px; background: #141217; }
.webcam { position: absolute; z-index: 1; top: 4px; left: calc(50% - 2px); width: 4px; height: 4px; border: 1px solid #303947; border-radius: 50%; background: #0a0b10; }
.computer__screen { display: block; flex: 1; min-height: 0; width: 100%; padding: 0; border: 0; background: #141217; cursor: zoom-in; }
.monitor-stand { position: absolute; bottom: 10px; left: 41%; width: 18%; height: calc(var(--stand-space) - 10px); background: linear-gradient(90deg, #48464d, #79767e 48%, #333137); clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%); transform-origin: center bottom; transition: transform var(--morph); }
.computer__base { position: absolute; z-index: 2; bottom: 5px; left: 33%; width: 34%; height: 8px; border: 1px solid #8b8592; border-radius: 50% 50% 4px 4px; background: linear-gradient(#8d8994, #4b4651 65%, #27232d); box-shadow: 0 12px 16px #0006; transition: left var(--morph), width var(--morph), height var(--morph), border-radius var(--morph), border-color var(--morph); }
.computer__base span { position: relative; display: block; width: 18%; height: 5px; margin: -1px auto 0; border-radius: 0 0 8px 8px; background: #45414b; opacity: 0; transition: opacity var(--morph); }
.computer:not(.computer--windows) .computer__lid { transform: translateY(calc(var(--stand-space) - var(--base-height) - 9px)) rotateX(-8deg); }
.computer:not(.computer--windows) .monitor-stand { transform: scaleY(0.12); }
.computer:not(.computer--windows) .computer__base { left: -4%; width: 108%; height: var(--base-height); border-color: #b8b4bf; border-radius: 2px 2px 45% 45%; }
.computer:not(.computer--windows) .computer__base span { opacity: 1; }
.computer--macos .computer__lid { border-color: #bcc8b2; border-radius: 18px 18px 8px 8px; }
.computer.computer--macos .computer__lid { transform: translateY(calc(var(--stand-space) - var(--base-height) - 9px)) rotateX(-3deg); }
.computer.computer--macos .computer__base { border-color: #d2ddc8; border-radius: 4px 4px 35% 35%; }
.computer--macos .computer__lid::before, .computer--macos .computer__base::before { opacity: 1; }
.pixel-watch { position: relative; display: grid; width: 100%; aspect-ratio: 0.6; align-items: center; filter: drop-shadow(0 14px 10px #0007); transform: rotate(-7deg); }
.watch-strap { position: absolute; top: 0; bottom: 0; left: 18%; right: 18%; border: 1px solid #575d53; border-radius: 22%; background: linear-gradient(90deg, #242923, #41483b 45%, #252b23); }
.watch-strap::after { content: ''; position: absolute; left: 43%; bottom: 4%; width: 14%; height: 18%; background: radial-gradient(ellipse, #131711 30%, transparent 40%) center / 100% 7px; }
.watch-case { position: relative; aspect-ratio: 1; border: 1px solid #b3b5aa; border-radius: 50%; background: linear-gradient(140deg, #c1c5b8, #444a40 20%, #060806 52%, #5b6255 87%, #a4ac9c); box-shadow: inset 1px 2px 2px #e6edde70, 0 2px 3px #000; }
.watch-screen { position: absolute; inset: 5%; width: 90%; height: 90%; padding: 0; border: 2px solid #020302; border-radius: 50%; overflow: hidden; background: #090b09; cursor: zoom-in; }
.watch-crown { position: absolute; right: -6%; top: 40%; width: 8%; height: 18%; border: 1px solid #969e8f; border-radius: 2px 4px 4px 2px; background: repeating-linear-gradient(0deg, #495043 0 1px, #89917f 1px 2px); }
.device--watch figcaption { margin-top: 25px; }.device--watch figcaption strong { font-size: 0.65rem; }
/* Both faces stay mounted; only the hinge and centering transforms change, never page layout. */
.fold-footprint { position: relative; aspect-ratio: 2076 / 2152; perspective: 1100px; }
.fold-device { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; transform-style: preserve-3d; }
.fold-body { position: absolute; inset: 0; transform-style: preserve-3d; transform: translateX(0) rotateY(-9deg) rotateZ(1.5deg); transition: transform 850ms cubic-bezier(0.4, 0, 0.2, 1); }
.fold-leaf { position: absolute; top: 0; bottom: 0; width: 50%; transform-style: preserve-3d; }
.fold-leaf--right { right: 0; }
.fold-leaf--turning { left: 0; transform-origin: right center; transform: rotateY(0deg); transition: transform 850ms cubic-bezier(0.4, 0, 0.2, 1); }
.fold-face { position: absolute; inset: 0; backface-visibility: hidden; background: linear-gradient(100deg, #71796e, #b1b9a9 2%, #454d41 5%, #3a4036 93%, #c3ccbb); box-shadow: 0 18px 28px #0005; }
.fold-face--left { border-radius: 11% 0 0 11% / 5.3% 0 0 5.3%; transform: translateZ(1px); }
.fold-face--right { border-radius: 0 11% 11% 0 / 0 5.3% 5.3% 0; }
.fold-face--cover { border-radius: 11% / 5.3%; transform: rotateY(180deg) translateZ(1px); }
.fold-viewport { position: absolute; inset: 2px; overflow: hidden; border-radius: inherit; background: #141217; }
.fold-face--left .fold-viewport { right: 0; }.fold-face--right .fold-viewport { left: 0; }
.fold-capture { position: absolute; inset-block: 0; width: 200%; }.fold-face--right .fold-capture { right: 0; }
.fold-face::after { content: ''; position: absolute; inset: 2px; border-radius: inherit; background: linear-gradient(90deg, #0008, #0001); opacity: 0; pointer-events: none; transition: opacity 850ms cubic-bezier(0.4, 0, 0.2, 1); }
.fold-face--cover::after { opacity: 0.7; }
.is-folded .fold-body { transform: translateX(-25%) rotateY(-9deg) rotateZ(1.5deg); }
.is-folded .fold-leaf--turning { transform: rotateY(180deg); }
.is-folded .fold-face--left::after, .is-folded .fold-face--right::after { opacity: 1; }.is-folded .fold-face--cover::after { opacity: 0; }
.fold-body .hardware-button { background: linear-gradient(90deg, #46513d, #b2bfa6, #57654c); }.fold-body .hardware-button--power { top: 20%; height: 10%; }.hardware-button--volume { top: 35%; right: -3px; height: 18%; }
.fold-hinge { position: absolute; top: 2%; bottom: 2%; left: calc(50% - 2px); width: 4px; border-radius: 2px; background: linear-gradient(90deg, #0003, #c4ccbc33, #0004); }
.punch-camera { position: absolute; top: 4%; right: calc(50% - 2px); width: 5px; height: 5px; border-radius: 50%; border: 1px solid #292c33; background: radial-gradient(circle at 35% 35%, #2c3751, #030405 60%); pointer-events: none; }
.fold-caption { display: grid; }.fold-caption > span { grid-area: 1 / 1; }.fold-caption > span[aria-hidden='true'] { visibility: hidden; }
.showcase__footer { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 28px; }
.showcase__footer p { display: flex; align-items: center; gap: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 0.75rem; }.showcase__footer .material-symbols-rounded { font-size: 16px; }
.fold-toggle { display: flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 10px; width: 180px; min-height: 44px; white-space: nowrap; padding: 8px 16px; border: 0; border-radius: 999px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-primary); cursor: pointer; font-size: 0.8rem; font-weight: 650; }
.fold-toggle:hover { background: var(--md-sys-color-surface-container-high); }.fold-toggle__icon { flex: 0 0 20px; height: 18px; border: 1.5px solid currentColor; border-radius: 3px; background: linear-gradient(90deg, transparent 47%, currentColor 48% 52%, transparent 53%); transition: transform 850ms var(--md-sys-motion-standard); }.fold-toggle__icon.is-folded { transform: scaleX(0.55); }
.showcase__note { margin-top: 14px; color: var(--md-sys-color-on-surface-variant); font-size: 0.7rem; text-align: center; }
.showcase__benefits { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px 38px; margin-top: 28px; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }.showcase__benefits > span { display: flex; align-items: center; gap: 8px; }.showcase__benefits i { width: 7px; height: 7px; border-radius: 2px; background: var(--md-sys-color-primary); transform: rotate(45deg); }.showcase__benefits > span:nth-child(2) i { background: var(--md-sys-color-secondary); }.showcase__benefits > span:nth-child(3) i { background: var(--md-sys-color-tertiary); }
.preview-dialog { position: fixed; inset: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 64px 20px; overflow: hidden; border: 0; background: transparent; color: var(--md-sys-color-on-surface); opacity: 0; transition: opacity 280ms, display 280ms allow-discrete, overlay 280ms allow-discrete; }
.preview-dialog[open] { display: grid; place-items: center; opacity: 1; }
.preview-dialog::backdrop { background: #050307c9; backdrop-filter: blur(8px); opacity: 0; transition: opacity 280ms, display 280ms allow-discrete, overlay 280ms allow-discrete; }
.preview-dialog[open]::backdrop { opacity: 1; }
.preview-dialog__close { position: absolute; z-index: 1; top: 12px; right: 12px; }
.preview-dialog__screen { width: min(100%, calc((100dvh - 128px) * var(--preview-ratio))); aspect-ratio: var(--preview-ratio); overflow: hidden; border-radius: 4px; box-shadow: 0 24px 80px #0006; transform: scale(0.92); transition: transform 280ms var(--md-sys-motion-expressive); }
.preview-dialog[open] .preview-dialog__screen { transform: scale(1); }
.preview-dialog__screen--desktop { --preview-ratio: 2000 / 1091; }
.preview-dialog__screen--phone { --preview-ratio: 1320 / 2868; }
.preview-dialog__screen--cover { --preview-ratio: 1080 / 2364; }
.preview-dialog__screen--fold { --preview-ratio: 2076 / 2152; }
.preview-dialog__screen--watch { --preview-ratio: 1; max-width: 560px; border-radius: 50%; }
@starting-style {
  .preview-dialog[open], .preview-dialog[open]::backdrop { opacity: 0; }
  .preview-dialog[open] .preview-dialog__screen { transform: scale(0.92); }
}
@media (min-width: 1101px) { .device--iphone { padding-bottom: 9px; }.device--desktop { padding-bottom: 36px; }.device--fold { padding-bottom: 8px; } }
@media (max-width: 1100px) {
  .device-stage { grid-template-columns: minmax(0, 1fr) minmax(0, 0.6fr) minmax(0, 1.4fr); gap: 36px 7%; padding: 20px 6% 28px; }
  .device--desktop { grid-row: 1; grid-column: 1 / -1; width: 85%; justify-self: center; }.device--iphone { grid-row: 2; max-width: 200px; width: 100%; justify-self: center; }.device--watch { grid-row: 2; width: 100%; max-width: 115px; justify-self: center; }.device--fold { grid-row: 2; width: 100%; max-width: 300px; justify-self: center; }
  .device figcaption strong { font-size: 0.8rem; }.device figcaption > span { font-size: 0.65rem; }.device--watch figcaption strong { font-size: 0.7rem; }.device--desktop figcaption { margin-top: 15px; min-height: 0; }
  .computer { --stand-space: 55px; }.stage-orbit { height: 45%; top: 35%; }
}
@media (max-width: 700px) {
  .showcase { padding: 24px 0 64px; }.showcase__heading { grid-template-columns: 1fr; gap: 20px; }.showcase__heading > p { max-width: 40ch; font-size: 0.96rem; }.showcase__heading .section-label { font-size: 0.6rem; }
  .showcase__studio { border-radius: 24px; }.showcase__toolbar { flex-direction: column; gap: 12px; padding: 18px 12px 8px; }.segmented { width: 100%; max-width: 370px; }.segmented button { flex: 1; padding-inline: 10px; }.view-switch button { min-height: 40px; padding: 8px 20px; }
  .device-stage { grid-template-columns: 30% 17% 43%; column-gap: 5%; row-gap: 28px; padding: 20px 16px 12px; }.device--desktop { width: 96%; }.device figcaption { margin-top: 18px; min-height: 52px; }.device figcaption strong, .device--watch figcaption strong { font-size: 0.65rem; }.device figcaption > span { font-size: 0.57rem; }.device--desktop figcaption { min-height: 0; }
  .punch-camera { width: 4px; height: 4px; }.hardware-button { width: 2px; }.watch-screen { border-width: 1px; }
  .computer__lid { padding: 9px 5px 5px; border-radius: 10px 10px 5px 5px; }.webcam { top: 3px; width: 3px; height: 3px; }.computer { --stand-space: 40px; --base-height: 12px; }
  .showcase__footer { padding: 12px 16px; }.showcase__footer p { font-size: 0.65rem; max-width: 19ch; }.showcase__footer p .material-symbols-rounded { display: none; }.fold-toggle { width: 150px; padding-inline: 12px; font-size: 0.72rem; white-space: nowrap; }.showcase__benefits { gap: 12px 20px; font-size: 0.7rem; }
}
@media (prefers-reduced-motion: reduce) { .computer__lid, .computer__lid::before, .computer__base, .computer__base::before, .computer__base span, .monitor-stand, .fold-body, .fold-leaf, .fold-face::after, .fold-toggle__icon, .preview-dialog, .preview-dialog::backdrop, .preview-dialog__screen { transition: none; } }
@media (forced-colors: active) { .segmented button[aria-pressed='true'], .view-switch button[aria-pressed='true'] { outline: 2px solid Highlight; }.phone, .computer__lid, .watch-case { border-color: CanvasText; } }
</style>
