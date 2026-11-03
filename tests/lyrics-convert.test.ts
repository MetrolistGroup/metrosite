import { expect, test } from 'bun:test'
import { detectFormat, importLyrics } from '../src/content/lyrics/import'
import { exportLyrics, lrcTime, ttmlTime } from '../src/content/lyrics/export'
import { syncType, toMlxJson, type Line, type LyricsDocument } from '../src/content/lyrics/model'
import { activeIndex, setLineStart, shiftLine, splitWords, WordSync } from '../src/content/lyrics/sync'

const words = (document: LyricsDocument, index = 0) => document.lines[index].words?.map(word => [word.text, word.startMs, word.endMs])

test('detects formats from extension and content', () => {
  expect(detectFormat('[00:01.00]Hi')).toBe('lrc')
  expect(detectFormat('Hello\nWorld')).toBe('plain')
  expect(detectFormat('[meta]\nprovider=x\n[lyrics]\n[00:01.00]a')).toBe('mlx')
  expect(detectFormat('{"version":2,"lines":[{"text":"a"}]}')).toBe('mlx')
  expect(detectFormat('<tt xmlns="http://www.w3.org/ns/ttml"><body/></tt>')).toBe('ttml')
  expect(detectFormat('[1000,500]a(1000,500)')).toBe('qrc')
  expect(detectFormat('[1000,500]<0,500,0>a')).toBe('krc')
  expect(detectFormat('[1000,500](1000,500,0)a')).toBe('yrc')
  expect(detectFormat('[Script Info]\nDialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,a')).toBe('ass')
  expect(detectFormat('{"type":"Line","lyrics":[]}')).toBe('lyricsplus')
  expect(detectFormat('{"lyrics":{"lines":[]}}')).toBe('spotify')
  expect(detectFormat('{"lrc":{"lyric":""}}')).toBe('netease')
  expect(detectFormat('anything', 'song.ass')).toBe('ass')
})

test('LRC handles metadata, offsets, repeated stamps, and word timings', () => {
  const document = importLyrics('[ti:Song]\n[ar:Artist]\n[offset:+100]\n[00:10.00][00:20.00]Chorus\n[00:01.5]<00:01.50>Hello <00:02.00>world<00:02.75>')
  expect(document.song).toMatchObject({ title: 'Song', artist: 'Artist' })
  expect(document.lines.map(line => [line.text, line.startMs])).toEqual([['Hello world', 1600], ['Chorus', 10100], ['Chorus', 20100]])
  expect(words(document)).toEqual([['Hello ', 1600, 2100], ['world', 2100, 2850]])
  expect(document.lines[1].endMs).toBeUndefined()
})

test('TTML keeps agents, parts, background vocals, and variants', () => {
  const document = importLyrics(`<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:itunes="http://music.apple.com/lyric-ttml-internal" xml:lang="ja">
  <head><metadata><ttm:agent type="person" xml:id="v1"><ttm:name>Lead</ttm:name></ttm:agent>
  <iTunesMetadata><translations><translation xml:lang="en"><text for="L1">Hi &amp; bye</text></translation></translations><songwriters><songwriter>Writer</songwriter></songwriters></iTunesMetadata></metadata></head>
  <body dur="3:00.000"><div itunes:songPart="Verse"><p begin="1.000" end="3.000" itunes:key="L1" ttm:agent="v1"><span begin="1.000" end="1.500">Hello</span> <span begin="1.500" end="2.000">world</span><span ttm:role="x-bg"><span begin="2.000" end="2.800">echo</span></span></p></div></body></tt>`)
  const [line] = document.lines
  expect(document.song).toMatchObject({ language: 'ja', durationMs: 180000, songwriters: ['Writer'], translationLanguage: 'en' })
  expect(document.agents).toEqual({ v1: { type: 'person', name: 'Lead' } })
  expect(document.parts).toEqual([{ name: 'Verse', endMs: 180000 }])
  expect(line).toMatchObject({ text: 'Hello world', startMs: 1000, endMs: 3000, agent: 'v1', part: 0, translatedText: 'Hi & bye' })
  expect(words(document)).toEqual([['Hello ', 1000, 1500], ['world', 1500, 2000]])
  expect(line.backgroundWords).toEqual([{ text: 'echo', startMs: 2000, endMs: 2800 }])
})

