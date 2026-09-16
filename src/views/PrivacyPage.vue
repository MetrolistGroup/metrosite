<script setup lang="ts">
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main id="main" class="privacy-page">
    <div class="container">
      <header class="privacy-page__header">
        <h1>Privacy policy</h1>
        <p class="privacy-page__intro">This policy explains what the Metrolist apps and <a href="https://metrolist.cc">metrolist.cc</a> collect, why it is needed, and what you can control.</p>
        <p class="privacy-page__date">Last updated <time datetime="2026-09-16">September 16, 2026</time></p>
      </header>

      <article class="privacy-page__document">
        <section>
          <h2>About this policy</h2>
          <p>Metrolist is an open-source project maintained by its contributors. It does not operate an advertising network and does not sell or rent personal data.</p>
        </section>

        <section>
          <h2>Data stored by the app</h2>
          <p>Your settings, listening history, library information, downloads, account credentials, and similar app data are stored on your device. Metrolist’s maintainers do not receive that local data.</p>
          <p>When you use an online feature, the app sends the information needed to the service providing it. For example, YouTube or Google receives playback, search, and account requests. Optional integrations such as Last.fm, Discord, lyrics, music recognition, or Listen Together receive data only when you use or enable those features. Those services handle data under their own privacy policies.</p>
        </section>

        <section>
          <h2>Sentry diagnostics</h2>
          <p>Supported release builds can send diagnostic reports to <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">Sentry</a>. Reporting is disabled by default and starts only after you enable it during onboarding or in <strong>Settings → Privacy &amp; Security → Sentry error reporting</strong>. This processing is based on your consent.</p>

          <h3>Information a report may contain</h3>
          <ul>
            <li>App version, platform, operating-system and device characteristics, timestamps, and an app-launch marker.</li>
            <li>Crash or error type, stack traces, affected threads, and Android app-not-responding or native-crash details.</li>
            <li>Playback diagnostics following a playback failure, including the YouTube video ID, song duration, explicit-content flag, source type, playback client and profile, media format, codec, bitrate, sample rate, and attempted playback strategies.</li>
            <li>Your IP address may be processed by Sentry and network providers when they receive a report, although Metrolist does not intentionally add it to the report.</li>
          </ul>

          <h3>Information excluded from reports</h3>
          <p>Metrolist configures Sentry not to send default personally identifiable information. Before reports are sent, the app removes request details, computer names, exception messages, local variables, and unrelated breadcrumbs. Credentials, authentication tokens, cookies, signed media URLs, and account details are not intentionally included. Performance tracing and session replay are disabled.</p>

          <h3>Use and retention</h3>
          <p>Authorized project maintainers use reports only to investigate crashes, app errors, and playback failures. Sentry receives reports through the project’s EU endpoint. Sentry and its subprocessors may process data in other countries under their applicable safeguards.</p>
          <p>Reports remain in Sentry for the retention period configured for the project and are then deleted automatically. We may delete them sooner when they are no longer useful. Diagnostic data is not used for advertising or user profiling.</p>
        </section>

        <section>
          <h2>Website hosting</h2>
          <p><a href="https://metrolist.cc">metrolist.cc</a> is a static site hosted by Cloudflare. It does not set cookies or include tracking, advertising, or analytics scripts. Cloudflare receives the connection data needed to serve the site, such as your IP address, browser information, requested page, and timestamp, under <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare’s privacy policy</a>.</p>
          <p>The site requests public release and repository information from GitHub. When your browser makes those requests, GitHub receives standard connection information under <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub’s privacy statement</a>.</p>
        </section>

        <section>
          <h2>Your choices and rights</h2>
          <p>You can stop future diagnostic reports at any time by disabling Sentry error reporting in the app’s privacy settings. Disabling it closes the reporting client but does not remove reports already sent.</p>
          <p>Depending on where you live, you may have rights to access, correct, delete, restrict, or object to processing of your personal data, withdraw consent, or complain to a data-protection authority. Diagnostic reports are pseudonymous and Metrolist has no user account system of its own, so we may need a Sentry event ID to locate a report and may not be able to associate a report with you.</p>
        </section>

        <section>
          <h2>Children</h2>
          <p>Metrolist is not directed to children under 13, and we do not knowingly collect personal data from children. If you believe a child has sent diagnostic data, contact us so we can review and delete it where possible.</p>
        </section>

        <section>
          <h2>Updates and contact</h2>
          <p>This policy may change when Metrolist’s data practices or service providers change. The date at the top of this page will be updated when that happens.</p>
          <p>For privacy questions or requests, email <a href="mailto:contact@metrolist.cc">contact@metrolist.cc</a>. Do not include passwords, cookies, or authentication tokens in your message.</p>
        </section>
      </article>
    </div>
  </main>
  <FooterSection />
</template>

<style scoped>
.privacy-page {
  padding: clamp(56px, 8vw, 104px) 0 120px;
  background: var(--md-sys-color-surface);
}

.privacy-page__header,
.privacy-page__document {
  width: min(100%, 760px);
  margin-inline: auto;
}

.privacy-page__header {
  margin-bottom: 72px;
}

.privacy-page h1 {
  margin-bottom: 20px;
  font-size: clamp(2.5rem, 6vw, 3.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.privacy-page__intro {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.1rem;
  line-height: 1.7;
}

.privacy-page__date {
  margin-top: 24px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

.privacy-page__document section {
  scroll-margin-top: 110px;
}

.privacy-page__document section + section {
  margin-top: 72px;
}

.privacy-page__document h2 {
  margin-bottom: 18px;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}

.privacy-page__document h3 {
  margin: 32px 0 10px;
  font-size: 1.05rem;
}

.privacy-page__document p,
.privacy-page__document li {
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.75;
}

.privacy-page__document p + p {
  margin-top: 18px;
}

.privacy-page__document ul {
  display: grid;
  gap: 10px;
  padding-left: 20px;
}

.privacy-page a {
  color: var(--md-sys-color-primary);
  text-underline-offset: 3px;
}

@media (max-width: 600px) {
  .privacy-page {
    padding-top: 44px;
  }

  .privacy-page__document section + section {
    margin-top: 56px;
  }
}
</style>
