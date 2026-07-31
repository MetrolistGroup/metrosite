import { test, expect } from '@playwright/test';

test.describe('Metrosite Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Metrolist/);
    await expect(page.locator('h1').first()).toContainText('Metrolist');
  });

  test('should navigate to download page', async ({ page }) => {
    await page.goto('/');
    await page.locator('header a[href*="/download"]').first().click();
    await expect(page).toHaveURL(/\/download/, { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('Metrolist');
  });

  test('should navigate to info page', async ({ page }) => {
    await page.goto('/');
    await page.locator('header a[href*="/info"]').first().click();
    await expect(page).toHaveURL(/\/info/, { timeout: 15000 });
    await expect(page.locator('h1').first()).toContainText('Metrolist');
  });

  test('root serves the site directly without a locale redirect', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('http://localhost:4321/');
    await expect(page).toHaveTitle(/Metrolist/);
  });

	test('search should work', async ({ page }) => {
		await page.goto('/');
		await page.click('button[aria-label="Search"]');
		const searchInput = page.locator('#search-input');
		await expect(searchInput).toBeVisible();

		await searchInput.fill('Metrolist');

		const results = page.locator('.search-result-item');
		await expect(results.first()).toBeVisible();
		await expect(results.first()).toContainText('Metrolist');
	});
});
