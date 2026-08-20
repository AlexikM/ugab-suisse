import { expect, test } from '@playwright/test';

// Deliberately shallow: this proves the harness works — it builds, serves and
// drives the real site — and nothing more. The trilingual, accessibility and
// donate-button assertions belong to the lanes that own those behaviours, and
// go in files beside this one.

test('the home page is served in French, and says so', async ({ page }) => {
  const response = await page.goto('./');

  expect(response?.ok()).toBe(true);
  // French is the default locale and is served unprefixed, so the home page
  // must declare it — a screen reader pronounces the page by this attribute.
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
