## Problem Statement

The brief promises a site in French, English and Armenian, with an image
"à la hauteur de l'UGAB" — sober, professional, trustworthy. The prototype
delivers neither.

Armenian does not exist anywhere: not in the locale configuration, not in the
routing, not in the fonts. English exists on the home page and nowhere else, so
an English-speaking visitor who clicks past the front page silently falls back
into French. There is no design system — no colour tokens, no type scale — so
the brand palette the committee specified lives as scattered values rather than
as anything enforceable. The fonts are not loaded deliberately, which matters
disproportionately here because Armenian script has no fallback on most systems
and renders as empty boxes when the font stack forgets it.

The visitors this site is built to impress — Geneva diplomats, philanthropic
families, corporate sponsors evaluating a partnership — will judge the
organisation's seriousness in the first few seconds, on a phone, before reading
a word. And the Armenian-speaking part of the community is precisely the
audience most likely to notice that their language was an afterthought.

## Solution

Build the presentation layer properly, once: a third locale with honest
fallback behaviour, self-hosted typography that includes Armenian as a
first-class script, and a small set of design tokens that make the committee's
palette the only way to write a colour.

Add the tooling that keeps it that way — type checking, linting, formatting and
browser-level tests — so the quality does not depend on whoever last touched
the file. Modern defaults, chosen for being unremarkable and well supported
rather than clever, because the person maintaining this in 2029 has not met us.

## User Stories

### Languages

1. As an Armenian-speaking visitor, I want the site in Armenian, so that I can read about my own community's organisation in my own language.
2. As a visitor, I want to switch language from any page and stay on the page I was reading, so that switching does not throw me back to the home page.
3. As a visitor, I want my language choice to persist as I navigate, so that I do not have to re-select it on every page.
4. As a first-time visitor, I want the site to open in a sensible language for me, so that I am not made to choose before seeing anything.
5. As the Comité, I want a page with no Armenian translation to fall back to French rather than break or show an empty page, so that we can publish Armenian progressively.
6. As a visitor who hits a fallback, I want it to be obvious I am reading another language, so that I am not confused about what happened.
7. As the Comité, I want to add Armenian to a page later without a developer restructuring anything, so that translation is a content task.
8. As a search engine, I want each language version declared and cross-referenced, so that I show the right one to the right user.
9. As an English-speaking visitor, I want every page in English rather than only the home page, so that the whole site is usable.

### Typography

10. As an Armenian-speaking visitor, I want Armenian text rendered in a proper Armenian typeface rather than as empty boxes, so that the page is legible at all.
11. As a visitor, I want Armenian, French and English text to look like they belong to the same design, so that one language does not feel bolted on.
12. As the Comité, I want the typography to match the sober, elegant direction we specified, so that the site reflects the institution.
13. As a visitor on a slow connection, I want text to be readable while fonts load rather than invisible, so that the page is usable immediately.
14. As the Comité, I want fonts served from our own site rather than a third-party CDN, so that no external service is told who visits us.

### Visual identity

15. As the Comité, I want the site to use our palette — Armenian red, navy, gold, off-white — consistently, so that it looks designed rather than assembled.
16. As a developer, I want colours, spacing and type sizes defined once as tokens, so that a future change is one edit rather than a hunt.
17. As a visitor, I want the site to feel calm and uncrowded, so that it reads as an institution rather than a campaign.
18. As a visitor on a phone, I want every page to work as well as on a laptop, so that I can donate or book from wherever I am.
19. As a visitor, I want the "Faire un don" button visible at all times, so that I can act the moment I decide to.
20. As a visitor scrolling a long page, I want the header to stay reachable, so that I never have to scroll back up to navigate.

### Accessibility

21. As a visitor with low vision, I want sufficient contrast on all text, so that I can read it.
22. As a visitor using a keyboard, I want to reach every link and control in a sensible order with a visible focus indicator, so that I can use the site without a mouse.
23. As a visitor using a screen reader, I want images to carry meaningful descriptions and the page to have a proper heading structure, so that I can understand it.
24. As a visitor who prefers reduced motion, I want animations suppressed, so that the site does not make me unwell.
25. As a visitor, I want the language of each page correctly declared, so that my screen reader pronounces it properly.

### Discoverability

26. As someone searching for Armenian events in Geneva, I want the committee's events to appear in search results with their date and venue, so that I find them.
27. As someone sharing a page on social media, I want a proper title, description and image to appear, so that the link looks credible.
28. As a search engine, I want a sitemap listing every page in every language, so that I index the site completely.
29. As the Comité, I want the staging site excluded from search results, so that draft content is never found.

### Development quality

