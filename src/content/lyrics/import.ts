// Import converters ported from Lyprio's internal/mlx package.
import {
  finishLineWords, finishWords, first, invalid, isJsonMlx, parseMlxJson, sortLines, wordsText,
  type Agent, type Line, type LyricsDocument, type Word,
} from './model'

export const IMPORT_FORMATS = {
  auto: 'Detect automatically',
  mlx: 'MLX (JSON or text)',
  lrc: 'LRC / Enhanced LRC',
  ttml: 'TTML',
  plain: 'Plain text',
  qrc: 'QRC',
  krc: 'KRC (decrypted)',
  yrc: 'YRC',
  ass: 'ASS / SSA karaoke',
  spotify: 'Spotify JSON',
  musixmatch: 'Musixmatch JSON',
  lyricsplus: 'LyricsPlus KPOE JSON',
  qq: 'QQ Music JSON',
  netease: 'NetEase JSON',
} as const

export type ImportFormat = keyof typeof IMPORT_FORMATS

const EXTENSIONS: Record<string, ImportFormat> = {
  mlx: 'mlx', lrc: 'lrc', elrc: 'lrc', ttml: 'ttml', xml: 'ttml', txt: 'plain',
  qrc: 'qrc', krc: 'krc', yrc: 'yrc', ass: 'ass', ssa: 'ass',
}

const lrcTimestamp = /\[(\d+):([0-5]?\d)(?:[.:](\d{1,3}))?\]/g
const clockTimestamp = /\[((?:\d+:)?\d+:[0-5]\d(?:[.:]\d{1,3})?)\]/
const rangeTimestamp = /^\[([^\]~]+)~([^\]]+)\]/
const wordTimestamp = /<([0-9]+:[0-5]?\d(?:[.:][0-9]{1,3})?)>/g
const metadataPattern = /^\[([A-Za-z_]+):(.*)\]$/
const leadingTimedLine = /^\[(\d+),(\d+)](.*)$/
const qrcWord = /\((\d+),(\d+)\)/g
const krcWord = /<([0-9]+),([0-9]+),[0-9]+>/g
const yrcWord = /\(([0-9]+),([0-9]+),[0-9]+\)/g

export function detectFormat(content: string, fileName = ''): ImportFormat {
  const byExtension = EXTENSIONS[fileName.split('.').pop()?.toLowerCase() ?? '']
  const text = content.replace(/^﻿/, '').trim()
  if (text.startsWith('[meta]') && text.includes('\n[lyrics]')) return 'mlx'
  if (byExtension && byExtension !== 'plain') return byExtension
  if (text.startsWith('{') || text.startsWith('[{')) {
    if (isJsonMlx(text)) return 'mlx'
    try {
      const value = JSON.parse(text)
      if (Array.isArray(value)) return 'musixmatch'
      if (value.yrc || value.lrc || value.tlyric || value.romalrc) return 'netease'
      if (typeof value.lyric === 'string' || typeof value.Lyric === 'string') return 'qq'
      if (Array.isArray(value.lyrics)) return 'lyricsplus'
      if (Array.isArray(value.lines) || Array.isArray(value.lyrics?.lines)) return 'spotify'
      return 'musixmatch'
    } catch { /* Not JSON: fall through to text formats. */ }
  }
  if (/<tt[\s>]/.test(text)) return 'ttml'
  if (text.includes('LyricContent')) return 'qrc'
  if (/^\[script info\]/im.test(text) || /^dialogue:/im.test(text)) return 'ass'
  if (/^\[\d+,\d+\].*\(\d+,\d+,\d+\)/m.test(text)) return 'yrc'
  if (/^\[\d+,\d+\].*<\d+,\d+,\d+>/m.test(text)) return 'krc'
  if (/^\[\d+,\d+\].*\(\d+,\d+\)/m.test(text)) return 'qrc'
  if (/\[\d+:[0-5]?\d(?:[.:]\d{1,3})?\]/.test(text) || /<\d+:[0-5]?\d(?:[.:]\d{1,3})?>/.test(text)) return 'lrc'
  return 'plain'
}

export function importLyrics(content: string, format: ImportFormat = 'auto', fileName = ''): LyricsDocument {
  if (!content.trim()) throw invalid('Paste lyrics or choose a file first.')
  const kind = format === 'auto' ? detectFormat(content, fileName) : format
  let document: LyricsDocument
  try {
    document = PARSERS[kind as Exclude<ImportFormat, 'auto'>](content.replace(/^﻿/, ''))
  } catch (error) {
    throw invalid(`These lyrics could not be read as ${IMPORT_FORMATS[kind]}.${error instanceof SyntaxError ? ` ${error.message}` : ''}`)
  }
  document.sourceFormat ||= kind
  if (!document.lines.length) throw invalid(`No lyric lines were found in this ${IMPORT_FORMATS[kind]} file.`)
  sortLines(document.lines)
  return document
}

const PARSERS: Record<Exclude<ImportFormat, 'auto'>, (content: string) => LyricsDocument> = {
  mlx: content => isJsonMlx(content) ? parseMlxJson(content) : parseTextMlx(content),
  plain: parsePlain,
  lrc: parseLrc,
  ttml: parseTtml,
  qrc: parseQrc,
  krc: parseKrc,
  yrc: content => parseLeadingWords(content, yrcWord, false),
  ass: parseAss,
  spotify: content => parseSpotify(JSON.parse(content)),
  musixmatch: parseMusixmatch,
  lyricsplus: parseLyricsPlus,
  qq: parseQq,
  netease: parseNetEase,
}

// Typed views of regex results: listed groups always exist as strings here.
type Match = string[] & { index: number }
const matchOf = (text: string, pattern: RegExp) => text.match(pattern) as Match | null
const matchesOf = (text: string, pattern: RegExp) => [...text.matchAll(pattern)] as Match[]

const emptyDocument = (): LyricsDocument => ({ song: {}, lines: [] })
const splitLines = (text: string) => text.split('\n').map(line => line.replace(/\r$/, ''))
const clean = (value: string) => value.replace(/[\r\n]/g, ' ').trim()
const round = (value: unknown) => Math.round(Number(value) || 0)

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
export function unescapeHtml(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== '#') return ENTITIES[entity.toLowerCase()] ?? match
    const code = entity[1]!.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
  })
}

function cut(value: string, separator: string): [string, string, boolean] {
  const index = value.indexOf(separator)
  return index < 0 ? [value, '', false] : [value.slice(0, index), value.slice(index + separator.length), true]
}

