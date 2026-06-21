<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  body: string
  variant: 'primary' | 'secondary' | 'tertiary'
}

const features: Feature[] = [
  {
    icon: 'block',
    title: 'No ads. Ever.',
    body: 'Stream without interruption. No video ads, no audio ads, no mid-roll breaks. Just the music.',
    variant: 'primary',
  },
  {
    icon: 'headphones',
    title: 'Play it, pocket it.',
    body: "Keeps playing when you lock your screen or switch apps. Background playback without paywalls.",
    variant: 'secondary',
  },
  {
    icon: 'groups',
    title: 'Listen together.',
    body: 'Sync playback with anyone on Metrolist - any network, any country. High performance, minimal latency, open source. Like Spotify Jam, but yours.',
    variant: 'tertiary',
  },
  {
    icon: 'cloud_download',
    title: 'No signal, no problem.',
    body: 'Cache songs and playlists for offline listening. Your library travels with you wherever you go.',
    variant: 'primary',
  },
]
</script>

<template>
  <section id="highlights" class="highlights">
    <div class="container">

      <header class="highlights__header">
        <h2 class="highlights__title">Built differently.</h2>
        <p class="highlights__sub">Everything you would want. Nothing you wouldn't.</p>
      </header>

      <div class="highlights__grid">
        <article v-for="f in features" :key="f.title" :class="['feature-card', `feature-card--${f.variant}`]">
          <div class="feature-card__icon-wrap">
            <span class="icon" aria-hidden="true">{{ f.icon }}</span>
          </div>
          <h3 class="feature-card__title">{{ f.title }}</h3>
          <p class="feature-card__body">{{ f.body }}</p>
        </article>
      </div>

    </div>
  </section>
</template>

<style scoped>
.highlights {
  padding: 80px 0;
}

/* Section header */
.highlights__header {
  text-align: center;
  margin-bottom: 52px;
}

.highlights__title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.025em;
  color: var(--md-on-background);
  margin-bottom: 10px;
  min-height: 1.2em;
}

.highlights__sub {
  font-size: 1.0625rem;
  color: var(--md-on-surface-variant);
}

/* 2 × 2 grid - 4 cards */
.highlights__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* -- Card -- */
.feature-card {
  background: var(--md-sc-low);
  color: var(--md-on-surface);
  border-radius: var(--r-xl);
  padding: 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
  transition: background var(--t-std), box-shadow var(--t-std);
}

.feature-card:hover {
  background: var(--md-sc);
}

/* -- Icon chip -- */
.feature-card__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  margin-bottom: 4px;
  flex-shrink: 0;
}

.feature-card--secondary .feature-card__icon-wrap {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.feature-card--tertiary .feature-card__icon-wrap {
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
}

.feature-card__icon-wrap .icon {
  font-size: 1.625rem;
}

/* -- Text -- */
.feature-card__title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  line-height: 1.2;
  color: var(--md-on-surface);
}

.feature-card__body {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--md-on-surface-variant);
}

/* -- Responsive -- */
@media (max-width: 640px) {
  .highlights__grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 28px 24px;
  }
}
</style>
