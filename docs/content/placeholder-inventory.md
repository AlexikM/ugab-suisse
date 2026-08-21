# Placeholder inventory — what is still not real

Everything listed here is standing in for something the Comité owes. It is
tracked in issue #9 (Fournitures du Comité). This file is the checklist: when
it is empty, the last invented element has left the site.

The brief forbids "banque d'images génériques". Every photograph currently on
the site is exactly that. They are kept only so that the layout is not empty
while the Comité gathers its own material, and they must not survive to launch.

> Consentement requis pour les personnes identifiables sur les photographies
> (LPD / RGPD). See PRD 7 (#7).

## Photographs in use

Four remain. They live in `src/assets/images/`, go through the build's image
pipeline, and are all decorative backgrounds — replacing one is a single import.

| File | Stands in for | Where it appears |
| --- | --- | --- |
| `geneva.jpg` | A photograph of Armenia, of the community, or of a Comité event | Home page hero |
| `archive.jpg` | An archive photograph of the AGBU's history | À propos hero |
| `concert.jpg` | A photograph of a past Comité concert or gala | Événements hero |
| `humanitarian.jpg` | A photograph illustrating the Comité's humanitarian work | Home donation call, Don hero |

Twenty-one further stock photographs were deleted rather than carried forward.
They are in the git history and on the `prototype/2026-08-20` branch if any turn
out to be wanted.

## Photographs still owed

| Element | Format | Status |
| --- | --- | --- |
| Logo | SVG + PNG HD, transparent background | ⬜ awaited — `public/logo.png` is the prototype's |
| Past-event photographs | JPEG HD — 15 to 20 minimum | ⬜ awaited |
| Armenia / community photographs | JPEG HD — 10 minimum | ⬜ awaited |
| Bureau portraits | 1 HD portrait per officer | ⬜ awaited — the section renders their initials until then |
| Event cover images | JPEG HD, landscape, 1920×1080 minimum | ⬜ awaited — no event is published yet |

Event covers and bureau portraits are still plain path strings rather than
build-processed images: where the CMS uploads media is PRD 4's decision, and the
pipeline choice follows it.

`public/hero.jpg` is **not unused** — this file said it was, and it is the one
placeholder that leaves the site. `socialImage()` in `src/seo.ts` makes it the
`og:image` of every page, so it is the picture that appears whenever anybody
shares any address of this site anywhere. A stock photograph is doing that job.
Replacing it is one file, and it should be among the first photographs the
Comité supplies rather than among the last.

## Text and data still owed

| Element | Where it bites | Status |
| --- | --- | --- |
| Bureau: names and 4-line biographies, FR and EN | `src/content/bureau/` is empty; the À propos section shows only its heading | ⬜ awaited |
| Official contact details — postal box, telephone, e-mail | `contactEmail` in `src/i18n/ui.ts` is the prototype's `contact@ugab.ch`; the Contact page says the rest is pending | ⬜ awaited |
| Social media accounts | The footer links to none rather than guessing | ⬜ awaited |
| Sponsorship tiers — confirmed amounts and counterparts | The Don page shows them marked "montants indicatifs, à valider" | ⬜ awaited |
| Armenian translations | The locale is built and every route exists; `armenian` in `src/i18n/ui.ts` is empty, so every page serves French and says so. Paste a page's keys in and that page becomes Armenian on its own (PRD 3, #3). The three legal pages take their words from `src/i18n/legal.ts`, which is FR/EN — see checklist A7 | ⬜ awaited |
| Real events | `src/content/events/` is empty; the Événements page says so | ⬜ awaited |
| Coordonnées bancaires — IBAN de l'association et banque | `bankAccount` in `src/i18n/ui.ts` is `null`; the QR-bill on the Don page renders « IBAN à fournir par le Comité » | ⬜ awaited |

## Claims that must be verified or deleted before launch

Neither is on the site. Both were on it, and both were removed on purpose.

| Claim | Why it was pulled |
| --- | --- |
| "Dons déductibles fiscalement en Suisse — un reçu vous est automatiquement envoyé" | Assumes cantonal recognition of public utility, and automatic receipting the free provider tier does not do. PRD 7 (#7). |
| "Reconnue d'utilité publique" | Same assumption, unverified. It was on `/mentions-legales`; PRD 7 replaced it with a statement that the Comité makes no such claim until a cantonal decision is produced. |
