# ADR-0002 — No regional antennes on the site

- **Status:** Proposed — reversible, pending the committee's answer on open question 6 (#9)
- **Date:** 2026-08-21
- **Deciders:** webmaster + UGAB Comité Suisse
- **Context:** PRD 2 (#2), slice #21

## Context

The prototype carried a content collection named `antennes`, with three entries:
Genève, Lausanne and Zurich. The contact page rendered them as three cards under
the heading « Joindre l'antenne la plus proche ».

Nothing in the committee's material describes regional antennes. The approved
copy in `docs/content/site-copy.md` names a single organisation —
"Union Générale Arménienne de Bienfaisance — Comité Suisse, Genève" — and gives
a five-page sitemap with no regional section, no per-antenne contact block and
no mention of Lausanne or Zurich anywhere. The gap analysis records the same
finding.

So the collection is either an invention of the prototype, or a real part of the
organisation the brief happens not to mention. We cannot tell from the documents
we have, and PRD 2 names removal as the default.

## Decision

**Remove the collection and the page section that rendered it.** The contact page
names the Comité Suisse directly and gives one address.

The question goes to the committee as part of #9: *do the Lausanne and Zurich
antennes exist, and do they belong on the site?*

## Rationale

Publishing a regional structure that may not exist is worse than omitting one
that does. A visitor in Lausanne who writes to an antenne that has no one behind
it gets silence; a visitor who writes to the Comité gets an answer. And the
committee's own credibility — the thing the whole site is trading on — is
damaged more by a page describing an organisation it is not than by a page that
is merely incomplete.

Removal is also cheap to undo. The three entries remain in git history and on
the `prototype/2026-08-20` branch; restoring them is a revert, not a rebuild.

## Consequences

**If the antennes do not exist** — nothing further to do.

**If they do exist**, this is larger than one collection. The agreed five-page
sitemap has no place for them, which means the committee's own scope is
incomplete and should be revisited *before* the site is finished rather than
after. Restoring the collection would then be the smallest part of the work:
the sitemap, the navigation and the contact page would all need a decision.

## Alternatives considered

**Keep the collection, hidden.** Rejected: an unrendered collection is a thing
the next maintainer has to work out the meaning of, and the CMS would still
offer editors a section that appears nowhere.

**Keep the antennes as published content.** Rejected as the default: it asserts
something about the organisation that no document we hold supports. If the
committee confirms them, this ADR is superseded.
