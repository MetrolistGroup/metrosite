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
    ['', 'Metrolist · Music without the noise', index, 'Music without the noise'],
    ['faq', 'Metrolist FAQ · Install, sign in, update, and import playlists', index, 'Frequently asked questions'],
    ['listen?code=ABC123', 'Listen Together · Metrolist', 'noindex, follow', 'Join a listening room'],
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
  assert.equal(await page.locator('h1').innerText(), 'Page not found')

  const sitemap = await (await fetch(new URL('sitemap.xml', base))).text()
  for (const path of ['/', '/faq', '/privacy']) {
    assert.match(sitemap, new RegExp(`<loc>https://metrolist.cc${path}</loc>`), `sitemap lists ${path}`)
  }
  assert.doesNotMatch(sitemap, /listen/, 'sitemap omits noindex pages')
  const schemas = [...(await (await fetch(new URL('', base))).text()).matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1])['@type'])
  assert.deepEqual(schemas.sort(), ['Organization', 'SoftwareApplication', 'WebSite'])
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.locator('button[aria-haspopup="dialog"]').first().click()
  page.context().once('page', tab => tab.close())
  await page.locator('.download-dialog[open] .download-dialog__download-actions .btn-filled').click()
  const notice = page.locator('.download-dialog[open] .download-dialog__notice')
  await notice.waitFor()
  assert.match(await notice.innerText(), /does not host/)
  if (process.env.SCREENSHOT) await page.screenshot({ path: process.env.SCREENSHOT })
  await notice.getByRole('button', { name: 'Dismiss notice' }).click()
  await notice.waitFor({ state: 'hidden' })
  assert.equal(await page.locator('.download-dialog[open]').count(), 1, 'dismissing the notice keeps the download dialog open')
  console.log('PASS prerendered routes, download notice, metadata, structured data, sitemap, indexing rules and not-found view')
} finally {
  await browser.close()
}
