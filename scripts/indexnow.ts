// Run after a deploy: tells IndexNow engines (Bing, Yandex, Seznam, Naver) to recrawl every sitemap URL.
import { readFile } from 'node:fs/promises'
import { SITE_URL } from '../src/content/site'

const KEY = 'a8e9eafaa685c358eb3f1a44aeae837f'
const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]!)
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
})
console.log(`IndexNow: ${response.status} for ${urlList.length} URLs`)
if (!response.ok) process.exit(1)
