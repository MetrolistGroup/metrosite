import { expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { DESKTOP_PLATFORMS, SHOWCASE_VIEWS, findScreenshot, screenshotFiles } from '../src/content/showcase'

test('showcase resolves each view, platform and fold state, preferring WebP over PNG', () => {
  for (const { key: view } of SHOWCASE_VIEWS) {
    for (const { key: platform } of DESKTOP_PLATFORMS) {
      expect(screenshotFiles('desktop', view, platform, false)).toEqual([
        `desktop-${platform}-${view}.webp`, `desktop-${platform}-${view}.png`, `desktop-${view}.webp`, `desktop-${view}.png`,
      ])
    }
    expect(screenshotFiles('ios', view, 'macos', false)).toEqual([
      `ios-${view}.webp`, `ios-${view}.png`, `iphone-17-${view}-dark.webp`, `iphone-17-${view}-dark.png`,
    ])
    for (const folded of [true, false]) {
      expect(screenshotFiles('android', view, 'linux', folded)).toEqual([
        `android-${folded ? '' : 'unfolded-'}${view}.webp`, `android-${folded ? '' : 'unfolded-'}${view}.png`,
        `pixel-10-pro-fold-${folded ? 'folded' : 'unfolded'}-${view}-dark.webp`, `pixel-10-pro-fold-${folded ? 'folded' : 'unfolded'}-${view}-dark.png`,
      ])
    }
    expect(screenshotFiles('wear', view, 'windows', false)).toEqual(['wear-player.webp', 'wear-player.png', 'wear-home.webp', 'wear-home.png'])
  }
  const files = screenshotFiles('desktop', 'home', 'linux', false)
  const generic = { '/public/images/kmp/desktop-home.webp': '/images/kmp/desktop-home.webp' }
  expect(findScreenshot(files, {})).toBeUndefined()
  expect(findScreenshot(files, generic)).toBe('/images/kmp/desktop-home.webp')
  expect(findScreenshot(files, { ...generic, '/public/images/kmp/desktop-linux-home.png': '/images/kmp/desktop-linux-home.png' })).toBe('/images/kmp/desktop-linux-home.png')
  const phone = screenshotFiles('ios', 'home', 'macos', false)
  const png = { '/public/images/kmp/iphone-17-home-dark.png': '/images/kmp/iphone-17-home-dark.png' }
  expect(findScreenshot(phone, png)).toBe('/images/kmp/iphone-17-home-dark.png')
  expect(findScreenshot(phone, { ...png, '/public/images/kmp/iphone-17-home-dark.webp': '/images/kmp/iphone-17-home-dark.webp' })).toBe('/images/kmp/iphone-17-home-dark.webp')
  expect(findScreenshot(screenshotFiles('android', 'home', 'linux', false), { '/public/images/kmp/android-home.webp': 'cover' })).toBeUndefined()
})

test('all supplied phone, foldable and desktop views resolve to optimized captures', () => {
  const available = Object.fromEntries(readdirSync(new URL('../public/images/kmp/', import.meta.url)).map(file => [`/public/images/kmp/${file}`, `/images/kmp/${file}`]))
  for (const { key: view } of SHOWCASE_VIEWS) {
    for (const { key: platform } of DESKTOP_PLATFORMS) {
      for (const device of ['ios', 'android', 'desktop'] as const) {
        for (const folded of [true, false]) {
          expect(findScreenshot(screenshotFiles(device, view, platform, folded), available)).toEndWith('.webp')
        }
      }
    }
  }
})
