<script setup lang="ts">
import DownloadDialog from './DownloadDialog.vue'
</script>

<template>
  <section class="download" aria-labelledby="download-title">
    <div class="container">
      <div class="download__panel">
        <div class="download__copy">
          <h2 id="download-title">Put your library on a bigger screen.</h2>
          <p>Select Android, Linux, macOS, or Windows and get the right Metrolist build for your device.</p>
        </div>
        <div class="download__actions">
          <DownloadDialog label="Choose a build" button-class="btn btn-filled btn-lg" />
          <a href="https://github.com/MetrolistGroup/Metrolist" class="btn btn-outlined" target="_blank" rel="noopener noreferrer">
            <span class="material-symbols-rounded" aria-hidden="true">code</span>
            Read the source
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.download {
  padding: 84px 0;
  background: var(--md-sys-color-surface);
}

.download__panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 48px;
  align-items: end;
  padding: clamp(32px, 6vw, 72px);
  border-radius: 52px 20px 52px 52px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.download__copy {
  max-width: 760px;
}

.download h2 {
  margin: 0 0 20px;
  font-size: clamp(3rem, 6vw, 5.8rem);
  font-weight: 760;
  letter-spacing: -0.06em;
  line-height: 0.94;
}

.download__copy > p {
  max-width: 560px;
  color: color-mix(in srgb, var(--md-sys-color-on-primary-container) 78%, transparent);
  font-size: 1.04rem;
}

.download__actions {
  display: flex;
  min-width: 220px;
  flex-direction: column;
  gap: 10px;
}

.download__actions .btn-outlined {
  border-color: color-mix(in srgb, var(--md-sys-color-on-primary-container) 46%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

@media (max-width: 920px) {
  .download__panel {
    grid-template-columns: 1fr;
  }

  .download__actions {
    width: min(100%, 300px);
  }
}

@media (max-width: 620px) {
  .download {
    padding: 54px 0;
  }

  .download__panel {
    gap: 28px;
    padding: 30px 24px;
    border-radius: 36px 14px 36px 36px;
  }

  .download__actions {
    width: 100%;
  }

  .download__actions :deep(.btn),
  .download__actions > .btn {
    width: 100%;
  }
}
</style>
