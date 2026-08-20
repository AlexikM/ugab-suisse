import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildOutput } from './lib/build-output.mjs';
import { footerOf, mainOf, textOf } from './lib/page-text.mjs';

/**
 * The legal pages exist, can be reached, and do not assert things nobody has
 * checked.
 *
 * The claims tested here are the ones that were wrong in the prototype: a
 * privacy promise the architecture cannot keep, a host the site is not on, a tax
 * status nobody has produced a decision for, and a contact address that was
 * invented. Each of those reads as ordinary, reassuring copy, which is exactly
 * why a person proofreading will not catch it and a test should.
 */

const site = await buildOutput();

const LEGAL_ROUTES = ['/confidentialite/', '/mentions-legales/', '/accessibilite/'];

const legalPage = (route) => {
  const page = site.pages.find((candidate) => candidate.route === route);
  assert.ok(page, `${route} was not built`);
  return page;
};

const legalPagesText = () =>
  LEGAL_ROUTES.map((route) => ({ route, text: textOf(mainOf(legalPage(route).html)) }));

test('the privacy policy, the legal notices and the accessibility statement are all built', () => {
  const built = site.pages.map((page) => page.route);
  for (const route of LEGAL_ROUTES) {
    assert.ok(built.includes(route), `${route} is missing from the build output`);
  }
});

test('the privacy policy and the legal notices are reachable from the footer of every page', () => {
  const missing = site.visitorPages
    .map((page) => ({ route: page.route, footer: footerOf(page.html) }))
    .filter(
      ({ footer }) => !footer.includes('/confidentialite') || !footer.includes('/mentions-legales'),
    )
    .map(({ route }) => route);

  assert.deepEqual(
    missing,
    [],
    'a visitor on these pages cannot find the legal pages without searching',
  );
});

/**
 * The accessibility statement offers someone a way to complete a donation the
 * site blocks them from making — worth nothing if the only route to it is through
 * the privacy policy. The footer link landed when the lanes were integrated.
 */
test('the accessibility statement is reachable from the footer too', () => {
  const missing = site.visitorPages
    .filter((page) => !footerOf(page.html).includes('/accessibilite'))
    .map((page) => page.route);

  assert.deepEqual(
    missing,
    [],
    'the accessibility statement is not linked from the footer of these pages',
  );
});

test('the promise the architecture cannot keep is gone', () => {
  for (const { route, text } of legalPagesText()) {
    assert.doesNotMatch(
      text,
      /jamais partagées avec des tiers|never shared with third parties/i,
      `${route} still promises data is never shared with third parties. A Swiss host, a payment provider and an ` +
        'anti-spam service all receive some of it, so the promise cannot be kept.',
    );
  }
});

