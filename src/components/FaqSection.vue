<script setup lang="ts">
import { ref } from 'vue'
import { FAQ_ITEMS } from '../content/faq'

const topItems = FAQ_ITEMS.slice(0, 5)
const openItems = ref<number[]>([])

function toggleItem(index: number) {
  openItems.value = openItems.value.includes(index)
    ? openItems.value.filter(item => item !== index)
    : [...openItems.value, index]
}
</script>

<template>
  <section id="faq" class="faq">
    <div class="container faq__layout">
      <header>
        <h2>Good questions, straight answers.</h2>
        <RouterLink to="/faq" class="btn btn-tonal">
          View the full FAQ
          <span class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>
        </RouterLink>
      </header>

      <div class="faq__list">
        <article v-for="(item, index) in topItems" :key="item.question" :class="{ 'is-open': openItems.includes(index) }">
          <button
            type="button"
            :id="`home-faq-question-${index}`"
            class="faq__question"
            :aria-expanded="openItems.includes(index)"
            :aria-controls="`home-faq-answer-${index}`"
            @click="toggleItem(index)"
          >
            <strong>{{ item.question }}</strong>
            <span class="faq__mark material-symbols-rounded" aria-hidden="true">add</span>
          </button>
          <div
            :id="`home-faq-answer-${index}`"
            class="faq__answer"
            role="region"
            :aria-labelledby="`home-faq-question-${index}`"
            :aria-hidden="!openItems.includes(index)"
          >
            <div><p>{{ item.answer }}</p></div>
          </div>
        </article>
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
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 0.96;
}

.faq__list {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-radius: 16px 40px 40px 40px;
  background: var(--md-sys-color-surface-container);
}

.faq__list article {
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-high);
}

.faq__question {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 44px;
  gap: 18px;
  align-items: center;
  min-height: 78px;
  padding: 10px 12px 10px 24px;
  border: 0;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.faq__mark {
  width: 44px;
  height: 44px;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
  transition: transform 320ms var(--md-sys-motion-expressive);
}

.faq__list article.is-open .faq__mark {
  transform: rotate(45deg);
}

.faq__question strong {
  font-size: 1rem;
  font-weight: 680;
}

.faq__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 360ms var(--md-sys-motion-expressive);
}

.faq__answer > div {
  overflow: hidden;
}

.faq__list article.is-open .faq__answer {
  grid-template-rows: 1fr;
}

.faq__answer p {
  max-width: 680px;
  padding: 0 76px 24px 24px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.94rem;
  line-height: 1.65;
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

  .faq__question {
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
