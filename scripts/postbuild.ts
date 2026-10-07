import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { FAQ_ITEMS, type FaqItem } from '../src/content/faq'
import { PAGE_META, REPO_URL, SITE_URL, type PageMeta } from '../src/content/site'
import { faqMarkdown, homeMarkdown, llmsTxt, privacyMarkdown } from './markdown'

const dist = new URL('../dist/', import.meta.url)
const source = await readFile(new URL('index.html', dist), 'utf8')
const ssrManifest: Record<string, string[]> = JSON.parse(await readFile(new URL('.vite/ssr-manifest.json', dist), 'utf8'))
const { render } = await import(new URL('../dist-ssr/entry-server.js', import.meta.url).href) as typeof import('../src/entry-server')
const assets = await readdir(new URL('assets/', dist))
const assetUrl = (stem: string) => {
  const file = assets.find(name => name.startsWith(`${stem}-`) && !name.startsWith(`${stem}-thumb`))
  if (!file) throw new Error(`Screenshot ${stem} was not found`)
  return `${SITE_URL}/assets/${file}`
}

const SCREENSHOTS = {
  desktop: assetUrl('desktop-player'),
  desktopHome: assetUrl('desktop-home'),
  android: assetUrl('pixel-10-pro-fold-folded-player-dark'),
  ios: assetUrl('iphone-17-player-dark'),
}

// Latest version for structured data; the build still succeeds offline.
const release = await fetch('https://api.github.com/repos/MetrolistGroup/Metrolist/releases/latest', { signal: AbortSignal.timeout(5000) })
  .then(response => response.ok ? response.json() as Promise<{ tag_name?: string, published_at?: string }> : undefined)
  .catch(() => undefined)

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Metrolist',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.svg`,
  sameAs: ['https://github.com/MetrolistGroup', REPO_URL, 'https://hosted.weblate.org/projects/Metrolist/'],
}

function app(operatingSystem: string, screenshot: string | string[], downloadUrl = `${REPO_URL}/releases/latest`) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Metrolist',
    alternateName: 'Metrolist Music',
    url: `${SITE_URL}/`,
    description: PAGE_META.home.description,
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Music player',
    operatingSystem,
    downloadUrl,
    installUrl: downloadUrl,
    screenshot,
    image: `${SITE_URL}/og-image.png`,
    ...(release?.tag_name && { softwareVersion: release.tag_name.replace(/^v/, '') }),
    ...(release?.published_at && { dateModified: release.published_at }),
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    license: `${REPO_URL}/blob/main/LICENSE`,
    codeRepository: REPO_URL,
    featureList: 'Ad-free YouTube Music playback, background playback, offline downloads, synchronized lyrics, Listen Together rooms, Chromecast, DLNA, and FCast casting, equalizer, tempo and pitch controls',
    author: { '@type': 'Person', name: 'Mo Agamy', url: 'https://github.com/mostafaalagamy' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    sameAs: REPO_URL,
  }
}

const faq = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
})

const breadcrumbs = (name: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Metrolist', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
  ],
})

type Page = {
  path: string
  file: string
  meta: PageMeta
  canonical?: boolean
  /** Discord component embed file, linked from the page head. */
  embed?: string
  schemas?: object[]
  markdown?: [file: string, content: string]
  /** Screenshots listed in the image sitemap. */
  images?: string[]
}

const pages: Page[] = [
  {
    path: '/',
    file: 'index.html',
    meta: PAGE_META.home,
    embed: 'discord-embed.json',
    markdown: ['index.md', homeMarkdown()],
    images: [SCREENSHOTS.desktopHome, SCREENSHOTS.desktop, SCREENSHOTS.android, SCREENSHOTS.ios],
    schemas: [
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Metrolist', alternateName: ['Metrolist Music', 'metrolist.cc'], url: `${SITE_URL}/`, publisher: { '@id': `${SITE_URL}/#organization` } },
      { '@context': 'https://schema.org', ...ORGANIZATION },
      app('Android, iOS, Windows, macOS, Linux', Object.values(SCREENSHOTS)),
    ],
  },
  { path: '/faq', file: 'faq.html', meta: PAGE_META.faq, embed: 'discord-embed-faq.json', schemas: [faq(FAQ_ITEMS), breadcrumbs('FAQ', '/faq')], markdown: ['faq.md', faqMarkdown()] },
  { path: '/privacy', file: 'privacy.html', meta: PAGE_META.privacy, embed: 'discord-embed-privacy.json', schemas: [breadcrumbs('Privacy policy', '/privacy')], markdown: ['privacy.md', privacyMarkdown(await readFile(new URL('../src/views/PrivacyPage.vue', import.meta.url), 'utf8'))] },
  { path: '/listen', file: 'listen.html', meta: PAGE_META.listen },
  { path: '/404', file: '404.html', meta: PAGE_META.notFound, canonical: false },
]

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

// Stylesheets and chunks the prerendered route needs, so it paints styled before hydration.
function preloadLinks(modules: Set<string>) {
  const files = new Set([...modules].flatMap(id => ssrManifest[id] ?? []).filter(file => !source.includes(file)))
  return [...files].map(file => file.endsWith('.css')
    ? `<link rel="stylesheet" href="${file}" />`
    : file.endsWith('.js') ? `<link rel="modulepreload" crossorigin href="${file}" />` : '').filter(Boolean).join('\n    ')
}

