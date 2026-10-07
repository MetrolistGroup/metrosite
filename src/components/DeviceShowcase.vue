<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { SHOWCASE_VIEWS, type ShowcaseDevice, type ShowcaseView } from '../content/showcase'
import ShowcaseScreen from './ShowcaseScreen.vue'

const previews = [
  { device: 'desktop', name: 'Desktop', detail: 'Windows · Linux · macOS', icon: 'desktop_windows', ratio: '2000 / 1091' },
  { device: 'android', name: 'Android', detail: 'The original home of Metrolist', icon: 'android', ratio: '1080 / 2364' },
  { device: 'ios', name: 'iOS', detail: 'Feels right at home on an iPhone', icon: 'apple', ratio: '1320 / 2868' },
  { device: 'wear', name: 'Wear OS', detail: 'Use a watch as your music controller', icon: 'wearos', ratio: '1' },
] as const
const view = ref<ShowcaseView>('home')
const viewName = computed(() => SHOWCASE_VIEWS.find(item => item.key === view.value)!.name)
const dialog = ref<HTMLDialogElement>()
const selectedDevice = ref<ShowcaseDevice>('desktop')
const selected = computed(() => previews.find(item => item.device === selectedDevice.value)!)
const screenProps = computed(() => ({ view: view.value, platform: 'windows' as const, folded: true }))
const dialogContentMounted = ref(false)
let previousOverflow = ''

