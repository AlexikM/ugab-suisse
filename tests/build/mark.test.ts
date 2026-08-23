import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * The association's mark is drawn twice, and the two copies have to agree.
 *
 * `public/favicon.svg` is a static file — served as it is, never imported —
 * so a component cannot reach for it. `src/components/EventCover.astro` draws
 * the same U as the stand-in for an event photograph the Comité has not sent.
 * Two hand-written copies of one path is exactly the arrangement that drifts:
 * somebody adjusts the mark in the file they happened to open, the other keeps
 * the old shape, and nothing anywhere says so — the tab and the card simply
 * stop being the same organisation.
 *
 * The component says in a comment that this test exists. It does.
 *
 * Only the geometry is compared. The colour deliberately differs: the favicon
 * is the brand blue on white, and the card's stand-in is a quiet tint of the
 * navy token behind the text, which is a presentational choice per site and not
 * a property of the mark.
 */

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8');

/** The `d` and `stroke-width` of the single path each file draws. */
function markOf(source: string, what: string) {
  const d = /\bd="([^"]+)"/.exec(source)?.[1];
  const width = /stroke-width="([^"]+)"/.exec(source)?.[1];

  expect(d, `${what} draws no path`).toBeTruthy();
  expect(width, `${what} declares no stroke width`).toBeTruthy();
  return { d: d?.replace(/\s+/g, ' ').trim(), width };
}

describe('the UGAB mark', () => {
  it('is the same shape in the tab and on a card without a photograph', () => {
    const favicon = markOf(read('public/favicon.svg'), 'public/favicon.svg');
    const card = markOf(read('src/components/EventCover.astro'), 'EventCover.astro');

    expect(card).toEqual(favicon);
  });

  it('is drawn on the viewBox it was measured against', () => {
    for (const path of ['public/favicon.svg', 'src/components/EventCover.astro']) {
      expect(read(path), `${path} moved off the 256px canvas`).toMatch(/viewBox="0 0 256 256"/);
    }
  });
});
