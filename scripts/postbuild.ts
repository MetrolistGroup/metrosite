import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { FAQ_ITEMS, type FaqItem } from '../src/content/faq'
import { GUIDES, GUIDE_INDEX_META, GUIDE_REVIEW_DATE } from '../src/content/guides'
import { PAGE_META, REPO_URL, SITE_URL, type PageMeta } from '../src/content/site'
import { SHARE_ID_PATHS, SHARE_PATHS } from '../src/content/share'
import { faqMarkdown, guideMarkdown, guidesIndexMarkdown, homeMarkdown, llmsTxt, privacyMarkdown } from './markdown'
import { guidesFeed } from './feed'

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

// Schema: https://schema.org/Organization
// Google: https://developers.google.com/search/docs/appearance/structured-data/organization
const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Metrolist',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.svg`,
  sameAs: ['https://github.com/MetrolistGroup', REPO_URL, 'https://hosted.weblate.org/projects/Metrolist/'],
}

// Schema: https://schema.org/SoftwareApplication
// Google: https://developers.google.com/search/docs/appearance/structured-data/software-app
function app(operatingSystem: string, screenshot: string | string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#app`,
    name: 'Metrolist',
    alternateName: 'Metrolist Music',
    url: `${SITE_URL}/`,
    description: PAGE_META.home.description,
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Music player',
    operatingSystem,
    installUrl: `${REPO_URL}/releases/latest`,
    screenshot,
    image: `${SITE_URL}/og-image.png`,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    license: `${REPO_URL}/blob/main/LICENSE`,
    featureList: 'Ad-free YouTube Music playback, background playback, offline downloads, synchronized lyrics, Listen Together rooms, Chromecast, DLNA, and FCast casting, equalizer, tempo and pitch controls',
    author: { '@type': 'Person', name: 'Mo Agamy', url: 'https://github.com/mostafaalagamy' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    sameAs: REPO_URL,
  }
}

// Schema: https://schema.org/FAQPage
// Google markup and eligibility: https://developers.google.com/search/docs/appearance/structured-data/faqpage
const faq = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
})

// Schema: https://schema.org/BreadcrumbList
// Google: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
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
  ogType?: 'article'
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
      // Schema: https://schema.org/WebSite; Google: https://developers.google.com/search/docs/appearance/site-names
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Metrolist', alternateName: ['Metrolist Music', 'metrolist.cc'], url: `${SITE_URL}/`, publisher: { '@id': `${SITE_URL}/#organization` } },
      { '@context': 'https://schema.org', ...ORGANIZATION },
      app('Android, iOS, Windows, macOS, Linux', Object.values(SCREENSHOTS)),
    ],
  },
  { path: '/faq', file: 'faq.html', meta: PAGE_META.faq, embed: 'discord-embed-faq.json', schemas: [faq(FAQ_ITEMS), breadcrumbs('FAQ', '/faq')], markdown: ['faq.md', faqMarkdown()] },
  { path: '/privacy', file: 'privacy.html', meta: PAGE_META.privacy, embed: 'discord-embed-privacy.json', schemas: [breadcrumbs('Privacy policy', '/privacy')], markdown: ['privacy.md', privacyMarkdown(await readFile(new URL('../src/views/PrivacyPage.vue', import.meta.url), 'utf8'))] },
  {
    path: '/guides', file: 'guides.html', meta: GUIDE_INDEX_META,
    markdown: ['guides.md', guidesIndexMarkdown()],
    schemas: [
      {
        // Index schema: https://schema.org/CollectionPage with https://schema.org/ItemList
        '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}/guides#collection`,
        name: GUIDE_INDEX_META.title, description: GUIDE_INDEX_META.description, url: `${SITE_URL}/guides`,
        inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList', itemListOrder: 'https://schema.org/ItemListUnordered', numberOfItems: GUIDES.length,
          itemListElement: GUIDES.map((guide, index) => ({ '@type': 'ListItem', position: index + 1, name: guide.heading, url: `${SITE_URL}/guides/${guide.slug}` })),
        },
      },
      breadcrumbs('Guides', '/guides'),
    ],
  },
  ...GUIDES.map((guide): Page => {
    const path = `/guides/${guide.slug}`
    const url = `${SITE_URL}${path}`
    const trail = breadcrumbs('Guides', '/guides')
    return {
      path, file: `guides/${guide.slug}.html`, meta: guide.meta, ogType: 'article',
      markdown: [`guides/${guide.slug}.md`, guideMarkdown(guide)],
      schemas: [
        {
          // Schema: https://schema.org/Article
          // Google: https://developers.google.com/search/docs/appearance/structured-data/article
          '@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`,
          headline: guide.heading, description: guide.meta.description, abstract: guide.intro, url, mainEntityOfPage: url,
          inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/guides#collection` }, about: { '@id': `${SITE_URL}/#app` },
          articleSection: guide.sections.map(section => section.heading),
          citation: [...new Set(guide.sections.flatMap(section => section.links?.map(link => link.href) ?? []))],
          author: ORGANIZATION, publisher: ORGANIZATION, dateModified: GUIDE_REVIEW_DATE,
        },
        { ...trail, itemListElement: [...trail.itemListElement, { '@type': 'ListItem', position: 3, name: guide.heading, item: url }] },
      ],
    }
  }),
  { path: '/listen', file: 'listen.html', meta: PAGE_META.listen },
  { path: '/party', file: 'party.html', meta: PAGE_META.listen },
  ...SHARE_PATHS.map(path => ({ path, file: `${path.slice(1)}.html`, meta: PAGE_META.share })),
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

