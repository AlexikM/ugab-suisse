import { expect, test } from '@playwright/test';

/**
 * The donation and booking surfaces, in a real browser.
 *
 * Three things live here rather than in the build-output tests, because only a
 * browser can answer them:
 *
 * 1. **Degradation.** PRD 5 and PRD 6 both require the page to stay useful when
 *    third-party embeds do not load. The static tests assert the same thing by
 *    stripping embeds from the built HTML; this asserts it by actually refusing
 *    the requests, and separately by switching scripting off altogether. A
 *    corporate proxy, a tracker blocker and a provider having a bad afternoon
 *    all produce one of these two states, and none of them are rare.
 * 2. **The choice doing something.** Nothing processes a donation yet, so the
 *    one thing the amount buttons genuinely do today — filling in the QR-bill —
 *    is worth holding to.
 * 3. **The return addresses resolving.** They are typed into a provider's
 *    dashboard long before anyone tests a payment, and a 404 at that moment is
 *    a donor's last impression of the committee.
 *
 * No event page is exercised here: `src/content/events/` is empty, because the
 * committee has no real event to publish yet and the build refuses invented
 * ones. The equivalent event assertions run against a fixture build instead —
 * see `tests/content/ticketing.test.mjs`.
 */

const DONATION_PAGES = ['./don/', './en/don/', './hy/don/'];

/** Everything that is not this site. What a blocker or a proxy would refuse. */
async function blockThirdParties(page: import('@playwright/test').Page) {
  await page.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url());
    const isThisSite = hostname === 'localhost' || hostname === '127.0.0.1';
    return isThisSite ? route.continue() : route.abort();
  });
}

test.describe('with every third-party request blocked', () => {
  test.beforeEach(async ({ page }) => {
    await blockThirdParties(page);
  });

  for (const route of DONATION_PAGES) {
    test(`${route} still argues, shows the QR-bill and offers a route to a human`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBe(true);

      // The committee's argument — the reason anyone is on this page.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(
        page.getByText(/Depuis plus de 120 ans|For more than 120 years/).first(),
      ).toBeVisible();

      // The way of giving that costs the committee nothing.
      await expect(page.locator('[data-qr-bill]')).toBeVisible();

      // And a person to write to.
      await expect(page.locator('a[href*="/contact"]').first()).toBeVisible();
    });
  }
});

test.describe('with scripting switched off', () => {
  test.use({ javaScriptEnabled: false });

  test('the donation page still presents the amounts and the QR-bill', async ({ page }) => {
    await page.goto('./don/');

    await expect(page.locator('[data-donation-amount="100"]')).toBeAttached();
    await expect(page.locator('[data-donation-frequency="monthly"]')).toBeAttached();
    await expect(page.locator('[data-qr-bill]')).toBeVisible();

    // Without scripting the amount field stays open, which is the normal state
    // of a donation slip anyway: the donor decides.
    await expect(page.locator('[data-qr-bill-state="pending"]')).toBeVisible();
  });
});

test('choosing an amount carries it onto the QR-bill', async ({ page }) => {
  await page.goto('./don/');

  const amount = page.locator('[data-qr-field="amount"]').first();
  await expect(amount).not.toHaveText('100.00');

  // Clicking the impact wording is how a visitor picks an amount: the whole
  // card is the label.
  await page.getByText('Matériel scolaire pour un enfant').click();

  await expect(amount).toHaveText('100.00');
  await expect(page.locator('[data-donation-amount="100"]')).toBeChecked();
});

test('a typed amount wins over a suggestion clicked a moment earlier', async ({ page }) => {
  await page.goto('./don/');

  await page.getByText('Matériel scolaire pour un enfant').click();
  await page.locator('[data-donation-amount-free]').fill('300');

  // Without this, someone who clicks CHF 100 and then types 300 is quietly
  // still giving 100 — the field and the card would disagree in silence.
  await expect(page.locator('[data-qr-field="amount"]').first()).toHaveText('300.00');
  await expect(page.locator('[data-donation-amount="free"]')).toBeChecked();
  await expect(page.locator('[data-donation-amount="100"]')).not.toBeChecked();
});

test('choosing a monthly gift reveals how to set one up by transfer', async ({ page }) => {
  await page.goto('./don/');

  const standingOrder = page.locator('[data-standing-order]');
  // A one-off gift is the default, and the standing-order note is irrelevant to it.
  await expect(standingOrder).toBeHidden();

  await page.getByText('Chaque mois', { exact: true }).click();
  await expect(standingOrder).toBeVisible();
});

test('nothing on the donation page can submit a payment', async ({ page }) => {
  await page.goto('./don/');

  // No account exists (ADR-0001). A control that looked like it took money and
  // did not would be worse than the empty layout this replaced.
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('[type="submit"]')).toHaveCount(0);
  await expect(page.locator('[data-provider-slot="payment"]')).toHaveAttribute(
    'data-provider-state',
    'pending',
  );
});

test('the donate call to action leads to the donation page, not merely exists', async ({
  page,
}) => {
  await page.goto('./a-propos/');

  await page
    .getByRole('navigation')
    .getByRole('link', { name: /faire un don|donate/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/don\/?$/);
  await expect(page.locator('[data-qr-bill]')).toBeVisible();
});

test('the addresses a provider returns a visitor to resolve in every language', async ({
  page,
}) => {
  const returns = [
    { route: './don/merci/', marker: '[data-thanks="donation"]' },
    { route: './en/don/merci/', marker: '[data-thanks="donation"]' },
    { route: './hy/don/merci/', marker: '[data-thanks="donation"]' },
    { route: './evenements/merci/', marker: '[data-thanks="booking"]' },
    { route: './en/evenements/merci/', marker: '[data-thanks="booking"]' },
    { route: './hy/evenements/merci/', marker: '[data-thanks="booking"]' },
  ];

  for (const { route, marker } of returns) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} should be reachable`).toBe(true);
    await expect(page.locator(marker), `${route} should be the confirmation page`).toBeVisible();
  }
});

test('a donor is thanked in the language they were reading', async ({ page }) => {
  await page.goto('./don/merci/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci');

  await page.goto('./en/don/merci/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you');
});
