export type FaqItem = {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Which platforms does Metrolist support?',
    answer: 'Metrolist runs on Android 6 and newer, iOS 17 and newer, Linux x64, macOS (Intel and Apple Silicon), and Windows 10 x64 and newer. Choose your platform in the download modal.',
  },
  {
    question: 'Can I move from the original Metrolist app?',
    answer: 'Yes. Install the new app over the original to keep your data and settings. Both apps use the same database.',
  },
  {
    question: 'Can I log in with my YouTube Music account?',
    answer: 'Yes. Sign in to sync your playlists, library, albums, artists, and songs. A YouTube Music Premium subscription also enables premium audio quality.',
  },
  {
    question: 'Is Metrolist safe to use?',
    answer: 'Metrolist is open source under GPL-3.0, and anyone can inspect its code. Third-party clients technically violate YouTube\'s Terms of Service. No bans for using Metrolist have been reported since the project began.',
  },
  {
    question: 'How do I update Metrolist?',
    answer: 'Use the in-app updater when available, or install the latest build for your platform from GitHub Releases.',
  },
  {
    question: "Why isn't Metrolist on the Play Store?",
    answer: 'Google does not allow third-party YouTube clients on the Play Store. Every Metrolist listing there is an unofficial copy from someone else. If you installed one, uninstall it, report the listing, and download the official app from this site.',
  },
  {
    question: 'Can I import my existing Spotify playlists?',
    answer: 'Yes. Open Account > Settings > Backup and import > Spotify and follow the instructions.',
  },
  {
    question: 'Is there an iOS version?',
    answer: 'Yes. Get the IPA from the download modal and install it with AltStore, SideStore, TrollStore, Sideloadly, or another sideloading app.',
  },
]
