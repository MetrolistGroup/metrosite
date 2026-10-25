import { expect, test } from 'bun:test'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PAGE_META, REPO_URL, SITE_URL } from '../src/content/site'
import { GUIDES, GUIDE_INDEX_META, GUIDE_REVIEW_DATE } from '../src/content/guides'

const root = new URL('../', import.meta.url)
const tokens = '$& $` $\' $$ <tag> "quoted" </script>'
const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const escapeXml = (text: string) => escapeHtml(text).replaceAll('>', '&gt;').replaceAll("'", '&apos;')
const rendered = `<h1>${escapeHtml(tokens)}</h1>`
const teleport = `<div role="dialog">${escapeHtml(tokens)}</div>`
const preload = '/assets/$&-$`-$\'-$$.css'
const routes = [
  ['index', '/', PAGE_META.home], ['faq', '/faq', PAGE_META.faq],
  ['privacy', '/privacy', PAGE_META.privacy], ['guides', '/guides', GUIDE_INDEX_META],
  ...GUIDES.map(guide => [`guides/${guide.slug}`, `/guides/${guide.slug}`, guide.meta] as const),
  ['listen', '/listen', PAGE_META.listen], ['404', '/404', PAGE_META.notFound],
] as const

// Run the real generator with a stub renderer, without a build, network, or changes to the checkout.
async function fixture(template: string, check: (dir: string, result: ReturnType<typeof Bun.spawnSync>) => Promise<void>, notFoundPath?: string) {
  const dir = await mkdtemp(join(tmpdir(), 'metrosite-postbuild-'))
  try {
    await cp(new URL('scripts', root), join(dir, 'scripts'), { recursive: true })
    await cp(new URL('src/content', root), join(dir, 'src/content'), { recursive: true })
    await mkdir(join(dir, 'src/views'), { recursive: true })
    await cp(new URL('src/views/PrivacyPage.vue', root), join(dir, 'src/views/PrivacyPage.vue'))
    await mkdir(join(dir, 'dist/.vite'), { recursive: true })
    await mkdir(join(dir, 'dist/assets'))
    await mkdir(join(dir, 'dist-ssr'))
    await writeFile(join(dir, 'dist/index.html'), template)
    await writeFile(join(dir, 'dist/.vite/ssr-manifest.json'), JSON.stringify(Object.fromEntries(routes.map(([file, path]) => [path === '/404' ? '/__not-found' : path, [preload, `/assets/${file}.css`, `/assets/${file}.js`]]))))
    for (const stem of ['desktop-player', 'desktop-home', 'pixel-10-pro-fold-folded-player-dark', 'iphone-17-player-dark']) {
      await writeFile(join(dir, `dist/assets/${stem}-fixture.webp`), '')
    }
    await writeFile(join(dir, 'dist-ssr/entry-server.js'), `export const render = async (path) => ({
      html: path === ${JSON.stringify(notFoundPath)} ? '<h1>Page not found</h1>' : ${JSON.stringify(rendered)},
      teleports: { body: ${JSON.stringify(teleport)} },
      modules: new Set([path, ...(path === '/__not-found' || path === ${JSON.stringify(notFoundPath)} ? ['src/views/NotFoundPage.vue'] : [])])
    })`)
    await writeFile(join(dir, 'run.ts'), `
      import { PAGE_META } from './src/content/site'
      import { FAQ_ITEMS } from './src/content/faq'
      import { GUIDES, GUIDE_INDEX_META } from './src/content/guides'
      import { guideMarkdown } from './scripts/markdown'
      import { writeFile } from 'node:fs/promises'
      const tokens = ${JSON.stringify(tokens)}
      for (const meta of [...Object.values(PAGE_META), GUIDE_INDEX_META, ...GUIDES.map(guide => guide.meta)]) {
        meta.title += tokens
        meta.description += tokens
      }
      FAQ_ITEMS[0].answer += tokens
      for (const guide of GUIDES) guide.heading += tokens
      await writeFile('expected-markdown.json', JSON.stringify(Object.fromEntries(GUIDES.map(guide => [guide.slug, guideMarkdown(guide)]))))
      let requests = 0
      globalThis.fetch = async () => { requests++; throw new Error('Build must not fetch') }
      await import('./scripts/postbuild')
      if (requests) throw new Error('Build attempted a network request')
    `)
    const result = Bun.spawnSync([process.execPath, join(dir, 'run.ts')], { cwd: dir })
    await check(join(dir, 'dist'), result)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

for (const ending of [' />', '/>', '>']) {
  test(`postbuild preserves literal replacements and metadata with ${ending} tags`, async () => {
    const template = (await readFile(new URL('index.html', root), 'utf8')).replace(/\s*\/>/g, ending)
    await fixture(template, async (dist, result) => {
      expect(result.stderr.toString()).toBe('')
      expect(result.exitCode).toBe(0)
      const schemas: Record<string, any>[] = []
      const expectedMarkdown = JSON.parse(await readFile(join(dist, '..', 'expected-markdown.json'), 'utf8')) as Record<string, string>
      for (const [file, path, meta] of routes) {
        const html = await readFile(join(dist, `${file}.html`), 'utf8')
        expect(html).toContain(`<title>${escapeHtml(meta.title + tokens)}</title>`)
        for (const [attribute, name, value] of [
          ['name', 'robots', meta.robots], ['name', 'description', meta.description + tokens],
          ['property', 'og:type', path.startsWith('/guides/') ? 'article' : 'website'],
          ['property', 'og:title', meta.title + tokens], ['property', 'og:description', meta.description + tokens],
          ['property', 'og:url', SITE_URL + path], ['name', 'twitter:title', meta.title + tokens],
          ['name', 'twitter:description', meta.description + tokens],
        ]) expect(html).toContain(`<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`)
        if (file === '404') expect(html).not.toContain('rel="canonical"')
        else expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${path}" />`)
        expect(html).toContain(`<body>${teleport}`)
        expect(html).toContain(`<div id="app">${rendered}</div>`)
        expect(html).toContain(`<link rel="stylesheet" href="${preload}" />`)
        expect(html).toContain(`<link rel="stylesheet" href="/assets/${file}.css" />`)
        expect(html).toContain(`<link rel="modulepreload" crossorigin href="/assets/${file}.js" />`)
        if (meta.robots.startsWith('index')) {
          expect(html).toContain(`<link rel="alternate" type="text/markdown" href="/${file}.md" />`)
          expect(html).toContain(`<link rel="alternate" type="application/rss+xml" title="Metrolist guides" href="${SITE_URL}/feed.xml" />`)
        } else {
          expect(html).not.toContain('application/rss+xml')
        }
        if (path.startsWith('/guides')) expect(html).not.toContain('discord:component-embed')
        expect(html.match(/<\/head>/g)).toHaveLength(1)
        const pageSchemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => {
          expect(match[1]).not.toContain('<')
          return JSON.parse(match[1]!)
        })
        schemas.push(...pageSchemas)
        if (path.startsWith('/guides')) {
          const guide = GUIDES.find(guide => path === `/guides/${guide.slug}`)
          expect(pageSchemas.map(schema => schema['@type'])).toEqual([guide ? 'Article' : 'CollectionPage', 'BreadcrumbList'])
          expect(pageSchemas[0].description).toBe(meta.description + tokens)
          expect(pageSchemas[0].url).toBe(SITE_URL + path)
          const trail = pageSchemas[1].itemListElement
          expect(trail.map((item: any) => item.item)).toEqual([`${SITE_URL}/`, `${SITE_URL}/guides`, ...(guide ? [SITE_URL + path] : [])])
          expect(trail.map((item: any) => item.position)).toEqual(guide ? [1, 2, 3] : [1, 2])
          expect(trail[1].name).toBe('Guides')
          if (guide) {
            expect(trail[2].name).toBe(guide.heading + tokens)
            expect(pageSchemas[0].headline).toBe(guide.heading + tokens)
            expect(pageSchemas[0].mainEntityOfPage).toBe(SITE_URL + path)
            expect(pageSchemas[0]['@id']).toBe(`${SITE_URL}${path}#article`)
            expect(pageSchemas[0].inLanguage).toBe('en')
            expect(pageSchemas[0].abstract).toBe(guide.intro)
            expect(pageSchemas[0].articleSection).toEqual(guide.sections.map(section => section.heading))
            expect(pageSchemas[0].citation).toEqual([...new Set(guide.sections.flatMap(section => section.links?.map(link => link.href) ?? []))])
            expect(pageSchemas[0].about).toEqual({ '@id': `${SITE_URL}/#app` })
            expect(pageSchemas[0].isPartOf).toEqual({ '@id': `${SITE_URL}/guides#collection` })
            expect(pageSchemas[0].dateModified).toBe(GUIDE_REVIEW_DATE)
            for (const role of ['author', 'publisher']) {
              expect(pageSchemas[0][role]['@type']).toBe('Organization')
              expect(pageSchemas[0][role].name).toBe('Metrolist')
            }
            expect(await readFile(join(dist, `${file}.md`), 'utf8')).toBe(expectedMarkdown[guide.slug])
          } else {
            expect(pageSchemas[0].name).toBe(GUIDE_INDEX_META.title + tokens)
            expect(pageSchemas[0]['@id']).toBe(`${SITE_URL}/guides#collection`)
            expect(pageSchemas[0].inLanguage).toBe('en')
            expect(pageSchemas[0].mainEntity['@type']).toBe('ItemList')
            expect(pageSchemas[0].mainEntity.itemListOrder).toBe('https://schema.org/ItemListUnordered')
            expect(pageSchemas[0].mainEntity.numberOfItems).toBe(GUIDES.length)
            expect(pageSchemas[0].mainEntity.itemListElement.map((item: any) => item.url)).toEqual(GUIDES.map(guide => `${SITE_URL}/guides/${guide.slug}`))
            expect(pageSchemas[0].mainEntity.itemListElement.map((item: any) => item.name)).toEqual(GUIDES.map(guide => guide.heading + tokens))
          }
        }
      }
      const app = schemas.find(schema => schema['@type'] === 'SoftwareApplication')!
      expect(app['@id']).toBe(`${SITE_URL}/#app`)
      expect(app.description).toBe(PAGE_META.home.description + tokens)
      expect(app.operatingSystem).toBe('Android, iOS, Windows, macOS, Linux')
      expect(app.installUrl).toBe(`${REPO_URL}/releases/latest`)
      expect(app.sameAs).toBe(REPO_URL)
      expect(app.offers.price).toBe('0')
      for (const key of ['softwareVersion', 'dateModified', 'downloadUrl', 'codeRepository']) expect(app).not.toHaveProperty(key)
      expect(schemas.find(schema => schema['@type'] === 'FAQPage')!.mainEntity[0].acceptedAnswer.text).toEndWith(tokens)
      for (const file of ['discord-embed', 'discord-embed-faq', 'discord-embed-privacy']) {
        const json = await readFile(join(dist, `${file}.json`), 'utf8')
        expect(Buffer.byteLength(json)).toBeLessThanOrEqual(3000)
        const embed = JSON.parse(json)
        if (file === 'discord-embed') expect(embed.component.components.at(-1).components[0].content).toBe(`### Ad-free YouTube Music\n${PAGE_META.home.description}${tokens}`)
      }
      const headers = await readFile(join(dist, '_headers'), 'utf8')
      expect(headers).not.toContain('/assets/*')
      expect(headers).not.toContain('Cache-Control:')
      expect(headers).not.toContain('Content-Type: text/markdown')
      expect(headers).toContain('/*.md\n  X-Robots-Tag: noindex')
      expect(headers).not.toContain('\n/guides\n')
      expect(headers).toContain('/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8')
      expect(headers).toContain('/listen\n  X-Robots-Tag: noindex, follow')
      const indexable = routes.filter(([, , meta]) => meta.robots.startsWith('index'))
      const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
      expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).toEqual(indexable.map(([, path]) => SITE_URL + path))
      const llms = await readFile(join(dist, 'llms.txt'), 'utf8')
      expect(llms).toContain(`(${SITE_URL}/guides)`)
      expect(llms).toContain(`(${SITE_URL}/feed.xml)`)
      const feed = await readFile(join(dist, 'feed.xml'), 'utf8')
      expect(feed.match(/<item>/g)).toHaveLength(GUIDES.length)
      expect(feed).toContain(`<title>${escapeXml(GUIDE_INDEX_META.title + tokens)}</title>`)
      for (const guide of GUIDES) {
        expect(feed).toContain(`<title>${escapeXml(guide.heading + tokens)}</title>`)
        expect(feed).toContain(`<guid isPermaLink="true">${SITE_URL}/guides/${guide.slug}</guid>`)
      }
      const markdown = await Promise.all(indexable.map(async ([file, path]) => {
        expect(llms).toContain(`(${SITE_URL}/${file}.md)`)
        expect(headers).toContain(`/${file}.md\n  Link: <${SITE_URL}${path}>; rel="canonical"`)
        if (path.startsWith('/guides/')) expect(headers).not.toContain(`\n${path}\n`)
        const text = await readFile(join(dist, `${file}.md`), 'utf8')
        expect(text).toContain(`Source: ${SITE_URL}${path}\n`)
        return text
      }))
      expect(await readFile(join(dist, 'llms-full.txt'), 'utf8')).toBe(markdown.map(text => text.trim()).join('\n\n---\n\n') + '\n')
    })
  })
}

for (const [file, path] of routes.filter(([, path]) => path.startsWith('/guides'))) {
  test(`postbuild rejects an indexable not-found render at ${path}`, async () => {
    const template = await readFile(new URL('index.html', root), 'utf8')
    await fixture(template, async (dist, result) => {
      expect(result.exitCode).not.toBe(0)
      expect(result.stderr.toString()).toContain(`Indexable route ${path} rendered NotFoundPage`)
      for (const output of [`${file}.html`, `${file}.md`, 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'feed.xml']) {
        expect(await Bun.file(join(dist, output)).exists()).toBe(false)
      }
    }, path)
  })
}

test('postbuild fails loudly when required description metadata is missing', async () => {
  const template = (await readFile(new URL('index.html', root), 'utf8')).replace(/<meta name="description"[^>]*>/, '')
  await fixture(template, async (_, result) => {
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).toContain('Required HTML placeholder was not found')
  })
})
