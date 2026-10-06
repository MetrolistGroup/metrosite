import type { FaqItem } from './faq'
import type { DownloadPlatformKey } from './downloads'

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
  compare: {
    title: 'Metrolist vs YouTube Music app · Free ad-free alternative',
    description: 'Compare Metrolist with the official YouTube Music app: ads, background playback, offline downloads, desktop apps, lyrics, casting, and source code.',
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

export type PlatformPage = {
  meta: PageMeta
  /** Short name used in links, e.g. "YouTube Music for Linux". */
  linkLabel: string
  heading: string
  lede: string
  operatingSystem: string
  requirements: string[]
  faq: FaqItem[]
}

export const PLATFORM_PAGES: Record<DownloadPlatformKey, PlatformPage> = {
  android: {
    meta: {
      title: 'Metrolist for Android · Ad-free YouTube Music APK',
      description: 'Download Metrolist, the free, open-source YouTube Music app for Android 6 and newer. No ads, background playback, synced lyrics, offline downloads, and casting.',
      robots: INDEX,
    },
    linkLabel: 'YouTube Music for Android',
    heading: 'The ad-free YouTube Music app for Android.',
    lede: 'Metrolist started on Android and is still at home there. Stream from YouTube Music without ads, keep playing with the screen off, download songs for offline listening, and follow word-by-word lyrics. It is free and open source, from phones to foldables and tablets.',
    operatingSystem: 'Android 6.0 or newer',
    requirements: ['Android 6.0 or newer', 'Phones, foldables, and tablets', 'Universal APK for every CPU architecture'],
    faq: [
      { question: 'Is Metrolist on the Google Play Store?', answer: 'No. Google does not allow third-party YouTube clients on the Play Store, so every Metrolist listing there is an unofficial copy. Download the APK from this site or GitHub Releases instead.' },
      { question: 'Does Metrolist keep playing in the background?', answer: 'Yes. Music keeps playing with the screen off or while you use other apps, with no YouTube Music Premium subscription required.' },
      { question: 'Can I download songs for offline listening on Android?', answer: 'Yes. Download songs, or let Metrolist cache them as you listen, so your library stays available without a connection.' },
      { question: 'How do I install the Metrolist APK?', answer: 'Download the APK, allow installs from your browser or file manager when Android asks, then open the file and confirm the installation.' },
    ],
  },
  ios: {
    meta: {
      title: 'Metrolist for iPhone and iPad · YouTube Music client IPA',
      description: 'Install Metrolist on iOS 17 and newer with AltStore, SideStore, TrollStore, or Sideloadly. A free, open-source YouTube Music client without ads.',
      robots: INDEX,
    },
    linkLabel: 'YouTube Music for iPhone',
    heading: 'An ad-free YouTube Music client for iPhone and iPad.',
    lede: 'Metrolist brings the same library, lyrics, and offline downloads to iOS. It ships as an unsigned IPA on GitHub Releases, so you install it with the sideloading tool you already use.',
    operatingSystem: 'iOS 17 or newer',
    requirements: ['iOS or iPadOS 17 or newer', 'AltStore, SideStore, TrollStore, Sideloadly, or a similar tool', 'One IPA for iPhone and iPad'],
    faq: [
      { question: 'Is Metrolist on the App Store?', answer: 'No. Metrolist for iOS is distributed as an unsigned IPA through GitHub Releases. Sideload it with AltStore, SideStore, TrollStore, Sideloadly, or a similar app.' },
      { question: 'Which iOS versions does Metrolist support?', answer: 'Metrolist supports iPhone and iPad running iOS or iPadOS 17 and newer.' },
      { question: 'Can I sign in with my YouTube Music account on iPhone?', answer: 'Yes. Sign in to sync your playlists, library, albums, artists, and songs. YouTube Music Premium also enables premium audio quality.' },
    ],
  },
  linux: {
    meta: {
      title: 'YouTube Music app for Linux · Metrolist AppImage',
      description: 'Metrolist is a free, open-source YouTube Music desktop app for Linux. Run one AppImage on most x86_64 distributions with no ads, lyrics, and offline downloads.',
      robots: INDEX,
    },
    linkLabel: 'YouTube Music for Linux',
    heading: 'A real YouTube Music desktop app for Linux.',
    lede: 'Google has never released a YouTube Music app for Linux. Metrolist fills the gap with a standalone desktop app built with Kotlin Multiplatform, packaged as a single AppImage that runs on most modern distributions without installation.',
    operatingSystem: 'Linux (x86_64)',
    requirements: ['A modern x86_64 Linux distribution', 'AppImage, no installation or root access needed', 'Desktop layout with keyboard and mouse support'],
    faq: [
      { question: 'Is there an official YouTube Music app for Linux?', answer: 'No. Google only offers YouTube Music on the web for Linux. Metrolist is an open-source desktop client that runs as its own app instead.' },
      { question: 'How do I run the Metrolist AppImage?', answer: 'Download the AppImage, make it executable with chmod +x or your file manager’s “Allow executing as program” option, then open it. You can add it to your application menu with a tool such as Gear Lever or AppImageLauncher.' },
      { question: 'Which Linux distributions does Metrolist support?', answer: 'The AppImage is built to run on most modern x86_64 distributions, such as Ubuntu, Fedora, Debian, and Arch-based systems, without installing packages.' },
    ],
  },
  macos: {
    meta: {
      title: 'YouTube Music app for Mac · Metrolist for macOS',
      description: 'Metrolist is a free, open-source YouTube Music desktop app for macOS on Apple silicon and Intel. No ads, synced lyrics, offline downloads, and casting.',
      robots: INDEX,
    },
    linkLabel: 'YouTube Music for Mac',
    heading: 'A real YouTube Music app for your Mac.',
    lede: 'There is no official YouTube Music app for macOS, only a browser tab. Metrolist gives you a real desktop app for Apple silicon and Intel Macs, with your library, lyrics, and downloads in one window.',
    operatingSystem: 'macOS (Apple silicon and Intel)',
    requirements: ['Apple silicon (M-series) or Intel Mac', 'Separate DMG builds for each architecture', 'Drag-and-drop install into Applications'],
    faq: [
      { question: 'Is there an official YouTube Music app for Mac?', answer: 'No. Google offers YouTube Music on the web for macOS. Metrolist is an open-source desktop client built for Apple silicon and Intel Macs.' },
      { question: 'Which Metrolist build do I need for my Mac?', answer: 'Choose Apple silicon for Macs with M-series chips and Intel for older Macs. You can check under Apple menu > About This Mac.' },
      { question: 'macOS blocked Metrolist on first launch. What do I do?', answer: 'Open System Settings > Privacy & Security, find the message about Metrolist, and choose Open Anyway. You only need to do this once.' },
    ],
  },
  windows: {
    meta: {
      title: 'YouTube Music app for Windows · Metrolist for PC',
      description: 'Download Metrolist, a free, open-source YouTube Music desktop app for Windows 10 and 11. Installer or portable ZIP, no ads, lyrics, and offline downloads.',
      robots: INDEX,
    },
    linkLabel: 'YouTube Music for Windows',
    heading: 'The YouTube Music desktop app Windows never got.',
    lede: 'YouTube Music on Windows usually means a browser tab. Metrolist is a standalone desktop app for Windows 10 and 11 with an installer or a portable ZIP, ad-free playback, synchronized lyrics, and offline downloads.',
    operatingSystem: 'Windows 10 or newer (x64)',
    requirements: ['Windows 10 or Windows 11, x64', 'Installer or portable ZIP', 'Desktop layout with keyboard and mouse support'],
    faq: [
      { question: 'Is there an official YouTube Music app for Windows?', answer: 'No. Google offers YouTube Music on the web and lets you install it as a browser app. Metrolist is a standalone, open-source desktop client instead.' },
      { question: 'Can I use Metrolist without installing it?', answer: 'Yes. Download the portable ZIP, extract it to any folder, and run Metrolist from there.' },
      { question: 'Windows SmartScreen warned me about Metrolist. Is it safe?', answer: 'SmartScreen can warn about new downloads it has not seen often. Metrolist is open source under GPL-3.0, and official builds come only from GitHub Releases. Choose More info, then Run anyway.' },
    ],
  },
}
