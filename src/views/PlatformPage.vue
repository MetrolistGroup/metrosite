<script setup lang="ts">
import { computed } from 'vue'
import DownloadDialog from '../components/DownloadDialog.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
import ShowcaseScreen from '../components/ShowcaseScreen.vue'
import { DOWNLOAD_PLATFORMS, type DownloadPlatformKey } from '../content/downloads'
import { FEATURES } from '../content/features'
import { PLATFORM_PAGES } from '../content/site'

const props = defineProps<{ platform: DownloadPlatformKey }>()

const platform = computed(() => DOWNLOAD_PLATFORMS.find(({ key }) => key === props.platform)!)
const page = computed(() => PLATFORM_PAGES[props.platform])
const others = computed(() => DOWNLOAD_PLATFORMS.filter(({ key }) => key !== props.platform))
const screen = computed(() => {
  if (props.platform === 'android') return { device: 'android', ratio: '1080 / 2364' } as const
  if (props.platform === 'ios') return { device: 'ios', ratio: '1320 / 2868' } as const
  return { device: 'desktop', ratio: '2000 / 1091' } as const
})
const desktopPlatform = computed(() => props.platform === 'linux' || props.platform === 'macos' ? props.platform : 'windows')
</script>

<template>
  <NavBar />
  <main id="main" class="platform-page" :class="`platform-page--${screen.device}`">
    <div class="container">
      <nav class="platform-page__crumbs" aria-label="Breadcrumb">
        <ol>
          <li><RouterLink to="/">Metrolist</RouterLink></li>
          <li><RouterLink :to="{ path: '/', hash: '#platforms' }">Download</RouterLink></li>
          <li><span aria-current="page">{{ platform.name }}</span></li>
        </ol>
      </nav>

      <header class="platform-page__hero">
        <div class="platform-page__copy">
          <p class="platform-page__eyebrow"><img :src="`/icons/${platform.icon}.svg`" alt="" width="22" height="22" />Metrolist for {{ platform.name }}</p>
          <h1>{{ page.heading }}</h1>
          <p class="platform-page__lede">{{ page.lede }}</p>
          <div class="platform-page__actions">
            <DownloadDialog :platform="platform.key" :label="`Download for ${platform.name}`" button-class="btn btn-filled btn-lg" />
            <RouterLink to="/compare" class="btn btn-outlined btn-lg">Compare with YouTube Music</RouterLink>
          </div>
          <ul class="platform-page__requirements" aria-label="Requirements">
            <li v-for="item in page.requirements" :key="item">{{ item }}</li>
          </ul>
        </div>
        <figure class="platform-page__screen" :style="{ '--ratio': screen.ratio }">
          <ShowcaseScreen :device="screen.device" view="player" :platform="desktopPlatform" folded />
        </figure>
      </header>

      <section class="platform-page__install" aria-labelledby="install-title">
        <h2 id="install-title">Install Metrolist on {{ platform.name }}</h2>
        <ol>
          <li v-for="step in platform.instructions" :key="step">{{ step }}</li>
        </ol>
        <p>
          {{ platform.package }} for {{ platform.architectures.map(({ name }) => name).join(' and ') }}. Official builds come only from
          <a href="https://github.com/MetrolistGroup/Metrolist/releases/latest" target="_blank" rel="noopener noreferrer">GitHub Releases</a>.
        </p>
      </section>

      <section class="platform-page__features" aria-labelledby="features-title">
        <h2 id="features-title">What you get on {{ platform.name }}</h2>
        <dl>
          <div v-for="feature in FEATURES" :key="feature.label">
            <dt><span class="material-symbols-rounded" aria-hidden="true">{{ feature.icon }}</span>{{ feature.label }}</dt>
            <dd>{{ feature.body }}</dd>
          </div>
        </dl>
      </section>

      <section class="platform-page__faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{{ platform.name }} questions</h2>
        <details v-for="item in page.faq" :key="item.question">
          <summary>{{ item.question }}<span class="material-symbols-rounded" aria-hidden="true">add</span></summary>
          <p>{{ item.answer }}</p>
        </details>
        <p class="platform-page__more">More answers in the <RouterLink to="/faq">Metrolist FAQ</RouterLink>.</p>
      </section>

      <nav class="platform-page__others" aria-labelledby="others-title">
        <h2 id="others-title">Metrolist on other devices</h2>
        <ul>
          <li v-for="other in others" :key="other.key">
            <RouterLink :to="`/download/${other.key}`">
              <img :src="`/icons/${other.icon}.svg`" alt="" width="26" height="26" />
              <span><strong>{{ PLATFORM_PAGES[other.key].linkLabel }}</strong><small>{{ other.detail }} · {{ other.package }}</small></span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.platform-page {
  padding: 20px 0 112px;
  background: var(--md-sys-color-surface);
}