// Clock values such as 1:02.5, 62.5s, 1.5m, or 500ms.
export function parseClock(input: string) {
  let value = input.trim()
  if (value.endsWith('ms')) return round(value.slice(0, -2))
  let multiplier = 1000
  if (value.endsWith('h')) [multiplier, value] = [3_600_000, value.slice(0, -1)]
  else if (value.endsWith('m')) [multiplier, value] = [60_000, value.slice(0, -1)]
  else if (value.endsWith('s')) value = value.slice(0, -1)
  const [seconds = 0, minutes = 0, hours = 0] = value.split(':').map(part => Number(part) || 0).reverse()
  if (!value.includes(':')) return Math.round(seconds * multiplier)
  return Math.round((seconds + minutes * 60 + hours * 3600) * 1000)
}

function lrcGroups(minutes: string, seconds: string, fraction = '') {
  let milliseconds = fraction ? Number(fraction) : 0
  if (fraction.length === 1) milliseconds *= 100
  else if (fraction.length === 2) milliseconds *= 10
  else if (fraction.length > 3) milliseconds = Math.floor(milliseconds / 10 ** (fraction.length - 3))
  return Number(minutes) * 60_000 + Number(seconds) * 1000 + milliseconds
}

export function parseLrcTimestamp(input: string) {
  const value = input.trim()
  const [minutes, rest, ok] = cut(value, ':')
  if (!ok) return parseClock(value)
  let [seconds, fraction, dot] = cut(rest, '.')
  if (!dot) [seconds, fraction] = cut(rest, ':')
  if (seconds.includes(':')) return parseClock(value)
  return lrcGroups(minutes, seconds, fraction)
}

export function parsePlain(text: string): LyricsDocument {
  return { song: {}, lines: splitLines(text).filter(line => line.trim()).map(text => ({ text })) }
}

type Enhanced = { words?: Word[]; text: string; end: number; hasEnd: boolean }

function parseEnhancedContent(content: string, lineStart: number): Enhanced {
  const matches = matchesOf(content, wordTimestamp)
  if (!matches.length) return { text: content.trim(), end: 0, hasEnd: false }
  const words: Word[] = []
  const head = matches[0]!
  const prefix = unescapeHtml(content.slice(0, head.index))
  if (prefix) words.push({ text: prefix, startMs: lineStart, endMs: parseLrcTimestamp(head[1]!) })
  matches.forEach((match, index) => {
    const next = matches[index + 1]
    const segment = unescapeHtml(content.slice(match.index + match[0]!.length, next?.index ?? content.length))
    if (segment) words.push({ text: segment, startMs: parseLrcTimestamp(match[1]!), endMs: next ? parseLrcTimestamp(next[1]!) : 0 })
  })
  if (!words.length) return { text: content.replace(wordTimestamp, '').trim(), end: 0, hasEnd: false }
  const last = matches[matches.length - 1]!
  const end = words[words.length - 1]!.endMs
  return { words, text: wordsText(words), end, hasEnd: last.index + last[0]!.length === content.length && end > 0 }
}

function parseEnhancedLine(input: string, start: number): Line {
  let content = input
  const line: Line = { text: '', startMs: start }
  const bgIndex = content.indexOf('[bg:')
  if (bgIndex >= 0) {
    const background = parseEnhancedContent(content.slice(bgIndex + 4).replace(/]$/, ''), start)
    if (background.words?.length) line.backgroundWords = background.words
    else if (background.text) line.backgroundText = background.text
    if (background.hasEnd) line.endMs = background.end
    content = content.slice(0, bgIndex)
  }
  const marker = content.indexOf('<')
  if (marker > 0) {
    const prefix = content.slice(0, marker).trim()
    if (prefix.endsWith(':') && !/\s/.test(prefix.slice(0, -1))) {
      line.agent = prefix.slice(0, -1)
      content = content.slice(marker)
    }
  }
  const main = parseEnhancedContent(content, start)
  line.text = main.text
  if (main.words?.length) line.words = main.words
  if (main.hasEnd && (line.endMs === undefined || main.end > line.endMs)) line.endMs = main.end
  return line
}

function readLrcMetadata(key: string, value: string, document: LyricsDocument) {
  switch (key.toLowerCase()) {
    case 'ti': case 'title': document.song.title = value; break
    case 'ar': case 'artist': document.song.artist = value; break
    case 'al': case 'album': document.song.album = value; break
    case 'la': case 'lang': case 'language': document.song.language = value; break
    case 'length': case 'duration': document.song.durationMs = parseClock(value); break
    case 'by': case 'author': document.source = { ...document.source, curator: value }; break
    default: return false
  }
  return true
}

export function parseLrc(text: string): LyricsDocument {
  const document = emptyDocument()
  let offset = 0
  const add = (line: Line) => {
    if (line.agent) (document.agents ??= {})[line.agent] = { type: 'person' }
    document.lines.push(line)
  }
  for (const raw of splitLines(text)) {
    const line = raw.trim()
    if (!line) continue
    const matches = matchesOf(line, lrcTimestamp)
    if (!matches.length) {
      const meta = matchOf(line, metadataPattern)
      if (meta) {
        const [, key = '', value = ''] = meta
        if (key.toLowerCase() === 'offset') offset = Number.parseInt(value.trim(), 10) || 0
        else readLrcMetadata(key, value.trim(), document)
        continue
      }
      const range = matchOf(line, rangeTimestamp)
      if (range) {
        const start = parseLrcTimestamp(range[1]!)
        add({ ...parseEnhancedLine(line.slice(range[0]!.length), start), startMs: start, endMs: parseLrcTimestamp(range[2]!) })
        continue
      }
      const clock = matchOf(line, clockTimestamp)
      if (clock) {
        const start = parseClock(clock[1]!)
        const content = line.slice(clock.index + clock[0]!.length).trim() || line.slice(0, clock.index).trim()
        add({ ...parseEnhancedLine(content, start), startMs: start })
        continue
      }
      const word = matchesOf(line, wordTimestamp)[0]
      if (word) add(parseEnhancedLine(line, parseLrcTimestamp(word[1]!)))
      continue
    }
    const last = matches[matches.length - 1]!
    let content = line.slice(last.index + last[0]!.length)
    if (!content.trim() && matches[0]!.index > 0) content = line.slice(0, matches[0]!.index).trim()
    // Repeated timestamps ([00:10][00:40]Chorus) expand into one line per time.
    for (const match of matches) {
      const start = lrcGroups(match[1]!, match[2]!, match[3])
      add(parseEnhancedLine(content, start))
    }
  }
  document.lines.sort((a, b) => a.startMs! - b.startMs!)
  document.lines = document.lines.filter((line, index, lines) => {
    line.startMs = Math.max(0, line.startMs! + offset)
    for (const word of [...line.words ?? [], ...line.backgroundWords ?? []]) {
      word.startMs = Math.max(0, word.startMs + offset)
      if (word.endMs > 0) word.endMs += offset
    }
    if (line.endMs !== undefined) line.endMs = Math.max(line.startMs, line.endMs + offset)
    const next = lines[index + 1]
    const fallback = line.endMs ?? (next && next.startMs! + offset > line.startMs ? next.startMs! + offset : undefined)
    finishLineWords(line, fallback)
    return line.text.trim() || line.words?.length || line.backgroundWords?.length || line.backgroundText
  })
  if (!document.lines.length) throw invalid()
  return document
}

