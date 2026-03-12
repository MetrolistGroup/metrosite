export type FaqItem = {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is it safe to use?',
    answer: 'Yes. Metrolist is open-source (GPL-3.0), meaning the code is public and auditable.',
  },
  {
    question: "Why isn't it on the Play Store?",
    answer:
      'Google does not allow third-party YouTube clients on the Play Store. You can safely download updates from GitHub.',
  },
  {
    question: 'How to update?',
    answer: 'Download the latest APK from Releases and install it over the old version.',
  },
  {
    question: 'Can I log in with my Google account?',
    answer: 'Yes, Metrolist supports account login to sync your playlists and library.',
  },
  {
    question: 'Is there an iOS version?',
    answer: 'No, Metrolist is currently only available for Android.',
  },
]
