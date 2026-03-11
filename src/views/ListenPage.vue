<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const copied = ref(false)

const code = computed(() => {
  const c = route.query.code
  return typeof c === 'string' ? c : ''
})

const openInAppUrl = computed(() =>
  code.value
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/listen?code=${encodeURIComponent(code.value)}`
    : '#'
)

async function copyCode() {
  if (!code.value) return
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback: select and copy
    const el = document.createElement('input')
    el.value = code.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <main id="main" class="listen">
    <div class="listen__bg" aria-hidden="true" />
    <div class="container listen__inner">
      <RouterLink to="/" class="listen__back">
        <span class="icon" aria-hidden="true">arrow_back</span>
        Back to home
      </RouterLink>

      <header class="listen__header">
        <p class="listen__kicker">Join the room</p>
        <h1 class="listen__title">Listen together</h1>
        <p class="listen__sub">
          Open this link on a device with Metrolist to sync playback with friends in real time.
        </p>
      </header>

      <!-- Room code — hero moment -->
      <div v-if="code" class="listen__code-block" :class="{ 'listen__code-block--copied': copied }">
        <span class="listen__code-label">Room code</span>
        <div class="listen__code-display">
          <span class="listen__code-value">{{ code }}</span>
          <button type="button" class="listen__copy-btn" :aria-label="copied ? 'Copied' : 'Copy code'"
            @click="copyCode">
            <span class="icon" aria-hidden="true">{{ copied ? 'check' : 'content_copy' }}</span>
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </div>
      <div v-else class="listen__code-empty">
        <span class="icon" aria-hidden="true">link_off</span>
        <p>No room code in this link. Use a Listen link shared from Metrolist.</p>
      </div>

      <!-- Two-column: Open in app + Download -->
      <div class="listen__cards">
        <article class="listen__card listen__card--open" data-step="1">
          <div class="listen__card-icon-wrap listen__card-icon-wrap--primary">
            <span class="icon" aria-hidden="true">music_note</span>
          </div>
          <h2 class="listen__card-title">Open in Metrolist</h2>
          <p class="listen__card-body">
            Set Metrolist as the default for <strong>metrolist.meowery.eu</strong> so Listen links open in the app.
          </p>
          <ol class="listen__steps">
            <li>Tap <strong>Open in Metrolist</strong> below (or any Listen link).</li>
            <li>Choose <strong>Metrolist</strong> → <strong>Always</strong>.</li>
            <li>Or: <strong>Settings → Apps → Metrolist → Open by default</strong> → enable for this domain.</li>
          </ol>
          <a v-if="code" :href="openInAppUrl" class="btn btn-filled btn-lg listen__cta" target="_self"
            rel="noopener noreferrer">
            <span class="icon" aria-hidden="true">open_in_new</span>
            Open in Metrolist
          </a>
        </article>

        <article class="listen__card listen__card--download" data-step="2">
          <div class="listen__card-icon-wrap listen__card-icon-wrap--tertiary">
            <span class="icon" aria-hidden="true">download</span>
          </div>
          <h2 class="listen__card-title">No app yet?</h2>
          <p class="listen__card-body">
            Install Metrolist from GitHub, then come back and open the link above.
          </p>
          <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="btn btn-filled btn-lg" target="_blank"
            rel="noopener noreferrer">
            <span class="icon" aria-hidden="true">download</span>
            Download Metrolist
          </a>
        </article>
      </div>

      <div class="listen__features">
        <span class="listen__pill">
          <span class="icon" aria-hidden="true">groups</span>
          Synchronized
        </span>
        <span class="listen__pill">
          <span class="icon" aria-hidden="true">bolt</span>
          Blazingly fast
        </span>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* M3 Expressive: ambient bg, bold type, generous shape */
.listen {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 0 48px;
  overflow-x: hidden;
}

@media (min-width: 480px) {
  .listen {
    padding: 40px 0 100px;
  }
}

.listen__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 60% at 90% 20%, var(--md-primary-container) 0%, transparent 55%),
    radial-gradient(ellipse 60% 70% at 10% 80%, var(--md-tertiary-container) 0%, transparent 50%),
    radial-gradient(ellipse 50% 50% at 50% 50%, var(--md-secondary-container) 0%, transparent 60%);
  pointer-events: none;
}

.listen__inner {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (min-width: 480px) {
  .listen__inner {
    padding: 0 24px;
  }
}

.listen__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 8px 14px;
  border-radius: var(--r-full);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--md-primary);
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast);
}

@media (min-width: 480px) {
  .listen__back {
    margin-bottom: 40px;
  }
}

.listen__back:hover {
  background: color-mix(in srgb, var(--md-primary) 14%, transparent);
  color: var(--md-on-primary-container);
}

.listen__back .icon {
  font-size: 1.25rem;
}

/* Header — display typography */
.listen__header {
  margin-bottom: 28px;
}

@media (min-width: 480px) {
  .listen__header {
    margin-bottom: 44px;
  }
}

.listen__kicker {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--md-primary);
  margin-bottom: 8px;
}

.listen__title {
  font-family: 'Climate Crisis', cursive;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--md-primary) 0%, var(--md-tertiary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.listen__sub {
  font-size: 1.125rem;
  color: var(--md-on-surface-variant);
  line-height: 1.6;
  max-width: 42ch;
}

/* Room code — hero block, extra-large shape */
.listen__code-block {
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  border-radius: var(--r-2xl);
  padding: 24px 20px;
  margin-bottom: 24px;
  animation: listen-enter 0.5s cubic-bezier(0.2, 0, 0, 1) backwards;
}

@media (min-width: 480px) {
  .listen__code-block {
    padding: 32px 36px;
    margin-bottom: 32px;
  }
}

.listen__code-block--copied {
  background: color-mix(in srgb, var(--md-primary-container) 95%, var(--md-primary));
}

.listen__code-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  margin-bottom: 12px;
}

.listen__code-display {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.listen__code-value {
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: 0.2em;
  line-height: 1;
}

.listen__copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border: none;
  border-radius: var(--r-full);
  background: rgba(255, 255, 255, 0.22);
  color: inherit;
  font-family: 'Nunito Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--t-fast), transform var(--t-fast);
  -webkit-tap-highlight-color: transparent;
}

.listen__copy-btn:hover {
  background: rgba(255, 255, 255, 0.32);
}

.listen__copy-btn:active {
  transform: scale(0.97);
}

.listen__copy-btn .icon {
  font-size: 1.25rem;
  pointer-events: none;
}

.listen__code-empty {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  margin-bottom: 24px;
  border-radius: var(--r-xl);
  background: var(--md-sc-low);
  color: var(--md-on-surface-variant);
  animation: listen-enter 0.5s cubic-bezier(0.2, 0, 0, 1) 0.05s backwards;
}

@media (min-width: 480px) {
  .listen__code-empty {
    padding: 24px 28px;
    margin-bottom: 32px;
  }
}

.listen__code-empty .icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  opacity: 0.8;
}

.listen__code-empty p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* Cards — two-column on larger screens, staggered motion */
.listen__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

@media (min-width: 620px) {
  .listen__cards {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 36px;
  }
}

.listen__card {
  border-radius: var(--r-2xl);
  padding: 24px 20px;
  background: var(--md-sc);
  animation: listen-enter 0.5s cubic-bezier(0.2, 0, 0, 1) backwards;
}

@media (min-width: 480px) {
  .listen__card {
    padding: 32px 28px;
  }
}

.listen__card[data-step="1"] {
  animation-delay: 0.08s;
}

.listen__card[data-step="2"] {
  animation-delay: 0.14s;
}

.listen__card-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.listen__card-icon-wrap .icon {
  font-size: 1.75rem;
}

.listen__card-icon-wrap--primary {
  background: color-mix(in srgb, var(--md-primary) 28%, transparent);
  color: var(--md-primary);
}

.listen__card-icon-wrap--tertiary {
  background: color-mix(in srgb, var(--md-tertiary) 28%, transparent);
  color: var(--md-tertiary);
}

.listen__card-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--md-on-surface);
  margin-bottom: 10px;
}

.listen__card-body {
  font-size: 0.9375rem;
  color: var(--md-on-surface-variant);
  line-height: 1.65;
  margin-bottom: 16px;
}

.listen__card-body strong {
  color: var(--md-on-surface);
}

.listen__steps {
  margin: 0 0 22px 1.2em;
  padding: 0;
  font-size: 0.875rem;
  color: var(--md-on-surface-variant);
  line-height: 1.75;
}

.listen__steps li {
  margin-bottom: 6px;
}

.listen__steps strong {
  color: var(--md-on-surface);
}

.listen__cta {
  margin-top: 4px;
}

/* Pills — tonal chips */
.listen__features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.listen__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--r-full);
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  font-size: 0.875rem;
  font-weight: 700;
  animation: listen-enter 0.5s cubic-bezier(0.2, 0, 0, 1) 0.2s backwards;
}

.listen__pill .icon {
  font-size: 1.125rem;
}

@keyframes listen-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
