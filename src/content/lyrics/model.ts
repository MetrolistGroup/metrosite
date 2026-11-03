// JSON MLX 2.0, the canonical lyrics model shared with Lyprio and Metrolist.
// The editor works on this shape directly: a line is synced when it has startMs.

export type Word = { text: string; startMs: number; endMs: number }

export type Line = {
  startMs?: number
  endMs?: number
  text: string
  background?: boolean
  agent?: string
  part?: number
  words?: Word[]
  backgroundWords?: Word[]
  backgroundText?: string
  romanizedText?: string
  romanizedWords?: Word[]
  translatedText?: string
}

export type Song = {
  title?: string
  artist?: string
  album?: string
  durationMs?: number
  youtubeId?: string
  isrc?: string
  platformId?: string
  language?: string
  songwriters?: string[]
  romanizationLanguage?: string
  translationLanguage?: string
}

export type Agent = { type: string; name?: string; color?: string }
export type Part = { name: string; startMs?: number; endMs?: number }
export type Source = { name?: string; id?: string; curator?: string; copyright?: string; lastFetched?: string }
export type Colors = { background?: string; text?: string; highlight?: string }

export type LyricsDocument = {
  provider?: string
  subprovider?: string
  sourceFormat?: string
  source?: Source
  song: Song
  colors?: Colors
  agents?: Record<string, Agent>
  parts?: Part[]
  lines: Line[]
  extensions?: Record<string, string[]>
}

export type SyncType = 'word' | 'line' | 'plain'

export class LyricsError extends Error {}
export const invalid = (message = 'These lyrics could not be read.') => new LyricsError(message)

export const synced = (line: Line) => line.startMs !== undefined

export function syncType(document: LyricsDocument): SyncType {
  if (document.lines.some(line => line.words?.length || line.backgroundWords?.length)) return 'word'
  return document.lines.some(synced) ? 'line' : 'plain'
}

export function first(...values: (string | undefined)[]) {
  for (const value of values) if (value?.trim()) return value.trim()
  return ''
}

export const wordsText = (words: Word[] = []) => words.map(word => word.text).join('').trim()

export function lineText(line: Line) {
  return line.text || wordsText(line.words) || line.backgroundText || wordsText(line.backgroundWords)
}

// Fill missing word ends from the next word, the line end, or a 500 ms fallback.
export function finishWords(words: Word[] | undefined, fallbackEnd = -Infinity) {
  words?.forEach((word, index) => {
    if (word.endMs > word.startMs) return
    const next = words[index + 1]
    word.endMs = next && next.startMs > word.startMs ? next.startMs : fallbackEnd > word.startMs ? fallbackEnd : word.startMs + 500
  })
}

export function finishLineWords(line: Line, fallbackEnd?: number) {
  finishWords(line.words, fallbackEnd)
  finishWords(line.backgroundWords, fallbackEnd)
  const words = [...line.words ?? [], ...line.backgroundWords ?? []]
  if (words.length) line.endMs = Math.max(line.startMs ?? 0, line.endMs ?? 0, ...words.map(word => word.endMs))
}

export function sortLines(lines: Line[]) {
  return lines.sort((a, b) => synced(a) ? synced(b) ? a.startMs! - b.startMs! : -1 : synced(b) ? 1 : 0)
}

const definedEntries = <T extends object>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== '' && !(Array.isArray(item) && !item.length))) as T

// Serializes with the same field order and omissions as Lyprio's encoder.
export function toMlxJson(document: LyricsDocument, space?: number) {
  const words = (list: Word[] | undefined, end?: number) => {
    const copy = list?.map(word => ({ text: word.text, startMs: Math.round(word.startMs), endMs: Math.round(word.endMs) }))
    finishWords(copy, end)
    return copy
  }
  const round = (value?: number) => value === undefined ? undefined : Math.round(value)
  const lines = sortLines(document.lines.filter(line => lineText(line).trim()).map(line => ({ ...line }))).map(line => definedEntries({
    startMs: round(line.startMs),
    endMs: synced(line) && line.endMs !== undefined ? Math.round(Math.max(line.startMs!, line.endMs)) : undefined,
    text: line.text,
    background: line.background || undefined,
    agent: line.agent,
    part: line.part !== undefined && line.part >= 0 && line.part < (document.parts?.length ?? 0) ? line.part : undefined,
    words: words(line.words, line.endMs),
    backgroundWords: words(line.backgroundWords, line.endMs),
    backgroundText: line.backgroundText,
    romanizedText: line.romanizedText,
    romanizedWords: words(line.romanizedWords, line.endMs),
    translatedText: line.translatedText,
  }))
  if (!lines.length) throw invalid('Add at least one lyric line before exporting.')
  const source = definedEntries({ ...document.source })
  const colors = definedEntries({ ...document.colors })
  const output = definedEntries({
    version: 2,
    provider: document.provider || 'METROLIST',
    subprovider: document.subprovider || 'LYRICS_SYNC',
    sourceFormat: document.sourceFormat || 'plain',
    syncType: syncType({ ...document, lines }),
    source: Object.keys(source).length ? source : undefined,
    song: definedEntries({ ...document.song }),
    colors: Object.keys(colors).length ? colors : undefined,
    agents: document.agents && Object.keys(document.agents).length ? document.agents : undefined,
    parts: document.parts?.map(part => definedEntries({ ...part })),
    lines,
    extensions: document.extensions && Object.keys(document.extensions).length ? document.extensions : undefined,
  })
  return JSON.stringify(output, null, space)
}

export function isJsonMlx(content: string) {
  if (!content.trimStart().startsWith('{')) return false
  try {
    const value = JSON.parse(content)
    return value?.version === 2 && Array.isArray(value.lines) && value.lines.length > 0
  } catch {
    return false
  }
}

export function parseMlxJson(content: string): LyricsDocument {
  const source = JSON.parse(content)
  if (source?.version !== 2 || !Array.isArray(source.lines) || !source.lines.length) throw invalid()
  const parts: Part[] = Array.isArray(source.parts) ? source.parts : []
  if (parts.some(part => typeof part?.name !== 'string')) throw invalid()
  const isWord = (word: Word) => typeof word?.text === 'string' && Number.isFinite(word.startMs) && Number.isFinite(word.endMs)
  const lines: Line[] = source.lines.map((line: Line) => {
    for (const list of [line.words, line.backgroundWords, line.romanizedWords]) {
      if (list !== undefined && (!Array.isArray(list) || !list.every(isWord))) throw invalid()
    }
    if (line.part !== undefined && !(line.part >= 0 && line.part < parts.length)) throw invalid()
    return { ...line, text: typeof line.text === 'string' ? line.text : '' }
  })
  return {
    provider: source.provider, subprovider: source.subprovider, sourceFormat: source.sourceFormat,
    source: source.source, song: source.song ?? {}, colors: source.colors, agents: source.agents,
    parts: parts.length ? parts : undefined, lines, extensions: source.extensions,
  }
}
