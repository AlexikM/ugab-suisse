import { metadataTextOf, textOf } from './page-text.mjs';

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
 * The prose, and everything else the page publishes.
 *
 * A claim does not have to be rendered to be made. The meta description is
 * quoted under the search result, the JSON-LD becomes the rich result, the
 * `alt` is what a screen-reader user is told — and `textOf` sees none of them,
 * because it strips tags and drops `<script>` entirely.
 *
 * Nothing exploits this today: every string that reaches a description on this
 * site also appears in the body of the page it describes, so the prose sweep
 * happens to cover it. That is a coincidence of how the pages are built and not
 * a property of anything. An SEO description written to be different from the
 * copy — which is the ordinary reason to write one — leaves the guard behind
 * without a word.
 */
const publishedStatementsOf = (html) => [
  ...statementsOf(html),
  ...metadataTextOf(html).flatMap((field) => field.split(BREAK)),
];

/**
 * Every way this claim gets made, in either language.
 *
 * A list rather than one alternation because each entry answers for itself.
 * `d[ée]ductib…` alone missed « déduction fiscale », which is how a French
 * speaker is most likely to write it: the stem is `déduct`, not `déductib`.
 */
const DEDUCTIBILITY = [
  /**
   * « déductible », « déductibilité », "deductible" — on their own.
   *
   * The forms below all ask for a second word beside the first, which is right
   * for « déduction » and « déduire »: those also mean inferring something, and
   * an event write-up may well use them that way. `déductible` has no such
   * second life. Asking it for a companion left « Votre don est déductible. »
   * passing, which is the claim in four words.
   */
  /d[ée]ductib\p{L}*|deductib\p{L}*/iu,
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

/**
 * The statements on a page that raise tax deductibility without denying it.
 *
 * Empty is the only answer this project accepts. The wordings this does and
 * does not catch are asserted one by one in `tests/compliance/tax-claim.test.mjs`;
 * the sweep over the built site is in `tests/compliance/legal-pages.test.mjs`.
 */
export function deductibilityClaimsIn(html) {
  return publishedStatementsOf(html)
    .filter((statement) => raisesDeductibility(statement) && !A_DENIAL.test(statement))
    .map((statement) => statement.trim());
}