test('karaoke formats keep exact word durations', () => {
  expect(words(importLyrics('[1000,1000]Hel(1000,300)lo(1300,700)', 'qrc'))).toEqual([['Hel', 1000, 1300], ['lo', 1300, 2000]])
  expect(words(importLyrics('[1000,1000]<0,300,0>Hel<300,700,0>lo', 'krc'))).toEqual([['Hel', 1000, 1300], ['lo', 1300, 2000]])
  expect(words(importLyrics('[1000,1000](1000,300,0)Hel(1300,700,0)lo', 'yrc'))).toEqual([['Hel', 1000, 1300], ['lo', 1300, 2000]])
  const ass = importLyrics('[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:02.00,Default,Singer,0,0,0,,{\\k30}Hel{\\k70}lo, there', 'ass')
  expect(words(ass)).toEqual([['Hel', 1000, 1300], ['lo, there', 1300, 2000]])
  expect(ass.agents).toEqual({ v1: { type: 'person', name: 'Singer' } })
})

test('JSON providers convert', () => {
  const spotify = importLyrics(JSON.stringify({ lyrics: { syncType: 'LINE_SYNCED', lines: [{ startTimeMs: '1000', words: 'One' }, { startTimeMs: '2000', words: 'Two' }], language: 'en' }, colors: { background: -16777216 } }))
  expect(spotify.lines.map(line => [line.text, line.startMs, line.endMs])).toEqual([['One', 1000, 2000], ['Two', 2000, undefined]])
  expect(spotify.colors?.background).toBe('#FF000000')
  const richsync = importLyrics(JSON.stringify([{ ts: 1, te: 2, x: 'Hi you', l: [{ c: 'Hi ', o: 0 }, { c: 'you', o: 0.4 }] }]))
  expect(words(richsync)).toEqual([['Hi ', 1000, 1400], ['you', 1400, 2000]])
  const kpoe = importLyrics('{"type":"syllable","lyrics":[{"time":1000,"duration":1000,"text":"lead echo","syllabus":[{"time":1100,"duration":300,"text":"lead"},{"time":1400,"duration":200,"text":"echo","isBackground":true}],"translation":{"lang":"en","text":"translation"}}]}')
  expect(kpoe.lines[0]).toMatchObject({ translatedText: 'translation', backgroundWords: [{ text: 'echo', startMs: 1400, endMs: 1600 }] })
  const netease = importLyrics(JSON.stringify({ lrc: { lyric: '[00:01.00]一\n[00:02.00]二' }, tlyric: { lyric: '[00:02.00]two\n[00:01.00]one' } }))
  expect(netease.lines.map(line => line.translatedText)).toEqual(['one', 'two'])
})

test('text MLX reads sections, agents, parts, and variants', () => {
  const document = importLyrics('[meta]\nprovider=X\n[song]\ntitle=Song\n[agents]\nv1=person,Lead\n[lyrics]\n[part:00:01.00] Verse\n[00:01.00|v1]<00:01.00>Hi <00:01.50>there<00:02.00> [bg:<00:01.20>ooh<00:01.80>]\n[translatedlyrics]\n[00:01.00]Hallo')
  expect(document.song.title).toBe('Song')
  expect(document.agents?.v1).toEqual({ type: 'person', name: 'Lead' })
  expect(document.lines[0]).toMatchObject({ agent: 'v1', part: 0, text: 'Hi there', endMs: 2000, translatedText: 'Hallo' })
  expect(document.lines[0].backgroundWords).toEqual([{ text: 'ooh', startMs: 1200, endMs: 1800 }])
})

const sample: LyricsDocument = {
  song: { title: 'Song', artist: 'Artist', durationMs: 200000, language: 'en', translationLanguage: 'de' },
  agents: { v1: { type: 'person', name: 'Lead' } },
  parts: [{ name: 'Verse' }],
  lines: [
    { startMs: 1000, endMs: 2000, text: 'Hello world', agent: 'v1', part: 0, translatedText: 'Hallo Welt', words: [{ text: 'Hello ', startMs: 1000, endMs: 1400 }, { text: 'world', startMs: 1500, endMs: 2000 }], backgroundWords: [{ text: 'echo', startMs: 1600, endMs: 1900 }] },
    { startMs: 5000, endMs: 6000, text: 'A & <b>', agent: 'v1', part: 0, words: [{ text: 'A ', startMs: 5000, endMs: 5500 }, { text: '& <b>', startMs: 5500, endMs: 6000 }] },
  ],
}

