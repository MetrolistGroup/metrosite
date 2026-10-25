import { PAGE_META, type PageMeta } from './site'
import { PLATFORM_GUIDES } from './guides/platforms'
import { LIBRARY_GUIDES } from './guides/library'
import { PLAYBACK_GUIDES } from './guides/playback'

export type GuideSection = {
  id: string
  heading: string
  paragraphs: readonly string[]
  links?: readonly { label: string; href: string }[]
}

export type Guide = {
  slug: string
  heading: string
  meta: PageMeta
  intro: string
  sections: readonly GuideSection[]
}

export const GUIDE_INDEX_META: PageMeta = {
  title: 'YouTube Music app guides · Metrolist',
  description: 'Choose a YouTube Music client, install Metrolist on your devices, and get help with offline listening, playlist imports, lyrics, and shared playback.',
  robots: PAGE_META.home.robots,
}

export const GUIDE_REVIEW_DATE = '2026-10-25'
export const GUIDE_DISCLOSURE = 'Written by the Metrolist project. Third-party YouTube clients may violate YouTube\'s Terms of Service and carry account risks.'

const COMPARISON_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-vs-archivetune',
    heading: 'Metrolist vs ArchiveTune',
    meta: {
      title: 'Metrolist vs ArchiveTune · Platforms and features',
      description: 'Compare Metrolist and ArchiveTune by device support, local playback, lyrics, audio controls, playlist imports, and installation requirements.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Compare Metrolist and ArchiveTune by supported devices, playback controls, lyrics, and library tools. Both are open-source YouTube Music clients; Metrolist also offers iOS and desktop releases.',
    sections: [
      {
        id: 'devices',
        heading: 'Choose for your devices first',
        paragraphs: [
          'Metrolist uses Kotlin Multiplatform and provides apps for Android 9+, iOS 17+, Windows 10+ x64, macOS 15+ on Intel and Apple silicon, and Linux x64. That makes it worth considering if you want the same project on a phone and computer. Check the actual release for your device: features and casting support vary by build and hardware.',
          'ArchiveTune documents an Android app built with Kotlin and Jetpack Compose. An Android listener can compare both directly; someone choosing an iPhone or desktop app should start with the documented Metrolist releases. ArchiveTune acknowledges Metrolist as its base framework, but shared origins do not establish which app will suit your listening habits.',
        ],
        links: [
          { label: 'Metrolist documentation and supported platforms', href: 'https://github.com/MetrolistGroup/Metrolist' },
          { label: 'ArchiveTune project documentation', href: 'https://github.com/rukamori/ArchiveTune' },
        ],
      },
      {
        id: 'playback',
        heading: 'Compare playback controls and lyrics',
        paragraphs: [
          'Both projects document ad-free background playback, synchronized lyrics, translation, and romanization. Metrolist also documents offline downloads and Listen Together rooms, where friends can suggest songs and share synchronized playback. A room is for a shared listening session; it does not automatically copy your library between devices.',
          'ArchiveTune explicitly supports local-file playback, EBU R128 loudness normalization, tempo and pitch adjustment, crossfade, and system equalizer integration. It offers several player and background styles plus gesture settings. Metrolist also provides normalization, tempo and pitch controls, an equalizer, and player customization. Compare the particular controls you use rather than treating these as exclusive features. Lyrics availability depends on the song and provider.',
        ],
        links: [
          { label: 'Metrolist playback features and FAQ', href: 'https://metrolist.cc/' },
          { label: 'ArchiveTune playback and customization features', href: 'https://github.com/rukamori/ArchiveTune#features' },
        ],
      },
      {
        id: 'library',
        heading: 'Accounts, imports, and listening history',
        paragraphs: [
          'Metrolist allows playback without signing in, with optional YouTube Music account integration. ArchiveTune documents multiple-account switching and access to playlists, liked songs, and subscriptions after sign-in. Both list Spotify playlist import, Last.fm, ListenBrainz, and Discord integration. Importing a playlist is separate from streaming its original service: Metrolist searches for matching YouTube Music tracks, so check for missing songs or different recordings.',
          'For Metrolist device transfers, use backup and restore. Downloaded audio is excluded, and restoring replaces the destination library, so back it up first. Backup files can contain account credentials; keep them private. Neither an import nor a backup should be assumed to provide continuous cross-device synchronization.',
        ],
        links: [{ label: 'Metrolist library and backup guidance', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'decision',
        heading: 'Before you switch',
        paragraphs: [
          'Choose Metrolist for its documented phone and desktop releases or shared listening rooms. Consider ArchiveTune for an Android workflow combining local files, crossfade, and its player controls. These are starting points for a trial, without assuming undocumented features are absent. Use official releases and keep your existing library backed up. Current Metrolist KMP builds install separately from the original Android app; restore a backup and verify it before removing the original.',
          'Both are third-party clients. Accessing YouTube through them may violate its Terms of Service and carries account risks. Changing clients does not grant a Premium entitlement: Premium-only audio quality requires your own YouTube Music Premium subscription.',
        ],
        links: [
          { label: 'Metrolist releases', href: 'https://github.com/MetrolistGroup/Metrolist/releases' },
          { label: 'ArchiveTune releases', href: 'https://github.com/rukamori/ArchiveTune/releases' },
          { label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' },
        ],
      },
    ],
  },
  {
    slug: 'metrolist-vs-youtube-music',
    heading: 'Metrolist vs YouTube Music',
    meta: {
      title: 'Metrolist vs YouTube Music · Features and membership',
      description: 'Compare Metrolist with official YouTube Music: music playback, downloads, Premium membership, device integrations, and third-party account risks.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist is a third-party client for YouTube Music. Compare its free playback tools and supported platforms with the official app’s membership benefits and device integrations.',
    sections: [
      {
        id: 'membership',
        heading: 'Music playback and Premium membership',
        paragraphs: [
          'YouTube Music documents ad-free music, background music playback, and music downloads as Music Premium benefits. Podcast behavior differs: many podcasts allow background playback or downloads without membership, and podcasts can still contain advertising. Availability and restrictions can vary by region, device, and content, so check the official help for your use case.',
          'Metrolist documents ad-free background playback and listening without signing in. It is free and open source, but it does not issue a YouTube subscription or unlock every account-restricted stream. Premium-only audio quality requires your own YouTube Music Premium subscription. Selecting a different client does not replace the underlying service or make unavailable recordings appear.',
        ],
        links: [
          { label: 'YouTube Music Premium benefits and podcast exceptions', href: 'https://support.google.com/youtubemusic/answer/9266556?hl=en' },
          { label: 'Official background playback guidance', href: 'https://support.google.com/youtubemusic/answer/6313552?hl=en' },
          { label: 'Metrolist features and service notice', href: 'https://metrolist.cc/' },
        ],
      },
      {
        id: 'offline',
        heading: 'Prepare downloads before traveling',
        paragraphs: [
          'With the official app, Music Premium members can download music for offline listening. YouTube says to reconnect to the internet at least once every 30 days to maintain downloads. Podcasts have separate rules and some may be unavailable for download. Read those conditions before relying on a saved queue during a long trip.',
          'Metrolist supports downloading songs and playlists for offline playback on Android, iOS, and desktop. Wait for downloads to finish before disconnecting. Its backup process transfers library information and supported settings, but excludes downloaded audio. Moving a backup to another device therefore requires downloading the audio there again; restore also replaces the destination library, so preserve it first.',
        ],
        links: [
          { label: 'Official music and podcast download rules', href: 'https://support.google.com/youtubemusic/answer/6313535?hl=en' },
          { label: 'Metrolist offline listening and backup FAQ', href: 'https://metrolist.cc/faq' },
        ],
      },
      {
        id: 'devices',
        heading: 'Check your speakers and other devices',
        paragraphs: [
          'Metrolist provides Android, iOS, Windows, macOS, and Linux apps, along with lyrics, playback controls, and Listen Together rooms. Casting is documented, but support depends on the build and receiving device. Check the release notes and try your actual speaker rather than assuming every integration works identically on every platform. The iOS release uses sideloading, which adds installation steps.',
          'The official YouTube Music help lists supported devices and integrations. If your priority is a supported route to your car, television, or speaker, check that list before changing apps. A desktop app or casting option in a third-party client does not by itself establish compatibility with the devices you already own.',
        ],
        links: [
          { label: 'YouTube Music supported devices', href: 'https://support.google.com/youtubemusic/answer/9231765?hl=en' },
          { label: 'Metrolist platform releases', href: 'https://github.com/MetrolistGroup/Metrolist/releases' },
        ],
      },
      {
        id: 'choice',
        heading: 'Choose the support and account model you need',
        paragraphs: [
          'Metrolist may suit you if you value an open-source client, optional sign-in, shared listening rooms, and its playback controls. You still depend on YouTube access, and upstream changes can affect third-party playback. Use official project downloads and consider the Terms of Service and account risks before signing in; open source is not a guarantee of account safety.',
          'Choose the official app when supported integrations and the service’s documented membership benefits are your priority. Music Premium covers the music offering, while YouTube Premium includes Music Premium alongside benefits for the broader YouTube service. Check current local membership terms rather than choosing from a fixed price quoted in a comparison article.',
        ],
        links: [
          { label: 'Music Premium versus YouTube Premium', href: 'https://support.google.com/youtubemusic/answer/6305537?hl=en' },
          { label: 'Metrolist account-risk notice', href: 'https://github.com/MetrolistGroup/Metrolist' },
          { label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' },
        ],
      },
    ],
  },
  {
    slug: 'youtube-music-alternatives',
    heading: '10 YouTube Music clients and alternatives',
    meta: {
      title: '10 YouTube Music clients and alternatives · Metrolist',
      description: 'Explore Metrolist, ArchiveTune, InnerTune, SimpMusic, Harmony Music, Musify, ViTune, Spotube, NewPipe, and FreeTube with links to their official projects.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist leads this list because it is our project. The other nine cover music clients and general YouTube players, grouped by use. Follow the official links to check current releases and device support.',
    sections: [
      {
        id: 'metrolist',
        heading: 'Metrolist',
        paragraphs: [
          'Metrolist is a Kotlin Multiplatform YouTube Music client for Android 9+, iOS 17+, Windows 10+ x64, macOS 15+ on Intel and Apple silicon, and Linux x64. It offers playback without sign-in, ad-free background listening, lyrics, offline downloads, and Listen Together rooms.',
          'Consider it for a music-focused app across phone and desktop, especially if shared listening matters. Casting and other features vary by build and device. Library transfers use backup and restore rather than automatic cross-device sync; downloads are excluded. Premium-only audio quality still requires your own YouTube Music Premium subscription.',
        ],
        links: [{ label: 'Metrolist official project and releases', href: 'https://github.com/MetrolistGroup/Metrolist' }],
      },
      {
        id: 'archivetune',
        heading: 'ArchiveTune',
        paragraphs: [
          'ArchiveTune is an Android music client that combines YouTube Music access with local-file playback. Its documented tools include ad-free background playback, synchronized and translated lyrics, romanization, loudness normalization, tempo and pitch controls, and crossfade. It also lists Spotify playlist import, Last.fm, ListenBrainz, and Discord integration.',
          'Consider it if you keep music files on your phone and want detailed control over playback and player appearance. Its README describes multiple-account switching and access to account playlists after sign-in. Review the available Android builds and your account-risk tolerance before connecting a library.',
        ],
        links: [{ label: 'ArchiveTune official project and releases', href: 'https://github.com/rukamori/ArchiveTune' }],
      },
      {
        id: 'innertune',
        heading: 'InnerTune',
        paragraphs: [
          'InnerTune is a Material 3 YouTube Music client for Android. It documents song, album, video, and playlist search, login support, background playback, caching and downloads, synchronized lyrics, translation, and tempo or pitch adjustment. Android Auto support is also listed, with setup guidance in the project FAQ.',
          'It is worth considering for an Android music workflow with those playback controls. Read the project’s app-version comparison when choosing a download source. For Last.fm or ListenBrainz scrobbling, its FAQ points to separate scrobbler apps, which matters if you want listening history recorded.',
        ],
        links: [{ label: 'InnerTune official project and FAQ', href: 'https://github.com/z-huang/InnerTune' }],
      },
      {
        id: 'simpmusic',
        heading: 'SimpMusic',
        paragraphs: [
          'SimpMusic currently describes a cross-platform YouTube Music client for Android and desktop, with Windows, macOS, and Linux installation guidance. Its README lists background listening, offline playback, word-by-word lyrics, listening analytics, playlist imports, and audio effects.',
          'Consider it if lyric presentation and listening statistics are priorities. Check which build you want: the project distinguishes Full and FOSS variants, with crash reporting in Full and Last.fm scrobbling listed for that variant. The README labels the app beta and notes desktop limitations, so read those alongside the feature list before switching.',
        ],
        links: [{ label: 'SimpMusic official project and desktop guidance', href: 'https://github.com/maxrave-dev/SimpMusic' }],
      },
      {
        id: 'harmony-music',
        heading: 'Harmony Music',
        paragraphs: [
          'Harmony Music documents a Flutter music app for Android, Windows, and Linux, with no-login listening, background playback, song caching and downloads, playlists, lyrics, and an equalizer. It also describes importing items shared from YouTube or YouTube Music and Piped playlist integration.',
          'Its README explicitly says the repository is no longer maintained. Existing users may still value its workflow, but a new user should weigh that warning before depending on it for daily streaming. Inclusion here records an available project and its documented features, without promising future fixes when services change.',
        ],
        links: [{ label: 'Harmony Music official project and maintenance notice', href: 'https://github.com/anandnet/Harmony-Music' }],
      },
      {
        id: 'musify',
        heading: 'Musify',
        paragraphs: [
          'Musify lists Android support and beta support for Windows and Linux. It offers online song search, offline listening, data import and export, Spotify playlist import, radio stations, lyrics, and an equalizer with presets. Its documentation describes access through plugins and external sources.',
          'Consider it if playlist importing and radio listening fit your routine. Desktop users should account for the beta designation and check the current release files. Playlist import does not itself establish where audio comes from or grant a subscription to the original service; review the sources you configure.',
        ],
        links: [{ label: 'Musify official project and platform table', href: 'https://github.com/gokadzev/Musify' }],
      },
      {
        id: 'vitune',
        heading: 'ViTune',
        paragraphs: [
          'ViTune is an Android music app with YouTube Music playback, device-file playback, background listening, and offline caching. It documents YouTube playlist imports, editable lyrics, audio normalization, Android Auto, and opening YouTube or YouTube Music links directly.',
          'Consider it if you combine online listening with files on your phone, or want to correct lyrics yourself. Its current repository is under bartoostveen; older links under 25huizengek1 redirect there. Follow the current project for releases and configuration details rather than assuming an older guide describes the build you will install.',
        ],
        links: [{ label: 'ViTune current official project', href: 'https://github.com/bartoostveen/ViTune' }],
      },
      {
        id: 'spotube',
        heading: 'Spotube',
        paragraphs: [
          'Spotube’s current documentation presents a plugin-based music app, with metadata, playlists, and audio sources supplied through plugins. It lists Android, iOS via sideloading, Windows, macOS, and Linux installation options, plus synchronized lyrics and track downloads.',
          'Consider it if you want to choose and configure sources instead of committing to one music-service interface. That flexibility also means checking the plugins you install, their requirements, and which source supplies a recording. Use the current team-spotube repository; older descriptions centered on a fixed Spotify-and-YouTube pairing may no longer explain its current design.',
        ],
        links: [{ label: 'Spotube current official project and installation guide', href: 'https://github.com/team-spotube/spotube' }],
      },
      {
        id: 'newpipe',
        heading: 'NewPipe',
        paragraphs: [
          'NewPipe is a general multi-service Android frontend supporting YouTube, YouTube Music, SoundCloud, Bandcamp, PeerTube, and media.ccc.de. It documents background audio, video playback, downloads, subscriptions without accounts, and local playlists. Support differs between services.',
          'Choose it for a mix of videos and audio across those sources, especially if you prefer managing subscriptions locally. It is a different workflow from a full account-synced music app: its local playlists are separate from service playlists. Follow the installation guidance when switching download sources, because signing keys and update compatibility differ.',
        ],
        links: [{ label: 'NewPipe official project and supported services', href: 'https://github.com/TeamNewPipe/NewPipe' }],
      },
      {
        id: 'freetube',
        heading: 'FreeTube',
        paragraphs: [
          'FreeTube is a desktop YouTube frontend for Windows 10+, macOS 12+, and Linux. It documents ad-free video viewing, channel subscriptions without an account, local playlists and history, subscription profiles, and external-player support. The project currently labels it beta.',
          'Consider it for music videos, concerts, and channel-based listening on a computer. It is a general YouTube player, so it should not be treated as an equivalent replacement for an account-synced YouTube Music library. Its documentation also notes that YouTube can still see video requests; local library storage is not a promise of anonymity.',
        ],
        links: [{ label: 'FreeTube official project and desktop downloads', href: 'https://github.com/FreeTubeApp/FreeTube' }],
      },
    ],
  },
]

export const GUIDE_COLLECTIONS = [
  { id: 'comparisons', heading: 'Comparisons and alternatives', guides: COMPARISON_GUIDES },
  { id: 'platforms', heading: 'Platforms and installation', guides: PLATFORM_GUIDES },
  { id: 'library', heading: 'Your library and downloads', guides: LIBRARY_GUIDES },
  { id: 'playback', heading: 'Listen Together and lyrics', guides: PLAYBACK_GUIDES },
] as const

export const GUIDES: readonly Guide[] = GUIDE_COLLECTIONS.flatMap(collection => collection.guides)

export function getRelatedGuides(slug: string): readonly Guide[] {
  const collection = GUIDE_COLLECTIONS.find(({ guides }) => guides.some(guide => guide.slug === slug))
  return collection?.guides.filter(guide => guide.slug !== slug).slice(0, 3) ?? []
}
