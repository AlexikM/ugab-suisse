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

Each is introduced by a file owned by another workstream and recorded in
`tests/compliance/lib/launch-blockers.mjs`. Delete the entry there as each is
fixed; when the list empties, remove the `todo` marker on the audit's last test.

- [ ] **Webmaster** — `fonts.googleapis.com` and `fonts.gstatic.com`: every page sends the visitor's IP address to Google in the United States before rendering. Self-host the three typefaces and remove the stylesheet link and both preconnect hints.
- [ ] **Webmaster** — `www.openstreetmap.org`: the venue map iframe loads with the event page, sending the visitor's IP address to the OpenStreetMap Foundation before they showed any interest in the map. Use a static image plus a link, or load on click. The address is already written out beside it.
- [ ] **Webmaster** — `api.web3forms.com`: the contact form posts the sender's name, email and message to a third-party form service, which ADR-0001 rules out precisely so message content stays in Switzerland. Its access key is also still the literal placeholder, so the form does not work. Replace with the Infomaniak mail handler and Turnstile.
- [ ] **Webmaster** — `unpkg.com`: the `/admin` CMS shell loads its whole application from a public CDN at an open version range. No visitor data, but the back-office depends on a third party staying up and serving unreviewed code. Pin it and serve it from the site's own origin.

*Automated check: `no third party remains that the committee never agreed to` — `third-party-requests.test.mjs`, marked `todo`.*

### A4 — Facts the committee still owes

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

### A6 — Photograph consent

- [ ] **Committee** — confirm that every identifiable person in the supplied event photographs agreed to publication. This is a condition of supply, not something to sort out afterwards.
- [ ] **Committee** — nominate who handles a takedown request and how fast.

### A7 — The ADR is still Proposed

- [ ] **Committee** — answer the WordPress question. ADR-0001 is blocked on it, and every processor named in the privacy policy follows from it. If the answer changes the stack, the policy is rewritten.

---

## B. Re-run after the payment and ticketing providers are configured

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
- [ ] **Webmaster** — handover of every account, per PRD 8. Nothing should be reachable only through the webmaster's own login.

---

## D. When a rights request arrives

Someone will write asking what you hold about them, or asking you to delete it.
The privacy policy promises an answer within 30 days.

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
