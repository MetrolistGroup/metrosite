import { test, expect } from '@playwright/test';

const locales = ['en', 'es', 'ar', 'de', 'fr', 'hi', 'id', 'pl', 'pt-BR'] as const;

const cookieFor = (locale: string) => ({
  name: 'locale',
  value: locale,
  url: 'http://localhost:4321',
});

test.describe('i18n — cookie-based locale', () => {
  test('default locale is English without a cookie', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Get the App')).toBeVisible();
  });

  test('locale cookie serves translated UI', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([cookieFor('es')]);
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByText('Obtener la App')).toBeVisible();
    await context.close();
  });

  test('Accept-Language fallback without a cookie', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await context.close();
  });

  test('Arabic renders right-to-left', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([cookieFor('ar')]);
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await context.close();
  });

  test('switching locale via ?lang= sets cookie and preserves path', async ({ page }) => {
    await page.goto('/download');
    await page.locator('#locale-toggle').click();
    await page.locator('#locale-menu .locale-menu-item[href*="lang=es"]').click();
    await expect(page).toHaveURL('http://localhost:4321/download');
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'locale');
    expect(localeCookie?.value).toBe('es');
    await expect(page.getByText('Versión de Desarrollo')).toBeVisible();
  });

  test('all locales render via cookie', async ({ browser }) => {
    test.setTimeout(60000);
    for (const locale of locales) {
      const context = await browser.newContext();
      await context.addCookies([cookieFor(locale)]);
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('h1').first()).toContainText('Metrolist');
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await context.close();
    }
  });

  test('download page loads in selected locale', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([cookieFor('es')]);
    const page = await context.newPage();
    await page.goto('/download');
    await expect(page.getByText('Versión de Desarrollo')).toBeVisible();
    await context.close();
  });

  test('old /<locale>/ URL redirects to clean URL and preserves language', async ({ page }) => {
    const response = await page.goto('/es/download');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('http://localhost:4321/download');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('404 page shows translated text', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([cookieFor('es')]);
    const page = await context.newPage();
    await page.goto('/nonexistent');
    await expect(page.getByText('Página no encontrada')).toBeVisible();
    await expect(page.getByText('Ir al Inicio')).toBeVisible();
    await context.close();
  });

  test('sitemap.xml is served without locale prefixes', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const text = (await response?.text()) ?? '';
    expect(text).toContain('<loc>https://metrolist.cc/</loc>');
    expect(text).toContain('<loc>https://metrolist.cc/download/</loc>');
    expect(text).not.toContain('/en/');
    expect(text).not.toContain('hreflang');
  });
});
