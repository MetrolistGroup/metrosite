import { de } from './de';
import { en } from './en';
import { es } from './es';
import { hi } from './hi';
import { id } from './id';
import { ar } from './ar';
import { ptBR } from './pt-BR';
import { pl } from './pl';
import { fr } from './fr';

export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar', 'de', 'fr', 'hi', 'id', 'pl', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  de: 'Deutsch',
  fr: 'Français',
  hi: 'हिन्दी',
  id: 'Indonesia',
  pl: 'Polski',
  'pt-BR': 'Português (Brasil)',
};

export const localeDir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  ar: 'rtl',
  de: 'ltr',
  fr: 'ltr',
  hi: 'ltr',
  id: 'ltr',
  pl: 'ltr',
  'pt-BR': 'ltr',
};

const translations: Record<string, Record<string, string>> = { en, es, ar, de, fr, hi, id, pl, 'pt-BR': ptBR };

export function t(locale: string, key: string): string {
  const dict = translations[locale];
  if (!dict) return en[key as keyof typeof en] ?? key;
  return dict[key] ?? en[key as keyof typeof en] ?? key;
}

