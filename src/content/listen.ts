export function roomCodeFromQuery(value: unknown): string {
  // Android's legacy parser uses six characters; shared MobileRoutes accepts eight.
  return typeof value === 'string' && (value.length === 6 || value.length === 8) && !/[^A-Za-z0-9]/.test(value) ? value : ''
}

export function listenAppUrl(code: string, userAgent: string, maxTouchPoints: number): string {
  if (!roomCodeFromQuery(code)) return ''
  // AndroidManifest registers HTTPS /listen, not the metrolist scheme.
  if (/android/i.test(userAgent)) return `https://metrolist.cc/listen?code=${code}`
  // iOS Info.plist registers metrolist; MobileRoutes requires exactly eight characters.
  if (code.length === 8 && (/iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && maxTouchPoints > 1))) {
    return `metrolist://listen-together/${code}`
  }
  return ''
}

export async function copyRoomCode(code: string): Promise<boolean> {
  if (!roomCodeFromQuery(code)) return false
  try {
    await navigator.clipboard.writeText(code)
    return true
  } catch {
    // Older browsers and denied clipboard permissions may still allow a selected copy.
  }

  let input: HTMLInputElement | undefined
  const previousFocus = document.activeElement as HTMLElement | null
  try {
    input = document.createElement('input')
    input.value = code
    input.readOnly = true
    input.tabIndex = -1
    input.setAttribute('aria-hidden', 'true')
    input.style.cssText = 'position: fixed; left: -9999px; top: 0;'
    document.body.appendChild(input)
    input.focus({ preventScroll: true })
    input.select()
    return document.execCommand('copy') === true
  } catch {
    return false
  } finally {
    input?.remove()
    previousFocus?.focus?.({ preventScroll: true })
  }
}
