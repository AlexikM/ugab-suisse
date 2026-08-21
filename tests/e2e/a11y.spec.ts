import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated accessibility checks, one page per template.
 *
 * Axe catches roughly half of real accessibility problems — the mechanical half:
 * contrast, missing names, broken landmarks, bad heading order. It cannot tell
 * whether the reading order makes sense or whether alt text is meaningful. The
 * manual pass before launch covers that, and is in docs/pre-launch-checklist.md.
 * This is the floor, not the standard.
 */

const PAGES = [
  { route: './', name: 'home' },
  { route: './a-propos/', name: 'about' },
  { route: './evenements/', name: 'events' },
  { route: './don/', name: 'donate and sponsorship' },
  // The two addresses a payment or ticketing provider returns a visitor to.
  // Someone arrives here having just parted with money, or having just been
  // told they have a place: it is the wrong moment to meet a broken page.
  { route: './don/merci/', name: 'donation thank-you' },
  { route: './evenements/merci/', name: 'booking confirmation' },
  { route: './contact/', name: 'contact' },
  { route: './confidentialite/', name: 'privacy policy' },
  { route: './accessibilite/', name: 'accessibility statement' },
  { route: './en/', name: 'home in English' },
  { route: './hy/', name: 'home falling back to French' },
];

for (const { route, name } of PAGES) {
  test(`${name} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // Named in the failure so the report says what is wrong and where, rather
    // than only how many.
    const summary = violations.map(
      (v) =>
        `${v.id} (${v.impact}) on ${v.nodes.length}: ${v.help}\n    ${v.nodes[0]?.target.join(' ')}`,
    );

    expect(summary, `${route}\n  ${summary.join('\n  ')}`).toEqual([]);
  });
}

test('every page can be traversed from the keyboard, starting with a skip link', async ({
  page,
}) => {
  await page.goto('./');

  // The first thing a keyboard user meets should let them past the navigation.
  await page.keyboard.press('Tab');
  const first = page.locator(':focus');
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute('href', /#/);

  await first.press('Enter');
  await expect(page.locator('#main, main')).toBeAttached();
});
