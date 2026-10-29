import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const PLATFORM_GUIDES: readonly Guide[] = [
  {
    slug: 'best-youtube-music-client-android-2026',
    heading: 'Best YouTube Music client for Android in 2026',
    meta: {
      title: 'Best YouTube Music client for Android in 2026 · Metrolist',
      description: 'Our Android recommendation for 2026, with reasons to choose Metrolist, ArchiveTune, ViTune, InnerTune, or SimpMusic and advice for switching apps.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist is our Android pick for 2026 if you want background playback, offline songs, and Listen Together rooms. It also has iOS and desktop apps. For an Android player with local-file playback, compare ArchiveTune and ViTune too.',
    sections: [
      {
        id: 'why-metrolist',
        heading: 'Why we recommend Metrolist',
        paragraphs: [
          'Metrolist plays songs and videos from YouTube Music without ads. You can listen without signing in, keep music playing with the screen off, and save songs for offline use. It runs on Android 9 and newer.',
          'Listen Together is a reason to choose it over an app you use alone. A host creates a room, friends join, and the app keeps their playback synchronized. On a computer, you can use the Windows, macOS, or Linux app from the same project. Moving your local library still takes a backup and restore. Installing the apps does not copy that library automatically.',
        ],
        links: [{ label: 'Metrolist playback and platform information', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'other-android-choices',
        heading: 'When another Android app makes sense',
        paragraphs: [
          'ArchiveTune and ViTune both list playback of files on your device. ArchiveTune also lists crossfade and several player styles. Those are useful details to compare if you already keep a music collection on your phone.',
          'InnerTune lists downloads, synced lyrics, tempo and pitch controls, and Android Auto. SimpMusic offers listening statistics and word-by-word lyrics, plus desktop apps. It also lists Listen Together rooms compatible with Metrolist. Check its Full and FOSS variants before downloading. The Full variant includes crash reporting.',
        ],
        links: [
          { label: 'ArchiveTune playback options', href: 'https://github.com/rukamori/ArchiveTune' },
          { label: 'ViTune local playback and controls', href: 'https://github.com/bartoostveen/ViTune' },
          { label: 'InnerTune Android features', href: 'https://github.com/z-huang/InnerTune' },
          { label: 'SimpMusic features and app variants', href: 'https://github.com/maxrave-dev/SimpMusic' },
        ],
      },
      {
        id: 'switching-apps',
        heading: 'Back up before changing players',
        paragraphs: [
          'Download Metrolist from this site or its official releases. Make a backup before moving from the original Android app. KMP builds install separately, so restore your backup in the new app and check your library before removing the original.',
          'A Spotify playlist import finds matching recordings on YouTube Music. It does not transfer Spotify audio or keep the two playlists in continuous sync. Check a few tracks before relying on a large import.',
        ],
        links: [{ label: 'Metrolist installation and import FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'service-limits',
        heading: 'The music service still sets limits',
        paragraphs: [
          'Third-party clients depend on YouTube access. A service change can interrupt playback, and using them may violate the YouTube Terms of Service. Open source does not guarantee account safety. Premium-only audio quality still needs your own YouTube Music Premium subscription.',
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
      description: 'Choose a Metrolist desktop download, check Mac chip and Windows package options, and compare SimpMusic, Spotube, and FreeTube for computer listening.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist has desktop apps for Windows 10 and newer, macOS 15 and newer, and Linux. Windows and Linux downloads use x64. Mac users choose Apple silicon or Intel. You can listen without a Google sign-in and download music for offline use.',
    sections: [
      {
        id: 'windows',
        heading: 'Windows installer or portable ZIP',
        paragraphs: [
          'Open the download selector and choose Windows. The EXE installer walks you through setup and adds the app to the Start menu. With the portable ZIP, extract the files to a folder and run Metrolist there. A ZIP archive must be extracted before you run the app.',
        ],
        links: [{ label: 'Metrolist downloads and package instructions', href: 'https://metrolist.cc/#platforms' }],
      },
      {
        id: 'macos',
        heading: 'Choose the build for your Mac chip',
        paragraphs: [
          'In the Apple menu, open About This Mac and look for Chip or Processor. Choose the Apple silicon download for an Apple chip and the Intel download for an Intel processor. Metrolist requires macOS 15 or newer.',
          'Open the DMG, drag Metrolist into Applications, and launch it there. Review any first-launch security prompt against the source of the download. Keep the app from the official project rather than a repackaged installer.',
        ],
        links: [{ label: 'Mac download requirements', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'linux',
        heading: 'Linux AppImage and sign-in requirements',
        paragraphs: [
          'Download the x64 AppImage and make it executable before launching it. Metrolist packages its desktop runtime. You do not need a Kotlin development environment to use the app.',
          'The embedded Linux sign-in window needs GTK3, WebKitGTK 4.1, and JavaScriptCore. If that window cannot open, check those runtime libraries for your distribution. Treat a sign-in window failure separately from whether the main player starts. You can use Metrolist without signing in.',
        ],
        links: [{ label: 'Metrolist desktop and account guidance', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'library-transfer',
        heading: 'Bring your library over with a backup',
        paragraphs: [
          'Use Settings > Backup & import to create a backup on the old device and restore it on the computer. The backup carries library information and supported settings, but not downloaded audio. Restore replaces the destination library. Back it up first if it already contains music you want to keep.',
          'Backups can include account credentials. Transfer them privately and avoid attaching them to public issue reports. Download the songs again on the computer if you need them offline.',
        ],
        links: [{ label: 'Backup transfer and credential warnings', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'other-desktop-apps',
        heading: 'Other desktop apps to compare',
        paragraphs: [
          'SimpMusic has Windows, macOS, and Linux builds and lists lyric tools and listening statistics. Spotube uses plugins for music sources and metadata. FreeTube is a desktop YouTube player for videos, subscriptions, and local playlists. Choose that workflow if concerts and music videos matter more to you than a YouTube Music library.',
        ],
        links: [
          { label: 'SimpMusic desktop installation', href: 'https://github.com/maxrave-dev/SimpMusic' },
          { label: 'Spotube plugins and downloads', href: 'https://github.com/team-spotube/spotube' },
          { label: 'FreeTube desktop player', href: 'https://github.com/FreeTubeApp/FreeTube' },
        ],
      },
    ],
  },
  {
    slug: 'metrolist-ios-iphone',
    heading: 'Install Metrolist on iPhone and iPad',
    meta: {
      title: 'Metrolist for iOS · YouTube Music on iPhone and iPad',
      description: 'Install the Metrolist IPA on iOS 17 or newer with AltStore, SideStore, or Sideloadly. Understand signing refreshes before moving your music library.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist runs on iPhone and iPad with iOS 17 or newer. Download its IPA and install it with AltStore, SideStore, or Sideloadly. This route requires you to sign the app and keep that signing valid.',
    sections: [
      {
        id: 'get-the-ipa',
        heading: 'Download the iOS package',
        paragraphs: [
          'Choose iOS in the download selector on this site and save the IPA. An APK is for Android and cannot install on an iPhone. Metrolist provides an unsigned IPA for your sideloading tool to sign.',
          'Get it from the official project. A third-party signing service or repackaged download adds another party you would need to trust with the app or your account details.',
        ],
        links: [{ label: 'Metrolist iOS download and requirements', href: 'https://metrolist.cc/#platforms' }],
      },
      {
        id: 'choose-a-tool',
        heading: 'Choose how you will sign it',
        paragraphs: [
          'AltStore Classic uses AltServer on a computer to install and refresh apps. SideStore needs a computer for initial setup and can then refresh apps on the device through its supported setup. Sideloadly installs an IPA from a computer and offers automatic refresh when the device is reachable.',
          'SideStore has its own network and pairing requirements. Follow its setup guide before installing the IPA.',
        ],
        links: [
          { label: 'AltStore Classic and AltServer', href: 'https://faq.altstore.io/altstore-classic/altserver' },
          { label: 'SideStore installation guide', href: 'https://docs.sidestore.io/docs/installation/install' },
          { label: 'Sideloadly installation and refresh FAQ', href: 'https://sideloadly.io/faq.html' },
        ],
      },
      {
        id: 'refresh-and-trust',
        heading: 'Keep the app signed',
        paragraphs: [
          'With a free Apple account, development-signed apps normally expire after seven days and need a refresh. Your signing tool explains its account limits and refresh procedure. Plan for that before a trip, especially if you will not have access to the computer used for signing.',
          'Follow the prompts to trust your signing account and enable Developer Mode when required. If Metrolist stops opening after a signing expiry, try the refresh procedure before uninstalling it. Removing the app can remove its local library and downloads.',
        ],
        links: [
          { label: 'SideStore signing and account limits', href: 'https://docs.sidestore.io/docs/faq' },
          { label: 'Apple Developer Mode instructions', href: 'https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device' },
        ],
      },
      {
        id: 'first-listen',
        heading: 'Set up your library after installation',
        paragraphs: [
          'You can start listening without signing in to Google. Sign-in is optional if you want your YouTube Music account library. Premium-only audio quality still requires your own eligible subscription.',
          'To move a Metrolist library from another device, use Settings > Backup & import. Back up the destination first because restore replaces its library. Downloaded audio is not part of that backup, so save the songs again on the iPhone or iPad. Keep backup files private because they can contain account credentials.',
        ],
        links: [{ label: 'Metrolist accounts and cross-device backups', href: 'https://metrolist.cc/faq' }],
      },
    ],
  },
]
