## Problem Statement

The Comité Suisse is about to have a website built, but today every piece of
the infrastructure it will depend on either does not exist or belongs to the
wrong person.

There is no domain. There is no hosting. There are no mailboxes, so the
committee has no address at its own domain to give a payment provider, a
registrar, or a sponsor. The source code lives in a personal GitHub account
belonging to the webmaster, which sits directly against the brief's
requirement that everything become the full property of the Comité on
delivery. The deploy pipeline publishes to GitHub Pages under a path prefix
that has already caused five separate bug-fix commits and that will not exist
once a real domain is in place.

The failure mode this creates is well known for small associations: the
volunteer who set everything up moves on, the renewal notice goes to a personal
address nobody reads any more, and the domain lapses. Nobody notices until the
site is gone. Everything downstream — donations, ticketing, content, launch —
is blocked until the foundations are owned by the association and reproducible
by someone who is not the person who built them.

## Solution

Stand up every account, domain, mailbox and pipeline the project needs, in the
association's name from the first day, and make publishing a push.

Concretely: register the domains and point them at Swiss hosting; create the
two mailboxes the brief asks for with correct mail authentication so receipts
and tickets are not filed as spam; move the repository to a GitHub organisation
the association owns, with the webmaster as a member rather than the owner;
put every credential in a shared password manager the treasurer can reach;
replace the GitHub Pages pipeline with an automated deploy to the real host,
fronted by a staging environment the committee can review before anything is
public.

When this is done, a committee member can answer "who owns the site, where does
it live, and who do we call" without asking the webmaster — and a future
webmaster can be granted access without anything being transferred.

## User Stories

### Domain

1. As the Comité, I want the site to live on a domain the association owns, so that we do not lose it when a volunteer steps down.
2. As the Comité, I want a decision recorded on whether the primary domain is `ugab-suisse.org` or `ugab-geneve.ch`, so that email addresses, payment provider records and printed material can all be produced from one answer.
3. As the president, I want written sign-off from AGBU headquarters on the domain and on the use of the UGAB name and logo, so that we are not asked to rename after launch.
4. As the Comité, I want both the `.org` and the `.ch` registered, so that nobody else can take the other and so visitors reach us whichever they type.
5. As a visitor, I want the secondary domain to redirect permanently to the primary one, so that I always land on the same site and search engines see one canonical address.
6. As the Comité, I want the registrar account held in the association's name with a generic committee address as contact, so that renewal notices reach whoever is in office rather than a former member.
7. As the treasurer, I want auto-renewal enabled against a payment method the association controls, so that the domain cannot lapse through inattention.
8. As the Comité, I want the domain registration locked against transfer, so that it cannot be moved without our knowledge.

### Hosting

9. As the Comité, I want the site hosted in Switzerland, so that we can answer plainly where our donors' data is held.
10. As a visitor, I want HTTPS on every page and a valid certificate that renews itself, so that I trust the site enough to donate on it.
11. As a visitor, I want requests to the bare domain and to `www` to resolve to the same place, so that neither form is broken.
12. As the Comité, I want automatic backups of the hosting account, so that a mistake is recoverable without calling the webmaster.
13. As the webmaster, I want SSH access with a key rather than a password, so that the deploy pipeline can publish without a shared secret being typed anywhere.
14. As the Comité, I want the hosting account opened in the association's name and billed to the association, so that ownership is not ambiguous at handover.

### Email

15. As a visitor, I want to write to a `contact@` address at the committee's own domain, so that I am confident I am reaching the real organisation.
16. As a sponsor prospect, I want an `evenements@` address for event and partnership enquiries, so that my message reaches the person who handles them.
17. As a committee member, I want mail sent to those addresses forwarded to my personal inbox, so that I notice it without having to remember to check a separate mailbox.
18. As a committee member, I want to be able to reply *from* the shared address, so that my answer looks official rather than personal.
19. As the Comité, I want the mailbox itself to retain the history, so that correspondence survives the member who was handling it leaving the committee.
20. As a donor, I want the receipt for my donation to arrive in my inbox rather than my spam folder, so that I have proof of my gift.
21. As a ticket buyer, I want my ticket email to be delivered reliably, so that I can show it at the door.
22. As the Comité, I want SPF, DKIM and DMARC published for the domain, so that nobody can convincingly send mail pretending to be us.
23. As the Comité, I want two-factor authentication on both mailboxes, so that a compromised password does not expose donor correspondence.
24. As the Comité, I want a named person responsible for reading each address, so that a sponsorship enquiry is never left unanswered.

