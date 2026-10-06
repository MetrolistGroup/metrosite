<script setup lang="ts">
import DownloadDialog from '../components/DownloadDialog.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
import { COMPARE_FAQ, COMPARE_ROWS } from '../content/compare'
</script>

<template>
  <NavBar />
  <main id="main" class="compare-page">
    <div class="container">
      <header class="compare-page__hero">
        <h1>Metrolist vs the <span>YouTube Music app.</span></h1>
        <p>
          Metrolist plays the same YouTube Music catalog and library as the official app. The difference is what comes with it:
          no ads, background playback, offline downloads, and standalone desktop apps, all free and open source.
        </p>
        <div class="compare-page__actions">
          <DownloadDialog label="Download Metrolist" button-class="btn btn-filled btn-lg" />
          <RouterLink to="/faq" class="btn btn-outlined btn-lg">Read the FAQ</RouterLink>
        </div>
      </header>

      <section class="compare-page__table" aria-labelledby="table-title">
        <h2 id="table-title">Feature comparison</h2>
        <div class="compare-page__scroll" tabindex="0" role="region" aria-labelledby="table-title">
          <table>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Metrolist</th>
                <th scope="col">YouTube Music</th>
                <th scope="col">YouTube Music Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in COMPARE_ROWS" :key="row.feature">
                <th scope="row">{{ row.feature }}</th>
                <td>{{ row.metrolist }}</td>
                <td>{{ row.free }}</td>
                <td>{{ row.premium }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="compare-page__note">YouTube Music details describe the official apps as of 2026 and can change. Metrolist is not affiliated with Google.</p>
      </section>

      <section class="compare-page__faq" aria-labelledby="compare-faq-title">
        <h2 id="compare-faq-title">Common questions</h2>
        <details v-for="item in COMPARE_FAQ" :key="item.question">
          <summary>{{ item.question }}<span class="material-symbols-rounded" aria-hidden="true">add</span></summary>
          <p>{{ item.answer }}</p>
        </details>
      </section>

      <nav class="compare-page__platforms" aria-label="Metrolist downloads by platform">
        <RouterLink to="/download/android">Android</RouterLink>
        <RouterLink to="/download/ios">iPhone and iPad</RouterLink>
        <RouterLink to="/download/windows">Windows</RouterLink>
        <RouterLink to="/download/macos">macOS</RouterLink>
        <RouterLink to="/download/linux">Linux</RouterLink>
      </nav>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.compare-page {
  padding: 28px 0 112px;
  background: var(--md-sys-color-surface);
}

.compare-page__hero,
.compare-page section,
.compare-page__platforms {
  padding: clamp(28px, 6vw, 72px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.compare-page section,
.compare-page__platforms {
  margin-top: 24px;
  border-radius: var(--md-sys-shape-corner-extra-large);
}

.compare-page h1 {
  max-width: 14ch;
  margin-bottom: 24px;
  font-size: clamp(3rem, 7vw, 6.4rem);
  font-weight: 760;
  letter-spacing: -0.065em;
  line-height: 0.93;
}

.compare-page h1 span {
  color: var(--md-sys-color-primary);
}

.compare-page__hero > p {
  max-width: 64ch;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.08rem;
}

.compare-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.compare-page h2 {
  margin-bottom: 24px;
  font-size: clamp(1.7rem, 3.4vw, 2.6rem);
  font-weight: 740;
  letter-spacing: -0.04em;
}

.compare-page__scroll {
  overflow-x: auto;
}

.compare-page table {
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0 4px;
  text-align: left;
}

.compare-page th,
.compare-page td {
  padding: 14px 18px;
  background: var(--md-sys-color-surface-container-high);
  vertical-align: top;
}

.compare-page thead th {
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.compare-page tbody th {
  border-radius: 14px 0 0 14px;
  font-weight: 700;
}

.compare-page tbody td:last-child {
  border-radius: 0 14px 14px 0;
}

.compare-page tbody td:nth-child(2) {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-weight: 650;
}

.compare-page tbody td:nth-child(n + 3) {
  color: var(--md-sys-color-on-surface-variant);
}

.compare-page__note {
  margin-top: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.82rem;
}

.compare-page__faq details {
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-high);
}

.compare-page__faq details + details {
  margin-top: 6px;
}

.compare-page__faq summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 680;
  list-style: none;
}

.compare-page__faq summary::-webkit-details-marker {
  display: none;
}

.compare-page__faq summary .material-symbols-rounded {
  transition: transform var(--md-motion-spatial-fast);
}

.compare-page__faq details[open] summary .material-symbols-rounded {
  transform: rotate(45deg);
}

.compare-page__faq details p {
  max-width: 72ch;
  padding: 0 20px 22px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.65;
}

.compare-page__platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 16px;
}

.compare-page__platforms a {
  padding: 12px 20px;
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  font-weight: 650;
  text-decoration: none;
}

.compare-page__platforms a:hover {
  background: var(--md-sys-color-surface-container-highest);
}

@media (max-width: 780px) {
  .compare-page__hero {
    padding: 32px 22px;
    border-radius: 32px 32px 14px 32px;
  }

  .compare-page :deep(.btn-lg) {
    width: 100%;
  }
}
</style>
