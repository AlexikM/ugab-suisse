## Problem Statement

Event pages describe events nobody can book. The brief asks for "billetterie
événements avec gestion des places", an automatic "Complet" display when an
event sells out, and — in the committee's own confirmation wording — a ticket
sent by email.

The committee's event template makes the requirement concrete and slightly
harder than it first appears: a single gala carries several ticket types at
different prices (per person, per couple, a VIP table) against one room
capacity. Three independent payment links do not reconcile against two hundred
seats; sell enough VIP tables and the per-person link keeps cheerfully selling
seats that no longer exist.

There is a second, structural problem. A statically generated site has no
knowledge of live stock. A prebuilt page will show a working booking button
until someone rebuilds it, however sold out the event is.

And there is a third, which only appears once ticketing is rented: the event now
exists in two places. It is an announcement on the site and a till at the
provider, and the committee has to create both. Every attempt to remove that
duplication by machine costs more than the duplication does.

This matters perhaps three times a year — but those three occasions are the
committee's main fundraising events, and the failure mode is oversold seats at a
seated dinner.

## Solution

Rent ticketing rather than build it, from **Infomaniak** — the provider already
chosen for hosting and mail — and embed its booking widget on the event page so
that the page reports real remaining stock instead of a stale guess.

Keep the site's role small: describe the event, show the price list, host the
widget. The provider owns payment, stock, ticket delivery and the door.

Accept that the committee creates each event twice — once as a till in
Infomaniak, once as an announcement in the CMS — and join the two with a single
pasted identifier. Nothing on this site ever writes to the ticketing system.

Where the committee wants something the rented service does not do, the answer
is to adjust the expectation rather than build the difference. This is a
handful of events a year for a volunteer association.

## User Stories

1. As an interested visitor, I want to book a place from the event page, so that I do not have to phone or email anyone.
2. As an attendee, I want to see the ticket types and prices before booking, so that I can choose the right one.
3. As a couple, I want to buy a couple's ticket rather than two singles, so that I get the price the committee advertised.
4. As a company representative, I want to book a VIP table, so that I can bring colleagues or clients.
5. As an attendee, I want to pay by TWINT or card, so that I can book in the way I normally pay.
6. As an attendee, I want my ticket by email, so that I can show it at the door from my phone.
7. As an attendee, I want a confirmation naming the date and venue, so that I know where I am going.
8. As a visitor to a full event, I want to see clearly that it is sold out, so that I do not attempt a booking that cannot succeed.
9. As a visitor, I want the sold-out state to be accurate, so that I am not told a place is available when it is not.
10. As the events officer, I want the room's capacity respected across all ticket types together, so that we cannot oversell a seated dinner.
11. As the events officer, I want to set the ticket types, prices and capacity myself, so that announcing an event does not require a developer.
12. As the events officer, I want a list of who is coming, so that I can plan the seating and the catering.
13. As the door team, I want a way to check arrivals against the bookings, so that entry is orderly.
14. As the treasurer, I want ticket income exportable, so that I can reconcile the event.
15. As the Comité, I want the ticketing cost carried by the ticket price rather than deducted from what we counted on, so that event revenue is predictable.
16. As a VIP table buyer, I want to reserve the table and pay by invoice and bank transfer, so that my company's accounts are satisfied and the committee keeps the card fee.
17. As the events officer, I want an invoiced table to hold its seats against the same capacity as online sales, so that the room count stays honest while we wait for the transfer.
18. As the events officer, I want to enter a booking taken by telephone or at the door myself, so that offline sales draw down the same capacity as online ones.
19. As the Comité, I want the ticketing account in the association's name, so that the takings and the customer relationship are ours.
20. As the Comité, I want the ticketing account at the same provider as the hosting, so that there is one fewer account, one fewer password and one fewer support line to hand over at each election.
21. As an attendee who wants to give more than the ticket price, I want to add a donation at checkout, so that I can support the association beyond attending.
22. As the treasurer, I want the attestation fiscale to cover only the donation part and not the dinner, so that what we certify is true.
23. As a visitor, I want past events shown with photographs rather than dead booking links, so that the archive is worth browsing.
24. As the events officer, I want to close bookings before the event, so that we are not taking money the night before with catering already ordered.
25. As an attendee who cannot come, I want to know who to contact, so that my place can be released.
26. As a visitor with third-party scripts blocked, I want the event page to still tell me what the event is and how to reach the committee, so that a blocked widget is an inconvenience and not a dead end.

