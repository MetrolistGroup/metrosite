import { lineText, sortLines, synced, syncType, toMlxJson, type Line, type LyricsDocument, type Word } from './model'

export const EXPORT_FORMATS = {
  mlx: { label: 'MLX', detail: 'Metrolist JSON MLX 2.0 with every timing, agent, and variant', extension: 'mlx', type: 'application/json' },
  elrc: { label: 'Enhanced LRC', detail: 'Line and word timings for players that support <mm:ss.xx> tags', extension: 'lrc', type: 'text/plain' },
  lrc: { label: 'LRC', detail: 'Line timings only, readable by almost every player', extension: 'lrc', type: 'text/plain' },
  ttml: { label: 'TTML', detail: 'Apple-style timed text with word spans and background vocals', extension: 'ttml', type: 'application/ttml+xml' },
  plain: { label: 'Plain text', detail: 'Lyrics without timings', extension: 'txt', type: 'text/plain' },
} as const

export type ExportFormat = keyof typeof EXPORT_FORMATS

const pad = (value: number, length = 2) => String(Math.floor(value)).padStart(length, '0')

// [mm:ss.xx], the precision every LRC reader accepts.
export function lrcTime(ms: number) {
  const centiseconds = Math.round(Math.max(0, ms) / 10)
  return `${pad(centiseconds / 6000)}:${pad((centiseconds / 100) % 60)}.${pad(centiseconds % 100)}`
}

export function ttmlTime(ms: number) {
  const value = Math.max(0, Math.round(ms))
  const hours = Math.floor(value / 3_600_000)
  const clock = `${pad((value / 60_000) % 60)}:${pad((value / 1000) % 60)}.${pad(value % 1000, 3)}`
  return hours ? `${pad(hours)}:${clock}` : clock.replace(/^0(?=\d:)/, '')
}

const timedLines = (document: LyricsDocument) => sortLines(document.lines.filter(line => synced(line) && lineText(line).trim()).map(line => ({ ...line })))

function lrcHeader(document: LyricsDocument) {
  const { title, artist, album, durationMs, language } = document.song
  return [
    title && `[ti:${title}]`, artist && `[ar:${artist}]`, album && `[al:${album}]`,
    durationMs && `[length:${lrcTime(durationMs).slice(0, 5)}]`, language && `[la:${language}]`,
    document.source?.curator && `[by:${document.source.curator}]`, '[re:Metrolist lyrics sync]',
  ].filter(Boolean)
}

// A gap of a second or more gets an empty timestamp so players clear the line.
function withEndMarkers(lines: Line[], write: (line: Line) => string) {
  return lines.flatMap((line, index) => {
    const next = lines[index + 1]
    const end = line.endMs
    return end !== undefined && (!next || next.startMs! - end >= 1000) ? [write(line), `[${lrcTime(end)}]`] : [write(line)]
  })
}

// <start>word, with an extra <end> marker whenever the next word starts later.
function enhancedWords(words: Word[]) {
  return words.map((word, index) => {
    const next = words[index + 1]
    const gap = !next || next.startMs > word.endMs
    return `<${lrcTime(word.startMs)}>${word.text}${gap ? `<${lrcTime(word.endMs)}>` : ''}`
  }).join('')
}

