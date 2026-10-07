const url = 'http://127.0.0.1:4173/'
const server = Bun.spawn(['bun', 'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  stdout: 'inherit',
  stderr: 'inherit',
})

try {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url)
      if (response.ok) break
    } catch {
      // Retry until Vite is ready.
    }
    if (attempt === 39) throw new Error('Preview server did not start')
    await Bun.sleep(250)
  }

  for (const file of ['tests/showcase.browser.mjs', 'tests/lyrics.browser.mjs', 'tests/site.browser.mjs']) {
    const test = Bun.spawn(['bun', file, url], { env: process.env, stdout: 'inherit', stderr: 'inherit' })
    if (await test.exited) throw new Error(`${file} failed`)
  }
} finally {
  server.kill()
}