// Legacy Metrolist text MLX.
const mlxLine = /^\[(\d+:\d{2}(?:[.:]\d{1,3})?)(?:~(\d+:\d{2}(?:[.:]\d{1,3})?))?(?:\|([^\]|]+))?](.*)$/
const mlxPart = /^\[(?:part|songpart):?(?:(\d+:\d{2}(?:[.:]\d{1,3})?)(?:~(\d+:\d{2}(?:[.:]\d{1,3})?))?)?]\s*(.*)$/i
const mlxBackground = /\s*\[bg:(.*)]$/
const KNOWN_SECTIONS = ['meta', 'song', 'colors', 'agents', 'agentcolors', 'lyrics', 'romanlyrics', 'translatedlyrics', 'extension']

function splitSections(text: string) {
  const sections: Record<string, string[]> = {}
  let current = ''
  for (const line of text.split('\n')) {
    const trimmed = line.trim().toLowerCase()
    const name = trimmed.slice(1, -1)
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inLyrics = ['lyrics', 'romanlyrics', 'translatedlyrics'].includes(current)
      if (KNOWN_SECTIONS.includes(name) || !/[:~|]/.test(trimmed) && (!inLyrics || trimmed.startsWith('[x-'))) {
        current = name.trim()
        continue
      }
    }
    if (current) (sections[current] ??= []).push(line)
  }
  return sections
}

function sectionValues(lines: string[] = []) {
  const values: Record<string, string> = {}
  for (const line of lines) {
    const [key, value, ok] = cut(line.trim(), '=')
    if (ok) values[key.trim().toLowerCase()] = value.trim()
  }
  return values
}

function parseTextLines(lines: string[] = [], document?: LyricsDocument) {
  const result: Line[] = []
  let part = -1
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '').trim()
    if (!line || line.startsWith('//')) continue
    const partMatch = matchOf(line, mlxPart)
    if (partMatch) {
      if (document && partMatch[3]?.trim()) {
        (document.parts ??= []).push({
          name: partMatch[3]!.trim(),
          startMs: partMatch[1] ? parseLrcTimestamp(partMatch[1]) : undefined,
          endMs: partMatch[2] ? parseLrcTimestamp(partMatch[2]) : undefined,
        })
        part = document.parts.length - 1
      }
      continue
    }
    const match = matchOf(line, mlxLine)
    const partField = part >= 0 ? { part } : {}
    if (!match) {
      result.push({ text: line, ...partField })
      continue
    }
    const entry: Line = { startMs: parseLrcTimestamp(match[1]!), text: '', ...partField }
    if (match[3]?.trim()) entry.agent = match[3].trim()
    if (match[2]) entry.endMs = parseLrcTimestamp(match[2])
    let content = match[4] ?? ''
    const background = matchOf(content, mlxBackground)
    if (background) {
      content = content.slice(0, content.length - background[0]!.length)
      const parsed = parseEnhancedContent(background[1]!, entry.startMs!)
      if (parsed.words) entry.backgroundWords = parsed.words
      if (parsed.text && !parsed.words) entry.backgroundText = parsed.text
    }
    const parsed = parseEnhancedContent(content, entry.startMs!)
    entry.text = parsed.text
    if (parsed.words) entry.words = parsed.words
    if (entry.endMs === undefined && parsed.hasEnd) entry.endMs = parsed.end
    result.push(entry)
  }
  return result.filter((line, index) => {
    const next = result[index + 1]
    finishLineWords(line, line.endMs ?? (next?.startMs !== undefined && next.startMs > (line.startMs ?? 0) ? next.startMs : undefined))
    return line.text || line.words?.length || line.backgroundWords?.length || line.backgroundText
  })
}

function attachTextVariant(lines: Line[], variants: Line[], roman: boolean) {
  const byTime = new Map(variants.filter(line => line.startMs !== undefined).map((line, index) => [line.startMs, index]))
  lines.forEach((line, index) => {
    const match = line.startMs !== undefined ? byTime.get(line.startMs) : undefined
    const variant = variants[match ?? index]
    if (!variant || match === undefined && variant.startMs !== undefined) return
    if (roman) {
      line.romanizedText = variant.text
      if (variant.words) line.romanizedWords = variant.words
    } else line.translatedText = variant.text
  })
}

export function parseTextMlx(input: string): LyricsDocument {
  const text = input.trim()
  if (!text.startsWith('[meta]') || !text.includes('\n[lyrics]')) throw invalid()
  const sections = splitSections(text)
  const meta = sectionValues(sections.meta)
  const song = sectionValues(sections.song)
  const colors = sectionValues(sections.colors)
  const document: LyricsDocument = {
    provider: meta.provider, subprovider: meta.subprovider, sourceFormat: meta.source_format || 'mlx-text',
    source: { name: meta.lyric_source, id: meta.source_id, curator: meta.curator, copyright: meta.copyright, lastFetched: meta.last_fetched },
    song: {
      title: song.title, artist: song.artist, album: song.album, youtubeId: song.youtube_id, isrc: song.isrc, platformId: song.platform_id,
      language: song.language, romanizationLanguage: song.romanization_language, translationLanguage: song.translation_language,
      durationMs: Number.parseInt(song.duration_ms ?? '', 10) || undefined,
      songwriters: song.songwriters?.split(',').map(writer => writer.trim()).filter(Boolean),
    },
    colors: { background: colors.background, text: colors.text, highlight: colors.highlight },
    agents: {},
    lines: [],
    extensions: Object.fromEntries(Object.entries(sections).filter(([name]) => !KNOWN_SECTIONS.slice(0, 8).includes(name))),
  }
  for (const raw of sections.agents ?? []) {
    const [id, value, ok] = cut(raw.trim(), '=')
    if (!ok || !id.trim()) continue
    const [type, name] = cut(value, ',')
    document.agents![id.trim()] = { type: type.trim(), ...name.trim() ? { name: name.trim() } : {} }
  }
  for (const [id, color] of Object.entries(sectionValues(sections.agentcolors))) {
    document.agents![id] = { type: 'person', ...document.agents![id], color }
  }
  document.lines = parseTextLines(sections.lyrics, document)
  if (!document.lines.length) throw invalid()
  attachTextVariant(document.lines, parseTextLines(sections.romanlyrics), true)
  attachTextVariant(document.lines, parseTextLines(sections.translatedlyrics), false)
  return document
}

