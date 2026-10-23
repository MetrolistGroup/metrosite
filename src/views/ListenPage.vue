<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from '../components/DownloadDialog.vue'
import { copyRoomCode, listenAppUrl, roomCodeFromQuery } from '../content/listen'

const route = useRoute()
const copyStatus = ref('')
const copying = ref(false)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined
// The page is prerendered without a query, so read the room code only after hydration.
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })
const code = computed(() => hydrated.value ? roomCodeFromQuery(route.query.code) : '')
const invalidCode = computed(() => hydrated.value && route.query.code !== undefined && !code.value)
const openInAppUrl = computed(() => code.value ? listenAppUrl(code.value, navigator.userAgent, navigator.maxTouchPoints) : '')
const androidLink = computed(() => openInAppUrl.value.startsWith('https:'))

function clearFeedback() {
  clearTimeout(feedbackTimer)
  copyStatus.value = ''
}
watch(code, clearFeedback)
onUnmounted(() => {
  hydrated.value = false
  clearFeedback()
})

async function copyCode() {
  if (!code.value || copying.value) return
  const room = code.value
  clearFeedback()
  copying.value = true
  const success = await copyRoomCode(room)
  copying.value = false
  if (!hydrated.value || code.value !== room) return
  copyStatus.value = success ? 'success' : 'error'
  if (success) feedbackTimer = setTimeout(clearFeedback, 2000)
}
</script>

<template>
  <main id="main" class="listen">
    <div class="container listen__inner">
      <nav class="listen__nav" aria-label="Listen page navigation">
        <RouterLink to="/" class="listen__brand">
          <span><img src="/logo.svg" alt="" width="28" height="28" /></span>
          Metrolist
        </RouterLink>
        <RouterLink to="/" class="btn btn-outlined">
          <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>
          Home
        </RouterLink>
      </nav>

      <header class="listen__hero">
        <div>
          <p class="section-label"><span class="material-symbols-rounded" aria-hidden="true">groups</span>Listen Together</p>
          <h1>Join the <span>same room.</span></h1>
          <p>Open this invitation on a device with Metrolist to keep playback synchronized with friends.</p>
        </div>
        <span class="listen__hero-icon material-symbols-rounded" aria-hidden="true">groups</span>
      </header>

      <section v-if="code" class="listen__room" aria-labelledby="room-code-title">
        <div>
          <span id="room-code-title">Room code</span>
          <strong>{{ code }}</strong>
        </div>
        <button type="button" class="btn btn-tonal btn-lg" :aria-disabled="copying" @click="copyCode">
          <span class="material-symbols-rounded" aria-hidden="true">{{ copyStatus === 'success' ? 'check' : 'content_copy' }}</span>
          {{ copying ? 'Copying…' : copyStatus === 'success' ? 'Copied' : 'Copy code' }}
        </button>
      </section>

      <section v-else class="listen__empty">
        <span class="material-symbols-rounded" aria-hidden="true">link_off</span>
        <div><h2>{{ invalidCode ? 'Invalid room code' : 'No room code found' }}</h2><p>Use a Listen Together link shared from Metrolist. Room codes contain six or eight letters and numbers.</p></div>
      </section>
      <p class="listen__feedback" role="status" aria-atomic="true">{{ copyStatus === 'success' ? 'Room code copied.' : copyStatus === 'error' ? 'Could not copy the room code. Select the code above and copy it manually.' : '' }}</p>

      <div class="listen__guides">
        <article>
          <div class="listen__guide-top"><span class="material-symbols-rounded" aria-hidden="true">open_in_new</span><small>Step 1</small></div>
          <h2>Join in Metrolist</h2>
          <p>Copy the room code, then open Metrolist on your device.</p>
          <ol>
            <li>Open Listen Together in the app.</li>
            <li>Choose Join room and paste or type the code.</li>
            <li>If the code is not accepted, ask the host for a new invitation and check that your app versions are compatible.</li>
          </ol>
          <template v-if="openInAppUrl">
            <p v-if="androidLink">On Android, you can also try the invitation link. Allow Metrolist to open supported links from <strong>metrolist.cc</strong> in system app settings. If this page reopens or the room does not appear, join manually above.</p>
            <p v-else>On iPhone or iPad with Metrolist installed, try opening this room directly. If it does not open, join manually above.</p>
            <a :href="openInAppUrl" class="btn btn-filled btn-lg">
              <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
              {{ androidLink ? 'Try Android app link' : 'Open in Metrolist' }}
            </a>
          </template>
        </article>

        <article>
          <div class="listen__guide-top"><span class="material-symbols-rounded" aria-hidden="true">download</span><small>Step 2</small></div>
          <h2>Install the app</h2>
          <p>Metrolist is available for Android, iOS, Linux, macOS, and Windows from GitHub.</p>
          <DownloadDialog label="Choose a build" button-class="btn btn-outlined btn-lg" />
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.listen {
  min-height: 100vh;
  padding-bottom: 80px;
  background: var(--md-sys-color-surface);
}

