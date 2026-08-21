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
- **Vendored third-party applications are not our source.** `public/admin/sveltia-cms-*.js` is exempt from the request and storage audits and from typechecking, by exact filename, for reasons written in `tests/compliance/lib/vendored.mjs`.
- **Disabling a workflow outlives rewriting it.** `deploy.yml` was disabled while it was the GitHub Pages workflow; the disable persisted through a full rewrite and the new pipeline silently never ran.
- **Absent configuration should skip, not fail.** A permanently red `main` teaches people to stop reading it.

## Where things stand

All eight PRDs are built as far as they can go without a domain, an account, or
a committee decision. What remains is in `docs/infrastructure-setup.md` and
issue #9, and none of it is code.
