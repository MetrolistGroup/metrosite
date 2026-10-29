import { expect, test } from 'bun:test'
import { GUIDE_COLLECTIONS, GUIDE_DISCLOSURE, GUIDE_INDEX_META, GUIDE_REVIEW_DATE, GUIDES, getRelatedGuides } from '../src/content/guides'

const appSources = {
  Metrolist: 'https://github.com/MetrolistGroup/Metrolist',
  ArchiveTune: 'https://github.com/rukamori/ArchiveTune',
  InnerTune: 'https://github.com/z-huang/InnerTune',
  SimpMusic: 'https://github.com/maxrave-dev/SimpMusic',
  'Harmony Music': 'https://github.com/anandnet/Harmony-Music',
  Musify: 'https://github.com/gokadzev/Musify',
  ViTune: 'https://github.com/bartoostveen/ViTune',
  Spotube: 'https://github.com/team-spotube/spotube',
  NewPipe: 'https://github.com/TeamNewPipe/NewPipe',
  FreeTube: 'https://github.com/FreeTubeApp/FreeTube',
}

const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

test('guides preserve existing routes and have unique, indexable metadata', () => {
  const slugs = GUIDES.map(guide => guide.slug)
  expect(slugs).toEqual(expect.arrayContaining([
    'metrolist-vs-archivetune',
    'metrolist-vs-youtube-music',
    'youtube-music-alternatives',
    'best-youtube-music-client-android-2026',
    'youtube-music-desktop-clients',
    'metrolist-ios-iphone',
    'metrolist-offline-downloads',
    'import-spotify-playlists-metrolist',
    'youtube-music-without-google-account',
    'metrolist-listen-together',
    'metrolist-synced-lyrics',
  ]))
  expect(new Set(slugs).size).toBe(GUIDES.length)
  expect(new Set(GUIDES.map(guide => guide.heading)).size).toBe(GUIDES.length)
  const metadata = [GUIDE_INDEX_META, ...GUIDES.map(guide => guide.meta)]
  expect(new Set(metadata.map(meta => meta.title)).size).toBe(metadata.length)
  expect(new Set(metadata.map(meta => meta.description)).size).toBe(metadata.length)
  for (const meta of metadata) {
    expect(meta.title.trim().length).toBeGreaterThan(0)
    expect(meta.description.trim().length).toBeGreaterThan(50)
    expect(meta.robots.split(',').map(value => value.trim())).toContain('index')
    expect(meta.robots.split(',').map(value => value.trim())).toContain('follow')
    expect(meta.robots).not.toMatch(/noindex|nofollow/)
  }
})

test('articles have content, safe unique anchors, and official HTTPS sources', () => {
  for (const guide of GUIDES) {
    expect(guide.slug).toMatch(safeId)
    expect(guide.intro.trim().length).toBeGreaterThan(0)
    expect(guide.heading.trim().length).toBeGreaterThan(0)
    expect(new Set(guide.sections.map(section => section.id)).size).toBe(guide.sections.length)
    expect(new Set(guide.sections.map(section => section.heading)).size).toBe(guide.sections.length)
    expect(guide.sections.length).toBeGreaterThan(0)

    for (const section of guide.sections) {
      expect(section.id).toMatch(safeId)
      expect(section.heading.trim().length).toBeGreaterThan(0)
      expect(section.paragraphs.length).toBeGreaterThan(0)
      for (const paragraph of section.paragraphs) {
        expect(paragraph.trim().length).toBeGreaterThan(0)
      }
      expect(section.links?.length).toBeGreaterThan(0)
      for (const link of section.links ?? []) {
        expect(link.label.trim().length).toBeGreaterThan(0)
        const url = new URL(link.href)
        expect(url.protocol).toBe('https:')
        expect(url.username + url.password).toBe('')
        if (url.hostname === 'github.com') {
          expect(Object.values(appSources)).toContain(`${url.origin}/${url.pathname.split('/').slice(1, 3).join('/')}`)
        } else {
          expect([
            'https://metrolist.cc', 'https://support.google.com', 'https://www.youtube.com',
            'https://faq.altstore.io', 'https://docs.sidestore.io', 'https://sideloadly.io',
            'https://developer.apple.com', 'https://policies.google.com', 'https://support.spotify.com',
          ]).toContain(url.origin)
        }
      }
    }
  }
})

test('topic collections cover every guide once and provide relevant related links', () => {
  expect(new Set(GUIDE_COLLECTIONS.map(collection => collection.id)).size).toBe(GUIDE_COLLECTIONS.length)
  expect(GUIDE_COLLECTIONS.flatMap(collection => collection.guides)).toEqual(GUIDES)
  for (const collection of GUIDE_COLLECTIONS) {
    expect(collection.id).toMatch(safeId)
    expect(collection.guides.length).toBeGreaterThan(0)
    for (const guide of collection.guides) {
      const related = getRelatedGuides(guide.slug)
      expect(related).toEqual(collection.guides.filter(item => item.slug !== guide.slug).slice(0, 3))
      expect(related.some(item => item.slug === guide.slug)).toBe(false)
    }
  }
  expect(getRelatedGuides('missing-guide')).toEqual([])
})

test('alternatives contain exactly ten distinct apps with their own official sources', () => {
  const guide = GUIDES.find(guide => guide.slug === 'youtube-music-alternatives')!
  expect(guide.sections.map(section => section.heading)).toEqual(Object.keys(appSources))
  for (const [name, href] of Object.entries(appSources)) {
    const section = guide.sections.find(section => section.heading === name)!
    expect(section.links?.some(link => link.href === href)).toBe(true)
  }
})

test('source review date is a real calendar date and publisher and account risks remain disclosed', () => {
  expect(GUIDE_REVIEW_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(new Date(`${GUIDE_REVIEW_DATE}T00:00:00Z`).toISOString().slice(0, 10)).toBe(GUIDE_REVIEW_DATE)
  expect(GUIDE_DISCLOSURE).toContain('Written by the Metrolist project')
  expect(GUIDE_DISCLOSURE).toMatch(/Terms of Service.*account risks/)
  expect(JSON.stringify([GUIDE_INDEX_META, GUIDE_DISCLOSURE, GUIDES])).not.toMatch(/wear\s*os/i)
})
