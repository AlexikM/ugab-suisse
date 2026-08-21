import { expect, test } from '@playwright/test';

/**
 * The trilingual promise, checked where it actually lives — in a browser.
 *
 * Three things can go wrong and none of them are visible in the build output:
 * the switcher can drop you on the home page instead of the page you were
 * reading, a page can serve French while claiming to be Armenian, and the
 * fallback can happen silently. The first wastes a visitor's time; the other
 * two mislead them.
 */

const DEEP_PAGE = './a-propos/';

test('switching language keeps you on the page you were reading', async ({ page }) => {
  await page.goto(DEEP_PAGE);

  await page
    .getByRole('link', { name: /English/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/a-propos\/?$/);

  // And back again, because a one-way switcher is a half-working one.
  await page
    .getByRole('link', { name: /Français/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/a-propos\/?$/);
});

test('every locale declares the language it is actually written in', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.goto('./en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  // Armenian has no translations yet (#9), so the page serves French — and the
  // lang attribute must say French, not Armenian. Claiming `hy` here would make
  // a screen reader read French words with Armenian pronunciation rules.
  await page.goto('./hy/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('a page that falls back says so, and offers the language it is really in', async ({
  page,
}) => {
  await page.goto('./hy/');

  // Targeted by the attribute the component declares for exactly this purpose,
  // rather than by its markup, which is free to change.
  const notice = page.locator('[data-language-fallback="hy"]');
  await expect(notice).toBeVisible();

  // The notice is useless if it does not lead anywhere.
  const wayOut = notice.getByRole('link');
  await expect(wayOut).toBeVisible();
  await expect(wayOut).not.toHaveAttribute('href', /\/hy\//);
});

test('the Armenian route exists for every page, even while it falls back', async ({ page }) => {
  for (const route of [
    './hy/',
    './hy/a-propos/',
    './hy/evenements/',
    './hy/don/',
    './hy/contact/',
    // The legal pages too, since they stopped being French-only. An Armenian
    // reader following the footer must land somewhere, and be told what they
    // landed on.
    './hy/mentions-legales/',
    './hy/confidentialite/',
    './hy/accessibilite/',
  ]) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} should be reachable`).toBe(true);
  }
});

test('the donate call to action is reachable from every page', async ({ page }) => {
  for (const route of ['./', './a-propos/', './evenements/', './contact/']) {
    await page.goto(route);
    const donate = page
      .getByRole('navigation')
      .getByRole('link', { name: /faire un don|donate/i })
      .first();
    await expect(donate, `${route} should offer the donate CTA`).toBeVisible();
  }
});
