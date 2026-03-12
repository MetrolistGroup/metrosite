export type FaqItem = {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is the app safe to use?',
    answer: 'Yes. Metrolist is open-source (GPL-3.0), meaning the code is public and auditable.',
  },
  {
    question: "Why isn't it on the Play Store?",
    answer:
      'Google does not allow third-party YouTube clients on the Play Store. You can safely download updates from GitHub.',
  },
  {
    question: 'How to update?',
    answer:
      'Use the in-app updater, or download the latest APK from GitHub Releases and install it over the old version.',
  },
  {
    question: 'Can I log in with my Google account?',
    answer: 'Yes, Metrolist supports account login to sync your playlists and library.',
  },
  {
    question: 'Is there an iOS version?',
    answer: 'No, Metrolist is Android-only. iOS users can try YTMusicUltimate.',
  },
  {
    question: 'Is there a desktop version?',
    answer: 'No. Try YouTube Music in your browser, or Pear-desktop as an alternative.',
  },
]
