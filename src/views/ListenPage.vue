<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from '../components/DownloadDialog.vue'

const route = useRoute()
const copied = ref(false)
const code = computed(() => typeof route.query.code === 'string' ? route.query.code : '')
const openInAppUrl = computed(() => code.value ? `${window.location.origin}/listen?code=${encodeURIComponent(code.value)}` : '#')

async function copyCode() {
  if (!code.value) return

  try {
    await navigator.clipboard.writeText(code.value)
  } catch {
    const input = document.createElement('input')
    input.value = code.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }

  copied.value = true
  window.setTimeout(() => { copied.value = false }, 2000)
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
        <button type="button" class="btn btn-tonal btn-lg" :aria-label="copied ? 'Room code copied' : 'Copy room code'" @click="copyCode">
          <span class="material-symbols-rounded" aria-hidden="true">{{ copied ? 'check' : 'content_copy' }}</span>
          {{ copied ? 'Copied' : 'Copy code' }}
        </button>
      </section>

      <section v-else class="listen__empty">
        <span class="material-symbols-rounded" aria-hidden="true">link_off</span>
        <div><h2>No room code found</h2><p>Use a Listen Together link shared from Metrolist.</p></div>
      </section>

      <div class="listen__guides">
        <article>
          <div class="listen__guide-top"><span class="material-symbols-rounded" aria-hidden="true">open_in_new</span><small>Step 1</small></div>
          <h2>Open in Metrolist</h2>
          <p>Set Metrolist as the default app for links from <strong>metrolist.meowery.eu</strong>.</p>
          <ol>
            <li>Choose Open in Metrolist below.</li>
            <li>Select Metrolist, then choose Always.</li>
            <li>If asked, allow supported links in your system app settings.</li>
          </ol>
          <a v-if="code" :href="openInAppUrl" class="btn btn-filled btn-lg">
            <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
            Open in Metrolist
          </a>
        </article>

        <article>
          <div class="listen__guide-top"><span class="material-symbols-rounded" aria-hidden="true">download</span><small>Step 2</small></div>
          <h2>Install the app</h2>
          <p>Metrolist is available for Android, Linux, macOS, and Windows from GitHub.</p>
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
  font-size: 1.08rem;
  font-weight: 750;
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
  font-size: clamp(3.8rem, 8vw, 7rem);
  font-weight: 760;
  letter-spacing: -0.065em;
  line-height: 0.9;
}

.listen h1 span {
  color: var(--md-sys-color-primary);
}

.listen__hero > div > p:last-child {
  max-width: 600px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.06rem;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.listen__room > div > span {
  font-size: 0.76rem;
  font-weight: 730;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.listen__room strong {
  font-family: ui-monospace, monospace;
  font-size: clamp(2.2rem, 7vw, 4.2rem);
  letter-spacing: 0.12em;
  line-height: 1;
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
  font-size: 1.25rem;
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
  font-size: 0.72rem;
  font-weight: 720;
  text-transform: uppercase;
}

.listen__guides h2 {
  margin: 34px 0 10px;
  font-size: 1.6rem;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.listen__guides p,
.listen__guides ol {
  color: color-mix(in srgb, currentColor 76%, transparent);
  font-size: 0.92rem;
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
  margin-top: auto;
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
