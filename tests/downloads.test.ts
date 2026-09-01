import { expect, test } from 'bun:test'
import { findDownloadAsset, type ReleaseAsset } from '../src/content/downloads'

const assets: ReleaseAsset[] = [
  { name: 'Metrolist-Desktop-windows.zip', browser_download_url: 'portable' },
  { name: 'metrolist-desktop-linux-x64-2.0.0.AppImage', browser_download_url: 'linux-x64' },
  { name: 'metrolist-desktop-linux-arm64-2.0.0.AppImage', browser_download_url: 'linux-arm64' },
  { name: 'metrolist-android-2.0.0.apk', browser_download_url: 'android-universal' },
  { name: 'metrolist-android-arm64-2.0.0.apk', browser_download_url: 'android-arm64' },
  { name: 'metrolist-desktop-macos-arm64-2.0.0.dmg', browser_download_url: 'macos-arm64' },
  { name: 'metrolist-desktop-macos-x64-2.0.0.dmg', browser_download_url: 'macos-intel' },
  { name: 'metrolist-installer-windows-x64-2.0.0.exe', browser_download_url: 'windows-x64' },
  { name: 'metrolist-installer-windows-arm64-2.0.0.exe', browser_download_url: 'windows-arm64' },
]

test('matches platform architectures and prefers the Windows installer', () => {
  expect(findDownloadAsset('android', 'universal', assets)?.browser_download_url).toBe('android-universal')
  expect(findDownloadAsset('android', 'arm64', assets)?.browser_download_url).toBe('android-arm64')
  expect(findDownloadAsset('linux', 'x86_64', assets)?.browser_download_url).toBe('linux-x64')
  expect(findDownloadAsset('linux', 'arm64', assets)?.browser_download_url).toBe('linux-arm64')
  expect(findDownloadAsset('macos', 'arm64', assets)?.browser_download_url).toBe('macos-arm64')
  expect(findDownloadAsset('macos', 'x86_64', assets)?.browser_download_url).toBe('macos-intel')
  expect(findDownloadAsset('windows', 'x64', assets)?.browser_download_url).toBe('windows-x64')
  expect(findDownloadAsset('windows', 'arm64', assets)?.browser_download_url).toBe('windows-arm64')
})
