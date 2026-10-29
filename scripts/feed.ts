import { GUIDE_INDEX_META, type Guide } from '../src/content/guides'
import { SITE_URL } from '../src/content/site'

const escapeXml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

export function guidesFeed(guides: readonly Guide[]) {
  // Source review dates are not publication dates, so the feed does not invent timestamps.
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(GUIDE_INDEX_META.title)}</title>
    <link>${SITE_URL}/guides</link>
    <description>${escapeXml(GUIDE_INDEX_META.description)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${guides.map(guide => `    <item>
      <title>${escapeXml(guide.heading)}</title>
      <link>${SITE_URL}/guides/${guide.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/guides/${guide.slug}</guid>
      <description>${escapeXml(guide.intro)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`
}
