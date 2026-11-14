<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { EXPORT_FORMATS, exportFileName, exportLyrics, type ExportFormat } from '../content/lyrics/export'
import { synced, type LyricsDocument } from '../content/lyrics/model'

const props = defineProps<{ document: LyricsDocument }>()
const dialog = ref<HTMLDialogElement>()
const format = ref<ExportFormat>('mlx')
const copied = ref(false)
const titleId = useId()
const song = computed(() => props.document.song)

const output = computed(() => {
  try {
    return { text: exportLyrics(props.document, format.value) }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'These lyrics could not be exported.' }
  }
})

const notes = computed(() => {
  const lines = props.document.lines
  const unsynced = lines.filter(line => !synced(line)).length
  const hasWords = lines.some(line => line.words?.length)
  const result: string[] = []
  if (unsynced && format.value !== 'plain' && format.value !== 'mlx') result.push(`${unsynced} unsynced ${unsynced === 1 ? 'line is' : 'lines are'} left out of ${EXPORT_FORMATS[format.value].label}.`)
  if (unsynced && format.value === 'mlx') result.push(`${unsynced} unsynced ${unsynced === 1 ? 'line stays' : 'lines stay'} at the end without timings.`)
  if (hasWords && (format.value === 'lrc' || format.value === 'plain')) result.push('Word timings are not included in this format. Choose MLX, Enhanced LRC, or TTML to keep them.')
  return result
})

const fields = [
  ['title', 'Title'], ['artist', 'Artist'], ['album', 'Album'], ['language', 'Language code'],
] as const

function open() {
  copied.value = false
  dialog.value?.showModal()
}

function download() {
  if (!output.value.text) return
  const url = URL.createObjectURL(new Blob([output.value.text], { type: `${EXPORT_FORMATS[format.value].type};charset=utf-8` }))
  const link = Object.assign(document.createElement('a'), { href: url, download: exportFileName(props.document, format.value) })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function copy() {
  if (!output.value.text) return
  try {
    await navigator.clipboard.writeText(output.value.text)
    copied.value = true
  } catch {
    copied.value = false
  }
}

function setField(key: (typeof fields)[number][0], value: string) {
  if (value.trim()) song.value[key] = value
  else delete song.value[key]
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="site-dialog export-dialog" :aria-labelledby="titleId" @click="$event.target === dialog && dialog?.close()">
    <div class="export-dialog__inner">
      <header class="export-dialog__header">
        <h2 :id="titleId">Export lyrics</h2>
        <button type="button" class="icon-button" aria-label="Close" @click="dialog?.close()">
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </header>

      <fieldset class="export-dialog__formats">
        <legend>Format</legend>
        <label v-for="(item, key) in EXPORT_FORMATS" :key="key" class="export-format" :class="{ 'export-format--selected': format === key }">
          <input v-model="format" type="radio" name="export-format" :value="key" />
          <span>
            <strong>{{ item.label }}<small v-if="key === 'mlx'">Default</small></strong>
            <span>{{ item.detail }}</span>
          </span>
        </label>
      </fieldset>

      <fieldset class="export-dialog__meta">
        <legend>Song details</legend>
        <label v-for="[key, label] in fields" :key="key">
          <span>{{ label }}</span>
          <input :value="song[key] ?? ''" type="text" :placeholder="key === 'language' ? 'e.g. en, ja' : ''" @input="setField(key, ($event.target as HTMLInputElement).value)" />
        </label>
      </fieldset>

      <ul v-if="notes.length" class="export-dialog__notes">
        <li v-for="note in notes" :key="note"><span class="material-symbols-rounded" aria-hidden="true">warning</span>{{ note }}</li>
      </ul>
      <p v-if="output.error" class="export-dialog__error" role="alert">{{ output.error }}</p>
      <label v-else class="export-dialog__preview">
        <span>{{ exportFileName(document, format) }}</span>
        <textarea :value="output.text" readonly rows="8" spellcheck="false" />
      </label>

      <div class="export-dialog__actions">
        <button type="button" class="btn btn-tonal" :disabled="!output.text" @click="copy">
          <span class="material-symbols-rounded" aria-hidden="true">{{ copied ? 'check' : 'content_copy' }}</span>{{ copied ? 'Copied' : 'Copy' }}
        </button>
        <button type="button" class="btn btn-filled" :disabled="!output.text" @click="download">
          <span class="material-symbols-rounded" aria-hidden="true">download</span>Download {{ EXPORT_FORMATS[format].label }}
        </button>
      </div>
      <p class="sr-only" role="status">{{ copied ? 'Lyrics copied.' : '' }}</p>
    </div>
  </dialog>
</template>

<style scoped>
.export-dialog {
  width: min(640px, 100% - 24px);
  max-height: min(900px, 100% - 24px);
  margin: auto;
  border-radius: 32px 32px 12px 32px;
  background: var(--md-sys-color-surface-container);
}

.export-dialog__inner {
  display: grid;
  gap: 20px;
  padding: 24px;
}

.export-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.export-dialog h2 {
  font: var(--md-sys-typescale-headline-small);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

fieldset {
  display: grid;
  gap: 8px;
  border: 0;
}

legend {
  margin-bottom: 8px;
  color: var(--md-sys-color-primary);
  font: var(--md-sys-typescale-label-small);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.export-format {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 18px;
  background: var(--md-sys-color-surface-container-high);
  cursor: pointer;
}

.export-format--selected {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.export-format input {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--md-sys-color-secondary);
}

.export-format > span {
  display: grid;
  gap: 2px;
}

.export-format strong {
  display: flex;
  align-items: center;
  gap: 8px;
  font: var(--md-sys-typescale-title-small);
}

.export-format small {
  padding: 2px 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font: var(--md-sys-typescale-label-small);
}

.export-format strong + span {
  color: color-mix(in srgb, currentColor 72%, transparent);
  font: var(--md-sys-typescale-body-small);
}

.export-dialog__meta {
  grid-template-columns: 1fr 1fr;
}

.export-dialog__meta legend {
  grid-column: 1 / -1;
}

.export-dialog__meta label,
.export-dialog__preview {
  display: grid;
  gap: 6px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-medium);
}

input[type='text'],
textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-body-medium);
}

textarea {
  resize: vertical;
  font: 0.8125rem / 1.5 ui-monospace, monospace;
}

input[type='text']:focus,
textarea:focus {
  border-color: var(--md-sys-color-primary);
  outline: 1px solid var(--md-sys-color-primary);
}

.export-dialog__notes {
  display: grid;
  gap: 6px;
  list-style: none;
}

.export-dialog__notes li {
  display: flex;
  gap: 8px;
  color: var(--md-sys-color-secondary);
  font: var(--md-sys-typescale-body-small);
}

.export-dialog__notes .material-symbols-rounded {
  font-size: 18px;
}

.export-dialog__error {
  color: var(--md-sys-color-error);
}

.export-dialog__inner > .export-dialog__actions {
  position: sticky;
  bottom: 0;
  margin: 0 -24px -24px;
  padding: 16px 24px 24px;
  background: var(--md-sys-color-surface-container);
}

.export-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .export-dialog {
    width: 100%;
    max-width: none;
    max-height: calc(100% - 24px);
    margin: auto 0 0;
    border-radius: 28px 28px 0 0;
  }

  .export-dialog__inner {
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  }

  .export-dialog__meta {
    grid-template-columns: 1fr;
  }

  .export-dialog__inner > .export-dialog__actions {
    margin: 0 -16px calc(-20px - env(safe-area-inset-bottom));
    padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
  }

  .export-dialog__actions .btn {
    flex: 1;
  }
}
</style>
