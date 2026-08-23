# Putting the site on Infomaniak, protected, in fifteen minutes

*For the webmaster. This is the real deploy, not a preview — the pipeline in
[`deploy-pipeline.md`](deploy-pipeline.md), configured for one environment.*

[`infrastructure-setup.md`](infrastructure-setup.md) is the full runbook: twelve
steps ending in a public site on its own domain, with mailboxes, mail
authentication and a GitHub organisation. Most of it is not needed to put a
protected, working site in front of the committee.

This is the subset that is. **Staging only.** Production stays unconfigured, and
`deploy.yml` skips it quietly and says so in the run summary — that is the
designed behaviour for "not configured yet", not a workaround.

## What staging gives the committee

| | |
| --- | --- |
| Reachable | only with the password, at the address you give them |
| Indexed | no — `noindex` on every page, `robots.txt` disallowing everything |
| Drafts | yes — announcements they have not published are built, which is the point |
| Back-office | `/admin/` with a token, and `/admin/demo/` with nothing at all |

The publish **refuses to finish** unless an unauthenticated request to the site
is refused with a 401. Directory protection is not something you remember to
turn on; it is something the pipeline checks.

## Before you start

You need, from the Infomaniak manager:

- the **SSH hostname** and **username** (FTP/SSH section)
- the **absolute document root** of the site
- the **address** the site will answer on — a subdomain is fine, and is the
  cheapest way to have one before the domain question is settled

You do not need: a decision from AGBU, the final domain, mailboxes, SPF/DKIM/DMARC,
or the repository moved into an organisation. Those are launch, not this.

## The fifteen minutes

### 1. Configure the repository — 3 min

```sh
./scripts/setup-infomaniak.sh staging
```

It asks the four questions above, generates an Ed25519 deploy key, reads the
server's host keys, and writes all six values into GitHub. The private key goes
straight from a temporary file into `gh secret set` and is deleted — it is never
printed, never committed, never in your shell history.

It prints the public key when it finishes.

### 2. Authorise the key — 2 min

Paste that public key into the Infomaniak manager, under the hosting account's
SSH keys.

### 3. Turn on directory protection — 5 min

HTTP basic authentication on the site, in the manager. Choose a password and
keep it: the committee needs it, and the publish will fail without it.

This cannot be done from here — the pipeline can check it, not set it.

### 4. Publish — 5 min

`Actions → Deploy → Run workflow → staging`.

It runs the full `npm run check` first, transfers into a sibling directory,
refuses to swap if the transfer produced no `index.html`, swaps by rename, then
makes an unauthenticated request and fails unless it is refused.

### 5. Send the committee three things

The address, the password, and the sentence that the back-office at
`/admin/demo/` saves nothing.

## What you are not editing

Nothing. `astro.config.mjs` takes both the origin and the base prefix from the
site URL you gave the script, so there is no file to change for the address to
change — that used to be the last item of PRD 1, a commit written on the day of
the first deploy.

Setting the same variable to something carrying a path is caught twice: by the
script, before anything is stored, and by the publish, before anything is
transferred.

## When the real domain arrives

Change `STAGING_SITE_URL`, or run the script again for `production`. There is no
migration, because there is no configuration to migrate.

`.github/workflows/preview.yml` — the GitHub Pages preview — can be deleted the
day this works. The two do not conflict: Pages keeps the `/ugab-suisse` prefix
because that is where a project site is served from, and it gets it from the
same variable, defaulted.

## What this is not ready for, and it is production

Staging is what this document sets up, and staging is ready. Production is the
same pipeline and the same command — and two things stand between it and a live
site, neither of them content:

1. **The credentials are repository-wide.** `publish.yml` takes `environment` as
   a string used for messages; the job has no `environment:` key, so the
   production SSH secrets are repository secrets any workflow can read, with no
   required reviewer and no deployment-branch restriction. `workflow_dispatch`
   accepts any ref for production — deliberately, it is the rollback path — so
   anyone with write access can publish an arbitrary branch to the live site.
   Most of the fix is in the GitHub interface: a `production` environment with
   required reviewers, and the `PROD_*` secrets moved into it.
2. **Nothing here has ever run.** The transfer, the swap, the rollback and the
   smoke check are written and unexercised. Staging is where they get exercised,
   which is the other reason to do staging first.

Neither is a reason to wait before showing the committee. Both are reasons not
to point `main` at a public domain on the same afternoon.

## What is still not true on this site

Say these to the committee rather than letting them be found:

- **Drafts are visible.** That is what staging is for, and it means the address
  is not one to forward.
- **The demonstration back-office saves nothing.** See
  [`preview-on-github-pages.md`](preview-on-github-pages.md), which explains the
  same back-office and the question behind it.
- Everything in [`pre-launch-checklist.md`](pre-launch-checklist.md) that is
  still open — the committee's own details, the tax decision, the providers.
