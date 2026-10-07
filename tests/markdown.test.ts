import { expect, test } from 'bun:test'
import { privacyMarkdown } from '../scripts/markdown'

test('converts legal page markup to markdown', () => {
  const source = `<header class="privacy-page__header"><h1>T</h1><p>A <a href="https://x.test" target="_blank">link</a> &amp; <strong>bold</strong></p></header><article><ul>
    <li>One</li>
    <li>Two</li>
  </ul></article>`
  expect(privacyMarkdown(source)).toBe('# T\n\nA [link](https://x.test) & **bold**\n\n- One\n- Two\n')
})
