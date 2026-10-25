<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from '../components/DownloadDialog.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
import { GUIDES, GUIDE_COLLECTIONS, GUIDE_DISCLOSURE, GUIDE_INDEX_META, GUIDE_REVIEW_DATE, getRelatedGuides } from '../content/guides'

const props = defineProps<{ slug?: string }>()
const route = useRoute()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const currentSection = (id: string) => mounted.value && route.hash === `#${id}` ? 'location' : undefined
const guide = computed(() => GUIDES.find(guide => guide.slug === props.slug))
const relatedGuides = computed(() => getRelatedGuides(props.slug ?? ''))
const reviewDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(new Date(GUIDE_REVIEW_DATE))
</script>

<template>
  <NavBar />
  <main id="main" class="guides-page">
    <div class="container guides-page__container">
      <header class="guides-page__header">
        <nav class="guides-page__breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink v-if="guide" to="/guides">Guides</RouterLink>
          <span v-else aria-current="page">Guides</span>
        </nav>
        <h1 id="guides-title">{{ guide?.heading ?? 'YouTube Music app guides' }}</h1>
        <p class="guides-page__intro">{{ guide?.intro ?? GUIDE_INDEX_META.description }}</p>
        <p class="guides-page__disclosure">{{ GUIDE_DISCLOSURE }}</p>
        <p class="guides-page__date">Sources checked <time :datetime="GUIDE_REVIEW_DATE">{{ reviewDate }}</time></p>
      </header>

      <article v-if="guide" class="guides-page__document" aria-labelledby="guides-title">
        <nav class="guides-page__topics" aria-label="Guide sections">
          <p>Contents</p>
          <ul>
            <li v-for="section in guide.sections" :key="section.id">
              <RouterLink :to="{ path: `/guides/${guide.slug}`, hash: `#${section.id}` }" :aria-current="currentSection(section.id)">{{ section.heading }}</RouterLink>
            </li>
          </ul>
        </nav>

        <section v-for="section in guide.sections" :key="section.id" :aria-labelledby="section.id">
          <h2 :id="section.id" tabindex="-1">{{ section.heading }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="section.links?.length" class="guides-page__sources" aria-label="Sources">
            <li v-for="link in section.links" :key="link.href"><a :href="link.href">{{ link.label }}</a></li>
          </ul>
        </section>

        <footer class="guides-page__related">
          <h2>Related guides</h2>
          <ul>
            <li v-for="related in relatedGuides" :key="related.slug">
              <RouterLink :to="`/guides/${related.slug}`">{{ related.heading }}</RouterLink>
            </li>
          </ul>
          <RouterLink to="/guides">All guides</RouterLink>
        </footer>
      </article>

      <div v-else class="guides-page__collections">
        <nav class="guides-page__topics" aria-label="Guide topics">
          <p>Topics</p>
          <ul>
            <li v-for="collection in GUIDE_COLLECTIONS" :key="collection.id">
              <RouterLink :to="{ path: '/guides', hash: `#${collection.id}` }" :aria-current="currentSection(collection.id)">{{ collection.heading }}</RouterLink>
            </li>
          </ul>
        </nav>
        <section v-for="collection in GUIDE_COLLECTIONS" :key="collection.id" :aria-labelledby="collection.id">
          <h2 :id="collection.id" tabindex="-1">{{ collection.heading }}</h2>
          <ul class="guides-page__list">
            <li v-for="item in collection.guides" :key="item.slug">
              <h3><RouterLink :to="`/guides/${item.slug}`">{{ item.heading }}</RouterLink></h3>
              <p>{{ item.meta.description }}</p>
            </li>
          </ul>
        </section>
      </div>

      <section v-if="guide" class="guides-page__next" aria-labelledby="guides-download-title">
        <h2 id="guides-download-title">Install Metrolist</h2>
        <p><RouterLink :to="{ path: '/', hash: '#desktop' }">See the app previews</RouterLink> and <RouterLink to="/faq">read the FAQ</RouterLink> for installation, account, and safety details.</p>
        <DownloadDialog />
      </section>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.guides-page {
  padding: clamp(40px, 6vw, 80px) 0 104px;
  background: var(--md-sys-color-surface);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  overflow-wrap: anywhere;
}

.guides-page__container {
  max-width: 68ch;
}

.guides-page__header {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.guides-page h1 {
  margin-top: 16px;
  font: var(--md-sys-typescale-display-small);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
}

.guides-page h2 {
  margin-bottom: 18px;
  font: var(--md-sys-typescale-headline-medium);
  letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
}

.guides-page p {
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.7;
}

.guides-page a {
  color: var(--md-sys-color-primary);
  text-underline-offset: 4px;
}

.guides-page__breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
}

.guides-page__breadcrumb a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
}

.guides-page__intro {
  margin-top: 24px;
}

.guides-page__disclosure,
.guides-page__date {
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.guides-page__disclosure {
  margin-top: 24px;
}

.guides-page__date {
  margin-top: 12px;
}

.guides-page__topics {
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  font: var(--md-sys-typescale-body-medium);
}

.guides-page__topics p {
  font: var(--md-sys-typescale-label-large);
}

.guides-page__topics ul,
.guides-page__related ul,
.guides-page__list {
  list-style: none;
}

.guides-page__topics ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0 24px;
  margin-top: 12px;
}

.guides-page__topics a,
.guides-page__related a {
  display: block;
  padding-block: 10px;
  min-height: 44px;
}

.guides-page__document section + section {
  margin-top: 56px;
}

.guides-page__document p + p {
  margin-top: 18px;
}

.guides-page__sources {
  margin-top: 24px;
  padding-left: 20px;
  font: var(--md-sys-typescale-body-medium);
}

.guides-page__sources li + li {
  margin-top: 10px;
}

.guides-page__related,
.guides-page__next {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.guides-page__collections section + section {
  margin-top: 56px;
}

.guides-page__list h3 {
  margin-bottom: 12px;
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
}

.guides-page__list li {
  padding-block: 32px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.guides-page__list li:first-child {
  padding-top: 0;
}

.guides-page__next p {
  margin-bottom: 24px;
}

.guides-page__next :deep(.btn) {
  max-width: 100%;
  white-space: normal;
  text-align: center;
}

@media (max-width: 600px) {
  .guides-page {
    padding-bottom: 72px;
  }

  .guides-page__header,
  .guides-page__topics {
    margin-bottom: 32px;
  }

  .guides-page__document section + section,
  .guides-page__related,
  .guides-page__next {
    margin-top: 40px;
  }
}
</style>
