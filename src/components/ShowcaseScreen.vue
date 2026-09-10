<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { findScreenshot, screenshotFiles, SHOWCASE_VIEWS, type DesktopPlatform, type ShowcaseDevice, type ShowcaseView } from '../content/showcase'

const props = defineProps<{
  device: ShowcaseDevice
  view: ShowcaseView
  platform: DesktopPlatform
  folded: boolean
}>()

// Discover supplied captures without requesting missing files or inlining images into JS.
const assets = import.meta.glob<string>('/public/images/kmp/*.{webp,png}', { eager: true, query: '?url&no-inline', import: 'default' })
const source = computed(() => findScreenshot(screenshotFiles(props.device, props.view, props.platform, props.folded), assets))
const displayedSource = ref(source.value)
const failed = ref(false)
// Keep the current capture visible until the next one can actually be painted.
watch(source, async (next, _previous, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  let nextFailed = false
  if (next) {
    const image = new Image()
    image.src = next
    try { await image.decode() } catch { nextFailed = true }
  }
  if (cancelled) return
  displayedSource.value = next
  failed.value = nextFailed
})
function onCaptureError(event: Event) {
  if ((event.target as HTMLImageElement).getAttribute('src') === displayedSource.value) failed.value = true
}
const screenName = computed(() => props.device === 'wear' ? 'Now Playing' : SHOWCASE_VIEWS.find(item => item.key === props.view)!.name)
const platformName = computed(() => props.device === 'desktop' ? props.platform : props.device === 'ios' ? 'iOS' : props.device === 'wear' ? 'Wear OS' : 'Android')
</script>

<template>
  <div class="screen" :class="`screen--${device}`">
    <Transition name="screen-fade">
      <img v-if="displayedSource && !failed" :key="displayedSource" class="screen__capture" :src="displayedSource" :alt="`Metrolist ${screenName} on ${platformName}`" loading="lazy" decoding="async" @error="onCaptureError" />
      <div v-else-if="device === 'wear'" class="watch-preview" role="img" aria-label="Illustrative Metrolist Now Playing screen on Wear OS">
        <span class="watch-time" aria-hidden="true">10:08</span>
        <div class="watch-art" aria-hidden="true" />
        <strong aria-hidden="true">After hours</strong>
        <span class="watch-subtitle" aria-hidden="true">Your daily soundtrack</span>
        <div class="watch-controls" aria-hidden="true"><span>‹</span><span class="play">Ⅱ</span><span>›</span></div>
      </div>
      <div v-else class="screen__missing" role="img" :aria-label="`${screenName} capture for ${platformName} is not available`">
        <img src="/logo.svg" alt="" width="48" height="48" />
        <strong>{{ screenName }}</strong><span>Capture coming soon</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.screen { position: relative; width: 100%; height: 100%; overflow: hidden; container-type: inline-size; background: #141217; color: #f3ebf6; text-align: left; }
.screen__capture { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.screen-fade-enter-active, .screen-fade-leave-active { transition: opacity 240ms var(--md-sys-motion-standard); }
.screen-fade-leave-active { position: absolute; inset: 0; }
.screen-fade-enter-from, .screen-fade-leave-to { opacity: 0; }
.screen__missing { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; gap: 4cqw; padding: 8cqw; background: radial-gradient(ellipse at 50% 20%, #53357155, transparent 70%); text-align: center; }
.screen__missing img { width: 15cqw; height: 15cqw; opacity: 0.8; }.screen__missing strong { font-size: 7cqw; }.screen__missing > span { color: #cec4cf; font-size: 4cqw; }
.screen--desktop .screen__missing { gap: 2cqw; }.screen--desktop .screen__missing img { width: 8cqw; height: 8cqw; }.screen--desktop .screen__missing strong { font-size: 4cqw; }.screen--desktop .screen__missing > span { font-size: 2cqw; }
.watch-preview { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; gap: 3cqw; background: #090b09; text-align: center; line-height: 1.35; }
.watch-time { color: #c3d5b0; font-size: 10cqw; }
.watch-art { width: 27cqw; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(ellipse at 65% 24%, #efd8ff, transparent 40%), repeating-radial-gradient(ellipse at 30% 100%, #826699 0 8%, #aa86b8 9% 12%, #473553 13% 22%); }
.watch-preview strong { font-size: 10cqw; }.watch-subtitle { font-size: 5cqw; color: #b9c3b4; }
.watch-controls { display: flex; gap: 12cqw; align-items: center; font-size: 17cqw; line-height: 1; }.play { display: grid; place-items: center; width: 23cqw; height: 23cqw; border-radius: 50%; background: #c3d5b0; color: #25301e; font-size: 11cqw; }
@media (prefers-reduced-motion: reduce) { .screen-fade-enter-active, .screen-fade-leave-active { transition: none; } }
</style>