.listen__inner {
  max-width: 1040px;
}

.listen__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.listen__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
  text-decoration: none;
}

.listen__brand > span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 16px 16px 8px 16px;
  background: var(--md-sys-color-primary-container);
}

.listen__brand img {
  width: 27px;
  height: 27px;
}

.listen__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 48px;
  align-items: end;
  padding: clamp(32px, 6vw, 64px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.listen h1 {
  margin: 24px 0;
  font: var(--md-sys-typescale-display-large);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
}

.listen h1 span {
  color: var(--md-sys-color-primary);
}

.listen__hero > div > p:last-child {
  max-width: 600px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.listen__hero-icon {
  width: 160px;
  height: 160px;
  border-radius: 48px 48px 18px 48px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-size: 76px;
}

.listen__room,
.listen__empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  min-height: 170px;
  margin-top: 16px;
  padding: 30px 36px;
  border-radius: 16px 40px 40px 40px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.listen__room > div {
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.listen__room > div > span {
  font: var(--md-sys-typescale-label-small);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.listen__room strong {
  overflow-wrap: anywhere;
  user-select: text;
  font-family: ui-monospace, monospace;
  font-size: clamp(2.2rem, 7vw, 4.2rem);
  letter-spacing: 0.12em;
  line-height: 1;
}

.listen__room > button {
  flex-shrink: 0;
}

.listen__feedback {
  margin-top: 12px;
}

.listen__empty {
  justify-content: flex-start;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.listen__empty > .material-symbols-rounded {
  width: 56px;
  height: 56px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-primary);
  font-size: 30px;
}

.listen__empty h2 {
  margin-bottom: 4px;
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
}

.listen__empty p {
  color: var(--md-sys-color-on-surface-variant);
}

.listen__guides {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.listen__guides article {
  display: flex;
  min-height: 440px;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  border-radius: 40px 40px 16px 40px;
  background: var(--md-sys-color-surface-container-high);
}

.listen__guides article:nth-child(2) {
  border-radius: 40px 16px 40px 40px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.listen__guide-top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.listen__guide-top > span {
  width: 56px;
  height: 56px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: color-mix(in srgb, currentColor 12%, transparent);
  font-size: 30px;
}

.listen__guide-top small {
  padding: 7px 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
  font: var(--md-sys-typescale-label-small);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.listen__guides h2 {
  margin: 34px 0 10px;
  font: var(--md-sys-typescale-headline-small);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.listen__guides p,
.listen__guides ol {
  color: color-mix(in srgb, currentColor 76%, transparent);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.listen__guides p strong,
.listen__guides li::marker {
  color: currentColor;
}

.listen__guides ol {
  margin: 20px 0 28px 1.2rem;
}

.listen__guides li + li {
  margin-top: 8px;
}

.listen__guides .btn {
  margin-top: 24px;
}

@media (max-width: 760px) {
  .listen {
    padding-bottom: 54px;
  }

  .listen__nav {
    min-height: 72px;
  }

  .listen__nav .btn {
    min-width: 48px;
    padding-inline: 14px;
  }

  .listen__hero {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    border-radius: 32px 32px 14px 32px;
  }

  .listen__hero-icon {
    width: 92px;
    height: 92px;
    border-radius: 28px 28px 10px 28px;
    font-size: 46px;
  }

  .listen__room,
  .listen__empty {
    align-items: flex-start;
    flex-direction: column;
    padding: 26px 24px;
  }

  .listen__guides {
    grid-template-columns: 1fr;
  }

  .listen__guides article {
    min-height: 0;
    padding: 28px 24px;
  }

  .listen__guides .btn {
    margin-top: 26px;
  }
}
</style>
