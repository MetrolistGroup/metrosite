import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.argv[2] || 'http://localhost:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  await page.route('https://api.github.com/**', route => route.fulfill({ json: route.request().url().endsWith('/latest') ? { tag_name: 'v2', assets: [] } : { stargazers_count: 1 } }))

  const expected = [
    ['faq', 'Frequently asked questions · Metrolist', 'index, follow', 'Answers before the first track.'],
    ['listen?code=ABC123', 'Listen Together · Metrolist', 'noindex, follow', 'Join the same room.'],
  ]
  for (const [route, title, robots, heading] of expected) {
    const raw = await (await fetch(new URL(route, base))).text()
    assert.match(raw, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`), `${route} has route-specific server metadata`)
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' })
    assert.equal(await page.title(), title)
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), robots)
    assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' '), heading)
  }

  await page.goto(new URL('missing-page', base).href, { waitUntil: 'networkidle' })
  assert.equal(await page.title(), 'Page not found · Metrolist')
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0)
  assert.match(await page.locator('h1').innerText(), /isn’t in the queue/)
  console.log('PASS static route metadata, indexing rules and not-found view')
} finally {
  await browser.close()
}
