export const SITE_URL = 'https://metrolist.cc'

export type PageMeta = {
  title: string
  description: string
  robots: string
}

export const PAGE_META = {
  home: {
    title: 'Metrolist · Music for every screen',
    description: 'An ad-free, open-source YouTube Music client for Android, iOS, Linux, macOS, and Windows. Explore adaptive layouts, offline playback, lyrics, and more.',
    robots: 'index, follow',
  },
  faq: {
    title: 'Frequently asked questions · Metrolist',
    description: 'Answers about Metrolist platforms, installation, accounts, migration, updates, and open-source music playback.',
    robots: 'index, follow',
  },
  listen: {
    title: 'Listen Together · Metrolist',
    description: 'Join a Metrolist listening room and share the soundtrack with friends.',
    robots: 'noindex, follow',
  },
  privacy: {
    title: 'Privacy policy · Metrolist',
    description: 'Learn how Metrolist handles local app data, optional Sentry diagnostics, third-party services, and website requests.',
    robots: 'index, follow',
  },
  notFound: {
    title: 'Page not found · Metrolist',
    description: 'The requested Metrolist page could not be found.',
    robots: 'noindex, nofollow',
  },
} satisfies Record<string, PageMeta>
