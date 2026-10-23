import { expect, test } from 'bun:test'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PAGE_META, REPO_URL, SITE_URL } from '../src/content/site'

const root = new URL('../', import.meta.url)
const tokens = '$& $` $\' $$ <tag> "quoted"'
const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const rendered = `<h1>${escapeHtml(tokens)}</h1>`
const teleport = `<div role="dialog">${escapeHtml(tokens)}</div>`
const preload = '/assets/$&-$`-$\'-$$.css'

// Run the real generator with a stub renderer, without a build, network, or changes to the checkout.
async function fixture(template: string, check: (dir: string, result: ReturnType<typeof Bun.spawnSync>) => Promise<void>) {
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
    await writeFile(join(dir, 'dist/.vite/ssr-manifest.json'), JSON.stringify({ route: [preload] }))
    for (const stem of ['desktop-player', 'desktop-home', 'pixel-10-pro-fold-folded-player-dark', 'iphone-17-player-dark']) {
      await writeFile(join(dir, `dist/assets/${stem}-fixture.webp`), '')
    }
    await writeFile(join(dir, 'dist-ssr/entry-server.js'), `export const render = async () => ({
      html: ${JSON.stringify(rendered)}, teleports: { body: ${JSON.stringify(teleport)} }, modules: new Set(['route'])
    })`)
    await writeFile(join(dir, 'run.ts'), `
      import { PAGE_META } from './src/content/site'
      import { FAQ_ITEMS } from './src/content/faq'
      const tokens = ${JSON.stringify(tokens)}
      for (const meta of Object.values(PAGE_META)) {
        meta.title += tokens
        meta.description += tokens
      }
      FAQ_ITEMS[0].answer += tokens
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
      for (const [file, path, meta] of [
        ['index', '/', PAGE_META.home], ['faq', '/faq', PAGE_META.faq],
        ['privacy', '/privacy', PAGE_META.privacy], ['listen', '/listen', PAGE_META.listen],
        ['404', '/404', PAGE_META.notFound],
      ] as const) {
        const html = await readFile(join(dist, `${file}.html`), 'utf8')
        expect(html).toContain(`<title>${escapeHtml(meta.title + tokens)}</title>`)
        for (const [attribute, name, value] of [
          ['name', 'robots', meta.robots], ['name', 'description', meta.description + tokens],
          ['property', 'og:title', meta.title + tokens], ['property', 'og:description', meta.description + tokens],
          ['property', 'og:url', SITE_URL + path], ['name', 'twitter:title', meta.title + tokens],
          ['name', 'twitter:description', meta.description + tokens],
        ]) expect(html).toContain(`<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`)
        if (file === '404') expect(html).not.toContain('rel="canonical"')
        else expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${path}" />`)
        expect(html).toContain(`<body>${teleport}`)
        expect(html).toContain(`<div id="app">${rendered}</div>`)
        expect(html).toContain(`<link rel="stylesheet" href="${preload}" />`)
        expect(html.match(/<\/head>/g)).toHaveLength(1)
        for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
          expect(match[1]).not.toContain('<tag>')
          schemas.push(JSON.parse(match[1]!))
        }
      }
      const app = schemas.find(schema => schema['@type'] === 'SoftwareApplication')!
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
      const markdown = await Promise.all(['index', 'faq', 'privacy'].map(file => readFile(join(dist, `${file}.md`), 'utf8')))
      expect(await readFile(join(dist, 'llms-full.txt'), 'utf8')).toBe(markdown.map(text => text.trim()).join('\n\n---\n\n') + '\n')
    })
  })
}

test('postbuild fails loudly when required description metadata is missing', async () => {
  const template = (await readFile(new URL('index.html', root), 'utf8')).replace(/<meta name="description"[^>]*>/, '')
  await fixture(template, async (_, result) => {
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).toContain('Required HTML placeholder was not found')
  })
})
