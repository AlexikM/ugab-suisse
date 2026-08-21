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

import { afterEach, describe, expect, it } from 'vitest';

import { isTranslated, keysFor, resolveLanguage } from '../../src/i18n/fallback';
import { armenian, type UiKey } from '../../src/i18n/ui';

/** Hand the Armenian table exactly the keys a section needs, then undo it. */
const translate = (keys: UiKey[]) => {
  for (const key of keys) armenian[key] = `ARM ${key}`;
};

afterEach(() => {
  for (const key of Object.keys(armenian) as UiKey[]) delete armenian[key];
});

describe('while the committee owes every Armenian string', () => {
  it('serves French and says so, on an ordinary page and on a legal one', () => {
    expect(resolveLanguage('hy', 'home')).toMatchObject({ served: 'fr', fellBack: true });
    expect(resolveLanguage('hy', 'legal')).toMatchObject({ served: 'fr', fellBack: true });
  });
});

describe('a legal page in a language the legal text does not exist in', () => {
  it('keeps falling back even once the interface around it is translated', () => {
    translate(keysFor('legal'));

    // The interface half is satisfied — that is what was just pasted in.
    expect(isTranslated('hy', 'legal')).toBe(false);
    expect(resolveLanguage('hy', 'legal')).toMatchObject({ served: 'fr', fellBack: true });
  });

  it('is the only section that behaves this way', () => {
    // Same keys, a section whose words do live in the interface table: chrome
    // plus `home.*`. Fill both and the home page becomes Armenian, as intended.
    translate([...keysFor('home')]);

    expect(isTranslated('hy', 'home')).toBe(true);
    expect(isTranslated('hy', 'legal')).toBe(false);
  });
});

describe('English', () => {
  it('is a language the legal text exists in, so a legal page is served in it', () => {
    expect(isTranslated('en', 'legal')).toBe(true);
    expect(resolveLanguage('en', 'legal')).toMatchObject({ served: 'en', fellBack: false });
  });
});