## Implementation Decisions

**Ticketing is rented, not built.** No stock logic, no ticket generation, no
payment handling in this codebase. The requirements above — several ticket types
against one capacity, e-tickets, a door list — are exactly what a ticketing
service does as a product, and none of them are worth building for three events
a year.

**Provider: Infomaniak eTickets.** It is not the cheapest option; it is the one
that costs the committee least over time. Three reasons, in order of weight.
The hosting and mail accounts are already at Infomaniak, so this adds no
eleventh entry to the eleven accounts
[carte-des-comptes](../comite/carte-des-comptes.md) already asks a turning-over
committee to track — one provider, one login, one invoice, one support line.
Infomaniak is Genevan, so support answers in French, locally, to a Geneva
committee. And it does what the requirement needs: TWINT, PostFinance and card;
ticket categories and seating plans; a free offline scanning app; an embeddable
responsive widget; Excel and PDF exports.

**Fees are deducted from the organiser, and are therefore priced in.**
Infomaniak's commission — 2.5% plus CHF 0.89 by card, CHF 0.20 by TWINT or
PostFinance — comes out of the association's revenue rather than being added at
the buyer's checkout. A CHF 120 ticket costs the committee about CHF 3.90. The
answer is to set the advertised price with the commission already inside it,
and the committee must be told that plainly rather than discover it on the first
payout. Story 15 is written to describe this reality rather than the
buyer-pays-a-visible-fee arrangement other providers offer.

**Offline sales cost almost nothing, so use them.** Tickets entered from the
administration console carry the fixed commission only — no percentage, no bank
fee. A CHF 2,000 VIP table entered by hand costs the committee under a franc,
against roughly CHF 50 if it went through the card checkout.

**Invoiced tables are ordered in the system, not outside it.** The company
reserves through the provider choosing prepayment; the seats are held against
the same capacity as online sales; the committee sends a QR-facture by email;
payment lands directly in the association's account; the committee marks the
order paid and the e-tickets are released. This is better than the off-platform
invoicing previously assumed here, because the room count stays correct while
the transfer is in flight.

**The invoice itself is not software.** Swiss e-banking generates a QR-facture
free. For five to ten invoices a year, a generator on this site would mean PDF
rendering, IBAN handling, a numbering sequence and a ten-year retention
obligation, to replace something the bank already does.

**Sold-out display — the embed resolves it.** Embedding the provider's booking
widget on the event page means availability is reported by the system that owns
the stock, which is the only way a static page can be accurate. A manually
maintained sold-out flag is retained as an override for events not sold through
the provider, and as an immediate answer the committee can give without waiting
for anything.

**Capacity is the provider's arithmetic, not ours.** Ticket types are configured
against one capacity in the provider, so the cross-type reconciliation the
committee needs is a configuration decision rather than something we compute.

**Ticket price and donation are separate lines.** The ticket is priced at what
the evening is worth; an optional donation is offered on top at checkout. This
is not presentation — a donation is a gift without counterpart, so certifying a
gala ticket as deductible would be certifying something untrue, one document per
guest. Splitting the two keeps the attestations honest and, in practice, raises
more than a single inflated price does. See [PRD 05](05-donations.md).

The provider does this natively: a donation campaign is configured against the
event's schedule and appears at checkout beside the ticket types. Nothing has to
be built or worked around, which is the second time the account consolidation
has paid for itself.

