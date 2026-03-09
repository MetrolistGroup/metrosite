<template>
  <section class="download">
    <div class="container">
      <div class="download__card">

        <div class="download__copy">
          <h2 class="download__title">Ready to listen?</h2>
          <p class="download__sub">
            Free, open, and always up to date on GitHub.
            Install takes under a minute.
          </p>
        </div>

        <div class="download__actions">
          <a
            href="https://github.com/MetrolistGroup/Metrolist/releases"
            class="btn btn-filled btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="icon" aria-hidden="true">download</span>
            Download APK
          </a>
          <a
            href="https://github.com/MetrolistGroup/Metrolist/releases"
            class="download__changelog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Latest release on GitHub
            <span class="icon" style="font-size: 1rem" aria-hidden="true">arrow_forward</span>
          </a>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.download {
  padding: 40px 0 100px;
}

.download__card {
  background: var(--md-primary-container);
  border-radius: var(--r-2xl);
  padding: 60px 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.download__title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  letter-spacing: -0.025em;
  color: var(--md-on-primary-container);
  margin-bottom: 10px;
}

.download__sub {
  font-size: 1rem;
  color: color-mix(in srgb, var(--md-on-primary-container) 72%, transparent);
  max-width: 38ch;
  line-height: 1.65;
}

.download__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  flex-shrink: 0;
}

/* Override filled button to sit on tonal background correctly */
.download__card .btn-filled {
  background: var(--md-primary);
  color: var(--md-on-primary);
  box-shadow: var(--el-1);
}

.download__card .btn-filled:hover {
  box-shadow: var(--el-3);
}

.download__changelog {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--md-on-primary-container);
  text-decoration: none;
  opacity: 0.72;
  transition: opacity var(--t-fast);
}

.download__changelog:hover {
  opacity: 1;
}

@media (max-width: 700px) {
  .download__card {
    flex-direction: column;
    align-items: flex-start;
    padding: 40px 28px;
  }
}
</style>
