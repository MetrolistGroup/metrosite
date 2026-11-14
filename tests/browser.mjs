import { preview } from 'vite'

const server = await preview({ preview: { host: '127.0.0.1', port: 0 } })

try {
  const url = server.resolvedUrls.local[0]
  for (const file of ['tests/showcase.browser.mjs', 'tests/lyrics.browser.mjs', 'tests/site.browser.mjs']) {
    const test = Bun.spawn(['bun', file, url], { env: process.env, stdout: 'inherit', stderr: 'inherit' })
    if (await test.exited) throw new Error(`${file} failed`)
  }
} finally {
  await server.close()
}
