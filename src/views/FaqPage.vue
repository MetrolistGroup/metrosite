<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import FooterSection from '../components/FooterSection.vue'
import { FAQ_ITEMS } from '../content/faq'

const openItems = ref<number[]>([])

function toggleItem(index: number) {
  openItems.value = openItems.value.includes(index)
    ? openItems.value.filter(item => item !== index)
    : [...openItems.value, index]
}
</script>

<template>
  <NavBar />
  <main id="main" class="faq-page">
    <div class="container">
      <header class="faq-page__hero">
        <div>
          <h1>Answers before the <span>first track.</span></h1>
          <p>Platforms, migration, accounts, updates, and the practical details of using Metrolist.</p>
        </div>
        <span class="faq-page__hero-icon material-symbols-rounded" aria-hidden="true">help</span>
      </header>

      <section class="faq-page__list" aria-label="Frequently asked questions">
        <article v-for="(item, index) in FAQ_ITEMS" :key="item.question" :class="{ 'is-open': openItems.includes(index) }">
          <button
            type="button"
            :id="`faq-question-${index}`"
            class="faq-page__question"
            :aria-expanded="openItems.includes(index)"
            :aria-controls="`faq-answer-${index}`"
            @click="toggleItem(index)"
          >
            <span class="faq-page__number">{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ item.question }}</strong>
            <span class="faq-page__mark material-symbols-rounded" aria-hidden="true">add</span>
          </button>
          <div
            :id="`faq-answer-${index}`"
            class="faq-page__answer"
            role="region"
            :aria-labelledby="`faq-question-${index}`"
            :aria-hidden="!openItems.includes(index)"
          >
            <div><p>{{ item.answer }}</p></div>
          </div>
        </article>
      </section>

      <div class="faq-page__back">
        <RouterLink to="/" class="btn btn-outlined btn-lg">
          <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>
          Back to home
        </RouterLink>
        <p>Still stuck? <a href="https://github.com/MetrolistGroup/Metrolist/issues" target="_blank" rel="noopener noreferrer">Ask on GitHub</a>.</p>
      </div>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.faq-page {
  padding: 28px 0 112px;
  background: var(--md-sys-color-surface);
}

.faq-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 48px;
  align-items: end;
  padding: clamp(32px, 6vw, 72px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.faq-page h1 {
  max-width: 830px;
  margin: 24px 0;
  font-size: clamp(3.6rem, 7.5vw, 7rem);
  font-weight: 760;
  letter-spacing: -0.065em;
  line-height: 0.91;
}

.faq-page h1 span {
  color: var(--md-sys-color-primary);
}

.faq-page__hero p:last-child {
  max-width: 620px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.08rem;
}

.faq-page__hero-icon {
  width: 190px;
  height: 190px;
  border-radius: 56px 56px 20px 56px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-size: 96px;
}

.faq-page__list {
  display: grid;
  gap: 6px;
  margin-top: 24px;
  padding: 10px;
  border-radius: 16px 40px 40px 40px;
  background: var(--md-sys-color-surface-container-low);
}

.faq-page__list article {
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-high);
}

.faq-page__question {
  display: grid;
  width: 100%;
  grid-template-columns: 50px 1fr 48px;
  gap: 18px;
  align-items: center;
  min-height: 86px;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.faq-page__number,
.faq-page__mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.faq-page__number {
  color: var(--md-sys-color-primary);
  font-size: 0.72rem;
  font-weight: 740;
  letter-spacing: 0.05em;
}

.faq-page__mark {
  transition: transform 320ms var(--md-sys-motion-expressive);
}

.faq-page__list article.is-open .faq-page__mark {
  transform: rotate(45deg);
}

.faq-page__question strong {
  font-size: clamp(1rem, 2vw, 1.22rem);
  font-weight: 680;
}

.faq-page__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 360ms var(--md-sys-motion-expressive);
}

.faq-page__answer > div {
  overflow: hidden;
}

.faq-page__list article.is-open .faq-page__answer {
  grid-template-rows: 1fr;
}

.faq-page__answer p {
  max-width: 820px;
  padding: 0 70px 28px 82px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.65;
}

.faq-page__back {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-top: 32px;
  padding: 24px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-low);
}

.faq-page__back p {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

.faq-page__back a:not(.btn) {
  color: var(--md-sys-color-primary);
}

@media (max-width: 780px) {
  .faq-page {
    padding-top: 14px;
  }

  .faq-page__hero {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    border-radius: 32px 32px 14px 32px;
  }

  .faq-page__hero-icon {
    width: 96px;
    height: 96px;
    border-radius: 30px 30px 10px 30px;
    font-size: 50px;
  }

  .faq-page__question {
    grid-template-columns: 44px 1fr 44px;
    gap: 10px;
    min-height: 78px;
    padding-inline: 8px;
  }

  .faq-page__answer p {
    padding: 0 20px 24px 62px;
  }

  .faq-page__back {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
