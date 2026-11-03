import { synced, type Line, type Word } from './model'

const noSpaces = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Thai}\p{sc=Lao}\p{sc=Khmer}\p{sc=Myanmar}]/u
const unit = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Thai}\p{sc=Lao}\p{sc=Khmer}\p{sc=Myanmar}]\s*|[^\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Thai}\p{sc=Lao}\p{sc=Khmer}\p{sc=Myanmar}]+/gu

// Words keep their trailing space, as MLX words do. Scripts written without
// spaces sync per character, which is how karaoke sources time them.
export function splitWords(text: string) {
  return (text.trim().match(/\S+\s*/g) ?? []).flatMap(token => noSpaces.test(token) ? token.match(unit)! : [token])
}

const shift = (words: Word[] | undefined, delta: number) => words?.forEach(word => {
  word.startMs = Math.max(0, word.startMs + delta)
  word.endMs = Math.max(word.startMs, word.endMs + delta)
})

export function shiftLine(line: Line, delta: number) {
  if (!synced(line)) return
  line.startMs = Math.max(0, line.startMs! + delta)
  if (line.endMs !== undefined) line.endMs = Math.max(line.startMs, line.endMs + delta)
  shift(line.words, delta)
  shift(line.backgroundWords, delta)
  shift(line.romanizedWords, delta)
}

// Restamping a synced line moves its words with it.
export function setLineStart(line: Line, ms: number) {
  if (synced(line)) shiftLine(line, ms - line.startMs!)
  else line.startMs = Math.max(0, Math.round(ms))
}

export function clearTiming(line: Line) {
  for (const key of ['startMs', 'endMs', 'words', 'backgroundWords', 'romanizedWords'] as const) delete line[key]
}

// The line being sung at `ms`: the last one that started, until it ends.
export function activeIndex(lines: Line[], ms: number) {
  let active = -1
  lines.forEach((line, index) => {
    if (synced(line) && line.startMs! <= ms && (active < 0 || line.startMs! >= lines[active]!.startMs!)) active = index
  })
  const line = lines[active]
  return line?.endMs !== undefined && ms > line.endMs + 300 ? -1 : active
}

// A press shorter than this is a tap: the word lasts until the next press.
export const TAP_MS = 180
const MAX_TAP_WORD_MS = 3000

// Word sync: press at a word's start, release at its end, or tap through.
export class WordSync {
  line?: Line
  tokens: string[] = []
  words: Word[] = []
  holding = false
  open?: { word: Word; line: Line }

  begin(line: Line) {
    this.line = line
    this.tokens = splitWords(line.text)
    this.words = []
    this.holding = false
  }

  get nextWord() {
    return this.tokens[this.words.length] ?? ''
  }

  press(ms: number) {
    this.resolveOpen(ms)
    if (!this.line || this.holding || this.words.length >= this.tokens.length) return
    this.words.push({ text: this.nextWord, startMs: Math.round(ms), endMs: Math.round(ms) })
    this.holding = true
  }

  // Returns the finished line once its last word is released.
  release(ms: number) {
    if (!this.holding || !this.line) return undefined
    this.holding = false
    const word = this.words[this.words.length - 1]!
    if (ms - word.startMs < TAP_MS) this.open = { word, line: this.line }
    else word.endMs = Math.round(ms)
    if (this.words.length < this.tokens.length) return undefined
    const line = this.line
    line.words = this.words
    line.startMs = this.words[0]!.startMs
    line.endMs = Math.max(...this.words.map(item => item.endMs))
    this.line = undefined
    this.words = []
    if (this.open && this.open.word === word) this.open.line = line
    return line
  }

  undo() {
    if (this.holding || !this.words.length) return false
    const word = this.words.pop()
    if (this.open?.word === word) this.open = undefined
    return true
  }

  resolveOpen(ms: number) {
    if (!this.open) return
    const { word, line } = this.open
    word.endMs = Math.round(Math.max(word.startMs + 1, Math.min(ms, word.startMs + MAX_TAP_WORD_MS)))
    if (line.words?.includes(word)) line.endMs = Math.max(line.endMs ?? 0, word.endMs)
    this.open = undefined
  }
}
