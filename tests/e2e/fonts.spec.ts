import { expect, test } from '@playwright/test';

/**
 * Armenian has to render in a face that covers Armenian, everywhere, not just
 * in headings.
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
 *
 * **What counts as an Armenian family.** This used to be `/Armenian/i` against
 * the family name, which worked only because the families were called "Noto
 * Sans Armenian" and "Noto Serif Armenian". It is a coincidence of naming, not
 * a property, and it broke the moment the site adopted Mardoto — a face drawn
 * for Armenian, named the way Armenian typefaces are named rather than after
 * the script. The suite went red reporting `Lato, Mardoto, … — no Armenian
 * family in the stack`, which is the exact opposite of the truth.
 *
 * A family covers Armenian when its `@font-face` says so. That is what the
 * browser itself uses to decide, it is what makes the glyph draw, and it cannot
 * be broken by renaming anything.
 */

/** Ա — enough to tell whether a declared range reaches the Armenian block. */
const ARMENIAN_SAMPLE = 0x531;

/**
 * The families whose `@font-face` declares coverage of Armenian, read from the
 * page rather than listed here so that swapping the face needs no edit.
 */
const armenianFamilies = async (page: import('@playwright/test').Page) =>
  page.evaluate((sample) => {
    const covers = (range: string) =>
      range.split(',').some((part) => {
        const match = part.trim().match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
        if (!match) return false;
        const low = Number.parseInt(match[1], 16);
        const high = match[2] ? Number.parseInt(match[2], 16) : low;
        return low <= sample && sample <= high;
      });

    return [
      ...new Set(
        [...document.fonts]
          .filter((face) => covers(face.unicodeRange))
          .map((face) => face.family.replace(/^["']|["']$/g, '')),
      ),
    ];
  }, ARMENIAN_SAMPLE);

/** The families a computed stack names, in order, unquoted. */
const stackOf = (family: string) =>
  family.split(',').map((one) => one.trim().replace(/^["']|["']$/g, ''));

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

test('the site ships a face that covers Armenian, and every token names it', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  const covering = await armenianFamilies(page);

  // Declared, not loaded. A face with a `unicode-range` only downloads when the
  // page actually contains glyphs in that range, and today the only Armenian on
  // the site is the switcher's endonym. Asserting `loaded` here would go red the
  // day that string moves — a failure with no defect behind it.
  expect(covering, 'no @font-face on this site declares Armenian coverage').not.toEqual([]);

  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return ['--font-display', '--font-sans', '--font-mono'].map((token) => ({
      token,
      value: root.getPropertyValue(token),
    }));
  });

  const forgetful = tokens
    .filter(({ value }) => !stackOf(value).some((family) => covering.includes(family)))
    .map(({ token, value }) => `${token}: ${value.trim()}`);

  expect(
    forgetful,
    `these stacks name no family that covers Armenian, so Armenian renders as boxes wherever they are used. Covering: ${covering.join(', ')}`,
  ).toEqual([]);
});

for (const { route, selector, what } of SAMPLES) {
  test(`${what} can render Armenian`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const covering = await armenianFamilies(page);
    const family = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? getComputedStyle(element).fontFamily : null;
    }, selector);

    expect(family, `no element matched ${selector} on ${route}`).not.toBeNull();
    expect(
      stackOf(family as string).some((one) => covering.includes(one)),
      `${what} resolves to ${family} — nothing in that stack covers Armenian, so Armenian renders as boxes here. Covering: ${covering.join(', ')}`,
    ).toBe(true);
  });
}
