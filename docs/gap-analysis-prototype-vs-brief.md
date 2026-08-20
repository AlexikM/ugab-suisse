# Gap analysis — existing prototype vs. the brief

Compares the repo at tag `prototype-2026-08-20` against the committee brief:
the sitemap and approved copy (transcribed in `docs/content/site-copy.md`) and
the scope note. This is the cleanup backlog.

**Headline:** the prototype is a plausible-looking site built on invented
content. Almost none of the copy, none of the events, and none of the
photography survive contact with the brief. The structure is close but not
aligned.

## 1. Routes

| Brief | Repo today | Action |
| --- | --- | --- |
| `/` Accueil | `src/pages/index.astro` | Keep shell, replace all copy |
| `/a-propos` | `src/pages/histoire.astro` | **Rename route + file** |
| `/evenements` | `src/pages/evenements.astro` | Keep |
| Fiche événement | `src/pages/evenements/[slug].astro` | Keep, extend schema |
| `/don` (Don **& Sponsoring**) | `src/pages/don.astro` | Keep, **add the whole Sponsoring half** |
| `/contact` | `src/pages/contact.astro` | Keep, replace copy |
| (footer) mentions légales | `src/pages/mentions-legales.astro` | Keep |
| (footer) confidentialité | `src/pages/confidentialite.astro` | Keep, rewrite for real sub-processors |
| EN for every page | only `src/pages/en/index.astro` | **7 pages missing** |
| HY for every page | none | **entire locale missing** |

## 2. Navigation

`src/i18n/ui.ts` carries `nav.mission` and `nav.news` (Actualités). **Neither
exists in the brief.** The brief's header is exactly: Accueil · À propos ·
Événements · Faire un don & Sponsoring · Contact · FR/EN/HY · sticky Donate.

- Remove `nav.mission`, `nav.news`
- Rename `nav.history` → `nav.about`, label "À propos" / "About"

## 3. Content collections (`src/content.config.ts`)

**`events`** — `lang` enum is `['fr','en']`, needs `hy`. Missing fields the
brief's fiche événement requires:

- `program` (déroulé, intervenants, dress code)
- `pricing` (e.g. CHF 150 / pers · 250 / couple · 1'200 / table VIP)
- `capacity` (nombre de places) and `soldOut` (the automatic « Complet »)
- `ticketUrl` — `registrationUrl` exists and probably becomes this

**`antennes`** — Genève, Lausanne, Zurich. **Not in the brief at all.** The
brief describes a single Geneva-based Comité Suisse. Remove, or confirm with
the committee that antennes are real and in scope.

**`bureau`** — **missing entirely.** The brief requires one card per member
(Président, Vice-Président, Secrétaire Général, Trésorier) with HD portrait,
role, and a 4-line bio in FR and EN.

## 4. Content — all of it is placeholder

15 event files in `src/content/events/` are invented (gala des 120 ans,
concert Komitas, solidarité Artsakh…). The brief supplies **no real events**,
only a template to duplicate. Decide: clear them, or keep clearly flagged as
demo content until the committee provides real ones. They must not reach
production — a fictional CHF 150 gala at the Beau-Rivage is a reputational
problem, not a placeholder.

Every string in `src/i18n/ui.ts` is invented and must be replaced with the
brief's FR/EN copy. The brief supplies finished text for: hero, chiffres clés,
notre mission, appel aux dons, appel aux sponsors, the full À propos page
(histoire in 3 paragraphs, mission et valeurs, Le Comité Suisse, axes
d'action), the donation impact text and suggested-amounts table, the sponsor
argument and packages, contact, and every confirmation message.

### Naming conflict

The repo says **"UGAB Suisse" / "Section suisse"**. The brief says
**"UGAB Comité Suisse — Genève" / "Le Comité Suisse"**. Different framing of
the entity. Align on the brief and fix `site.title` and `site.tagline`.

### One string that is a live risk

`donate.tax`: *"Dons déductibles fiscalement en Suisse — un reçu vous est
automatiquement envoyé."* Two unverified claims — cantonal recognition of
public utility, and automatic receipting the free provider tier does not do.
**Blocks launch until verified** (PRD 7).

## 5. Images

Everything is in `public/images/` with generic names (`armenia-1.jpg`,
`church.jpg`, `folk-dance.jpg`) — i.e. exactly the "banque d'images
génériques" the brief forbids. Two jobs:

- Replace with committee photography (15–20 past events, 10+ Armenia/community)
- Move to `src/assets/` so `astro:assets` optimises and hashes them

## 6. Config

`astro.config.mjs` — add `hy` to locales; drop `base: '/ugab-suisse'` and set
`site` to the real domain once chosen (this also deletes the base-URL prefix
bugs the last five commits were fixing).

## 7. Third-party leakage (found by the compliance lane, 2026-08-21)

Not spotted in the first pass. The prototype contacts four external services on
page load, none disclosed anywhere:

| Where | What it contacts | Problem |
| --- | --- | --- |
| `src/layouts/Layout.astro` | `fonts.googleapis.com` / `fonts.gstatic.com` | Every visitor's IP to Google before a word renders. Self-host instead. |
| `src/pages/evenements/[slug].astro` | `openstreetmap.org` embed | Loads before anyone asks for a map. Defer to click. |
| `src/pages/contact.astro` | `api.web3forms.com` | Form SaaS the ADR rules out — and the access key is still `YOUR_ACCESS_KEY`, so the contact form does not work at all. |
| `public/admin/index.html` | `unpkg.com` at `^3.5.0` | Whole CMS from a CDN at an open version range. |

Each is a processor that would have to be disclosed, or removed. Removal is
cheaper in every case.

## 8. Fonts do not match the brief

The brief specifies Playfair Display or Montserrat for headings, Inter or Lato
for body. The prototype loads **Oswald, EB Garamond and Lato**. Two of the three
families are not in the brief at all, and none are self-hosted. Armenian is
absent entirely.

## 9. Invented contact details

`contact@ugab.ch` appears in the footer and `{geneve,lausanne,zurich}@ugab.ch`
in the antennes content. That domain is not the committee's and these addresses
reach nobody — while the privacy policy routes data-rights requests to one of
them.

## Summary of cleanup work

1. Rename `/histoire` → `/a-propos`; strip Mission/Actualités from nav
2. Add `hy` locale + fallback-to-FR; build EN and HY for all pages
3. Extend the `events` schema; add `bureau`; resolve `antennes`
4. Replace 100% of copy with the brief's FR/EN text; get HY from the committee
5. Purge or quarantine the 15 invented events
6. Add the Sponsoring half of `/don`
7. Replace placeholder photography; move images to `src/assets/`
8. Verify or delete the tax-deductibility claim
9. Remove the four undisclosed third-party services, or disclose them
10. Replace the font stack with the brief's families, self-hosted, incl. Armenian
11. Purge invented contact addresses
