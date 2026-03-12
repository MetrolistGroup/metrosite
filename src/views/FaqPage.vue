<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import FooterSection from '../components/FooterSection.vue'
import { FAQ_ITEMS } from '../content/faq'
</script>

<template>
  <NavBar />
  <main id="main" class="faq-page">
    <div class="faq-page__bg" aria-hidden="true" />

    <div class="container faq-page__inner">
      <header class="faq-page__header">
        <p class="faq-page__kicker">Support</p>
        <h1 class="faq-page__title">Frequently asked questions</h1>
        <p class="faq-page__sub">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod.
        </p>
      </header>

      <section class="faq-page__list" aria-label="Full FAQ">
        <details v-for="item in FAQ_ITEMS" :key="item.question" class="faq-page__item">
          <summary class="faq-page__q">
            <span class="faq-page__q-text">{{ item.question }}</span>
            <span class="faq-page__chev icon" aria-hidden="true">arrow_forward</span>
          </summary>
          <div class="faq-page__a">
            <p>{{ item.answer }}</p>
          </div>
        </details>
      </section>

      <div class="faq-page__back">
        <RouterLink to="/" class="btn btn-outlined btn-lg">
          <span class="icon" aria-hidden="true">arrow_back</span>
          Back to home
        </RouterLink>
      </div>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.faq-page {
  position: relative;
  padding: 32px 0 80px;
  overflow-x: hidden;
}

@media (min-width: 480px) {
  .faq-page {
    padding: 48px 0 110px;
  }
}

.faq-page__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 60% at 80% 10%, var(--md-primary-container) 0%, transparent 58%),
    radial-gradient(ellipse 60% 70% at 15% 85%, var(--md-tertiary-container) 0%, transparent 54%),
    radial-gradient(ellipse 42% 50% at 50% 50%, var(--md-secondary-container) 0%, transparent 60%);
  pointer-events: none;
}

.faq-page__inner {
  position: relative;
  z-index: 1;
  max-width: 980px;
}

.faq-page__header {
  text-align: center;
  margin: 18px auto 26px;
}

.faq-page__kicker {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--md-primary);
  margin-bottom: 10px;
}

.faq-page__title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  color: var(--md-on-background);
}

.faq-page__sub {
  font-size: 1.0625rem;
  color: var(--md-on-surface-variant);
  max-width: 64ch;
  margin: 0 auto;
  line-height: 1.7;
}

.faq-page__list {
  border-radius: var(--r-2xl);
  background: color-mix(in srgb, var(--md-sc) 92%, transparent);
  border: 1px solid var(--md-outline-variant);
  overflow: hidden;
}

.faq-page__item {
  border-bottom: 1px solid var(--md-outline-variant);
}

.faq-page__item:last-of-type {
  border-bottom: none;
}

.faq-page__q {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 18px;
  color: var(--md-on-surface);
  user-select: none;
}

.faq-page__q::-webkit-details-marker {
  display: none;
}

.faq-page__q-text {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.faq-page__chev {
  pointer-events: none;
  transform: rotate(0deg);
  transition: transform var(--t-std), opacity var(--t-fast);
  opacity: 0.7;
}

.faq-page__item[open] .faq-page__chev {
  transform: rotate(90deg);
  opacity: 1;
}

.faq-page__a {
  padding: 0 18px 18px;
  color: var(--md-on-surface-variant);
}

.faq-page__a p {
  margin: 0;
  line-height: 1.75;
  font-size: 0.9375rem;
  max-width: 84ch;
}

.faq-page__back {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

@media (min-width: 640px) {
  .faq-page__q {
    padding: 22px 26px;
  }

  .faq-page__a {
    padding: 0 26px 22px;
  }

  .faq-page__back {
    margin-top: 28px;
  }
}
</style>
