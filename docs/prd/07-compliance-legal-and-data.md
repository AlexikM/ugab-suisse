## Problem Statement

The site is about to start collecting donations, ticket bookings and contact
messages from people in Switzerland and the European Union, on behalf of a
Swiss association. Both the revised Swiss data protection act and the GDPR
apply. Today the site's legal position is not merely incomplete — parts of it
are wrong.

The privacy text the committee supplied states that data is "jamais partagées
avec des tiers". This stops being true the moment a payment provider, a
ticketing service, a Swiss host and an anti-spam service are involved. A
privacy policy that promises something the system does not do is worse than no
policy: it is a documented misstatement by an organisation whose entire appeal
rests on institutional trustworthiness.

Separately, the prototype already tells visitors that donations are tax
deductible and that a receipt is sent automatically. Neither is verified. Tax
deductibility depends on cantonal recognition of public utility, and automatic
attestations are not something the intended payment tier provides. This is the
highest-risk sentence on the site: a charity telling donors they can deduct a
gift when they may not be able to.

There is also a cookie banner in the prototype with nothing to consent to,
which is the wrong shape of the problem — the useful question is whether to
collect anything requiring consent at all.

## Solution

Make the site's legal statements true, and choose the technical options that
keep the obligations small.

Rewrite the privacy policy to name the actual processors and describe what each
receives. Verify the tax-deductibility claim with the committee and either
substantiate it or remove it. Choose cookieless analytics or none, which
removes most of the consent requirement rather than managing it. Write the
legal notices the footer already links to. Establish retention periods and a
route for a visitor exercising their rights.

Then run the pre-launch verification the brief describes, as a documented
checklist rather than a conversation.

## User Stories

1. As a donor, I want to know who receives my personal data and why, so that I can decide whether to give.
2. As a visitor, I want the privacy policy to describe what the site actually does, so that I can rely on it.
3. As a visitor, I want to find the privacy policy and legal notices from any page, so that I do not have to search for them.
4. As a visitor in the EU, I want my GDPR rights described and a way to exercise them, so that I can act on them.
5. As a visitor in Switzerland, I want the site to comply with Swiss data protection law, so that my rights are respected where I live.
6. As a visitor, I want to know how long my data is kept, so that I am not signing up to something indefinite.
7. As a visitor exercising my right to deletion, I want a named address to write to and a stated response time, so that my request goes somewhere.
8. As a visitor, I want not to be tracked by advertising networks, so that giving to a charity does not follow me around the internet.
9. As a visitor, I want not to be interrupted by a consent dialogue when there is nothing to consent to, so that the site respects my time.
10. As the Comité, I want to know exactly which third parties process our supporters' data, so that we can answer a donor who asks.
11. As the president, I want the tax-deductibility statement verified before publication, so that we never tell a donor something untrue about their taxes.
12. As the treasurer, I want to know how attestations are actually issued, so that I can answer donors in January.
13. As the Comité, I want the site to identify us properly in the legal notices, so that we meet our disclosure obligations.
14. As the Comité, I want photographs of identifiable people used only with consent, so that publishing our own event pictures does not create a problem.
15. As the Comité, I want a record of what we verified before launch, so that we can show we took it seriously.
16. As a visitor with a disability, I want the site to state its accessibility position, so that I know what to expect and who to tell if something is wrong.
17. As the Comité, I want form submissions kept only as long as we need them, so that we are not accumulating personal data by default.
18. As a form sender, I want to know what happens to my message before I send it, so that I am not surprised.
19. As the Comité, I want to understand what we must do if data is ever exposed, so that we are not improvising during an incident.
20. As a future committee, I want the legal pages to be maintainable in plain language, so that they can be kept accurate as things change.

## Implementation Decisions

**The policy describes reality, and reality is chosen to be small.** Rather than
documenting an elaborate data flow, the architecture minimises it: no donor or
attendee records in our systems, no third-party fonts, no advertising trackers,
form submissions delivered by mail rather than accumulated in a database. What
remains to disclose is a short, honest list.

**Named processors.** The privacy policy names the host, the payment provider,
the ticketing provider and the anti-spam service, and states what each receives.
The committee's supplied wording about never sharing data with third parties is
replaced with an accurate statement — the intent behind it (we do not sell or
trade your data) is preserved and made true.

