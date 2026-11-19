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
  description: 'Pick the right YouTube Music app, install Metrolist on your phone or computer, and get help with offline downloads, Spotify imports, synced lyrics, and listening rooms.',
  robots: PAGE_META.home.robots,
}

export const GUIDE_REVIEW_DATE = '2026-10-25'
export const GUIDE_DISCLOSURE = 'Written by the Metrolist project. Third-party YouTube clients may violate YouTube’s Terms of Service and carry account risks.'

const COMPARISON_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-vs-archivetune',
    heading: 'Metrolist vs ArchiveTune',
    meta: {
      title: 'Metrolist vs ArchiveTune · Platforms and features',
      description: 'How Metrolist and ArchiveTune compare on device support, local files, lyrics, audio controls, playlist imports, and setup.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Both Metrolist and ArchiveTune are open-source YouTube Music apps. In fact, ArchiveTune grew out of Metrolist. The main split comes down to where you listen and whether you play local files.',
    sections: [
      {
        id: 'devices',
        heading: 'Start with the devices you use',
        paragraphs: [
          'Metrolist is built with Kotlin Multiplatform, so you get apps for Android 7+, iOS 17+, Windows 10+, macOS 15+ (Apple silicon and Intel), and Linux. If you want the same player on both your phone and your computer, Metrolist covers all of them. Exact features like casting can still vary slightly by platform, so check the release notes for your build.',
          'ArchiveTune focuses on Android, built with Kotlin and Jetpack Compose. If you only listen on Android, it’s easy to try both side by side. If you need an iPhone, iPad, or desktop app, start with Metrolist.',
        ],
        links: [
          { label: 'Metrolist repository and supported platforms', href: 'https://github.com/MetrolistGroup/Metrolist' },
          { label: 'ArchiveTune on GitHub', href: 'https://github.com/rukamori/ArchiveTune' },
        ],
      },
      {
        id: 'playback',
        heading: 'Playback controls and lyrics',
        paragraphs: [
          'Both apps give you ad-free background play, synced lyrics, translations, and romanization (when a track has them). Metrolist also includes offline downloads and Listen Together rooms, where friends can suggest songs and stay in sync during a shared session.',
          'ArchiveTune stands out on Android if you also keep local music files on your phone. It includes local-file playback, EBU R128 loudness normalization, crossfade, tempo and pitch controls, system equalizer support, and a bunch of player themes and gesture options. Metrolist has normalization, tempo and pitch controls, an equalizer, and its own player customization too, so it’s worth trying the specific controls you care about in each app.',
        ],
        links: [
          { label: 'Metrolist features and overview', href: 'https://metrolist.cc/' },
          { label: 'ArchiveTune feature list', href: 'https://github.com/rukamori/ArchiveTune#features' },
        ],
      },
      {
        id: 'library',
        heading: 'Accounts, imports, and moving your library',
        paragraphs: [
          'In Metrolist, you can start listening without signing in, or connect your YouTube Music account whenever you want your playlists and library. ArchiveTune supports switching between multiple accounts and syncing playlists, liked songs, and subscriptions. Both support Spotify playlist import, Last.fm, ListenBrainz, and Discord Rich Presence. When you import a Spotify playlist into Metrolist, it matches each track on YouTube Music, so give it a quick skim in case a song is missing or pulled a live version.',
          'To move your Metrolist library to another device, create a backup and restore it there. Backups skip downloaded audio files, and restoring overwrites the destination library, so back that one up first if you need it. Keep backup files private too, since they can hold account credentials.',
        ],
        links: [{ label: 'Metrolist library and backup FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'decision',
        heading: 'Which one should you try?',
        paragraphs: [
          'Go with Metrolist if you want one app across mobile and desktop, or if you listen with friends in Listen Together rooms. Try ArchiveTune if you’re on Android and want local-file playback, crossfade, and extra player themes. Whichever you pick, download from official releases and back up your library first. On Android, newer Metrolist KMP builds install separately from the older Android app. Restore your backup and check everything before uninstalling the old one.',
          'Remember that both are third-party clients: using them with YouTube may violate YouTube’s Terms of Service, and Premium-only audio quality still requires your own YouTube Music Premium subscription.',
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
      description: 'How Metrolist compares with the official YouTube Music app on ads, background play, offline downloads, device support, and account trade-offs.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist is a free, open-source player for YouTube Music. Here’s how it stacks up against the official app: where a third-party client shines, and where the official app still wins.',
    sections: [
      {
        id: 'membership',
        heading: 'Playback and Music Premium',
        paragraphs: [
          'In the official YouTube Music app, ad-free music, background play, and offline music downloads require a Music Premium subscription. Podcasts work a little differently: many play in the background or download for free, though they can still carry host-read or inserted ads. Exact perks vary by country and device.',
          'Metrolist gives you ad-free background playback and lets you listen without even signing in. It doesn’t replace a paid subscription, though: it can’t unlock region-locked tracks, and Premium-only audio quality still requires your own YouTube Music Premium account.',
        ],
        links: [
          { label: 'YouTube Music Premium benefits and podcast exceptions', href: 'https://support.google.com/youtubemusic/answer/9266556?hl=en' },
          { label: 'Official background playback help', href: 'https://support.google.com/youtubemusic/answer/6313552?hl=en' },
          { label: 'Metrolist overview and service notice', href: 'https://metrolist.cc/' },
        ],
      },
      {
        id: 'offline',
        heading: 'Offline downloads for trips',
        paragraphs: [
          'The official app lets Music Premium subscribers download songs and playlists, as long as you reconnect to the internet at least once every 30 days to keep them active. Podcasts follow separate rules and some can’t be downloaded.',
          'Metrolist lets you download songs and playlists on Android, iOS, and desktop. Just make sure they finish before you lose signal. Note that Metrolist backups copy your library and settings, not the downloaded audio itself, so you’ll need to re-download tracks on a new device. Restoring a backup also replaces the library already on that device, so back it up first if needed.',
        ],
        links: [
          { label: 'Official music and podcast download rules', href: 'https://support.google.com/youtubemusic/answer/6313535?hl=en' },
          { label: 'Metrolist offline listening and backup FAQ', href: 'https://metrolist.cc/faq' },
        ],
      },
      {
        id: 'devices',
        heading: 'Speakers, cars, and other devices',
        paragraphs: [
          'Metrolist runs on Android, iOS, Windows, macOS, and Linux, with synced lyrics, playback controls, and Listen Together rooms. Casting is built in (Chromecast, DLNA, FCast), though support depends on your platform and speaker, so test it on your own setup first. On iOS, you’ll also need to sideload the IPA.',
          'If seamless support for smart speakers, TVs, game consoles, or car infotainment systems is your top priority, check YouTube Music’s official supported-device list before switching.',
        ],
        links: [
          { label: 'YouTube Music supported devices', href: 'https://support.google.com/youtubemusic/answer/9231765?hl=en' },
          { label: 'Metrolist platform releases', href: 'https://github.com/MetrolistGroup/Metrolist/releases' },
        ],
      },
      {
        id: 'choice',
        heading: 'Picking what fits you best',
        paragraphs: [
          'Metrolist is a great fit if you want an open-source app, optional sign-in, Listen Together rooms, and deeper audio controls. The trade-off is that any third-party client relies on YouTube: upstream changes can temporarily break playback, and using one may violate YouTube’s Terms of Service. Being open source makes the code auditable, not immune to account risk.',
          'Stick with the official app if guaranteed device integrations and official support matter most to you. Music Premium covers music only, while YouTube Premium bundles ad-free YouTube video too. Check local pricing directly in Google’s help pages.',
        ],
        links: [
          { label: 'Music Premium vs YouTube Premium', href: 'https://support.google.com/youtubemusic/answer/6305537?hl=en' },
          { label: 'Metrolist project and notices', href: 'https://github.com/MetrolistGroup/Metrolist' },
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
      description: 'A straightforward look at Metrolist, ArchiveTune, InnerTune, SimpMusic, Harmony Music, Musify, ViTune, Spotube, NewPipe, and FreeTube with links to each project.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist is first because it’s our app, but there are plenty of great open-source players out there. Here’s a quick rundown of ten options, from dedicated music clients to general YouTube players, with links straight to their repos.',
    sections: [
      {
        id: 'metrolist',
        heading: 'Metrolist',
        paragraphs: [
          'Metrolist is our Kotlin Multiplatform YouTube Music player for Android 7+, iOS 17+, Windows 10+, macOS 15+ (Apple silicon and Intel), and Linux. It gives you no-login listening, ad-free background play, word-synced lyrics, offline downloads, and Listen Together rooms.',
          'It’s a strong pick if you want the same music app on your phone and computer, or if you listen with friends. Casting varies by build and hardware, and moving your local library between devices uses manual backup and restore (without downloaded audio). Premium-only audio quality still requires your own YouTube Music Premium subscription.',
        ],
        links: [{ label: 'Metrolist on GitHub', href: 'https://github.com/MetrolistGroup/Metrolist' }],
      },
      {
        id: 'archivetune',
        heading: 'ArchiveTune',
        paragraphs: [
          'ArchiveTune is an Android music app that mixes YouTube Music with local files stored on your phone. It includes ad-free background play, synced and translated lyrics, romanization, loudness normalization, tempo and pitch controls, crossfade, Spotify playlist import, Last.fm, ListenBrainz, and Discord integration.',
          'Worth a look if you keep offline MP3/FLAC files on Android and like tweaking how the player looks and behaves. It also supports switching between multiple YouTube accounts.',
        ],
        links: [{ label: 'ArchiveTune on GitHub', href: 'https://github.com/rukamori/ArchiveTune' }],
      },
      {
        id: 'innertune',
        heading: 'InnerTune',
        paragraphs: [
          'InnerTune is a Material 3 YouTube Music player for Android with search for songs, albums, videos, and playlists, optional sign-in, background play, caching and downloads, synced and translated lyrics, tempo/pitch controls, and Android Auto support.',
          'A solid Android-only choice if you want a clean Material 3 player with those audio tools. Check the project’s version table before downloading, and note that Last.fm or ListenBrainz scrobbling relies on external scrobbler apps.',
        ],
        links: [{ label: 'InnerTune on GitHub', href: 'https://github.com/z-huang/InnerTune' }],
      },
      {
        id: 'simpmusic',
        heading: 'SimpMusic',
        paragraphs: [
          'SimpMusic is a cross-platform YouTube Music client for Android, Windows, macOS, and Linux. It packs background playback, offline listening, word-by-word lyrics, listening stats, playlist imports, and audio effects.',
          'Great if you love tracking your listening stats and care a lot about lyrics. Notice that it ships Full and FOSS variants (Full adds crash reporting and Last.fm scrobbling) and still calls itself beta with some desktop caveats, so skim the README before diving in.',
        ],
        links: [{ label: 'SimpMusic on GitHub', href: 'https://github.com/maxrave-dev/SimpMusic' }],
      },
      {
        id: 'harmony-music',
        heading: 'Harmony Music',
        paragraphs: [
          'Harmony Music is a Flutter-based music player for Android, Windows, and Linux with no-login listening, background playback, caching and downloads, playlists, lyrics, an equalizer, YouTube link imports, and Piped playlist support.',
          'One big heads-up: its repository README states that the project is no longer maintained. Existing users might still like it, but if you’re picking a daily driver today, keep in mind that future YouTube changes likely won’t get fixed.',
        ],
        links: [{ label: 'Harmony Music on GitHub', href: 'https://github.com/anandnet/Harmony-Music' }],
      },
      {
        id: 'musify',
        heading: 'Musify',
        paragraphs: [
          'Musify supports Android, with beta builds for Windows and Linux. It offers song search, offline listening, data import/export, Spotify playlist import, radio stations, lyrics, and an equalizer with presets, pulling from plugins and external sources.',
          'A handy pick if radio stations and playlist imports are big parts of your listening routine. Desktop builds are still beta, so check the current release assets and review whichever plugins or sources you enable.',
        ],
        links: [{ label: 'Musify on GitHub', href: 'https://github.com/gokadzev/Musify' }],
      },
      {
        id: 'vitune',
        heading: 'ViTune',
        paragraphs: [
          'ViTune is an Android player that handles both YouTube Music and local files on your phone, with background playback, offline caching, YouTube playlist import, editable lyrics, audio normalization, Android Auto, and direct YouTube link handling.',
          'Nice if you mix local files with streaming or like fixing lyric mistakes yourself. Make sure you use the current bartoostveen repo (older 25huizengek1 links redirect there) so you get up-to-date builds.',
        ],
        links: [{ label: 'ViTune on GitHub', href: 'https://github.com/bartoostveen/ViTune' }],
      },
      {
        id: 'spotube',
        heading: 'Spotube',
        paragraphs: [
          'Spotube has evolved into a plugin-based music player for Android, iOS (sideloaded), Windows, macOS, and Linux, where plugins supply metadata, playlists, and audio sources alongside synced lyrics and downloads.',
          'Pick it if you want to mix and match your own music sources rather than sticking to one service. Check the plugins you install and make sure you’re on the current team-spotube repository, since older write-ups still describe its previous Spotify-plus-YouTube setup.',
        ],
        links: [{ label: 'Spotube on GitHub', href: 'https://github.com/team-spotube/spotube' }],
      },
      {
        id: 'newpipe',
        heading: 'NewPipe',
        paragraphs: [
          'NewPipe is a lightweight, multi-service Android player covering YouTube, YouTube Music, SoundCloud, Bandcamp, PeerTube, and media.ccc.de. It supports background audio, video playback, downloads, account-free subscriptions, and local playlists.',
          'Ideal if you bounce between videos and music across several platforms and want everything stored locally without an account. Because it doesn’t sync with a Google account, its playlists stay strictly on your phone. Also watch signing keys if you ever switch between F-Droid and GitHub builds.',
        ],
        links: [{ label: 'NewPipe on GitHub', href: 'https://github.com/TeamNewPipe/NewPipe' }],
      },
      {
        id: 'freetube',
        heading: 'FreeTube',
        paragraphs: [
          'FreeTube is a desktop YouTube player (currently in beta) for Windows 10+, macOS 12+, and Linux. It gives you ad-free viewing, local channel subscriptions and playlists without an account, multiple profiles, and external-player support.',
          'A great desktop choice if you mostly watch live sets, concerts, and music videos from YouTube channels rather than managing a YouTube Music library. Keep in mind that YouTube still sees your network requests. Storing subscriptions locally helps with privacy, but it isn’t anonymous.',
        ],
        links: [{ label: 'FreeTube on GitHub', href: 'https://github.com/FreeTubeApp/FreeTube' }],
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
