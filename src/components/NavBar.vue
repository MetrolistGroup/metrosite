<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const theme = ref<'light' | 'dark'>('dark')

function handleScroll() {
  isScrolled.value = window.scrollY > 16
}

function applyTheme(next: 'light' | 'dark') {
  theme.value = next
  if (next === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* ignore storage errors */
  }
}

function toggleTheme() {
  applyTheme(theme.value === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  theme.value = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="['top-app-bar', { 'scrolled': isScrolled, 'menu-open': isMenuOpen }]">
    <div class="bar-content">

      <!-- Brand -->
      <RouterLink to="/" class="header-brand">
        <img src="/logo.svg" alt="" width="32" height="32" class="brand-icon-img" />
        <span class="brand-wordmark">Metrolist</span>
      </RouterLink>

      <!-- Centered desktop navigation -->
      <nav class="nav-desktop" aria-label="Main navigation">
        <RouterLink :to="{ path: '/', hash: '#highlights' }" class="nav-link">Features</RouterLink>
        <RouterLink to="/faq" class="nav-link">FAQ</RouterLink>
        <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="nav-link" target="_blank"
          rel="noopener noreferrer">Download</a>
      </nav>

      <!-- Right actions -->
      <div class="right-actions">
        <button class="icon-btn" :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
          @click="toggleTheme">
          <span class="icon">{{ theme === 'light' ? 'dark_mode' : 'light_mode' }}</span>
        </button>
        <a href="https://github.com/MetrolistGroup/Metrolist" class="btn btn-tonal btn-sm nav-github" target="_blank"
          rel="noopener noreferrer">
          <span class="icon" aria-hidden="true">code</span>
          GitHub
        </a>
        <button class="icon-btn menu-btn" :aria-expanded="isMenuOpen" aria-label="Toggle navigation menu"
          @click="isMenuOpen = !isMenuOpen">
          <span class="icon">{{ isMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="isMenuOpen" class="drawer-sheet" role="navigation" aria-label="Mobile navigation">
        <RouterLink :to="{ path: '/', hash: '#highlights' }" class="drawer-link" @click="isMenuOpen = false">
          Features
        </RouterLink>
        <RouterLink to="/faq" class="drawer-link" @click="isMenuOpen = false">FAQ</RouterLink>
        <a href="https://github.com/MetrolistGroup/Metrolist/releases" class="drawer-link" target="_blank"
          rel="noopener noreferrer" @click="isMenuOpen = false">Download</a>
        <a href="https://github.com/MetrolistGroup/Metrolist" class="drawer-link" target="_blank"
          rel="noopener noreferrer" @click="isMenuOpen = false">GitHub</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* Top app bar */
.top-app-bar {
  position: sticky;
  top: 0;
  max-width: 1100px;
  margin: 0 auto;
  z-index: 2000;
  height: 64px;
  display: flex;
  align-items: center;
  background: transparent;
  box-shadow: none;
  transition:
    background var(--t-slow),
    box-shadow var(--t-slow),
    border-radius var(--t-slow);
}

.top-app-bar.scrolled {
  background: var(--md-sc-high);
  box-shadow: var(--el-2);
  border-radius: 0 0 var(--r-xl) var(--r-xl);
}

.top-app-bar.menu-open {
  background: var(--md-sc-high);
  box-shadow: none;
  border-radius: 0;
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 4px;
  padding: 0 24px;
  position: relative;
}

/* Brand */
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  z-index: 10;
}

.brand-icon-img {
  border-radius: var(--r-sm);
  object-fit: contain;
}

html[data-theme="light"] .brand-icon-img {
  filter: brightness(0) saturate(100%);
}

.brand-wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--md-on-surface);
  letter-spacing: -0.025em;
}

/* Desktop nav */
.nav-desktop {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  transition: color var(--t-fast);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--md-primary);
}

.nav-link.router-link-active {
  color: var(--md-primary);
  font-weight: 600;
}

/* Right actions */
.right-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  z-index: 10;
}

/* Icon button */
.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-on-surface-variant);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--md-on-surface-variant);
  opacity: 0;
  transition: opacity var(--t-fast);
  pointer-events: none;
}

.icon-btn:hover::before {
  opacity: var(--state-hover);
}

.icon-btn:active::before {
  opacity: var(--state-press);
}

.icon-btn .icon {
  font-size: 22px;
}

.menu-btn {
  display: none;
}

/* Mobile drawer */
.drawer-sheet {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 16px 24px;
  background: var(--md-sc-high);
  border-radius: 0 0 var(--r-xl) var(--r-xl);
  box-shadow: none;
  z-index: 1900;
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
@media (max-width: 720px) {
  .nav-desktop,
  .nav-github {
    display: none;
  }

  .menu-btn {
    display: flex;
  }
}
</style>
