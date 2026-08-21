import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { buildOutput, repoRoot } from './lib/build-output.mjs';
import { footerOf, mainOf, textOf } from './lib/page-text.mjs';
import { deductibilityClaimsIn } from './lib/tax-claim.mjs';

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

/**
 * The three legal pages, at every address the site serves them from.
 *
 * They used to be French-only, which left an EU donor exercising GDPR rights and
 * an English-speaking supporter reading a policy in a language they may not
 * have. Every sweep below now runs over all nine pages: the English copy can
 * carry a tax claim or an invented address just as easily as the French, and
 * until this list grew nothing would have caught it.
 */
const LEGAL_PAGES = ['confidentialite', 'mentions-legales', 'accessibilite'];
const LOCALES = ['', 'en/', 'hy/'];
const legalRoute = (locale, page) => `/${locale}${page}/`;
const LEGAL_ROUTES = LOCALES.flatMap((locale) =>
  LEGAL_PAGES.map((page) => legalRoute(locale, page)),
);

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

/**
 * The one sentence on this site that no automated check can make true.
 *
 * The accessibility statement says a manual keyboard and screen-reader pass was
 * carried out before the site went live. Nothing performs one. The Playwright
 * suite is an automated check — the statement says so itself, in the sentence
 * immediately before — and the whole point of the manual sentence is that it
 * claims the thing automation cannot do.
 *
 * Section C of `docs/pre-launch-checklist.md` owns this and says, of that
 * sentence, « Run it, or change the sentence ». A checklist is as far as a
 * checklist can go: nobody is stopped by an unticked box. The idiom this project
 * uses for a claim that must become true before launch is a `todo` that fails,
 * so it appears in the sweep beside the invented mailbox and unpkg — which is
 * how the tax-deductibility hole was found.
 *
 * This reads the box rather than a date somebody types here, so there is one
 * place where the pass is recorded and it is the place the webmaster is already
 * working from. Tick it and this test passes; the marker comes off in the same
 * commit, per the rule that a `todo` which has stopped failing is a gap.
 */
const MANUAL_PASS_CLAIMED =
  /v[ée]rification manuelle[^.]{0,60}a\s+[ée]t[ée]\s+men[ée]e|manual keyboard and screen-reader pass was carried out/iu;

/** The section C line that owns the claim, and whether anybody has ticked it. */
const CHECKLIST_ITEM = /^-\s+\[([ xX])\][^\n]*manual keyboard and screen-reader pass/m;