test('the true intent behind that promise is stated instead of dropped', () => {
  const text = textOf(mainOf(legalPage('/confidentialite/').html));
  assert.match(
    text,
    /ne vendons, ne louons et n[’']échangeons vos données avec personne/i,
    'the committee’s point — that nothing is sold or traded — should survive the correction, not vanish with it',
  );
});

test('the privacy policy names every processor and says what each one receives', () => {
  const text = textOf(mainOf(legalPage('/confidentialite/').html));
  for (const expected of ['Infomaniak', 'paiement', 'billetterie', 'Cloudflare']) {
    assert.match(
      text,
      new RegExp(expected, 'i'),
      `no processor matching “${expected}” is named on the privacy page`,
    );
  }
  assert.match(text, /Ce qu[’']il reçoit/i, 'the page does not say what each processor receives');
});

test('the privacy policy states how long data is kept and how to exercise your rights', () => {
  const text = textOf(mainOf(legalPage('/confidentialite/').html));
  assert.match(text, /Combien de temps/i, 'no retention section');
  assert.match(text, /\b30 jours\b/, 'no stated response time for a rights request');
  assert.match(text, /nLPD/i, 'Swiss data protection law is not named');
  assert.match(
    text,
    /RGPD/i,
    'the GDPR is not named, so an EU visitor is not told their rights apply',
  );
  assert.match(
    text,
    /PFPDT/i,
    'no supervisory authority is named for a visitor who is not satisfied',
  );
});

test('no legal page repeats the unverified tax-deductibility claim', () => {
  for (const { route, text } of legalPagesText()) {
    assert.doesNotMatch(
      text,
      /d[ée]ductib\w*\s+fiscal|fiscalement\s+d[ée]ductib|tax[- ]deductible/i,
      `${route} asserts donations are tax-deductible. That depends on a cantonal decision nobody has produced.`,
    );
    assert.doesNotMatch(
      text,
      /re[çc]u\s+\w*\s*automatiquement|receipt\s+is\s+sent\s+automatically/i,
      `${route} promises an automatic receipt. ADR-0001 records that attestations are issued by the treasurer once a year.`,
    );
  }
});

test('no legal page claims a public-utility status nobody has produced a decision for', () => {
  for (const { route, text } of legalPagesText()) {
    assert.doesNotMatch(
      text,
      /reconnue?\s+d[’']utilité\s+publique(?!\s+ou)/i,
      `${route} asserts recognition of public utility as established fact`,
    );
  }
});

test('no legal page invents a contact address or a host', () => {
  for (const { route, text } of legalPagesText()) {
    assert.doesNotMatch(
      text,
      /contact@ugab\.ch/i,
      `${route} carries an address the committee never confirmed`,
    );
    assert.doesNotMatch(
      text,
      /Cloudflare, Inc\.\s*—\s*101 Townsend/i,
      `${route} names Cloudflare as the host. The site is not hosted there and will not be.`,
    );
  }
});

test('facts the committee still owes are visibly marked as owed', () => {
  const text = textOf(mainOf(legalPage('/confidentialite/').html));
  assert.match(
    text,
    /à fournir par le Comité/i,
    'the postal address and mailbox are unknown; the page should say so rather than leave a plausible-looking gap',
  );
});

test('the legal notices name the host the site is actually on', () => {
  const text = textOf(mainOf(legalPage('/mentions-legales/').html));
  assert.match(text, /Infomaniak/i, 'the hosting section does not name the host from ADR-0001');
  assert.match(text, /Suisse/i, 'the hosting section does not say where the servers are');
});

test('the accessibility statement sets a target, admits its gaps and offers a way through', () => {
  const text = textOf(mainOf(legalPage('/accessibilite/').html));
  assert.match(text, /WCAG\s*2\.2/i, 'no specific target is stated');
  assert.match(text, /AA/, 'no conformance level is stated');
  assert.match(
    text,
    /prestataires? ext[ée]rieurs?|prestataires/i,
    'the third-party payment and ticketing steps are not mentioned',
  );
  assert.match(
    text,
    /virement bancaire/i,
    'no alternative route is offered for someone the site blocks',
  );
  assert.match(text, /\b30 jours\b/, 'no response time is given for an accessibility report');
});

test('every legal page shows a reader the date its wording was last reviewed', () => {
  for (const { route, text } of legalPagesText()) {
    assert.match(
      text,
      /\b\d{4}-\d{2}-\d{2}\b/,
      `${route} does not show when it was last reviewed, so a reader cannot tell whether it is current`,
    );
  }
});

test('the legal pages link to one another, so finding one finds all three', () => {
  for (const route of LEGAL_ROUTES) {
    // The page's own content, not the shared footer, which already links two of
    // the three on every page and would make this pass without proving anything.
    const body = mainOf(legalPage(route).html);
    for (const other of LEGAL_ROUTES.filter((candidate) => candidate !== route)) {
      const target = other.replace(/\/$/, '');
      assert.match(
        body,
        new RegExp(`href="[^"]*${target}/?"`),
        `${route} does not link to ${other} from its own content`,
      );
    }
  }
});

/**
 * Marked `todo`: expected to fail today, must pass before launch.
 *
 * `contact@ugab.ch` was invented by the prototype and sits in the footer of every
 * page, which belongs to another workstream. The privacy policy directs people to
 * write to the committee to exercise their rights, so an address that does not
 * reach anyone is not a cosmetic problem: it is a rights route that silently
 * fails. The committee owes the real one (issue #9).
 */
test('no page shows a contact address the committee never confirmed', {
  todo: 'blocked on the committee',
}, () => {
  const offending = site.visitorPages
    .filter((page) => /contact@ugab\.ch/i.test(page.html))
    .map((page) => page.route);

  assert.deepEqual(
    offending,
    [],
    `These pages publish an invented mailbox. Replace it with the address the committee confirms, ` +
      `or show it as pending the way the legal pages do.`,
  );
});

/**
 * Marked `todo`: expected to fail today, must pass before launch.
 *
 * The claim lives in `src/i18n/ui.ts` (`donate.tax`) and renders on the donation
 * page, which belongs to another workstream. It is the single highest-risk
 * sentence on the site — a charity telling donors they can deduct a gift when
 * nobody has produced the cantonal decision that would make it so, and promising
 * a receipt the chosen payment tier does not issue. See the pre-launch checklist.
 */
test('the site tells nobody their donation is tax-deductible until that is verified', {
  todo: 'blocked on the committee',
}, () => {
  const offending = site.visitorPages
    .filter((page) =>
      /d[ée]ductib\w*\s+fiscal|fiscalement\s+d[ée]ductib|tax[- ]deductible/i.test(
        textOf(page.html),
      ),
    )
    .map((page) => page.route);

  assert.deepEqual(
    offending,
    [],
    'These pages assert donations are tax-deductible. Remove the claim, or publish it only against the cantonal ' +
      'decision recognising the association as of public utility.',
  );
});
