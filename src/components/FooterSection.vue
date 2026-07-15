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
      <div class="footer__bottom-left">
        <p class="footer__copyright">
          © 2024–2026 Metrolist Group. Released under GPL-3.0 License.
        </p>
        <p class="footer__disclaimer">
          Metrolist is strictly for educational purposes. Not affiliated with, authorized, or endorsed by Google LLC.
          "YouTube" and "YouTube Music" are registered trademarks of Google LLC.
        </p>
      </div>
      <div class="footer__bottom-right">
        <p class="footer__credits">
          Metrolist: <a href="https://github.com/MetrolistGroup/Metrolist/graphs/contributors?all=1" target="_blank" rel="noopener noreferrer">Mo Agamy &amp; Contributors</a>
        </p>
        <p class="footer__credits">
          Metrosite: <a href="https://github.com/MetrolistGroup/metrosite/graphs/contributors?all=1" target="_blank" rel="noopener noreferrer">Nyx &amp; Contributors</a>
        </p>
      </div>
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
  position: relative;
  width: calc(100% - 32px);
  max-width: 1040px;
  margin: 64px auto 40px;
  border-radius: var(--r-xl);
  background: rgba(20, 19, 23, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(108, 75, 204, 0.25);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.45), 
    0 0 20px rgba(108, 75, 204, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.08);
  padding: 40px 0;
  z-index: 10;
}

.footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 24px;
}

/* Brand */
.footer__logo-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-bottom: 8px;
}

.footer__logo-link img {
  border-radius: var(--r-sm);
  object-fit: contain;
  transition: transform var(--t-std), filter var(--t-std);
}

.footer__logo-link:hover img {
  transform: scale(1.1) rotate(6deg);
  filter: drop-shadow(0 0 8px var(--md-primary));
}

.footer__wordmark {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.125rem;
  color: var(--md-on-surface);
  letter-spacing: -0.025em;
  transition: color var(--t-std), text-shadow var(--t-std);
}

.footer__logo-link:hover .footer__wordmark {
  color: var(--md-primary);
  text-shadow: 0 0 10px rgba(208, 188, 255, 0.35);
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
  align-items: center;
}

.footer__link {
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

.footer__link::before {
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

.footer__link:hover::before {
  transform: scale(1);
  opacity: 1;
}

.footer__link:hover {
  color: #FFF;
  text-shadow: 0 0 8px rgba(208, 188, 255, 0.4);
  transform: translateY(-1px);
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
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
}

.footer__bottom-left {
  flex: 1 1 500px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer__bottom-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

@media (min-width: 768px) {
  .footer__bottom-right {
    text-align: right;
  }
}

.footer__copyright {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--md-on-surface);
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
  font-weight: 700;
  transition: color var(--t-fast);
}

.footer__credits a:hover {
  color: var(--md-on-background);
  text-decoration: underline;
}
</style>
