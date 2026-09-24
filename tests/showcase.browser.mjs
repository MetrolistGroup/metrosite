// With bun run dev running:
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs bun tests/showcase.browser.mjs [url]
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
const models = []
page.on('pageerror', error => errors.push(error.message))
page.on('request', request => { if (request.url().endsWith('.glb')) models.push(request.url()) })

try {
  await page.route('https://api.github.com/**', route => route.fulfill({ json: route.request().url().includes('/releases') ? [] : { stargazers_count: 0 } }))
  await page.goto(process.argv[2] || 'http://localhost:5173/', { waitUntil: 'networkidle' })
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1024, 768], [1440, 1000], [1920, 1080], [844, 390]]) {
    await page.setViewportSize({ width, height })
    await page.locator('.showcase__mosaic').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    assert.deepEqual(await page.locator('.preview-tile__label strong').allTextContents(), ['Desktop', 'Android', 'iOS', 'Wear OS'])
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: horizontal overflow`)
    assert.ok(await page.locator('.preview-tile').evaluateAll(tiles => tiles.every(tile => {
      const bounds = tile.getBoundingClientRect()
      return [...tile.querySelectorAll('figcaption, button, strong, img')].every(child => {
        const rect = child.getBoundingClientRect()
        return rect.left >= bounds.left && rect.right <= bounds.right + 1 && rect.top >= bounds.top && rect.bottom <= bounds.bottom + 1
      })
    })), `${width}px: tile contents must fit without clipping`)

    for (const [index, device] of ['ios', 'desktop', 'android', 'wear'].entries()) {
      const trigger = page.locator(`.preview-tile--${device} .preview-tile__screen`)
      await trigger.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      const before = await page.evaluate(() => [scrollY, document.body.style.overflow, document.querySelector('.container').getBoundingClientRect().x])
      const small = await trigger.boundingBox()
      await trigger.click()
      await page.waitForSelector('.preview-dialog[open]')
      const animations = await page.locator('.preview-dialog').evaluate(element => element.getAnimations({ subtree: true }).flatMap(animation => animation.effect.getKeyframes()))
      assert.ok(animations.some(frame => 'opacity' in frame), 'preview must fade in')
      assert.ok(animations.some(frame => 'transform' in frame), 'preview must scale in')
      await page.waitForTimeout(320)
      const large = await page.locator('.preview-dialog__screen').boundingBox()
      assert.ok(Math.abs(large.x + large.width / 2 - width / 2) < 1, 'preview horizontally centered')
      assert.ok(Math.abs(large.y + large.height / 2 - height / 2) < 1, 'preview vertically centered')
      assert.ok(large.x >= 0 && large.y >= 0 && large.x + large.width <= width && large.y + large.height <= height, 'preview fits viewport')
      assert.ok(large.width > small.width || large.height >= height - 130, 'preview enlarges screen or fills available height in landscape')
      await page.keyboard.press('Tab')
      assert.ok(await page.evaluate(() => document.activeElement === document.body || document.querySelector('.preview-dialog').contains(document.activeElement)), 'Tab must not focus background controls')
      if (index === 0) await page.keyboard.press('Escape')
      else if (index === 1) await page.getByRole('button', { name: 'Close preview', exact: true }).click()
      else await page.mouse.click(5, height / 2)
      await page.waitForFunction(() => {
        const dialog = document.querySelector('.preview-dialog')
        const opacity = Number(getComputedStyle(dialog).opacity)
        return !dialog.open && opacity > 0 && opacity < 1 && getComputedStyle(dialog).display !== 'none'
      }, null, { timeout: 1500 })
      await page.waitForTimeout(320)
      assert.equal(await page.locator('.preview-dialog').isVisible(), false)
      assert.ok(await trigger.evaluate(element => element === document.activeElement), 'focus returns to clicked screen')
      assert.deepEqual(await page.evaluate(() => [scrollY, document.body.style.overflow, document.querySelector('.container').getBoundingClientRect().x]), before, 'zoom must restore scroll without shifting layout')
    }
    console.log(`PASS ${width}×${height}: mosaic layout, centered zoom, fade-out, focus and scroll`)
  }

  assert.deepEqual(models, [], '3D models must not load')
  assert.equal(await page.locator('.device-stage, .fold-device, .computer, .pixel-watch').count(), 0, 'hardware illustrations are removed')
  assert.deepEqual(await page.locator('.preview-tile, .preview-tile__screen, .view-switch, .features__card, .platforms__list, .chip, .footer__links').evaluateAll(elements => elements.filter(element => ['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(getComputedStyle(element)[`border${side}Width`]) > 0)).map(element => element.className)), [], 'UI surfaces must be borderless')

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator('.showcase__mosaic').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const mosaic = await page.locator('.showcase__mosaic').boundingBox()
  await page.route('**/*library*.webp*', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.continue() })
  await page.route('**/*player*.webp*', async route => { await new Promise(resolve => setTimeout(resolve, 600)); await route.continue() })
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  await page.waitForTimeout(100)
  assert.ok(await page.locator('.showcase__mosaic .screen__capture').evaluateAll(images => images.every(image => image.src.includes('home'))), 'keep old captures visible during slow loading')
  await page.waitForFunction(() => [...document.querySelectorAll('.showcase__mosaic .screen--ios .screen__capture')].some(image => image.src.includes('library') && Number(getComputedStyle(image).opacity) > 0 && Number(getComputedStyle(image).opacity) < 1))
  assert.equal(await page.locator('.showcase__mosaic .screen--ios .screen__capture').count(), 2, 'crossfade overlaps old and new captures')
  await page.waitForTimeout(400)
  assert.ok(await page.locator('.showcase__mosaic .screen__capture').evaluateAll(images => images.length === 3 && images.every(image => image.src.includes('library') && image.complete && image.naturalWidth > 0)))
  assert.equal(await page.locator('.preview-tile--wear .screen-fade-enter-active').count(), 0, 'unchanged watch preview stays still')

  await page.getByRole('button', { name: 'Player', exact: true }).click()
  await page.waitForTimeout(100)
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.waitForTimeout(1000)
  assert.ok(await page.locator('.showcase__mosaic .screen__capture').evaluateAll(images => images.length === 3 && images.every(image => image.src.includes('home'))), 'a late decode must not restore an abandoned view')
  for (const view of ['Player', 'Library', 'Home']) {
    await page.getByRole('button', { name: view, exact: true }).click()
    assert.equal(await page.getByRole('button', { name: view, exact: true }).getAttribute('aria-pressed'), 'true')
    await page.waitForFunction(view => [...document.querySelectorAll('.showcase__mosaic .screen--ios .screen__capture')].some(image => image.src.includes(view) && Number(getComputedStyle(image).opacity) > 0 && Number(getComputedStyle(image).opacity) < 1), view.toLowerCase())
    await page.waitForTimeout(350)
    assert.deepEqual(await page.locator('.showcase__mosaic').boundingBox(), mosaic, 'screen fades must not move the mosaic')
  }
  console.log('PASS screen crossfades, slow loading, rapid switching and stable layout')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Player', exact: true }).click()
  await page.waitForFunction(() => [...document.querySelectorAll('.showcase__mosaic .screen__capture')].every(image => image.src.includes('player')))
  assert.equal(await page.locator('.showcase__mosaic .screen-fade-enter-active').count(), 0, 'reduced motion skips screen fades')
  await page.getByRole('button', { name: 'Enlarge Android app preview' }).click()
  await page.waitForTimeout(50)
  assert.equal(await page.locator('.preview-dialog').evaluate(element => element.getAnimations({ subtree: true }).length), 0)
  assert.match(await page.locator('.preview-dialog__screen img').getAttribute('src'), /folded-player/)
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Enlarge Wear OS app preview' }).focus()
  await page.keyboard.press('Enter')
  assert.ok(await page.locator('.preview-dialog__screen--watch .watch-preview').isVisible())
  assert.match(await page.locator('.preview-tile--wear').innerText(), /Illustrative player preview/)
  await page.keyboard.press('Escape')
  assert.deepEqual(errors, [])
  console.log('PASS borderless surfaces, reduced motion, keyboard access and labeled illustrated watch')
} finally {
  await browser.close()
}
