<script setup lang="ts">
const links = [
  { label: 'Source', href: 'https://github.com/MetrolistGroup/Metrolist' },
  { label: 'Releases', href: 'https://github.com/MetrolistGroup/Metrolist/releases' },
  { label: 'Issues', href: 'https://github.com/MetrolistGroup/Metrolist/issues' },
  { label: 'Translations', href: 'https://hosted.weblate.org/projects/Metrolist/' },
  { label: 'Privacy', href: 'https://metrolist.cc/privacy' },
  { label: 'GPL-3.0', href: 'https://github.com/MetrolistGroup/Metrolist/blob/main/LICENSE' },
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <RouterLink to="/" class="footer__brand" aria-label="Metrolist home">
          <img src="/logo.svg" alt="" width="50" height="50" loading="lazy" />
          <strong>Metrolist</strong>
        </RouterLink>
        <p>Open-source music for Android and desktop, built with Kotlin Multiplatform.</p>
      </div>

      <nav class="footer__links" aria-label="Footer navigation">
        <a v-for="link in links" :key="link.label" :href="link.href" target="_blank" rel="noopener noreferrer">
          {{ link.label }}
          <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>
        </a>
      </nav>

      <div class="footer__bottom">
        <p>Metrolist is an educational open-source project and is not affiliated with Google LLC. YouTube and YouTube Music are trademarks of Google LLC.</p>
        <p>Metrolist by <a href="https://github.com/mostafaalagamy" target="_blank" rel="noopener noreferrer">Mo Agamy</a> and contributors. Site by <a href="https://nyx.meowery.eu" target="_blank" rel="noopener noreferrer">Nyx</a>.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 66px 0 38px;
  border-radius: 44px 44px 0 0;
  background: var(--md-sys-color-surface-container-low);
}

.footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 34px;
}

.footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface);
  font-size: 1.2rem;
  text-decoration: none;
}

.footer__brand img {
  width: 50px;
  height: 50px;
}

.footer__top > p {
  max-width: 430px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.92rem;
  text-align: right;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 24px 0;
  border-block: 1px solid var(--md-sys-color-outline-variant);
}

.footer__links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 9px 16px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.86rem;
  font-weight: 650;
  text-decoration: none;
}

.footer__links a:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.footer__links .material-symbols-rounded {
  font-size: 18px;
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 30px 60px;
  padding-top: 28px;
  color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 72%, transparent);
  font-size: 0.76rem;
}

.footer__bottom p {
  max-width: 620px;
}

.footer__bottom a {
  color: var(--md-sys-color-primary);
}

@media (max-width: 680px) {
  .footer {
    border-radius: 32px 32px 0 0;
  }

  .footer__top,
  .footer__bottom {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer__top > p {
    text-align: left;
  }
}
</style>
