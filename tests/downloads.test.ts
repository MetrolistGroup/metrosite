import { expect, test } from 'bun:test'
import { DOWNLOAD_PLATFORMS, findDownloadAsset, type ReleaseAsset } from '../src/content/downloads'
import { faqMarkdown, homeMarkdown } from '../scripts/markdown'

const assets: ReleaseAsset[] = [
  { name: 'Metrolist-Desktop-windows.zip', browser_download_url: 'windows-portable' },
  { name: 'metrolist-installer-windows-x64-14.0.0.exe', browser_download_url: 'windows-installer' },
  { name: 'metrolist-desktop-windows-arm64-14.0.0.zip', browser_download_url: 'windows-arm64' },
  { name: 'metrolist-desktop-linux-x64-14.0.0.AppImage', browser_download_url: 'linux-x64' },
  { name: 'metrolist-desktop-linux-arm64-14.0.0.AppImage', browser_download_url: 'linux-arm64' },
  { name: 'Metrolist.apk', browser_download_url: 'android-normal' },
  { name: 'Metrolist-izzy.apk', browser_download_url: 'android-izzy' },
  { name: 'Metrolist.ipa', browser_download_url: 'ios' },
  { name: 'metrolist-desktop-macos-arm64-14.0.0.dmg', browser_download_url: 'macos-arm64' },
  { name: 'metrolist-desktop-macos-x64-14.0.0.dmg', browser_download_url: 'macos-intel' },
]

test('matches the supplied release filenames and prefers the Windows installer', () => {
  expect(findDownloadAsset('android', 'universal', assets)?.browser_download_url).toBe('android-normal')
  expect(findDownloadAsset('ios', 'universal', assets)?.browser_download_url).toBe('ios')
  expect(findDownloadAsset('linux', 'x86_64', assets)?.browser_download_url).toBe('linux-x64')
  expect(findDownloadAsset('linux', 'arm64', assets)?.browser_download_url).toBe('linux-arm64')
  expect(findDownloadAsset('macos', 'arm64', assets)?.browser_download_url).toBe('macos-arm64')
  expect(findDownloadAsset('macos', 'x86_64', assets)?.browser_download_url).toBe('macos-intel')
  expect(findDownloadAsset('windows', 'x64', assets)?.browser_download_url).toBe('windows-installer')
  expect(findDownloadAsset('windows', 'arm64', assets)?.browser_download_url).toBe('windows-arm64')

  expect(findDownloadAsset('android', 'universal', assets.slice(6, 7))?.browser_download_url).toBe('android-izzy')
  expect(findDownloadAsset('windows', 'x64', assets.slice(0, 1))?.browser_download_url).toBe('windows-portable')
})

test('rejects missing builds, other platforms, and unsupported architectures', () => {
  for (const platform of DOWNLOAD_PLATFORMS) {
    for (const architecture of platform.architectures) {
      expect(findDownloadAsset(platform.key, architecture.key, [])).toBeUndefined()
      const wrongPlatform = platform.key === 'android' ? assets.slice(7, 8) : assets.slice(5, 7)
      expect(findDownloadAsset(platform.key, architecture.key, wrongPlatform)).toBeUndefined()
    }
    expect(findDownloadAsset(platform.key, 'unsupported', assets)).toBeUndefined()
  }
  expect(findDownloadAsset('macos', 'arm64', assets.slice(9))).toBeUndefined()
  expect(findDownloadAsset('macos', 'x86_64', assets.slice(8, 9))).toBeUndefined()
  expect(findDownloadAsset('windows', 'x64', [
    { name: 'metrolist-desktop-windows-arm64-14.0.0.zip', browser_download_url: 'wrong-architecture' },
    { name: 'metrolist-installer-windows-x64-14.0.0.exe.sha256', browser_download_url: 'checksum' },
  ])).toBeUndefined()
  expect(findDownloadAsset('linux', 'x86_64', [
    { name: 'metrolist-desktop-linux-arm64-14.0.0.AppImage', browser_download_url: 'wrong-architecture' },
  ])).toBeUndefined()
})

test('generated platform content has accurate requirements and both Windows install paths', () => {
  const home = homeMarkdown()
  for (const content of [home, faqMarkdown()]) {
    expect(content).toContain('Android 7 and newer')
    expect(content).toContain('iOS 17 and newer')
    expect(content).toContain('macOS 15 and newer')
    expect(content).not.toContain('TrollStore')
  }
  expect(home).toContain('For the EXE, run the installer')
  expect(home).toContain('For the ZIP, extract it to a folder')
})
