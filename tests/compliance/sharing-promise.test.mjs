import assert from 'node:assert/strict';
import { test } from 'node:test';

import { unkeepablePromisesIn } from './lib/sharing-promise.mjs';

/**
 * The wordings of the promise the architecture cannot keep, one at a time.
 *
 * `docs/agent-handoff.md` says never to reintroduce « jamais partagées avec des
 * tiers » « or any equivalent ». The equivalents are here, so that « or any
 * equivalent » is a check rather than a request.
 *
 * The second list is the harder half. The committee's point — that it sells
 * nothing and trades nothing — is true, is what a donor actually wants to know,
 * and survived the correction on purpose. A guard that swallowed it would take
 * the honest sentence out along with the false one, and nobody would notice
 * until the page had lost the reassurance it was entitled to give.
 */

const paragraph = (text) => `<main><p>${text}</p></main>`;

/** Promises no page may make. Each says, in effect, that no third party receives anything. */
const FORBIDDEN = [
  ['the prototype’s own sentence', 'Vos données ne sont jamais partagées avec des tiers.'],
  ['the same sentence in English', 'Your data is never shared with third parties.'],
  ['the object left off', 'Vos données ne sont jamais partagées, promis.'],
  ['the first person', 'We never share your personal data.'],
  ['transmitting rather than sharing', 'Vos coordonnées ne sont jamais transmises à des tiers.'],
  ['handing over rather than sharing', 'Vos coordonnées ne sont jamais cédées à des tiers.'],
  ['denying any third party access at all', 'Aucun tiers n’a accès à vos informations.'],
  ['the same denial in English', 'No third party has access to your information.'],
];

/**
 * Where a reassurance actually gets written.
 *
 * The old check read `<main>` of the nine legal pages. The donation page is
 * where a visitor is asked for a card number, and it is the likeliest place in
 * the site for somebody to add a comforting sentence — it was never looked at.
 */
const FORBIDDEN_WHEREVER_IT_SITS = [
  [
    'in the footer rather than the body',
    '<main><p>Faites un don.</p></main><footer><p>Vos données ne sont jamais partagées avec des tiers.</p></footer>',
  ],
  [
    'in the meta description, which a search engine quotes',
    '<head><meta name="description" content="Vos données ne sont jamais partagées avec des tiers."></head><body><main><p>Faites un don.</p></main></body>',
  ],
];

/**
 * Sentences the committee is entitled to say, and does.
 *
 * Taken from `src/i18n/legal.ts`. Selling nothing and trading nothing are
 * promises this architecture keeps.
 */
const ALLOWED = [
  [
    'the point the correction had to preserve',
    'Nous ne vendons, ne louons et n’échangeons vos données avec personne.',
  ],
  [
    'the honest version, which names the processors instead of denying them',
    "Nous ne cédons vos données à personne pour son propre usage : les seuls tiers qui y accèdent sont des prestataires qui les traitent pour notre compte, pour la finalité indiquée, et qui n'ont pas le droit de s'en servir pour autre chose.",
  ],
  [
    'the same, in English',
    'We hand your data to nobody for their own purposes: the only third parties with access are providers who process it on our behalf, for the stated purpose, and who are not allowed to use it for anything else.',
  ],
  [
    'a statement about hosts, not about data',
    'Aucun. Ce site ne charge rien depuis un serveur tiers.',
  ],
  [
    'a promise about cookies, which is a different promise',
    'Ce site ne dépose aucun cookie et ne partage aucun identifiant entre sites.',
  ],
];

const promised = ([, wording]) =>
  unkeepablePromisesIn(wording.startsWith('<') ? wording : paragraph(wording)).length > 0;
const label = ([name]) => name;

test('every way of promising what cannot be promised is caught', () => {
  const missed = [...FORBIDDEN, ...FORBIDDEN_WHEREVER_IT_SITS]
    .filter((w) => !promised(w))
    .map(label);

  assert.deepEqual(
    missed,
    [],
    'These wordings are read as making no promise:\n  ' +
      `${missed.join('\n  ')}\n` +
      'Each of them tells a visitor that nobody else receives their data. A Swiss ' +
      'host, a payment provider and an anti-spam service each receive some of it.',
  );
});

test('the promises the committee can keep are left alone', () => {
  const wrongly = ALLOWED.filter(promised).map(label);

  assert.deepEqual(
    wrongly,
    [],
    'These are read as the unkeepable promise:\n  ' +
      `${wrongly.join('\n  ')}\n` +
      'Selling nothing and trading nothing are true, and they are what the visitor ' +
      'wanted to know. Losing them to a widened guard is losing the correction.',
  );
});
