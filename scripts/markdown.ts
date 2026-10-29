import { DOWNLOAD_PLATFORMS } from '../src/content/downloads'
import { FAQ_ITEMS } from '../src/content/faq'
import { FEATURES } from '../src/content/features'
import { GUIDES, GUIDE_COLLECTIONS, GUIDE_DISCLOSURE, GUIDE_INDEX_META, GUIDE_REVIEW_DATE, getRelatedGuides, type Guide } from '../src/content/guides'
import { HOSTING_NOTICE, PAGE_META, REPO_URL as REPO, SITE_URL } from '../src/content/site'

// shortcut: conversion covers simple legal markup (headings, paragraphs, lists, links, bold); use a parser if templates get nested.
export function htmlToMarkdown(html: string) {
  return html
    // Keep tags and named/numeric entities separate so they survive text escaping.
    .split(/(<[^>]+>|&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]+);)/gi)
    // Escape literal Markdown punctuation; odd-indexed tags/entities stay intact for later conversion.
    .map((part, index) => index % 2 ? part : part.replace(/[\\`*_[\]{}()#+.!|>~-]/g, '\\$&'))
    .join('')
    // Remove template whitespace before lists and wrappers so it cannot indent Markdown bullets.
    .replace(/\s*(<\/?(?:ul|li|section|article|header)\b)/g, '$1')
    // Keep each anchor's label and href as a Markdown link before stripping HTML tags.
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')
    // Turn <strong> boundaries into Markdown bold markers.
    .replace(/<\/?strong>/g, '**')
    // Preserve h1–h3 levels as # headings, separated from surrounding content.
    .replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text}\n\n`)
    // Put each list item on its own Markdown bullet line.
    .replace(/<li>([\s\S]*?)<\/li>/g, '\n- $1')
    // Separate paragraphs with blank lines so adjacent blocks do not run together.
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, '\n\n$1\n\n')
    // Drop remaining markup after extracting the supported Markdown structure.
    .replace(/<[^>]+>/g, '')
    // Collapse spaces and tabs without losing paragraph or list line breaks.
    .replace(/[ \t]+/g, ' ')
    // Remove spaces around line breaks to avoid accidental indentation or hard breaks.
    .replace(/ *\n */g, '\n')
    // Keep at most one blank line between blocks.
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function homeMarkdown() {
  return `# Metrolist

> ${PAGE_META.home.description}

Metrolist is built with Kotlin Multiplatform. Source code: ${REPO} (GPL-3.0).

Source: ${SITE_URL}/

## Features

${FEATURES.map(feature => `- **${feature.label}:** ${feature.body}`).join('\n')}

## Platforms and installation

Download builds from ${REPO}/releases/latest.

${DOWNLOAD_PLATFORMS.map(platform => `### ${platform.name}

${platform.detail}. Package: ${platform.package}. Architectures: ${platform.architectures.map(({ name }) => name).join(', ')}.

${platform.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}`).join('\n\n')}
`
}

export function faqMarkdown() {
  return `# Metrolist FAQ

Source: ${SITE_URL}/faq

${FAQ_ITEMS.map(({ question, answer, guide }) => `## ${question}\n\n${answer}${guide ? `\n\n${markdownLink(guide.label, `${SITE_URL}${guide.href}`)}` : ''}`).join('\n\n')}
`
}

export function privacyMarkdown(vueSource: string) {
  const template = vueSource.match(/<header class="privacy-page__header">([\s\S]*?)<\/article>/)?.[1]
  if (!template) throw new Error('Privacy policy content was not found')
  return `${htmlToMarkdown(template)}\n\nSource: ${SITE_URL}/privacy\n`
}

const escapeMarkdown = (text: string) => text
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replace(/[\\`*_[\]{}()#+.!|~-]/g, '\\$&')
const markdownLink = (label: string, href: string) => `[${escapeMarkdown(label)}](${href.replace(/[\\\s<>]/g, encodeURIComponent).replaceAll('(', '%28').replaceAll(')', '%29')})`

export function guideMarkdown(guide: Guide) {
  const related = getRelatedGuides(guide.slug)
  return `# ${escapeMarkdown(guide.heading)}

${escapeMarkdown(guide.intro)}

${escapeMarkdown(GUIDE_DISCLOSURE)}

Source: ${SITE_URL}/guides/${guide.slug}
Reviewed: ${GUIDE_REVIEW_DATE}

${guide.sections.map(section => `## ${escapeMarkdown(section.heading)}

${section.paragraphs.map(escapeMarkdown).join('\n\n')}${section.links?.length ? `\n\n${section.links.map(link => `- ${markdownLink(link.label, link.href)}`).join('\n')}` : ''}`).join('\n\n')}

${related.length ? `## Related guides\n\n${related.map(item => `- ${markdownLink(item.heading, `${SITE_URL}/guides/${item.slug}`)}`).join('\n')}\n\n` : ''}${markdownLink('All guides', `${SITE_URL}/guides`)}
`
}

export function guidesIndexMarkdown() {
  return `# YouTube Music app guides

${escapeMarkdown(GUIDE_INDEX_META.description)}

${escapeMarkdown(GUIDE_DISCLOSURE)}

Source: ${SITE_URL}/guides
Reviewed: ${GUIDE_REVIEW_DATE}

${GUIDE_COLLECTIONS.map(collection => `## ${escapeMarkdown(collection.heading)}\n\n${collection.guides.map(guide => `### ${markdownLink(guide.heading, `${SITE_URL}/guides/${guide.slug}`)}\n\n${escapeMarkdown(guide.meta.description)}`).join('\n\n')}`).join('\n\n')}
`
}

export function llmsTxt() {
  return `# Metrolist

> ${PAGE_META.home.description}

Metrolist is free and open source (GPL-3.0). It is not affiliated with YouTube or Google, and it is not published on the Play Store; official builds come only from GitHub Releases.

${HOSTING_NOTICE}

Each Markdown page names its canonical HTML source.

## Pages

- [Overview](${SITE_URL}/index.md): features, supported platforms, and install steps
- [FAQ](${SITE_URL}/faq.md): platforms, migration, accounts, safety, updates, and imports
- [Privacy policy](${SITE_URL}/privacy.md): app data, optional Sentry diagnostics, and website hosting
- [Guides](${SITE_URL}/guides.md): ${markdownLink('HTML topic index', `${SITE_URL}/guides`)} for comparisons, installation, library, and playback
${GUIDES.map(guide => `- ${markdownLink(guide.heading, `${SITE_URL}/guides/${guide.slug}.md`)}: ${escapeMarkdown(guide.meta.description)}`).join('\n')}
- [Guide feed](${SITE_URL}/feed.xml): RSS links and summaries for every guide
- [Everything in one file](${SITE_URL}/llms-full.txt): HTML page text

## Project

- [Source code](${REPO})
- [Latest release](${REPO}/releases/latest)
- [Issue tracker](${REPO}/issues)
- [Translations](https://hosted.weblate.org/projects/Metrolist/)
`
}

