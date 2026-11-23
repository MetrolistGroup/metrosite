<script setup lang="ts">
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main id="main" class="privacy-page">
    <div class="container">
      <header class="privacy-page__header">
        <h1>Metrobot privacy policy</h1>
        <p class="privacy-page__intro">What Metrobot, the Metrolist community bot for Discord and Telegram, reads, keeps, and shares. This page covers only the bot. The <a href="/privacy">app and website policy</a> is separate.</p>
        <p class="privacy-page__date">Last updated <time datetime="2026-11-23">November 23, 2026</time></p>
      </header>

      <article class="privacy-page__document">
        <section>
          <h2>The short version</h2>
          <p>Metrobot is a moderation, logging, and support bot for the Metrolist community servers. It reads messages and member activity in those servers to do that job. We don't sell your data, show ads, or use it to train AI models. You can't opt out of server logging while you are in the server, but you can ask us to delete the records we store about you.</p>
        </section>

        <section>
          <h2>What the bot reads</h2>
          <ul>
            <li>On Discord, the text of messages in channels it can see, including edits and deletions. This uses Discord's Message Content intent.</li>
            <li>On Discord, the member list and member events such as joins, leaves, role changes, and nickname changes. This uses Discord's Server Members intent.</li>
            <li>On Discord, reactions, which the starboard counts.</li>
            <li>On Telegram, the commands people send to it.</li>
          </ul>
          <p>It doesn't read direct messages between other people, and it doesn't use Discord's Presence intent.</p>
        </section>

        <section>
          <h2>What the bot keeps</h2>
          <h3>In memory only</h3>
          <ul>
            <li>Recent messages for the edit and delete log, up to 1,000 per channel. This lets staff see what a message said after it changed or disappeared. Staff-excluded channels, bot messages, and webhook messages are skipped. This cache is lost whenever the bot restarts.</li>
            <li>Recent AI conversation context, up to 12 messages, which expires after 24 hours. Support follow-up sessions last 3 minutes. Both are lost on restart.</li>
          </ul>

          <h3>In the bot's database</h3>
          <ul>
            <li>Moderation records: warnings, cases, moderator actions, timed bans, and mutes. These hold user IDs, moderator IDs, reasons, and timestamps.</li>
            <li>Starboard posts: the text of a starred message, its author ID, its channel and message IDs, and its star count.</li>
            <li>Reminders you set: your user ID, the channel, the due time, and the reminder text, until it is delivered or deleted.</li>
            <li>Kudos balances and daily streaks, tied to your user ID.</li>
            <li>Nickname approvals, a list of staff-excluded channels, the bot's admin list, and the staff-written notes.</li>
          </ul>
          <p>The database doesn't expire records on its own. Staff remove them, for example when a warning is withdrawn, or when you ask.</p>

          <h3>In Discord</h3>
          <p>The edit and delete log and the member event log are posted to private staff channels on Discord. They can include message text, author names and IDs, and channel names. Discord stores them under its own policies, and staff decide how long they stay.</p>

          <h3>In log files</h3>
          <p>Operational logs mostly hold IDs and error details. A failed Wolfram Alpha lookup logs the text of the query.</p>

          <h3>What it doesn't keep</h3>
          <p>The bot doesn't build per-user AI memory or profiles. A small shared notes file holds staff-written background for the AI. It can only be changed on an explicit request from the project owners, and it isn't a profile of any member.</p>
        </section>

        <section>
          <h2>When your messages go to an AI model</h2>
          <p>In the app-support channel, every message that isn't a command or addressed to someone else is sent to an AI router that decides whether the bot should answer. In other channels, the bot only responds when you address it, for example with its name, a mention, or a reply to it. After it answers, it may keep following the conversation for about two minutes.</p>
          <p>When the AI answers, it receives the message, the recent conversation, your username or display name, and your server roles. It can also read recent messages in the channel, and up to three images attached to a support message. The private translate command sends the selected message text or images to the same provider.</p>
          <p>These requests go to <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer">OpenRouter</a>, which passes them to the model provider. We ask OpenRouter to use only providers that don't collect user data. We don't use your messages to train or fine-tune any model, and we don't know of any provider that does.</p>
          <p>To stop automatic replies in the support channel, tell the bot to stop, or reply to or mention another person. Automatic replies to you then pause for 20 minutes.</p>
        </section>

        <section>
          <h2>Other services the bot contacts</h2>
          <ul>
            <li>Firecrawl receives web search queries when the AI researches an answer.</li>
            <li>Wolfram Alpha receives the question when someone uses its command.</li>
            <li>GitHub receives searches of the public Metrolist repository.</li>
            <li>GSMArena, NanoReview, and Technical City receive device names for specification lookups. The bot caches the pages it fetches, and the cache holds no user data.</li>
            <li>Discord and Telegram carry all messages under their own privacy policies.</li>
          </ul>
        </section>

        <section>
          <h2>Your choices and rights</h2>
          <p>You can't opt out of message logging while you are in a server where the bot runs. You can leave the server, and you can ask staff to exclude a channel from logging.</p>
          <p>You can ask to see or delete the records we store about you, such as reminders, kudos, starboard posts, and moderation records. We may keep moderation records we need to enforce a ban or protect the community. Depending on where you live, you may also have the right to correct or restrict processing of your data, or to contact a data-protection authority.</p>
          <p>Deleting a record in the bot's database doesn't remove copies in Discord, such as log entries, or in another provider's systems.</p>
        </section>

        <section>
          <h2>Children</h2>
          <p>Discord and Telegram require users to be at least 13. Metrobot isn't aimed at children, and we don't knowingly keep personal data from them beyond what those platforms provide. If you think a child's data is stored, reach out and we'll review it.</p>
        </section>

        <section>
          <h2>Updates and contact</h2>
          <p>If the bot's data practices or providers change, we'll update this page and bump the date at the top.</p>
          <p>Questions or privacy requests? Email <a href="mailto:contact@metrolist.cc">contact@metrolist.cc</a> or ask a moderator in the server. Include your Discord or Telegram user ID so we can find your records.</p>
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
  font: var(--md-sys-typescale-display-small);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
}

.privacy-page__intro {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.privacy-page__date {
  margin-top: 24px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.privacy-page__document section {
  scroll-margin-top: 110px;
}

.privacy-page__document section + section {
  margin-top: 72px;
}

.privacy-page__document h2 {
  margin-bottom: 18px;
  font: var(--md-sys-typescale-headline-large);
  letter-spacing: var(--md-sys-typescale-headline-large-tracking);
}

.privacy-page__document h3 {
  margin: 32px 0 10px;
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
}

.privacy-page__document p,
.privacy-page__document li {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  line-height: 1.7;
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
