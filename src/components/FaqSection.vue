<script setup lang="ts">
import { FAQ_ITEMS } from '../content/faq'

const topItems = FAQ_ITEMS.slice(0, 5)
</script>

<template>
  <section id="faq" class="faq">
    <div class="container faq__layout">
      <header>
        <h2>Common questions</h2>
        <RouterLink to="/faq" class="btn btn-tonal">
          View the full FAQ
          <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>
        </RouterLink>
      </header>

      <div class="faq__list">
        <details v-for="item in topItems" :key="item.question" class="faq-disclosure">
          <summary class="faq__question">
            <h3>
              {{ item.question }}
              <span class="faq__mark material-symbols-rounded" aria-hidden="true">add</span>
            </h3>
          </summary>
          <div class="faq__answer">
            <p>{{ item.answer }}</p>
            <p v-if="item.guide"><RouterLink :to="item.guide.href">{{ item.guide.label }}</RouterLink></p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding: 108px 0;
  background: var(--md-sys-color-surface-container-low);
}

.faq__layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.65fr) minmax(0, 1.35fr);
  gap: 24px;
}

.faq header {
  align-self: start;
  padding: 36px;
  border-radius: 44px 16px 44px 44px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.faq h2 {
  margin: 0 0 32px;
  font: var(--md-sys-typescale-display-medium);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking);
}

.faq__list {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-radius: 16px 40px 40px 40px;
  background: var(--md-sys-color-surface-container);
}

.faq__list details {
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-high);
}

.faq__question {
  display: block;
  border-radius: inherit;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
}

.faq__question::-webkit-details-marker {
  display: none;
}

.faq__question:focus-visible {
  outline-offset: -6px;
}

.faq__question h3 {
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 18px;
  align-items: center;
  min-height: 78px;
  padding: 10px 12px 10px 24px;
  font: var(--md-sys-typescale-title-medium);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
}

.faq__mark {
  width: 44px;
  height: 44px;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
  transition: transform var(--md-motion-spatial-fast);
}

.faq__list details[open] .faq__mark {
  transform: rotate(45deg);
}

.faq__answer p {
  max-width: 680px;
  padding: 0 76px 24px 24px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.faq__answer a {
  color: var(--md-sys-color-primary);
  text-underline-offset: 4px;
}

@media (max-width: 820px) {
  .faq {
    padding: 80px 0;
  }

  .faq__layout {
    grid-template-columns: 1fr;
  }

  .faq header {
    border-radius: 36px 14px 36px 36px;
  }
}

@media (max-width: 520px) {
  .faq header {
    padding: 28px 24px;
  }

  .faq__list {
    padding: 6px;
  }

  .faq__question h3 {
    grid-template-columns: 1fr 40px;
    gap: 10px;
    min-height: 72px;
    padding: 8px 8px 8px 16px;
  }

  .faq__mark {
    width: 40px;
    height: 40px;
  }

  .faq__answer p {
    padding: 0 58px 22px 16px;
  }
}
</style>
