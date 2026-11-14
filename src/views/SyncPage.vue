<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import LyricsExportDialog from '../components/LyricsExportDialog.vue'
import LyricsSyncLine from '../components/LyricsSyncLine.vue'
import { lrcTime } from '../content/lyrics/export'
import { IMPORT_FORMATS, importLyrics, type ImportFormat } from '../content/lyrics/import'
import { lineText, synced, type Line, type LyricsDocument } from '../content/lyrics/model'
import { activeIndex, clearTiming, setLineStart, shiftLine, WordSync } from '../content/lyrics/sync'

const DRAFT_KEY = 'metrolist:lyrics-sync-draft'
const NUDGE_MS = 50
const LYRICS_ACCEPT = '.mlx,.lrc,.elrc,.ttml,.xml,.txt,.json,.qrc,.krc,.yrc,.ass,.ssa'

type Draft = { document: LyricsDocument; mode: 'line' | 'word'; cursor: number; audioName: string; savedAt: number }

const document_ = ref<LyricsDocument>()
const mode = ref<'line' | 'word'>('line')
const cursor = ref(0)
const preview = ref(false)
const editing = ref(-1)
const editText = ref('')
const session = reactive(new WordSync())
const history: { lines: string; cursor: number }[] = []
const historySize = ref(0)

const source = ref('')
const sourceName = ref('')
const format = ref<ImportFormat>('auto')
const importError = ref('')
const savedDraft = ref<Draft>()
const dragging = ref(false)

const audio = ref<HTMLAudioElement>()
const audioUrl = ref('')
const audioName = ref('')
const playing = ref(false)
const now = ref(0)
const duration = ref(0)
const rate = ref(1)
const status = ref('')
const shiftAmount = ref(0)
const exportDialog = ref<InstanceType<typeof LyricsExportDialog>>()
const dock = ref<HTMLElement>()
const root = ref<HTMLElement>()
const list = ref<HTMLElement>()
const sourceId = useId()
const formatId = useId()

const lines = computed(() => document_.value?.lines ?? [])
const current = computed<Line | undefined>(() => lines.value[cursor.value])
const active = computed(() => activeIndex(lines.value, now.value))
const syncedCount = computed(() => lines.value.filter(synced).length)
const finished = computed(() => cursor.value >= lines.value.length)
const outOfOrder = computed(() => {
  let last = -1
  return lines.value.map(line => {
    if (!synced(line)) return false
    const early = line.startMs! < last
    last = Math.max(last, line.startMs!)
    return early
  })
})
const padLabel = computed(() => {
  if (!audioUrl.value) return 'Choose audio to start'
  if (finished.value) return 'All lines reached'
  return mode.value === 'word' ? session.line === current.value && session.nextWord ? session.nextWord : current.value?.text.trim().split(/\s+/)[0] ?? '' : lineText(current.value!)
})

const time = () => Math.round((audio.value?.currentTime ?? 0) * 1000)
const readStorage = () => { try { return localStorage.getItem(DRAFT_KEY) } catch { return null } }

// Drafts survive reloads; audio cannot be stored, so it is chosen again.
onMounted(() => {
  try {
    const draft = JSON.parse(readStorage() ?? 'null') as Draft | null
    if (draft?.document?.lines?.length) savedDraft.value = draft
  } catch { /* Ignore unreadable drafts. */ }
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('beforeunload', saveNow)
})

let saveTimer: ReturnType<typeof setTimeout> | undefined
function saveNow() {
  clearTimeout(saveTimer)
  if (!document_.value) return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ document: document_.value, mode: mode.value, cursor: cursor.value, audioName: audioName.value, savedAt: Date.now() } satisfies Draft))
  } catch { /* Storage can be full or blocked; the sync still works. */ }
}
watch([document_, mode, cursor], () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 500)
}, { deep: true })

let frame = 0
function tick() {
  now.value = time()
  frame = playing.value ? requestAnimationFrame(tick) : 0
}

let dockObserver: ResizeObserver | undefined
watch(dock, element => {
  dockObserver?.disconnect()
  if (!element) return
  dockObserver = new ResizeObserver(() => root.value?.style.setProperty('--sync-dock-height', `${element.offsetHeight + 24}px`))
  dockObserver.observe(element)
})

onBeforeUnmount(() => {
  saveNow()
  cancelAnimationFrame(frame)
  dockObserver?.disconnect()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('beforeunload', saveNow)
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})

function setAudio(file: File) {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = URL.createObjectURL(file)
  audioName.value = file.name
  playing.value = false
  now.value = 0
}

async function setLyricsFile(file: File) {
  source.value = await file.text()
  sourceName.value = file.name
  importError.value = ''
}

