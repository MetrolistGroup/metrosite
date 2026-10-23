import { expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { DOWNLOAD_PLATFORMS } from '../src/content/downloads'
import { homeMarkdown, privacyMarkdown } from '../scripts/markdown'

test('converts legal page markup to markdown through post-list content', () => {
  const source = `<header class="privacy-page__header"><h1>T</h1><p>A <a href="https://x.test" target="_blank">link</a> &amp; <strong>bold</strong></p></header><article><ul>
    <li>One</li>
    <li>Two</li>
  </ul><p>After list</p></article>`
  expect(privacyMarkdown(source)).toBe('# T\n\nA [link](https://x.test) &amp; **bold**\n\n- One\n- Two\n\nAfter list\n')
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
  expect(privacyMarkdown(source)).toBe(`# T\n\n${paragraphs.map(([, markdown]) => markdown).join('\n\n')}\n`)
})

test('keeps the actual privacy policy after its list through the final contact link', async () => {
  const markdown = privacyMarkdown(await readFile(new URL('../src/views/PrivacyPage.vue', import.meta.url), 'utf8'))
  expect(markdown).toContain('## Website hosting')
  expect(markdown).toContain('## Updates and contact')
  expect(markdown).toContain('(mailto:contact@metrolist.cc)')
  expect(() => privacyMarkdown('<article>Missing header</article>')).toThrow('Privacy policy content was not found')
})

test('overview keeps reusing shared installation instructions for every platform', () => {
  const markdown = homeMarkdown()
  for (const platform of DOWNLOAD_PLATFORMS) {
    for (const [index, step] of platform.instructions.entries()) {
      expect(markdown).toContain(`${index + 1}. ${step}`)
    }
  }
})
