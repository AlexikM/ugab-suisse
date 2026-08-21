/**
 * Which language a page is really in — `src/i18n/fallback.ts`.
 *
 * The rule the module exists for is that a page is in a language only when
 * *every* string it renders exists in that language, and otherwise it serves
 * French and says so. That rule is exercised end to end by the browser tests;
 * what is asserted here is the one case a build cannot show today.
 *
 * The legal pages take their words from `src/i18n/legal.ts`, which is written in
 * French and English only — the Armenian translations are owed (#9). The
 * interface strings are a separate table. The day the committee delivers
 * Armenian for the interface and not for the legal pages, the two would disagree,
 * and a legal page would be served with Armenian chrome around French legal
 * text. Nothing in the built site can demonstrate that yet, because Armenian is
 * empty and everything falls back for the ordinary reason.
 *
 * So it is demonstrated here, by filling the table in and putting it back.
 */

import { describe, expect, it } from 'vitest';

import { isTranslated, keysFor, resolveLanguage } from '../../src/i18n/fallback';
import { armenian, type UiKey } from '../../src/i18n/ui';

/**
 * Hand the Armenian table exactly the keys a section needs, ask it one
 * question, and give the table back as it was found.
 *
 * `armenian` is the live table from `src/i18n/ui.ts` and not a copy, which is
 * the point: what is under test is how `fallback.ts` reads the real thing. It
 * used to be given back by emptying it — `afterEach` deleted every key, not the
 * ones a test had added. That is the same thing only while the table is empty.
 *
 * The day the committee delivers the first Armenian string (#9) it stops being
 * the same thing twice over: their work is deleted for the rest of this file,
 * and the assertion below that Armenian falls back starts passing because the
 * table was wiped rather than because Armenian is owed. A test that passes for
 * the wrong reason is the failure this suite exists to catch elsewhere.
 */
const borrowingArmenian = <T>(keys: UiKey[], ask: () => T): T => {
  const asFound = { ...armenian };
  for (const key of keys) armenian[key] = `ARM ${key}`;
  try {
    return ask();
  } finally {
    for (const key of Object.keys(armenian) as UiKey[]) delete armenian[key];
    Object.assign(armenian, asFound);
  }
};

describe('while the committee owes every Armenian string', () => {
  it('serves French and says so, on an ordinary page and on a legal one', () => {
    expect(resolveLanguage('hy', 'home')).toMatchObject({ served: 'fr', fellBack: true });
    expect(resolveLanguage('hy', 'legal')).toMatchObject({ served: 'fr', fellBack: true });
  });
});

describe('a legal page in a language the legal text does not exist in', () => {
  it('keeps falling back even once the interface around it is translated', () => {
    borrowingArmenian(keysFor('legal'), () => {
      // The interface half is satisfied — that is what was just pasted in.
      expect(isTranslated('hy', 'legal')).toBe(false);
      expect(resolveLanguage('hy', 'legal')).toMatchObject({ served: 'fr', fellBack: true });
    });
  });

  it('is the only section that behaves this way', () => {
    // Same keys, a section whose words do live in the interface table: chrome
    // plus `home.*`. Fill both and the home page becomes Armenian, as intended.
    borrowingArmenian(keysFor('home'), () => {
      expect(isTranslated('hy', 'home')).toBe(true);
      expect(isTranslated('hy', 'legal')).toBe(false);
    });
  });
});

describe('English', () => {
  it('is a language the legal text exists in, so a legal page is served in it', () => {
    expect(isTranslated('en', 'legal')).toBe(true);
    expect(resolveLanguage('en', 'legal')).toMatchObject({ served: 'en', fellBack: false });
  });
});

describe('the table these tests borrow', () => {
  it('is given back exactly as it was found, delivered strings and all', () => {
    // The day the committee delivers Armenian, this key arrives with a real
    // word in it and every test in this file runs against a table that is no
    // longer empty. Borrowing must survive that, including for a key it
    // overwrites while it works.
    const [delivered] = keysFor('home');
    armenian[delivered] = 'ARM livré par le Comité';
    const asFound = { ...armenian };

    try {
      borrowingArmenian(keysFor('home'), () => undefined);

      expect(armenian).toEqual(asFound);
    } finally {
      delete armenian[delivered];
    }
  });
});
