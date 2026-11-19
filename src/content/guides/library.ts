import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const LIBRARY_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-offline-downloads',
    heading: 'How to listen offline with Metrolist',
    meta: {
      title: 'Offline YouTube Music listening with Metrolist',
      description: 'How to download songs and playlists for offline playback in Metrolist, the difference between downloads and cache, and what happens when you switch devices.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Save your songs before you head out of range. Completed downloads play offline on Android, iOS, and desktop, as long as they finish on the device you’re actually taking with you.',
    sections: [
      {
        id: 'save-the-audio',
        heading: 'Download while you’re online',
        paragraphs: [
          'Tap the download button on any song, album, or playlist while you have a connection, and let the downloads finish completely before disconnecting.',
          'Before a flight or long train ride, flick on airplane mode and test a couple of tracks. Downloads live on the device where you saved them, so downloading a playlist on your laptop won’t put the audio on your phone.',
        ],
        links: [{ label: 'Metrolist offline playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'downloads-and-cache',
        heading: 'Downloads vs. playback cache',
        paragraphs: [
          'Metrolist can cache songs as you play them so repeat listens load faster. Still, don’t rely on the cache for a trip: if you skipped a song halfway through, the whole track might not be saved.',
          'Use actual downloads for anything you know you’ll want offline. Keep an eye on free storage before downloading huge playlists, and remember that clearing app data or uninstalling Metrolist wipes saved files too.',
        ],
        links: [{ label: 'Metrolist offline listening overview', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'moving-a-library',
        heading: 'Re-downloading after a device transfer',
        paragraphs: [
          'A Metrolist backup moves your playlists, library, and supported settings, not the downloaded audio files themselves. Once you restore on a new phone or computer, download the tracks you want offline there.',
          'Before restoring, back up the destination device if it already has a library you want to keep, since restoring overwrites it. Keep your backup file private too, because it can include account credentials.',
        ],
        links: [{ label: 'What a Metrolist backup includes', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'quality-and-access',
        heading: 'Audio quality and failed downloads',
        paragraphs: [
          'Because tracks stream from YouTube Music, a download can fail if a song isn’t available in your region or your connection drops. Retry any failed tracks while you’re still online so you don’t get stuck with a half-ready playlist.',
          'Higher Premium-only audio quality still requires your own YouTube Music Premium subscription. Metrolist doesn’t bypass DRM or unlock paid tiers.',
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
      description: 'Bring a Spotify playlist into Metrolist with a share link, check how the tracks matched on YouTube Music, and save it for offline listening.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Head to Settings > Backup & import in Metrolist and paste a Spotify playlist link. Metrolist reads the tracklist and looks up each song on YouTube Music. It’s quick to run, though worth a quick listen afterward to catch any mismatched versions.',
    sections: [
      {
        id: 'copy-the-link',
        heading: 'Copy the playlist link',
        paragraphs: [
          'In Spotify, hit Share on the playlist itself (not a single song inside it) and copy the link.',
          'Metrolist needs to be able to read that link to pull the tracklist. If your playlist is private, the URL importer may not be able to reach it. Only switch it to public if you’re comfortable sharing it.',
        ],
        links: [{ label: 'Metrolist Spotify import FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'run-the-import',
        heading: 'Run the import in Metrolist',
        paragraphs: [
          'Open Settings > Backup & import, pick the playlist import option, and paste your Spotify link. Stay online while Metrolist searches YouTube Music for each song; big playlists take a little longer than short ones.',
          'If an import stops partway through, check what made it into your library before running it again so you don’t end up with duplicates.',
        ],
        links: [{ label: 'Metrolist library and import FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'check-the-recordings',
        heading: 'Spot-check the matches',
        paragraphs: [
          'Skim the artist, title, and song length on a few tracks. Sometimes a song pulls a live take, remix, or music video instead of the studio cut. If one’s off, just search and swap it manually.',
          'Missing a few tracks? They might not be on YouTube Music in your country, or they might be local MP3s sitting in your Spotify playlist that aren’t in any streaming catalog.',
        ],
        links: [
          { label: 'Metrolist import matching FAQ', href: 'https://metrolist.cc/faq' },
          { label: 'Spotify local files help', href: 'https://support.spotify.com/us/article/local-files/' },
        ],
      },
      {
        id: 'after-importing',
        heading: 'Download it if you want it offline',
        paragraphs: [
          'Once the tracklist looks good, hit download in Metrolist if you want it offline. Importing only copies the tracklist; it doesn’t pull audio files from Spotify or carry over a Spotify subscription.',
          'The import is a one-time copy. Edits you make later on Spotify won’t show up in Metrolist, so hang onto your original playlist until you’re happy with the new one.',
        ],
        links: [{ label: 'Metrolist offline playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
    ],
  },
  {
    slug: 'youtube-music-without-google-account',
    heading: 'Use YouTube Music in Metrolist without a Google account',
    meta: {
      title: 'YouTube Music without a Google account · Metrolist',
      description: 'What works in Metrolist with no Google sign-in, when signing in is useful, and what network requests still happen behind the scenes.',
      robots: PAGE_META.home.robots,
    },
    intro: 'You don’t need a Google account to use Metrolist. Search, play songs, listen in the background, and download tracks right out of the box, and only sign in if you want your existing YouTube Music playlists.',
    sections: [
      {
        id: 'start-listening',
        heading: 'Start listening right away',
        paragraphs: [
          'Open Metrolist and search for whatever you want to hear. Everything from background playback to offline downloads works without signing into Google.',
          'You still need an internet connection to search, stream, and download. Streams come straight from YouTube Music, so regional blocks or age/account restrictions still apply.',
        ],
        links: [{ label: 'Metrolist sign-in and playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'when-sign-in-helps',
        heading: 'When signing in is worth it',
        paragraphs: [
          'Sign in if you want your YouTube Music playlists, liked songs, albums, and artists to show up automatically. Your local Metrolist library stays separate, so if you ever switch phones or move to desktop, export a backup in Settings > Backup & import.',
          'Just back up the destination device first (restoring overwrites its library and skips downloaded audio), and keep backup files private since they can contain credentials.',
        ],
        links: [{ label: 'Accounts and backups in the FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'privacy',
        heading: 'No account doesn’t mean invisible',
        paragraphs: [
          'Even signed out, your device still talks to YouTube and Google to search and stream music, which means they still see normal connection details like your IP address. Skipping sign-in keeps your account separate, not anonymous.',
          'Lyrics providers and optional integrations (like Discord or Last.fm) only get requests when you actually use them. Optional Sentry crash reporting is off by default and only turns on if you opt in. Everything is spelled out in our privacy policy.',
        ],
        links: [
          { label: 'Metrolist privacy policy', href: 'https://metrolist.cc/privacy' },
          { label: 'Google privacy policy', href: 'https://policies.google.com/privacy' },
        ],
      },
      {
        id: 'premium-and-account-risk',
        heading: 'Premium audio and account risk',
        paragraphs: [
          'Metrolist plays YouTube Music without ads, even with the screen off, but Premium-only audio quality still requires your own YouTube Music Premium subscription.',
          'If you do decide to sign in, keep in mind that third-party clients may violate YouTube’s Terms of Service. Open-source code lets you verify what the app does, not guarantee how YouTube treats third-party access.',
        ],
        links: [{ label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' }],
      },
    ],
  },
]
