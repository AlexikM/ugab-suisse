# The deploy pipeline

How the site gets published, what stops a broken commit from being published,
and how to undo a bad release. Written for whoever holds this project next.

> English, because it is an engineering document. Everything the committee reads
> is in [`comite/`](comite/).

## What happens on a push

```
push to main      ──▶  Deploy / Checks  ──▶  Deploy / Production  ──▶  smoke check
push to staging   ──▶  Deploy / Checks  ──▶  Deploy / Staging     ──▶  smoke check
```

Three workflow files, and the split matters:

| File | What it is |
| --- | --- |
| `.github/workflows/ci.yml` | `npm run check`, step for step. Runs on pull requests, and is **called** by the deploy. |
| `.github/workflows/deploy.yml` | The entry point. Decides the environment, then calls publish once. |
| `.github/workflows/publish.yml` | The publish itself, parameterised. Called twice, written once. |

## The gate

`deploy.yml` calls `ci.yml` as a job and every publish job `needs` it. **A commit
that fails the checks cannot reach the published site.**

This closes [issue #33](https://github.com/AlexikM/ugab-suisse/issues/33). Before
it, CI and the GitHub Pages deploy were two workflows triggered by the same push
and unaware of each other: they raced, and a commit with type errors, lint
violations or failing tests published anyway. The red cross appeared next to a
change that was already live.

It is called rather than copied on purpose. A duplicated list of steps drifts,
and the day it drifts is the day the gate stops meaning anything. The single
practical consequence is that `ci.yml` has no `push` trigger for `main` — a push
to main runs the checks through the deploy, once.

The check that matters most in this repository runs there: the content suite
that fails the build on an invented event or a placeholder that reached the site.
Until now it could not stop a publish. Now it can.

**Worth doing alongside this:** protect `main` so changes arrive through pull
requests with a required status check. The pipeline stops a failing commit from
publishing; branch protection stops it from reaching `main` at all. A volunteer
pushing a quick correction straight to main is the case that protects.

## Environments

| | Production | Staging |
| --- | --- | --- |
| Branch | `main` | `staging` |
| Indexed | Yes | **No** |
| Public | Yes | **No** — HTTP basic authentication |
| Secret prefix | `PROD_` | `STAGING_` |

`workflow_dispatch` publishes any branch or tag to either environment, chosen
from a dropdown. It defaults to staging.

### Why staging is shut, twice

The committee reviews real names, real photographs and test transactions there.

The layout already reads `PUBLIC_SITE_INDEXABLE` to decide whether to emit a
`noindex` meta tag. The pipeline sets it — `true` for production, `false` for
staging — so **one flag decides**, rather than a second mechanism drifting away
from the first.

Two things that flag cannot do on its own:

1. **`robots.txt` does not exist in this repository.** The comment in
   `src/layouts/Layout.astro` says robots.txt disallows everything; there is no
   `public/robots.txt` and the build produces none. Until one exists, a staging
   publish writes a disallow-everything `robots.txt` into the output it
   transfers, from the same flag. Production is left alone, so a real
   `public/robots.txt` can appear later without a collision.
2. **Basic authentication is configured at Infomaniak**, not here. The pipeline
   cannot switch it on — but it refuses to take it on trust: the staging smoke
   check makes an unauthenticated request first and **fails unless it is
   refused with a 401**.

## Atomicity

A failed transfer must never leave a half-published site. The sequence:

1. rsync the build into `<deploy path>.incoming-<run id>` — a **sibling** of the
   live directory, so the swap that follows is a rename inside one filesystem
   rather than a copy. Nothing under the live path is touched.
2. On the server, refuse to go further if the transferred directory has no
   `index.html`.
3. `mv` the live directory to `<deploy path>.previous`.
4. `mv` the incoming directory to the live path.
5. Delete the release before the previous one.

Steps 3 and 4 leave a window of a fraction of a second in which the live path
does not exist. There is never a window in which it holds half a site, which is
the failure worth preventing. Truly atomic would mean serving from a symlink and
swapping the symlink, which needs a document-root layout Infomaniak's manager
does not give us from a script.

If the run fails anywhere, the incoming directory is removed and the live site is
exactly as it was.

## Rollback

**The fast way — the previous release is still on the server.** One command, no
build, no CI:

```sh
ssh user@host
LIVE=/path/to/site
mv "$LIVE" "$LIVE.rolling"
mv "$LIVE.previous" "$LIVE"
mv "$LIVE.rolling" "$LIVE.previous"
```

Reversible: run it again and you are back. Only one release is kept, so this
undoes exactly one deploy.

**The clean way — republish an earlier commit.** Actions → Deploy → Run workflow,
pick the branch or tag, pick the environment. It goes through the checks like
anything else. Slower, and it leaves the repository and the published site
agreeing with each other, which the fast way does not.

Use the fast one to stop the bleeding, the clean one to finish.

## The smoke check

After every publish, the pipeline requests the deployed URL and asserts:

- HTTP 200;
- a body that contains `<html lang=` — a marker, not a byte comparison, so that
  it survives a redesign and still fails on an Apache error page, a directory
  listing or a parked-domain placeholder;
- on staging, that an unauthenticated request was refused first, and that
  `robots.txt` disallows crawling.

One request exercises DNS, TLS, the transfer and the web server together. It is
the highest seam available from here, and a deploy that reports success while the
site is unreachable is worse than one that fails.

## When it cannot run

None of the accounts exist yet. Rather than failing somewhere inside an rsync,
the pipeline fails in a job called *Credentials for production* (or staging)
that names every missing secret and points at
[`infrastructure-setup.md`](infrastructure-setup.md).

There is a second blocker, and it outlives the credentials. `astro.config.mjs`
still sets `base: '/ugab-suisse'`, the path GitHub Pages served the site from.
Every URL in the build carries that prefix; published at the root of a real
domain they all 404. A step called *Refuse to publish a site built for a
subdirectory* stops that reaching either environment and says what to change.

Removing the base is the last item of
[PRD 1](prd/01-foundations-and-ownership.md) and is blocked on the domain
existing. `tests/build/base-path.test.ts` already asserts the other direction and
will fail the check if a literal `/ugab-suisse` survives the removal.

## Secrets and variables

Full instructions, and where each value comes from, are in
[`infrastructure-setup.md`](infrastructure-setup.md). The short version:

| | Production | Staging |
| --- | --- | --- |
| Secret | `PROD_SSH_HOST` | `STAGING_SSH_HOST` |
| Secret | `PROD_SSH_USER` | `STAGING_SSH_USER` |
| Secret | `PROD_SSH_KEY` | `STAGING_SSH_KEY` |
| Secret | `PROD_SSH_KNOWN_HOSTS` | `STAGING_SSH_KNOWN_HOSTS` |
| Secret | `PROD_DEPLOY_PATH` | `STAGING_DEPLOY_PATH` |
| Secret, optional | `PROD_SSH_PORT` | `STAGING_SSH_PORT` |
| Secret | — | `STAGING_BASIC_AUTH` |
| Variable | `PROD_SITE_URL` | `STAGING_SITE_URL` |

The two URLs are repository **variables** rather than secrets, deliberately: a
masked URL turns every failure message into `***` and makes the smoke check
impossible to read. They are not credentials.

Repository secrets rather than GitHub environments: environment protection rules
are not available on a private repository on the free plan, and a mechanism that
silently does nothing is worse than one that never existed.

## What is deliberately not automated

**Creating the accounts.** The domain, the hosting, the mailboxes and the
provider accounts have to be opened by a person, at the association's name, with
its own payment method. That is [PRD 1](prd/01-foundations-and-ownership.md) and
it is a committee decision before it is a technical one.

**Staging's basic authentication**, configured in the Infomaniak manager. The
pipeline verifies it instead.

**Mail authentication.** SPF, DKIM and DMARC depend on DNS propagation and on
third-party reputation. They are verified by hand, at setup and again just before
launch, because DNS changes made for a payment provider can silently break them.

## Verifying it by hand, before the first real deploy

The pipeline's shell logic was exercised against fixtures during development.
What cannot be proven that way is the pipeline running against a real server, so
run these once, in this order, and keep the result with the
[pre-launch checklist](pre-launch-checklist.md).

1. **Staging publishes.** Push to `staging`. The smoke check passes.
2. **Staging is shut.** Open the staging URL in a private window: it must ask for
   a password. Fetch `/robots.txt`: it must disallow everything. View source on
   any page: the `noindex` meta tag must be there.
3. **A failing check stops the deploy.** Push a commit to `staging` that breaks
   the lint deliberately. The Checks job fails, the publish job never starts, and
   the staging site still serves the previous release. Revert it. This is the
   test for issue #33 and it is the one worth doing.
4. **A failed transfer changes nothing.** Set `STAGING_DEPLOY_PATH` to a path the
   deploy user cannot write, and push. The run fails, the site is untouched.
   Restore the secret.
5. **Rollback works.** Publish a visible change to staging, then run the fast
   rollback above. The previous page comes back. Do this before you need it under
   pressure, not during.
6. **Production publishes**, once everything above has passed on staging.

## Things worth knowing

**`dist/` is transferred, not built on the server.** There is no Node, no build
and nothing to patch at Infomaniak. That is the whole point of ADR-0001: the
site survives neglect because there is nothing running to neglect.

**Host keys are pinned.** `PROD_SSH_KNOWN_HOSTS` holds the server's public host
key and `StrictHostKeyChecking=yes` is set, so an unexpected host key aborts
instead of being accepted and recorded. Trust-on-first-use in a deploy pipeline
is a habit worth not acquiring.

**The deploy key is its own key**, used for nothing else, and removed from the
runner at the end of every run whatever happened.

**Concurrency is never cancelled.** A run interrupted between the transfer and
the swap leaves a directory to clean up. Two pushes in quick succession queue.
