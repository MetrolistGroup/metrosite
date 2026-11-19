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
    question: 'Which platforms does Metrolist run on?',
    guide: { label: 'Compare clients and install guides', href: '/guides' },
    answer: 'Metrolist works on Android 7 and newer, iOS 17 and newer, Linux (x64 and ARM64), macOS 15 and newer (Apple silicon and Intel), and Windows 10 and newer (x64 and ARM64). Pick your device in the download window to get the right file.',
  },
  {
    topic: 'installation',
    question: 'Can I move over from the original Metrolist app?',
    guide: { label: 'Switching to Metrolist KMP on Android', href: '/guides/best-youtube-music-client-android-2026#switching-apps' },
    answer: 'Yes. Just make a backup in the original Android app first. Current KMP builds install separately alongside it, so install the KMP app, restore your backup, and keep the original until you’ve checked your library.',
  },
  {
    topic: 'library',
    question: 'Can I sign in with my YouTube Music account?',
    guide: { label: 'Listening without a Google account', href: '/guides/youtube-music-without-google-account' },
    answer: 'Yes. Sign in if you want your playlists, liked songs, albums, and artists synced. Prefer not to? You can listen without signing in or paying for YouTube Music Premium. Audio quality still depends on the streams YouTube makes available to your account.',
  },
  {
    topic: 'privacy',
    question: 'Is Metrolist safe to use?',
    answer: 'Metrolist is open source under GPL-3.0, so anyone can read the code. That said, using a third-party client may go against YouTube’s Terms of Service. We haven’t heard of any bans or restrictions, but that does not guarantee your account is completely safe. Use Metrolist at your own risk.',
  },
  {
    topic: 'privacy',
    question: 'Does Metrolist host or pirate music?',
    answer: `No. ${HOSTING_NOTICE}`,
  },
  {
    topic: 'installation',
    question: 'How do I update Metrolist?',
    answer: 'Use the built-in updater when your platform has one, or grab the newest release from GitHub Releases and install it over your current copy.',
  },
  {
    topic: 'installation',
    question: 'Why isn’t Metrolist on the Play Store?',
    answer: 'Google doesn’t allow third-party YouTube clients on the Play Store, so any “Metrolist” app you find there is an unofficial copy uploaded by someone else. If you installed one, back up anything you want to keep, uninstall it, report the listing, and download the real build from this site.',
  },
  {
    topic: 'library',
    question: 'Can I import my Spotify playlists?',
    guide: { label: 'How to import a Spotify playlist', href: '/guides/import-spotify-playlists-metrolist' },
    answer: 'Yes. Go to Settings > Backup & import and paste a Spotify playlist link. Metrolist searches YouTube Music for matching tracks, so give the playlist a quick check in case a song is missing or pulled a different version.',
  },
  {
    topic: 'installation',
    question: 'Is there an iOS version?',
    guide: { label: 'Install Metrolist on iPhone or iPad', href: '/guides/metrolist-ios-iphone' },
    answer: 'Yes. Grab the IPA from the download window and sideload it using AltStore, SideStore, or Sideloadly.',
  },
  {
    topic: 'library',
    question: 'Can I move my library between Android, iOS, and desktop?',
    guide: { label: 'Move a library to desktop', href: '/guides/youtube-music-desktop-clients#library-transfer' },
    answer: 'Open Settings > Backup & import, create a backup on your current device, and restore it on the new one. It brings over your library and supported settings, but not downloaded audio files. Restoring replaces the library on the destination device, so back that one up first if you want to keep it. Backups can contain account credentials, so keep the file private.',
  },
  {
    topic: 'library',
    question: 'Can I listen offline?',
    guide: { label: 'How offline downloads work', href: '/guides/metrolist-offline-downloads' },
    answer: 'Yes. Download songs or playlists while you’re online, wait for them to finish, and you can play them without an internet connection on Android, iOS, or desktop.',
  },
]