### Repository and ownership

25. As the Comité, I want the source code in a GitHub organisation the association owns, so that the brief's ownership clause is literally true rather than aspirational.
26. As the webmaster, I want to remain a member of that organisation with write access, so that I can keep working without owning the asset.
27. As a future webmaster, I want to be granted access by the committee, so that taking over does not require anything to be transferred or renegotiated.
28. As the Comité, I want the repository to stay private, so that the confidential brief, our internal decisions and our sponsorship terms are not published.
29. As the Comité, I want at least two committee members to hold owner rights on the organisation, so that access does not depend on one person being reachable.

### Credentials

30. As the treasurer, I want every account credential in a shared password manager, so that I can reach them without asking the webmaster.
31. As the Comité, I want two-factor recovery codes stored by the treasurer, so that losing a phone does not lock the association out of its own accounts.
32. As the Comité, I want a single page describing where each account lives and who owns it, so that a new committee can orient itself in ten minutes.
33. As the Comité, I want no credential to exist only in the webmaster's personal accounts or memory, so that there is no single point of failure.

### Deployment

34. As the webmaster, I want a push to the main branch to publish the site automatically, so that publishing is not a manual ritual that can be done wrong.
35. As the webmaster, I want the deploy to fail loudly and change nothing rather than publish half a site, so that a broken build never reaches visitors.
36. As the Comité, I want a staging address where I can review changes before they are public, so that I can approve wording and photographs without risk.
37. As the Comité, I want the staging site hidden from search engines and from casual visitors, so that draft content and test events are never found or indexed.
38. As the webmaster, I want an automatic check after each deploy confirming the site actually responds and serves the expected page, so that a silent failure is caught immediately.
39. As the webmaster, I want the build to fail if any asset URL still carries the old GitHub Pages path prefix, so that the class of bug that produced five recent fix commits cannot return.
40. As the webmaster, I want deploy credentials held as repository secrets rather than in the codebase, so that the private repository is not also a credential store.
41. As the webmaster, I want to be able to republish a previous commit, so that a bad release can be rolled back in minutes.
42. As the Comité, I want the deploy to keep working if the webmaster is unavailable, so that another developer can publish a correction.

### Launch readiness

43. As the Comité, I want a written pre-launch checklist covering DNS, certificates, mail authentication and deliverability, so that the joint verification the brief describes is a list rather than a conversation.
44. As the Comité, I want to know the recurring annual cost of hosting and domains before launch, so that it can be approved and budgeted rather than discovered.

## Implementation Decisions

**Ownership before build.** Every account in this PRD is opened in the
association's name at creation. Nothing is created personally with the
intention of transferring it later; retrofitting ownership is materially harder,
particularly where identity verification is tied to a legal entity.

**Hosting.** Infomaniak, as specified in the cahier des charges. Swiss company,
Swiss datacentres, mailboxes bundled with the hosting plan, and it gives a clean
answer on data residency. The site is served as static files from the web root;
no CMS runtime and no database are deployed, consistent with ADR-0001.

**Domain.** Both extensions registered, one nominated as primary and the other
issuing a permanent redirect. Registrar contact is the committee address, not a
personal one. Transfer lock and auto-renew on.

**Mail.** Real mailboxes rather than aliases, with forwarding on top and
send-as configured. Mailboxes retain the archive so correspondence outlives the
member handling it; forwarding ensures nothing waits unread in an account nobody
opens. SPF, DKIM and DMARC published as part of this PRD rather than left to
whoever first notices mail landing in spam. DMARC starts in monitoring mode and
tightens once the sending sources are known.

**Repository.** Moved to a GitHub organisation owned by the association, with at
least two committee owners and the webmaster as a member. Repository stays
private: the brief is confidential and the issue tracker will carry internal
decisions. Migration preserves history, issues and existing references.

