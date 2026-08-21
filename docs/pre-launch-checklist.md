# Pre-launch compliance checklist

Run this jointly with the committee before the site goes public, and keep the
completed copy. It exists because the interesting compliance questions cannot be
tested: whether a claim about Swiss tax law is true, whether a person in a
photograph agreed to be there, whether the treasurer can actually issue the
receipt the site promises.

Every item names an owner in **bold**. An item with no owner belongs to nobody
and gets done by nobody.

> Written in English because it is an engineering document, with the questions
> that go to the committee reproduced in French so they can be sent as they are.

**How to run the automated half:**

```sh
npm run build
node --test "tests/compliance/**/*.test.mjs"
```

Three checks are marked `todo` in that suite. They are expected to fail today and
must pass before launch — each one is a section A item below.

---

## A. Blocks launch

Nothing here is a wording preference. Each item is either a statement the site
makes that nobody has verified, or a third party receiving visitor data that
nobody agreed to.

### A1 — The tax-deductibility claim

The donation page tells donors their gift is deductible in Switzerland and that a
receipt is sent automatically. **Neither half is verified.** This is the single
highest-risk sentence on the site: a charity telling a donor something untrue
about their taxes.

- [ ] **President** — produce the cantonal decision recognising the association as being of public utility (*reconnaissance d'utilité publique*, Administration fiscale cantonale genevoise), or confirm in writing that there is none.
- [ ] **Treasurer** — state how a donor actually obtains an attestation: who issues it, on what trigger, and by when in the year.
- [ ] **Webmaster** — if the decision exists, publish the claim with its real conditions, including who issues attestations and when. If it does not, remove both the deductibility claim and the automatic-receipt promise from `donate.tax` and anywhere else they appear.

The question to send, verbatim:

> Le site indique aujourd'hui que les dons sont « déductibles fiscalement en
> Suisse » et qu'« un reçu vous est automatiquement envoyé ». Avant la mise en
> ligne, nous avons besoin de deux confirmations écrites :
>
> 1. Le Comité dispose-t-il d'une décision cantonale d'exonération pour utilité
>    publique permettant aux donateurs de déduire leurs dons ? Si oui, pouvez-vous
>    nous en transmettre une copie ?
> 2. Qui établit les attestations de dons, à quel moment de l'année, et sur quelle
>    demande ? Le prestataire de paiement retenu n'en émet pas automatiquement.
>
> Sans ces confirmations, nous retirons les deux phrases. Annoncer une
> déductibilité à un donateur qui ne pourra pas déduire est le seul risque que
> nous ne pouvons pas prendre à votre place.

*Automated check: `no third party...` — see `legal-pages.test.mjs`, marked `todo`.*

### A2 — The privacy correction

The committee's supplied wording said personal data is *jamais partagées avec des
tiers*. The published policy no longer says it, because a Swiss host, a payment
provider, a ticketing provider and an anti-spam service all receive some of it.
The intent — nothing is sold or traded — is preserved and is true.

- [ ] **Webmaster** — walk the committee through the rewritten policy before launch. This lands better explained than discovered.
- [ ] **Committee** — confirm the processor list is complete: is any supporter data handled anywhere else? A membership spreadsheet, a mailing list, a shared drive?

### A3 — Third parties the site contacts that nobody agreed to

Each is introduced by a file owned by another workstream. Because they are real,
the privacy policy admits to them: they are listed under `preLaunchExceptions` in
`src/i18n/legal.ts` and rendered on the page as "retiré avant le lancement",
because a policy that quietly omitted the fonts CDN it loads on every page would
repeat the exact failure this rewrite exists to correct.

As each is fixed, delete it from **both** `preLaunchExceptions` and
`tests/compliance/lib/launch-blockers.mjs` — a test fails if the two disagree.
When the lists empty, the pre-launch section disappears from the page on its own
and the `todo` marker comes off the audit's last test.

- [x] **Webmaster** — `fonts.googleapis.com` / `fonts.gstatic.com`: **done.** The typefaces are self-hosted as woff2 subsets in `public/fonts/`; the stylesheet link and both preconnect hints are gone from the layout.
- [x] **Webmaster** — `www.openstreetmap.org`: **done.** The venue map no longer loads with the page; the address is written out with an explicit link the visitor chooses to follow.
- [x] **Webmaster** — `api.web3forms.com`: **done.** The third-party form post is removed. The contact route now gives the committee's address and a mailto, with a stated pending state, until PRD 1 provides the Infomaniak handler and Turnstile.
- [ ] **Webmaster** — `unpkg.com`: **half fixed.** The `/admin` shell and the CMS application bundle are now vendored at a pinned version, so an open version range no longer decides what code the back-office runs. The application still fetches components (Shiki, its own packages) from unpkg while running, so an editor session still depends on that CDN. No visitor page reaches any of it, and the privacy page says so. Either vendor the runtime-fetched components too, or accept the residual dependency in writing.

*Automated check: `no third party remains that the committee never agreed to` — `third-party-requests.test.mjs`, marked `todo`.*

### A4 — Facts the committee still owes

- [ ] **Treasurer** — the association's IBAN and the bank holding the account, in writing. Until then the QR-bill on the donation page cannot be paid.

The legal pages render these as visible "à fournir par le Comité" placeholders
rather than inventing them. The prototype had invented `contact@ugab.ch`, which
still appears in the site footer and reaches nobody — and which the privacy
policy would be directing rights requests to.

- [ ] **Committee** — postal address of the association (or its case postale).
- [ ] **Committee** — the mailbox that will actually be read, for rights requests and accessibility reports.
- [ ] **Committee** — telephone number, if one is to be published.
- [ ] **Committee** — IDE / register number, if the association is registered.
- [ ] **Webmaster** — replace the invented footer address once the real one exists.

*Automated check: `no page shows a contact address the committee never confirmed` — `legal-pages.test.mjs`, marked `todo`.*

### A5 — Hosting matches what the legal notices say

The legal notices name Infomaniak in Switzerland, per ADR-0001. The site is
currently built for GitHub Pages, and the prototype's notices claimed Cloudflare.
A legal notice naming the wrong host is a false statement, however harmless it
looks.

- [ ] **Webmaster** — confirm the site is served from Infomaniak before launch, or correct the notices to name whoever actually serves it.
- [ ] **Comité + webmaster** — the hosting account, the domain and the deploy credentials do not exist yet. The ordered list of what has to happen, and in what order, is [`infrastructure-setup.md`](infrastructure-setup.md). The pipeline that will use them is [`deploy-pipeline.md`](deploy-pipeline.md).

### A6 — Photograph consent

- [ ] **Committee** — confirm that every identifiable person in the supplied event photographs agreed to publication. This is a condition of supply, not something to sort out afterwards.
- [ ] **Committee** — nominate who handles a takedown request and how fast.

### A7 — The legal pages must be reachable, in every language, and actually checked

Written but not wired. Each of these is in a file owned by another workstream.

- [ ] **Webmaster** — link the accessibility statement from the site footer. It offers someone a way to complete a donation the site blocks them from making; a route only reachable through the privacy policy is not a route.
- [ ] **Webmaster** — publish the English legal pages. The English copy is already written in `src/i18n/legal.ts` and renders nowhere: `enRoutes` in `src/i18n/utils.ts` lists only `/`. Two visitors the policy is written for — an EU donor exercising GDPR rights, an English-speaking supporter — currently get French or nothing.
- [ ] **Committee** — supply the Armenian translations of the three legal pages, or decide explicitly that the legal pages stay FR/EN on a trilingual site. Either is defensible; silence is not.
- [x] **Webmaster** — wire the compliance suite into `npm run test` and the pull-request workflow: **done**, and it now also gates publication. `npm run test` chains the compliance suite, `ci.yml` runs it on every pull request, and `deploy.yml` calls that same workflow as a job every publish depends on. A commit that fails it cannot reach the published site. Until that last part landed, the privacy policy's claim that an automated check compares its list against the published site was true of the code and untrue of the pipeline — see [issue #33](https://github.com/AlexikM/ugab-suisse/issues/33) and [`deploy-pipeline.md`](deploy-pipeline.md).
- [ ] **Webmaster** — tell people what happens to a contact message *before* they send it, next to the send button, with a link to the policy. Written for, but not reachable from, the contact page.

### A8 — The ADR is still Proposed

- [ ] **Committee** — answer the WordPress question. ADR-0001 is blocked on it, and every processor named in the privacy policy follows from it. If the answer changes the stack, the policy is rewritten.

---

## B. Re-run after the payment and ticketing providers are configured

- [ ] **Webmaster** — set each provider's return URL to the confirmation page for the language the visitor was reading: `returnRoutes` in `src/i18n/ui.ts` lists both, and each exists in all three locales.
- [ ] **Webmaster** — decide what happens to the first-party amount picker on the donation page once the embed brings its own.
- [ ] **Webmaster** — restore the receipt-by-email sentences to the confirmation copy, once a provider genuinely sends them, and update the test that currently forbids them.

The providers land late and are exactly what adds third-party hosts, sets
storage and invalidates the disclosure. The policy is accurate on the day it is
written and not afterwards unless someone looks again.

- [ ] **Webmaster** — flip the payment, ticketing and Turnstile entries in `src/i18n/legal.ts` from `planned` to `active` and record their real hostnames.
- [ ] **Webmaster** — re-run the build and the compliance suite. The audit fails if a provider is integrated but still described as not connected, and fails if it contacts a host the policy does not name.
- [ ] **Webmaster** — re-run the audits in a real browser as well, with the network panel recording, on the donation page and one event page. The static audit reads the build output; only a browser sees what a provider's own embed loads once it is running.
- [ ] **Webmaster** — check browser storage on those same pages, before touching anything. Anything set on load is a consent question the site does not otherwise have.
- [ ] **Committee** — remove the pre-launch notice from the privacy policy once nothing is `planned` any more. It disappears on its own when the register is clean.
- [ ] **Webmaster** — identify which providers need a data processing agreement and tell the committee which ones to sign.

---

## C. Joint verification with the committee

The walkthrough the brief describes. Run it together, on the real site, and keep
the result.

- [ ] **Committee + webmaster** — every page in all three languages, including the Armenian the committee supplies.
- [ ] **Treasurer** — a real test donation, carried through to the bank. Confirm the amount arrives, the confirmation email is right, and the wording matches what A1 concluded.
- [ ] **Committee** — a real test booking, carried through to the e-ticket, and check it against however the door is actually run.
- [ ] **Committee** — send the contact form and the sponsorship form; confirm both arrive in a mailbox someone reads.
- [ ] **Committee + webmaster** — every page on a phone, including the donation and booking steps.
- [ ] **Webmaster** — keyboard-only pass over the whole site, and a screen-reader pass over the donation flow.
- [ ] **Webmaster** — verify each claim the accessibility statement makes, rather than assuming it: full keyboard reach with a visible focus indicator, text contrast against the brand colours, heading order, alt text on meaningful images, and `prefers-reduced-motion` respected. The statement is a promise; this is where it becomes true.
- [ ] **Webmaster** — handover of every account, per PRD 8. Nothing should be reachable only through the webmaster's own login. The transaction has a checklist of its own: [`comite/proces-verbal-de-remise.md`](comite/proces-verbal-de-remise.md), against the filled-in [`comite/carte-des-comptes.md`](comite/carte-des-comptes.md).

---

## D. When a rights request arrives

Someone will write asking what you hold about them, or asking you to delete it.
The privacy policy promises an answer within 30 days.

The committee's own copy of this, in French and alongside the other things that
go wrong, is in [`comite/en-cas-de-probleme.md`](comite/en-cas-de-probleme.md).
The procedure below is the source; that page points back here rather than
restating it.

- [ ] **Committee** — decide who monitors the mailbox and who answers.
- [ ] **Committee** — the routine: acknowledge; search the contact mailbox, the donation provider's dashboard and the ticketing provider's dashboard; reply with what is held, why, and for how long.
- [ ] **Committee** — know the one answer that is a refusal: accounting records for donations and ticket sales cannot be deleted before their legal retention runs out. Say so plainly and explain why, rather than going quiet.
- [ ] **Committee** — anything unclear goes to the webmaster before an answer is sent, not afterwards.

---

## E. If data is ever exposed

- [ ] **Committee** — one named person decides. Improvising this during an incident is how small problems become public ones.
- [ ] **Committee** — the sequence: contain it, write down what happened and when, work out whose data is affected, then notify. In Switzerland, the PFPDT, as soon as practicable. If the risk to people is high, tell them directly too.
- [ ] **Committee** — most realistic case for this site: a mailbox compromised, or a provider's own breach. Ask each provider, in advance, how they notify you.
- [ ] **Webmaster** — keep the incident note with this checklist. What was decided matters more later than it feels at the time.

---

## F. Record of the run

| | |
| --- | --- |
| Date run | |
| Present | |
| Section A cleared by | |
| Outstanding items and why they were accepted | |
| Next review date | |

Keep the completed copy. It is the record that this was taken seriously, which is
the point of writing it down rather than talking about it.

---

## Not covered here

This checklist does not establish that the privacy policy is legally sufficient.
Nobody involved in building the site is in a position to say that. The engineering
commitment is narrower and testable: **the policy accurately describes what the
system does**, and the compliance suite fails the build when it stops doing so. If
the committee wants an opinion on sufficiency, that is a question for a lawyer.
