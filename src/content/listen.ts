export function roomCodeFromQuery(value: unknown): string {
  // KMP party invitations allow up to 64 letters, numbers, underscores, or hyphens.
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : ''
}

export function listenAppUrl(code: string): string {
  return roomCodeFromQuery(code) ? `metrolist://party?r=${code}` : ''
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
