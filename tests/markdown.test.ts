import { expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { DOWNLOAD_PLATFORMS } from '../src/content/downloads'
import { guideMarkdown, guidesIndexMarkdown, homeMarkdown, llmsTxt, privacyMarkdown } from '../scripts/markdown'
import { GUIDES, GUIDE_COLLECTIONS, GUIDE_DISCLOSURE, GUIDE_INDEX_META, GUIDE_REVIEW_DATE, getRelatedGuides, type Guide } from '../src/content/guides'
import { SITE_URL } from '../src/content/site'

test('converts legal page markup to markdown through post-list content', () => {
  const source = `<header class="privacy-page__header"><h1>T</h1><p>A <a href="https://x.test" target="_blank">link</a> &amp; <strong>bold</strong></p></header><article><ul>
    <li>One</li>
    <li>Two</li>
  </ul><p>After list</p></article>`
  expect(privacyMarkdown(source)).toBe(`# T\n\nA [link](https://x.test) &amp; **bold**\n\n- One\n- Two\n\nAfter list\n\nSource: ${SITE_URL}/privacy\n`)
})

test('preserves literal entities and Markdown punctuation in simple paragraphs', () => {
  const paragraphs = [
    ['Literal &amp;copy; and *required*. &quot;quoted&quot; &#39; &#x3c; &lt;tag&gt; &copy;',
      'Literal &amp;copy; and \\*required\\*\\. &quot;quoted&quot; &#39; &#x3c; &lt;tag&gt; &copy;'],
    ['# heading [label](url) _word_ \\path `code` $& $` $\'',
      '\\# heading \\[label\\]\\(url\\) \\_word\\_ \\\\path \\`code\\` $& $\\` $\''],
    ['1. item', '1\\. item'],
    ['- item', '\\- item'],
    ['---', '\\-\\-\\-'],
  ]
  const source = `<header class="privacy-page__header"><h1>T</h1></header><article>${paragraphs.map(([html]) => `<p>${html}</p>`).join('')}</article>`
  expect(privacyMarkdown(source)).toBe(`# T\n\n${paragraphs.map(([, markdown]) => markdown).join('\n\n')}\n\nSource: ${SITE_URL}/privacy\n`)
})

test('keeps the actual privacy policy after its list through the final contact link', async () => {
  const markdown = privacyMarkdown(await readFile(new URL('../src/views/PrivacyPage.vue', import.meta.url), 'utf8'))
  expect(markdown).toContain('## Website hosting')
  expect(markdown).toContain('## Updates and contact')
  expect(markdown).toContain('(mailto:contact@metrolist.cc)')
  expect(markdown).toEndWith(`Source: ${SITE_URL}/privacy\n`)
  expect(() => privacyMarkdown('<article>Missing header</article>')).toThrow('Privacy policy content was not found')
})

test('guide Markdown preserves headings, separate paragraphs, and escaped source links', () => {
  const guide: Guide = {
    slug: 'fixture', heading: 'A [guide]', meta: GUIDE_INDEX_META, intro: 'Plain introduction',
    sections: [
      { id: 'first', heading: 'First *section*', paragraphs: ['First paragraph', 'Literal <tag> & *text* $& $`'], links: [{ label: 'Source [one] <two>', href: 'https://example.com/a_(b)?x=1&y=<value> space' }] },
      { id: 'second', heading: 'Second section', paragraphs: ['Last paragraph'] },
    ],
  }
  const markdown = guideMarkdown(guide)
  expect(markdown).toStartWith('# A \\[guide\\]\n\nPlain introduction\n\n')
  expect(markdown).toContain('## First \\*section\\*\n\nFirst paragraph\n\nLiteral &lt;tag&gt; &amp; \\*text\\* $&amp; $\\`')
  expect(markdown).toContain('- [Source \\[one\\] &lt;two&gt;](https://example.com/a_%28b%29?x=1&y=%3Cvalue%3E%20space)')
  expect(markdown).toContain('## Second section\n\nLast paragraph')
  expect(markdown).toEndWith(`[All guides](${SITE_URL}/guides)\n`)
})

test('guide discovery and articles reuse shared content, disclosure, and review date', () => {
  const index = guidesIndexMarkdown()
  const llms = llmsTxt()
  // Decode only the escaping used for plain text, leaving Markdown structure intact.
  const plain = (markdown: string) => markdown.replace(/\\([\\`*_[\]{}()#+.!|~-])/g, '$1')
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
  expect(plain(index)).toContain(GUIDE_INDEX_META.description)
  expect(llms).toContain(`(${SITE_URL}/guides.md)`)
  expect(llms).toContain(`(${SITE_URL}/guides)`)
  expect(llms).toContain(`(${SITE_URL}/feed.xml)`)
  expect(index).toContain(`Source: ${SITE_URL}/guides\n`)
  for (const collection of GUIDE_COLLECTIONS) expect(plain(index)).toContain(`## ${collection.heading}`)
  for (const markdown of [index, ...GUIDES.map(guideMarkdown)]) {
    expect(plain(markdown)).toContain(GUIDE_DISCLOSURE)
    expect(markdown).toContain(`Reviewed: ${GUIDE_REVIEW_DATE}`)
  }
  for (const guide of GUIDES) {
    const article = plain(guideMarkdown(guide))
    expect(article).toStartWith(`# ${guide.heading}\n\n${guide.intro}\n\n`)
    expect(article).toContain(`Source: ${SITE_URL}/guides/${guide.slug}\n`)
    for (const related of getRelatedGuides(guide.slug)) {
      expect(article).toContain(`[${related.heading}](${SITE_URL}/guides/${related.slug})`)
    }
    expect(plain(index)).toContain(`[${guide.heading}](${SITE_URL}/guides/${guide.slug})`)
    expect(plain(index)).toContain(guide.meta.description)
    expect(plain(llms)).toContain(`[${guide.heading}](${SITE_URL}/guides/${guide.slug}.md)`)
    for (const section of guide.sections) {
      expect(article).toContain(`## ${section.heading}\n\n${section.paragraphs.join('\n\n')}`)
      for (const link of section.links ?? []) expect(article).toContain(`[${link.label}](`)
    }
  }
})

test('overview keeps reusing shared installation instructions for every platform', () => {
  const markdown = homeMarkdown()
  expect(markdown).toContain(`Source: ${SITE_URL}/\n`)
  for (const platform of DOWNLOAD_PLATFORMS) {
    for (const [index, step] of platform.instructions.entries()) {
      expect(markdown).toContain(`${index + 1}. ${step}`)
    }
  }
})
