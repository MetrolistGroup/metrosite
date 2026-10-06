import type { FaqItem } from './faq'

export type CompareRow = {
  feature: string
  metrolist: string
  free: string
  premium: string
}

// Keep every cell factual and current. Name only behavior a reader can verify.
export const COMPARE_ROWS: CompareRow[] = [
  { feature: 'Price', metrolist: 'Free', free: 'Free', premium: 'Monthly subscription' },
  { feature: 'Ads', metrolist: 'None', free: 'Audio and video ads', premium: 'None' },
  { feature: 'Background playback on phones', metrolist: 'Yes', free: 'No', premium: 'Yes' },
  { feature: 'Offline downloads', metrolist: 'Yes', free: 'No', premium: 'Yes' },
  { feature: 'Windows, macOS, and Linux', metrolist: 'Standalone desktop apps', free: 'Web player or browser app', premium: 'Web player or browser app' },
  { feature: 'Word-by-word synced lyrics', metrolist: 'Yes, with translation and romanization where available', free: 'Varies by song', premium: 'Varies by song' },
  { feature: 'Casting', metrolist: 'Chromecast, DLNA, and FCast', free: 'Chromecast', premium: 'Chromecast' },
  { feature: 'Tempo, pitch, and skip silence', metrolist: 'Yes', free: 'No', premium: 'No' },
  { feature: 'Listen Together rooms', metrolist: 'Yes', free: 'No', premium: 'No' },
  { feature: 'Source code', metrolist: 'Open source, GPL-3.0', free: 'Closed', premium: 'Closed' },
  { feature: 'Made by Google', metrolist: 'No, independent project', free: 'Yes', premium: 'Yes' },
]

export const COMPARE_FAQ: FaqItem[] = [
  { question: 'Is Metrolist a free alternative to YouTube Music Premium?', answer: 'Metrolist gives you ad-free playback, background play, and offline downloads without a subscription. It still streams from YouTube Music, and a Premium subscription remains the official way to support artists and unlock premium audio quality.' },
  { question: 'Can I keep my YouTube Music library in Metrolist?', answer: 'Yes. Sign in with your YouTube Music account to sync your playlists, library, albums, artists, and liked songs.' },
  { question: 'Is Metrolist made by Google?', answer: 'No. Metrolist is an independent, open-source project and is not affiliated with Google. Third-party clients technically violate YouTube’s Terms of Service, though no bans for using Metrolist have been reported.' },
  { question: 'Does YouTube Music have a desktop app?', answer: 'Google offers YouTube Music only on the web for computers, which you can install as a browser app. Metrolist ships standalone apps for Windows, macOS, and Linux.' },
]
