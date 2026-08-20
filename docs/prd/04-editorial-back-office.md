## Problem Statement

The brief asks for a "back-office WordPress en français". Read as a
requirement it is expensive and fragile; read as what a volunteer committee
actually means, it decomposes into three needs — change things ourselves, do
not be locked to one developer, and give us a French admin that looks like
software. ADR-0001 concluded that the first and third are satisfied by any
decent CMS, and that the second is the committee's call.

What exists today satisfies none of them. There is an admin configuration in
the repository pointing at an authentication broker with nothing behind it, so
the login button leads nowhere. Even if it worked, every editor would need an
account on a third-party developer platform, granted against a repository in
the webmaster's personal name.

The practical consequence is that the committee cannot publish an event without
the webmaster. That matters more than it sounds: this organisation runs a
handful of events a year, and the six weeks before a gala are the only period
when the site genuinely matters. A committee that must email its webmaster to
correct a start time will simply stop updating the site.

## Solution

Give the committee an editing interface in French, scoped to exactly the things
that change — events, past-event photographs, committee officers, and a small
number of editable text blocks — and nothing else.

Editors log in, see a menu in their own language, fill in labelled fields, and
publish. Publishing updates the staging site for review and then the live site.
No page builder, no layout controls, no plugin catalogue: the fields we model
are the fields that exist, which is what keeps a well-meaning volunteer from
breaking the design the night before an event.

## User Stories

### Access

1. As a committee member, I want to log in to an admin area for our site, so that I can make changes myself.
2. As a committee member, I want the interface in French, so that I can use it without translating jargon.
3. As the president, I want to grant and revoke access as the committee changes, so that a departing member no longer has access.
4. As the Comité, I want at least two people able to publish, so that we are not blocked when one is away.
5. As a committee member, I want a password reset I can perform myself, so that being locked out is not a support request.
6. As the Comité, I want editor access secured with two-factor authentication, so that our site cannot be defaced through a weak password.

### Publishing an event

7. As the events officer, I want to create an event by filling in labelled fields, so that I do not need to understand how the site is built.
8. As the events officer, I want to publish a complete event in under twenty minutes, so that announcing something is not an afternoon's work.
9. As the events officer, I want to enter the title, date, venue, programme, pricing and capacity, so that the page carries everything an attendee needs.
10. As the events officer, I want to upload the main photograph and have it sized correctly automatically, so that I do not have to prepare images.
11. As the events officer, I want to save a draft and come back later, so that I can prepare an announcement before it is public.
12. As the events officer, I want to see the event on staging before it goes live, so that I can check it with a colleague first.
13. As the events officer, I want to mark an event as sold out, so that we stop taking bookings for a full room.
14. As the events officer, I want to add the ticketing link, so that the booking button works.
15. As the events officer, I want to add photographs after the event, so that it becomes part of our past-events gallery.
16. As the events officer, I want to correct a published event immediately, so that a wrong time is fixed in minutes.
17. As the events officer, I want French, English and Armenian versions of an event managed together, so that I do not have to create it three times.
18. As the events officer, I want to publish an event with only French filled in, so that a missing translation does not block the announcement.

### The committee bureau

19. As the secretary, I want to update the list of officers after an election, so that the site reflects who is actually in post.
20. As the secretary, I want to upload a portrait and a short biography per officer in French and English, so that the About page is complete.
21. As the secretary, I want to reorder officers, so that they appear in the committee's own hierarchy rather than alphabetically.

### Editable text

22. As the Comité, I want to correct a typo in a page's text myself, so that small fixes do not need a developer.
23. As the Comité, I want the contact details, opening information and social links editable in one place, so that they are consistent everywhere.
24. As the Comité, I want the parts of the site we should not change to be simply absent from the interface, so that we cannot break the design by accident.

### Media

25. As an editor, I want to upload photographs directly, so that I am not emailing files to the webmaster.
26. As an editor, I want to reuse a photograph already uploaded, so that I do not upload the same file repeatedly.
27. As the Comité, I want uploaded photographs stored with the site rather than on a personal account, so that they belong to the association.

### Safety and recovery

