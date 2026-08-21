import { describe, expect, it } from 'vitest';

import { findTokenViolations, readComponents } from './design-tokens.js';

/**
 * The design system is a closed vocabulary.
 *
 * `src/styles/global.css` declares every colour, size and rhythm the site may
 * use, and says a raw `#1a2b3c` or a `bg-blue-600` in a component "is a defect
 * — tests/build/design-tokens.test.ts fails the build on one". That file did
 * not exist, so the rule was a comment rather than a rule.
 *
 * Both halves matter for the same reason and fail differently:
 *
 * - A **raw hex** works. It renders, it looks fine, and it is one more colour
 *   nobody can find when the committee's palette is corrected.
 * - A **Tailwind palette class** does not work at all. Tailwind's own colours
 *   are switched off (`--color-*: initial`), so `bg-blue-600` produces no CSS:
 *   the class sits in the markup doing nothing, and the element is transparent.
 *   Nothing in the built output records that it was ever asked for.
 *
 * Which is why this one test reads source rather than `dist/`.
 */

describe('findTokenViolations', () => {
  const file = (contents: string) => [{ path: 'src/components/X.astro', contents }];

  it('reports a raw colour, in markup or in a style attribute', () => {
    expect(findTokenViolations(file('<div style="color:#12294d">'))).toEqual([
      { file: 'src/components/X.astro', value: '#12294d', reason: 'raw-colour' },
    ]);
    expect(findTokenViolations(file('<p>#fff</p>')).map((v) => v.value)).toEqual(['#fff']);
  });

  it('reports a Tailwind palette class, which silently does nothing here', () => {
    expect(
      findTokenViolations(file('<div class="bg-blue-600 text-slate-50">')).map((v) => v.value),
    ).toEqual(['bg-blue-600', 'text-slate-50']);
  });

  it('leaves this project’s own tokens alone', () => {
    // Ours carry no digits: that is what tells them apart from Tailwind's.
    const ours = '<a class="bg-red text-gold-light border-line-strong py-section text-display-lg">';

    expect(findTokenViolations(file(ours))).toEqual([]);
  });

  it('does not mistake a fragment or a size for a colour', () => {
    expect(
      findTokenViolations(file('<a href="#contenu" class="md:grid-cols-4 lg:col-span-8">')),
    ).toEqual([]);
  });
});

describe('the components as written', () => {
  const components = readComponents();

  it('found components to read, so this is not passing on an empty list', () => {
    expect(components.length).toBeGreaterThan(10);
  });

  it('name tokens, never values', () => {
    const violations = findTokenViolations(components).map(
      ({ file, value, reason }) => `${file}: ${value} (${reason})`,
    );

    expect(
      violations,
      `these leave the design system:\n  ${violations.join('\n  ')}\n` +
        'Declare the colour in src/styles/global.css and name the token.',
    ).toEqual([]);
  });
});
