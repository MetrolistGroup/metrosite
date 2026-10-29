import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const LIBRARY_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-offline-downloads',
    heading: 'How to listen offline with Metrolist',
    meta: {
      title: 'Offline YouTube Music listening with Metrolist',
      description: 'Save songs and playlists for offline playback in Metrolist, understand downloads versus cache, and avoid losing audio when moving a library.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Download your songs before disconnecting. Metrolist plays completed downloads on Android, iOS, and desktop. Check for a completed download on each device; a library or listening history entry alone does not give you an offline copy.',
    sections: [
      {
        id: 'save-the-audio',
        heading: 'Save songs while you are online',
        paragraphs: [
          'Connect to the internet, then use the download action for a song or playlist. Wait for every download to finish before disconnecting; an unfinished transfer cannot play the whole song.',
          'Before a flight or train journey, turn off the network and try the songs you intend to play. Check them on the device you will take with you. Saving a playlist on your computer does not place its audio on your phone.',
        ],
        links: [{ label: 'Metrolist offline playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'downloads-and-cache',
        heading: 'A download is different from the playback cache',
        paragraphs: [
          'Metrolist can cache songs as you listen, which helps with repeated playback. Do not assume the cache contains a whole song just because you started it; playback may stop before Metrolist saves all the audio.',
          'Choose downloads for music you want to take offline. Check free space before saving a large playlist, and review what you remove when clearing app storage. Uninstalling or clearing app data can remove local files and settings.',
        ],
        links: [{ label: 'Metrolist downloads and caching', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'moving-a-library',
        heading: 'Download again after moving your library',
        paragraphs: [
          'A Metrolist backup includes library information and supported settings, but excludes downloaded audio. After you restore a backup on a second device, download the songs on that device before listening offline.',
          'Before you restore, back up the destination if it contains anything you want to keep. Restoring replaces that library. Keep backup files private; they can include account credentials even though they exclude audio files.',
        ],
        links: [{ label: 'What a Metrolist backup transfers', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'quality-and-access',
        heading: 'Check quality and service access before the trip',
        paragraphs: [
          'Metrolist obtains songs from YouTube Music. If a download fails, check for unavailable content, connection problems, or service changes while you are online. Resolve the failure before disconnecting; a queued request is not a saved file.',
          'Premium-only audio quality needs your own YouTube Music Premium subscription. Offline listening in a third-party client does not grant an account entitlement or bypass DRM.',
        ],
        links: [{ label: 'Metrolist media and Premium notice', href: 'https://metrolist.cc/faq' }],
      },
    ],
  },
  {
    slug: 'import-spotify-playlists-metrolist',
    heading: 'Import Spotify playlists into Metrolist',
    meta: {
      title: 'How to import Spotify playlists into Metrolist',
      description: 'Move a Spotify playlist to Metrolist with a playlist link, review YouTube Music matches, and fix missing tracks before downloading the new playlist.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Open Settings > Backup & import in Metrolist and use a Spotify playlist link. Metrolist reads the track list and searches for matching recordings on YouTube Music. The result plays from YouTube Music, so check it before replacing your old playlist.',
    sections: [
      {
        id: 'copy-the-link',
        heading: 'Start with the playlist link',
        paragraphs: [
          'Use the Share option on the Spotify playlist and copy its link. Check that you copied the playlist rather than one song inside it. The URL importer needs to read the playlist before it can search for tracks.',
          'If Metrolist cannot read the link, check that the playlist still exists and that the link gives access to it. For a private playlist, you may need a different import route. Do not make a personal playlist public just to follow a guide unless you are comfortable sharing it.',
        ],
        links: [{ label: 'Metrolist Spotify import instructions', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'run-the-import',
        heading: 'Import the tracks in Metrolist',
        paragraphs: [
          'Open Settings > Backup & import, choose the playlist import option, and paste the Spotify link. Keep the device online while Metrolist reads the list and searches YouTube Music. Larger playlists require more requests than a short test playlist.',
          'Read the import result before retrying. If the import stops early, inspect the partial playlist and the destination you selected, especially if you already keep another version of the same list.',
        ],
        links: [{ label: 'Metrolist library and import help', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'check-the-recordings',
        heading: 'Listen to a few matches',
        paragraphs: [
          'Compare the artist, title, and duration on a few tracks. The same song can appear as a studio recording, a live performance, a remix, or a music video. Search manually for a replacement if a match is wrong.',
          'If tracks are missing, check whether YouTube Music offers those recordings in your region. Spotify playlists can also include local files outside its public catalog. Do not assume YouTube Music has matching audio just because the source playlist names a track.',
        ],
        links: [
          { label: 'Metrolist import matching limitations', href: 'https://metrolist.cc/faq' },
          { label: 'Spotify local files', href: 'https://support.spotify.com/us/article/local-files/' },
        ],
      },
      {
        id: 'after-importing',
        heading: 'Save the imported songs for offline listening',
        paragraphs: [
          'After you check and correct the matches, download the songs in Metrolist if you need them offline. Importing the track list does not download Spotify audio or transfer its subscription benefits.',
          'Treat the import as a snapshot of the playlist. Edit the Spotify and Metrolist copies separately; later Spotify changes do not update the import. Keep the original list until you have checked the songs you care about.',
        ],
        links: [{ label: 'Metrolist offline playback and account guidance', href: 'https://metrolist.cc/faq' }],
      },
    ],
  },
  {
    slug: 'youtube-music-without-google-account',
    heading: 'Use YouTube Music in Metrolist without a Google account',
    meta: {
      title: 'YouTube Music without a Google account · Metrolist',
      description: 'What works in Metrolist without signing in, when a YouTube Music account helps, and why account-free listening is different from anonymous listening.',
      robots: PAGE_META.home.robots,
    },
    intro: 'You can search for music, play songs, and keep listening in the background without signing in to Google. Sign in if you want to load the playlists and library from your YouTube Music account.',
    sections: [
      {
        id: 'start-listening',
        heading: 'Start without signing in',
        paragraphs: [
          'Open Metrolist and search for a song, album, or artist. You can listen without connecting a Google account. The app also supports song downloads for later offline playback.',
          'Keep your device online for searches, streams, and new downloads. The content comes from YouTube Music, which can restrict availability by region or account. Skipping sign-in does not make every track available.',
        ],
        links: [{ label: 'Metrolist sign-in and playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'when-sign-in-helps',
        heading: 'Sign in when you need your account library',
        paragraphs: [
          'Sign in to load the playlists, albums, artists, and songs from your YouTube Music account. Your local Metrolist library is separate from that account library. Use a Metrolist backup to move local library information and supported settings to another device.',
          'Back up the destination library before restoring; the restore replaces it and excludes downloaded audio. Keep backup files private because they can contain credentials.',
        ],
        links: [{ label: 'Account libraries and Metrolist backups', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'privacy',
        heading: 'Account-free listening still makes network requests',
        paragraphs: [
          'YouTube or Google receives the requests needed to search for and play music. Your network connection still reveals information such as an IP address to the services you contact. Listening without a Google account is not a promise of anonymity.',
          'Lyrics providers and optional integrations receive the information they need when you use those functions. Supported Metrolist builds also offer optional Sentry error reporting, which stays off by default and starts only after you enable it. Read the privacy policy to learn about these requests and what diagnostic reports can include.',
        ],
        links: [
          { label: 'Metrolist privacy policy', href: 'https://metrolist.cc/privacy' },
          { label: 'Google privacy policy', href: 'https://policies.google.com/privacy' },
        ],
      },
      {
        id: 'premium-and-account-risk',
        heading: 'A free client does not provide a Premium account',
        paragraphs: [
          'Metrolist provides ad-free background playback as a third-party client. Premium-only audio quality still requires your own eligible YouTube Music Premium subscription and account access.',
          'Read the YouTube Terms of Service before signing in to an account you rely on. Using third-party clients may violate those terms. Do not assume that access to the source code protects your account from YouTube restrictions.',
        ],
        links: [{ label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' }],
      },
    ],
  },
]
