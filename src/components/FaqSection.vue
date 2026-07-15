<script setup lang="ts">
import { FAQ_ITEMS } from '../content/faq'
</script>

<template>
  <section id="faq" class="faq">
    <div class="container">
      <header class="faq__header">
        <h2 class="faq__title">Quick answers.</h2>
        <p class="faq__sub">Got questions? We've got you covered.</p>
      </header>

      <div class="faq__card" role="region" aria-label="Frequently asked questions">
        <details v-for="item in FAQ_ITEMS" :key="item.question" class="faq__item">
          <summary class="faq__q">
            <span class="faq__q-text">{{ item.question }}</span>
            <span class="faq__chev icon" aria-hidden="true">arrow_forward</span>
          </summary>
          <div class="faq__a">
            <div class="faq__a-content">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding: 80px 0;
}

.faq__header {
  text-align: center;
  margin-bottom: 28px;
}

.faq__title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.025em;
  color: var(--md-on-background);
  margin-bottom: 10px;
}

.faq__sub {
  font-size: 1.0625rem;
  color: var(--md-on-surface-variant);
  max-width: 60ch;
  margin: 0 auto;
}

.faq__card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: var(--r-2xl);
  background: var(--md-sc);
  overflow: hidden;
}

.faq__item {
  border-bottom: 1px solid var(--md-outline-variant);
  transition: background-color var(--t-std);
}

.faq__item:last-of-type {
  border-bottom: none;
}

.faq__item[open] {
  background-color: rgba(255, 255, 255, 0.015);
}

.faq__q {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  color: var(--md-on-surface);
  user-select: none;
  transition: color var(--t-std);
}

.faq__q:hover {
  color: var(--md-primary);
}

.faq__q::-webkit-details-marker {
  display: none;
}

.faq__q-text {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.faq__chev {
  pointer-events: none;
  transform: rotate(0deg);
  transition: transform var(--t-std), opacity var(--t-fast), color var(--t-std);
  opacity: 0.7;
}

.faq__item[open] .faq__chev {
  transform: rotate(90deg);
  opacity: 1;
  color: var(--md-primary);
}

.faq__a {
  padding: 0 20px;
  color: var(--md-on-surface-variant);
  overflow: hidden;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--t-std), padding var(--t-std);
}

.faq__item[open] .faq__a {
  grid-template-rows: 1fr;
  padding: 0 20px 18px;
}

.faq__a-content {
  min-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity var(--t-std), transform var(--t-std);
}

.faq__item[open] .faq__a-content {
  opacity: 1;
  transform: translateY(0);
}

.faq__a p {
  margin: 0;
  line-height: 1.75;
  font-size: 0.9375rem;
  max-width: 76ch;
}

@media (min-width: 640px) {
  .faq__q {
    padding: 20px 28px;
  }

  .faq__a {
    padding: 0 28px;
  }

  .faq__item[open] .faq__a {
    padding: 0 28px 22px;
  }
}
</style>
