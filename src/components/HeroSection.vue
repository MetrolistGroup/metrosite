<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DownloadDialog from './DownloadDialog.vue'

const repoStats = ref<{ downloads: string; stars: string; version: string }>()
const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

onMounted(async () => {
  try {
    const [repoResponse, releaseResponse] = await Promise.all([
      fetch('https://api.github.com/repos/MetrolistGroup/Metrolist'),
      fetch('https://api.github.com/repos/MetrolistGroup/Metrolist/releases/latest'),
    ])
    if (!repoResponse.ok || !releaseResponse.ok) return

    const repo = await repoResponse.json() as { stargazers_count?: number }
    const release = await releaseResponse.json() as { tag_name?: string; assets?: { download_count?: number }[] }
    const downloads = (release.assets ?? []).reduce((total, asset) => total + (asset.download_count ?? 0), 0)
    repoStats.value = {
      downloads: compactNumber.format(downloads),
      stars: compactNumber.format(repo.stargazers_count ?? 0),
      version: release.tag_name ?? 'Latest',
    }
  } catch {
    // GitHub stats are optional; skeletons remain if the API is unavailable.
  }
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container">
      <div class="hero__layout">
        <div class="hero__copy">
          <h1 id="hero-title">Metrolist brings your music to <span>every screen.</span></h1>
          <p class="hero__lede">
            An open-source YouTube Music client for Android, Linux, macOS, and Windows, with ad-free playback and a layout that fits each platform.
          </p>
          <div class="hero__actions">
            <DownloadDialog button-class="btn btn-filled btn-lg" />
            <a href="https://github.com/MetrolistGroup/Metrolist" class="btn btn-outlined btn-lg" target="_blank" rel="noopener noreferrer">
              <span class="material-symbols-rounded" aria-hidden="true">code</span>
              View source
            </a>
          </div>
        </div>

        <aside class="hero__signal" aria-label="Desktop release summary">
          <span class="hero__signal-icon material-symbols-rounded" aria-hidden="true">desktop_windows</span>
          <div>
            <strong>Desktop has entered the playlist.</strong>
            <p>One Kotlin Multiplatform foundation, fit for every screen.</p>
          </div>
          <dl class="hero__stats" aria-label="Original Metrolist repository statistics">
            <div><dt>Downloads</dt><dd><span v-if="repoStats">{{ repoStats.downloads }}</span><span v-else class="hero__stat-skeleton" /></dd></div>
            <div><dt>Stars</dt><dd><span v-if="repoStats">{{ repoStats.stars }}</span><span v-else class="hero__stat-skeleton" /></dd></div>
            <div><dt>Latest</dt><dd><span v-if="repoStats">{{ repoStats.version }}</span><span v-else class="hero__stat-skeleton" /></dd></div>
          </dl>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 32px 0 86px;
  background: var(--md-sys-color-surface);
}

.hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr);
  gap: 24px;
  padding: clamp(32px, 6vw, 72px);
  border-radius: 44px 44px 18px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.hero__copy {
  max-width: 830px;
}

.hero h1 {
  max-width: 860px;
  margin: 0 0 26px;
  font-size: clamp(3.6rem, 7.1vw, 7rem);
  font-weight: 760;
  letter-spacing: -0.06em;
  line-height: 0.91;
}

.hero h1 span {
  color: var(--md-sys-color-primary);
}

.hero__lede {
  max-width: 680px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: clamp(1.08rem, 1.7vw, 1.3rem);
  line-height: 1.55;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.hero__signal {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  justify-content: space-between;
  align-self: end;
  padding: 28px;
  border-radius: 28px 64px 28px 64px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.hero__signal-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
  font-size: 32px;
}

.hero__signal strong {
  display: block;
  margin-bottom: 10px;
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.hero__signal p {
  color: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 78%, transparent);
  font-size: 0.94rem;
}

.hero__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.hero__stats div {
  min-width: 0;
}

.hero__stats dt {
  margin-bottom: 3px;
  color: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 70%, transparent);
  font-size: 0.68rem;
}

.hero__stats dd {
  min-height: 20px;
  font-size: 0.88rem;
  font-weight: 760;
}

.hero__stat-skeleton {
  display: block;
  width: 70%;
  height: 14px;
  margin-top: 3px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 18%, transparent);
}

@media (max-width: 900px) {
  .hero__layout {
    grid-template-columns: 1fr;
  }

  .hero__signal {
    min-height: 240px;
  }
}

@media (max-width: 700px) {
  .hero {
    padding: 14px 0 64px;
  }

  .hero__layout {
    gap: 32px;
    padding: 30px 24px;
    border-radius: 30px 30px 14px 30px;
  }

  .hero h1 {
    font-size: clamp(3rem, 14vw, 5rem);
  }

  .hero__signal {
    min-height: 220px;
    padding: 24px;
    border-radius: 24px 52px 24px 52px;
  }

}

@media (max-width: 480px) {
  .hero__actions :deep(.btn),
  .hero__actions > .btn {
    width: 100%;
  }

}
</style>