.platform-page__crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  list-style: none;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.82rem;
}

.platform-page__crumbs li + li::before {
  content: '/';
  margin-right: 8px;
  color: var(--md-sys-color-outline);
}

.platform-page__crumbs a {
  color: inherit;
}

.platform-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
  padding: clamp(32px, 6vw, 72px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.platform-page--desktop .platform-page__hero {
  grid-template-columns: 1fr;
}

.platform-page__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--md-sys-color-primary);
  font-weight: 720;
}

.platform-page__eyebrow img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.platform-page h1 {
  max-width: 15ch;
  margin: 18px 0 22px;
  font-size: clamp(2.8rem, 6.4vw, 5.6rem);
  font-weight: 760;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.platform-page__lede {
  max-width: 62ch;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.08rem;
}

.platform-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.platform-page__requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 26px;
  list-style: none;
}

.platform-page__requirements li {
  padding: 7px 14px;
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.82rem;
}

.platform-page__screen {
  justify-self: center;
  width: 100%;
  max-width: 300px;
  aspect-ratio: var(--ratio);
  overflow: hidden;
  border-radius: 28px;
}

.platform-page--desktop .platform-page__screen {
  max-width: none;
  border-radius: 10px;
}

.platform-page section,
.platform-page__others {
  margin-top: 24px;
  padding: clamp(28px, 5vw, 56px);
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-low);
}

.platform-page h2 {
  margin-bottom: 24px;
  font-size: clamp(1.7rem, 3.4vw, 2.6rem);
  font-weight: 740;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.platform-page__install ol {
  display: grid;
  gap: 4px;
  counter-reset: step;
  list-style: none;
}

.platform-page__install li {
  display: grid;
  grid-template-columns: 52px 1fr;
  align-items: center;
  min-height: 64px;
  padding: 8px 20px 8px 8px;
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-high);
  counter-increment: step;
  font-size: 1.02rem;
}

.platform-page__install li::before {
  content: counter(step);
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 14px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-weight: 760;
}

.platform-page__install p,
.platform-page__more {
  margin-top: 18px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

.platform-page a:not(.btn) {
  color: var(--md-sys-color-primary);
}

.platform-page__features dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 40px;
}

.platform-page__features dt {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-weight: 720;
}

.platform-page__features dt .material-symbols-rounded {
  color: var(--md-sys-color-primary);
}

.platform-page__features dd {
  color: var(--md-sys-color-on-surface-variant);
}

.platform-page__faq details {
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-high);
}

.platform-page__faq details + details {
  margin-top: 6px;
}

.platform-page__faq summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 680;
  list-style: none;
}

.platform-page__faq summary::-webkit-details-marker {
  display: none;
}

.platform-page__faq details[open] summary .material-symbols-rounded {
  transform: rotate(45deg);
}

.platform-page__faq summary .material-symbols-rounded {
  transition: transform var(--md-motion-spatial-fast);
}

.platform-page__faq details p {
  max-width: 72ch;
  padding: 0 20px 22px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.65;
}

.platform-page__others ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  list-style: none;
}

.platform-page__others a {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  padding: 12px 18px;
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface) !important;
  text-decoration: none;
}

.platform-page__others a:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.platform-page__others img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.platform-page__others span {
  display: flex;
  flex-direction: column;
}

.platform-page__others small {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8rem;
}

@media (max-width: 860px) {
  .platform-page__hero {
    grid-template-columns: 1fr;
    padding: 32px 22px;
    border-radius: 32px 32px 14px 32px;
  }

  .platform-page__screen {
    max-width: 240px;
  }

  .platform-page__features dl,
  .platform-page__others ul {
    grid-template-columns: 1fr;
  }

  .platform-page :deep(.btn-lg) {
    width: 100%;
  }
}
</style>
