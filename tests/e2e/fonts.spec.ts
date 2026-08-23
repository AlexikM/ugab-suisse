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

/**
 * Every Armenian family the stacks name has an `@font-face` behind it.
 *
 * This used to assert that one serif and one sans Armenian face existed,
 * because the stacks were a serif display and a sans body. That is a fact about
 * one arrangement, not about the rule, and it went red the day the display face
 * stopped being a serif — with nothing wrong. The rule is that a stack must not
 * name a family the site does not ship: that renders as boxes exactly as
 * forgetting the family altogether does, and it is the harder one to spot
 * because the stack looks right.
 *
 * Read from the custom properties rather than a list here, so a stack that gains
 * a family, loses one or swaps one is checked without this file being touched.
 */
test('every Armenian family the stacks name is declared', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  const { named, declared } = await page.evaluate(() => {
    const unquote = (family: string) => family.trim().replace(/^["']|["']$/g, '');
    const root = getComputedStyle(document.documentElement);
    const named = ['--font-display', '--font-sans', '--font-mono']
      .flatMap((token) => root.getPropertyValue(token).split(','))
      .map(unquote)
      .filter((family) => /Armenian/i.test(family));
    const declared = [...document.fonts]
      .filter((face) => /Armenian/i.test(face.family))
      .map((face) => unquote(face.family));
    return { named: [...new Set(named)], declared: [...new Set(declared)] };
  });

  // Declared, not loaded. A face with a `unicode-range` only downloads when the
  // page actually contains glyphs in that range, and today the only Armenian on
  // the site is the switcher's endonym. Asserting `loaded` here would go red the
  // day that string moves — a failure with no defect behind it.
  expect(named.length, 'no stack names an Armenian family at all').toBeGreaterThan(0);
  expect(
    named.filter((family) => !declared.includes(family)),
    `these stacks name an Armenian family the site does not ship (declared: ${declared.join(', ')})`,
  ).toEqual([]);
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
