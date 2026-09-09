export type ShowcaseDevice = 'ios' | 'desktop' | 'android' | 'wear'
export const SHOWCASE_VIEWS = [
  { key: 'home', name: 'Home' },
  { key: 'library', name: 'Library' },
  { key: 'player', name: 'Player' },
] as const
export type ShowcaseView = typeof SHOWCASE_VIEWS[number]['key']
export type DesktopPlatform = 'windows' | 'linux' | 'macos'

export const DESKTOP_PLATFORMS = [
  { key: 'windows', name: 'Windows', device: 'Windows desktop' },
  { key: 'linux', name: 'Linux', device: 'Linux laptop' },
  { key: 'macos', name: 'macOS', device: 'MacBook Neo' },
] as const

// Prefer device-specific captures and WebP, with original PNGs as fallbacks.
export function screenshotFiles(device: ShowcaseDevice, view: ShowcaseView, platform: DesktopPlatform, folded: boolean): string[] {
  const stems = {
    desktop: [`desktop-${platform}-${view}`, `desktop-${view}`],
    ios: [`ios-${view}`, `iphone-17-${view}-dark`],
    android: [`android-${folded ? '' : 'unfolded-'}${view}`, `pixel-10-pro-fold-${folded ? 'folded' : 'unfolded'}-${view}-dark`],
    wear: ['wear-player', 'wear-home'],
  }[device]
  return stems.flatMap(stem => [`${stem}.webp`, `${stem}.png`])
}

export function findScreenshot(files: string[], available: Record<string, string>): string | undefined {
  for (const file of files) {
    const image = available[`/public/images/kmp/${file}`]
    if (image) return image
  }
}
