## Problem Statement

The prototype in this repository looks finished and is almost entirely
fictional.

It has fifteen events that were invented — a 120th anniversary gala at the
Beau-Rivage, a Komitas concert, an Artsakh solidarity evening — none of which
the committee has ever announced. Its photography is generic stock imagery of
churches, folk dancers and landscapes, which is precisely what the brief
forbids. Every line of copy was written to fill a layout, while the committee
has separately supplied finished, approved text for every page. The site calls
the organisation "UGAB Suisse — Section suisse"; the committee calls itself
"UGAB Comité Suisse — Genève". The navigation offers Mission and Actualités,
neither of which exists in the agreed sitemap. The About page lives at
`/histoire` rather than the specified `/a-propos`. The donation page covers
donations but omits the entire Sponsoring half the brief pairs with it. There
is a collection modelling regional antennes in Lausanne and Zurich that appears
nowhere in the brief, and no model at all for the four committee officers the
About page is supposed to present.

Two risks follow. The smaller one is wasted effort: work built on the wrong
structure has to be redone. The larger one is reputational — a fictional
charity gala with a real hotel's name and real ticket prices is not a
placeholder, it is a false announcement waiting to be indexed, and this is an
organisation whose entire value proposition is a century of institutional
credibility.

## Solution

Align the site to the brief before building anything further on top of it.

Rename the routes and strip the navigation entries the sitemap does not
contain. Extend the event model to carry the fields the brief's fiche
événement actually specifies, add a model for the committee officers, and
resolve whether the antennes are real. Replace every string with the approved
French and English text the committee supplied. Remove the invented events
so that nothing fictional can reach production. Build the missing Sponsoring
half of the donation page. Move the placeholder photography into the optimised
asset pipeline so that real photographs, when they arrive, drop into a
structure that is already correct.

The result is a site whose structure, vocabulary and content match the agreed
documents, with placeholder material clearly quarantined rather than disguised
as real.

## User Stories

### Structure

1. As a visitor following a link from the committee's printed material, I want the About page at the agreed address, so that the URL the committee published actually resolves.
2. As the Comité, I want the navigation to contain exactly the five entries we agreed, so that visitors are not offered sections that do not exist.
3. As a visitor, I want the header and footer to match on every page, so that the site feels like one coherent whole.
4. As a visitor, I want the donation page to cover both giving and sponsorship, so that a company representative finds the partnership offer where the committee said it would be.
5. As a prospective sponsor, I want to see the partnership tiers and what each includes, so that I can judge whether to take the proposal to my board.
6. As the Comité, I want the legal and privacy pages reachable from the footer on every page, so that we meet our disclosure obligations.

### Vocabulary and identity

7. As the president, I want the site to call us "UGAB Comité Suisse — Genève" throughout, so that our name on the website matches our name everywhere else.
8. As the Comité, I want the site's own description to match the text we approved, so that we are not introduced to the public in words we did not write.
9. As a visitor, I want the organisation described consistently on every page, so that I understand what this committee is and how it relates to the wider AGBU.

### Content

10. As the Comité, I want every page to carry the exact French text we supplied, so that we do not have to re-read and re-approve invented copy.
11. As an English-speaking visitor, I want every page in English, not just the home page, so that I can read the whole site.
12. As the Comité, I want the founding history presented as we wrote it, so that the institutional credibility we are relying on is stated accurately.
13. As a potential donor, I want to read the impact argument the committee wrote, so that I understand what my money does before I am asked for it.
14. As a potential donor, I want to see the suggested amounts with their stated impact, so that I can choose a level of giving that feels meaningful.
15. As a visitor, I want the key figures — founded 1906, 30+ countries, 5 continents — presented as the committee specified, so that the scale of the organisation is clear.
16. As a visitor, I want to see the committee's areas of action described, so that I know what the organisation actually does.
17. As a visitor, I want the confirmation messages after contacting, donating or booking to be the wording the committee approved, so that the last thing I read sounds like them.

### The committee officers

18. As a visitor, I want to see who runs the committee, with a photograph, role and short biography, so that I know who I would be giving money to.
19. As the Comité, I want officers managed as structured entries rather than hand-written page markup, so that we can update the bureau after an election without a developer.
20. As the Comité, I want each officer's biography in French and English, so that the section works in both languages.
21. As the Comité, I want the section to render correctly while some officers are still missing their photograph or biography, so that we can publish before every member has supplied theirs.

### Events

22. As the Comité, I want the event model to carry the programme, pricing, capacity and venue fields our template specifies, so that an event page can be filled in without asking for a code change.
23. As a visitor, I want an event page to show me the programme, the dress code and the practical details, so that I know what I am attending.
24. As a visitor, I want to see ticket prices before I decide to book, so that I am not surprised at checkout.
25. As the Comité, I want to mark an event as sold out, so that we stop taking bookings for a full room.
26. As a visitor, I want past events shown with their photographs, so that I can see what these evenings are actually like before buying a ticket.
27. As the Comité, I want no invented event to be publishable, so that we never announce something that is not happening.
28. As the webmaster, I want demo content clearly separated from real content, so that it cannot be published by accident.
29. As a visitor to the home page, I want to see the next three events, so that I can find the soonest thing to attend without navigating.

### Photography

30. As the Comité, I want the site to use our own photographs rather than generic stock imagery, so that the site shows our actual community rather than an idea of it.
31. As a visitor on a phone, I want photographs to load quickly, so that I do not abandon the page before it renders.
32. As the webmaster, I want images processed and sized by the build rather than served at full resolution, so that a photography-heavy site is not slow.
33. As the Comité, I want a clear list of which photographs are still placeholders, so that we know exactly what we owe before launch.