async function onFiles(files: FileList | null | undefined) {
  for (const file of files ?? []) {
    if (/^(audio|video)\//.test(file.type) || /\.(mp3|m4a|aac|flac|ogg|opus|wav|webm|mp4)$/i.test(file.name)) setAudio(file)
    else await setLyricsFile(file)
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false
  onFiles(event.dataTransfer?.files)
}

function startSyncing() {
  try {
    const document = importLyrics(source.value, format.value, sourceName.value)
    // "Artist - Title.mp3" fills empty song details.
    const [artist = '', title] = audioName.value.replace(/\.[^.]+$/, '').split(/\s+-\s+/, 2)
    if (title) {
      document.song.artist ||= artist.trim()
      document.song.title ||= title.trim()
    }
    openDocument(document, document.lines.some(line => line.words?.length) ? 'word' : 'line', Math.max(0, document.lines.findIndex(line => !synced(line))))
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'These lyrics could not be read.'
  }
}

function openDocument(document: LyricsDocument, nextMode: 'line' | 'word', nextCursor: number) {
  document_.value = document
  mode.value = nextMode
  cursor.value = Math.min(nextCursor, document.lines.length)
  history.length = historySize.value = 0
  resetSession()
  importError.value = ''
  scrollToCursor()
}

function resumeDraft() {
  const draft = savedDraft.value
  if (!draft) return
  openDocument(draft.document, draft.mode, draft.cursor)
  if (!audioUrl.value) status.value = draft.audioName ? `Draft restored. Choose ${draft.audioName} again to keep syncing.` : 'Draft restored. Choose the audio file to keep syncing.'
}

function startOver() {
  if (!confirm('Close these lyrics? Your current sync stays saved as a draft until you start a new one.')) return
  saveNow()
  savedDraft.value = JSON.parse(readStorage() ?? 'null') ?? undefined
  audio.value?.pause()
  document_.value = undefined
  preview.value = false
}

function resetSession() {
  session.line = undefined
  session.open = undefined
  session.words = []
  session.holding = false
}

// Every edit is undoable: snapshot before changing lines.
function remember() {
  history.push({ lines: JSON.stringify(lines.value), cursor: cursor.value })
  if (history.length > 300) history.shift()
  historySize.value = history.length
}

function undo() {
  if (mode.value === 'word' && session.undo()) {
    seekBy(-2000)
    return announce('Removed the last word.')
  }
  // An untouched word draft only holds the snapshot taken when it began.
  if (session.line) {
    resetSession()
    history.pop()
  }
  const entry = history.pop()
  historySize.value = history.length
  if (!entry || !document_.value) return
  document_.value.lines = JSON.parse(entry.lines)
  cursor.value = entry.cursor
  resetSession()
  editing.value = -1
  if (playing.value) seekBy(-3000)
  announce('Undone.')
  scrollToCursor()
}

function announce(message: string) {
  status.value = message
}

function scrollToRow(index: number) {
  nextTick(() => {
    const row = list.value?.querySelector(index >= lines.value.length ? '.sync-lyrics__end' : `[data-index="${index}"]`)
    row?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  })
}

const scrollToCursor = () => scrollToRow(cursor.value)
watch(active, index => { if (preview.value && index >= 0) scrollToRow(index) })

function moveCursor(index: number) {
  const next = Math.max(0, Math.min(index, lines.value.length))
  if (next === cursor.value) return
  cursor.value = next
  editing.value = -1
  if (session.line) resetSession()
  scrollToCursor()
}

watch(mode, () => resetSession())

function press() {
  const line = current.value
  if (!audioUrl.value || !line || preview.value) return
  const at = time()
  navigator.vibrate?.(8)
  if (mode.value === 'line') {
    remember()
    setLineStart(line, at)
    announce(`Line ${cursor.value + 1} at ${lrcTime(at)}.`)
    moveCursor(cursor.value + 1)
    return
  }
  if (session.line !== line) {
    remember()
    session.begin(line)
  }
  session.press(at)
}

function release() {
  if (mode.value !== 'word' || !session.holding) return
  const done = session.release(time())
  if (done) {
    announce(`Line ${cursor.value + 1} synced word by word.`)
    moveCursor(cursor.value + 1)
  }
}

function markEnd() {
  const line = lines.value[cursor.value - 1]
  if (!line || !synced(line)) return
  remember()
  line.endMs = Math.max(line.startMs!, time())
  announce(`Line ${cursor.value} ends at ${lrcTime(line.endMs)}.`)
}

function edit(change: (line: Line) => void, index = cursor.value) {
  const line = lines.value[index]
  if (!line) return
  remember()
  change(line)
}

function nudge(delta: number) {
  edit(line => shiftLine(line, delta))
  const line = current.value
  if (line && synced(line)) {
    seekTo(line.startMs! - 1000)
    announce(`Line ${cursor.value + 1} now starts at ${lrcTime(line.startMs!)}.`)
  }
}

function beginEdit(index: number) {
  editing.value = index
  editText.value = lines.value[index]?.text ?? ''
  nextTick(() => list.value?.querySelector<HTMLInputElement>('.sync-edit input')?.focus())
}

function saveEdit() {
  const index = editing.value
  const line = lines.value[index]
  editing.value = -1
  if (!line) return
  const text = editText.value.replace(/\s+/g, ' ').trim()
  if (text === line.text) return
  remember()
  if (!text) {
    lines.value.splice(index, 1)
    return
  }
  // Changed words no longer match their timings.
  if (line.words && line.words.map(word => word.text).join('').trim() !== text) delete line.words
  line.text = text
}

function insertBelow() {
  remember()
  lines.value.splice(cursor.value + 1, 0, { text: '' })
  moveCursor(cursor.value + 1)
  beginEdit(cursor.value)
}

function removeLine() {
  remember()
  lines.value.splice(cursor.value, 1)
  if (!lines.value.length) lines.value.push({ text: '…' })
  scrollToCursor()
}

function shiftAll() {
  if (!shiftAmount.value) return
  remember()
  for (const line of lines.value) shiftLine(line, shiftAmount.value)
  announce(`Moved every timing by ${shiftAmount.value} ms.`)
}

function togglePlay() {
  const element = audio.value
  if (!element || !audioUrl.value) return
  if (element.paused) element.play().catch(() => announce('The browser could not play this audio file.'))
  else element.pause()
}

function seekTo(ms: number) {
  if (!audio.value || !audioUrl.value) return
  audio.value.currentTime = Math.max(0, ms) / 1000
  now.value = time()
}

const seekBy = (delta: number) => seekTo(time() + delta)

function onPlay() {
  playing.value = true
  cancelAnimationFrame(frame)
  tick()
}

function onLoaded() {
  duration.value = Math.round((audio.value?.duration || 0) * 1000)
  audio.value!.playbackRate = rate.value
  if (document_.value && duration.value && !document_.value.song.durationMs) document_.value.song.durationMs = duration.value
}

watch(rate, value => { if (audio.value) audio.value.playbackRate = value })

// Sliders and buttons keep the shortcuts; text fields and selects do not.
const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['TEXTAREA', 'SELECT'].includes(target.tagName)
  || target instanceof HTMLInputElement && !['range', 'checkbox', 'radio', 'button', 'file'].includes(target.type))

function onKeyDown(event: KeyboardEvent) {
  if (!document_.value || typing(event.target) || event.altKey || window.document.querySelector('dialog[open]')) return
  const command = event.ctrlKey || event.metaKey
  if (command && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    return undo()
  }
  if (command) return
  const actions: Record<string, () => void> = {
    ' ': () => { if (!event.repeat) press() },
    p: togglePlay,
    k: togglePlay,
    ArrowLeft: () => seekBy(event.shiftKey ? -5000 : -2000),
    ArrowRight: () => seekBy(event.shiftKey ? 5000 : 2000),
    ArrowUp: () => moveCursor(cursor.value - 1),
    ArrowDown: () => moveCursor(cursor.value + 1),
    Backspace: undo,
    e: markEnd,
    '[': () => nudge(-NUDGE_MS),
    ']': () => nudge(NUDGE_MS),
  }
  const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key]
  if (!action) return
  event.preventDefault()
  action()
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key !== ' ' || !document_.value || typing(event.target)) return
  event.preventDefault()
  release()
}

