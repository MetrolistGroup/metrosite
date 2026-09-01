export type FaqItem = {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Which platforms does Metrolist support?',
    answer: 'Metrolist supports Android 6 and newer, Linux (x64 and ARM64), macOS (Intel and Apple Silicon), and Windows 10 (x64 and ARM64) and newer. Download the package for your platform from the download modal.',
  },
  {
    question: 'Can I move from the original Metrolist app?',
    answer: 'Yes, Metrolist uses the same database as the original Metrolist app, so you can simply install the new app onto the old one to quickly move your data and settings.',
  },
  {
    question: 'Can I log in with my YouTube Music account?',
    answer: 'Yes, account login lets Metrolist sync your playlists, library, albums, artists, and songs. It also allows for premium audio quality playback if you have a YouTube Music Premium subscription.',
  },
  {
    question: 'Is Metrolist safe to use?',
    answer: 'Metrolist is open source under GPL-3.0, so its code is public and auditable. Using 3-rd party clients is technically against YouTube\'s Terms of Service, but there have been no reports of bans for using Metrolist in the entire history of the project.',
  },
  {
    question: 'How do I update Metrolist?',
    answer: 'Use the in-app update option when available, or install the newest build for your platform from GitHub Releases.',
  },
  {
    question: "Why isn't Metrolist on the Play Store?",
    answer: 'Google does not allow third-party YouTube clients on the Play Store. If you installed Metrolist from the Play Store, you have been using a 3-rd party client and should uninstall it, report the app, and install the official app.',
  },
  {
    question: 'Can I import my existing Spotify playlists?',
    answer: 'Yes, go to Account > Settings > Backup and import > Spotify, and follow the instructions.',
  },
  {
    question: 'Is there an iOS version?',
    answer: 'No, iOS support would require a lot of work, and would not be worth the effort. It would essentially be an entirely new app, with a completely different codebase and UI.',
  },
]