30. As a developer, I want type errors and broken content references caught before deploy, so that a mistake does not reach visitors.
31. As a developer, I want formatting and linting applied automatically, so that style is never a review discussion.
32. As a future maintainer, I want the stack to be conventional and well documented, so that I can pick it up without archaeology.
33. As a developer, I want the checks that run in CI to be runnable locally with one command, so that I can fix problems before pushing.

## Implementation Decisions

**Third locale.** Armenian is added to the framework's own i18n routing
alongside French and English, French remaining the unprefixed default. Using
the built-in mechanism rather than a bespoke one keeps the URL structure
conventional and the behaviour familiar to any developer taking over.

**Fallback is explicit, not silent.** A page without an Armenian translation
serves French content and says so, rather than failing or presenting French as
though it were Armenian. This is a product decision: the committee will deliver
Armenian progressively, and the site must be publishable in the meantime
without either lying or breaking.

**Fonts are self-hosted, with Armenian in every stack.** Latin display and body
faces per the brief's direction, plus a matching Armenian family, subset and
served from the site's own domain. Self-hosting is both faster and cleaner
privacy-wise than a third-party font CDN. The Armenian family is present in
every font stack, not only on headings — the common failure is a body style
that forgets it and renders boxes on one page nobody checked. Text stays visible
while fonts load.

**Design tokens.** The palette, type scale and spacing are defined once as
tokens in the existing Tailwind setup and consumed everywhere. Raw colour values
in components are treated as a defect.

**Sticky header.** The header and the donate call to action remain reachable
while scrolling, as the brief requires, without dominating the viewport on
small screens.

**Accessibility target is WCAG 2.2 AA.** Not a legal obligation for a private
Swiss association, but cheap when designed in and expensive to retrofit, and the
contrast and keyboard requirements overlap with plain quality.

**Structured data and social metadata** are generated from existing content
rather than hand-maintained, so they cannot drift from the page.

**Tooling — deliberately boring.** Strict type checking, the framework's own
content and type validation in CI, one tool for formatting and linting, and
browser-level tests for the assertions that matter. Everything runnable with a
single local command that mirrors CI. No tool is added that a competent
developer would not expect to find.

**Test level.** Browser-based tests are used for behaviour a visitor
experiences — language switching, keyboard navigation, the sticky button. Unit
tests are not introduced for presentation code; they would assert markup
structure, which is the thing most likely to change legitimately.

## Testing Decisions

Good tests here describe what a visitor can do, not how the markup is arranged.
Anything that asserts class names or element nesting will fail on every
redesign and teach the team to ignore failures.

**Language behaviour (primary seam — the browser).** Switching language from a
deep page lands on the same page in the new language. A page with no Armenian
translation serves French and announces the fallback. Each page declares its
own language. These are the assertions that protect the trilingual promise, and
they are exercised through the browser because that is where the behaviour
lives.

**Font coverage.** Armenian sample text is asserted to render in the intended
family rather than a fallback, on a body style as well as a heading. This is a
narrow, unglamorous test that catches the single most likely Armenian defect.

**Accessibility.** Automated accessibility checks run against a representative
page per template in CI, failing on violations. Automated checks catch perhaps
half of real problems, so a documented manual pass — keyboard traversal, screen
reader spot check, contrast on the gold-on-white combinations most at risk —
runs once before launch.

**Metadata and sitemap.** The built output is asserted to declare cross-language
alternates on every page and to list every page in every language in the
sitemap. Asserted against the build output rather than a live server, so it runs
on every pull request.

**Type and content validation.** Type checking and content schema validation run
in CI and fail the build. No separate tests are written for what the type system
already guarantees.

**Visual design is reviewed, not asserted.** No screenshot comparison. On a
site being actively designed it produces noise, and the committee's review on
staging is the real check.

**Prior art.** The build-output assertions and the deploy smoke check from the
earlier PRDs; this PRD adds the browser-level layer.

## Out of Scope

- Writing or sourcing the Armenian translations — the committee supplies them.
- Copy, structure and content model changes, covered by the alignment PRD.
- The CMS and how editors produce translations.
- Donation and ticketing flows, including the language of third-party checkout.
- Photography sourcing.
- Analytics and the cookie banner.

## Further Notes

**The Armenian checkout gap belongs here as an expectation, not a defect.** The
site will be trilingual; the donation and ticketing steps will be French or
English, because no Swiss payment provider offers Armenian. The committee should
be told plainly during this work rather than at the pre-launch check where the
brief has them verifying FR/EN/HY navigation.

**Armenian is on the committee's critical path, not ours.** The mechanism can be
finished and shipped with fallback in place; the language cannot appear until
the translations arrive.

**Resist adding tools.** The temptation on a small site is a component library,
an animation library, a state manager. Each is a dependency the next maintainer
inherits. The brief asks for sober and professional, which the platform already
does well.
