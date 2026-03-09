<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 16
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="['navbar', { 'navbar--scrolled': isScrolled }]">
    <div class="container navbar__inner">

      <!-- Logo + wordmark -->
      <a href="/" class="navbar__brand">
        <img src="/logo.png" alt="" width="32" height="32" />
        <span class="navbar__wordmark">Metrolist</span>
      </a>

      <!-- Desktop navigation -->
      <nav class="navbar__links" aria-label="Main navigation">
        <a href="#highlights" class="nav-link">Features</a>
        <a
          href="https://github.com/MetrolistGroup/Metrolist/releases"
          class="nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >Download</a>
        <a
          href="https://github.com/MetrolistGroup/Metrolist"
          class="btn btn-tonal btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="icon" aria-hidden="true">code</span>
          GitHub
        </a>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="navbar__hamburger"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="icon">{{ isMenuOpen ? 'close' : 'menu' }}</span>
      </button>
    </div>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="isMenuOpen" class="navbar__drawer" role="navigation" aria-label="Mobile navigation">
        <a href="#highlights" class="drawer-link" @click="isMenuOpen = false">Features</a>
        <a
          href="https://github.com/MetrolistGroup/Metrolist/releases"
          class="drawer-link"
          target="_blank"
          rel="noopener noreferrer"
          @click="isMenuOpen = false"
        >Download</a>
        <a
          href="https://github.com/MetrolistGroup/Metrolist"
          class="drawer-link"
          target="_blank"
          rel="noopener noreferrer"
          @click="isMenuOpen = false"
        >GitHub</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background var(--t-std), box-shadow var(--t-std);
}

.navbar--scrolled {
  background: color-mix(in srgb, var(--md-surface) 88%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--el-1);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 8px;
}

/* Brand */
.navbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-right: auto;
}

.navbar__brand img {
  border-radius: var(--r-sm);
  object-fit: contain;
}

.navbar__wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--md-on-surface);
  letter-spacing: -0.025em;
}

/* Desktop links */
.navbar__links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--r-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast);
}

.nav-link:hover {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
  color: var(--md-on-surface);
}

/* Hamburger */
.navbar__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-on-surface);
  padding: 8px;
  border-radius: var(--r-full);
  transition: background var(--t-fast);
  -webkit-tap-highlight-color: transparent;
}

.navbar__hamburger:hover {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
}

/* Mobile drawer */
.navbar__drawer {
  display: flex;
  flex-direction: column;
  padding: 8px 16px 16px;
  background: var(--md-sc-low);
  border-bottom: 1px solid var(--md-outline-variant);
}

.drawer-link {
  display: block;
  padding: 14px 16px;
  border-radius: var(--r-md);
  font-size: 1rem;
  font-weight: 600;
  color: var(--md-on-surface);
  text-decoration: none;
  transition: background var(--t-fast);
}

.drawer-link:hover {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
}

/* Drawer animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--t-std), transform var(--t-std);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 640px) {
  .navbar__links { display: none; }
  .navbar__hamburger { display: flex; }
}
</style>
