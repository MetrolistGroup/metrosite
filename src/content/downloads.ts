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

const RELEASE_TIMEOUT_MS = 10_000
const RELEASE_CACHE_MS = 60_000
let latestReleaseRequest: Promise<LatestRelease> | undefined
let lastSuccessfulRelease: LatestRelease | undefined
let latestReleaseExpiresAt = Infinity

export function getLatestRelease() {
  if (!latestReleaseRequest || Date.now() >= latestReleaseExpiresAt) {
    latestReleaseExpiresAt = Infinity
    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout>
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error('GitHub release request timed out'))
        controller.abort()
      }, RELEASE_TIMEOUT_MS)
    })
    const request = async () => {
      const response = await fetch('https://api.github.com/repos/MetrolistGroup/Metrolist/releases/latest', {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
      return response.json() as Promise<LatestRelease>
    }
    // Keep the deadline active through body parsing, not just response headers.
    latestReleaseRequest = Promise.race([request(), deadline])
      .then(release => {
        lastSuccessfulRelease = release
        latestReleaseExpiresAt = Date.now() + RELEASE_CACHE_MS
        return release
      })
      .catch(error => {
        latestReleaseRequest = undefined
        if (lastSuccessfulRelease !== undefined) return lastSuccessfulRelease
        throw error
      })
      .finally(() => clearTimeout(timeout))
  }
  return latestReleaseRequest
}

export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = [
  {
    key: 'android',
    icon: 'android',
    name: 'Android',
    detail: 'Android 9 and newer',
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
        patterns: [/^Metrolist\.apk$/i, /^Metrolist-izzy\.apk$/i],
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
      'Open it in AltStore, SideStore, or Sideloadly.',
      'Follow your sideloading app’s prompts to sign and install Metrolist.',
    ],
    architectures: [
      {
        key: 'universal',
        name: 'iPhone & iPad',
        patterns: [/^Metrolist-iOS\.ipa$/i],
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
        patterns: [/^Metrolist-Linux-64\.appimage$/i],
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
        patterns: [/^Metrolist-macOS-arm\.dmg$/i],
      },
      {
        key: 'x86_64',
        name: 'Intel',
        patterns: [/^Metrolist-macos-intel\.dmg$/i],
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
      'Download the EXE installer or portable ZIP for your architecture.',
      'For the EXE, run the installer and follow the prompts, then launch Metrolist from the Start menu.',
      'For the ZIP, extract it to a folder and run Metrolist from the extracted folder.',
    ],
    architectures: [
      {
        key: 'x64',
        name: 'x64',
        patterns: [/^Metrolist-Windows-64\.exe$/i, /^Metrolist-Windows-64\.zip$/i],
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