// Minimal namespace-unaware XML reader: names and attributes are matched by
// lowercase local name, as Lyprio's TTML parser does.
export type XmlNode = { name: string; attrs: Record<string, string>; parts: (string | XmlNode)[]; children: XmlNode[]; timing: Timing }
type Timing = { startMs?: number; endMs?: number }

const xmlToken = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/\s*([^\s>]+)\s*>|<([^\s/>!?]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/y
const xmlAttribute = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
const localName = (name: string) => name.slice(name.indexOf(':') + 1).toLowerCase()

export function parseXml(source: string): XmlNode {
  let root: XmlNode | undefined
  const stack: XmlNode[] = []
  xmlToken.lastIndex = 0
  while (xmlToken.lastIndex < source.length) {
    const start = xmlToken.lastIndex
    const match = xmlToken.exec(source)
    if (!match) throw new SyntaxError(`Unexpected markup near character ${start}.`)
    const [, cdata, closing, opening, attributes, selfClosing, text] = match
    const parent = stack[stack.length - 1]
    if (cdata !== undefined || text !== undefined) {
      parent?.parts.push(cdata ?? unescapeHtml(text!))
    } else if (closing) {
      if (stack.pop()?.name !== localName(closing)) throw new SyntaxError(`Unexpected closing tag </${closing}>.`)
    } else if (opening) {
      const node: XmlNode = { name: localName(opening), attrs: {}, parts: [], children: [], timing: {} }
      for (const attribute of matchesOf(attributes ?? '', xmlAttribute)) node.attrs[localName(attribute[1]!)] ??= unescapeHtml(attribute[2] ?? attribute[3] ?? '').trim()
      if (parent) {
        parent.children.push(node)
        parent.parts.push(node)
      } else if (root) throw new SyntaxError('More than one root element.')
      else root = node
      if (!selfClosing) stack.push(node)
    }
  }
  if (!root || stack.length) throw new SyntaxError('The XML document is incomplete.')
  return root
}

const attr = (node: XmlNode | undefined, name: string) => node?.attrs[name.toLowerCase()] ?? ''
const descendants = (node: XmlNode): XmlNode[] => node.children.flatMap(child => [child, ...descendants(child)])
const firstNode = (node: XmlNode, name: string) => node.name === name ? node : descendants(node).find(child => child.name === name)
const ttmlClockPattern = /^(?:[0-9]+(?:\.[0-9]+)?(?:ms|h|m|s)?|(?:[0-9]{2,}:)?[0-9]{1,2}:[0-5][0-9](?:\.[0-9]+)?)$/

export function parseTtmlClock(input: string, signed = false) {
  let value = input.trim()
  const negative = signed && value.startsWith('-')
  if (negative) value = value.slice(1)
  if (!ttmlClockPattern.test(value)) throw invalid(`Invalid TTML time "${input}".`)
  let multiplier = 1000
  for (const [suffix, scale] of [['ms', 1], ['h', 3_600_000], ['m', 60_000], ['s', 1000]] as const) {
    if (value.endsWith(suffix)) {
      value = value.slice(0, -suffix.length)
      multiplier = scale
      break
    }
  }
  const total = Math.round(value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0) * multiplier)
  return negative ? -total : total
}

function prepareTtml(node: XmlNode, inherited: Timing, offset: number) {
  const timing = { ...inherited }
  let duration = -1
  if (node.attrs.begin) timing.startMs = parseTtmlClock(node.attrs.begin) + offset
  if (node.attrs.end) timing.endMs = parseTtmlClock(node.attrs.end) + offset
  if (node.attrs.dur) duration = parseTtmlClock(node.attrs.dur)
  if (duration >= 0) {
    const end = (timing.startMs ?? offset) + duration
    if (timing.endMs === undefined || end < timing.endMs) timing.endMs = end
  }
  if (timing.startMs !== undefined && timing.endMs !== undefined && timing.endMs < timing.startMs) throw invalid('A TTML element ends before it begins.')
  node.timing = timing
  for (const child of node.children) prepareTtml(child, timing, offset)
}

function roleMatches(role: string, wanted: string) {
  if (wanted === '*') return true
  const lower = role.toLowerCase()
  if (!wanted) return lower !== 'x-bg' && lower !== 'x-roman' && lower !== 'x-translation'
  return lower === wanted
}

function ttmlText(node: XmlNode, inheritedRole: string, wanted: string): string {
  const role = attr(node, 'role') || inheritedRole
  return node.parts.map(part => typeof part === 'string' ? roleMatches(role, wanted) ? part : '' : ttmlText(part, role, wanted)).join('')
}

const hasTiming = (node: XmlNode) => Boolean(node.attrs.begin || node.attrs.end || node.attrs.dur)
const hasTimedChild = (node: XmlNode): boolean => node.children.some(child => child.name === 'span' && hasTiming(child) || hasTimedChild(child))

function ttmlWords(node: XmlNode, wanted: string): [Word[], boolean] {
  const words: Word[] = []
  let whitespace = ''
  let complete = true
  const flush = () => {
    if (whitespace) words[words.length - 1]!.text += whitespace
    whitespace = ''
  }
  const walk = (current: XmlNode, inheritedRole: string) => {
    const role = attr(current, 'role') || inheritedRole
    if (current.name === 'span' && hasTiming(current) && current.timing.startMs !== undefined && !hasTimedChild(current) && roleMatches(role, wanted)) {
      flush()
      words.push({ text: ttmlText(current, inheritedRole, wanted), startMs: current.timing.startMs, endMs: current.timing.endMs ?? current.timing.startMs })
      return
    }
    for (const part of current.parts) {
      if (typeof part !== 'string') walk(part, role)
      else if (!part.trim()) {
        const matches = roleMatches(role, wanted) || wanted === 'x-roman' && roleMatches(role, '')
        if (matches && !/[\r\n]/.test(part) && words.length) whitespace += part
      } else if (roleMatches(role, wanted)) complete = false
    }
  }
  walk(node, '')
  flush()
  return [words, complete]
}

const cleanLyricText = (text: string) => /[\r\n]/.test(text) ? text.split(/\s+/).filter(Boolean).join(' ') : text.trim()

type TtmlLine = Line & { key: string }

