import { expect, test } from 'bun:test'
import { FAQ_ITEMS, FAQ_TOPICS } from '../src/content/faq'
import { HOSTING_NOTICE } from '../src/content/site'
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
