import { describe, expect, it } from 'vitest';

import { contrastRatio, paletteFrom, ratiosClaimedIn, readStylesheet } from './contrast.js';

/**
 * The contrast the design system promises, checked against the tokens.
 *
 * `src/styles/global.css` prints a ratio beside most of its colours and says
 * they are asserted here. Until now they were not, and the numbers had nothing
 * holding them to the hex codes beside them. That matters beyond tidiness: the
 * accessibility statement tells visitors that text contrast was checked against
 * the brand colours, and `gold` clears AA by 0.41.
 *
 * Two different questions are asked, because they fail differently.
 *
 * 1. **Do the pairs the system promises meet their floor?** A colour nudged by
 *    a hand that did not know is the realistic failure. Axe catches it too, but
 *    only for combinations that appear on a page it visits; this catches it in
 *    the palette, before anybody builds anything with it.
 * 2. **Is every number written in that file true?** A ratio in a comment rots
 *    silently, and a wrong one is worse than none: it is read as evidence.
 */

const css = readStylesheet();
const palette = paletteFrom(css);
const ratio = (a: string, b: string) => contrastRatio(palette[a], palette[b]);

/** WCAG 2.2 AA: body text 4.5:1, the boundary of a control 3:1. */
const AA_TEXT = 4.5;
const CONTROL = 3;

describe('the arithmetic', () => {
  it('is the WCAG definition, on the two cases everybody knows', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#12294d', '#12294d')).toBeCloseTo(1, 5);
  });

  it('does not care which way round the pair is given', () => {
    expect(contrastRatio('#b4121e', '#faf8f4')).toBeCloseTo(contrastRatio('#faf8f4', '#b4121e'), 9);
  });
});

describe('the palette is complete enough to assert against', () => {
  it('declares every token these assertions name', () => {
    const named = [
      'paper',
      'paper-soft',
      'paper-deep',
      'ink',
      'ink-soft',
      'ink-muted',
      'navy',
      'navy-deep',
      'red',
      'red-deep',
      'gold',
      'gold-light',
      'line-strong',
      'white',
    ];

    expect(named.filter((token) => !palette[token])).toEqual([]);
  });
});

describe('text on the light grounds', () => {
  // "Three weights of presence, all AA on paper and paper-soft" — global.css.
  it.each(['ink', 'ink-soft', 'ink-muted'])('%s is AA on paper and on paper-soft', (text) => {
    expect(ratio(text, 'paper')).toBeGreaterThanOrEqual(AA_TEXT);
    expect(ratio(text, 'paper-soft')).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('the muted weight is AA on paper-deep too, which is where the pending chips sit', () => {
    // `bg-paper-deep … text-ink-muted` on the legal pages: the tightest pair the
    // site actually renders, at 4.56. It is pinned because it has no headroom.
    expect(ratio('ink-muted', 'paper-deep')).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(['navy', 'navy-deep', 'red', 'red-deep', 'gold'])('%s is AA on paper', (colour) => {
    expect(ratio(colour, 'paper')).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('gold is promised on paper and nowhere darker', () => {
    // 4.91 on paper, 4.00 on paper-deep. The stylesheet used to call it "dark
    // enough to set text in" without saying on what. Nothing sets gold text
    // today; this is here so that the day something does, the constraint is
    // written down rather than remembered.
    expect(ratio('gold', 'paper')).toBeGreaterThanOrEqual(AA_TEXT);
    expect(ratio('gold', 'paper-deep')).toBeLessThan(AA_TEXT);
  });
});

describe('text on the dark grounds', () => {
  it.each(['white', 'paper', 'paper-deep', 'gold-light'])(
    '%s is AA on ink, navy and navy-deep',
    (text) => {
      for (const ground of ['ink', 'navy', 'navy-deep']) {
        expect(ratio(text, ground), `${text} on ${ground}`).toBeGreaterThanOrEqual(AA_TEXT);
      }
    },
  );
});

describe('the boundary of an interactive control', () => {
  it('meets 3:1 on the grounds controls are drawn on', () => {
    // <DonationChoice>, <SwissQrBill>, <ProviderSlot>: border-line-strong over
    // paper or white. Not paper-deep, where it is 2.84 — no control sits there.
    expect(ratio('line-strong', 'paper')).toBeGreaterThanOrEqual(CONTROL);
    expect(ratio('line-strong', 'white')).toBeGreaterThanOrEqual(CONTROL);
  });
});

describe('the ratios written into the stylesheet', () => {
  /**
   * Known blind spot, stated rather than discovered: this matches a number
   * against *any* pair in the palette, not against the pair the comment is
   * about. A wrong number that happens to equal some other pair's ratio passes.
   * That is not hypothetical — writing these very comments produced a `4.00:1`
   * for line-strong on white, which is really 3.71, and 4.00 is gold on
   * paper-deep. It was caught by hand.
   *
   * Pinning each number to its pair would mean parsing prose that reads
   * "13.65:1 on paper", "17.17:1 with white", "6.89:1 with white on it" — a
   * parser fragile enough to fail on a rewording, which is the failure mode that
   * gets a check deleted. The assertions above pin the pairs that matter; this
   * one catches a number that is no ratio at all.
   */
  it('are each a true ratio between two of its own colours', () => {
    const tokens = Object.values(palette);
    const real = new Set<string>();
    for (const a of tokens) {
      for (const b of tokens) real.add(contrastRatio(a, b).toFixed(2));
    }

    const stale = ratiosClaimedIn(css).filter((claimed) => !real.has(claimed.toFixed(2)));

    expect(
      stale,
      `these ratios are printed in global.css and are not the contrast between any two of its colours: ${stale.join(', ')}`,
    ).toEqual([]);
  });

  it('found ratios to check, so this is not passing on an empty list', () => {
    expect(ratiosClaimedIn(css).length).toBeGreaterThan(5);
  });
});