test('exports round-trip through the importers', () => {
  const mlx = importLyrics(exportLyrics(sample, 'mlx'))
  expect(mlx.lines).toEqual(sample.lines)
  expect(mlx).toMatchObject({ provider: 'METROLIST', subprovider: 'LYRICS_SYNC', song: sample.song, agents: sample.agents, parts: sample.parts })

  const elrc = importLyrics(exportLyrics(sample, 'elrc'))
  expect(elrc.lines.map(line => [line.text, line.words, line.backgroundWords])).toEqual(sample.lines.map(line => [line.text, line.words, line.backgroundWords]))

  const ttml = importLyrics(exportLyrics(sample, 'ttml'))
  expect(ttml.lines).toEqual(sample.lines.map(({ part: _part, ...line }) => ({ ...line, part: 0 })))
  expect(ttml.song).toMatchObject({ durationMs: 200000, language: 'en', translationLanguage: 'de' })

  const lrc = exportLyrics(sample, 'lrc')
  expect(lrc).toContain('[00:01.00]Hello world\n[00:02.00]\n[00:05.00]A & <b>\n[00:06.00]')
  expect(importLyrics(lrc).lines.map(line => [line.text, line.startMs])).toEqual([['Hello world', 1000], ['A & <b>', 5000]])
  expect(exportLyrics(sample, 'plain')).toBe('Hello world\nA & <b>\n')
})

test('MLX output sorts lines and computes the sync type', () => {
  const document: LyricsDocument = { song: {}, lines: [{ text: 'plain' }, { text: 'b', startMs: 2000 }, { text: 'a', startMs: 1000 }] }
  const json = JSON.parse(toMlxJson(document))
  expect(json).toMatchObject({ version: 2, syncType: 'line', sourceFormat: 'plain', song: {} })
  expect(json.lines.map((line: { text: string }) => line.text)).toEqual(['a', 'b', 'plain'])
  expect(syncType({ song: {}, lines: [{ text: 'x' }] })).toBe('plain')
  expect(() => toMlxJson({ song: {}, lines: [{ text: ' ' }] })).toThrow()
})

test('time formatting', () => {
  expect(lrcTime(61234)).toBe('01:01.23')
  expect(lrcTime(-5)).toBe('00:00.00')
  expect(ttmlTime(61234)).toBe('1:01.234')
  expect(ttmlTime(3_723_004)).toBe('01:02:03.004')
})

test('rejects empty and malformed input', () => {
  expect(() => importLyrics('   ')).toThrow()
  expect(() => importLyrics('<tt><body><p>unclosed</body></tt>', 'ttml')).toThrow()
  expect(() => importLyrics('{"version":2,"lines":[{"text":"a","part":3}]}')).toThrow()
})

test('splits words for syncing', () => {
  expect(splitWords('  Hello  big world ')).toEqual(['Hello  ', 'big ', 'world'])
  expect(splitWords('君の名は ok')).toEqual(['君', 'の', '名', 'は ', 'ok'])
})

test('word sync handles holds, taps, undo, and line commits', () => {
  const sync = new WordSync()
  const line: Line = { text: 'one two three' }
  sync.begin(line)
  sync.press(1000); expect(sync.release(1400)).toBeUndefined()
  sync.press(1500); sync.release(1550)
  expect(sync.undo()).toBe(true)
  sync.press(1600); sync.release(1650) // tap: ends at the next press
  sync.press(2100); const done = sync.release(2150)
  expect(done).toBe(line)
  expect(sync.undo()).toBe(false)
  expect(line.words).toEqual([{ text: 'one ', startMs: 1000, endMs: 1400 }, { text: 'two ', startMs: 1600, endMs: 2100 }, { text: 'three', startMs: 2100, endMs: 2100 }])
  sync.begin({ text: 'next' })
  sync.press(2600)
  expect(line.words[2].endMs).toBe(2600)
  expect(line).toMatchObject({ startMs: 1000, endMs: 2600 })
})

test('line timing helpers', () => {
  const line: Line = { text: 'a', startMs: 1000, endMs: 2000, words: [{ text: 'a', startMs: 1000, endMs: 2000 }] }
  setLineStart(line, 1500)
  expect(line).toMatchObject({ startMs: 1500, endMs: 2500, words: [{ text: 'a', startMs: 1500, endMs: 2500 }] })
  shiftLine(line, -3000)
  expect(line.startMs).toBe(0)
  const lines: Line[] = [{ text: 'a', startMs: 0 }, { text: 'b', startMs: 1000, endMs: 1500 }, { text: 'c' }]
  expect([activeIndex(lines, -1), activeIndex(lines, 500), activeIndex(lines, 1200), activeIndex(lines, 5000)]).toEqual([-1, 0, 1, -1])
})
