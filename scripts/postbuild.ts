import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { PAGE_META, SITE_URL, type PageMeta } from '../src/content/site'

const dist = new URL('../dist/', import.meta.url)
const source = await readFile(new URL('index.html', dist), 'utf8')

function renderPage(meta: PageMeta, path: string, canonical = true) {
  const url = `${SITE_URL}${path}`
  let html = source
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${meta.robots}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${meta.description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${meta.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${meta.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${meta.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${meta.description}" />`)

  html = canonical
    ? html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    : html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '')

  if (!html.includes(`<title>${meta.title}</title>`) || !html.includes(`content="${meta.robots}"`)) {
    throw new Error(`Failed to generate metadata for ${path}`)
  }
  return html
}

await writeFile(new URL('index.html', dist), renderPage(PAGE_META.home, '/'))
await writeFile(new URL('faq.html', dist), renderPage(PAGE_META.faq, '/faq'))
await writeFile(new URL('listen.html', dist), renderPage(PAGE_META.listen, '/listen'))
await writeFile(new URL('privacy.html', dist), renderPage(PAGE_META.privacy, '/privacy'))
await writeFile(new URL('404.html', dist), renderPage(PAGE_META.notFound, '/404', false))

const jsonLd = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
if (!jsonLd) throw new Error('Structured data script was not found')
const scriptHash = createHash('sha256').update(jsonLd).digest('base64')

await writeFile(new URL('_headers', dist), `/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-${scriptHash}'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/listen
  X-Robots-Tag: noindex, follow
`)

