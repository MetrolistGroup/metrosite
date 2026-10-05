<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import HighlightsSection from '../components/HighlightsSection.vue'
import FaqSection from '../components/FaqSection.vue'
import DownloadSection from '../components/DownloadSection.vue'
import FooterSection from '../components/FooterSection.vue'
import { SPONSORS } from '../content/sponsors'
</script>

<template>
  <NavBar />
  <main id="main">
    <HeroSection />
    <HighlightsSection />
    <section id="sponsors" class="sponsors" aria-labelledby="sponsors-heading">
      <div class="container">
        <h2 id="sponsors-heading">Sponsors</h2>
        <p>
          Thanks to everyone below for supporting our maintainers.
          <a href="https://github.com/sponsors/nyxiereal" target="_blank" rel="noopener noreferrer">Sponsor on GitHub</a>.
        </p>
        <ul class="sponsors__names" role="list">
          <li v-for="sponsor in SPONSORS" :key="sponsor.login">
            <a :href="`https://github.com/${sponsor.login}`" target="_blank" rel="noopener noreferrer">{{ sponsor.name }}</a>
          </li>
        </ul>
      </div>
    </section>
    <FaqSection />
    <DownloadSection />
  </main>
  <FooterSection />
</template>

<style scoped>
.sponsors {
  padding: 72px 0;
  background: var(--md-sys-color-surface);
}

.sponsors h2 {
  margin-bottom: 16px;
  color: var(--md-sys-color-on-surface);
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 1;
}

.sponsors p {
  color: var(--md-sys-color-on-surface-variant);
}

.sponsors p a {
  color: var(--md-sys-color-primary);
  text-underline-offset: 3px;
}

.sponsors__names {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  margin-top: 28px;
  list-style: none;
}

.sponsors__names li {
  max-width: 100%;
}

.sponsors__names a {
  display: block;
  padding-block: 6px;
  color: var(--md-sys-color-on-surface);
  font-size: 0.94rem;
  font-weight: 650;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.sponsors__names a:hover,
.sponsors__names a:focus-visible {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