**Deploy pipeline.** The existing GitHub Pages workflow is replaced by a build
and rsync over SSH to Infomaniak, keyed by branch: the main branch publishes to
production, a designated branch publishes to staging. Deployment is atomic —
the build is transferred to a temporary location and swapped in only on success,
so a failed transfer never leaves a partially published site. Credentials are
held as repository secrets. Rollback is redeploying an earlier commit through
the same path.

**Base path.** Astro's `site` is set to the real domain and the `base` prefix is
removed once the domain resolves. This is what deletes the prefix-handling bugs
rather than continuing to patch them individually.

**Staging protection.** Staging is served from a separate hostname, excluded
from indexing and protected by HTTP basic authentication. Draft content and test
transactions must never be publicly reachable, and the committee will be
reviewing real names and photographs there.

**Sequencing.** Domain and AGBU sign-off first, because hosting, mail and the
payment providers' identity verification all depend on them. Mail before the
payment work in PRD 4 and 5, since providers verify against an address at the
organisation's own domain.

## Testing Decisions

A good test here asserts observable behaviour of the deployed system, not the
shape of the configuration that produced it. Configuration files are not worth
asserting against; what matters is that the site answers, that mail is
authenticated, and that a failed deploy changes nothing.

**Post-deploy smoke check (primary seam).** After every deploy, the pipeline
requests the deployed URL and asserts a 200 response and the presence of an
expected marker in the HTML. This runs against staging and production and is the
highest available seam: it exercises DNS, TLS, the transfer, and the web server
in one assertion. A failed check fails the pipeline.

**Build-output assertion.** The build output is scanned for any residual
GitHub Pages path prefix in asset and link URLs; a match fails the build. This
is a direct regression test for the bug class that produced the recent run of
prefix-fixing commits, and it is cheap enough to run on every build.

**Atomicity check.** A deliberately failed transfer is exercised once during
setup to confirm the previously published site remains intact and served.

**Mail authentication.** Verified externally rather than in CI, since it depends
on DNS propagation and third-party reputation: SPF, DKIM and DMARC records are
confirmed to resolve and pass, and a test message is scored for deliverability.
This is recorded as a documented checklist run at setup and re-run immediately
before launch, because DNS changes made for the payment providers can silently
break it.

**Manual verification, documented.** HTTPS on the bare domain and on `www`, the
secondary domain redirecting permanently, staging refusing anonymous access and
excluded from indexing, and a rollback performed once so that the procedure is
known to work before it is needed under pressure.

There is no prior art for tests in this repository — none exist. This PRD
establishes the pipeline seam that later PRDs will attach their own checks to.

## Out of Scope

- Any page, layout, component or copy change. The prototype ships as-is through the new pipeline; alignment with the brief is a separate PRD.
- Adding the Armenian locale, and anything else touching the trilingual build.
- Choosing or configuring the CMS.
- Donation and ticketing providers. This PRD only ensures the domain and mailboxes those providers will verify against exist first.
- The privacy policy, cookie approach and legal pages.
- Analytics.
- The handover documentation and training, beyond the single page recording where the accounts live.
- Migrating the existing placeholder photography, and the associated image pipeline work.

## Further Notes

**This PRD blocks every other one.** Nothing downstream can be finalised before
the domain exists and the accounts are owned.

**AGBU headquarters sign-off is the longest lead time and is outside our
control.** It should be requested immediately, in writing, and the answer may
constrain the domain choice. Everything else in this PRD can proceed in
parallel, but registration should not be treated as final until it lands.

**Making the repository private has already taken the GitHub Pages preview
offline** on a free plan. If anyone on the committee holds that link, they need
the staging address instead once it exists.

**The prototype as previewed is preserved** at tag `prototype-2026-08-20` and
branch `prototype/2026-08-20`, with source and built archives kept outside the
repository, so the current version remains deployable independently of this work.

**Recurring cost is a committee decision, not an implementation detail.** The
target established in ADR-0001 is under CHF 150 per year excluding payment
processing fees. Anything that pushes past that should be raised rather than
absorbed, because a recurring cost nobody approved is the line item that gets
cut two committees from now.
