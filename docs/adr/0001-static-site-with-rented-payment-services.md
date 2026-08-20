# ADR-0001 — Static site with rented payment services, not WordPress

- **Status:** Proposed — blocked on committee validation of the WordPress question
- **Date:** 2026-08-20
- **Deciders:** webmaster + UGAB Comité Suisse
- **Supersedes:** the implicit stack of the existing prototype

> Docs are in English (engineering convention). Client-facing documents
> (the site copy in `docs/content/`, the future handover page) stay in French.

## Context

The cahier des charges asks for
a five-page trilingual site (FR/EN/HY) with online donations and event ticketing,
hosted at Infomaniak, with a **"back-office WordPress en français"**, for a
single **fixed all-inclusive fee**.

What already exists in this repo is a different thing: an Astro 6 + Tailwind 4
static site with Decap CMS, deployed to GitHub Pages, in FR/EN only. The two
descriptions have to be reconciled before any further work.

Three facts drive the decision:

1. **The client is a small volunteer association.** The committee turns over.
   Nobody will apply security updates. There is no maintenance budget and no
   line in the fee for one.
2. **The fee cannot absorb recurring costs.** A one-off fixed fee does not carry
   plugin licences (WPML, a donation plugin, a ticketing plugin) that renew
   annually and land on the committee from year two.
3. **It is a Swiss organisation.** nLPD *and* GDPR apply. Swiss donors expect
   TWINT, PostFinance and QR-facture, which are not first-class in the
   Stripe/PayPal framing of the brief.

### On "back-office WordPress"

Read as a technical requirement this is expensive and fragile. Read as what a
non-technical committee actually means, it decomposes into three needs:

- **Autonomy** — change events, photos and text without emailing the webmaster.
- **Non-lock-in** — any freelancer can take over when the current one moves on.
  This is the unstated but rational one for a volunteer committee.
- **A French admin that looks like software** — a login, a menu, buttons.

The first and third are satisfied by any decent CMS. The second is the one that
genuinely favours WordPress, and it is the reason this ADR is *Proposed* rather
than *Accepted*: it is the committee's call, not ours.

## Decision

Build a **statically generated Astro site**, hosted at **Infomaniak**, with a
**git-backed French CMS**, and **every money flow delegated to a Swiss payment
provider**. Nothing that handles money is built in-house.

| Layer | Choice | Why |
| --- | --- | --- |
| Site | Astro 6 static + Tailwind 4 | Already built; no runtime to patch |
| Hosting | Infomaniak (CH) | Swiss data residency; mail bundled; as specified |
| CMS | Sveltia CMS (fallback: Storyblok) | Drop-in for the existing Decap config; content stays in git; FR UI; CHF 0 |
| Donations | RaiseNow Free or Payrexx | TWINT, PostFinance, QR-facture, recurring; no monthly fee |
| Ticketing | Billetweb (or provider pay-links, reduced scope) | Ticket types, stock, e-tickets, door check-in |
| Forms | One PHP handler on Infomaniak + Cloudflare Turnstile | No form SaaS; no personal data leaves CH |
| Analytics | Cookieless (Umami/Plausible) or none | Removes most of the consent banner |

Target recurring cost: **under CHF 150/year** excluding payment fees.

### Guiding principle

**Optimise for abandonment.** The site must still work, untouched, in three
years. Every feature that requires maintenance is a liability, not an asset.

## Alternatives considered

**WordPress on Infomaniak, as literally specified.** Rejected for now: an
unmaintained WordPress becomes a compromised WordPress, and the fee funds no
maintenance. Recurring plugin licences push year-two cost to roughly
CHF 400–600. *Revisit if the committee's priority is provably succession* — in
that case this ADR is superseded and PRDs 1–3 are rewritten.

**Astro + Decap CMS (the status quo).** Rejected: the Decap login path in
`public/admin/config.yml` points at Netlify's OAuth broker with no Netlify site
behind it, so it does not currently work on GitHub Pages; and upstream release
cadence has been sporadic. Sveltia reads the same config, so this is a swap,
not a rebuild.

**Stripe for donations and ticketing.** Rejected as primary: no PostFinance Pay,
weaker TWINT/QR-facture story, and a developer-facing dashboard where the
committee's treasurer needs a fundraising-facing one in French. Retained as a
fallback if the Swiss providers disappoint on form design control.

**Building ticketing in-house.** Rejected outright. Regulated, high-stakes,
constantly moving, and impossible within the fee.

## Consequences

**Positive**

- Nothing to patch; the site survives neglect.
- Recurring cost small enough to stay invisible in an association budget.
- Content lives in git, so "pleine propriété du Comité" is literally true.
- Swiss hosting and Swiss payment providers give a clean nLPD answer.

**Negative / accepted trade-offs**

- **The committee cannot add or restructure pages themselves.** Only the fields
  we model. This must be said explicitly, not discovered post-launch.
- **Payment and ticketing steps will be FR/EN, never Armenian.** No Swiss PSP
  offers an Armenian checkout. The site is trilingual; the checkout is not.
- **Sold-out status is not live.** A static page cannot know remaining stock;
  handled by an embedded widget or a manual flag (see PRD 6).
- **Automatic tax receipts are not on the free tier.** Attestations issued
  manually by the committee once a year (see PRD 5).
- Embedded third-party payment forms constrain the visual identity, which the
  brief treats as important.

**Immediate**

- Repository made private on 2026-08-20 — the brief is confidential.
- GitHub Pages stops serving a private repo on a free plan; the preview URL may
  be down until hosting moves to Infomaniak.
- Prototype preserved as tag `prototype-2026-08-20` and branch
  `prototype/2026-08-20`, plus archives in
  `../ugab-suisse-prototype-2026-08-20/`.

## Open questions blocking acceptance

1. **Is "WordPress" a requirement or vocabulary?** Gates this whole ADR.
2. **Must editors log in with only an email address?** Sveltia vs Storyblok.
3. **Scanned tickets at the door, or a printed guest list?** Billetweb vs pay-links.
4. **"Gestion des places"** — capacity only, or table assignment for the gala?
5. **Attestation fiscale** automatic, or issued yearly by the committee?

## References

- Cahier des charges + Textes du site, received 2026-08-20 (held outside the repo — contractual terms are deliberately not committed)
- RaiseNow pricing: https://www.raisenow.com/en-ch/pricing-plans
- Payrexx pricing: https://payrexx.com/en/pricing/
