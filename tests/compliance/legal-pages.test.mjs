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
 * It was carried, in `donate.tax`, and was removed under PRD 2. This is the
 * assertion that keeps it removed, and it took two corrections before it was
 * one:
 *
 * 1. **It was marked `todo`.** A `todo` in node:test runs and is allowed to
 *    fail, which is right for a blocker nobody can clear yet. This one had
 *    stopped failing — the claim was gone — and a passing `todo` is reported as
 *    `ok … # TODO` and gates nothing. The marker was quietly holding the site's
 *    most dangerous sentence open.
 * 2. **It missed the noun.** `d[ée]ductib\w*\s+fiscal` cannot match
 *    « déductibilité fiscale », because `\w` does not match `é` and the word
 *    carries one in the middle. The same hole let "tax deductibility" through in
 *    English. That was load-bearing by accident: it is also why the legal
 *    notices' *denial* of any such status passed.
 *
 * A third correction, from the review of that one: the rule was right and its
 * reach was not. « A sentence may raise deductibility only if that sentence
 * denies it » was applied to sentences cut on full stops alone, and a denial
 * was allowed to excuse anything sharing a sentence with it. Both halves have
 * been tightened — see `statementsOf` and `DEDUCTIBILITY` below.
 *
 * The day the committee produces the decision, this fails — as it should.
 * Publishing that claim is a deliberate act, and it changes this test with its
 * real conditions in the same commit.
 */

/**
 * The prose of a page, cut into the units a denial can govern.
 *
 * Three cuts, each closing a way a claim was found to survive the check:
 *
 * 1. **Sentences.** The obvious one, and on its own not enough.
 * 2. **Block elements.** `textOf` turns every tag into a space, so a heading
 *    runs straight into the paragraph beneath it — the legal notices really do
 *    read « Statut fiscal Le Comité ne fait … » as one string. A denial in the
 *    paragraph would excuse a claim in the heading above it.
 * 3. **Clauses.** A denial governs its own clause and no further. « … ne fait
 *    aucune déclaration, mais vos dons restent déductibles » is two statements,
 *    and the second one is the whole risk.
 *
 *    The conjunction is not what does the work here — the comma is. Cutting on
 *    « mais » and its synonyms alone let the identical sentence through with
 *    « et » in place of « mais », with « car », and with nothing at all where
 *    the conjunction had been. A writer adding the claim back while believing
 *    they are being careful reaches for any of the four. So a comma ends a
 *    statement, and the conjunction list only adds the ones a writer separates
 *    with a space instead.
 *
 *    The three real denials survive this because each states the denial and
 *    names the claim inside one comma-free clause. Should that stop being true,
 *    this goes red rather than quiet, which is the direction it should fail in.
 */
const BLOCK_END =
  /<\/(?:p|h[1-6]|li|dd|dt|td|th|figcaption|blockquote|div|section|article|aside)>/gi;

const BREAK =
  /(?<=[.!?])\s+|\s*[;,]\s*|\s+(?=\b(?:mais|et|car|donc|toutefois|cependant|néanmoins|pourtant|but|and|so|however|though|although)\b)/iu;

const statementsOf = (html) => textOf(html.replace(BLOCK_END, '. ')).split(BREAK);

/**
 * Every way this claim gets made, in either language.
 *
 * A list rather than one alternation because each entry answers for itself.
 * `d[ée]ductib…` alone missed « déduction fiscale », which is how a French
 * speaker is most likely to write it: the stem is `déduct`, not `déductib`.
 */
const DEDUCTIBILITY = [
  /** déductible fiscalement, déductibilité fiscale, déduction fiscale. */
  /d[ée]duct\p{L}*\s+fiscal\p{L}*/iu,
  /** fiscalement déductible, and the rest of that word order. */
  /fiscal\p{L}*\s+d[ée]duct\p{L}*/iu,
  /** « déductible de vos impôts », « déduire de son impôt » — no « fiscal » anywhere. */
  /d[ée]du\p{L}*[^.]{0,40}\bimp[oô]ts?\b/iu,
  /** défiscaliser, défiscalisation. */
  /d[ée]fiscalis\p{L}*/iu,
  /** tax-deductible, tax deductibility, tax relief, tax break. */
  /tax[-\s](?:deductib\p{L}*|relief|break)/iu,
  /** deductible against tax, deductible from your taxes. */
  /deductib\p{L}*[^.]{0,40}\btax(?:es)?\b/iu,
];

const raisesDeductibility = (statement) => DEDUCTIBILITY.some((form) => form.test(statement));

/**
 * Saying the association makes no such claim — the only reason to raise it.
 *
 * Bounded rather than `[^.]*`: the span between « ne fait » and « aucune
 * déclaration » is a few words in the copy this exists for, and an unbounded
 * one reaches across a whole statement looking for an excuse.
 */
const A_DENIAL = /ne fait\b[^.]{0,60}aucune d[ée]claration|makes no public statement/i;

test('the site tells nobody their donation is tax-deductible until that is verified', () => {
  const offending = site.visitorPages
    .flatMap((page) =>
      statementsOf(page.html)
        .filter((statement) => raisesDeductibility(statement) && !A_DENIAL.test(statement))
        .map((statement) => `${page.route} — “${statement.trim().slice(0, 120)}”`),
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
