import { expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { DESKTOP_PLATFORMS, SHOWCASE_VIEWS, findScreenshot, screenshotFiles } from '../src/content/showcase'

test('showcase resolves each view, platform and fold state', () => {
  for (const { key: view } of SHOWCASE_VIEWS) {
    for (const { key: platform } of DESKTOP_PLATFORMS) {
      expect(screenshotFiles('desktop', view, platform, false)).toEqual([
        `desktop-${platform}-${view}.webp`, `desktop-${view}.webp`,
      ])
    }
    expect(screenshotFiles('ios', view, 'macos', false)).toEqual([
      `ios-${view}.webp`, `iphone-17-${view}-dark.webp`,
    ])
    for (const folded of [true, false]) {
      expect(screenshotFiles('android', view, 'linux', folded)).toEqual([
        `android-${folded ? '' : 'unfolded-'}${view}.webp`,
        `pixel-10-pro-fold-${folded ? 'folded' : 'unfolded'}-${view}-dark.webp`,
      ])
    }
    expect(screenshotFiles('wear', view, 'windows', false)).toEqual(['wear-player.webp', 'wear-home.webp'])
  }
  const files = screenshotFiles('desktop', 'home', 'linux', false)
  const generic = { '/src/assets/kmp/desktop-home.webp': '/assets/desktop-home.webp' }
  expect(findScreenshot(files, {})).toBeUndefined()
  expect(findScreenshot(files, generic)).toBe('/assets/desktop-home.webp')
  expect(findScreenshot(files, { ...generic, '/src/assets/kmp/desktop-linux-home.webp': '/assets/desktop-linux-home.webp' })).toBe('/assets/desktop-linux-home.webp')
  expect(screenshotFiles('desktop', 'home', 'linux', false, true)).toEqual(['desktop-linux-home-thumb.webp', 'desktop-home-thumb.webp'])
  expect(findScreenshot(screenshotFiles('android', 'home', 'linux', false), { '/src/assets/kmp/android-home.webp': 'cover' })).toBeUndefined()
})

test('all supplied phone, foldable and desktop views resolve to full and thumbnail captures', () => {
  const available = Object.fromEntries(readdirSync(new URL('../src/assets/kmp/', import.meta.url)).map(file => [`/src/assets/kmp/${file}`, `/assets/${file}`]))
  for (const { key: view } of SHOWCASE_VIEWS) {
    for (const { key: platform } of DESKTOP_PLATFORMS) {
      for (const device of ['ios', 'android', 'desktop'] as const) {
        for (const folded of [true, false]) {
          expect(findScreenshot(screenshotFiles(device, view, platform, folded), available)).toEndWith('.webp')
          expect(findScreenshot(screenshotFiles(device, view, platform, folded, true), available)).toEndWith('-thumb.webp')
        }
      }
    }
  }
})
