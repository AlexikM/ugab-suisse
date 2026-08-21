# Draft, review, publish

*Engineering note. The committee's own instructions are in French, in
[`../comite/publier-un-evenement.md`](../comite/publier-un-evenement.md); this
describes the mechanism underneath and what is still missing from it.*

## The three states

| The editor sees | Stored as | Who can see the announcement |
| --- | --- | --- |
| **Brouillon** | `draft: true` | Whoever is logged into `/admin/` |
| **En relecture** | `draft: true` | Whoever has the préproduction password |
| **Publiée** | `draft: false` | Everyone |

Two of them are the same stored value. That is the design, not a shortcut:
relecture is not a state an entry is *in*, it is a place an entry is *read* —
the same draft, on the real page, at its real address, by a second person. An
announcement carrying real names, a real venue and a real price is worth reading
as a page rather than as a form.

The alternative — a third value, `statut: brouillon | à relire | publié` — was
rejected. It adds a field the site would have to honour, a migration for every
existing entry, and a state whose only effect is to tell another human something
they were told in a message anyway. PRD 4 puts multi-step approval out of scope
in as many words.

## What decides it

One flag, read in one place:

```
entry frontmatter   draft: true
        │
        ▼
src/lib/content.ts  draftsVisibleByDefault()  ← UGAB_SHOW_DRAFTS
        │
        ▼
every page          asks the boundary; has no opinion of its own
```

`UGAB_SHOW_DRAFTS` is set by the deploy, per environment — `true` for staging,
`false` for production, in `.github/workflows/deploy.yml`. Nothing in
`src/pages/` mentions drafts, and nothing should: a page that grew its own
opinion would be a second mechanism drifting away from the first, which is the
failure `PUBLIC_SITE_INDEXABLE` is documented against in
[`../deploy-pipeline.md`](../deploy-pipeline.md).

To see a staging build locally:

```sh
UGAB_SHOW_DRAFTS=1 npm run build && npm run preview
```

`tests/content/publication.test.mjs` builds the site both ways and asserts the
difference is exactly one announcement, then reads the workflow files to check
that staging is told and production is not.

## Where the review step happens — and does not, yet

**Staging does not exist.** There is no hosting, no domain and no `staging`
branch: the ordered list of what a human has to do is
[`../infrastructure-setup.md`](../infrastructure-setup.md), and the pipeline that
will use it is [`../deploy-pipeline.md`](../deploy-pipeline.md). Until then the
review step happens in the editing interface, between two people looking at the
same form, and the site knows nothing about it.

This is written down rather than left implicit because the gap is invisible from
inside the back-office: the interface behaves identically whether or not a
préproduction site exists, and the flag is already honoured by every build.

When PRD 1 ([#1](https://github.com/AlexikM/ugab-suisse/issues/1)) lands, three
things change and nothing else does:

- [ ] The `staging` branch exists and publishes. Drafts appear there and nowhere else.
- [ ] `public/admin/config.yml`: set `site_url` to the staging address, add
      `preview_path` to the collections, and turn `show_preview_links` back on.
      An editor then reaches the page from the entry, which is what makes the
      review step one click instead of an instruction.
- [ ] The hint under **Brouillon** in that same file loses its last sentence —
      *« Le site de préproduction n'existe pas encore »* — and the French guide
      gains the address.

## History and rollback, as they actually work

Two different things get confused under one word, so they are separated here.

### The content

Every save is a commit, with a French message — `Modification de « … » dans
events`. Nothing an editor does is destructive, including deleting an entry: the
file leaves the working tree and stays in the history.

The entry sidebar has a **History** panel listing that entry's changes. It reads
them from the repository through the backend, so it needs the editor to be
signed in and the repository reachable.

**There is no "restore this version" button.** What the interface calls *Revert
Changes* discards edits that have not been saved yet — the unsaved form, not a
published version. Putting back the way an announcement read last Tuesday is a
git operation, and it goes to the webmaster. The runbook entry for it is
[`../comite/en-cas-de-probleme.md`](../comite/en-cas-de-probleme.md).

So the honest sentence, and the one the French guide should carry, is *nothing
is lost and any version can be restored* — not *you can restore it yourself*.

> Neither the History panel nor the commit messages have been exercised against
> a real repository: the back-office has never been signed into, because there
> is no domain and no editor account (#44). Both belong in the twenty-minute
> walkthrough PRD 4 asks for at setup, and the walkthrough is where they get
> confirmed rather than assumed.

### The site

A published release is rolled back by republishing, not by editing content. The
previous release is kept on the server beside the live one and the swap is two
renames; the recipe is in [`../deploy-pipeline.md`](../deploy-pipeline.md) under
**Rollback**. That is the fast route when a deploy is wrong. Re-running the
deploy from an earlier commit is the slow one.

Reverting an announcement is a content change and publishes like any other.

## What is still missing

| | Blocked on |
| --- | --- |
| A préproduction site to review a draft on | PRD 1 — hosting, domain, `staging` branch |
| Preview links from an entry to its page | The same: they need `site_url` |
| A second person who can sign in to review | #44 — editor accounts, and the login question |
| The History panel confirmed against a real repository | The setup walkthrough |
