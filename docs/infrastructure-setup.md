# Infrastructure setup

Everything a human has to do, in the order it has to be done, before a push can
publish anything.

At the time of writing there is **no domain, no hosting account, no mailbox and
no credential**, and nothing here can be created by an agent or by a script. The
pipeline is written and waiting; this is the document that closes the distance.

> English, because it is an engineering document, following the same convention
> as [`pre-launch-checklist.md`](pre-launch-checklist.md). The one question that
> has to be sent to a third party is reproduced in French so it can be sent as it
> is. Everything the committee reads for itself is in [`comite/`](comite/).

The order is load-bearing. AGBU sign-off gates the domain; the domain gates
hosting and mail; mail gates the payment providers' identity checks; and the
base prefix cannot leave `astro.config.mjs` before the domain resolves. Doing
these in a different order mostly means doing some of them twice.

**Who does what.** Steps marked **Comité** need a decision, a legal identity or a
means of payment, and cannot be delegated. Steps marked **Webmaster** are
technical. Several need both in the room.

---

## 1. AGBU sign-off — **Comité**

The longest lead time in the whole project, and outside anyone's control here.
Request it in writing immediately; everything else can proceed in parallel, but
no registration should be treated as final until it lands.

- [ ] Written sign-off from AGBU headquarters on the domain name and on the use
      of the UGAB name and logo.

To send:

> Avant d'enregistrer le nom de domaine du site du Comité Suisse, nous avons
> besoin de l'accord écrit du siège de l'UGAB sur deux points : le nom de domaine
> retenu, et l'usage du nom et du logo UGAB sur le site. Une renonciation après
> la mise en ligne coûterait bien plus qu'une attente aujourd'hui.

## 2. The domain question — **Comité**

- [ ] Decide the **primary** domain: `ugab-suisse.org` or `ugab-geneve.ch`.
- [ ] Register **both** extensions, so nobody else takes the other.
- [ ] Registrar account in the **association's name**, contact address a
      committee address rather than a personal one.
- [ ] Auto-renew on, against a payment method the association controls.
- [ ] Transfer lock on.
- [ ] Secondary domain issues a permanent (301) redirect to the primary.
- [ ] Record all of it in [`comite/carte-des-comptes.md`](comite/carte-des-comptes.md).

Everything downstream is produced from this one answer: email addresses, payment
provider records, printed material. It is worth an evening of discussion and not
worth changing afterwards.

## 3. Hosting — **Comité** opens it, **Webmaster** configures it

Infomaniak, as the cahier des charges specifies and ADR-0001 confirms.

- [ ] Account opened **in the association's name**, billed to the association.
- [ ] Site created for the primary domain; the secondary domain redirects.
- [ ] HTTPS with automatic certificate renewal, on the bare domain **and** `www`.
- [ ] Both forms resolve to the same place.
- [ ] Automatic backups on.
- [ ] Two-factor authentication on, recovery codes to the treasurer.
- [ ] Note the **document root** of the site — an absolute path. It becomes
      `PROD_DEPLOY_PATH`.

Retrofitting ownership is materially harder than opening it correctly, because
identity verification is tied to a legal entity. Nothing here should be created
personally with the intention of transferring it later.

## 4. Mailboxes — **Comité** decides who reads, **Webmaster** configures

- [ ] `contact@` — real mailbox, not an alias, so the correspondence outlives
      the member handling it.
- [ ] `evenements@` — likewise.
- [ ] Forwarding to the personal inbox of whoever is responsible for each.
- [ ] Send-as configured, so a reply looks official rather than personal.
- [ ] Two-factor authentication on both.
- [ ] A **named person** responsible for reading each address. An address nobody
      reads is worse than no address.

This has to happen before the payment and ticketing providers are opened: they
verify against an address at the organisation's own domain.

## 5. Mail authentication — **Webmaster**

Verified outside CI, because it depends on DNS propagation and on third-party
reputation.

- [ ] SPF published.
- [ ] DKIM published and signing.
- [ ] DMARC published, starting in monitoring mode (`p=none`), tightened once the
      sending sources are known.
- [ ] A test message sent to an external address and scored for deliverability.
- [ ] The same test repeated immediately before launch.

Re-run this after **any** DNS change made for a payment or ticketing provider.
That is the change that silently breaks it, and the symptom — donation receipts
landing in spam — surfaces weeks later and looks like something else.

