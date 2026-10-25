<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import FooterSection from '../components/FooterSection.vue'
import { FAQ_ITEMS, FAQ_TOPICS } from '../content/faq'

const route = useRoute()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const currentTopic = (id: string) => mounted.value && route.hash === `#${id}` ? 'location' : undefined

const topicGroups = FAQ_TOPICS.map(topic => ({
  ...topic,
  items: FAQ_ITEMS.filter(item => item.topic === topic.id),
}))
</script>

<template>
  <NavBar />
  <main id="main" class="faq-page">
    <div class="container faq-page__container">
      <header class="faq-page__header">
        <nav class="faq-page__breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">FAQ</span>
        </nav>
        <h1>Frequently asked questions</h1>
      </header>

      <div class="faq-page__layout">
        <nav class="faq-page__index" aria-label="FAQ topics">
          <p class="faq-page__eyebrow">Topics</p>
          <ul>
            <li v-for="topic in FAQ_TOPICS" :key="topic.id">
              <RouterLink :to="{ path: '/faq', hash: `#${topic.id}` }" :aria-current="currentTopic(topic.id)">{{ topic.title }}</RouterLink>
            </li>
          </ul>
        </nav>

        <div class="faq-page__content">
          <section
            v-for="topic in topicGroups"
            :key="topic.id"
            class="faq-page__topic"
            :aria-labelledby="topic.id"
          >
            <h2 :id="topic.id" tabindex="-1">{{ topic.title }}</h2>
            <div class="faq-page__questions">
              <details v-for="item in topic.items" :key="item.question" class="faq-disclosure">
                <summary class="faq-page__question">
                  <h3>
                    {{ item.question }}
                    <span class="faq-page__mark" aria-hidden="true"></span>
                  </h3>
                </summary>
                <div class="faq-page__answer">
                  <p>{{ item.answer }}</p>
                  <p v-if="item.guide"><RouterLink :to="item.guide.href">{{ item.guide.label }}</RouterLink></p>
                </div>
              </details>
            </div>
          </section>

          <footer class="faq-page__support">
            <a href="https://github.com/MetrolistGroup/Metrolist/issues" target="_blank" rel="noopener noreferrer">Report an issue on GitHub</a>
            <RouterLink :to="{ path: '/faq', hash: '#main' }">Back to top</RouterLink>
          </footer>
        </div>
      </div>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.faq-page {
  padding: clamp(40px, 6vw, 80px) 0 104px;
  background: var(--md-sys-color-surface);
  overflow-wrap: anywhere;
}

.faq-page__container {
  max-width: 1080px;
}

.faq-page__header {
  padding-bottom: 40px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.faq-page__eyebrow {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-medium);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  text-transform: uppercase;
}

.faq-page h1 {
  max-width: 820px;
  margin-top: 16px;
  font: var(--md-sys-typescale-display-small);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
}

.faq-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
}

.faq-page__breadcrumb a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
}

.faq-page__layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: clamp(40px, 6vw, 80px);
  margin-top: 48px;
}

.faq-page__index {
  align-self: start;
}

.faq-page__index ul {
  display: grid;
  margin-top: 14px;
  list-style: none;
}

.faq-page__index a {
  display: block;
  padding-block: 12px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  text-decoration-color: var(--md-sys-color-outline);
}

.faq-page__index a[aria-current='location'] {
  color: var(--md-sys-color-primary);
  text-decoration-color: currentColor;
  text-decoration-thickness: 2px;
}

.faq-page a {
  text-underline-offset: 4px;
}

.faq-page a:hover {
  color: var(--md-sys-color-primary);
}

.faq-page__topic + .faq-page__topic {
  margin-top: 56px;
}

.faq-page__topic h2 {
  margin-bottom: 20px;
  font: var(--md-sys-typescale-headline-medium);
  letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
}

.faq-page__questions {
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.faq-page__questions details {
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.faq-page__questions details[open] {
  background: var(--md-sys-color-surface-container-low);
}

.faq-page__question {
  display: block;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
}

.faq-page__question::-webkit-details-marker {
  display: none;
}

.faq-page__question:focus-visible {
  outline-offset: -3px;
}

.faq-page__question h3 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px;
  gap: 24px;
  align-items: center;
  min-height: 72px;
  padding: 20px 16px;
  font: var(--md-sys-typescale-title-medium);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  text-wrap: wrap;
}

.faq-page__mark {
  position: relative;
  width: 16px;
  height: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.faq-page__mark::before,
.faq-page__mark::after {
  content: '';
  position: absolute;
  background: currentColor;
}

.faq-page__mark::before {
  inset: 7px 0 auto;
  height: 2px;
}

.faq-page__mark::after {
  inset: 0 auto 0 7px;
  width: 2px;
  transition: transform var(--md-motion-spatial-fast);
}

.faq-page__questions details[open] .faq-page__mark::after {
  transform: scaleY(0);
}

.faq-page__answer {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.faq-page__answer p {
  padding: 0 56px 24px 16px;
}

.faq-page__support {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px 32px;
  margin-top: 48px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.faq-page__support a,
.faq-page__answer a {
  color: var(--md-sys-color-primary);
}

@media (min-width: 901px) and (min-height: 700px) {
  .faq-page__index {
    position: sticky;
    top: 112px;
  }
}

@media (max-width: 900px) {
  .faq-page__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
    margin-top: 32px;
  }

  .faq-page__index ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0 28px;
    margin-top: 8px;
  }
}

@media (max-width: 600px) {
  .faq-page {
    padding-bottom: 72px;
  }

  .faq-page__header {
    padding-bottom: 28px;
  }

  .faq-page__topic + .faq-page__topic {
    margin-top: 40px;
  }

  .faq-page__answer p {
    padding-right: 16px;
  }
}
</style>
