<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import wearPreview from '../assets/wear-preview.webp'
import wearPreviewThumbnail from '../assets/wear-preview-thumb.webp?no-inline'
import { findScreenshot, screenshotFiles, SHOWCASE_VIEWS, type DesktopPlatform, type ShowcaseDevice, type ShowcaseView } from '../content/showcase'

const props = defineProps<{
  device: ShowcaseDevice
  view: ShowcaseView
  platform: DesktopPlatform
  folded: boolean
  thumbnail?: boolean
}>()

// Discover supplied captures without requesting missing files or inlining images into JS.
const assets = import.meta.glob<string>('/src/assets/kmp/*.webp', { eager: true, query: '?url&no-inline', import: 'default' })
const source = computed(() => {
  const fullSize = screenshotFiles(props.device, props.view, props.platform, props.folded)
  return findScreenshot(props.thumbnail ? [...screenshotFiles(props.device, props.view, props.platform, props.folded, true), ...fullSize] : fullSize, assets)
})
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
const platformName = computed(() => props.device === 'desktop' ? 'Desktop' : props.device === 'ios' ? 'iOS' : props.device === 'wear' ? 'Wear OS' : 'Android')
</script>

<template>
  <div class="screen" :class="`screen--${device}`">
    <Transition name="screen-fade">
      <img v-if="displayedSource && !failed" :key="displayedSource" class="screen__capture" :src="displayedSource" :alt="`Metrolist ${screenName} on ${platformName}`" loading="lazy" decoding="async" @error="onCaptureError" />
      <div v-else-if="device === 'wear'" class="watch-preview" role="img" aria-label="Illustrative Metrolist Now Playing screen on Wear OS">
        <img :src="thumbnail ? wearPreviewThumbnail : wearPreview" alt="" />
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
.watch-preview { height: 100%; background: #090b09; }
.watch-preview img { width: 100%; height: 100%; object-fit: cover; }
@media (prefers-reduced-motion: reduce) { .screen-fade-enter-active, .screen-fade-leave-active { transition: none; } }
</style>
