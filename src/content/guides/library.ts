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
    intro: 'Download your songs before disconnecting. Metrolist plays completed downloads on Android, iOS, and desktop. A song appearing in your library or listening history does not mean its audio is saved on the device.',
    sections: [
      {
        id: 'save-the-audio',
        heading: 'Save songs while you are online',
        paragraphs: [
          'Use the download action for a song or playlist while the device has an internet connection. Wait for the downloads to finish. An unfinished transfer cannot provide the whole song after you disconnect.',
          'Before a flight or train journey, turn off the network and try the songs you intend to play. Check them on the device you will take with you. Saving a playlist on your computer does not place its audio on your phone.',
        ],
        links: [{ label: 'Metrolist offline playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'downloads-and-cache',
        heading: 'A download is different from the playback cache',
        paragraphs: [
          'Metrolist can cache songs as you listen. A cache is useful for repeated playback, but do not rely on a song being cached just because you started it. Playback may have ended before the full audio was saved.',
          'Choose downloads for music you want to take offline. Check free space before saving a large playlist, and review what you remove when clearing app storage. Uninstalling or clearing app data can remove local files and settings.',
        ],
        links: [{ label: 'Metrolist downloads and caching', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'moving-a-library',
        heading: 'Download again after moving your library',
        paragraphs: [
          'A Metrolist backup carries library information and supported settings. It excludes downloaded audio. After restoring that backup on a second device, download the songs there before expecting offline playback.',
          'Restore replaces the destination library, so create a backup there first if it contains anything you want to keep. Store backup files privately. They can include account credentials even though they do not include the audio files.',
        ],
        links: [{ label: 'What a Metrolist backup transfers', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'quality-and-access',
        heading: 'Check quality and service access before the trip',
        paragraphs: [
          'Metrolist still obtains songs from YouTube Music. A failed download may reflect unavailable content, a connection problem, or a service change. Resolve it while you are online rather than treating a queued request as a saved file.',
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
          'If it cannot read the link, check that the playlist still exists and that the link gives access to it. A private playlist can need a different import route than a public share link. Do not make a personal playlist public just to follow a guide unless you are comfortable sharing it.',
        ],
        links: [{ label: 'Metrolist Spotify import instructions', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'run-the-import',
        heading: 'Import the tracks in Metrolist',
        paragraphs: [
          'Open Settings > Backup & import, use the playlist import option, and paste the Spotify link. Keep the device online while Metrolist reads the list and searches YouTube Music. Larger playlists take more requests than a short test playlist.',
          'Check the reported result before starting again. An interrupted import can leave a partial playlist. Look at that playlist and the destination you selected before retrying, especially if you already keep another version of the same list.',
        ],
        links: [{ label: 'Metrolist library and import help', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'check-the-recordings',
        heading: 'Listen to a few matches',
        paragraphs: [
          'The same song can appear as a studio recording, a live performance, a remix, or a music video. Compare the artist, title, and duration on a few tracks. Search manually for a replacement if a match is wrong.',
          'Some tracks may be missing because YouTube Music does not offer the same recording in your region. A local file added to a Spotify playlist is also different from a track available through its public catalog. A name in the source playlist is not proof that matching audio exists on YouTube Music.',
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
          'Once the matches are right, use Metrolist to download the songs if you need them offline. Importing the track list does not download Spotify audio or transfer its subscription benefits.',
          'Treat the import as a copy of the playlist at that point. Editing Spotify later is separate from editing the Metrolist result. Keep the original list until you have checked the songs you care about.',
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
    intro: 'You can search and play music in Metrolist without signing in to Google. Background playback is available too. Sign in if you want access to the playlists and library saved in your YouTube Music account.',
    sections: [
      {
        id: 'start-listening',
        heading: 'Start without signing in',
        paragraphs: [
          'Open Metrolist and search for a song, album, or artist. You can listen without connecting a Google account. The app also supports song downloads for later offline playback.',
          'The content still comes from YouTube Music. You need network access for searches, streams, and new downloads, and the service can restrict what is available by region or account. Skipping sign-in does not make every track available.',
        ],
        links: [{ label: 'Metrolist sign-in and playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'when-sign-in-helps',
        heading: 'Sign in when you need your account library',
        paragraphs: [
          'Your saved YouTube Music playlists, albums, artists, and songs belong to that account. Metrolist needs a sign-in to load them. A local library on one device is a separate matter. Use a Metrolist backup to move local library information and supported settings to another device.',
          'A backup restore replaces the destination library and excludes downloaded audio. Back up the destination before restoring, and keep the file private because it can contain credentials.',
        ],
        links: [{ label: 'Account libraries and Metrolist backups', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'privacy',
        heading: 'Account-free listening still makes network requests',
        paragraphs: [
          'YouTube or Google receives the requests needed to search for and play music. Your network connection still reveals information such as an IP address to the services you contact. Listening without a Google account is not a promise of anonymity.',
          'Lyrics providers and optional integrations receive the information needed when you use those functions. Supported Metrolist builds also have optional Sentry error reporting. It is off by default and starts after you enable it. The privacy policy explains those requests and what diagnostic reports can include.',
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
          'Using third-party clients may violate the YouTube Terms of Service. Consider that before signing in to an account you rely on. Having access to the source code does not guarantee that YouTube will never restrict an account.',
        ],
        links: [{ label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' }],
      },
    ],
  },
]
