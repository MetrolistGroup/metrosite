export const SITE_URL = 'https://metrolist.cc'
export const REPO_URL = 'https://github.com/MetrolistGroup/Metrolist'

// Shown in the footer, FAQ, and llms.txt; written for takedown reviewers as much as users.
export const HOSTING_NOTICE = 'Metrolist does not host, upload, or distribute any music, videos, or other media. It plays streams directly from YouTube Music, just like the official website. It does not bypass DRM, and Premium-only features like higher audio quality still require your own YouTube Music Premium subscription.'

// Large image previews and full snippets let search results show screenshots and complete answers.
const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1'

export type PageMeta = {
  title: string
  description: string
  robots: string
}

export const PAGE_META = {
  home: {
    title: 'Metrolist · Music without the noise',
    description: 'A free, open-source YouTube Music player for Android, iOS, Windows, macOS, and Linux. No ads, background play, synced lyrics, offline downloads, and casting.',
    robots: INDEX,
  },
  faq: {
    title: 'Metrolist FAQ · Install, sign in, update, and import playlists',
    description: 'Straight answers on installing Metrolist, signing in with YouTube Music, moving your library, importing Spotify playlists, updating, and staying safe.',
    robots: INDEX,
  },
  listen: {
    title: 'Listen Together · Metrolist',
    description: 'Join a Metrolist listening room and stay in sync with friends.',
    robots: 'noindex, follow',
  },
  share: {
    title: 'Shared music · Metrolist',
    description: 'Open this shared song, playlist, album, or artist in Metrolist or on YouTube Music.',
    robots: 'noindex, follow',
  },
  sync: {
    title: 'Lyrics sync · Metrolist',
    description: 'Time lyrics line by line or word by word right in your browser, then export to MLX, LRC, Enhanced LRC, or TTML.',
    robots: INDEX,
  },
  privacy: {
    title: 'Privacy policy · Metrolist',
    description: 'What Metrolist keeps on your device, how optional Sentry crash reports work, and what the website sends.',
    robots: INDEX,
  },
  privacyBot: {
    title: 'Metrobot privacy policy · Metrolist',
    description: 'What the Metrolist Discord and Telegram bot reads, keeps, and shares, including logs, AI replies, and how to ask for deletion.',
    robots: INDEX,
  },
  notFound: {
    title: 'Page not found · Metrolist',
    description: 'We couldn’t find that Metrolist page.',
    robots: 'noindex, nofollow',
  },
} satisfies Record<string, PageMeta>
