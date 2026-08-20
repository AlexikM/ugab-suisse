# UGAB Comité Suisse — website

The website of the AGBU Swiss Committee (Union Générale Arménienne de
Bienfaisance, Geneva): five pages, online donations and event ticketing, in
French and English — with Armenian to follow, which the design has to
accommodate from the start rather than bolt on. See [Known gaps](#known-gaps)
for what is not there yet.

It is a **statically generated site** — every page is built to plain HTML at
deploy time. There is no server, no database and no CMS runtime to keep patched.
That is a deliberate decision, not a shortcut: the association is run by
volunteers, the committee turns over, and there is no maintenance budget. The
site has to still work, untouched, in three years. The reasoning is in
[`docs/adr/0001-static-site-with-rented-payment-services.md`](docs/adr/0001-static-site-with-rented-payment-services.md).

| | |
| --- | --- |
| Framework | [Astro](https://docs.astro.build) 6, static output |
| Styling | Tailwind CSS 4 |
| Content | Markdown files in `src/content/`, versioned in git |
| Language | Interface and documentation code in English; everything a visitor or the committee reads, in French |

## Running it locally

You need **Node 22.12 or newer** and npm. Nothing else — no database, no
Docker, no environment variables.

```sh
git clone git@github.com:AlexikM/ugab-suisse.git
cd ugab-suisse
npm install
npm run dev          # http://localhost:4321
```

For the browser tests you also need Playwright's browser, once per machine:

```sh
npx playwright install chromium
```

## Commands

All commands are run from the root of the project.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload, on `localhost:4321` |
| `npm run build` | Builds the site to `dist/` |
| `npm run preview` | Serves `dist/` locally, as it will be served in production |
| `npm run typecheck` | `astro check` — types, content collections and route references |
| `npm run lint` | Reports formatting and lint violations, changing nothing |
| `npm run format` | Applies formatting and the safe fixes |
| `npm test` | Assertions against the built site (needs `npm run build` first) |
| `npm run test:e2e` | Browser tests (needs `npm run build` first) |
| **`npm run check`** | **Everything CI runs, in the order CI runs it** |

`npm run check` is the one to remember. It runs the type check, the linter, the
build and both test suites — the same steps as
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), so anything that fails
on a pull request can be reproduced and fixed locally before pushing.

Formatting and linting are a single tool, [Biome](https://biomejs.dev)
(`biome.json`) — not ESLint plus Prettier. One binary, one config file, nothing
to keep alive.

## Layout

```
src/
  pages/          One file per route; the file name is the URL
  layouts/        Page shells
  components/     Header, footer, and the like
  content/        Events and other editable content, as Markdown
  i18n/           Interface strings per language
  styles/         Tailwind entry point and global styles
public/           Served verbatim: images, favicon, CMS admin page
tests/            See below
docs/             Decisions, specifications and approved copy
dist/             Build output — generated, never committed
```

## Tests

Assertions describe what a visitor can do or what the built site contains.
Nothing asserts class names or element nesting: those change legitimately on
every redesign, and tests that break on them teach the team to ignore failures.

| Directory | Runner | What belongs there |
| --- | --- | --- |
| `tests/build/` | Vitest | The built output — URLs, metadata, the sitemap |
| `tests/content/` | Vitest | Content collections and the copy they carry |
| `tests/compliance/` | Vitest | Legal, privacy and consent obligations |
| `tests/e2e/` | Playwright | Behaviour in a real browser — language switching, keyboard navigation |

The Vitest suites read `dist/`, so they need a build first; `npm run check`
does that for you. Playwright builds nothing itself either — it serves `dist/`
through `npm run preview`.

`tests/build/base-path.test.ts` is worth knowing about: it fails the check if
any URL in the built output does not carry the configured path prefix, or still
carries the old `/ugab-suisse` one after the prefix is removed. It exists
because five consecutive commits were spent fixing exactly that.

## Deployment

Today, pushing to `main` publishes to **GitHub Pages** through
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The site is
served from a subdirectory, which is why `astro.config.mjs` sets
`base: '/ugab-suisse'` and why every internal URL has to go through it.

This is temporary. Hosting moves to Infomaniak — Swiss hosting, Swiss data
residency, the association's own domain — at which point the base prefix is
removed. That work is [PRD 1](docs/prd/01-foundations-and-ownership.md), and it
is blocked on the committee registering the domain.

Pull requests and pushes to `main` run
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), which is `npm run
check`. It is a separate workflow from the deploy, and — worth knowing before
you push straight to `main` — **it does not currently gate publication**: the
two start at the same time, so a commit that fails the checks is published
anyway. A commit that does not build cannot publish, since the deploy builds
too. Closing that gap belongs with the move to Infomaniak and is tracked in
[issue #33](https://github.com/AlexikM/ugab-suisse/issues/33).

## Where the decisions live

| Path | What it is |
| --- | --- |
| [`docs/adr/`](docs/adr/) | Architecture decisions — the *why*, including what was rejected |
| [`docs/prd/`](docs/prd/) | One product requirements document per delivery slice; each is also a GitHub issue |
| [`docs/content/site-copy.md`](docs/content/site-copy.md) | **The committee's approved copy — the source of truth for every visible string** |
| [`docs/gap-analysis-prototype-vs-brief.md`](docs/gap-analysis-prototype-vs-brief.md) | What the current site gets wrong against the brief |

Where the code and `site-copy.md` disagree, the copy wins — unless the
deviation is written up as an ADR.

The committee's original PDFs are deliberately not committed: they carry
contractual terms that do not belong in version control. Their substance is in
the documents above.

## Known gaps

The site currently visible is a **prototype**, and parts of it are invented.
Before launch, and tracked in
[issue #9](https://github.com/AlexikM/ugab-suisse/issues/9):

- **The events are fictional** — invented events naming real venues at real
  prices. Treat this as a correctness problem, not as placeholder text.
- **The photography is stock**, which the brief forbids. The committee supplies
  its own.
- **Armenian does not exist yet.** The mechanism ships with a French fallback;
  the translations are the committee's to deliver.
- **Two claims must not be repeated** until verified: that donations are tax
  deductible with an automatic receipt, and that data is "jamais partagées avec
  des tiers".

## Editor setup

Recommended extensions: the official
[Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)
extension, and [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
set as the default formatter so that `npm run lint` never has anything to say.
