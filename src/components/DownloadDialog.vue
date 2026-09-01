<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import {
  DOWNLOAD_PLATFORMS,
  findDownloadAsset,
  type DownloadPlatform,
  type DownloadPlatformKey,
  type ReleaseAsset,
} from '../content/downloads'

const props = withDefaults(defineProps<{
  label?: string
  buttonClass?: string
  platform?: DownloadPlatformKey
}>(), {
  label: 'Download Metrolist',
  buttonClass: 'btn btn-filled',
})

const emit = defineEmits<{ open: [] }>()
const dialog = ref<HTMLDialogElement>()
const assets = ref<ReleaseAsset[]>([])
const releaseName = ref('')
const isLoading = ref(false)
const hasLoaded = ref(false)
const loadFailed = ref(false)
const copied = ref(false)
const titleId = useId()

function detectedPlatform(): DownloadPlatformKey {
  const agent = navigator.userAgent.toLowerCase()
  if (agent.includes('android')) return 'android'
  if (agent.includes('win')) return 'windows'
  if (agent.includes('mac')) return 'macos'
  return 'linux'
}

const selectedKey = ref<DownloadPlatformKey>(props.platform ?? detectedPlatform())
const selectedPlatform = computed(() => DOWNLOAD_PLATFORMS.find(({ key }) => key === selectedKey.value)!)
const selectedArchitectureKey = ref(selectedPlatform.value.architectures[0]!.key)
const selectedArchitecture = computed(() => selectedPlatform.value.architectures.find(({ key }) => key === selectedArchitectureKey.value)!)
const selectedAsset = computed(() => findDownloadAsset(selectedKey.value, selectedArchitectureKey.value, assets.value))
const releasesUrl = 'https://github.com/MetrolistGroup/Metrolist/releases/latest'

function selectPlatform(platform: DownloadPlatform) {
  selectedKey.value = platform.key
  selectedArchitectureKey.value = platform.architectures[0]!.key
  copied.value = false
}

function selectArchitecture(key: string) {
  selectedArchitectureKey.value = key
  copied.value = false
}

async function loadLatestRelease() {
  if (hasLoaded.value || isLoading.value) return
  isLoading.value = true

  try {
    const response = await fetch('https://api.github.com/repos/MetrolistGroup/Metrolist/releases/latest')
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)

    const release = await response.json() as { name?: string; tag_name?: string; assets?: ReleaseAsset[] }
    assets.value = release.assets ?? []
    releaseName.value = release.name || release.tag_name || 'Latest release'
  } catch {
    loadFailed.value = true
  } finally {
    isLoading.value = false
    hasLoaded.value = true
  }
}

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(selectedArchitecture.value.command)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1800)
  } catch {
    copied.value = false
  }
}

function open() {
  emit('open')
  dialog.value?.showModal()
  void loadLatestRelease()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value.close()
}

function formatSize(bytes?: number) {
  return bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : ''
}
</script>

<template>
  <button type="button" :class="buttonClass" aria-haspopup="dialog" @click="open">
    <span class="material-symbols-rounded" aria-hidden="true">download</span>
    {{ label }}
  </button>

  <Teleport to="body">
    <dialog ref="dialog" class="download-dialog" :aria-labelledby="titleId" @click="closeOnBackdrop">
      <div class="download-dialog__header">
        <div>
          <p>Download Metrolist</p>
          <h2 :id="titleId">Choose your build</h2>
        </div>
        <form method="dialog">
          <button class="icon-button" type="submit" aria-label="Close download selector">
            <span class="material-symbols-rounded" aria-hidden="true">close</span>
          </button>
        </form>
      </div>

      <div class="download-dialog__platforms" role="group" aria-label="Platform">
        <button
          v-for="platformOption in DOWNLOAD_PLATFORMS"
          :key="platformOption.key"
          type="button"
          :aria-pressed="selectedKey === platformOption.key"
          @click="selectPlatform(platformOption)"
        >
          <img :src="`/icons/${platformOption.icon}.svg`" alt="" />
          <span><strong>{{ platformOption.name }}</strong><small>{{ platformOption.package }}</small></span>
          <span v-if="selectedKey === platformOption.key" class="material-symbols-rounded" aria-hidden="true">check</span>
        </button>
      </div>

      <div class="download-dialog__architectures">
        <span>Architecture</span>
        <div role="group" :aria-label="`${selectedPlatform.name} architecture`">
          <button
            v-for="architecture in selectedPlatform.architectures"
            :key="architecture.key"
            type="button"
            :aria-pressed="selectedArchitectureKey === architecture.key"
            @click="selectArchitecture(architecture.key)"
          >{{ architecture.name }}</button>
        </div>
      </div>

      <section class="download-dialog__selection">
        <header>
          <img :src="`/icons/${selectedPlatform.icon}.svg`" alt="" />
          <div>
            <strong>{{ selectedPlatform.name }} · {{ selectedArchitecture.name }}</strong>
            <span>{{ selectedPlatform.detail }} · {{ selectedPlatform.package }}</span>
          </div>
        </header>

        <div class="download-dialog__install">
          <div>
            <h3>Install</h3>
            <ol>
              <li v-for="instruction in selectedPlatform.instructions" :key="instruction">{{ instruction }}</li>
            </ol>
          </div>

          <div>
            <div class="download-dialog__command-title">
              <h3>Command</h3>
              <button type="button" @click="copyCommand">
                <span class="material-symbols-rounded" aria-hidden="true">{{ copied ? 'check' : 'content_copy' }}</span>
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <code>{{ selectedArchitecture.command }}</code>
            <p class="download-dialog__status" aria-live="polite">
              <template v-if="isLoading">Finding the latest public build…</template>
              <template v-else-if="selectedAsset">{{ releaseName }}<template v-if="selectedAsset.size"> · {{ formatSize(selectedAsset.size) }}</template></template>
              <template v-else-if="loadFailed">Direct downloads will appear when releases become public.</template>
              <template v-else>No matching build was found in the latest release.</template>
            </p>
            <div class="download-dialog__download-actions">
              <a :href="selectedAsset?.browser_download_url || releasesUrl" class="btn btn-filled" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-rounded" aria-hidden="true">download</span>
                {{ selectedAsset ? `Download ${selectedPlatform.package}` : 'Browse release files' }}
              </a>
              <a v-if="selectedAsset" :href="releasesUrl" class="btn btn-tonal" target="_blank" rel="noopener noreferrer">All builds</a>
            </div>
          </div>
        </div>
      </section>

      <form method="dialog" class="download-dialog__footer">
        <button type="submit" class="btn btn-outlined">Close</button>
      </form>
    </dialog>
  </Teleport>