function onPadDown(event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  press()
}

const SHORTCUTS = [
  ['Space', 'Tap a line, or hold each word'], ['P', 'Play or pause'], ['← →', 'Seek 2 s (Shift: 5 s)'],
  ['↑ ↓', 'Choose line'], ['Backspace', 'Undo'], ['E', 'End the previous line'], ['[ ]', 'Nudge line 50 ms'],
] as const
</script>

<template>
  <main id="main" ref="root" class="sync" :class="{ 'sync--dragging': dragging }" @dragover.prevent="dragging = true" @dragleave.self="dragging = false" @drop.prevent="onDrop">
    <div class="container sync__inner">
      <nav class="sync__nav" aria-label="Lyrics sync navigation">
        <RouterLink to="/" class="sync__brand">
          <span><img src="/logo.svg" alt="" width="28" height="28" /></span>
          Metrolist
        </RouterLink>
        <div v-if="document_" class="sync__nav-actions">
          <button type="button" class="btn btn-outlined btn-sm" aria-label="Start over" @click="startOver">
            <span class="material-symbols-rounded" aria-hidden="true">restart_alt</span><span class="sync__hide-small">Start over</span>
          </button>
          <button type="button" class="btn btn-filled btn-sm" @click="exportDialog?.open()">
            <span class="material-symbols-rounded" aria-hidden="true">download</span>Export
          </button>
        </div>
        <RouterLink v-else to="/" class="btn btn-outlined">
          <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>Home
        </RouterLink>
      </nav>

      <section v-if="!document_" class="sync-setup" aria-labelledby="sync-title">
        <header class="sync-setup__hero">
          <p class="section-label"><span class="material-symbols-rounded" aria-hidden="true">lyrics</span>Lyrics sync</p>
          <h1 id="sync-title">Time every <span>line and word</span></h1>
          <p>Bring a song and its lyrics, tap along as it plays, and export MLX for Metrolist. Files stay in your browser.</p>
        </header>

        <div v-if="savedDraft" class="sync-setup__draft">
          <span class="material-symbols-rounded" aria-hidden="true">timer</span>
          <div>
            <h2>Continue your last sync</h2>
            <p>{{ [savedDraft.document.song.artist, savedDraft.document.song.title].filter(Boolean).join(' – ') || lineText(savedDraft.document.lines[0]!) }} · {{ savedDraft.document.lines.filter(synced).length }} of {{ savedDraft.document.lines.length }} lines synced</p>
          </div>
          <button type="button" class="btn btn-tonal" @click="resumeDraft">Resume</button>
        </div>

        <div class="sync-setup__steps">
          <article class="sync-setup__card sync-setup__card--audio">
            <div class="sync-setup__step"><span class="material-symbols-rounded" aria-hidden="true">audio_file</span><small>Step 1</small></div>
            <h2>Song audio</h2>
            <p>Any file your browser can play: MP3, M4A, FLAC, OGG, Opus, WAV, or a video.</p>
            <label class="btn btn-filled btn-lg sync-file">
              <span class="material-symbols-rounded" aria-hidden="true">audio_file</span>{{ audioName ? 'Change audio' : 'Choose audio' }}
              <input type="file" accept="audio/*,video/*" @change="onFiles(($event.target as HTMLInputElement).files)" />
            </label>
            <p v-if="audioName" class="sync-setup__file"><span class="material-symbols-rounded" aria-hidden="true">music_note</span>{{ audioName }}</p>
          </article>

          <article class="sync-setup__card sync-setup__card--lyrics">
            <div class="sync-setup__step"><span class="material-symbols-rounded" aria-hidden="true">lyrics</span><small>Step 2</small></div>
            <h2>Lyrics</h2>
            <label :for="sourceId" class="sr-only">Lyrics text</label>
            <textarea :id="sourceId" v-model="source" rows="9" spellcheck="false" placeholder="Paste one lyric line per row, or open LRC, TTML, MLX, QRC, KRC, YRC, ASS, Spotify, Musixmatch, or LyricsPlus files." @input="importError = ''" />
            <div class="sync-setup__row">
              <label class="btn btn-outlined sync-file">
                <span class="material-symbols-rounded" aria-hidden="true">upload_file</span>Open file
                <input type="file" :accept="LYRICS_ACCEPT" @change="onFiles(($event.target as HTMLInputElement).files)" />
              </label>
              <label :for="formatId" class="sync-setup__format">
                <span>Format</span>
                <select :id="formatId" v-model="format">
                  <option v-for="(label, key) in IMPORT_FORMATS" :key="key" :value="key">{{ label }}</option>
                </select>
              </label>
            </div>
            <p v-if="sourceName" class="sync-setup__file"><span class="material-symbols-rounded" aria-hidden="true">upload_file</span>{{ sourceName }}</p>
          </article>
        </div>

        <p v-if="importError" class="sync-setup__error" role="alert"><span class="material-symbols-rounded" aria-hidden="true">warning</span>{{ importError }}</p>
        <div class="sync-setup__start">
          <button type="button" class="btn btn-filled btn-lg" :disabled="!source.trim()" @click="startSyncing">
            <span class="material-symbols-rounded" aria-hidden="true">touch_app</span>Start syncing
          </button>
          <p>Existing timings are kept, so you can import a file just to fix it. You can also drop files anywhere on this page.</p>
        </div>
      </section>

      <div v-else class="sync-workspace">
        <section class="sync-lyrics" aria-label="Lyrics">
          <header class="sync-lyrics__header">
            <div>
              <h1>{{ document_.song.title || 'Untitled song' }}</h1>
              <p>{{ document_.song.artist || 'Unknown artist' }} · {{ syncedCount }} of {{ lines.length }} lines synced</p>
            </div>
            <div class="sync-segmented" role="group" aria-label="Sync mode">
              <button type="button" :aria-pressed="mode === 'line' && !preview" @click="mode = 'line'; preview = false">Lines</button>
              <button type="button" :aria-pressed="mode === 'word' && !preview" @click="mode = 'word'; preview = false">Words</button>
              <button type="button" :aria-pressed="preview" aria-label="Preview" @click="preview = !preview">
                <span class="material-symbols-rounded" aria-hidden="true">visibility</span><span class="sync__hide-small">Preview</span>
              </button>
            </div>
          </header>

          <ol ref="list" class="sync-lyrics__list" :class="{ 'sync-lyrics__list--preview': preview }">
            <template v-for="(line, index) in lines" :key="index">
              <li v-if="editing === index" class="sync-edit" :data-index="index">
                <input v-model="editText" type="text" aria-label="Line text" @keydown.enter.prevent="saveEdit" @keydown.esc.prevent="editing = -1; editText = line.text" @blur="saveEdit" />
              </li>
              <LyricsSyncLine
                v-else
                :data-index="index"
                :line="line"
                :current="!preview && index === cursor"
                :active="index === active"
                :now="index === active ? now : undefined"
                :out-of-order="outOfOrder[index] ?? false"
                :draft="mode === 'word' && session.line === line ? session : undefined"
                @select="preview ? line.startMs !== undefined && seekTo(line.startMs) : moveCursor(index)"
                @seek="seekTo(line.startMs! - (preview ? 0 : 500))"
              />
              <li v-if="!preview && index === cursor && editing !== index" class="sync-tools" aria-label="Line tools">
                <button type="button" class="sync-tool" :disabled="line.startMs === undefined" aria-label="Start 50 ms earlier" @click="nudge(-NUDGE_MS)"><span class="material-symbols-rounded" aria-hidden="true">fast_rewind</span>−{{ NUDGE_MS }} ms</button>
                <button type="button" class="sync-tool" :disabled="line.startMs === undefined" aria-label="Start 50 ms later" @click="nudge(NUDGE_MS)"><span class="material-symbols-rounded" aria-hidden="true">fast_forward</span>+{{ NUDGE_MS }} ms</button>
                <button type="button" class="sync-tool" @click="beginEdit(index)"><span class="material-symbols-rounded" aria-hidden="true">edit</span>Edit</button>
                <button type="button" class="sync-tool" @click="insertBelow"><span class="material-symbols-rounded" aria-hidden="true">add</span>Line below</button>
                <button type="button" class="sync-tool" :disabled="line.startMs === undefined" @click="edit(clearTiming)"><span class="material-symbols-rounded" aria-hidden="true">block</span>Clear timing</button>
                <button type="button" class="sync-tool" @click="removeLine"><span class="material-symbols-rounded" aria-hidden="true">delete</span>Delete</button>
              </li>
            </template>
            <li v-if="!preview" class="sync-lyrics__end" :class="{ 'sync-lyrics__end--current': finished }">
              <span class="material-symbols-rounded" aria-hidden="true">check</span>
              <span>{{ finished ? 'Every line has been tapped. Preview it, fix lines, or export.' : 'End of lyrics' }}</span>
            </li>
          </ol>
        </section>

        <aside ref="dock" class="sync-dock" aria-label="Playback and tapping">
          <div v-if="!audioUrl" class="sync-dock__audio">
            <p>{{ status || 'Choose the song audio to start tapping.' }}</p>
            <label class="btn btn-tonal sync-file">
              <span class="material-symbols-rounded" aria-hidden="true">audio_file</span>Choose audio
              <input type="file" accept="audio/*,video/*" @change="onFiles(($event.target as HTMLInputElement).files)" />
            </label>
          </div>

          <div class="sync-player">
            <span class="sync-player__time">{{ lrcTime(now) }}</span>
            <input class="sync-player__seek" type="range" min="0" :max="duration || 1" step="10" :value="now" :disabled="!audioUrl" aria-label="Seek" @input="seekTo(Number(($event.target as HTMLInputElement).value))" />
            <span class="sync-player__time">{{ lrcTime(duration) }}</span>
          </div>
          <div class="sync-transport">
            <button type="button" class="icon-button" :disabled="!historySize && !session.words.length" aria-label="Undo" @click="undo"><span class="material-symbols-rounded" aria-hidden="true">undo</span></button>
            <button type="button" class="icon-button" :disabled="!audioUrl" aria-label="Back 2 seconds" @click="seekBy(-2000)"><span class="material-symbols-rounded" aria-hidden="true">fast_rewind</span></button>
            <button type="button" class="icon-button sync-transport__play" :disabled="!audioUrl" :aria-label="playing ? 'Pause' : 'Play'" @click="togglePlay"><span class="material-symbols-rounded" aria-hidden="true">{{ playing ? 'pause' : 'play_arrow' }}</span></button>
            <button type="button" class="icon-button" :disabled="!audioUrl" aria-label="Forward 2 seconds" @click="seekBy(2000)"><span class="material-symbols-rounded" aria-hidden="true">fast_forward</span></button>
            <label class="sync-transport__rate">
              <span class="sr-only">Playback speed</span>
              <span class="material-symbols-rounded" aria-hidden="true">speed</span>
              <select v-model.number="rate">
                <option :value="0.5">0.5×</option>
                <option :value="0.75">0.75×</option>
                <option :value="1">1×</option>
                <option :value="1.25">1.25×</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            class="sync-pad"
            :class="{ 'sync-pad--holding': session.holding }"
            :disabled="!audioUrl || finished || preview"
            :aria-label="mode === 'word' ? `Hold while singing: ${padLabel}` : `Tap at the start of: ${padLabel}`"
            @pointerdown="onPadDown"
            @pointerup="release"
            @pointercancel="release"
            @contextmenu.prevent
          >
            <small>{{ preview ? 'Previewing' : mode === 'word' ? 'Hold for each word' : 'Tap when this line starts' }}</small>
            <strong>{{ preview ? 'Switch to Lines or Words to keep syncing' : padLabel }}</strong>
          </button>

          <div class="sync-dock__row">
            <button v-if="mode === 'line'" type="button" class="btn btn-outlined btn-sm" :disabled="!audioUrl || lines[cursor - 1]?.startMs === undefined" @click="markEnd">
              <span class="material-symbols-rounded" aria-hidden="true">timer</span>End previous line
            </button>
            <p v-else class="sync-dock__hint">Hold for sustained words. Quick taps last until your next tap.</p>
          </div>

          <details class="sync-dock__more">
            <summary><span class="material-symbols-rounded" aria-hidden="true">tune</span><span>Timing tools<span class="sync__hide-dock"> and shortcuts</span></span></summary>
            <div class="sync-dock__shift">
              <label>
                <span>Move every timing (ms)</span>
                <input v-model.number="shiftAmount" type="number" step="10" inputmode="numeric" />
              </label>
              <button type="button" class="btn btn-tonal btn-sm" :disabled="!shiftAmount" @click="shiftAll">Apply</button>
            </div>
            <dl class="sync-dock__keys">
              <template v-for="[key, label] in SHORTCUTS" :key="key"><dt><kbd>{{ key }}</kbd></dt><dd>{{ label }}</dd></template>
            </dl>
          </details>

          <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>
          <audio ref="audio" :src="audioUrl || undefined" preload="auto" @play="onPlay" @pause="playing = false" @ended="playing = false" @loadedmetadata="onLoaded" @seeked="now = time()" />
        </aside>
      </div>
    </div>
    <LyricsExportDialog v-if="document_" ref="exportDialog" :document="document_" />
  </main>
