# Showing the committee the site, before any of it exists

*For the webmaster. Fifteen minutes, once. Nothing here is the launch.*

The committee cannot be shown the site today, and the reason is not the site.
[`infrastructure-setup.md`](infrastructure-setup.md) is twelve steps, and the
first is **AGBU headquarters agreeing a domain name** — a decision nobody has
asked for yet. Hosting, HTTPS, mailboxes, mail authentication, the deploy key
and the removal of the base prefix all hang off it.

None of that is needed to publish what the repository already builds. A project
site on GitHub Pages is served from `/ugab-suisse/`, which is the base prefix
`astro.config.mjs` already sets — so there is nothing to reconfigure, and there
is nothing to migrate later either. When Infomaniak opens, this is deleted.

## What you are agreeing to

**The address is public.** Not indexed is not the same as not reachable. Every
page asks not to be indexed and `robots.txt` disallows everything, but anyone
holding the address can read the site — and the preview is built with
`UGAB_SHOW_DRAFTS`, so it shows announcements the committee has not published.
Send the address to the committee; do not put it anywhere a stranger will find
it.

Three things are true on the preview that are not true of the finished site,
and they are worth saying to the committee out loud rather than letting them be
found:

- **The message form is drawn, and it cannot send.** The public site shows a
  paragraph saying a form comes later; the preview draws the real one, because
  its labels are what the committee is being asked to approve. The fields work
  and the send button does not. Somebody who writes a message into it and
  presses the button has not been in touch with anybody.
- **The legal notices name Infomaniak as the host.** On Pages that sentence is
  false. It is [`pre-launch-checklist.md`](pre-launch-checklist.md) C4 and it
  clears itself the day the site is served from Infomaniak.
- **Nothing typed into the demonstration back-office is saved.** See below.

## The fifteen minutes

Four steps, in this order.

### 1. Make Pages available — 5 min

Pages needs to be able to publish. Either:

- **the repository is public** — `Settings → General → Danger Zone → Change
  visibility`. Free, immediate, and it means the brief and the issues are public
  too. That is a decision about the repository, not about the preview, and it
  touches issue #44; or
- **the account has a paid plan** (GitHub Pro), and the repository stays
  private. The published site is public either way — private Pages exists only
  on Enterprise Cloud.

### 2. Point Pages at Actions — 2 min

`Settings → Pages → Build and deployment → Source` → **GitHub Actions**.

Nothing else on that screen. No branch, no folder, no custom domain.

### 3. Publish — 5 min

`Actions → Preview → Run workflow`. It runs the full `npm run check` first,
through the same `ci.yml` a pull request runs, and refuses to publish if the
build somehow invited indexing.

The run summary prints both addresses when it finishes.

### 4. Send two addresses to the committee — 3 min

| | |
| --- | --- |
| The site | `https://<account>.github.io/ugab-suisse/` |
| The back-office | `https://<account>.github.io/ugab-suisse/admin/demo/` |

## The back-office they are given

`/admin/demo/` asks for nothing. No account, no token, no GitHub. One click and
the French editing interface opens, with the committee's own collections,
labels, hints and field order — because it loads the same `config.yml` the real
editor does, rather than a copy of it. Only the backend is overridden, in
JavaScript, on that one page.

**Nothing is saved.** It cannot reach the repository at all: Sveltia's
`test-repo` backend keeps everything in the browser tab. Someone can create a
fiche, fill it in, upload a photograph and press Save — and find it gone on the
next visit. The application title says so, and it must be said in the covering
message too. It is a demonstration of the interface, not a rehearsal of the
content.

`/admin/` — the real one — is published as well and still works, for you, with a
GitHub token. Do not send that address to the committee.

## What this preview is for, and the question behind it

It answers "what does it look like, and what is it like to use". It cannot
answer "can our volunteers keep it up to date", because the demonstration
back-office saves nothing and the real one needs a GitHub account per editor.

That is ADR-0001's open question — *must an editor log in with only an email
address?* — and the committee cannot answer it in the abstract. Showing them the
interface is how they answer it. Sveltia has no email login: its backends are
GitHub, GitLab, Gitea and local, and its own bundle marks Git Gateway
deprecated and Netlify Identity unsupported. So "yes" means a hosted CMS, which
`src/lib/content.ts` is already shaped for — one adapter, not a rewrite — and a
recurring cost the fixed fee does not carry.

## Taking it down

`Settings → Pages → Unpublish site`, and delete
`.github/workflows/preview.yml`. There is nothing else: no DNS, no certificate,
no credentials, no data.