</template>

<style scoped>
.download-dialog {
  width: min(860px, calc(100% - 28px));
  max-height: calc(100dvh - 28px);
  overflow: auto;
  margin: auto;
  padding: 28px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-extra-large-increased);
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}

.download-dialog::backdrop {
  background: rgb(0 0 0 / 76%);
}

.download-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.download-dialog__header p {
  margin-bottom: 6px;
  color: var(--md-sys-color-primary);
  font-size: 0.78rem;
  font-weight: 720;
}

.download-dialog h2 {
  font-size: clamp(2rem, 6vw, 3.25rem);
  font-weight: 760;
  letter-spacing: -0.045em;
  line-height: 1;
}

.download-dialog__platforms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 28px;
}

.download-dialog__platforms button {
  display: grid;
  grid-template-columns: 28px 1fr 24px;
  gap: 12px;
  align-items: center;
  min-height: 70px;
  padding: 11px 13px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-large-increased);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  text-align: left;
}

.download-dialog__platforms button[aria-pressed='true'] {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.download-dialog__platforms img,
.download-dialog__selection header > img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.download-dialog__platforms button > span:nth-child(2),
.download-dialog__selection header > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.download-dialog__platforms strong {
  font-size: 0.9rem;
}

.download-dialog__platforms small {
  overflow: hidden;
  color: color-mix(in srgb, currentColor 72%, transparent);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-dialog__platforms .material-symbols-rounded {
  color: currentColor;
}

.download-dialog__architectures {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
}

.download-dialog__architectures > span {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.78rem;
  font-weight: 700;
}

.download-dialog__architectures > div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.download-dialog__architectures button,
.download-dialog__command-title button {
  min-height: 38px;
  padding: 8px 14px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-medium);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 680;
}

.download-dialog__architectures button[aria-pressed='true'] {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.download-dialog__selection {
  margin-top: 16px;
  padding: 20px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: var(--md-sys-color-surface-container-highest);
}

.download-dialog__selection > header {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
  align-items: start;
}

.download-dialog__selection strong {
  font-size: 1.04rem;
}

.download-dialog__selection header span {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.82rem;
}

.download-dialog__install {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 26px;
  margin-top: 20px;
}

.download-dialog__install h3 {
  font-size: 0.82rem;
  font-weight: 760;
}

.download-dialog__install ol {
  margin: 12px 0 0 1.2rem;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.82rem;
  line-height: 1.55;
}

.download-dialog__install li + li {
  margin-top: 6px;
}

.download-dialog__command-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.download-dialog__command-title button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding-block: 6px;
}

.download-dialog__command-title .material-symbols-rounded {
  font-size: 17px;
}

.download-dialog code {
  display: block;
  overflow-x: auto;
  margin-top: 8px;
  padding: 13px 14px;
  border-radius: var(--md-sys-shape-corner-medium);
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-primary);
  font-family: ui-monospace, monospace;
  font-size: 0.76rem;
  line-height: 1.5;
  white-space: nowrap;
}

.download-dialog__status {
  min-height: 19px;
  margin-top: 9px;
  color: var(--md-sys-color-primary);
  font-size: 0.76rem;
}

.download-dialog__download-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 13px;
}

.download-dialog__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 760px) {
  .download-dialog__platforms {
    grid-template-columns: 1fr 1fr;
  }

  .download-dialog__install {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .download-dialog {
    padding: 22px;
    border-radius: var(--md-sys-shape-corner-extra-large);
  }

  .download-dialog__platforms {
    grid-template-columns: 1fr;
  }

  .download-dialog__architectures {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .download-dialog__download-actions,
  .download-dialog__download-actions .btn,
  .download-dialog__footer .btn {
    width: 100%;
  }
}
</style>