function ttmlLine(node: XmlNode, agent: string, part: number, document: LyricsDocument): TtmlLine | undefined {
  const timing = { ...node.timing }
  if (timing.startMs === undefined) timing.startMs = descendants(node).find(child => child.timing.startMs !== undefined)?.timing.startMs
  const line: TtmlLine = { text: '', key: first(attr(node, 'key'), attr(node, 'for'), attr(node, 'id')), startMs: timing.startMs, endMs: timing.endMs }
  if (first(attr(node, 'agent'), agent)) line.agent = first(attr(node, 'agent'), agent)
  if (part >= 0) line.part = part
  if (attr(node, 'role').toLowerCase() === 'x-bg') line.background = true
  if (attr(node, 'songPart')) {
    (document.parts ??= []).push({ name: attr(node, 'songPart'), startMs: line.startMs, endMs: line.endMs })
    line.part = document.parts.length - 1
  }
  line.text = cleanLyricText(ttmlText(node, '', ''))
  line.romanizedText = cleanLyricText(ttmlText(node, '', 'x-roman')) || undefined
  line.translatedText = cleanLyricText(ttmlText(node, '', 'x-translation')) || undefined
  const [words] = ttmlWords(node, '')
  const [backgroundWords, complete] = ttmlWords(node, 'x-bg')
  const [romanWords, romanComplete] = ttmlWords(node, 'x-roman')
  if (romanComplete && romanWords.length) line.romanizedText = wordsText(romanWords)
  if (!backgroundWords.length || !complete) line.backgroundText = cleanLyricText(ttmlText(node, '', 'x-bg')) || undefined
  finishWords(words, line.endMs)
  finishWords(backgroundWords, line.endMs)
  if (words[0] && line.startMs !== undefined && words[0].startMs < line.startMs) line.startMs = words[0].startMs
  if (!line.text && words.length) line.text = wordsText(words)
  if (line.endMs === undefined && line.startMs !== undefined && (words.length || backgroundWords.length)) {
    line.endMs = Math.max(line.startMs, ...words.map(word => word.endMs), ...backgroundWords.map(word => word.endMs))
  }
  finishWords(romanWords, line.endMs)
  if (words.length) line.words = words
  if (complete && backgroundWords.length) line.backgroundWords = backgroundWords
  if (romanWords.length) line.romanizedWords = romanWords
  return line.text || line.words || line.backgroundWords || line.backgroundText ? line : undefined
}

function mergeBackgroundLines(lines: TtmlLine[]) {
  const result: TtmlLine[] = []
  for (const line of lines) {
    if (!line.background || line.startMs === undefined) {
      result.push(line)
      continue
    }
    for (let index = result.length - 1; index >= 0; index--) {
      const candidate = result[index]!
      if (candidate.startMs === undefined || line.startMs - candidate.startMs > 10_000) break
      if (candidate.background || candidate.agent !== line.agent || candidate.part !== line.part) continue
      if (candidate.endMs === undefined || line.startMs <= candidate.endMs) {
        let background = first(line.backgroundText, line.text)
        if (candidate.backgroundText || background) {
          candidate.backgroundText = first(candidate.backgroundText, wordsText(candidate.backgroundWords))
          background = first(background, wordsText(line.backgroundWords))
          candidate.backgroundText = [candidate.backgroundText, background].filter(Boolean).join(' ')
          delete candidate.backgroundWords
        } else candidate.backgroundWords = [...candidate.backgroundWords ?? [], ...line.backgroundWords ?? []]
        if (line.endMs !== undefined && (candidate.endMs === undefined || line.endMs > candidate.endMs)) candidate.endMs = line.endMs
        line.text = ''
        delete line.backgroundText
        delete line.backgroundWords
        break
      }
    }
    if (line.text || line.backgroundWords?.length || line.backgroundText) result.push(line)
  }
  return result
}

function ttmlVariants(root: XmlNode, kind: string): [Map<string, Line>, string] {
  const result = new Map<string, Line>()
  let language: string | undefined
  const walk = (node: XmlNode, inVariant: boolean) => {
    if (node.name === kind) {
      language ??= attr(node, 'lang')
      if (attr(node, 'lang').toLowerCase() !== language.toLowerCase()) return
      inVariant = true
    }
    if (inVariant && (node.name === 'text' || node.name === 'p')) {
      const key = first(attr(node, 'for'), attr(node, 'key'), attr(node, 'id'))
      if (key) result.set(key, { text: cleanLyricText(ttmlText(node, '', '*')), words: ttmlWords(node, '')[0] })
    }
    for (const child of node.children) walk(child, inVariant)
  }
  walk(root, false)
  return [result, language ?? '']
}

export function parseTtml(content: string): LyricsDocument {
  const root = parseXml(content)
  if (root.name !== 'tt') throw invalid()
  const audio = firstNode(root, 'audio')
  const offset = attr(audio, 'lyricOffset') ? parseTtmlClock(attr(audio, 'lyricOffset'), true) : 0
  prepareTtml(root, {}, offset)
  const document: LyricsDocument = { song: {}, lines: [], agents: {} }
  if (attr(root, 'lang')) document.song.language = attr(root, 'lang')
  const colors: Record<string, string> = {}
  for (const node of descendants(root)) {
    if (node.name === 'agent' && attr(node, 'id')) {
      const name = node.children.find(child => child.name === 'name')
      document.agents![attr(node, 'id')] = { type: attr(node, 'type') || 'person', ...name ? { name: clean(ttmlText(name, '', '*')) } : {} }
    } else if (node.name === 'songwriter') {
      const writer = clean(ttmlText(node, '', '*'))
      if (writer) (document.song.songwriters ??= []).push(writer)
    } else if (node.name === 'style') {
      colors.text ||= attr(node, 'color')
      colors.background ||= attr(node, 'backgroundColor')
    }
  }
  if (colors.text || colors.background) document.colors = colors
  const body = firstNode(root, 'body') ?? root
  if (attr(body, 'dur')) document.song.durationMs = parseTtmlClock(attr(body, 'dur'))
  const parsed: TtmlLine[] = []
  const walk = (node: XmlNode, inheritedAgent: string, inheritedPart: number) => {
    const agent = first(attr(node, 'agent'), inheritedAgent)
    let part = inheritedPart
    if (node.name === 'div' && attr(node, 'songPart')) {
      (document.parts ??= []).push({ name: attr(node, 'songPart'), ...node.timing })
      part = document.parts.length - 1
    }
    if (node.name === 'p') {
      const line = ttmlLine(node, agent, part, document)
      if (line) parsed.push(line)
      return
    }
    for (const child of node.children) walk(child, agent, part)
  }
  walk(body, '', -1)
  if (!parsed.length) throw invalid()
  sortLines(parsed)
  const [roman, romanLanguage] = ttmlVariants(root, 'transliteration')
  const [translations, translationLanguage] = ttmlVariants(root, 'translation')
  if (romanLanguage) document.song.romanizationLanguage = romanLanguage
  if (translationLanguage) document.song.translationLanguage = translationLanguage
  for (const { key, ...line } of mergeBackgroundLines(parsed)) {
    const romanLine = roman.get(key)
    if (romanLine) {
      line.romanizedText = romanLine.text
      if (romanLine.words?.length) {
        line.romanizedWords = romanLine.words.map(word => ({ ...word }))
        finishWords(line.romanizedWords, line.endMs)
      }
    }
    const translation = translations.get(key)
    if (translation) line.translatedText = translation.text
    document.lines.push(line)
  }
  return document
}

