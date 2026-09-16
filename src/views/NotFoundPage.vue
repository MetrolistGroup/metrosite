<script setup lang="ts">
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main id="main" class="not-found">
    <section class="container not-found__panel" aria-labelledby="not-found-title">
      <p>404</p>
      <h1 id="not-found-title">This track isn’t in the queue.</h1>
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

.not-found__panel > p {
  color: var(--md-sys-color-primary);
  font-size: 0.85rem;
  font-weight: 760;
  letter-spacing: 0.12em;
}

.not-found h1 {
  max-width: 800px;
  margin: 20px 0 36px;
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 760;
  letter-spacing: -0.06em;
  line-height: 0.94;
}
</style>
