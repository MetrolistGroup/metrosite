import { afterEach, expect, mock, test } from 'bun:test'
import { parseQuery } from 'vue-router'
import { copyRoomCode, listenAppUrl, roomCodeFromQuery } from '../src/content/listen'

test('accepts legacy and KMP party room codes without changing their text', () => {
  for (const code of ['ABC123', 'abc123', 'ROOM1234', 'room1234', 'listentogetherid', 'room_id-1', 'A', 'A'.repeat(64)]) {
    expect(roomCodeFromQuery(parseQuery(`code=${code}`).code)).toBe(code)
  }
  expect(roomCodeFromQuery(parseQuery('code=%41BC123').code)).toBe('ABC123')
})

test('rejects malformed, ambiguous, control-containing and oversized invitations', () => {
  for (const query of [
    '', 'code', 'code=', `code=${'A'.repeat(65)}`,
    'code=ABC123&code=DEF456', 'code[]=ABC123', 'code=ABC+123', 'code=%20ABC123',
    'code=ABC123%20', 'code=ABCDE%0A', 'code=ABCDEFG%0A', 'code=AB%0D%0ACD',
    'code=ABC%0012', 'code=ABC%0912', 'code=ABC%7F12', 'code=%', 'code=%C0%AF',
    'code=%ED%A0%80', 'code=ABC12%C3%A9', 'code=ABC12%3C', 'code=ABC123%2F',
    'code=javascript:alert(1)', `code=${'A'.repeat(65536)}`,
  ]) {
    expect(roomCodeFromQuery(parseQuery(query).code)).toBe('')
  }
  for (const value of [null, undefined, 123456, ['ABC123'], {}]) {
    expect(roomCodeFromQuery(value)).toBe('')
  }
})

test('uses the KMP party scheme registered on mobile and desktop', () => {
  for (const code of ['ABC123', 'room1234', 'listentogetherid', 'room_id-1']) {
    expect(listenAppUrl(code)).toBe(`metrolist://party?r=${code}`)
  }
  expect(listenAppUrl('ABC123/evil')).toBe('')
  expect(listenAppUrl('ROOM1234\n')).toBe('')
})

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
afterEach(() => {
  for (const [key, descriptor] of [['navigator', originalNavigator], ['document', originalDocument]] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

function clipboardApis(writeText?: (text: string) => Promise<void>, legacyCopy = () => true) {
  const previousFocus = { focus: mock(() => {}) }
  const input = {
    value: '', readOnly: false, tabIndex: 0, style: { cssText: '' },
    setAttribute: mock(() => {}), focus: mock(() => {}), select: mock(() => {}), remove: mock(() => {}),
  }
  const document = {
    activeElement: previousFocus,
    createElement: mock(() => input),
    body: { appendChild: mock(() => {}) },
    execCommand: mock(legacyCopy),
  }
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: writeText ? { writeText } : undefined } })
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document })
  return { input, document, previousFocus }
}

const denied = async () => { throw new Error('Clipboard permission denied') }

test('modern clipboard success copies the exact code without a fallback', async () => {
  const writeText = mock(async (_text: string) => {})
  const { document } = clipboardApis(writeText)
  expect(await copyRoomCode('abc123')).toBe(true)
  expect(writeText).toHaveBeenCalledWith('abc123')
  expect(document.createElement).not.toHaveBeenCalled()
})

test('legacy clipboard works when modern copy is denied or unavailable and restores focus', async () => {
  for (const writeText of [denied, undefined]) {
    const { input, document, previousFocus } = clipboardApis(writeText)
    expect(await copyRoomCode('room1234')).toBe(true)
    expect(input.value).toBe('room1234')
    expect(input.readOnly).toBe(true)
    expect(input.select).toHaveBeenCalledTimes(1)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(input.remove).toHaveBeenCalledTimes(1)
    expect(previousFocus.focus).toHaveBeenCalledWith({ preventScroll: true })
  }
})

test('false and throwing legacy copy report failure and always remove the temporary input', async () => {
  for (const legacyCopy of [() => false, () => { throw new Error('Copy unsupported') }]) {
    const { input, previousFocus } = clipboardApis(denied, legacyCopy)
    expect(await copyRoomCode('ABC123')).toBe(false)
    expect(input.remove).toHaveBeenCalledTimes(1)
    expect(previousFocus.focus).toHaveBeenCalledTimes(1)
  }
})

test('fallback selection errors also clean up', async () => {
  const { input, document } = clipboardApis(denied)
  input.select.mockImplementation(() => { throw new Error('Selection failed') })
  expect(await copyRoomCode('ABC123')).toBe(false)
  expect(document.execCommand).not.toHaveBeenCalled()
  expect(input.remove).toHaveBeenCalledTimes(1)
})

test('invalid room text never reaches either clipboard API', async () => {
  const writeText = mock(async (_text: string) => {})
  const { document } = clipboardApis(writeText)
  expect(await copyRoomCode('AB\r\nCD')).toBe(false)
  expect(writeText).not.toHaveBeenCalled()
  expect(document.createElement).not.toHaveBeenCalled()
})
