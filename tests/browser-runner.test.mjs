import { expect, spyOn, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

for (const failure of [false, true]) {
  test(`browser runner owns its URL and closes after suite ${failure ? 'failure' : 'success'}`, async () => {
    const cwd = process.cwd()
    const root = mkdtempSync(join(tmpdir(), 'metrosite-runner-'))
    const playwright = process.env.PLAYWRIGHT_MODULE
    const files = []
    let url
    let completed = 0
    mkdirSync(join(root, 'dist'))
    writeFileSync(join(root, 'dist/index.html'), 'owned preview fixture')
    process.chdir(root)
    process.env.PLAYWRIGHT_MODULE = '/external/playwright/index.mjs'
    const spawn = spyOn(Bun, 'spawn').mockImplementation((args, options) => {
      expect(args[0]).toBe('bun')
      expect(files.length).toBe(completed)
      expect(options.env.PLAYWRIGHT_MODULE).toBe('/external/playwright/index.mjs')
      if (url) expect(args[2]).toBe(url)
      url = args[2]
      expect(new URL(url).hostname).toBe('127.0.0.1')
      expect(Number(new URL(url).port)).toBeGreaterThan(0)
      files.push(args[1])
      return {
        exited: (async () => {
          const response = await fetch(url, { keepalive: false })
          expect(await response.text()).toBe('owned preview fixture')
          completed++
          return failure ? 1 : 0
        })(),
      }
    })

    try {
      const run = import(`./browser.mjs?failure=${failure}`)
      if (failure) await expect(run).rejects.toThrow('tests/showcase.browser.mjs failed')
      else await run
      expect(files).toEqual(failure ? ['tests/showcase.browser.mjs'] : [
        'tests/showcase.browser.mjs', 'tests/lyrics.browser.mjs', 'tests/site.browser.mjs',
      ])
      await expect(fetch(url, { keepalive: false })).rejects.toThrow()
    } finally {
      spawn.mockRestore()
      process.chdir(cwd)
      if (playwright === undefined) delete process.env.PLAYWRIGHT_MODULE
      else process.env.PLAYWRIGHT_MODULE = playwright
      rmSync(root, { recursive: true, force: true })
    }
  })
}
