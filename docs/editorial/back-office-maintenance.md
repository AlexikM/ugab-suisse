# Keeping the back-office

The editing interface is two files this repository serves itself:

```
public/admin/index.html                 the shell — 35 lines, ours
public/admin/sveltia-cms-0.193.2.js     the application — 1.9 MB, theirs
public/admin/sveltia-cms-0.193.2.LICENSE.txt
public/admin/config.yml                 what an editor may change
```

## Why it is vendored

It used to be `<script src="https://unpkg.com/@sveltia/cms@^3.5.0/dist/sveltia-cms.js">`.

Read that as a sentence: *whatever a public CDN chooses to serve, on the day an
editor logs in, for a tool that can write to the repository the whole site is
built from.* The version range meant nobody had decided which code that was, and
the CDN meant nobody had decided who got to change it. The pre-launch checklist
recorded it as blocking launch (section A3).

Serving one exact file from our own host answers both: the code that runs is the
code in this commit, and updating it is a commit somebody reviews.

## The record, and the test that keeps it true

`public/admin/index.html` records what the file is — package, version, source
URL, sha256, licence. `tests/compliance/vendored-application.test.mjs` hashes
the file beside it and compares. The two cannot drift: swapping the bundle
without updating the record fails, and updating the record without the bundle
fails.

It is the only honest form of "we know what this is". Nobody is going to read
1.9 MB of minified JavaScript, on this project or any other. What can be
established is that the bytes are the ones published under that version, and
that they have not changed since somebody decided to trust them.

## Updating it

Rarely, deliberately, and never in the same commit as anything else.

```sh
cd "$(mktemp -d)"
npm pack @sveltia/cms@<version>          # writes sveltia-cms-<version>.tgz
tar xzf sveltia-cms-<version>.tgz
shasum -a 256 package/dist/sveltia-cms.js
```

Then, back in the repository:

```sh
cp <tmp>/package/dist/sveltia-cms.js  public/admin/sveltia-cms-<version>.js
cp <tmp>/package/LICENSE.txt          public/admin/sveltia-cms-<version>.LICENSE.txt
git rm public/admin/sveltia-cms-<old>.js public/admin/sveltia-cms-<old>.LICENSE.txt
```

- [ ] Update the `<script src>` in `public/admin/index.html` to the new filename.
- [ ] Update the record above it: version, source URL, sha256.
- [ ] `npm run check` — the integrity test compares the two.
- [ ] **Sign in and publish something.** The suite does not test their software,
      by decision: automating a third-party admin UI produces brittle tests that
      break on vendor updates. Create a draft event, save it, publish it, delete
      it. Ten minutes, and it is the only thing that establishes the interface
      still works.
- [ ] Read their release notes for changes to `config.yml`'s format. A field the
      new version stops understanding fails silently, in the interface, for the
      committee — not here.

### When

**A security advisory affecting this package**, or **a bug the committee has hit
in the editor.** Not on a schedule, and not because a newer version exists.

This is a deliberate reading of the project's guiding principle. An unattended
volunteer-maintained site is safest with a dependency that has not moved: the
pinned bundle is a known quantity, and every update is a chance to break the one
tool the committee uses without anyone noticing until they try to publish. The
opposite risk — an old version with a known hole — is what the first sentence of
this paragraph is for.

The residual risk is that nobody watches for advisories. That belongs in the
support boundary ([`../comite/assistance-et-garantie.md`](../comite/assistance-et-garantie.md)),
not in a promise made here.

## What the application still fetches at runtime

Vendoring the bundle did not remove unpkg. The application fetches components —
Shiki, some of its own packages — from `unpkg.com` while it runs, so an editor
session still depends on that CDN.

What this does and does not mean:

- **No visitor page reaches any of it.** `/admin` is not linked from the site,
  and nothing under it is loaded by a visitor page. The processor register says
  so in as many words, and the privacy policy renders it.
- **An editor's browser contacts unpkg.com** while they are editing. That is a
  third party receiving an editor's IP address.
- It is recorded as a launch blocker in
  [`../pre-launch-checklist.md`](../pre-launch-checklist.md) (A3) and in
  `tests/compliance/lib/launch-blockers.mjs`, which is what keeps the audit
  counting it instead of forgetting it.

Two ways to close it, and the choice is the committee's:

1. **Vendor the runtime-fetched components too.** More files to keep, and the
   list is discovered by watching what the application requests rather than
   declared anywhere.
2. **Accept it in writing.** It affects editors, never visitors, and the
   register already discloses it. This is the cheaper answer and it is
   defensible; what is not defensible is leaving it undecided.

## The audit exemption

Both compliance audits skip this file by exact name — see
`tests/compliance/lib/vendored.mjs`, which explains why: the request audit would
report documentation links printed inside error messages as network calls, and
the storage audit would report the editor's own session storage as if it were
tracking a visitor.

**A second vendored bundle does not inherit the exemption.** The pattern matches
`sveltia-cms-<version>.js` and nothing else, which is deliberate: vendoring a
second application is a decision somebody should have to make on purpose.

## The licence

MIT. `public/admin/sveltia-cms-<version>.LICENSE.txt` is the upstream licence
file, copied out of the published package, and it is served beside the bundle
because the licence requires the notice to travel with the copy. It is replaced
along with the bundle, from the same tarball — a licence file for a version that
is no longer there is worse than none.
