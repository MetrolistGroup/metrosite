<template>
  <footer class="footer">
    <div class="container footer__inner">

      <!-- Brand blurb -->
      <div class="footer__brand">
        <a href="/" class="footer__logo-link" aria-label="Metrolist home">
          <img src="/logo.svg" alt="" width="28" height="28" loading="lazy" />
          <span class="footer__wordmark">Metrolist</span>
        </a>
        <p class="footer__tagline">
          Open-source YouTube Music client for Android.
        </p>
      </div>

      <!-- External links -->
      <nav class="footer__links" aria-label="Footer links">
        <a v-for="link in links" :key="link.label" :href="link.href" class="footer__link" target="_blank"
          rel="noopener noreferrer">{{ link.label }}</a>
      </nav>

    </div>

    <div class="container">
      <hr class="footer__divider" />
    </div>

    <!-- Bottom: disclaimer + credits -->
    <div class="container footer__bottom">
      <p class="footer__disclaimer">
        Metrolist is an open-source project (GPL-3.0), strictly for educational purposes.
        Not affiliated with, authorized, or endorsed by Google LLC.
        "YouTube" and "YouTube Music" are registered trademarks of Google LLC.
      </p>
      <p class="footer__credits">
        Metrolist made by <a href="https://github.com/mostafaalagamy" target="_blank" rel="noopener noreferrer">Mo
          Agamy</a>, Site made by <a href="https://nyx.meowery.eu" target="_blank" rel="noopener noreferrer">Nyx</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const links = [
  { label: 'GitHub', href: 'https://github.com/MetrolistGroup/Metrolist' },
  { label: 'Releases', href: 'https://github.com/MetrolistGroup/Metrolist/releases' },
  { label: 'Issues', href: 'https://github.com/MetrolistGroup/Metrolist/issues' },
  { label: 'Weblate', href: 'https://hosted.weblate.org/projects/Metrolist/' },
]
</script>

<style scoped>
.footer {
  background: var(--md-sc-low);
  border-top: 1px solid var(--md-outline-variant);
  padding: 56px 0 40px;
}

.footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 32px;
}

/* Brand */
.footer__logo-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  margin-bottom: 8px;
}

.footer__logo-link img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: var(--r-xs);
}

.footer__wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.125rem;
  color: var(--md-on-surface);
  letter-spacing: -0.025em;
}

.footer__tagline {
  font-size: 0.875rem;
  color: var(--md-on-surface-variant);
  max-width: 30ch;
}

/* Links */
.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
  padding-top: 2px;
}

.footer__link {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--r-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--md-on-surface-variant);
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast);
}

.footer__link:hover {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
  color: var(--md-on-surface);
}

/* Divider */
.footer__divider {
  border: none;
  border-top: 1px solid var(--md-outline-variant);
  margin-bottom: 24px;
}

/* Bottom text */
.footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer__disclaimer,
.footer__credits {
  font-size: 0.8125rem;
  color: var(--md-on-surface-variant);
  line-height: 1.6;
}

.footer__disclaimer {
  opacity: 0.75;
}

.footer__credits a {
  color: var(--md-primary);
  text-decoration: none;
}

.footer__credits a:hover {
  text-decoration: underline;
}
</style>
