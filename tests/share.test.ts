import { expect, test } from 'bun:test'
import { musicAppUrl, musicShareFromUrl } from '../src/content/share'

const cases = [
  ['/watch?v=123456789', 'song', '123456789', '/watch?v=123456789', 'metrolist://watch?v=123456789'],
  ['/watch?v=R93xV3v718s', 'song', 'R93xV3v718s', '/watch?v=R93xV3v718s', 'metrolist://watch?v=R93xV3v718s'],
  ['/playlist?list=PL1234567890abcdef', 'playlist', 'PL1234567890abcdef', '/playlist?list=PL1234567890abcdef', 'metrolist://playlist?list=PL1234567890abcdef'],
  ['/browse/MPREb_1234567890', 'album', 'MPREb_1234567890', '/browse/MPREb_1234567890', 'metrolist://album/MPREb_1234567890'],
  ['/channel/UC1234567890abcdef', 'artist', 'UC1234567890abcdef', '/channel/UC1234567890abcdef', 'metrolist://artist/UC1234567890abcdef'],
  ['/album/MPREb_1234567890', 'album', 'MPREb_1234567890', '/browse/MPREb_1234567890', 'metrolist://album/MPREb_1234567890'],
  ['/artist/UC1234567890abcdef', 'artist', 'UC1234567890abcdef', '/channel/UC1234567890abcdef', 'metrolist://artist/UC1234567890abcdef'],
] as const

test('opens every music share format generated or recognized by KMP c431387', () => {
  for (const [path, kind, id, youtubePath, appUrl] of cases) {
    for (const origin of ['', 'https://metrolist.cc', 'https://share.metrolist.cc', 'http://localhost:8080', 'http://127.0.0.1:8080']) {
      const share = musicShareFromUrl(origin + path)
      expect(share).toEqual({ kind, id, youtubeUrl: `https://music.youtube.com${youtubePath}` })
      for (const agent of ['Android', 'Windows', 'Macintosh', 'Linux', 'unknown']) {
        expect(musicAppUrl(share!, agent, 0)).toBe(appUrl)
      }
    }
  }
})

test('uses iOS route IDs for playlist links, including desktop-mode iPads', () => {
  for (const [path, kind, id, , appUrl] of cases) {
    const share = musicShareFromUrl(path)!
    for (const agent of ['iPhone', 'iPad', 'iPod', 'Macintosh']) {
      expect(musicAppUrl(share, agent, 5)).toBe(kind === 'playlist' ? `metrolist://playlist/${id}` : appUrl)
    }
  }
})

test('unwraps only trusted music targets without forwarding arbitrary URLs', () => {
  for (const target of [
    '/watch?v=123456789', 'https://metrolist.cc/watch?v=123456789',
    'https://music.youtube.com/watch?v=123456789', 'https://www.youtube.com/watch?v=123456789',
    'https://youtube.com/watch?v=123456789', 'https://youtu.be/123456789',
  ]) {
    expect(musicShareFromUrl(`/open?url=${encodeURIComponent(target)}`)).toEqual(musicShareFromUrl('/watch?v=123456789'))
  }
  const nested = `/open?url=${encodeURIComponent('/open?url=' + encodeURIComponent('/playlist?list=PL123'))}`
  expect(musicShareFromUrl(nested)?.youtubeUrl).toBe('https://music.youtube.com/playlist?list=PL123')
  let excessive = '/watch?v=123456789'
  for (let i = 0; i < 5; i++) excessive = `/open?url=${encodeURIComponent(excessive)}`
  expect(musicShareFromUrl(excessive)).toBeNull()
})

test('rejects missing, duplicate, malformed, oversized, and untrusted links', () => {
  for (const value of [
    '/', '/watch', '/watch?v=', '/watch?v', '/playlist', '/playlist?list=', '/browse', '/browse/', '/channel/',
    '/watch?v=one&v=two', '/playlist?list=one&list=two', '/watch?v[]=123456789',
    '/watch?v=abc%0A', '/watch?v=abc%0D', '/watch?v=abc%00', '/watch?v=abc%20',
    '/watch?v=abc%2Fdef', '/watch?v=abc%26list%3Devil', '/watch?v=%3Cscript%3E', '/watch?v=%C0%AF',
    `/watch?v=${'A'.repeat(257)}`, `/playlist?list=${'A'.repeat(5000)}`, '/channel/abc/def', '/browse/%2F',
    '/open', '/open?url=', '/open?url=/watch%3Fv%3Done&url=/watch%3Fv%3Dtwo',
    '/open?url=javascript%3Aalert(1)', '/open?url=https%3A%2F%2Fevil.example%2Fwatch%3Fv%3D123',
    'javascript:alert(1)', 'https://youtube.com.attacker.com/watch?v=123',
    'https://metrolist.cc.attacker.com/watch?v=123', 'https://attacker.com/channel/UC123',
    'https://user:password@metrolist.cc/watch?v=123', 'https://[invalid/watch?v=123',
  ]) expect(musicShareFromUrl(value)).toBeNull()
})
