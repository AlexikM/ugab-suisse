import { metadataTextOf, textOf } from './page-text.mjs';

/**
 * The promise this site's architecture cannot keep: that nobody else ever
 * receives a visitor's data.
 *
 * The prototype said « vos données ne sont jamais partagées avec des tiers ».
 * It is the most reassuring sentence on a privacy page and it was false the
 * moment it was written: a Swiss host, a payment provider and an anti-spam
 * service each receive some of it. `docs/agent-handoff.md` lists reintroducing
 * that sentence « or any equivalent » among the things never to do.
 *
 * « Or any equivalent » was the part nothing enforced. The check matched the one
 * wording the prototype happened to use, over `<main>` of the nine legal pages
 * — so the same promise in different words, or in the same words one page over,
 * was not checked at all. A reassurance next to a payment form is exactly where
 * somebody writes this, and `/don/` was never looked at.
 *
 * What is forbidden is the *absolute* claim: that no third party receives
 * anything. What the committee is entitled to say — and does say — is that it
 * sells nothing, trades nothing, and hands nothing to anyone for their own
 * purposes. Those are true, they are the point the correction had to preserve,
 * and `tests/compliance/sharing-promise.test.mjs` holds them next to the
 * forbidden ones so that widening this list cannot quietly swallow them.
 */
const UNKEEPABLE = [
  /** The prototype's own sentence, in both languages. */
  /jamais partag[ée]\p{L}*\s+avec\s+des\s+tiers/iu,
  /never\s+shared\s+with\s+(?:any\s+)?third\s+part/iu,
  /** The same promise with the object left off: « vos données ne sont jamais partagées ». */
  /donn[ée]es[^.]{0,40}\bne\s+sont\s+jamais\s+partag[ée]/iu,
  /we\s+never\s+share\s+your\s+(?:personal\s+)?data/iu,
  /** Transmitting rather than sharing — the same claim, a different verb. */
  /jamais\s+(?:transmis|communiqu[ée]|c[ée]d[ée])\p{L}*\s+[àa]\s+des\s+tiers/iu,
  /never\s+(?:passed|disclosed|sent)\s+(?:on\s+)?to\s+(?:any\s+)?third\s+part/iu,
  /** Denying that any third party has access, which the processor register contradicts. */
  /aucun\s+tiers\s+n[’']a\s+(?:jamais\s+)?acc[èe]s/iu,
  /no\s+third\s+part\p{L}*\s+(?:ever\s+)?has\s+access/iu,
];

/**
 * Every statement on a page that makes the promise.
 *
 * Reads the rendered prose and the copy the page publishes without rendering —
 * a meta description is quoted under the search result whether or not the
 * sentence appears on the page.
 */
export function unkeepablePromisesIn(html) {
  const statements = [textOf(html), ...metadataTextOf(html)];

  return statements.flatMap((statement) =>
    UNKEEPABLE.filter((promise) => promise.test(statement))
      .map((promise) => statement.match(promise)?.[0]?.trim())
      .filter(Boolean),
  );
}