function replaceRequired(html: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(html)) throw new Error(`Required HTML placeholder was not found: ${pattern}`)
  return html.replace(pattern, () => replacement)
}

async function renderPage(page: Page) {
  const { meta, path } = page
  const url = `${SITE_URL}${path}`
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  let html = replaceRequired(source, /<title>[^<]*<\/title>/, `<title>${title}</title>`)
  for (const [attribute, name, value] of [
    ['name', 'robots', escapeHtml(meta.robots)],
    ['name', 'description', description],
    ['property', 'og:type', page.ogType ?? 'website'],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', escapeHtml(url)],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
  ]) {
    html = replaceRequired(html, new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attribute}="${name}" content="${value}" />`)
  }

  html = replaceRequired(html, /<link rel="canonical" href="[^"]*"\s*\/?>/,
    page.canonical === false ? '' : `<link rel="canonical" href="${escapeHtml(url)}" />`)

  html = html.replace(/\s*<link rel="discord:component-embed"[^>]*>/, '')
  if (page.embed) html = html.replace('</head>', () => `  <link rel="discord:component-embed" type="application/json" href="${SITE_URL}/${page.embed}" />\n  </head>`)
  if (page.markdown) html = html.replace('</head>', () => `  <link rel="alternate" type="text/markdown" href="/${page.markdown[0]}" />\n  </head>`)
  if (meta.robots.startsWith('index')) html = html.replace('</head>', () => `  <link rel="alternate" type="application/rss+xml" title="Metrolist guides" href="${SITE_URL}/feed.xml" />\n  </head>`)
  for (const schema of page.schemas ?? []) {
    html = html.replace('</head>', () => `  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>\n  </head>`)
  }

  const rendered = await render(path === '/404' ? '/__not-found' : path)
  if (meta.robots.startsWith('index') && rendered.modules.has('src/views/NotFoundPage.vue')) {
    throw new Error(`Indexable route ${path} rendered NotFoundPage; register its Vue route before publishing`)
  }
  html = html
    .replace('</head>', () => `  ${preloadLinks(rendered.modules)}\n  </head>`)
    // Vue hydrates body teleports starting from the body's first child.
    .replace('<body>', () => `<body>${rendered.teleports.body ?? ''}`)
    .replace('<div id="app"></div>', () => `<div id="app">${rendered.html}</div>`)

  if (!html.includes(`<title>${title}</title>`) || !html.includes(`content="${meta.robots}"`) || !html.includes('<h1')) {
    throw new Error(`Failed to prerender ${path}`)
  }
  const target = new URL(page.file, dist)
  await mkdir(new URL('.', target), { recursive: true })
  await writeFile(target, html)
  if (page.markdown) {
    const markdownTarget = new URL(page.markdown[0], dist)
    await mkdir(new URL('.', markdownTarget), { recursive: true })
    await writeFile(markdownTarget, page.markdown[1])
  }
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
// One-fetch copy of every page for agents that read llms-full.txt.
await writeFile(new URL('llms-full.txt', dist), pages.flatMap(page => page.markdown ? [page.markdown[1].trim()] : []).join('\n\n---\n\n') + '\n')
await writeFile(new URL('feed.xml', dist), guidesFeed(GUIDES))
await rm(new URL('.vite/', dist), { recursive: true })
// Serve the same hydration shell for arbitrary album and artist IDs without a 404.
await writeFile(new URL('_redirects', dist), SHARE_ID_PATHS.map(path => `${path}/* ${path} 200`).join('\n') + '\n')

// Discord component embeds (3,000-byte limit); the og:* tags remain the fallback.
const button = (label: string, url: string) => ({ type: 2, style: 5, label, url })
const embed = (path: string, heading: string, body: string, buttons: ReturnType<typeof button>[]) => ({
  component: {
    type: 17,
    accent_color: 14268927,
    components: [
      {
        type: 9,
        components: [{ type: 10, content: `## [${heading}](${SITE_URL}${path})\n${body}` }],
        accessory: button('Open', `${SITE_URL}${path}`),
      },
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
      { type: 9, components: [text(`### Ad-free YouTube Music\n${PAGE_META.home.description}`)], accessory: { type: 11, media: { url: `${SITE_URL}/icons/youtube-music.webp` }, description: 'YouTube Music' } },
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

// JSON-LD data blocks bypass script execution/CSP checks: https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
await writeFile(new URL('_headers', dist), `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/*.md
  X-Robots-Tag: noindex

/llms*.txt
  Content-Type: text/plain; charset=utf-8

/feed.xml
  Content-Type: application/rss+xml; charset=utf-8

${['/listen', '/party', ...SHARE_PATHS, ...SHARE_ID_PATHS.map(path => `${path}/*`)].map(path => `${path}\n  X-Robots-Tag: noindex, follow\n`).join('\n')}

${pages.flatMap(page => page.markdown ? [`/${page.markdown[0]}\n  Link: <${SITE_URL}${page.path}>; rel="canonical"\n`] : []).join('\n')}`)
