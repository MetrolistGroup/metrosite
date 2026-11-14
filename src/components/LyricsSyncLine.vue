<script setup lang="ts">
import { computed } from 'vue'
import { lrcTime } from '../content/lyrics/export'
import { lineText, type Line, type Word } from '../content/lyrics/model'

// Only the active line receives `now`, so other rows skip per-frame renders.
const props = defineProps<{
  line: Line
  current: boolean
  active: boolean
  outOfOrder: boolean
  now?: number
  draft?: { tokens: string[]; words: Word[] }
}>()
defineEmits<{ select: []; seek: [] }>()

const fill = (word: Word) => props.now === undefined ? 0
  : Math.min(1, Math.max(0, (props.now - word.startMs) / Math.max(1, word.endMs - word.startMs)))
const words = computed(() => props.draft
  ? props.draft.tokens.map((text, index) => ({ text, state: index < props.draft!.words.length ? 'done' : index === props.draft!.words.length ? 'next' : 'pending', fill: 0 }))
  : props.line.words?.map(word => ({ text: word.text, state: 'timed', fill: fill(word) })))
</script>

<template>
  <li
    class="sync-line"
    :class="{ 'sync-line--current': current, 'sync-line--active': active, 'sync-line--unsynced': line.startMs === undefined, 'sync-line--warning': outOfOrder, 'sync-line--background': line.background }"
    :aria-current="current ? 'step' : undefined"
    @click="$emit('select')"
  >
    <button type="button" class="sync-line__time" :disabled="line.startMs === undefined" :aria-label="line.startMs === undefined ? 'Not synced' : `Play from ${lrcTime(line.startMs)}`" @click.stop="$emit('seek')">
      {{ line.startMs === undefined ? '--:--.--' : lrcTime(line.startMs) }}
    </button>
    <div class="sync-line__body">
      <p class="sync-line__text">
        <span v-if="line.agent" class="sync-line__agent">{{ line.agent }}</span>
        <template v-if="words">
          <span v-for="(word, index) in words" :key="index" class="sync-word" :class="`sync-word--${word.state}`" :style="active && word.state === 'timed' ? { '--fill': `${word.fill * 100}%` } : undefined">{{ word.text }}</span>
        </template>
        <template v-else>{{ lineText(line) }}</template>
      </p>
      <p v-if="line.backgroundText || line.backgroundWords?.length" class="sync-line__extra">({{ line.backgroundText || line.backgroundWords!.map(word => word.text).join('') }})</p>
      <p v-if="line.translatedText" class="sync-line__extra">{{ line.translatedText }}</p>
      <p v-if="outOfOrder" class="sync-line__warning"><span class="material-symbols-rounded" aria-hidden="true">warning</span>Starts before the line above</p>
    </div>
  </li>
</template>

<style scoped>
.sync-line {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 12px 14px;
  border-radius: 20px;
  cursor: pointer;
  list-style: none;
  scroll-margin: 140px 0 var(--sync-dock-height, 140px);
  transition: background-color var(--md-motion-effects-fast);
}

.sync-line--current {
  background: var(--md-sys-color-surface-container-high);
}

.sync-line__time {
  min-width: 82px;
  min-height: 36px;
  padding: 6px 10px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: 600 0.8125rem / 1.5 ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

.sync-line__time:disabled {
  background: transparent;
  color: var(--md-sys-color-outline);
  cursor: inherit;
  outline: 1px dashed var(--md-sys-color-outline-variant);
  outline-offset: -1px;
}

.sync-line--current .sync-line__time:not(:disabled) {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.sync-line__body {
  min-width: 0;
  padding-top: 4px;
}

.sync-line__text {
  color: var(--md-sys-color-on-surface-variant);
  font: 500 1.1875rem / 1.4 var(--md-ref-typeface);
  overflow-wrap: anywhere;
  transition: color var(--md-motion-effects-fast);
}

.sync-line--current .sync-line__text,
.sync-line--active .sync-line__text {
  color: var(--md-sys-color-on-surface);
}

.sync-line--active .sync-line__text {
  font-weight: 700;
}

.sync-line--background .sync-line__text {
  font-style: italic;
}

.sync-line__agent {
  margin-right: 8px;
  padding: 2px 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  font: var(--md-sys-typescale-label-medium);
  vertical-align: 2px;
}

.sync-word {
  white-space: pre-wrap;
}

/* Hard-stop fill: sung text takes the primary color as the word plays. */
.sync-line--active .sync-word--timed {
  background: linear-gradient(90deg, var(--md-sys-color-primary) var(--fill, 0%), var(--md-sys-color-on-surface-variant) var(--fill, 0%));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.sync-word--done {
  color: var(--md-sys-color-primary);
}

.sync-word--next {
  border-radius: 6px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.sync-word--pending {
  color: var(--md-sys-color-outline);
}

.sync-line__extra {
  margin-top: 2px;
  color: var(--md-sys-color-outline);
  font: var(--md-sys-typescale-body-medium);
}

.sync-line__warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--md-sys-color-error);
  font: var(--md-sys-typescale-label-medium);
}

.sync-line__warning .material-symbols-rounded {
  font-size: 18px;
}

@media (max-width: 600px) {
  .sync-line {
    gap: 10px;
    padding: 10px;
  }

  .sync-line__time {
    min-width: 74px;
    padding-inline: 8px;
    font-size: 0.75rem;
  }

  .sync-line__text {
    font-size: 1.0625rem;
  }
}
</style>