function parseBracketMetadata(source: string, document: LyricsDocument) {
  for (const raw of splitLines(source)) {
    const match = matchOf(raw.trim(), metadataPattern)
    if (!match) continue
    const value = match[2]!.trim()
    const key = match[1]!.toLowerCase()
    if (key === 'id') document.source = { ...document.source, id: value }
    else if (['language', 'lang', 'la'].includes(key)) {
      // KRC stores a base64 alternatives payload under [language:].
      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) document.song.language = value
    } else readLrcMetadata(key, value, document)
  }
}

function parseTimedRange(start: string, duration: string, offset = 0): [number, number] {
  const begin = Number(start) + offset
  return [begin, begin + Number(duration)]
}

export function parseQrc(source: string): LyricsDocument {
  let content = source
  if (content.includes('<')) {
    try {
      const root = parseXml(content)
      const node = [root, ...descendants(root)].find(node => attr(node, 'LyricContent'))
      if (node) content = attr(node, 'LyricContent')
    } catch { /* Raw QRC text may contain stray angle brackets. */ }
  }
  content = unescapeHtml(content)
  if (/\[(\d+):([0-5]?\d)(?:[.:](\d{1,3}))?\]/.test(content)) return parseLrc(content)
  const document = emptyDocument()
  parseBracketMetadata(content, document)
  for (const raw of splitLines(content)) {
    const match = matchOf(raw.trim(), leadingTimedLine)
    if (!match) continue
    const [startMs, endMs] = parseTimedRange(match[1]!, match[2]!)
    const line: Line = { startMs, endMs, text: '', words: [] }
    const text = match[3] ?? ''
    let position = 0
    for (const word of matchesOf(text, qrcWord)) {
      const [wordStart, wordEnd] = parseTimedRange(word[1]!, word[2]!)
      const value = text.slice(position, word.index)
      if (value) line.words!.push({ text: value, startMs: wordStart, endMs: wordEnd })
      position = word.index + word[0]!.length
    }
    const trailing = text.slice(position)
    const lastWord = line.words![line.words!.length - 1]
    if (trailing && lastWord) lastWord.text += trailing
    line.text = line.words!.map(word => word.text).join('') + (line.words!.length ? '' : trailing)
    if (!line.words!.length) delete line.words
    if (line.text) document.lines.push(line)
  }
  if (!document.lines.length) throw invalid()
  return document
}

function parseLeadingWords(source: string, pattern: RegExp, relative: boolean): LyricsDocument {
  const document = emptyDocument()
  for (const raw of splitLines(source)) {
    const match = matchOf(raw.trim(), leadingTimedLine)
    if (!match) continue
    const [startMs, endMs] = parseTimedRange(match[1]!, match[2]!)
    const line: Line = { startMs, endMs, text: '' }
    const text = match[3] ?? ''
    const words = matchesOf(text, pattern)
    const parsed: Word[] = []
    words.forEach((word, index) => {
      const [wordStart, wordEnd] = parseTimedRange(word[1]!, word[2]!, relative ? startMs : 0)
      const value = unescapeHtml(text.slice(word.index + word[0]!.length, words[index + 1]?.index ?? text.length))
      if (value) parsed.push({ text: value, startMs: wordStart, endMs: wordEnd })
    })
    line.text = parsed.map(word => word.text).join('')
    if (parsed.length) line.words = parsed
    // KRC alternatives address timed rows, including empty ones.
    if (line.text || relative) document.lines.push(line)
  }
  if (!document.lines.length) throw invalid()
  return document
}

function decodeBase64(value: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(value), character => character.charCodeAt(0)))
}

export function parseKrc(source: string): LyricsDocument {
  const document = parseLeadingWords(source, krcWord, true)
  parseBracketMetadata(source, document)
  const language = matchOf(source, /^\[language:([^\]]+)]\r?$/m)
  if (language) {
    try {
      const payload = JSON.parse(decodeBase64(language[1]!))
      // Type 0 is romanization; type 1 is always a Simplified Chinese translation.
      for (const alternative of payload.content ?? []) {
        if (alternative.type !== 0) continue
        alternative.lyricContent?.forEach((pieces: string[], index: number) => {
          if (document.lines[index]) document.lines[index].romanizedText = pieces.join('')
        })
      }
    } catch { /* Alternatives are optional. */ }
  }
  document.lines = document.lines.filter(line => line.text)
  if (!document.lines.length) throw invalid()
  return document
}

const assKaraoke = /\{[^}]*\\k(?:f|o)?([0-9]+)[^}]*\}/gi
const assOverride = /\{[^}]*\}/g
const cleanAssWord = (text: string) => text.replace(assOverride, '').replace(/\\[Nnh]/g, ' ')

function parseAssClock(value: string) {
  const parts = value.split(':')
  if (parts.length !== 3 || parts.some(part => !/^\d+(?:\.\d+)?$/.test(part.trim()))) throw invalid()
  const [hours = 0, minutes = 0, seconds = 0] = parts.map(Number)
  return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000)
}

const assColor = (value = '') => {
  const hex = value.trim().replace(/^[&Hh]+|[&Hh]+$/g, '')
  return hex.length === 8 ? `#${hex.slice(0, 2)}${hex.slice(6, 8)}${hex.slice(4, 6)}${hex.slice(2, 4)}` : ''
}