function enhancedLine(line: Line) {
  const prefix = `[${lrcTime(line.startMs!)}]`
  if (!line.words?.length) return `${prefix}${lineText(line)}`
  const background = line.backgroundWords?.length ? `[bg:${enhancedWords(line.backgroundWords)}]` : ''
  return `${prefix}${line.agent ? `${line.agent}: ` : ''}${enhancedWords(line.words)}${background}`
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const timing = (start?: number, end?: number) => start === undefined ? '' : ` begin="${ttmlTime(start)}"${end === undefined ? '' : ` end="${ttmlTime(Math.max(start, end))}"`}`

// Trailing spaces sit outside the span, where TTML readers expect word gaps.
const spans = (words: Word[]) => words.map(word => {
  const text = word.text.trimEnd()
  return `<span${timing(word.startMs, word.endMs)}>${escapeXml(text)}</span>${word.text.slice(text.length) ? ' ' : ''}`
}).join('').trimEnd()

function ttml(document: LyricsDocument) {
  const lines = sortLines(document.lines.filter(line => lineText(line).trim()).map(line => ({ ...line })))
  const keys = lines.map((_, index) => `L${index + 1}`)
  const kind = syncType({ ...document, lines })
  const { song } = document
  const agents = Object.entries(document.agents ?? {}).map(([id, agent]) =>
    `<ttm:agent type="${escapeXml(agent.type || 'person')}" xml:id="${escapeXml(id)}">${agent.name ? `<ttm:name type="full">${escapeXml(agent.name)}</ttm:name>` : ''}</ttm:agent>`)
  const translations = lines.map((line, index) => line.translatedText ? `<text for="${keys[index]}">${escapeXml(line.translatedText)}</text>` : '').join('')
  const romanizations = lines.map((line, index) => line.romanizedText || line.romanizedWords?.length
    ? `<text for="${keys[index]}">${line.romanizedWords?.length ? spans(line.romanizedWords) : escapeXml(line.romanizedText!)}</text>` : '').join('')
  const itunes = [
    translations && `<translations><translation type="replacement"${song.translationLanguage ? ` xml:lang="${escapeXml(song.translationLanguage)}"` : ''}>${translations}</translation></translations>`,
    romanizations && `<transliterations><transliteration${song.romanizationLanguage ? ` xml:lang="${escapeXml(song.romanizationLanguage)}"` : ''}>${romanizations}</transliteration></transliterations>`,
    song.songwriters?.length && `<songwriters>${song.songwriters.map(writer => `<songwriter>${escapeXml(writer)}</songwriter>`).join('')}</songwriters>`,
  ].filter(Boolean).join('')
  const paragraph = (line: Line, index: number) => {
    const attributes = `${timing(line.startMs, line.endMs)} itunes:key="${keys[index]}"${line.agent ? ` ttm:agent="${escapeXml(line.agent)}"` : ''}${line.background ? ' ttm:role="x-bg"' : ''}`
    const main = line.words?.length && synced(line) ? spans(line.words) : escapeXml(lineText(line))
    const background = line.backgroundWords?.length
      ? `<span ttm:role="x-bg">${spans(line.backgroundWords)}</span>`
      : line.backgroundText ? `<span ttm:role="x-bg">${escapeXml(line.backgroundText)}</span>` : ''
    return `      <p${attributes}>${main}${background}</p>`
  }
  // Consecutive lines that share a song part become one div.
  const divs: string[] = []
  lines.forEach((line, index) => {
    const part = line.part === undefined ? undefined : document.parts?.[line.part]
    const previous = lines[index - 1]
    if (!previous || previous.part !== line.part) {
      if (index) divs.push('    </div>')
      divs.push(`    <div${part ? `${timing(part.startMs, part.endMs)} itunes:songPart="${escapeXml(part.name)}"` : ''}>`)
    }
    divs.push(paragraph(line, index))
  })
  divs.push('    </div>')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:itunes="http://music.apple.com/lyric-ttml-internal" itunes:timing="${kind === 'word' ? 'Word' : kind === 'line' ? 'Line' : 'None'}"${song.language ? ` xml:lang="${escapeXml(song.language)}"` : ''}>`,
    `  <head><metadata>${agents.join('')}${itunes ? `<iTunesMetadata xmlns="http://music.apple.com/lyric-ttml-internal">${itunes}</iTunesMetadata>` : ''}</metadata></head>`,
    `  <body${song.durationMs ? ` dur="${ttmlTime(song.durationMs)}"` : ''}>`,
    ...divs,
    '  </body>',
    '</tt>',
    '',
  ].join('\n')
}

export function exportLyrics(document: LyricsDocument, format: ExportFormat) {
  switch (format) {
    case 'mlx': return `${toMlxJson(document, 2)}\n`
    case 'lrc': return [...lrcHeader(document), ...withEndMarkers(timedLines(document), line => `[${lrcTime(line.startMs!)}]${lineText(line)}`), ''].join('\n')
    case 'elrc': return [...lrcHeader(document), ...withEndMarkers(timedLines(document), enhancedLine), ''].join('\n')
    case 'ttml': return ttml(document)
    case 'plain': return `${document.lines.map(lineText).filter(text => text.trim()).join('\n')}\n`
  }
}

export function exportFileName(document: LyricsDocument, format: ExportFormat) {
  const name = [document.song.artist, document.song.title].filter(Boolean).join(' - ').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '').trim()
  return `${name || 'lyrics'}.${EXPORT_FORMATS[format].extension}`
}