## 6. GitHub organisation — **Comité**

- [ ] Organisation created in the association's name.
- [ ] `ugab-suisse` transferred into it, history, issues and references intact.
- [ ] Repository stays **private**: the brief is confidential and the issue
      tracker carries internal decisions.
- [ ] **At least two committee members** hold owner rights.
- [ ] The webmaster is a member with write access, not an owner.
- [ ] Two-factor authentication required for every member.

This is where the brief's ownership clause stops being aspirational. A future
webmaster is granted access by the committee; nothing is transferred and nothing
is renegotiated.

## 7. The deploy key — **Webmaster**

A key used for nothing else, so that revoking it costs nothing.

- [ ] Generate a dedicated Ed25519 keypair with **no passphrase** — a passphrase
      in an unattended pipeline just means the private key is stored twice.
- [ ] Add the **public** half to the Infomaniak account's authorised keys.
- [ ] Confirm the key works: `ssh -i <key> user@host` should connect.
- [ ] Collect the server's host key: `ssh-keyscan -p 22 <host>`. Copy the lines
      it prints; they become `PROD_SSH_KNOWN_HOSTS`.
- [ ] Store the private key in the committee's password manager, and record the
      key in [`comite/carte-des-comptes.md`](comite/carte-des-comptes.md).

## 8. Staging — **Webmaster** configures, **Comité** holds the password

- [ ] A separate hostname for staging, on the same hosting account.
- [ ] Its own document root, distinct from production. It becomes
      `STAGING_DEPLOY_PATH`.
- [ ] **Directory protection (HTTP basic authentication) on**, in the Infomaniak
      manager. One username and one password, shared with the committee.
- [ ] Confirm in a private window that the staging URL asks for a password.
- [ ] In `public/admin/config.yml`: set `site_url` to this address, add
      `preview_path` to the two collections, and set `show_preview_links: true`.
      Then delete the last sentence of the hint under **Brouillon**, which says
      the préproduction site does not exist yet.

The committee will review real names, real photographs and test transactions
here — and the announcements it is still preparing: the staging build shows
drafts, which is what makes the review step of the publishing flow possible.
See [`editorial/publication.md`](editorial/publication.md).

The pipeline refuses to publish to staging unless an unauthenticated request is
refused, so this step is not optional — the deploy fails without it, by design.

## 9. Repository secrets and variables — **Webmaster**

GitHub → Settings → Secrets and variables → Actions.

These are the exact names `.github/workflows/publish.yml` reads. A missing one
fails the run in a job called *Credentials for production* (or staging) that
names it; nothing is transferred and the published site is untouched.

### Secrets — production

| Name | What goes in it | Where to get it |
| --- | --- | --- |
| `PROD_SSH_HOST` | SSH hostname of the hosting account | Infomaniak manager, FTP/SSH section |
| `PROD_SSH_USER` | SSH username | Same place |
| `PROD_SSH_KEY` | The **private** key from step 7, in full, including the `BEGIN` and `END` lines | Your keypair |
| `PROD_SSH_KNOWN_HOSTS` | The output of `ssh-keyscan` for that host | Step 7 |
| `PROD_DEPLOY_PATH` | Absolute path to the production document root | Step 3 |
| `PROD_SSH_PORT` | *Optional.* Only if it is not 22 | Infomaniak manager |

### Secrets — staging

| Name | What goes in it |
| --- | --- |
| `STAGING_SSH_HOST` | As above, for the staging host |
| `STAGING_SSH_USER` | |
| `STAGING_SSH_KEY` | A **separate** key, so revoking one does not revoke both |
| `STAGING_SSH_KNOWN_HOSTS` | |
| `STAGING_DEPLOY_PATH` | Absolute path to the staging document root |
| `STAGING_SSH_PORT` | *Optional.* Only if it is not 22 |
| `STAGING_BASIC_AUTH` | `username:password` for the directory protection from step 8. The smoke check signs in with it after proving that an anonymous visitor cannot. |

### Variables — not secrets

| Name | What goes in it |
| --- | --- |
| `PROD_SITE_URL` | The public address, e.g. `https://ugab-suisse.org`. **This variable is the on-switch.** While it is empty, production deploys are skipped and the run says so in its summary instead of failing; the moment it has a value, every push to `main` publishes. Set it last. |
| `STAGING_SITE_URL` | The staging address |