**Checkout donations are ticketing income, and the treasurer has to be told.**
A soutien added to a ticket order is paid out with the ticket money, not through
the donation provider. So donation income arrives in two exports rather than
one, and the attestation for a gala donation is produced from the ticketing
export. This is a reconciliation instruction, not a design problem, but it is
the kind of thing that is unpleasant to discover in January. It belongs in the
treasurer's procedure alongside
[exporter-les-dons](../comite/exporter-les-dons.md).

**Donations as a whole stay with the donation provider.** The ticketing donation
feature is not a substitute for [PRD 05](05-donations.md), for two reasons that
are structural rather than a matter of polish. It has no recurring giving, and
PRD 05 stakes two user stories on monthly donors who can stop without emailing
anyone. And it is configured inside an event, where the donation page has to
work in February when nothing is on sale. Checkout donations are an addition to
the donation provider, not a replacement for it.

**The site never writes to the ticketing system.** The provider exposes a REST
API, and creating each event from its CMS entry was considered and rejected —
including the narrower version, where the API creates the event once at first
publication and the committee manages everything in the provider afterwards.
That variant answers most of the objections: it cannot drift, because it never
runs twice; it needs no reconciliation; and it does not put a call that can
half-succeed inside the deploy. Entering ticket types in the CMS would not be
hard either — a name, a price and a quantity is a small form.

It is rejected because an API-created event is not a sellable event. The
provider needs decisions the CMS has no business holding: which payment methods
are enabled, when sales open and close, the prepayment deadline, VAT treatment,
the wording of the confirmation email, the seating plan where one is used.
Created from a fiche, the event arrives as a skeleton that somebody still has to
open in the provider to finish and switch on. The visit happens either way, so
what the integration buys is not one system instead of two — it is four fields
not retyped, perhaps three minutes an event, a quarter of an hour a year. The
price is an API client, a scheduled action, a credential to rotate, a stored
remote identifier, and a failure mode in which a committee member believes a
till exists because a fiche says so.

There is a second cost, smaller but permanent. The price list is free text
today, and free text is what a committee actually writes: "Entrée libre, collecte
à la sortie", "CHF 150 (étudiants CHF 80), apéritif inclus", "prix libre dès
CHF 20". Driving an API needs structure, and structure either loses that prose or
keeps both fields, which is the same price entered twice inside our own CMS.

The right moment to revisit this is after a year of real use, when the committee
can say which part of the double entry actually costs them something. Building
the integration now is a guess about that, and an integration welds us to this
provider where a pasted identifier does not.

**The event exists twice, and that is the accepted cost.** Title, date, venue
and price list are typed into both systems, three to five times a year — about
five minutes per event. That is the whole price of having no server, and it buys
a site that still works untouched in three years.

**Schema follows the boundary.** Three fields in the fiche are transaction facts
sitting on the description side, and they are corrected here.

- `capacity` is **removed**. It renders today as *Nombre de places — places
  disponibles pour l'ensemble des tarifs*, a number the site asserts and nothing
  verifies. Once the provider owns the quota, ours is a second truth that drifts
  the first time ten seats are added.
- `soldOut` is **kept but demoted** to an override for events not sold through
  the provider. The field help the committee reads has to say so, because a
  member who ticks it out of habit hides a working booking button.
- `pricing` is **kept**, deliberately, as a copy. It has to be readable in
  Armenian, without JavaScript, and inside the announcement itself — none of
  which an embedded widget provides. Its staleness risk is accepted and named in
  the field help: this is what visitors read, the provider is what they pay.
- A new optional field carries the **shop identifier**, from which the component
  generates the embed markup. It is separate from `ticketUrl` so that the
  committee can choose per event: embed where live availability matters, plain
  link where they would rather not load a third-party script.

**The event page owns the description, the provider owns the transaction.**
Programme, dress code, venue, photographs and the price list are site content.
Booking, payment, stock and delivery are the provider's. The boundary is
deliberate: it is what keeps ticketing swappable.

