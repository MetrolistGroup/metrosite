import { locales, defaultLocale } from './index';

const localeSet = new Set(locales as unknown as string[]);

export function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;

  const entries = acceptLanguage.split(',').map(entry => {
    const [tag, qPart] = entry.split(';');
    const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1;
    return { tag: tag.trim().toLowerCase(), q };
  });

  entries.sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    const [lang] = tag.split('-');

    if (localeSet.has(tag)) return tag;
    if (localeSet.has(lang)) return lang;

    if (lang === 'pt') return 'pt-BR';
  }

  return defaultLocale;
}