</template>

<style scoped>
.sync {
  min-height: 100vh;
  padding-bottom: 64px;
  background: var(--md-sys-color-surface);
}

.sync--dragging {
  outline: 3px dashed var(--md-sys-color-primary);
  outline-offset: -12px;
}

.sync__inner {
  max-width: 1240px;
}

.sync__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 80px;
}

.sync__nav-actions {
  display: flex;
  gap: 8px;
}

.sync__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
  text-decoration: none;
}

.sync__brand > span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 16px 16px 8px 16px;
  background: var(--md-sys-color-primary-container);
}

.sync__brand img {
  width: 27px;
  height: 27px;
}

.btn:disabled,
.icon-button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.sync-file {
  position: relative;
  overflow: hidden;
}

.sync-file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.sync-file:focus-within {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: 3px;
}

/* Setup */
.sync-setup__hero {
  padding: clamp(28px, 5vw, 56px);
  border-radius: 44px 44px 16px 44px;
  background: var(--md-sys-color-surface-container-low);
}

.sync-setup h1 {
  max-width: 820px;
  margin: 22px 0 18px;
  font: var(--md-sys-typescale-display-medium);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking);
}

.sync-setup h1 span {
  color: var(--md-sys-color-primary);
}

.sync-setup__hero > p:last-child {
  max-width: 620px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
}

