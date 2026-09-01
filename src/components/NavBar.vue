<script setup lang="ts">
import { ref } from 'vue'
import DownloadDialog from './DownloadDialog.vue'

const isMenuOpen = ref(false)
</script>

<template>
  <header class="navbar">
    <div class="container navbar__inner">
      <RouterLink to="/" class="navbar__brand" aria-label="Metrolist home" @click="isMenuOpen = false">
        <img class="navbar__brand-mark" src="/logo.svg" alt="" width="58" height="58" />
        <span>Metrolist</span>
      </RouterLink>

      <nav class="navbar__links" aria-label="Main navigation">
        <RouterLink :to="{ path: '/', hash: '#desktop' }">Desktop</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#features' }">Features</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#platforms' }">Platforms</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
        <DownloadDialog label="Download" button-class="btn btn-filled btn-sm" />
      </nav>

      <button class="icon-button navbar__menu" type="button" :aria-expanded="isMenuOpen" aria-controls="mobile-navigation" :aria-label="isMenuOpen ? 'Close navigation' : 'Open navigation'" @click="isMenuOpen = !isMenuOpen">
        <span class="material-symbols-rounded" aria-hidden="true">{{ isMenuOpen ? 'close' : 'menu' }}</span>
      </button>
    </div>

    <nav v-if="isMenuOpen" id="mobile-navigation" class="navbar__drawer" aria-label="Mobile navigation">
      <div class="container">
        <RouterLink :to="{ path: '/', hash: '#desktop' }" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">desktop_windows</span>Desktop</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#features' }" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">tune</span>Features</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#platforms' }" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">devices</span>Platforms</RouterLink>
        <RouterLink to="/faq" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">help</span>FAQ</RouterLink>
        <DownloadDialog label="Download" button-class="navbar__drawer-download" @open="isMenuOpen = false" />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--md-sys-color-surface-container-low);
}

.navbar__inner {
  display: flex;
  align-items: center;
  min-height: 80px;
  gap: 24px;
}

.navbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
  color: var(--md-sys-color-on-surface);
  font-size: 1.1rem;
  font-weight: 760;
  letter-spacing: -0.025em;
  text-decoration: none;
}

.navbar__brand-mark {
  width: 58px;
  height: 58px;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar__links > a:not(.btn) {
  padding: 10px 14px;
  border-radius: var(--md-sys-shape-corner-full);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.86rem;
  font-weight: 650;
  text-decoration: none;
}

.navbar__links > a:not(.btn):hover,
.navbar__links > a.router-link-active:not(.btn) {
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.navbar__links :deep(.btn) {
  margin-left: 10px;
}

.navbar__menu {
  display: none;
}

.navbar__drawer {
  display: none;
  padding: 6px 0 18px;
  border-radius: 0 0 var(--md-sys-shape-corner-extra-large) var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-low);
}

.navbar__drawer .container {
  display: grid;
  gap: 4px;
}

.navbar__drawer a,
.navbar__drawer :deep(.navbar__drawer-download) {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 52px;
  padding: 10px 18px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font-weight: 650;
  text-align: left;
  text-decoration: none;
}

.navbar__drawer a:hover,
.navbar__drawer a.router-link-active,
.navbar__drawer :deep(.navbar__drawer-download:hover) {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

@media (max-width: 800px) {
  .navbar__inner {
    min-height: 72px;
  }

  .navbar__brand-mark {
    width: 52px;
    height: 52px;
  }

  .navbar__links {
    display: none;
  }

  .navbar__menu,
  .navbar__drawer {
    display: flex;
  }
}
</style>
