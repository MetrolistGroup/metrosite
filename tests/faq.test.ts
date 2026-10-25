import { expect, test } from 'bun:test'
import { FAQ_ITEMS, FAQ_TOPICS } from '../src/content/faq'
import { HOSTING_NOTICE, SITE_URL } from '../src/content/site'
import { GUIDES } from '../src/content/guides'
import { faqMarkdown } from '../scripts/markdown'

test('FAQ topics and questions are unique, populated, and complete in Markdown', () => {
  const topicIds = FAQ_TOPICS.map(({ id }) => id)
  expect(new Set(topicIds).size).toBe(topicIds.length)
  expect(new Set(FAQ_ITEMS.map(({ question }) => question)).size).toBe(FAQ_ITEMS.length)

  for (const id of topicIds) {
    expect(FAQ_ITEMS.some(item => item.topic === id)).toBe(true)
  }

  const markdown = faqMarkdown()
  for (const item of FAQ_ITEMS) {
    expect(topicIds).toContain(item.topic)
    expect(item.question.trim()).not.toBe('')
    expect(item.answer.trim()).not.toBe('')
    expect(markdown).toContain(`## ${item.question}\n\n${item.answer}`)
  }
})

test('FAQ reading links resolve to actual guides and section anchors', () => {
  const links = FAQ_ITEMS.flatMap(item => item.guide ? [item.guide] : [])
  expect(links.length).toBeGreaterThan(0)
  for (const link of links) {
    const url = new URL(link.href, SITE_URL)
    expect(url.origin).toBe(SITE_URL)
    expect(link.label.trim()).not.toBe('')
    if (url.pathname === '/guides') {
      expect(url.hash).toBe('')
      continue
    }
    const guide = GUIDES.find(item => url.pathname === `/guides/${item.slug}`)
    expect(guide).toBeDefined()
    if (url.hash) expect(guide!.sections.map(section => section.id)).toContain(url.hash.slice(1))
    expect(faqMarkdown()).toContain(`${SITE_URL}${link.href}`)
  }
})

test('homepage answers retain migration, account, and safety qualifications', () => {
  const [platforms, migration, account, safety, hosting] = FAQ_ITEMS
  expect(platforms!.question).toMatch(/platforms/i)
  expect(migration!.question).toMatch(/original Metrolist/)
  expect(account!.question).toMatch(/YouTube Music account/)
  expect(safety!.question).toMatch(/safe to use/)
  expect(hosting!.answer).toBe(`No. ${HOSTING_NOTICE}`)

  expect(migration!.answer).toMatch(/backup.*Android.*first/i)
  expect(migration!.answer).toMatch(/install separately/i)
  expect(migration!.answer).toMatch(/install the KMP app.*restore your backup/i)
  expect(migration!.answer).toMatch(/keep the original until.*checked your library/i)
  expect(account!.answer).toMatch(/without signing in.*Premium/i)
  expect(safety!.answer).toMatch(/does not guarantee/i)
  expect(safety!.answer).toMatch(/own risk/i)

  const backup = FAQ_ITEMS.find(({ question }) => question.includes('move my library'))
  expect(backup?.answer).toMatch(/not downloaded audio/i)
  expect(backup?.answer).toMatch(/replaces.*library/i)
  expect(backup?.answer).toMatch(/credentials.*private/i)
})