.sync-setup__draft {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 12px;
  padding: 20px 24px;
  border-radius: 16px 36px 36px 36px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.sync-setup__draft > .material-symbols-rounded {
  font-size: 32px;
}

.sync-setup__draft > div {
  flex: 1;
  min-width: 0;
}

.sync-setup__draft h2 {
  font: var(--md-sys-typescale-title-medium);
}

.sync-setup__draft p {
  overflow: hidden;
  color: color-mix(in srgb, currentColor 78%, transparent);
  font: var(--md-sys-typescale-body-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-setup__steps {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 12px;
  margin-top: 12px;
}

.sync-setup__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 28px;
  border-radius: 40px 40px 16px 40px;
  background: var(--md-sys-color-surface-container-high);
}

.sync-setup__card--audio {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.sync-setup__card--lyrics {
  border-radius: 40px 16px 40px 40px;
}

.sync-setup__step {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sync-setup__step > span {
  width: 52px;
  height: 52px;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: color-mix(in srgb, currentColor 12%, transparent);
  font-size: 28px;
}

.sync-setup__step small {
  padding: 7px 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
  font: var(--md-sys-typescale-label-small);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
}

.sync-setup__card h2 {
  font: var(--md-sys-typescale-headline-small);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.sync-setup__card > p {
  color: color-mix(in srgb, currentColor 76%, transparent);
  font: var(--md-sys-typescale-body-medium);
}

.sync-setup__card--audio .btn-filled {
  margin-top: auto;
  background: var(--md-sys-color-on-tertiary-container);
  color: var(--md-sys-color-tertiary-container);
}

.sync-setup textarea,
.sync-setup select,
.sync-dock input[type='number'],
.sync-edit input {
  width: 100%;
  min-height: 44px;
  padding: 12px 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 14px;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-body-medium);
}

.sync-setup textarea {
  min-height: 200px;
  resize: vertical;
  font: 0.875rem / 1.55 ui-monospace, monospace;
}

.sync-setup textarea:focus,
.sync-setup select:focus,
.sync-dock input:focus,
.sync-edit input:focus {
  border-color: var(--md-sys-color-primary);
  outline: 1px solid var(--md-sys-color-primary);
}

.sync-setup__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
}

.sync-setup__format {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 200px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-medium);
}

.sync-setup__file {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  font: var(--md-sys-typescale-label-large);
  overflow-wrap: anywhere;
}

.sync-setup__file .material-symbols-rounded {
  font-size: 20px;
}

.sync-setup__error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 14px 18px;
  border-radius: 18px;
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.sync-setup__start {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  margin-top: 20px;
}

.sync-setup__start p {
  flex: 1;
  min-width: 240px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
}

/* Workspace: lyrics on the left, a sticky tapping panel on the right. */
.sync-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
}

.sync-lyrics__header {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 4px 14px;
  background: var(--md-sys-color-surface);
}

.sync-lyrics__header h1 {
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
}

.sync-lyrics__header p {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
}

.sync-segmented {
  display: flex;
  padding: 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-surface-container-high);
}

