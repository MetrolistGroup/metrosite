import { expect, test } from 'bun:test'
import { guidesFeed } from '../scripts/feed'
import { GUIDES, GUIDE_INDEX_META, type Guide } from '../src/content/guides'
import { SITE_URL } from '../src/content/site'

test('RSS lists every guide once with stable canonical URLs and no invented dates', () => {
  const feed = guidesFeed(GUIDES)
  expect(feed).toStartWith('<?xml version="1.0" encoding="UTF-8"?>')
  expect(feed).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
  expect(feed).toContain(`<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />`)
  expect(feed.match(/<item>/g)).toHaveLength(GUIDES.length)
  for (const guide of GUIDES) {
    expect(feed).toContain(`<link>${SITE_URL}/guides/${guide.slug}</link>`)
    expect(feed.split(`<guid isPermaLink="true">${SITE_URL}/guides/${guide.slug}</guid>`)).toHaveLength(2)
  }
  expect(feed).not.toMatch(/pubDate|lastBuildDate|<script|<!\[CDATA\[/)
  expect(guidesFeed([])).not.toContain('<item>')
})

test('RSS escapes XML characters in titles and summaries', () => {
  const guide: Guide = {
    slug: 'fixture', heading: `A & B <tag> "quoted" 'apostrophe' ]]>`, meta: GUIDE_INDEX_META,
    intro: '<script>text & more</script>', sections: [],
  }
  const feed = guidesFeed([guide])
  expect(feed).toContain('<title>A &amp; B &lt;tag&gt; &quot;quoted&quot; &apos;apostrophe&apos; ]]&gt;</title>')
  expect(feed).toContain('<description>&lt;script&gt;text &amp; more&lt;/script&gt;</description>')
  expect(feed).not.toContain(guide.heading)
  expect(feed).not.toContain(guide.intro)
})
