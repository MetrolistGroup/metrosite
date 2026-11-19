<script setup lang="ts">
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main id="main" class="not-found">
    <section class="container not-found__panel" aria-labelledby="not-found-title">
      <p class="not-found__code">404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p class="not-found__copy">That link doesn’t lead anywhere on this site. It may have moved or been mistyped.</p>
      <RouterLink to="/" class="btn btn-filled btn-lg">
        <span class="material-symbols-rounded" aria-hidden="true">home</span>
        Back to home
      </RouterLink>
    </section>
  </main>
  <FooterSection />
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 70vh;
  place-items: center;
  padding: 32px 0 96px;
}

.not-found__panel {
  padding: clamp(36px, 8vw, 88px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.not-found__code {
  color: var(--md-sys-color-primary);
  font: var(--md-sys-typescale-label-large);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  font-variant-numeric: tabular-nums;
}

.not-found h1 {
  max-width: 800px;
  margin: 20px 0 18px;
  font: var(--md-sys-typescale-display-large);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
}

.not-found__copy {
  max-width: 52ch;
  margin-bottom: 32px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}
</style>