test('no page claims a manual accessibility pass until the checklist records one', {
  todo: 'nobody has run the pass — section C of the pre-launch checklist',
}, () => {
  const checklist = readFileSync(path.join(repoRoot, 'docs/pre-launch-checklist.md'), 'utf8');
  const item = CHECKLIST_ITEM.exec(checklist);
  assert.ok(
    item,
    'Section C no longer carries the item this test reads. It was the only record ' +
      'that the manual pass had been run; restore it, or move the record somewhere ' +
      'this test can read and say so here.',
  );

  const recorded = item[1].toLowerCase() === 'x';
  const claiming = site.visitorPages
    .filter((page) => MANUAL_PASS_CLAIMED.test(textOf(page.html)))
    .map((page) => page.route)
    .sort();

  // A page may say the pass was carried out only once somebody records having
  // carried it out. Until then the sentence describes something that has not
  // happened, which is the defect the accessibility statement was rewritten to
  // remove and this is the half of it that survived.
  assert.deepEqual(
    recorded ? [] : claiming,
    [],
    'These pages say a manual keyboard and screen-reader pass was carried out ' +
      'before the site went live:\n  ' +
      `${claiming.join('\n  ')}\n` +
      'Nobody has recorded running one. Run it and tick the item in section C of ' +
      'docs/pre-launch-checklist.md — taking the `todo` off this test in the same ' +
      'commit — or change the sentence to what is true.',
  );
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

/**
 * Every legal address a page's own content links to, as `locale/page`.
 *
 * The language-fallback notice is dropped first. It links this same page at its
 * French address, which is the whole point of it, and it is injected by the
 * layout rather than written by the page — counting it here would make the
 * assertion below about the chrome instead of about the content.
 */
const legalLinksIn = (html) =>
  [
    ...mainOf(html)
      .replace(/<aside\b[^>]*data-language-fallback[\s\S]*?<\/aside>/i, ' ')
      .matchAll(/href="([^"]*)"/g),
  ]
    .map(([, href]) =>
      /(?:\/(en|hy))?\/(confidentialite|mentions-legales|accessibilite)\/?$/.exec(href),
    )
    .filter(Boolean)
    .map(([, locale, page]) => `${locale ? `${locale}/` : ''}${page}`);

test('the legal pages link to one another, so finding one finds all three', () => {
  for (const locale of LOCALES) {
    for (const page of LEGAL_PAGES) {
      // The page's own content, not the shared footer, which already links two
      // of the three on every page and would make this pass without proving
      // anything.
      const found = new Set(legalLinksIn(legalPage(legalRoute(locale, page)).html));
      const expected = LEGAL_PAGES.filter((other) => other !== page).map(
        (other) => `${locale}${other}`,
      );

      assert.deepEqual(
        [...found].sort(),
        expected.sort(),
        `${legalRoute(locale, page)} should link to the other two legal pages in its own language, ` +
          'and to nothing else: a link that changes language under the visitor is worse than no link.',
      );
    }
  }
});

test('an English-speaking visitor gets the legal pages in English', () => {
  for (const page of LEGAL_PAGES) {
    const html = legalPage(legalRoute('en/', page)).html;
    assert.match(
      html,
      /<html lang="en"/,
      `${legalRoute('en/', page)} does not declare itself English`,
    );
  }

  const text = textOf(mainOf(legalPage('/en/confidentialite/').html));
  assert.match(text, /GDPR/i, 'the English privacy policy does not name the GDPR');
  assert.match(text, /Who your data is passed to/i, 'the English privacy policy is not in English');
  assert.doesNotMatch(
    text,
    /Politique de confidentialité/i,
    'the English page still carries French copy',
  );
});

/**
 * The committee owes the Armenian translations (#9). Until they arrive the
 * Armenian address exists, serves the French text, and says so — the same
 * fallback every other page uses. The alternative, linking Armenian readers to a
 * French URL, is the one thing that would make the switcher lie.
 */
test('an Armenian visitor is served the French legal text and told so', () => {
  for (const page of LEGAL_PAGES) {
    const html = legalPage(legalRoute('hy/', page)).html;
    assert.match(
      html,
      /<html lang="fr"/,
      `${legalRoute('hy/', page)} claims to be Armenian while serving French text`,
    );
    assert.match(
      html,
      /data-language-fallback="hy"/,
      `${legalRoute('hy/', page)} falls back to French without telling the visitor`,
    );
  }
});

/**
 * A person deciding whether to write to a committee is deciding with what the
 * page tells them, not with what a policy two clicks away tells them afterwards.
 *
 * The retention is asserted by comparison rather than by literal, so there is no
 * third copy of "twelve months" to go stale: whatever period the contact page
 * states is looked for, in the same words, on the privacy page of the same
 * language. Change one and this fails naming the other.
 */
test('the contact page says what becomes of a message before it is sent, and agrees with the policy', () => {
  for (const locale of ['', 'en/']) {
    const contact = site.pages.find((page) => page.route === `/${locale}contact/`);
    assert.ok(contact, `/${locale}contact/ was not built`);
    const text = textOf(mainOf(contact.html));

    assert.match(
      text,
      /Infomaniak/,
      `/${locale}contact/ does not say where a message goes before asking for one`,
    );
    assert.match(
      mainOf(contact.html),
      new RegExp(`href="[^"]*/${locale}confidentialite/?"`),
      `/${locale}contact/ does not link the privacy policy beside the send control`,
    );

    const retention = /([\p{L}\d-]+\s+(?:mois|months))/iu.exec(text);
    assert.ok(
      retention,
      `/${locale}contact/ does not say how long a message is kept — a visitor should not have to go and look`,
    );

    const policy = textOf(mainOf(legalPage(legalRoute(locale, 'confidentialite')).html));
    assert.match(
      policy,
      new RegExp(retention[1], 'i'),
      `/${locale}contact/ promises to keep a message for ${retention[1]} and the privacy policy says something else`,
    );
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
 * The single highest-risk sentence the site could carry: a charity telling
 * donors they can deduct a gift when nobody has produced the cantonal decision
 * that would make it so. Section A1 of the pre-launch checklist.
 *
 * What counts as raising the claim, and what counts as denying it, is
 * `tests/compliance/lib/tax-claim.mjs` — with the history of the three
 * corrections it took to get there, and a test of its own that puts the
 * wordings through it one at a time. This is the sweep over the built site: the
 * pages a visitor actually receives, in every language they are served in.
 *
 * The day the committee produces the decision, this fails — as it should.
 * Publishing that claim is a deliberate act, and it changes this test with its
 * real conditions in the same commit.
 */

test('the site tells nobody their donation is tax-deductible until that is verified', () => {
  const offending = site.visitorPages
    .flatMap((page) =>
      deductibilityClaimsIn(page.html).map(
        (statement) => `${page.route} — “${statement.slice(0, 120)}”`,
      ),
    )
    .sort();

  assert.deepEqual(
    offending,
    [],
    'These statements raise tax deductibility without denying it:\n  ' +
      `${offending.join('\n  ')}\n` +
      'Remove the claim, or publish it only against the cantonal decision recognising the ' +
      'association as of public utility — and rewrite this test with its real conditions.',
  );
});