.sync-segmented button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  font: var(--md-sys-typescale-label-large);
}

.sync-segmented button[aria-pressed='true'] {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.sync-segmented .material-symbols-rounded {
  font-size: 20px;
}

.sync-lyrics__list {
  display: grid;
  gap: 2px;
  padding: 0;
}

.sync-lyrics__list--preview :deep(.sync-line__time) {
  visibility: hidden;
}

.sync-lyrics__list--preview :deep(.sync-line__text) {
  font-size: clamp(1.25rem, 2.6vw, 1.75rem);
}

.sync-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 8px;
  padding: 0 10px 0 110px;
  list-style: none;
}

.sync-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: var(--md-sys-typescale-label-medium);
}

.sync-tool .material-symbols-rounded {
  font-size: 18px;
}

.sync-tool:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.sync-edit {
  padding: 8px 10px;
  list-style: none;
}

.sync-lyrics__end {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 16px;
  border-radius: 20px;
  color: var(--md-sys-color-outline);
  list-style: none;
  font: var(--md-sys-typescale-body-medium);
  scroll-margin: 140px 0 var(--sync-dock-height, 140px);
}

.sync-lyrics__end--current {
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.sync-dock {
  position: sticky;
  top: 16px;
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 32px 32px 12px 32px;
  background: var(--md-sys-color-surface-container);
}

.sync-dock__audio {
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  font: var(--md-sys-typescale-body-medium);
}

.sync-player {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.sync-player__time {
  color: var(--md-sys-color-on-surface-variant);
  font: 600 0.8125rem / 1 ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

.sync-player__seek {
  width: 100%;
  height: 32px;
  accent-color: var(--md-sys-color-primary);
}

.sync-transport {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.sync-transport__play {
  width: 64px;
  height: 56px;
  border-radius: 20px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.sync-transport__play .material-symbols-rounded {
  font-size: 32px;
}

.sync-transport__rate {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 48px;
  padding-left: 10px;
  border-radius: 24px;
  background: var(--md-sys-color-surface-container-high);
}

.sync-transport__rate .material-symbols-rounded {
  font-size: 20px;
}

.sync-transport__rate select {
  height: 100%;
  padding: 0 10px 0 4px;
  border: 0;
  border-radius: 0 24px 24px 0;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-label-large);
}

/* The pad takes pointer events directly so a press is timed on touch down. */
.sync-pad {
  display: grid;
  gap: 6px;
  align-content: center;
  min-height: 148px;
  padding: 18px 22px;
  border: 0;
  border-radius: 28px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  cursor: pointer;
  text-align: left;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  transition: border-radius var(--md-motion-spatial-fast), background-color var(--md-motion-effects-fast);
}

.sync-pad:active,
.sync-pad--holding {
  border-radius: 44px;
  background: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
  transition: none;
}

.sync-pad:disabled {
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-outline);
  cursor: not-allowed;
}

.sync-pad small {
  font: var(--md-sys-typescale-label-small);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.sync-pad strong {
  display: -webkit-box;
  overflow: hidden;
  font: var(--md-sys-typescale-headline-small);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow-wrap: anywhere;
}

.sync-dock__row:empty {
  display: none;
}

.sync-dock__hint {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
}

.sync-dock__more summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  font: var(--md-sys-typescale-label-large);
  list-style: none;
}

.sync-dock__more summary::-webkit-details-marker {
  display: none;
}

.sync-dock__more summary .material-symbols-rounded {
  font-size: 20px;
}

.sync-dock__shift {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin: 8px 0 16px;
}

.sync-dock__shift label {
  display: grid;
  flex: 1;
  gap: 4px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-medium);
}

.sync-dock__keys {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
  align-items: center;
  font: var(--md-sys-typescale-body-small);
}

.sync-dock__keys dd {
  color: var(--md-sys-color-on-surface-variant);
}

kbd {
  display: inline-block;
  min-width: 28px;
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--md-sys-color-surface-container-highest);
  font: 600 0.75rem / 1.4 ui-monospace, monospace;
  text-align: center;
}

@media (max-width: 1000px) {
  .sync-setup__steps {
    grid-template-columns: 1fr;
  }
}

/* Phones and tablets: the tapping panel docks to the bottom edge, in thumb reach. */
@media (max-width: 900px) {
  .sync-workspace {
    display: block;
  }

  .sync-lyrics {
    padding-bottom: var(--sync-dock-height, 300px);
  }

  .sync-dock {
    position: fixed;
    z-index: 10;
    inset: auto 0 0;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    border-radius: 28px 28px 0 0;
    background: var(--md-sys-color-surface-container-high);
  }

  .sync-transport .icon-button:not(.sync-transport__play) {
    background: var(--md-sys-color-surface-container-highest);
  }

  .sync-transport__rate {
    background: var(--md-sys-color-surface-container-highest);
  }

  .sync-pad {
    min-height: 92px;
    padding: 14px 18px;
  }

  .sync-pad strong {
    font: var(--md-sys-typescale-title-large);
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }

  .sync-dock > * {
    grid-column: 1 / -1;
  }

  /* End-line button and tools share one row under the pad. */
  .sync-dock > .sync-dock__row {
    grid-column: 1;
  }

  .sync-dock > .sync-dock__more:not([open]) {
    grid-column: 2;
  }

  .sync-dock__more summary {
    justify-content: flex-end;
  }

  .sync-dock__hint,
  .sync-dock__keys,
  .sync__hide-dock {
    display: none;
  }

  /* One swipeable row keeps the lyrics in view on narrow screens. */
  .sync-tools {
    flex-wrap: nowrap;
    padding-left: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .sync-tool {
    flex: none;
  }
}

@media (max-width: 600px) {
  .sync__hide-small {
    display: none;
  }

  .sync__nav .btn-outlined {
    padding-inline: 12px;
  }

  .sync-setup__card {
    padding: 24px 20px;
  }

  .sync-setup__draft {
    flex-wrap: wrap;
  }

  .sync-lyrics__header {
    padding-inline: 0;
  }

  .sync-segmented button {
    padding-inline: 12px;
  }

  .sync-player__time {
    font-size: 0.75rem;
  }
}
</style>