Variables rather than secrets on purpose: a masked URL turns every failure
message into `***` and makes the smoke check impossible to read. Neither is a
credential.

## 10. Remove the base prefix — **Webmaster**

The last blocker, and it needs the domain to exist first.

`astro.config.mjs` still carries the GitHub Pages layout:

- `site` points at `https://alexikm.github.io`;
- `base` is `/ugab-suisse`, and the `redirects` entries are written with that
  prefix.

Every URL in the build carries `/ugab-suisse/`. Served from the root of a real
domain, they all 404.

- [ ] Set `site` to the primary domain.
- [ ] Remove `base`, and the `${base}` prefixes in `redirects`.
- [ ] Run `npm run check`. `tests/build/base-path.test.ts` fails if a literal
      `/ugab-suisse` survives anywhere in the output — it asserts both directions
      of this bug and has been waiting for exactly this change.

The publish workflow refuses to transfer a build that still carries the prefix,
so this cannot be forgotten quietly. It can only be forgotten loudly.

Note that this file belongs to the site build, not to this pipeline: coordinate
with whoever is working in `src/` before changing it.

## 11. First publish — **Webmaster**, then **Comité**

Run the sequence in
[`deploy-pipeline.md`](deploy-pipeline.md#verifying-it-by-hand-before-the-first-real-deploy)
in full. In summary:

- [ ] Create the `staging` branch from `main`. It does not exist yet — it is not
      created in advance on purpose, because the first push to it starts a deploy
      and there is no point in a red cross sitting on the repository for weeks.
- [ ] Push to `staging`. It publishes, and the smoke check passes.
- [ ] Confirm staging asks for a password and disallows crawlers.
- [ ] Push a deliberately failing commit to `staging`. The publish never starts
      and the site is unchanged. Revert. *(This is the test for issue #33.)*
- [ ] Point `STAGING_DEPLOY_PATH` at an unwritable path and push. The run fails,
      the site is untouched. Restore it.
- [ ] Perform one rollback, on staging, before you ever need one.
- [ ] Only then, publish to production from `main`.

## 12. Before announcing the address — **Comité + Webmaster**

- [ ] The [pre-launch checklist](pre-launch-checklist.md) is run in full. It
      covers the compliance half, including the tax-deductibility claim that
      blocks launch.
- [ ] Mail authentication re-tested, after every DNS change made for a provider.
- [ ] Search engines: check that production is indexable and staging is not.
- [ ] The [account map](comite/carte-des-comptes.md) is filled in, with no
      remaining `à fournir` field.
- [ ] The [handover record](comite/proces-verbal-de-remise.md) is completed and
      signed.

## The recurring cost

A recurring cost nobody approved is the line item that gets cut two committees
from now. Total it once, have it approved, and put it in the budget.

| Item | Annual cost |
| --- | --- |
| Primary domain | *to be filled in* |
| Secondary domain | *to be filled in* |
| Hosting, including mailboxes | *to be filled in* |
| Password manager | *to be filled in* |
| Donation provider, fixed fees | *to be filled in* |
| Ticketing provider, fixed fees | *to be filled in* |
| Analytics, if any | *to be filled in* |
| **Total** | |

ADR-0001 sets the target at **under CHF 150 per year**, excluding payment
processing fees, which come out of donations and ticket sales rather than out of
the treasury. Anything that pushes past it should be raised with the committee
rather than absorbed.

The same table, in French and for the committee's own records, is in
[`comite/carte-des-comptes.md`](comite/carte-des-comptes.md).

## Before any of this — showing the committee the site

None of the twelve steps above is needed to put the site in front of the
committee. [`preview-on-github-pages.md`](preview-on-github-pages.md) publishes
what the repository already builds, on a public but unindexed address, with a
back-office that needs no account — fifteen minutes, no domain, no credentials,
nothing to migrate afterwards. It is how the committee answers ADR-0001's open
question, which is what step 1 of this list is really waiting on.

## What is still open

Not blockers for the pipeline, but they sit on the same critical path:

- **ADR-0001 is still Proposed**, pending the committee's answer on the WordPress
  question. If the answer changes the stack, most of this document changes with
  it.
- **The donation and ticketing providers are not chosen.** They need a mailbox at
  the organisation's own domain to verify against, which is step 4.
- **`public/robots.txt` does not exist**, although `src/layouts/Layout.astro`
  says it does. Staging is covered — the publish writes one — but production
  serves no robots.txt at all today.