async function openScreenshot(device: ShowcaseDevice) {
  selectedDevice.value = device
  dialogContentMounted.value = true
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
  <section id="desktop" class="showcase" aria-label="Metrolist on every platform">
    <div class="container">
      <header class="showcase__heading">
        <p>From your wrist to your workspace.<br />A familiar player, with room to be itself on every device.</p>
        <div class="view-switch" role="group" aria-label="App preview">
          <button v-for="screen in SHOWCASE_VIEWS" :key="screen.key" type="button" :aria-pressed="view === screen.key" @click="view = screen.key">{{ screen.name }}</button>
        </div>
      </header>

      <div class="showcase__mosaic">
        <figure v-for="preview in previews" :key="preview.device" class="preview-tile" :class="`preview-tile--${preview.device}`" :style="{ '--preview-ratio': preview.ratio }">
          <figcaption>
            <span class="preview-tile__label"><span v-if="preview.device === 'desktop'" class="material-symbols-rounded" aria-hidden="true">desktop_windows</span><img v-else :src="`/icons/${preview.icon}.svg`" alt="" width="22" height="22" /><strong>{{ preview.name }}</strong></span>
            <span class="preview-tile__detail">{{ preview.detail }}</span>
            <span v-if="preview.device === 'wear'" class="preview-tile__disclaimer">Illustrative player preview</span>
          </figcaption>
          <button class="preview-tile__screen" type="button" :aria-label="`Enlarge ${preview.name} app preview`" aria-haspopup="dialog" @click="openScreenshot(preview.device)">
            <ShowcaseScreen :device="preview.device" v-bind="screenProps" thumbnail aria-hidden="true" />
          </button>
        </figure>
      </div>
      <p class="showcase__note"><span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>Select a screen for a closer look.</p>
    </div>
  </section>

  <Teleport to="body">
    <dialog ref="dialog" class="preview-dialog" :aria-label="`${selected.name} · ${selectedDevice === 'wear' ? 'Now Playing · Illustrative' : viewName} preview`" @close="restoreScroll" @click="(event) => { if (event.target === dialog) dialog?.close() }">
      <form method="dialog" class="preview-dialog__close"><button class="icon-button" aria-label="Close preview" autofocus><span class="material-symbols-rounded" aria-hidden="true">close</span></button></form>
      <div class="preview-dialog__screen" :class="{ 'preview-dialog__screen--watch': selectedDevice === 'wear' }" :style="{ '--preview-ratio': selected.ratio }"><ShowcaseScreen v-if="dialogContentMounted" :key="selectedDevice" :device="selectedDevice" v-bind="screenProps" /></div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.showcase { padding: 44px 0 92px; background: var(--md-sys-color-surface); }
.showcase__heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 28px; }
.showcase__heading > p { max-width: 48ch; color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-large); letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.view-switch { display: flex; flex-shrink: 0; gap: 4px; padding: 5px; border-radius: 999px; background: var(--md-sys-color-surface-container-low); }
.view-switch button { min-height: 44px; padding: 10px 20px; border: 0; border-radius: 999px; background: transparent; color: var(--md-sys-color-on-surface-variant); cursor: pointer; font: var(--md-sys-typescale-label-large); font-variation-settings: 'ROND' 100; letter-spacing: var(--md-sys-typescale-label-large-tracking); transition: background var(--md-motion-effects-default), color var(--md-motion-effects-default); }
.view-switch button[aria-pressed='true'] { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
.view-switch button:hover:not([aria-pressed='true']) { background: var(--md-sys-color-surface-container-high); transition: none; }
.showcase__mosaic { display: grid; grid-template-columns: minmax(0, 2.6fr) repeat(2, minmax(0, 1fr)); grid-template-areas: 'desktop android ios' 'wear android ios'; gap: 14px; }
.preview-tile { display: flex; flex-direction: column; min-width: 0; gap: 24px; padding: 24px; border-radius: 28px; background: var(--md-sys-color-surface-container-low); }
.preview-tile--desktop { grid-area: desktop; background: #282230; border-top-left-radius: 48px; }
.preview-tile--android { grid-area: android; background: #25291f; }
.preview-tile--ios { grid-area: ios; background: #302523; border-top-right-radius: 48px; }
.preview-tile--wear { grid-area: wear; flex-direction: row; align-items: center; justify-content: space-between; background: #29271e; border-bottom-left-radius: 48px; }
.preview-tile figcaption { display: flex; flex-direction: column; gap: 7px; }
.preview-tile__label { display: flex; align-items: center; gap: 9px; color: var(--md-sys-color-primary); }
.preview-tile__label img { width: 22px; height: 22px; object-fit: contain; }
.preview-tile__label strong { font: var(--md-sys-typescale-title-medium); letter-spacing: var(--md-sys-typescale-title-medium-tracking); }
.preview-tile--android .preview-tile__label { color: #c3d5b0; }
.preview-tile--ios .preview-tile__label { color: var(--md-sys-color-tertiary); }
.preview-tile--wear .preview-tile__label { color: var(--md-sys-color-secondary); }
.preview-tile__detail, .preview-tile__disclaimer { color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-small); letter-spacing: var(--md-sys-typescale-body-small-tracking); }
.preview-tile__disclaimer { margin-top: 10px; font: var(--md-sys-typescale-label-small); font-variation-settings: 'ROND' 100; letter-spacing: var(--md-sys-typescale-label-small-tracking); }
.preview-tile__screen { display: block; flex: none; width: 100%; aspect-ratio: var(--preview-ratio); margin-block: auto; padding: 0; overflow: hidden; border: 0; border-radius: 6px; background: #141217; cursor: zoom-in; }
.preview-tile--wear .preview-tile__screen { width: clamp(120px, 13vw, 170px); border-radius: 50%; }
.showcase__note { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; color: var(--md-sys-color-on-surface-variant); font: var(--md-sys-typescale-body-small); letter-spacing: var(--md-sys-typescale-body-small-tracking); }
.showcase__note .material-symbols-rounded { font-size: 18px; }
.preview-dialog { position: fixed; inset: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 64px 20px; overflow: hidden; border: 0; background: transparent; color: var(--md-sys-color-on-surface); opacity: 0; transition: opacity var(--md-motion-exit), display 160ms allow-discrete, overlay 160ms allow-discrete; }
.preview-dialog[open] { display: grid; place-items: center; opacity: 1; transition: opacity var(--md-motion-effects-default), display 570ms allow-discrete, overlay 570ms allow-discrete; }
.preview-dialog::backdrop { background: #050307dc; opacity: 0; transition: opacity var(--md-motion-exit), display 160ms allow-discrete, overlay 160ms allow-discrete; }
.preview-dialog[open]::backdrop { opacity: 1; transition: opacity var(--md-motion-effects-slow), display 300ms allow-discrete, overlay 300ms allow-discrete; }
.preview-dialog__close { position: absolute; z-index: 1; top: 12px; right: 12px; }
.preview-dialog__screen { width: min(100%, calc((100dvh - 128px) * var(--preview-ratio))); aspect-ratio: var(--preview-ratio); overflow: hidden; border-radius: 4px; transform: scale(0.92); transition: transform var(--md-motion-exit); }
.preview-dialog[open] .preview-dialog__screen { transform: scale(1); transition: transform var(--md-motion-spatial-slow); }
.preview-dialog__screen--watch { max-width: 560px; border-radius: 50%; }
@starting-style {
  .preview-dialog[open], .preview-dialog[open]::backdrop { opacity: 0; }
  .preview-dialog[open] .preview-dialog__screen { transform: scale(0.92); }
}
@media (max-width: 1000px) {
  .showcase__mosaic { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: 'desktop desktop' 'android ios' 'wear wear'; }
  .preview-tile--android .preview-tile__screen, .preview-tile--ios .preview-tile__screen { max-width: 240px; align-self: center; }
  .preview-tile--ios { border-top-right-radius: 28px; }
  .preview-tile--desktop { border-top-right-radius: 48px; }
  .preview-tile--wear { border-bottom-right-radius: 48px; }
}
@media (max-width: 700px) {
  .showcase { padding: 24px 0 64px; }
  .showcase__heading { flex-direction: column; align-items: start; gap: 20px; }
  .view-switch { align-self: stretch; }
  .view-switch button { flex: 1; padding-inline: 12px; }
  .showcase__mosaic { gap: 10px; }
  .preview-tile { padding: 16px; gap: 18px; border-radius: 24px; }
  .preview-tile__label { gap: 6px; }
  .preview-tile__label strong { font: var(--md-sys-typescale-title-small); letter-spacing: var(--md-sys-typescale-title-small-tracking); }
  .preview-tile__label .material-symbols-rounded { font-size: 20px; }
  .preview-tile--wear .preview-tile__screen { width: clamp(112px, 25vw, 160px); }
}
@media (forced-colors: active) { .view-switch button[aria-pressed='true'] { outline: 2px solid Highlight; } }
</style>