**Graceful degradation.** If the widget fails to load, the page still shows the
event, the prices and a contact route. An event page that is blank without
third-party scripts is worse than one without a booking button.

**Armenian is not available at checkout.** As with donations, the booking step
will be French, German or English.

**Fallback provider.** Eventfrog, if the committee's calendar turns out to be
many small cheap events rather than a few large ones: its free tier is genuinely
zero-cost below CHF 50 a ticket, where Infomaniak still takes its percentage,
and it charges its fee to the buyer explicitly rather than requiring it to be
priced in. Choosing it costs the account consolidation that is the main argument
above, and nothing in this codebase beyond a different pasted identifier.

## Testing Decisions

The provider's booking engine is not ours to test. What is tested is that our
event pages present it correctly, degrade sanely, and never assert availability
we cannot know.

**A real test booking, end to end.** One booking per ticket type, taken through
to the e-ticket email and refunded; one prepayment order carried through to
marking it paid and releasing the tickets; one ticket entered from the console
as an offline sale; and one booking against a deliberately exhausted capacity to
confirm the sold-out state actually appears. Documented manual procedure, run
before each major event rather than only once — the configuration is per-event,
so a test that passed for last year's gala proves nothing about this year's.

**Sold-out rendering (automated).** An event marked sold out renders the
sold-out state and does not render an active booking control. Asserted against
the build output. This is the assertion that protects the requirement most
likely to embarrass the committee.

**No capacity claim (automated).** No built page asserts a number of remaining
or total places. This is the regression test for the field being removed, and it
is what stops the number reappearing in a later template.

**Partial and past events (automated).** An event with no ticketing identifier,
an event with no price list, and a past event all render correctly, the past
event showing its gallery rather than a booking control. Incomplete events are
normal.

**Degradation.** The event page is rendered with third-party embeds blocked and
asserted still to show the event details, the price list and a contact route.

**Not tested:** stock counts, payment, ticket delivery, and the door
application. These belong to the provider, and asserting them from here would
test their software while producing tests that break whenever they ship.

## Out of Scope

- Building ticketing, stock management, ticket generation or payment handling.
- Creating or updating events in the provider from this site, by API or
  otherwise, including one-off creation at first publication. The committee
  creates the event in the provider by hand.
- Live stock synchronisation and scheduled rebuilds.
- Generating invoices. The committee's e-banking produces the QR-facture.
- Seating and table assignment as a feature of this site. The provider offers
  seating plans, including banquet layouts; if the committee wants assigned
  tables it is configured there, and nothing here changes.
- A waiting list for sold-out events.
- Refunds and transfers, which are handled by the committee in the provider's
  dashboard.
- Attendee data in our systems; it stays with the provider.
- Sponsorship payment flows, which are invoices.

## Further Notes

**Four things to confirm with the provider before signing**, none of them
difficult, all of them capable of changing the answer. Whether ticket categories
can share one overall quota, or whether the seating plan is the only mechanism
for that. Whether the service fee can be shown to the buyer at checkout after
all, which would remove the pricing-in compromise. The exact fixed commission on
console-entered sales, which is the number the VIP-table route depends on. And
the commission applied to checkout donations, which the provider's documentation
describes only as covering banking fees — if it is the full ticket rate, the
split still holds, but the committee should know what a CHF 60 soutien actually
delivers.

**One committee answer still shapes this PRD**, and it is no longer a blocker.
Whether "gestion des places" means capacity or table assignment: the provider
does both, so either answer is configuration rather than a new project. It is
still worth asking plainly rather than discovering in November.

**Test before every event, not once before launch.** Ticketing configuration is
per-event and the cost of getting it wrong is concentrated on a single evening.

**The honest fallback is still acceptable.** If the committee prefers to avoid
ticketing altogether, per-event payment links with a manual sold-out flag and a
printed guest list is a legitimate answer for an association of this size. It
just has to be an agreed reduction in scope rather than a discovered one.
