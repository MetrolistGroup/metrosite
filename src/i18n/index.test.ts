import { describe, it, expect } from 'vitest';
import { t, defaultLocale } from './index';

describe('t()', () => {
  it('returns the translated string for an existing key', () => {
    expect(t('es', 'nav.home')).toBe('Inicio');
  });

  it('falls back to English when key is missing from locale', () => {
    const englishValue = t('en', 'nav.faq');
    const spanishValue = t('es', 'nav.faq');
    expect(spanishValue).toBe(englishValue);
  });

  it('returns the key when missing from both locale and English', () => {
    expect(t('en', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('falls back to English for unknown locales', () => {
    const result = t('xx' as string, 'nav.home');
    expect(result).toBe(t(defaultLocale, 'nav.home'));
  });

  it('returns the key for unknown locale with missing key', () => {
    expect(t('xx' as string, 'nothing.here')).toBe('nothing.here');
  });
});
