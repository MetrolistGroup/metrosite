import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.argv[2] || 'http://localhost:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  await page.route('https://api.github.com/**', route => route.fulfill({ json: route.request().url().endsWith('/latest') ? { tag_name: 'v2', assets: [] } : { stargazers_count: 1 } }))

  const hydrationErrors = []
  page.on('console', message => { if (message.type() === 'error' && /hydration/i.test(message.text())) hydrationErrors.push(`${page.url()}: ${message.text()}`) })

  const index = 'index, follow, max-image-preview:large, max-snippet:-1'
  const expected = [
    ['', 'Metrolist · Ad-free YouTube Music client for every device', index, 'Metrolist brings YouTube Music to every screen.'],
    ['faq', 'Metrolist FAQ · Install, sign in, update, and import playlists', index, 'Answers before the first track.'],
    ['compare', 'Metrolist vs YouTube Music app · Free ad-free alternative', index, 'Metrolist vs the YouTube Music app.'],
    ['download/linux', 'YouTube Music app for Linux · Metrolist AppImage', index, 'A real YouTube Music desktop app for Linux.'],
    ['download/android', 'Metrolist for Android · Ad-free YouTube Music APK', index, 'The ad-free YouTube Music app for Android.'],
    ['listen?code=ABC123', 'Listen Together · Metrolist', 'noindex, follow', 'Join the same room.'],
  ]
  for (const [route, title, robots, heading] of expected) {
    const raw = await (await fetch(new URL(route, base))).text()
    assert.match(raw, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`), `${route} has route-specific server metadata`)
    assert.ok(raw.replace(/<!--.*?-->|<[^>]+>/g, '').replace(/\s+/g, ' ').includes(heading.replace(/\s+/g, ' ')), `${route} ships its heading in prerendered HTML`)
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' })
    assert.equal(await page.title(), title)
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), robots)
    assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' '), heading)
  }

  // Vite preview answers unknown paths with the home page, so check hydration before the 404 visit.
  assert.deepEqual(hydrationErrors, [], 'prerendered pages hydrate without mismatches')

  await page.goto(new URL('missing-page', base).href, { waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Page not found · Metrolist')
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0)
  assert.match(await page.locator('h1').innerText(), /isn’t in the queue/)

  const sitemap = await (await fetch(new URL('sitemap.xml', base))).text()
  for (const path of ['/', '/faq', '/compare', '/privacy', '/download/android', '/download/ios', '/download/linux', '/download/macos', '/download/windows']) {
    assert.match(sitemap, new RegExp(`<loc>https://metrolist.cc${path}</loc>`), `sitemap lists ${path}`)
  }
  assert.doesNotMatch(sitemap, /listen/, 'sitemap omits noindex pages')
  const schemas = [...(await (await fetch(new URL('download/windows', base))).text()).matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1])['@type'])
  assert.deepEqual(schemas.sort(), ['BreadcrumbList', 'FAQPage', 'SoftwareApplication'])
  console.log('PASS prerendered routes, metadata, structured data, sitemap, indexing rules and not-found view')
} finally {
  await browser.close()
}
