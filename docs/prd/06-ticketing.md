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

This matters perhaps three times a year — but those three occasions are the
committee's main fundraising events, and the failure mode is oversold seats at a
seated dinner.

## Solution

Rent ticketing rather than build it. Use a ticketing service that already
handles multiple ticket types against one capacity, issues e-tickets by email,
and provides a door list — and embed its availability widget on the event page
so that the page reports real remaining stock instead of a stale guess.

Keep the site's role small: describe the event, show the price list, and host
the booking widget. The provider owns payment, stock, ticket delivery and the
door.

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
15. As the Comité, I want the ticketing fee to be payable by the buyer, so that ticket revenue reaches us intact.
16. As a VIP table buyer, I want to pay by invoice and bank transfer, so that my company's accounts are satisfied and the committee keeps the card fee.
17. As the Comité, I want the ticketing account in the association's name, so that the takings and the customer relationship are ours.
18. As a visitor, I want past events shown with photographs rather than dead booking links, so that the archive is worth browsing.
19. As the events officer, I want to close bookings before the event, so that we are not taking money the night before with catering already ordered.
20. As an attendee who cannot come, I want to know who to contact, so that my place can be released.

## Implementation Decisions

**Ticketing is rented, not built.** No stock logic, no ticket generation, no
payment handling in this codebase. The requirements above — several ticket types
against one capacity, e-tickets, a door list — are exactly what a ticketing
service does as a product, and none of them are worth building for three events
a year.

**Provider.** A ticketing service supporting multiple ticket types against a
shared capacity, e-tickets with a scannable code, a door-check facility, and
fees that can be passed to the buyer. Selection is confirmed against the
committee's answers on door handling and on what "gestion des places" means.

**Sold-out display — the embed resolves it.** Embedding the provider's booking
widget on the event page means availability is reported by the system that owns
the stock, which is the only way a static page can be accurate. A manually
maintained sold-out flag is retained as a fallback for events not sold through
the provider, and as an override the committee can set immediately without
waiting for anything. Deriving stock through an API and rebuilding the site on a
schedule was considered and rejected: more machinery, more failure modes, and
still not live.

**Capacity is the provider's arithmetic, not ours.** Ticket types are configured
against one capacity in the provider, so the cross-type reconciliation the
committee needs is a configuration decision rather than something we compute.

**Large amounts go by invoice.** VIP tables and sponsorship packages are handled
by invoice and bank transfer, not card. On four-figure amounts the card fee is
material, and corporate buyers want an invoice anyway.

**The event page owns the description, the provider owns the transaction.**
Programme, dress code, venue, photographs and the price list are site content.
Booking, payment, stock and delivery are the provider's. The boundary is
deliberate: it is what keeps ticketing swappable.

**Graceful degradation.** If the widget fails to load, the page still shows the
event, the prices and a contact route. An event page that is blank without
third-party scripts is worse than one without a booking button.

**Armenian is not available at checkout.** As with donations, the booking step
will be French or English.

## Testing Decisions

The provider's booking engine is not ours to test. What is tested is that our
event pages present it correctly, degrade sanely, and never assert availability
we cannot know.

**A real test booking, end to end.** One booking per ticket type, taken through
to the e-ticket email and refunded, plus one booking against a deliberately
exhausted capacity to confirm the sold-out state actually appears. Documented
manual procedure, run before each major event rather than only once — the
configuration is per-event, so a test that passed for last year's gala proves
nothing about this year's.

**Sold-out rendering (automated).** An event marked sold out renders the
sold-out state and does not render an active booking control. Asserted against
the build output. This is the assertion that protects the requirement most
likely to embarrass the committee.

**Partial and past events (automated).** An event with no ticketing link, an
event with no price list, and a past event all render correctly, the past event
showing its gallery rather than a booking control. Incomplete events are normal.

**Degradation.** The event page is rendered with third-party embeds blocked and
asserted still to show the event details and a contact route.

**Not tested:** stock counts, payment, ticket delivery, and the door application.
These belong to the provider, and asserting them from here would test their
software while producing tests that break whenever they ship.

## Out of Scope

- Building ticketing, stock management, ticket generation or payment handling.
- Seating plans and table assignment, unless the committee confirms this is what "gestion des places" meant — in which case it is a new PRD, not an addition to this one.
- Live stock synchronisation via provider APIs and scheduled rebuilds.
- A waiting list for sold-out events.
- Refunds and transfers, which are handled by the committee in the provider's dashboard.
- Attendee data in our systems; it stays with the provider.
- Sponsorship payment flows, which are invoices.

## Further Notes

**Two committee answers shape this PRD and neither is difficult to get.**
Whether tickets are scanned at the door or checked against a printed list, and
whether "gestion des places" means capacity or table assignment. The second is
the one that could turn a small piece of work into a large one — a seated gala
where a committee expects to assign guests to tables is a different product from
a capacity counter, and it is worth asking plainly rather than discovering in
November.

**Test before every event, not once before launch.** Ticketing configuration is
per-event and the cost of getting it wrong is concentrated on a single evening.

**The honest fallback is acceptable.** If the committee prefers to avoid a
second provider, per-event payment links with a manual sold-out flag and a
printed guest list is a legitimate answer for an association of this size. It
just has to be an agreed reduction in scope rather than a discovered one.
