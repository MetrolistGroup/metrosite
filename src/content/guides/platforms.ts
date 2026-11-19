import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const PLATFORM_GUIDES: readonly Guide[] = [
  {
    slug: 'best-youtube-music-client-android-2026',
    heading: 'Best YouTube Music client for Android in 2026',
    meta: {
      title: 'Best YouTube Music client for Android in 2026 · Metrolist',
      description: 'Why we recommend Metrolist on Android in 2026, when ArchiveTune, ViTune, InnerTune, or SimpMusic fit better, and how to switch safely.',
      robots: PAGE_META.home.robots,
    },
    intro: 'If you want ad-free background play, offline downloads, and Listen Together rooms on Android (plus matching iOS and desktop apps), Metrolist is our pick. If you also play lots of local MP3 or FLAC files on your phone, take a look at ArchiveTune and ViTune too.',
    sections: [
      {
        id: 'why-metrolist',
        heading: 'Why we built Metrolist this way',
        paragraphs: [
          'Metrolist plays songs and videos from YouTube Music without ad breaks, keeps playing when your screen is off, and lets you save tracks for offline trips. It runs on Android 7 and newer, and you don’t have to sign in.',
          'Listen Together is a big perk if you like sharing music: start a room, send a link, and everyone stays in sync. And because we also ship Windows, macOS, and Linux builds, you get the same feel on your computer. Just remember that local libraries move via manual backup and restore rather than automatic cloud sync.',
        ],
        links: [{ label: 'Metrolist features and platform FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'other-android-choices',
        heading: 'When another Android app makes more sense',
        paragraphs: [
          'ArchiveTune and ViTune both let you play local audio files straight from your phone’s storage alongside YouTube Music. ArchiveTune also adds crossfade and extra player styles, which makes it appealing if you already keep a big offline collection on your device.',
          'InnerTune is a great Material 3 option with downloads, synced lyrics, tempo and pitch tweaks, and Android Auto. SimpMusic adds listening stats, word-by-word lyrics, desktop builds, and Metrolist-compatible Listen Together rooms. Check its Full (with crash reporting) and FOSS variants before installing.',
        ],
        links: [
          { label: 'ArchiveTune on GitHub', href: 'https://github.com/rukamori/ArchiveTune' },
          { label: 'ViTune on GitHub', href: 'https://github.com/bartoostveen/ViTune' },
          { label: 'InnerTune on GitHub', href: 'https://github.com/z-huang/InnerTune' },
          { label: 'SimpMusic on GitHub', href: 'https://github.com/maxrave-dev/SimpMusic' },
        ],
      },
      {
        id: 'switching-apps',
        heading: 'Back up before you switch',
        paragraphs: [
          'Grab Metrolist from this site or our official GitHub releases. Moving over from the original Android version of Metrolist? Make a backup there first. Newer KMP builds install side by side as a separate app, so restore your backup in the new app and make sure your library looks right before uninstalling the old one.',
          'Bringing playlists from Spotify? The importer looks up matching tracks on YouTube Music. It’s a one-time snapshot rather than a live sync, so skim through a few songs to make sure the matches are right.',
        ],
        links: [{ label: 'Metrolist install and import FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'service-limits',
        heading: 'A quick note on YouTube’s limits',
        paragraphs: [
          'Every third-party client relies on YouTube Music under the hood. Upstream changes can occasionally break playback until an update lands, and using third-party apps may violate YouTube’s Terms of Service. Open source lets you check the code, not avoid account rules, and Premium-only audio quality still requires your own YouTube Music Premium subscription.',
        ],
        links: [{ label: 'YouTube Terms of Service', href: 'https://www.youtube.com/static?template=terms' }],
      },
    ],
  },
  {
    slug: 'youtube-music-desktop-clients',
    heading: 'YouTube Music desktop clients for Windows, macOS, and Linux',
    meta: {
      title: 'YouTube Music desktop clients · Windows, macOS, and Linux',
      description: 'How to pick and install the right Metrolist desktop build on Windows, Mac, or Linux, plus how SimpMusic, Spotube, and FreeTube compare.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist runs natively on Windows 10+, macOS 15+, and Linux, with builds for both x64 and ARM64 (Apple silicon and Intel on Mac). You can listen without signing in and save tracks for offline playback.',
    sections: [
      {
        id: 'windows',
        heading: 'Windows: installer or portable ZIP',
        paragraphs: [
          'Open the download window and pick Windows. The EXE installer sets everything up and drops Metrolist into your Start menu. Prefer a portable copy? Grab the ZIP, unzip it into a folder first, and run Metrolist from inside instead of launching it from the zipped preview.',
        ],
        links: [{ label: 'Metrolist desktop downloads', href: 'https://metrolist.cc/#platforms' }],
      },
      {
        id: 'macos',
        heading: 'macOS: pick Apple silicon or Intel',
        paragraphs: [
          'Click the Apple menu and open About This Mac. If you see an Apple M-series chip listed, grab the Apple silicon DMG; if you see Intel, grab the Intel DMG. Metrolist needs macOS 15 or newer.',
          'Open the DMG, drag Metrolist into Applications, and approve the first-launch security prompt. Only install builds from this site or our official GitHub releases.',
        ],
        links: [{ label: 'Mac download FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'linux',
        heading: 'Linux: AppImage and sign-in libraries',
        paragraphs: [
          'Download the AppImage for your CPU, mark it executable, and run it. Everything the desktop player needs is bundled inside, with no extra Kotlin or Java setup required.',
          'If you want to sign in with Google, the built-in login window uses GTK3, WebKitGTK 4.1, and JavaScriptCore. If the sign-in window won’t open, check that those packages are installed on your distro. Even without them, the player itself works fine without signing in.',
        ],
        links: [{ label: 'Metrolist desktop and account FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'library-transfer',
        heading: 'Bring your library over with a backup',
        paragraphs: [
          'In Settings > Backup & import, create a backup on your phone (or old PC) and restore it on your computer. It carries over your playlists, library, and supported settings, though not downloaded audio files. Restoring overwrites whatever library is already on the destination device, so back that one up first if you care about it.',
          'Keep backup files private, since they can contain account credentials, and never attach them to public bug reports. Re-download any tracks you want offline on your computer.',
        ],
        links: [{ label: 'Backup transfer and safety FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'other-desktop-apps',
        heading: 'Other desktop apps worth a look',
        paragraphs: [
          'SimpMusic offers Windows, macOS, and Linux builds with lyric tools and listening stats. Spotube lets you plug in different music sources and metadata providers. FreeTube is a desktop YouTube player built around videos, local subscriptions, and playlists, which is great if you mostly watch live sets and music videos rather than managing a YouTube Music library.',
        ],
        links: [
          { label: 'SimpMusic on GitHub', href: 'https://github.com/maxrave-dev/SimpMusic' },
          { label: 'Spotube on GitHub', href: 'https://github.com/team-spotube/spotube' },
          { label: 'FreeTube on GitHub', href: 'https://github.com/FreeTubeApp/FreeTube' },
        ],
      },
    ],
  },
  {
    slug: 'metrolist-ios-iphone',
    heading: 'Install Metrolist on iPhone and iPad',
    meta: {
      title: 'Metrolist for iOS · YouTube Music on iPhone and iPad',
      description: 'How to install the Metrolist IPA on iOS 17 or newer using AltStore, SideStore, or Sideloadly, and how to keep your app signed.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist works on iPhones and iPads running iOS 17 or newer. Because Apple doesn’t allow third-party YouTube clients on the App Store, you’ll sideload the IPA using AltStore, SideStore, or Sideloadly.',
    sections: [
      {
        id: 'get-the-ipa',
        heading: 'Download the iOS IPA',
        paragraphs: [
          'Open the download selector on this site, pick iOS, and save the unsigned IPA (Android APKs won’t work on iPhone). Your sideloading tool will sign it for your device.',
          'Stick to the official download here or on GitHub. Random third-party signing sites mean trusting a stranger with both the app and your account.',
        ],
        links: [{ label: 'Metrolist iOS download', href: 'https://metrolist.cc/#platforms' }],
      },
      {
        id: 'choose-a-tool',
        heading: 'Pick a sideloading tool',
        paragraphs: [
          'AltStore Classic pairs with AltServer on your computer to install and refresh apps. SideStore only needs a computer for the first setup and can refresh right on your phone after that. Sideloadly installs from a computer and refreshes automatically whenever your phone is nearby.',
          'SideStore has a few extra pairing and VPN steps during setup, so follow its official install guide first before loading the IPA.',
        ],
        links: [
          { label: 'AltStore Classic and AltServer', href: 'https://faq.altstore.io/altstore-classic/altserver' },
          { label: 'SideStore installation guide', href: 'https://docs.sidestore.io/docs/installation/install' },
          { label: 'Sideloadly FAQ', href: 'https://sideloadly.io/faq.html' },
        ],
      },
      {
        id: 'refresh-and-trust',
        heading: 'Keep the app signed',
        paragraphs: [
          'With a free Apple ID, sideloaded apps expire after seven days and need a quick refresh. If you’re heading on a trip away from your computer, refresh right before you leave (or use SideStore so you can refresh on-device).',
          'Follow iOS’s prompts to trust your developer certificate and turn on Developer Mode if asked. If Metrolist ever stops opening after seven days, refresh it instead of deleting it, because uninstalling wipes your local library and downloads.',
        ],
        links: [
          { label: 'SideStore signing FAQ', href: 'https://docs.sidestore.io/docs/faq' },
          { label: 'Apple Developer Mode guide', href: 'https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device' },
        ],
      },
      {
        id: 'first-listen',
        heading: 'Set up your library',
        paragraphs: [
          'You can jump straight in without signing into Google, or sign in whenever you want your YouTube Music playlists and liked songs. Premium-only audio quality still requires your own Premium subscription.',
          'Moving a library over from Android or desktop? Export a backup in Settings > Backup & import and restore it on your iPhone or iPad. Restoring replaces the library on the destination device and doesn’t include downloaded audio files. Keep the backup file private too, since it can hold account credentials.',
        ],
        links: [{ label: 'Metrolist accounts and backups FAQ', href: 'https://metrolist.cc/faq' }],
      },
    ],
  },
]
