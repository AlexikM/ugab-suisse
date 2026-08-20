## Problem Statement

The donation page exists as a layout with no way to give money. A visitor
persuaded by the committee's impact argument reaches the bottom of the page and
finds nothing to click.

The brief specifies what the flow should offer: one-off or monthly giving,
suggested amounts of CHF 50, 100, 250 and 500 plus a free amount, each carrying
a stated impact, secure payment, and a receipt by email. It names Stripe or
PayPal — but the donors this committee is actually courting are in Switzerland,
where a meaningful share of giving happens by TWINT, PostFinance or bank
transfer rather than by card, and where the older, more generous donor is the
one least likely to type card details into a website.

The constraint that shapes everything: this is a small volunteer association
with no budget for maintaining payment code and no appetite for handling card
data.

## Solution

Do not build a donation system. Embed a Swiss donation provider's hosted form
into the donation page, configured with the committee's amounts and impact
wording, and let the provider own the payment, the recurring billing, the
confirmation email and the donor record.

The site's job is three things: present the argument the committee wrote, host
the provider's form, and return the donor to a thank-you page in their own
language. Everything else — card handling, compliance, TWINT, monthly billing,
the treasurer's donor list — is the provider's problem, permanently.

Alongside the online form, publish a Swiss QR-bill for donors who prefer a bank
transfer. It costs nothing in fees and it serves the donor profile most likely
to give the largest amounts.

## User Stories

1. As a visitor persuaded by the impact text, I want a donation form on the same page, so that I can act without hunting for it.
2. As a donor, I want to choose from suggested amounts with their stated impact, so that I understand what my gift does.
3. As a donor, I want to enter my own amount, so that I am not constrained by the suggestions.
4. As a donor, I want to choose between giving once and giving monthly, so that I can support the committee in the way that suits me.
5. As a Swiss donor, I want to pay by TWINT, so that I can give in the way I normally pay for things.
6. As a Swiss donor, I want a bank transfer option with a QR-bill, so that I can give without using a card and without the committee losing a fee.
7. As a donor, I want to pay by card, Apple Pay or Google Pay, so that giving takes seconds on my phone.
8. As a donor, I want visible reassurance that the payment is secure, so that I trust the form enough to complete it.
9. As a donor, I want a confirmation email, so that I have a record of my gift.
10. As a donor, I want to land on a thank-you page in the language I was reading, so that the experience does not switch languages at the last step.
11. As a donor, I want the thank-you message to be the committee's own words, so that the last thing I read sounds like them.
12. As a visitor anywhere on the site, I want the donate button always reachable, so that I can act the moment I decide.
13. As a monthly donor, I want to be able to stop my recurring gift without emailing anyone, so that committing feels low-risk.
14. As the treasurer, I want a list of donations I can export, so that I can do the accounts and issue attestations.
15. As the treasurer, I want to see whether a gift was one-off or recurring, so that I can forecast income.
16. As the Comité, I want to know exactly what each donation costs us in fees, so that we can decide what to encourage.
17. As the Comité, I want the donation account in the association's name, so that the money arrives in our account and the relationship is ours.
18. As a donor, I want to know that my details are not passed around, so that I give without worrying what happens next.
19. As the Comité, I want to offer donors the option to cover the transaction fee, so that more of each gift reaches the mission.
20. As a large donor or sponsor, I want to pay by invoice rather than card, so that my accountant has what they need.

## Implementation Decisions

**Nothing that touches money is built.** No custom checkout, no card handling,
no stored payment details, no donor database of our own. This is the single
most important decision in this PRD and the reason it is small.

**Provider.** A Swiss donation provider on its free tier — one that covers
TWINT, PostFinance, Swiss QR, cards and wallets, with recurring giving included
and no monthly fee. The comparison and the fallback are recorded in ADR-0001.
Selection is confirmed after seeing a live form, because form appearance is the
one real cost of this approach and the brief treats visual identity as
important.

**Integration is an embed, not an API.** The provider's hosted form is placed on
the donation page, configured with the committee's amounts and impact wording.
No server-side integration, no webhooks, no synchronisation. The provider's own
API tiers are explicitly not purchased: the capability is not needed for a
static site and the pricing is out of proportion to this project.

**Return journey.** The provider returns the donor to a thank-you page on the
committee's own domain, in the language they were browsing, carrying the
committee's approved confirmation wording.

**QR-bill alongside, not instead.** A Swiss QR-bill against the association's
account is published on the same page for donors preferring a transfer. Zero
fee, and it covers the demographic least comfortable with an online form.

**Fee coverage.** If the provider supports offering donors the option to cover
processing fees, it is enabled. It is a checkbox that measurably increases net
receipts.

**Receipts are confirmations, not attestations.** The provider sends a payment
confirmation automatically. Tax attestations are not automatic on a free tier
and are issued by the treasurer from the exported list. The site's copy must
not promise otherwise — the existing wording does, and correcting it is handled
under the compliance PRD.

**Donor data stays with the provider.** The site stores nothing about donors.
This keeps our data-protection surface close to zero and the treasurer's export
becomes the single source of truth.

**Flexibility where it is free.** The amounts, impact wording and recurring
options are provider configuration, so the committee can adjust them later
without a developer. Where flexibility would require building something, it is
declined.

## Testing Decisions

The provider's payment flow is not ours to test. What is worth testing is that
our page presents the flow correctly, that the return journey works, and that
the promise made in the copy matches what the system does.

**A real test donation, end to end.** One live transaction per payment method
offered — at minimum TWINT and card — taken through to the confirmation email
and refunded. This is a documented manual procedure, run before launch and after
any provider configuration change. The brief already calls for a test donation
at the pre-launch check; this makes it a repeatable procedure rather than a
one-off.

**The return journey (automated).** The thank-you page exists in every
language, carries the committee's approved wording, and is reachable directly.
Asserted against the build output alongside the other route coverage.

**The donate call to action.** Browser-level assertion that it is present and
reachable on every page and leads to the donation page. This protects the
brief's most specific interface requirement.

**Graceful degradation.** The donation page renders usefully — impact text, QR-
bill, contact details — if the embedded form fails to load. Asserted by
rendering the page with the third-party embed blocked. A donation page that is
blank when a script is blocked is worse than one without a form.

**Fee arithmetic is verified once, on paper**, not tested: the effective total
rate per payment method confirmed with the provider and recorded, because
platform fees and payment-method fees stack and the published headline rate is
not what the committee will actually pay.

## Out of Scope

- Building any payment, checkout or subscription logic.
- Purchasing provider API access, and any webhook or synchronisation work.
- Automatic tax attestations.
- Donor relationship management, segmentation, or a mailing tool.
- Event ticketing, which is its own PRD, and sponsorship payment, which is an invoice.
- Displaying fundraising totals or progress bars — not requested, and it invites awkward questions when a campaign stalls.
- Armenian-language checkout, which no Swiss provider offers.

## Further Notes

**Two claims in the committee's own copy are not yet true**: that donations are
tax-deductible, and that a receipt is automatic. Both are handled under the
compliance PRD, and the second is resolved by this one only in the narrow sense
of a payment confirmation.

**The largest gifts will not come through this form.** Sponsorship tiers and VIP
tables are invoice-and-transfer transactions where a card fee would cost the
committee real money. The donation form is for the CHF 50 to 500 range; make
the transfer route visible for everything above it.

**Keep the page's centre of gravity on the argument, not the form.** The
committee wrote a genuinely good impact text. The form should follow it, not
replace it.