28. As an editor, I want a mistaken change to be reversible, so that I can experiment without fear.
29. As the Comité, I want a record of who changed what, so that we can ask the right person about an unexpected change.
30. As the Comité, I want content stored in a form we can export and take elsewhere, so that we are not captive to the tool.
31. As an editor, I want to be told clearly when a required field is missing, so that I do not publish something incomplete.

### Continuity

32. As a future webmaster, I want the editing setup to be conventional and documented, so that I can take over without reverse-engineering it.
33. As the Comité, I want to know what the editing interface costs per year, so that there is no surprise renewal.

## Implementation Decisions

**Choice is gated on one question:** must editors log in with only an email
address? If yes, a hosted editorial platform with invited accounts. If a
developer-platform account is acceptable for two or three editors, a git-backed
editor keeps content in the repository at no recurring cost, which makes the
brief's ownership clause literally true.

The default is the git-backed option — it reads the existing admin
configuration, so adopting it is a swap rather than a rebuild, and it costs
nothing indefinitely. The hosted option is the fallback and changes nothing else
in the architecture, provided content is accessed through one internal boundary
rather than referenced directly throughout the site. That boundary is the real
implementation requirement here: whichever tool is chosen, the rest of the site
reads content through a single seam, so replacing the CMS later is a contained
change.

**Scope of editable content.** Events, past-event galleries, committee
officers, and a defined set of text blocks and contact details. Page structure,
navigation and layout are not editable. This is deliberate and must be stated
to the committee explicitly, because "WordPress" sets the opposite expectation.

**Translations are managed per entry, not per site.** An editor sees the
language variants of the same event together. Missing translations fall back as
established in the trilingual PRD.

**Images are uploaded through the CMS** and processed by the build, so editors
never prepare files manually.

**Publishing flow.** Saving updates staging; promoting publishes to production.
The committee reviews real names and photographs before they are public, which
matters more here than on a typical site.

**History and rollback** come from the underlying storage rather than being
built. With the git-backed option this is free; with the hosted option it is a
feature to verify before committing.

**Editor onboarding is part of delivery, not an afterthought** — accounts
created, two-factor enabled, and the twenty-minute event workflow walked through
with the person who will actually do it.

## Testing Decisions

What matters is that an editor can complete a real task and that the site
survives incomplete input. The CMS itself is third-party software and is not
re-tested; what is tested is our content model and how the site renders what
editors produce.

**The editorial round trip (primary seam).** An event created through the
editing interface appears on staging with its fields rendered correctly. This
is exercised once manually during setup and documented, rather than automated:
automating a third-party admin UI produces brittle tests that break on vendor
updates and test their software rather than ours.

**Partial content renders.** Automated tests assert that an event with only the
required fields, an event with no photograph, an event with no English or
Armenian version, and an officer with no biography all render without error.
This is the highest-value automated testing in this PRD, because incomplete
content is the normal case, not the exception.

**Content validation.** Schema validation rejects an event missing required
fields at build time with a message an editor can act on. Tested by asserting
the build fails on a fixture with a missing required field.

**Fallback behaviour** is covered by the trilingual PRD's browser tests and not
duplicated here.

**Access control** is verified manually and documented: an editor account can
publish, a revoked account cannot, and staging refuses anonymous visitors.

## Out of Scope

- Editing page structure, navigation or layout.
- Any workflow beyond draft, review on staging, and publish. No multi-step approval.
- A newsletter or mailing tool.
- Donor and ticket-buyer records, which live with the payment providers.
- Migrating the invented events, which are removed under the alignment PRD.
- Writing the handover documentation and running training, which is its own PRD.

## Further Notes

**The expectation gap is the real risk in this PRD.** A committee told they are
getting "a WordPress back-office" may expect to add pages and install plugins.
They are getting something better suited to their situation and narrower than
what that phrase implies. Saying so during onboarding, in plain French, costs
one sentence; discovering it after launch costs the relationship.

**Two editors is the right number.** One is a single point of failure, and more
than three on a committee this size means nobody feels responsible.

**The committee's answer on login gates this PRD's shape but not its start.**
The content model, the internal content boundary, and the partial-content tests
are identical either way and can proceed immediately.
