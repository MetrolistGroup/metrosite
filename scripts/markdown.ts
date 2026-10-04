import { DOWNLOAD_PLATFORMS } from '../src/content/downloads'
import { FAQ_ITEMS } from '../src/content/faq'
import { FEATURES } from '../src/content/features'
import { PAGE_META, SITE_URL } from '../src/content/site'

const REPO = 'https://github.com/MetrolistGroup/Metrolist'

// ponytail: regex conversion covers the simple markup legal pages use (headings, paragraphs, lists, links, bold); swap for a real parser if templates get nested.
export function htmlToMarkdown(html: string) {
  return html
    .replace(/\s*(<\/?(?:ul|li|section|article|header)\b)/g, '$1')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')
    .replace(/<\/?strong>/g, '**')
    .replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text}\n\n`)
    .replace(/<li>([\s\S]*?)<\/li>/g, '\n- $1')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, '\n\n$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function homeMarkdown() {
  return `# Metrolist

> ${PAGE_META.home.description}

Metrolist is built with Kotlin Multiplatform. Source code: ${REPO} (GPL-3.0).

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

${FAQ_ITEMS.map(({ question, answer }) => `## ${question}\n\n${answer}`).join('\n\n')}
`
}

export function privacyMarkdown(vueSource: string) {
  const template = vueSource.match(/<header class="privacy-page__header">([\s\S]*?)<\/article>/)?.[1]
  if (!template) throw new Error('Privacy policy content was not found')
  return `${htmlToMarkdown(template)}\n`
}

export function llmsTxt() {
  return `# Metrolist

> ${PAGE_META.home.description}

Metrolist is free and open source (GPL-3.0). It is not affiliated with YouTube or Google, and it is not published on the Play Store; official builds come only from GitHub Releases.

## Pages

- [Overview](${SITE_URL}/index.md): features, supported platforms, and install steps
- [FAQ](${SITE_URL}/faq.md): platforms, migration, accounts, safety, updates, and imports
- [Privacy policy](${SITE_URL}/privacy.md): app data, optional Sentry diagnostics, and website hosting

## Project

- [Source code](${REPO})
- [Latest release](${REPO}/releases/latest)
- [Issue tracker](${REPO}/issues)
- [Translations](https://hosted.weblate.org/projects/Metrolist/)
`
}

