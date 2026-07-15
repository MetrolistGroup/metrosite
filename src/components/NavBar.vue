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
  <header :class="['navbar', { 'navbar--scrolled': isScrolled, 'navbar--open': isMenuOpen }]">
    <div class="container navbar__inner">

      <!-- Logo + wordmark -->
      <RouterLink to="/" class="navbar__brand">
        <img src="/logo.svg" alt="" width="32" height="32" />
        <span class="navbar__wordmark">Metrolist</span>
      </RouterLink>

      <!-- Desktop navigation -->
      <nav class="navbar__links" aria-label="Main navigation">
        <RouterLink :to="{ path: '/', hash: '#highlights' }" class="nav-link">Features</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#faq' }" class="nav-link">FAQ</RouterLink>
        <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="nav-link" target="_blank"
          rel="noopener noreferrer">Download</a>
        <a href="https://github.com/MetrolistGroup/Metrolist" class="btn btn-tonal btn-sm" target="_blank"
          rel="noopener noreferrer">
          <span class="icon" aria-hidden="true">code</span>
          GitHub
        </a>
      </nav>

      <!-- Mobile hamburger -->
      <button class="navbar__hamburger" :aria-expanded="isMenuOpen" aria-label="Toggle navigation menu"
        @click="isMenuOpen = !isMenuOpen">
        <span class="icon">{{ isMenuOpen ? 'close' : 'menu' }}</span>
      </button>
    </div>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="isMenuOpen" class="navbar__drawer" role="navigation" aria-label="Mobile navigation">
        <RouterLink :to="{ path: '/', hash: '#highlights' }" class="drawer-link" @click="isMenuOpen = false">
          Features
        </RouterLink>
        <RouterLink :to="{ path: '/', hash: '#faq' }" class="drawer-link" @click="isMenuOpen = false">FAQ</RouterLink>
        <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="drawer-link" target="_blank"
          rel="noopener noreferrer" @click="isMenuOpen = false">Download</a>
        <a href="https://github.com/MetrolistGroup/Metrolist" class="drawer-link" target="_blank"
          rel="noopener noreferrer" @click="isMenuOpen = false">GitHub</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 16px;
  margin: 16px auto;
  width: calc(100% - 32px);
  max-width: 1040px;
  z-index: 100;
  border-radius: var(--r-full);
  background: rgba(28, 27, 31, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: 
    top var(--t-std), 
    margin var(--t-std),
    background var(--t-std), 
    border-color var(--t-std), 
    border-radius var(--t-std), 
    box-shadow var(--t-std);
}

.navbar--scrolled {
  top: 10px;
  margin: 10px auto;
  background: rgba(20, 19, 23, 0.72);
  border-color: rgba(108, 75, 204, 0.25);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.45), 
    0 0 20px rgba(108, 75, 204, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.08);
}

.navbar--open {
  border-radius: var(--r-xl);
  background: rgba(20, 19, 23, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-color: rgba(108, 75, 204, 0.35);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: 68px;
  min-height: 68px;
  gap: 8px;
  contain: layout style;
  transition: height var(--t-std);
}

.navbar--scrolled .navbar__inner {
  height: 58px;
  min-height: 58px;
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
  transition: transform var(--t-std), filter var(--t-std);
}

.navbar__brand:hover img {
  transform: scale(1.1) rotate(6deg);
  filter: drop-shadow(0 0 8px var(--md-primary));
}

.navbar__wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--md-on-surface);
  letter-spacing: -0.025em;
  transition: color var(--t-std), text-shadow var(--t-std);
}

.navbar__brand:hover .navbar__wordmark {
  color: var(--md-primary);
  text-shadow: 0 0 10px rgba(208, 188, 255, 0.35);
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
  padding: 8px 18px;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  position: relative;
  transition: color var(--t-fast), transform var(--t-fast);
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--r-full);
  background: linear-gradient(135deg, rgba(175, 120, 255, 0.15), rgba(255, 140, 200, 0.15));
  border: 1px solid rgba(175, 120, 255, 0.3);
  transform: scale(0.92);
  opacity: 0;
  z-index: -1;
  transition: transform var(--t-std), opacity var(--t-std);
}

.nav-link:hover::before {
  transform: scale(1);
  opacity: 1;
}

.nav-link:hover {
  color: #FFF;
  text-shadow: 0 0 8px rgba(208, 188, 255, 0.4);
  transform: translateY(-1px);
}

.nav-link:active {
  transform: translateY(0) scale(0.98);
}

.navbar .btn {
  position: relative;
  overflow: hidden;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all var(--t-std);
}

.navbar .btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--md-primary), var(--md-tertiary));
  opacity: 0;
  z-index: -1;
  transition: opacity var(--t-std);
}

.navbar .btn:hover {
  border-color: transparent;
  color: var(--md-on-primary) !important;
  box-shadow: 0 0 18px rgba(208, 188, 255, 0.35);
  transform: translateY(-1px);
}

.navbar .btn:hover::before {
  opacity: 1;
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
  transition: background var(--t-fast), transform var(--t-fast);
  -webkit-tap-highlight-color: transparent;
}

.navbar__hamburger:hover {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
  transform: scale(1.05);
}

.navbar__hamburger:active {
  transform: scale(0.95);
}

.navbar__hamburger .icon {
  transition: transform var(--t-std);
}

.navbar__hamburger[aria-expanded="true"] .icon {
  transform: rotate(90deg);
}

/* Mobile drawer */
.navbar__drawer {
  display: flex;
  flex-direction: column;
  padding: 16px 24px 24px;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.drawer-link {
  display: block;
  padding: 14px 20px;
  border-radius: var(--r-md);
  font-size: 0.9375rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast), transform var(--t-fast);
  margin-bottom: 6px;
  animation: slideInLink 0.45s cubic-bezier(0.2, 0, 0, 1) both;
}

.drawer-link:last-child {
  margin-bottom: 0;
}

.drawer-link:hover {
  background: linear-gradient(90deg, rgba(175, 120, 255, 0.12), transparent);
  color: var(--md-primary);
  transform: translateX(6px);
}

.drawer-link:nth-child(1) { animation-delay: 0.05s; }
.drawer-link:nth-child(2) { animation-delay: 0.1s; }
.drawer-link:nth-child(3) { animation-delay: 0.15s; }
.drawer-link:nth-child(4) { animation-delay: 0.2s; }

@keyframes slideInLink {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Drawer animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--t-std), transform var(--t-std);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Responsive */
@media (max-width: 640px) {
  .navbar {
    top: 8px;
    margin: 8px auto;
    width: calc(100% - 16px);
  }

  .navbar__links {
    display: none;
  }

  .navbar__hamburger {
    display: flex;
  }
}
</style>
