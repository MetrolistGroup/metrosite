// With bun run dev running:
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs bun tests/lyrics.browser.mjs [url]
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))

try {
  await page.route('https://api.github.com/**', route => route.fulfill({ json: route.request().url().includes('/releases') ? [] : { stargazers_count: 0 } }))
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'networkidle' })
  const card = page.locator('.features__card--2')
  const lyrics = page.locator('.features__lyrics')
  await card.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.locator('.lyrics-line').count(), 3)
  assert.ok(await lyrics.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.playState === 'running')), 'lyrics animate automatically')
  const pause = page.getByRole('button', { name: 'Pause lyrics animation' })
  await pause.focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.getByRole('button', { name: 'Resume lyrics animation' }).getAttribute('aria-pressed'), 'true')
  assert.ok(await lyrics.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.playState === 'paused')), 'pause stops lines and words')
  await page.keyboard.press('Enter')
  assert.ok(await lyrics.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.playState === 'running')), 'resume restarts all animations')

  for (const width of [320, 390, 601, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const before = await card.boundingBox()
    for (const [index, time] of [1500, 4500, 7500, 10500].entries()) {
      await lyrics.evaluate((element, time) => element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = time }), time)
      const line = page.locator('.lyrics-line').nth(index % 3)
      assert.equal(await line.evaluate(element => getComputedStyle(element).opacity), '1', 'each line takes the active position, including after looping')
      assert.equal(await line.evaluate(element => getComputedStyle(element).filter), 'blur(0px)', 'active line stays sharp')
      assert.ok(await line.evaluate(element => {
        const bounds = element.getBoundingClientRect()
        return [...element.children].every(word => {
          const rect = word.getBoundingClientRect()
          return rect.left >= bounds.left && rect.right <= bounds.right + 1 && rect.top >= bounds.top && rect.bottom <= bounds.bottom + 1
        })
      }), `${width}px: active lyrics fit their line`)
      assert.deepEqual(await card.boundingBox(), before, 'animation does not shift the card')
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: no horizontal overflow`)
    console.log(`PASS ${width}px: lyric progression, seamless loop and stable layout`)
  }
  await lyrics.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 600 }))
  const fills = await page.locator('.lyrics-line').first().locator('.lyrics-word').evaluateAll(words => words.map(word => getComputedStyle(word).backgroundPositionX))
  assert.notEqual(fills[0], fills[3], 'words highlight sequentially rather than all at once')
  assert.ok(await page.locator('.lyrics-line').nth(1).evaluate(element => parseFloat(getComputedStyle(element).opacity) < 1 && getComputedStyle(element).filter !== 'blur(0px)'), 'inactive lines fade and blur')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await lyrics.evaluate(element => element.getAnimations({ subtree: true }).length), 0, 'reduced motion disables all lyric animation')
  assert.equal(await page.locator('.lyrics-toggle').isVisible(), false)
  assert.equal(await page.locator('.lyrics-line').first().isVisible(), true)
  assert.equal(await page.locator('.lyrics-line').nth(1).isVisible(), false)
  assert.deepEqual(errors, [])
  console.log('PASS word highlighting, inactive blur, keyboard pause/resume and reduced motion')
} finally {
  await browser.close()
}