async function renderPage(page: Page) {
  const { meta, path } = page
  const url = `${SITE_URL}${path}`
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  let html = source
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${meta.robots}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`)

  html = page.canonical === false
    ? html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '')
    : html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)

  html = html.replace(/\s*<link rel="discord:component-embed"[^>]*\/>/, '')
  if (page.embed) html = html.replace('</head>', `  <link rel="discord:component-embed" type="application/json" href="${SITE_URL}/${page.embed}" />\n  </head>`)
  if (page.markdown) html = html.replace('</head>', `  <link rel="alternate" type="text/markdown" href="/${page.markdown[0]}" />\n  </head>`)
  for (const schema of page.schemas ?? []) {
    html = html.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>\n  </head>`)
  }

  const rendered = await render(path === '/404' ? '/__not-found' : path)
  html = html
    .replace('</head>', `  ${preloadLinks(rendered.modules)}\n  </head>`)
    // Vue hydrates body teleports starting from the body's first child.
    .replace('<body>', `<body>${rendered.teleports.body ?? ''}`)
    .replace('<div id="app"></div>', `<div id="app">${rendered.html}</div>`)

  if (!html.includes(`<title>${title}</title>`) || !html.includes(`content="${meta.robots}"`) || !html.includes('<h1')) {
    throw new Error(`Failed to prerender ${path}`)
  }
  const target = new URL(page.file, dist)
  await mkdir(new URL('.', target), { recursive: true })
  await writeFile(target, html)
  if (page.markdown) await writeFile(new URL(page.markdown[0], dist), page.markdown[1])
}

for (const page of pages) await renderPage(page)

const indexable = pages.filter(page => page.meta.robots.startsWith('index'))
await writeFile(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.map(page => `  <url>
    <loc>${SITE_URL}${page.path}</loc>${(page.images ?? []).map(image => `
    <image:image><image:loc>${image}</image:loc></image:image>`).join('')}
  </url>`).join('\n')}
</urlset>
`)
await writeFile(new URL('llms.txt', dist), llmsTxt())
await rm(new URL('.vite/', dist), { recursive: true })

// Discord component embeds (3,000-byte limit); the og:* tags remain the fallback.
const button = (label: string, url: string) => ({ type: 2, style: 5, label, url })
const embed = (path: string, heading: string, body: string, buttons: ReturnType<typeof button>[], image?: string) => ({
  component: {
    type: 17,
    accent_color: 14268927,
    components: [
      {
        type: 9,
        components: [{ type: 10, content: `## [${heading}](${SITE_URL}${path})\n${body}` }],
        accessory: button('Open', `${SITE_URL}${path}`),
      },
      ...(image ? [{ type: 12, items: [{ media: { url: image }, description: 'Metrolist running across desktop and mobile screens' }] }] : []),
      { type: 14, divider: true, spacing: 1 },
      { type: 1, components: buttons },
    ],
  },
})
const download = button('Download', `${REPO_URL}/releases/latest`)
const text = (content: string) => ({ type: 10, content })
const gallery = [
  [SCREENSHOTS.desktopHome, 'Metrolist home on desktop'],
  [SCREENSHOTS.desktop, 'Metrolist player on desktop'],
  [SCREENSHOTS.android, 'Metrolist player on Android'],
]
const home = {
  component: {
    type: 17,
    accent_color: 14268927,
    components: [
      { type: 9, components: [text(`## [Metrolist](${SITE_URL}/)\nMusic without the noise · Fully multiplatform`)], accessory: button('Open', `${SITE_URL}/`) },
      { type: 12, items: gallery.map(([url, description]) => ({ media: { url }, description })) },
      text('*Home and player on desktop and Android*'),
      { type: 14, divider: true, spacing: 1 },
      { type: 1, components: [button('Download', `${REPO_URL}/releases/latest`), button('Source', REPO_URL), button('FAQ', `${SITE_URL}/faq`), button('Privacy', `${SITE_URL}/privacy`)] },
      { type: 14, divider: true, spacing: 1 },
      { type: 9, components: [text('### Ad-free YouTube Music\nBackground play, synced lyrics, offline downloads, and casting on Android, Linux, macOS, and Windows.')], accessory: { type: 11, media: { url: `${SITE_URL}/icons/youtube-music.webp` }, description: 'YouTube Music' } },
    ],
  },
}
const embeds = {
  'discord-embed.json': home,
  'discord-embed-faq.json': embed('/faq', 'Metrolist FAQ', PAGE_META.faq.description, [download, button('Home', `${SITE_URL}/`)]),
  'discord-embed-privacy.json': embed('/privacy', 'Metrolist privacy policy', PAGE_META.privacy.description, [button('Home', `${SITE_URL}/`), button('Source', REPO_URL)]),
}
for (const [file, payload] of Object.entries(embeds)) {
  const json = JSON.stringify(payload)
  if (Buffer.byteLength(json) > 3000) throw new Error(`Discord embed ${file} exceeds 3,000 bytes`)
  await writeFile(new URL(file, dist), json)
}

// JSON-LD blocks are data, not script, so script-src needs no inline hashes.
await writeFile(new URL('_headers', dist), `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/*.md
  Content-Type: text/markdown; charset=utf-8
  X-Robots-Tag: noindex

/llms.txt
  Content-Type: text/plain; charset=utf-8

/listen
  X-Robots-Tag: noindex, follow
`)
