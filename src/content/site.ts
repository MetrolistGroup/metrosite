export const SITE_URL = 'https://metrolist.cc'
export const REPO_URL = 'https://github.com/MetrolistGroup/Metrolist'

// Large image previews and full snippets let search results show screenshots and complete answers.
const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1'

export type PageMeta = {
  title: string
  description: string
  robots: string
}

export const PAGE_META = {
  home: {
    title: 'Metrolist · Ad-free YouTube Music client for every device',
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
    description: 'Join a Metrolist listening room and share the soundtrack with friends.',
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
