export const SITE_URL = 'https://metrolist.cc'
export const REPO_URL = 'https://github.com/MetrolistGroup/Metrolist'

// Shown in the footer, FAQ, and llms.txt; written for takedown reviewers as much as users.
export const HOSTING_NOTICE = 'Metrolist does not host, upload, or distribute any music, videos, or other media. It is a client that plays content directly from YouTube Music, the same way the official website does. It does not bypass DRM, and Premium-only features such as premium audio quality require your own YouTube Music Premium subscription.'

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
    description: 'Free, open-source YouTube Music client for Android, iOS, Windows, macOS, and Linux. No ads, background play, synced lyrics, offline downloads, and casting.',
    robots: INDEX,
  },
  faq: {
    title: 'Metrolist FAQ · Install, sign in, update, and import playlists',
    description: 'Answers about Metrolist platforms, installation, YouTube Music sign-in, migration, updates, Spotify playlist import, and safety.',
    robots: INDEX,
  },
  listen: {
    title: 'Listen Together · Metrolist',
    description: 'Join a Metrolist listening room for synchronized playback with friends.',
    robots: 'noindex, follow',
  },
  privacy: {
    title: 'Privacy policy · Metrolist',
    description: 'Learn how Metrolist handles local app data, optional Sentry diagnostics, third-party services, and website requests.',
    robots: INDEX,
  },
  notFound: {
    title: 'Page not found · Metrolist',
    description: 'The requested Metrolist page could not be found.',
    robots: 'noindex, nofollow',
  },
} satisfies Record<string, PageMeta>