export function parseAss(source: string): LyricsDocument {
  const agents: Record<string, Agent> = {}
  const document: LyricsDocument = { song: {}, lines: [], agents }
  let section = ''
  let styleFields = ['name', 'fontname', 'fontsize', 'primarycolour', 'secondarycolour', 'outlinecolour', 'backcolour']
  let eventFields = ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text']
  const styles: Record<string, string> = {}
  const row = (fields: string[], values: string[]) => Object.fromEntries(fields.map((field, index) => [field, values[index]?.trim() ?? '']))
  const events: { line: Line; comment: boolean; key: string }[] = []
  for (const raw of splitLines(source)) {
    let line = raw.trim()
    const lower = line.toLowerCase()
    if (line.startsWith('[') && line.endsWith(']')) {
      section = lower
      continue
    }
    if (lower.startsWith('format:')) {
      const fields = lower.slice(7).split(',').map(field => field.trim())
      if (section.includes('styles')) styleFields = fields
      else if (section === '[events]') eventFields = fields
      continue
    }
    if (section.includes('styles') && lower.startsWith('style:')) {
      const style = row(styleFields, line.slice(6).split(','))
      styles[style.name ?? ''] = assColor(style.primarycolour)
      continue
    }
    const comment = lower.startsWith('comment:')
    if (!comment && !lower.startsWith('dialogue:')) continue
    line = line.slice(comment ? 8 : 9).trim()
    const parts = line.split(',')
    const values = [...parts.slice(0, eventFields.length - 1), parts.slice(eventFields.length - 1).join(',')]
    const event = row(eventFields, values)
    // Aegisub template/code events are instructions, not karaoke text.
    if (/^(template|code)\b/i.test(event.effect ?? '')) continue
    const text = event.text ?? ''
    const matches = matchesOf(text, assKaraoke)
    if (comment && !matches.length) continue
    const startMs = parseAssClock(event.start ?? '')
    const endMs = parseAssClock(event.end ?? '')
    if (endMs <= startMs) continue
    const entry: Line = { startMs, endMs, text: '' }
    const agentName = first(event.name, event.actor, event.style)
    if (agentName) {
      entry.agent = Object.entries(agents).find(([, agent]) => agent.name === agentName)?.[0] ?? `v${Object.keys(agents).length + 1}`
      agents[entry.agent] = { type: 'person', name: agentName, ...styles[event.style ?? ''] ? { color: styles[event.style ?? ''] } : {} }
    }
    const words: Word[] = []
    if (matches.length) {
      const prefix = cleanAssWord(text.slice(0, matches[0]!.index))
      if (prefix) words.push({ text: prefix, startMs, endMs: startMs })
    }
    let current = startMs
    matches.forEach((match, index) => {
      const duration = Number(match[1]) * 10
      const value = cleanAssWord(text.slice(match.index + match[0]!.length, matches[index + 1]?.index ?? text.length))
      if (value) words.push({ text: value, startMs: current, endMs: Math.min(endMs, current + duration) })
      current += duration
    })
    entry.text = words.length ? words.map(word => word.text).join('') : cleanAssWord(text).trim()
    if (words.length) entry.words = words
    if (entry.text) events.push({ line: entry, comment, key: `${startMs}|${endMs}|${event.style}|${agentName}` })
  }
  // Karaoke templates keep timed originals as comments next to generated dialogue.
  const timedComments = new Set(events.filter(event => event.comment && event.line.words).map(event => event.key))
  document.lines = events.filter(event => event.comment || !timedComments.has(event.key)).map(event => event.line)
  if (!document.lines.length) throw invalid()
  document.lines.sort((a, b) => a.startMs! - b.startMs!)
  return document
}

// Attach a translation or romanization variant to the nearest unused line within 3 seconds.
function attachVariant(document: LyricsDocument, content: string | undefined, roman: boolean) {
  if (!content?.trim()) return
  let variant: LyricsDocument
  try {
    variant = parseLrc(content)
  } catch {
    try {
      variant = parseQrc(content)
    } catch {
      return
    }
  }
  const used = new Set<number>()
  variant.lines.forEach((line, index) => {
    let target = -1
    let difference = 3001
    document.lines.forEach((candidate, candidateIndex) => {
      const current = Math.abs((candidate.startMs ?? 0) - (line.startMs ?? 0))
      if (!used.has(candidateIndex) && current < difference) [target, difference] = [candidateIndex, current]
    })
    if (target < 0 && index < document.lines.length && !used.has(index)) target = index
    if (target < 0) return
    used.add(target)
    const destination = document.lines[target]!
    if (roman) {
      destination.romanizedText = line.text
      if (line.words) destination.romanizedWords = line.words
    } else destination.translatedText = line.text
  })
}

function parseQq(content: string) {
  const payload = Object.fromEntries(Object.entries(JSON.parse(content)).map(([key, value]) => [key.toLowerCase(), value as string]))
  const document = parseQrc(payload.lyric ?? '')
  attachVariant(document, payload.translation, false)
  attachVariant(document, payload.romanization, true)
  return document
}

function parseNetEase(content: string) {
  const payload = JSON.parse(content)
  const document = payload.yrc?.lyric?.trim() ? parseLeadingWords(payload.yrc.lyric, yrcWord, false) : parseLrc(payload.lrc?.lyric ?? '')
  attachVariant(document, payload.tlyric?.lyric, false)
  attachVariant(document, payload.romalrc?.lyric, true)
  return document
}

const argb = (value: unknown) => {
  if (value === undefined || value === null) return undefined
  const number = Number(value)
  return Number.isInteger(number) ? `#${(number >>> 0).toString(16).toUpperCase().padStart(8, '0')}` : String(value)
}

type SpotifyLine = { startTimeMs?: unknown; endTimeMs?: unknown; words?: string; transliteratedWords?: string; syllables?: { startTimeMs?: unknown; endTimeMs?: unknown; text?: string; words?: string }[] }

function parseSpotify(payload: any): LyricsDocument {
  const lyrics = payload?.lyrics?.lines?.length ? payload.lyrics : payload
  const lines: SpotifyLine[] = lyrics?.lines ?? []
  if (!lines.length) throw invalid()
  const colors = { background: argb(payload.colors?.background), text: argb(payload.colors?.text), highlight: argb(payload.colors?.highlightText) }
  const document: LyricsDocument = {
    song: { language: lyrics.language || undefined, songwriters: lyrics.songWriters },
    source: { name: first(lyrics.providerDisplayName, lyrics.provider) || undefined, id: lyrics.providerLyricsId, copyright: lyrics.lyricsCopyright },
    colors: colors.background || colors.text || colors.highlight ? colors : undefined,
    lines: [],
  }
  const alternative = lyrics.alternatives?.[0]
  if (alternative?.language) document.song.translationLanguage = alternative.language
  const isSynced = String(lyrics.syncType).toUpperCase() !== 'UNSYNCED'
  lines.forEach((source, index) => {
    const start = round(source.startTimeMs)
    let end = round(source.endTimeMs)
    if (end <= start && lines[index + 1]) end = round(lines[index + 1]!.startTimeMs)
    const line: Line = { text: source.words ?? '' }
    if (isSynced) {
      line.startMs = start
      if (end > start) line.endMs = end
    }
    if (source.transliteratedWords) line.romanizedText = source.transliteratedWords
    const syllables = source.syllables ?? []
    if (syllables.length) line.words = syllables.map((word, wordIndex) => {
      const wordStart = round(word.startTimeMs)
      let wordEnd = round(word.endTimeMs)
      if (wordEnd <= wordStart && syllables[wordIndex + 1]) wordEnd = round(syllables[wordIndex + 1]!.startTimeMs)
      if (wordEnd <= wordStart) wordEnd = end > 0 ? end : wordStart + 500
      return { text: word.text || word.words || '', startMs: wordStart, endMs: wordEnd }
    })
    if (alternative?.lines?.[index]?.words) line.translatedText = alternative.lines[index].words
    if (line.text || line.words) document.lines.push(line)
  })
  return document
}

