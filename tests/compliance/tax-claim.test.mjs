import assert from 'node:assert/strict';
import { test } from 'node:test';

import { deductibilityClaimsIn } from './lib/tax-claim.mjs';

/**
 * The wordings the tax-deductibility guard answers for, one at a time.
 *
 * `tests/compliance/legal-pages.test.mjs` sweeps the built site and is the
 * assertion that matters: it is what stands between this site and the sentence
 * section A1 of the pre-launch checklist exists to keep off it. But a sweep over
 * pages that do not carry the claim passes whatever the guard is made of. It
 * passed while the guard could not see « déductibilité fiscale », and it passed
 * again while a denial excused anything sharing a sentence with it.
 *
 * Both holes were found by pasting a wording into `donate.lead`, rebuilding, and
 * watching. That worked, and it left nothing behind: the next person to touch
 * these regexes inherits a green suite and no way to tell which wordings it owes
 * its green to. The wordings are here now, so a change that narrows the guard
 * says which sentence it has just let through.
 *
 * Adding to `CAUGHT` is always safe. Moving anything out of it is the deliberate
 * act, and wants the same scrutiny as publishing the claim would.
 */

/** A wording as a visitor would receive it, wrapped in the markup of a page. */
const paragraph = (text) => `<main><p>${text}</p></main>`;

/**
 * Wordings that must be flagged.
 *
 * The French ones matter most: this is a Geneva association writing for Swiss
 * donors, and « déduction fiscale » is how a French speaker says it.
 */
const CAUGHT = [
  [
    'the wording the site actually carried, in donate.tax',
    'Vos dons sont déductibles fiscalement en Suisse.',
  ],
  [
    'the noun, which is the commonest French phrasing',
    'Votre don ouvre droit à une déduction fiscale en Suisse.',
  ],
  [
    'the accented noun that `\\w` could not see',
    'La déductibilité fiscale de votre don est acquise.',
  ],
  ['the other word order', 'Votre don est fiscalement déductible.'],
  ['the adjective alone, with no tax word beside it', 'Votre don est déductible.'],
  ['« fiscal » never appears', 'Votre don est déductible de vos impôts.'],
  ['the verb, and a cantonal tax', 'Vous pouvez déduire ce don de votre impôt cantonal.'],
  ['a different word for the same thing', 'Défiscalisez votre générosité.'],
  ['English, as the /en/ pages would carry it', 'Your gift is tax-deductible in Switzerland.'],
  [
    'English, not saying "deductible" at all',
    'Your gift is eligible for tax relief in Switzerland.',
  ],
  ['English, the words apart', 'Your gift is deductible from your taxes.'],
];

/**
 * The same claim, hidden behind a denial. Each of these was green at some point.
 *
 * A denial governs its own clause. What ends a clause is the comma, not the
 * conjunction — enforcing it on « mais » alone let « et », « car » and a bare
 * comma through, and a person adding the claim back while believing they are
 * being careful reaches for any of the four.
 */
const CAUGHT_BEHIND_A_DENIAL = [
  [
    '« mais »',
    'Le Comité ne fait aucune déclaration sur son statut, mais vos dons restent déductibles fiscalement.',
  ],
  [
    '« et »',
    'Le Comité ne fait aucune déclaration sur son statut et vos dons sont déductibles fiscalement.',
  ],
  [
    '« car »',
    'Le Comité ne fait aucune déclaration, car vos dons sont déductibles fiscalement de toute façon.',
  ],
  [
    'a comma and no conjunction at all',
    'Le Comité ne fait aucune déclaration sur son statut, vos dons sont déductibles fiscalement.',
  ],
];

/**
 * Claims that a denial in a neighbouring block would have excused.
 *
 * `textOf` turns every tag into a space, so a heading runs straight into the
 * paragraph beneath it: the legal notices genuinely read « Statut fiscal Le
 * Comité ne fait … » as one string.
 */
const CAUGHT_ACROSS_BLOCKS = [
  [
    'a heading above a paragraph that denies it',
    '<main><h2>Déductibilité fiscale</h2><p>Le Comité ne fait aucune déclaration sur son statut.</p></main>',
  ],
  [
    'a list item under a paragraph that denies it',
    '<main><p>Le Comité ne fait aucune déclaration sur son statut.</p><ul><li>Dons déductibles fiscalement</li></ul></main>',
  ],
];

/**
 * Wordings that must not be flagged.
 *
 * A guard that cannot be satisfied gets edited until it can, and what gets
 * edited out is the part that was working. These are the sentences the site is
 * entitled to carry.
 */
const ALLOWED = [
  [
    'the French legal notices, which deny the status',
    "Le Comité ne fait à ce jour aucune déclaration publique quant à une reconnaissance d'utilité publique ou à la déductibilité fiscale des dons.",
  ],
  [
    'the English legal notices, which deny it too',
    'The Committee makes no public statement at this time about recognition of public utility or about the tax deductibility of donations.',
  ],
  ['an ordinary sentence about giving', 'Votre don finance les activités du Comité en Suisse.'],
  [
    '« déduire » in the sense of inferring, which is why that verb wants a tax word beside it',
    'On peut en déduire que la soirée a trouvé son public.',
  ],
  ['« déduction » in the same sense', 'Par déduction, le trésorier a retrouvé son erreur.'],
];

const flagged = ([, wording]) =>
  deductibilityClaimsIn(wording.startsWith('<main') ? wording : paragraph(wording)).length > 0;
const label = ([name]) => name;

test('every way of making the claim is caught', () => {
  const missed = [...CAUGHT, ...CAUGHT_BEHIND_A_DENIAL, ...CAUGHT_ACROSS_BLOCKS]
    .filter((wording) => !flagged(wording))
    .map(label);

  assert.deepEqual(
    missed,
    [],
    'The guard reads these wordings as carrying no tax claim:\n  ' +
      `${missed.join('\n  ')}\n` +
      'Each of them tells a donor their gift is deductible. Widen the guard rather ' +
      'than the list.',
  );
});

test('a denial, and prose that is not about tax at all, are left alone', () => {
  const wrongly = ALLOWED.filter(flagged).map(label);

  assert.deepEqual(
    wrongly,
    [],
    'The guard reads these as claims:\n  ' +
      `${wrongly.join('\n  ')}\n` +
      'A guard nobody can satisfy gets loosened until somebody can, and what comes ' +
      'out is the part that worked.',
  );
});
