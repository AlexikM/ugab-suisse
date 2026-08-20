## Problem Statement

The brief provides for "une courte formation à la gestion du site" and two
months of free correction of reported anomalies. Both are reasonable. Neither
survives contact with how a volunteer association actually works.

The person trained in 2026 is not the person running the site in 2029.
Committees turn over, roles rotate, and the member who learned to publish an
event moves to Lausanne. What survives a handover is not a training session; it
is written material that someone who was not in the room can follow.

The brief is also silent on what happens in the third month. It defines a
warranty window without defining what an anomaly is, or what the arrangement
becomes afterwards. The default outcome of that silence is well known: the
webmaster is still fixing event pages for free three years later, resentfully,
and the committee has no idea they are imposing.

There is a third gap. The brief says everything becomes the full property of the
committee on delivery, but property you cannot access is not property. Without
credentials in the association's hands and a written map of where things live,
"pleine propriété" is a sentence rather than a fact.

## Solution

Produce the small amount of written material that makes the committee genuinely
self-sufficient, hand over every credential, and define the boundary of the
relationship in plain terms both sides can live with.

One page in French describing where everything lives and who owns it. A short
guide to the two or three tasks the committee actually performs. A recording of
each, because reading how to publish an event is not the same as watching it.
A runbook for the handful of things that go wrong. Then a written statement of
what is covered, for how long, and what happens next.

The test of success is simple: a committee member who has never met us can
publish an event, and a developer who has never seen this project can deploy it.

## User Stories

1. As a new committee member, I want one page telling me where the site, the domain, the mailboxes and the payment accounts live, so that I can orient myself quickly.
2. As the treasurer, I want to know which accounts cost money, how much, and when they renew, so that nothing lapses and nothing surprises the budget.
3. As the president, I want to know who currently has access to what, so that I can revoke it when someone leaves.
4. As a new committee member, I want to be able to publish an event by following written instructions, so that I do not need to be trained personally.
5. As a committee member, I want to watch someone do the task once, so that I understand it before trying.
6. As a committee member, I want the instructions in French, so that I can follow them.
7. As the events officer, I want a checklist for announcing an event, so that I do not forget the ticketing link or the photograph.
8. As the treasurer, I want to know how to export donations and issue attestations, so that I can do the year-end without asking anyone.
9. As a committee member, I want to know what to do when something looks broken, so that my first move is not panic.
10. As a committee member, I want to know who to contact and what counts as urgent, so that I neither sit on a real problem nor escalate a small one.
11. As the Comité, I want every password and recovery code in our own store, so that our access does not depend on the webmaster's goodwill or memory.
12. As the Comité, I want two of us to hold the keys, so that being locked out does not depend on one person's availability.
13. As a future webmaster, I want to be able to build, run and deploy the site from the repository alone, so that taking over does not require interviewing the previous one.
14. As a future webmaster, I want the decisions and their reasons written down, so that I do not undo something for reasons already considered.
15. As the Comité, I want to know what is covered without charge and for how long, so that we can ask without wondering whether we are imposing.
16. As the webmaster, I want a clear definition of an anomaly versus a new request, so that goodwill is not open-ended.
17. As the Comité, I want to know what our options are after the warranty period, so that we can plan and budget.
18. As the Comité, I want to know how to leave each provider if we ever need to, so that we are not captive.
19. As the Comité, I want to know what our recurring obligations are — renewals, updates, checks — so that neglect is a choice rather than an accident.
20. As the Comité, I want the handover confirmed in writing on both sides, so that everyone agrees delivery happened.

## Implementation Decisions

**The one-page account map is the primary deliverable**, in French, listing
every account, its owner, its cost, its renewal date and who holds access. It is
kept in the committee's own store alongside the credentials, not only in the
repository, because a committee locked out of the repository still needs it.

**Task guides cover only what the committee actually does**: publish an event,
add photographs after an event, update the bureau after an election, export
donations, correct a text. Short, screenshot-led, in French. Documenting
anything else is documentation that will rot unread.

**Each task is recorded as a short screen capture.** Five minutes of video is
worth more than five pages of prose to a volunteer doing this twice a year, and
it survives the trainee leaving.

**Training is a working session, not a presentation** — the person who will
actually publish events does so, live, while we watch. Anything they stumble on
is a defect in the guide, and the guide is corrected before delivery is called
complete.

**A short runbook** covers the realistic failures: the site is down, mail is not
arriving, a donation did not appear, the ticketing widget is not loading, the
domain renewal notice arrived. Each with a first action and who to contact.

**Credential handover is a transaction with a checklist**, not an email of
passwords. Every account transferred to the association's store, two-factor
enabled, recovery codes held by the treasurer, and the webmaster's personal
access reduced to what is needed to keep working.

**Developer handover lives in the repository**: how to run it, how to deploy it,
how the content model works, and the ADRs recording why things are as they are.
The test is that someone unfamiliar can build and deploy from a clean checkout
following the README alone.

**The support boundary is written in plain French and agreed in writing.** An
anomaly is the site not doing what was agreed; a new request is a change to what
was agreed. The warranty period runs from go-live. What follows it — a small
annual arrangement, ad-hoc paid work, or nothing — is stated explicitly rather
than left to drift. The committee is also told plainly which obligations are
theirs: renewals, content, and the provider accounts.

**Exit notes per provider**: how to export content, donations and ticket data,
and what it would take to move. Short, but it converts "we are not locked in"
from a claim into an instruction.

## Testing Decisions

The deliverable is documentation, so it is tested the way documentation should
be — by having someone who does not already know the answer follow it.

**The committee test (primary).** A committee member who has not been trained
publishes an event following the written guide, unaided, while we observe
without helping. Every hesitation is a defect in the guide. This is the real
acceptance test for this PRD and it must involve someone other than the person
who sat through the training.

**The cold-start test.** A developer unfamiliar with the project clones the
repository, builds, runs and deploys to staging following the README alone. Any
undocumented step is a defect. If no such developer is available, the closest
approximation is a clean machine and a strict refusal to rely on memory.

**The credential test.** The treasurer independently signs in to each account
using only what is in the association's store, including one two-factor recovery
path. Ownership that has never been exercised is not ownership.

**The runbook test.** At least one failure is simulated — most cheaply, a
deliberately failed deploy or a blocked embed — and the runbook followed to
confirm it leads somewhere useful.

**Not tested:** whether the committee will actually maintain the site. They may
not, and the architecture was chosen so that neglect degrades gracefully rather
than catastrophically.

## Out of Scope

- Ongoing maintenance itself, which is a commercial arrangement rather than a deliverable.
- Training on anything other than the defined committee tasks.
- Documentation of third-party providers beyond how the committee uses them.
- Migrating away from any provider; this PRD documents the exits, it does not perform one.
- Marketing, fundraising or communications guidance.

## Further Notes

**This PRD is the one most likely to be cut when time runs short, and it is the
one with the longest half-life.** The code will be replaced eventually. The
account map is what stops the domain lapsing in 2031.

**The support boundary conversation is easier before launch than after.** Framed
as protecting the committee — so they know what they can ask for without
imposing — it is a service rather than a retreat. Framed after the third free
change request, it reads as a withdrawal.

**Recommend the committee nominate a single site contact** and record the role
in the account map. Volunteer organisations diffuse responsibility naturally;
one named person is the difference between a site that stays current and one
that is accurate as of the year it launched.

**Delivery is complete when both sides confirm in writing**, which is what the
brief itself asks for.