function parseRichsync(body: string): LyricsDocument {
  const lines: { ts: number; te: number; x?: string; l?: { c: string; o: number }[] }[] = JSON.parse(body)
  const document = emptyDocument()
  lines.forEach((source, index) => {
    const start = Math.round(source.ts * 1000)
    let end = Math.round(source.te * 1000)
    if (end <= start && lines[index + 1]) end = Math.round(lines[index + 1]!.ts * 1000)
    const line: Line = { startMs: start, text: source.x ?? '' }
    if (end > start) line.endMs = end
    const words = source.l ?? []
    if (words.length) line.words = words.map((word, wordIndex) => {
      const wordStart = Math.round((source.ts + word.o) * 1000)
      let wordEnd = words[wordIndex + 1] ? Math.round((source.ts + words[wordIndex + 1]!.o) * 1000) : end
      if (wordEnd <= wordStart) wordEnd = wordStart + 500
      return { text: word.c, startMs: wordStart, endMs: wordEnd }
    })
    if (line.text || line.words) document.lines.push(line)
  })
  if (!document.lines.length) throw invalid()
  return document
}

function parseMusixmatch(content: string): LyricsDocument {
  const envelope = JSON.parse(content)
  if (Array.isArray(envelope)) return parseRichsync(content)
  const body = envelope?.lyrics?.message?.body ?? envelope?.message?.body ?? {}
  let document: LyricsDocument
  if (body.richsync?.richsync_body?.trim()) document = parseRichsync(body.richsync.richsync_body)
  else if (body.subtitle?.subtitle_body?.trim()) document = parseLrc(body.subtitle.subtitle_body)
  else if (body.lyrics?.lyrics_body?.trim()) {
    document = parsePlain(body.lyrics.lyrics_body.split('******* This Lyrics is NOT for Commercial use *******')[0])
    if (body.lyrics.lyrics_copyright) document.source = { copyright: body.lyrics.lyrics_copyright }
  } else throw invalid()
  const track = envelope.track ?? {}
  const song = document.song
  song.title ||= track.track_name
  song.artist ||= track.artist_name
  song.album ||= track.album_name
  song.isrc ||= track.track_isrc
  if (!song.durationMs && track.track_length) song.durationMs = Math.round(track.track_length * 1000)
  if (track.track_id) song.platformId = String(track.track_id)
  return document
}

type KpoeSyllable = { time: number; duration: number; text: string; isBackground?: boolean }
type KpoeLine = {
  time: number; duration: number; text: string; isLineEnding?: number; isBackground?: boolean; syllabus?: KpoeSyllable[]
  translation?: { lang?: string; text?: string }; transliteration?: { lang?: string; text?: string; syllabus?: KpoeSyllable[] }
  element?: { key?: string; singer?: string; songPart?: string; songPartIndex?: number; isBackground?: boolean }
}

function parseLyricsPlus(content: string): LyricsDocument {
  const shape = JSON.parse(content)
  if (!Array.isArray(shape.lyrics)) {
    const document = shape.lyrics?.lines ? parseSpotify(shape) : parseMusixmatch(content)
    document.sourceFormat = shape.lyrics?.lines ? 'spotify' : 'musixmatch'
    return document
  }
  const lines: KpoeLine[] = shape.lyrics
  if (!lines.length) throw invalid()
  const kind = String(shape.type ?? '').toLowerCase()
  const metadata = shape.metadata ?? {}
  const ms = (value: number) => Math.round(Number(value) || 0)
  const document: LyricsDocument = {
    sourceFormat: 'kpoe',
    source: { name: metadata.source, curator: metadata.curator },
    song: {
      title: metadata.title, artist: metadata.artist, album: metadata.album, isrc: metadata.isrc, language: metadata.language,
      durationMs: metadata.totalDuration ? parseClock(String(metadata.totalDuration)) : undefined, songwriters: metadata.songWriters,
    },
    agents: Object.fromEntries(Object.entries(metadata.agents ?? {}).map(([id, agent]: [string, any]) => [id, { type: agent.type, name: first(agent.name, agent.alias) || undefined, color: agent.color }])),
    parts: (metadata.songParts ?? []).map((part: any) => ({ name: part.name, startMs: ms(part.time), endMs: part.duration > 0 ? ms(part.time + part.duration) : undefined })),
    lines: [],
  }
  const partOf = (line: KpoeLine) => line.element?.songPartIndex ?? undefined
  if ((kind === 'syllable' || kind === 'word') && !lines.some(line => line.syllabus?.length)) {
    // Legacy word payloads list one word per entry and mark line endings.
    for (let index = 0; index < lines.length;) {
      const head = lines[index]!
      const line: Line = { startMs: ms(head.time), text: '', words: [], agent: head.element?.singer, part: partOf(head) }
      for (; index < lines.length; index++) {
        const source = lines[index]!
        if (source.isBackground || source.element?.isBackground) line.background = true
        const start = ms(source.time)
        let end = start + ms(source.duration)
        const next = lines[index + 1]
        if (end <= start) end = next && ms(next.time) > start ? ms(next.time) : start + 500
        line.words!.push({ text: source.text, startMs: start, endMs: end })
        if (source.isLineEnding === 1) {
          index++
          break
        }
      }
      line.text = line.words!.map(word => word.text).join('')
      line.endMs = Math.max(line.startMs!, ...line.words!.map(word => word.endMs))
      document.lines.push(line)
    }
    return document
  }
  const isSynced = kind !== 'none' && kind !== 'plain'
  for (const source of lines) {
    const start = ms(source.time)
    const end = start + ms(source.duration)
    const line: Line = { text: source.text ?? '', agent: source.element?.singer, part: partOf(source) }
    if (isSynced) {
      line.startMs = start
      if (source.duration > 0) line.endMs = end
    }
    if (line.part === undefined && source.element?.songPart) {
      document.parts!.push({ name: source.element.songPart })
      line.part = document.parts!.length - 1
    }
    for (const word of source.syllabus ?? []) {
      const entry = { text: word.text, startMs: ms(word.time), endMs: ms(word.time + word.duration) }
      if (word.isBackground) (line.backgroundWords ??= []).push(entry)
      else (line.words ??= []).push(entry)
    }
    finishWords(line.words, end)
    finishWords(line.backgroundWords, end)
    if (!line.words && line.backgroundWords) line.text = ''
    if (source.translation) {
      line.translatedText = source.translation.text
      document.song.translationLanguage ||= source.translation.lang
    }
    if (source.transliteration) {
      line.romanizedText = source.transliteration.text
      document.song.romanizationLanguage ||= source.transliteration.lang
      const words = source.transliteration.syllabus?.map(word => ({ text: word.text, startMs: ms(word.time), endMs: ms(word.time + word.duration) }))
      if (words?.length) line.romanizedWords = words
    }
    if (source.isBackground || source.element?.isBackground) line.background = true
    document.lines.push(line)
  }
  return document
}
