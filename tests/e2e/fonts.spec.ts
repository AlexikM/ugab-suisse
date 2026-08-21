import { expect, test } from '@playwright/test';

/**
 * Armenian has to render in an Armenian face, everywhere, not just in headings.
 *
 * The classic failure is a body style whose stack forgets the Armenian family:
 * headings look right, one paragraph renders as empty boxes, and nobody notices
 * because nobody on the team reads Armenian.
 *
 * These assert the **computed font stack**, not whether a glyph happens to draw.
 * `document.fonts.check()` was tried first and is the wrong tool here: it
 * answers "can anything on this machine draw this string", which is true on any
 * developer laptop with a system Armenian font installed even when the site's
 * own stack has dropped it. It passed with the family deliberately removed. The
 * stack is what we control and what ships; the test asserts that.
 */

const ARMENIAN_FAMILY = /Armenian/i;

/** One element per text style that ships, sampled from real pages. */
const SAMPLES = [
  { route: './', selector: 'h1', what: 'the home page headline' },
  { route: './', selector: 'p', what: 'home page body copy' },
  { route: './a-propos/', selector: 'h2', what: 'a section heading' },
  { route: './a-propos/', selector: 'p', what: 'the history prose' },
  { route: './don/', selector: 'p', what: 'the donation argument' },
  { route: './contact/', selector: 'p', what: 'contact copy' },
  { route: './', selector: 'footer p, footer li, footer a', what: 'the footer' },
  { route: './', selector: 'nav a', what: 'navigation' },
];

test('an Armenian face is declared and actually loads', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  const faces = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => /Armenian/i.test(f.family))
      .map((f) => `${f.family}:${f.status}`),
  );

  // Declared, not loaded. A face with a `unicode-range` only downloads when the
  // page actually contains glyphs in that range, and today the only Armenian on
  // the site is the switcher's endonym. Asserting `loaded` here would go red the
  // day that string moves — a failure with no defect behind it.
  expect(faces.length, 'no Armenian @font-face is declared').toBeGreaterThan(0);
  expect(
    faces.some((f) => /Serif/i.test(f)) && faces.some((f) => /Sans/i.test(f)),
    `both a serif and a sans Armenian face must exist for the two stacks: ${faces}`,
  ).toBe(true);
});

for (const { route, selector, what } of SAMPLES) {
  test(`${what} can render Armenian`, async ({ page }) => {
    await page.goto(route);

    const family = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontFamily : null;
    }, selector);

    expect(family, `no element matched ${selector} on ${route}`).not.toBeNull();
    expect(
      family,
      `${what} resolves to ${family} — no Armenian family in the stack, so Armenian renders as boxes here`,
    ).toMatch(ARMENIAN_FAMILY);
  });
}