### Regional presence

34. As the Comité, I want a decision recorded on whether the Lausanne and Zurich antennes exist and belong on the site, so that we do not publish a regional structure that does not exist or omit one that does.

## Implementation Decisions

**The brief is the source of truth.** Where the prototype and the supplied
documents differ, the documents win. Deviations are recorded as ADRs rather
than left as silent divergence. The detailed inventory of differences is
maintained in the repository's gap analysis and is the working checklist for
this PRD.

**Route rename.** The About page moves to the specified address. The previous
address issues a permanent redirect rather than disappearing, since it may
already have been shared.

**Navigation.** Reduced to exactly the agreed entries. The Mission and
Actualités entries and their translation keys are removed rather than hidden,
so that they cannot quietly return. Mission content is not lost — the brief
places it within the About page.

**Content model.** The event schema gains programme, pricing, capacity, a
sold-out flag and a ticket link. The sold-out flag is a manual field in this
PRD; deriving it from live provider stock is deliberately deferred to the
ticketing PRD, because it is the one requirement a static site cannot satisfy
without an external mechanism and it should be decided there, on its merits.

A collection for committee officers is added, carrying role, name, portrait and
a short biography per language. Roles are ordered explicitly rather than
alphabetically, since the brief presents them in hierarchical order. The
section tolerates missing portraits and biographies so that publication is not
blocked by the slowest contributor.

The antennes collection is removed unless the committee confirms otherwise.
It is not in the brief, and carrying an unexplained regional structure is worse
than omitting it. This is raised as a question rather than assumed, because it
is cheap to ask and expensive to guess wrong.

**Copy.** All French and English strings are replaced with the supplied text.
Armenian is explicitly not part of this PRD — the committee has not delivered
it, and the mechanism for a third locale belongs with the trilingual work.
Translation keys are restructured to follow the brief's own section names, so
that a future editor can find a string by looking at the page it appears on.

**Invented content.** The fifteen fictional events are removed from the content
directory. If demo content is wanted for development, it lives outside the
published collection so that no configuration mistake can publish it. This is
treated as a correctness requirement, not tidiness: the events name real venues
and real prices.

**Photography.** Images move from the public directory into the build's asset
pipeline so that they are optimised, hashed and responsive. Placeholder images
are retained temporarily but tracked in an explicit inventory of what the
committee still owes, so that the gap is visible rather than forgotten.

**One string is held back.** The claim that donations are tax-deductible with an
automatic receipt is not carried across in this PRD. Both halves are unverified
and it is handled under the compliance PRD.

## Testing Decisions

Tests here assert what a visitor can observe: that the agreed pages exist at
the agreed addresses, that the navigation offers what was specified, and that
nothing fictional is publishable. They do not assert the internal shape of
content files or component structure, which will change.

**Route coverage.** The built output is asserted to contain a page for every
entry in the agreed sitemap, in every configured language, and to redirect the
old About address. This runs against the build output, which is the highest
seam available for a static site and does not require a running server.

**Navigation.** The rendered header is asserted to contain exactly the agreed
entries and no others, on a representative page. This is a behavioural
assertion about what a visitor is offered, and it is what prevents removed
sections from creeping back.

**Content schema.** Content collections are validated at build time by the
existing schema mechanism; a missing required field fails the build. The test
worth writing on top is that an event missing optional fields still renders,
since the committee will publish incomplete events and the page must tolerate
it. The same applies to an officer without a portrait or biography.

**No fictional content.** The build fails if any event in the published
collection is marked as demo content. This is a guard, not a style check: it is
the mechanism that makes "no invented gala reaches production" a property of
the system rather than a thing someone remembers.

**Copy fidelity.** Spot-checked rather than exhaustively asserted. Asserting
every string against the source document produces a test that fails on every
legitimate wording change, which trains people to ignore it. A small number of
identity-critical strings — the organisation's name, the founding year, the
donation confirmation — are asserted; the rest is verified by review.

**Prior art.** None; the pipeline seam and build-output assertions established
in the foundations PRD are extended here.

## Out of Scope

- Armenian, the language selector's third option, and Armenian typography.
- Visual design, typography, colour and spacing decisions.
- Donation and ticketing provider integration. This PRD prepares the fields those flows will read; it does not connect them.
- Deriving sold-out status from live provider stock.
- The privacy policy, cookie approach and the tax-deductibility claim.
- Sourcing the real photography, the officer biographies and the Armenian translations. This PRD makes the structure ready and states precisely what is owed; obtaining it is the committee's side.
- Search engine optimisation and structured data.

## Further Notes

**The committee's content deliveries are the critical path**, not the
development work. This PRD can be completed with placeholders in place and
inventory documented, but launch cannot. The list of what is owed — logo,
past-event and community photography with consent for identifiable people, four
officer biographies and portraits, confirmed sponsorship tiers, official
contact details and the Armenian translations — should be tracked as its own
item and chased on its own schedule.

**The invented events are the highest-urgency item in this PRD.** Everything
else is rework; that one is a false public announcement attached to a real
hotel and a real institution's name.

**Sponsorship tier amounts are marked as indicative in the brief** and must be
confirmed by the committee before the page is published.

**The antennes question may be more significant than it appears.** If regional
antennes do exist, the brief's five-page sitemap may be incomplete and the
committee's own scope needs revisiting before, not after, the site is built.