**Analytics: cookieless or none.** A privacy-respecting analytics tool with no
cookies and no cross-site identifiers, or nothing at all. This removes the legal
basis for a consent banner almost entirely and replaces it with a short notice.
An advertising-network analytics product is explicitly rejected: it would create
a consent obligation, a transfer disclosure and a banner, in exchange for
metrics this committee will never look at.

**Consent is required only where something requires consent.** With no
non-essential cookies, no dialogue is presented. Third-party embeds — payment
and ticketing — are declared, and where they set anything on load the page
either defers loading until interaction or discloses it, according to what the
final providers actually do. This is confirmed by inspection of the live
integrations rather than assumed.

**The tax-deductibility claim is a launch gate.** It is not published unless the
committee confirms cantonal recognition of public utility in writing. If
confirmed, the wording states the conditions accurately, including how and when
attestations are issued — manually by the treasurer, given the payment tier
chosen. If not confirmed, both the deductibility claim and the automatic-receipt
promise are removed. This is treated as a blocking item, not a wording
preference.

**Retention periods are defined and short** for the data we control — contact
and sponsorship messages. Data held by the payment and ticketing providers
follows their retention, which is disclosed rather than duplicated.

**Rights requests route to the committee's own address**, with a stated
response time, and the committee is told what to do when one arrives.

**Photograph consent** is established as a supply condition: identifiable people
in event photographs require consent, and this is stated on the list of what the
committee provides rather than assumed.

**Accessibility statement.** The site states its target and gives a contact for
problems. Not legally required for a private Swiss association, but consistent
with the standard the rest of the work is held to.

**Plain language.** Legal pages are written to be read by donors, not to be
maximally defensive. This is a small association; a policy nobody can read
protects nobody.

## Testing Decisions

Compliance is verified, not unit tested. What can be automated is that the
pages exist, are reachable, and that no unexpected third party is contacted.

**Third-party request audit (primary seam).** Every page is loaded with network
requests recorded, and the set of external hosts contacted is asserted against
an allowlist. Any new host fails the check. This is the highest-value automated
test in this PRD: it is what makes the privacy policy verifiable rather than
aspirational, and it catches the common regression where a developer adds a font
or embed and silently invalidates the disclosure.

**Cookie audit.** Pages are loaded and storage inspected; anything set before
interaction fails the check unless allowlisted. Run against the pages carrying
payment and ticketing embeds, which are where it will actually happen.

**Legal page coverage.** Privacy policy, legal notices and accessibility
statement exist in every language and are linked from the footer of every page.
Asserted against the build output alongside the other route coverage.

**Copy verification, manual and blocking.** Before launch, the deductibility
statement and the receipt statement are checked against written confirmation
from the committee. This is a checklist item with a named owner, not a test.

**Pre-launch checklist.** The verification the brief describes — three-language
navigation, a test donation, a test booking, the forms, mobile rendering, and
access handover — is recorded as a documented checklist, run jointly, and the
result kept. The processor list and the request audit are re-run at the same
time, because the providers are configured late and are exactly what changes the
answer.

**Not tested:** whether the privacy policy is legally sufficient. That is a
question for the committee and, if they want certainty, for a lawyer. The
engineering commitment is that the policy accurately describes the system.

## Out of Scope

- Legal advice, and any warranty that the policies are sufficient.
- Obtaining cantonal recognition of public utility.
- Issuing tax attestations, which is a treasurer task.
- Collecting photograph consents, which the committee does.
- Data processing agreements with providers, beyond identifying which are needed.
- A full accessibility audit and remediation beyond the target set in the trilingual PRD.
- Anything related to a future newsletter, which would introduce a consent regime this PRD deliberately avoids.

## Further Notes

**One sentence blocks launch.** The tax-deductibility claim is already live in
the prototype's translation strings. It should be raised with the committee
immediately and in writing, because the answer may take weeks and it cannot be
resolved by us.

**The privacy correction is a conversation to have early, not a silent fix.**
The committee wrote "jamais partagées avec des tiers" and presumably believes
it. The accurate version — that a Swiss host and a Swiss payment provider
process data on their instructions and nobody sells anything — is a better story
than the inaccurate one, and it lands better explained than discovered.

**Choosing cookieless analytics is the cheapest compliance decision available.**
It removes a banner, a consent record, a transfer disclosure and an entire
category of future argument, in exchange for metrics nobody on this committee
would have acted on.

**Re-verify after the payment providers are configured.** DNS and embed changes
made late in the project are precisely what break mail authentication and add
unexpected third-party hosts.
