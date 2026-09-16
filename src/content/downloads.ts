export type DownloadPlatformKey = 'android' | 'ios' | 'linux' | 'macos' | 'windows'

export type ReleaseAsset = {
  name: string
  browser_download_url: string
  size?: number
}

export type DownloadArchitecture = {
  key: string
  name: string
  patterns: readonly RegExp[]
}

export type DownloadPlatform = {
  key: DownloadPlatformKey
  icon: string
  name: string
  detail: string
  package: string
  instructions: readonly string[]
  architectures: readonly DownloadArchitecture[]
}

export type LatestRelease = {
  name?: string
  tag_name?: string
  assets?: ReleaseAsset[]
}

let latestReleaseRequest: Promise<LatestRelease> | undefined

export function getLatestRelease() {
  if (!latestReleaseRequest) {
    latestReleaseRequest = fetch('https://api.github.com/repos/MetrolistGroup/Metrolist/releases/latest')
      .then(response => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
        return response.json() as Promise<LatestRelease>
      })
      .catch(error => {
        latestReleaseRequest = undefined
        throw error
      })
  }
  return latestReleaseRequest
}

export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = [
  {
    key: 'android',
    icon: 'android',
    name: 'Android',
    detail: 'Android 6 and newer',
    package: 'APK',
    instructions: [
      'Download the APK for your device.',
      'Allow installs from this source when Android asks.',
      'Open the APK and follow the installation prompt.',
    ],
    architectures: [
      {
        key: 'universal',
        name: 'Universal',
        patterns: [/metrolist-android.*universal.*\.apk$/i, /metrolist-android-(?!.*(?:arm64|aarch64|x86_64|x64|amd64)).*\.apk$/i],
      }
    ],
  },
  {
    key: 'ios',
    icon: 'apple',
    name: 'iOS',
    detail: 'iOS 17 and newer',
    package: 'IPA',
    instructions: [
      'Download the unsigned IPA.',
      'Open it in AltStore, SideStore, TrollStore, or Sideloadly.',
      'Follow your sideloading app’s prompts to sign and install Metrolist.',
    ],
    architectures: [
      {
        key: 'universal',
        name: 'iPhone & iPad',
        patterns: [/metrolist.*\.ipa$/i],
      },
    ],
  },
  {
    key: 'linux',
    icon: 'linux',
    name: 'Linux',
    detail: 'Most modern distributions',
    package: 'AppImage',
    instructions: [
      'Download the AppImage for your architecture.',
      'Make the file executable.',
      'Run it directly or add it to your application menu.',
    ],
    architectures: [
      {
        key: 'x86_64',
        name: 'x86_64',
        patterns: [/metrolist-desktop-linux-.*(?:x86_64|x64|amd64).*\.appimage$/i, /metrolist-desktop-linux-(?!.*(?:arm64|aarch64)).*\.appimage$/i],
      },
      {
        key: 'arm64',
        name: 'ARM64',
        patterns: [/metrolist-desktop-linux-.*(?:arm64|aarch64).*\.appimage$/i],
      },
    ],
  },
  {
    key: 'macos',
    icon: 'macos',
    name: 'macOS',
    detail: 'Apple silicon and Intel',
    package: 'DMG',
    instructions: [
      'Download and open the DMG for your Mac.',
      'Drag Metrolist into Applications.',
      'Open Metrolist from Applications and approve the first launch.',
    ],
    architectures: [
      {
        key: 'arm64',
        name: 'Apple silicon',
        patterns: [/metrolist-desktop-macos-.*(?:arm64|aarch64).*\.dmg$/i, /metrolist-desktop-macos-(?!.*(?:x64|x86_64|intel)).*\.dmg$/i],
      },
      {
        key: 'x86_64',
        name: 'Intel',
        patterns: [/metrolist-desktop-macos-.*(?:x64|x86_64|intel).*\.dmg$/i],
      },
    ],
  },
  {
    key: 'windows',
    icon: 'windows',
    name: 'Windows',
    detail: 'Windows 10 and newer',
    package: 'Installer or portable ZIP',
    instructions: [
      'Download the installer for your architecture.',
      'Run the installer and follow the prompts.',
      'Launch Metrolist from the Start menu.',
    ],
    architectures: [
      {
        key: 'x64',
        name: 'x64',
        patterns: [/metrolist-installer-windows-.*(?:x64|x86_64|amd64).*\.exe$/i, /metrolist-installer-windows-(?!.*(?:arm64|aarch64)).*\.exe$/i, /metrolist-desktop-windows\.zip$/i],
      },
      {
        key: 'arm64',
        name: 'ARM64',
        patterns: [/metrolist-installer-windows-.*(?:arm64|aarch64).*\.exe$/i, /metrolist-desktop-windows-.*(?:arm64|aarch64).*\.zip$/i],
      },
    ],
  },
]

export function findDownloadAsset(platformKey: DownloadPlatformKey, architectureKey: string, assets: ReleaseAsset[]) {
  const architecture = DOWNLOAD_PLATFORMS
    .find(({ key }) => key === platformKey)
    ?.architectures.find(({ key }) => key === architectureKey)

  if (!architecture) return

  for (const pattern of architecture.patterns) {
    const asset = assets.find(({ name }) => pattern.test(name))
    if (asset) return asset
  }
}
