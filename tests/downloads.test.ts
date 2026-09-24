import { expect, test } from 'bun:test'
import { findDownloadAsset, type ReleaseAsset } from '../src/content/downloads'

const assets: ReleaseAsset[] = [
  { name: 'Metrolist-Windows-64.zip', browser_download_url: 'windows-portable' },
  { name: 'Metrolist-Windows-64.exe', browser_download_url: 'windows-installer' },
  { name: 'Metrolist-Linux-64.appimage', browser_download_url: 'linux-x86_64' },
  { name: 'Metrolist.apk', browser_download_url: 'android-normal' },
  { name: 'Metrolist-izzy.apk', browser_download_url: 'android-izzy' },
  { name: 'Metrolist-iOS.ipa', browser_download_url: 'ios' },
  { name: 'Metrolist-macOS-arm.dmg', browser_download_url: 'macos-arm64' },
  { name: 'Metrolist-macos-intel.dmg', browser_download_url: 'macos-intel' },
]

test('matches the supplied release filenames and prefers the Windows installer', () => {
  expect(findDownloadAsset('android', 'universal', assets)?.browser_download_url).toBe('android-normal')
  expect(findDownloadAsset('ios', 'universal', assets)?.browser_download_url).toBe('ios')
  expect(findDownloadAsset('linux', 'x86_64', assets)?.browser_download_url).toBe('linux-x86_64')
  expect(findDownloadAsset('macos', 'arm64', assets)?.browser_download_url).toBe('macos-arm64')
  expect(findDownloadAsset('macos', 'x86_64', assets)?.browser_download_url).toBe('macos-intel')
  expect(findDownloadAsset('windows', 'x64', assets)?.browser_download_url).toBe('windows-installer')

  expect(findDownloadAsset('android', 'universal', assets.slice(4, 5))?.browser_download_url).toBe('android-izzy')
  expect(findDownloadAsset('windows', 'x64', assets.slice(0, 1))?.browser_download_url).toBe('windows-portable')
})
