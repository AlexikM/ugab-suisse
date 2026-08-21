# Handoff — for an agent or developer picking this up

Read this, then your issue. Everything else is in the repo; do not re-derive it.

> This lived in a temp directory for the first three waves and **two lanes
> arrived to find it gone** — the agents' own working files had overwritten the
> scratchpad. It lives here now. Keep it here.

## The project

A five-page trilingual (FR/EN/HY) site for the AGBU Swiss Committee in Geneva,
with online donations and event ticketing. Small volunteer association, Swiss
data-protection obligations, no maintenance budget.

**Read in this order:**

1. `docs/adr/0001-static-site-with-rented-payment-services.md` — the decision and why. Status is **Proposed**: the committee has not confirmed it.
2. `docs/adr/0002-no-regional-antennes-on-the-site.md`
3. `docs/content/site-copy.md` — the content source of truth for every visible string.
4. `docs/pre-launch-checklist.md` — what blocks launch, with owners.
5. `docs/infrastructure-setup.md` — what a human must do before anything deploys.
6. Your issue.

The client PDFs are deliberately not in the repo: the cahier des charges carries
contractual terms. Their substance is in the documents above.

## Guiding principle

**Optimise for abandonment.** This must still work, untouched, in three years,
maintained by volunteers who have not met us. Prefer boring and conventional.
Every dependency is a liability the next maintainer inherits.

## Working rules

- Branch off `main`. Use `/to-issues` to slice, `/tdd` per slice, `/review` before the PR.
- **`npm run check` must exit 0 before you open a PR.** It does today.
- Tests assert observable behaviour, not markup structure. No screenshot comparison, no asserting class names.
- Make file changes through Bash where you can. Write/Edit have been denied mid-run before, and a lane lost hours of unverified work to it.
- One PR per piece of work, against `main`.
- Blocked on a committee answer? Take the documented default, note the assumption in the PR, keep going.

## Never do these

- **Do not publish a tax-deductibility claim or a receipt-by-email promise.** No cantonal decision exists and nothing sends receipts. Tests enforce both.
- **Do not reintroduce "jamais partagées avec des tiers"** or any equivalent.
- **Do not add a third-party host** without adding it to the processor register in `src/i18n/legal.ts`. The audit fails in both directions — a disclosed host never contacted fails as hard as an undisclosed one.
- **Do not invent facts about the committee**: addresses, phone numbers, IBANs, statistics, member names. Render "à fournir par le Comité". The prototype's fabricated donor counts are the failure this project exists to correct.
- **Do not create a demo event.** The build refuses `demo: true`, deliberately.

## Things that have bitten people here

- **A test that cannot fail is worse than no test.** The Armenian font suite first used `document.fonts.check`, which asks "can anything on this machine draw this" — it passed with the font deliberately deleted. Break your assertion on purpose and watch it go red before you trust it.
- **A `todo` that has stopped failing is a gap, not good news.** node:test reports it as `ok … # TODO` and it gates nothing. The tax-deductibility check — the single most dangerous sentence this site could carry — sat passing behind its marker for a fortnight, so the claim could have walked back in unnoticed. When a blocker clears, take the marker off in the same commit.
- **`\w` does not match `é`.** That one character is why the same check could not see « déductibilité fiscale », and why it tolerated the legal notices' denial by accident rather than by design. Any regex reading French copy wants `\p{L}` and the `u` flag.
- **Vendored third-party applications are not our source.** `public/admin/sveltia-cms-*.js` is exempt from the request and storage audits and from typechecking, by exact filename, for reasons written in `tests/compliance/lib/vendored.mjs`.
- **Disabling a workflow outlives rewriting it.** `deploy.yml` was disabled while it was the GitHub Pages workflow; the disable persisted through a full rewrite and the new pipeline silently never ran.
- **Absent configuration should skip, not fail.** A permanently red `main` teaches people to stop reading it.
- **A comment promising a check is not a check.** `public/admin/index.html` said "a test checks that the file beside this page is still the file recorded here" and no such test existed. Four documents referenced from the CMS configuration and from `src/lib/content.ts` had never been written. Both classes are guarded now — `tests/compliance/vendored-application.test.mjs` and `tests/docs/references.test.mjs` — but the habit is the point: if you write that something is checked, check it in the same commit.
- **A legal page can go stale in both directions.** The accessibility statement apologised for an interactive map that had been removed, and promised a screen-reader pass before every release that nothing performs. Understating the site is a smaller failure than overstating it, and both are the same defect: a page describing a system that no longer exists.

## Where things stand

All eight PRDs are built. What blocks launch is in
`docs/pre-launch-checklist.md`, `docs/infrastructure-setup.md` and issue #9, and
almost all of it is a committee answer or an account somebody has to open.

An earlier version of this section said none of what remained was code. That was
read as "there is nothing to build" and it was wrong twice over: the content
boundary landed with nothing importing it, and section A7 of the checklist held
two webmaster items that were code and unblocked. Both are done. So, precisely:

**Done since the eighth PRD:** the pages read editorial content through the one
boundary (#47); the publication flow exists as far as it can without staging,
and the staging deploy shows drafts (#42); the legal pages are served in every
language the site is read in, with the Armenian ones falling back and saying so;
the contact page says what becomes of a message before it is sent; the vendored
CMS carries its licence and an integrity test; and three guards were added —
documents may not be referenced before they are written, links may not lead
nowhere, and the back-office bundle may not drift from its record.

**Still code, and small:**

- [#38](https://github.com/AlexikM/ugab-suisse/issues/38) — two test runners, one more than anybody wants. Not urgent; both run in CI.
- [#44](https://github.com/AlexikM/ugab-suisse/issues/44) — editor accounts, blocked on the committee's answer about logging in with an email address.
- Checklist A3 — the components the CMS fetches from unpkg while an editor works. Vendor them, or accept them in writing. The two options are set out in [`editorial/back-office-maintenance.md`](editorial/back-office-maintenance.md).

**Before concluding there is nothing left:** read
`docs/pre-launch-checklist.md` and ask, of each unticked item, whether it is
waiting on a person or on a commit. The ones waiting on a commit are the work.
