<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from '../components/DownloadDialog.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
import { musicAppUrl, musicShareFromUrl } from '../content/share'

const route = useRoute()
// Static shells have no query or path ID, so read the shared link after hydration.
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })
const share = computed(() => hydrated.value ? musicShareFromUrl(route.fullPath) : null)
const appUrl = computed(() => share.value ? musicAppUrl(share.value, navigator.userAgent, navigator.maxTouchPoints) : '')
</script>

<template>
  <NavBar />
  <main id="main" class="share-page">
    <section class="container share-page__inner" aria-labelledby="share-title">
      <h1 id="share-title">Shared music</h1>
      <p>Open this link in Metrolist, or listen on YouTube Music.</p>

      <div v-if="!hydrated" class="share-page__loading" role="status" aria-label="Loading shared link">
        <span></span><span></span>
      </div>
      <div v-else-if="share" class="share-page__link">
        <p class="share-page__url">{{ share.youtubeUrl }}</p>
        <div class="share-page__actions">
          <a :href="appUrl" class="btn btn-filled btn-lg">Open in Metrolist</a>
          <a :href="share.youtubeUrl" class="btn btn-outlined btn-lg" rel="noreferrer">Open in YouTube Music</a>
        </div>
        <p>If your browser cannot open Metrolist, install the app or use YouTube Music.</p>
      </div>
      <p v-else class="share-page__error" role="status">This link is missing a valid song, playlist, album, or artist ID. Ask the sender for a new link.</p>
      <noscript>Enable JavaScript to open this shared link, or paste the link into Metrolist.</noscript>

      <div class="share-page__install">
        <h2>Need Metrolist?</h2>
        <p>Available for Android, iOS, Linux, macOS, and Windows.</p>
        <DownloadDialog label="Download Metrolist" button-class="btn btn-tonal btn-lg" />
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<style scoped>
.share-page {
  min-height: 70vh;
  padding: clamp(48px, 9vw, 112px) 0 80px;
}

.share-page__inner {
  max-width: 900px;
}

.share-page h1 {
  margin-bottom: 20px;
  font: var(--md-sys-typescale-display-large);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
}

.share-page p {
  max-width: 68ch;
  color: var(--md-sys-color-on-surface-variant);
}

.share-page__link,
.share-page__error,
.share-page__loading {
  margin-top: 36px;
}

.share-page__url {
  overflow-wrap: anywhere;
  user-select: text;
}

.share-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.share-page__loading span {
  display: block;
  width: min(100%, 480px);
  height: 24px;
  margin-bottom: 20px;
  background: var(--md-sys-color-surface-container-high);
}

.share-page__loading span + span {
  height: 56px;
}

.share-page__install {
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.share-page h2 {
  font: var(--md-sys-typescale-headline-small);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.share-page__install p {
  margin: 12px 0 24px;
}
</style>
