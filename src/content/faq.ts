import { HOSTING_NOTICE } from './site'

export const FAQ_TOPICS = [
  { id: 'installation', title: 'Installation & updates' },
  { id: 'library', title: 'Library & playback' },
  { id: 'privacy', title: 'Privacy & licensing' },
] as const

export type FaqItem = {
  topic: typeof FAQ_TOPICS[number]['id']
  question: string
  answer: string
  guide?: { label: string; href: string }
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    topic: 'installation',
    question: 'Which platforms does Metrolist support?',
    guide: { label: 'Compare clients and installation guides', href: '/guides' },
    answer: 'Metrolist runs on Android 9 and newer, iOS 17 and newer, Linux x64, macOS 15 and newer (Intel and Apple silicon), and Windows 10 x64 and newer. Choose your platform in the download dialog.',
  },
  {
    topic: 'installation',
    question: 'Can I move from the original Metrolist app?',
    guide: { label: 'Moving to Metrolist KMP on Android', href: '/guides/best-youtube-music-client-android-2026#switching-apps' },
    answer: 'Make a backup in the original Android app first. Current KMP builds install separately. Install the KMP app, then restore your backup there. Keep the original until you have checked your library.',
  },
  {
    topic: 'library',
    question: 'Can I log in with my YouTube Music account?',
    guide: { label: 'Listen without a Google account', href: '/guides/youtube-music-without-google-account' },
    answer: 'Yes. Sign in to sync your playlists, library, albums, artists, and songs. You can also listen without signing in or paying for YouTube Music Premium. Audio quality depends on the streams YouTube makes available to your account.',
  },
  {
    topic: 'privacy',
    question: 'Is Metrolist safe to use?',
    answer: 'Metrolist is open source under GPL-3.0, and anyone can inspect its code. Using it to access YouTube Music may violate YouTube\'s Terms of Service. The project has received no reports of bans or restrictions, but that does not guarantee your account is safe. Use Metrolist at your own risk.',
  },
  {
    topic: 'privacy',
    question: 'Does Metrolist host or pirate music?',
    answer: `No. ${HOSTING_NOTICE}`,
  },
  {
    topic: 'installation',
    question: 'How do I update Metrolist?',
    answer: 'Use the in-app updater when available, or install the latest build for your platform from GitHub Releases.',
  },
  {
    topic: 'installation',
    question: "Why isn't Metrolist on the Play Store?",
    answer: 'Google does not allow third-party YouTube clients on the Play Store. Every Metrolist listing there is an unofficial copy from someone else. If you installed one, preserve any data you need before uninstalling it. Report the listing and download the official app from this site.',
  },
  {
    topic: 'library',
    question: 'Can I import my existing Spotify playlists?',
    guide: { label: 'Import a Spotify playlist', href: '/guides/import-spotify-playlists-metrolist' },
    answer: 'Open Settings > Backup & import to import a Spotify playlist link. Metrolist looks for matching songs on YouTube Music, so some tracks may be missing or matched differently.',
  },
  {
    topic: 'installation',
    question: 'Is there an iOS version?',
    guide: { label: 'Install Metrolist on iPhone or iPad', href: '/guides/metrolist-ios-iphone' },
    answer: 'Yes. Get the IPA from the download dialog and install it with AltStore, SideStore, or Sideloadly.',
  },
  {
    topic: 'library',
    question: 'Can I move my library between Android, iOS, and desktop?',
    guide: { label: 'Transfer a library to desktop', href: '/guides/youtube-music-desktop-clients#library-transfer' },
    answer: 'Create a Metrolist backup under Settings > Backup & import, then restore it on the other device. It transfers your library and supported settings, but not downloaded audio files. Restore replaces the destination library, so back it up first. Backups can contain account credentials; keep them private.',
  },
  {
    topic: 'library',
    question: 'Can I listen offline?',
    guide: { label: 'Prepare songs for offline listening', href: '/guides/metrolist-offline-downloads' },
    answer: 'Download songs or playlists while you are online, then play the saved audio without an internet connection on Android, iOS, or desktop. Wait for downloads to finish before going offline.',
  },
]
