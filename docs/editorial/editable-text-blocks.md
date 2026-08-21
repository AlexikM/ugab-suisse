# The site's own copy, and whether an editor should be able to change it

PRD 4 puts "a defined set of text blocks and contact details" in scope for the
editing interface. None of it is editable today, and this is the note that says
why, what it would cost to change, and what to change first.

It is written so that the answer is a decision rather than an omission. The
committee will ask — *why can I change an event but not the sentence above it?*
— and "nobody got to it" is a worse answer than either of the real ones.

## Where the copy lives now

| | |
| --- | --- |
| `src/i18n/ui.ts` | Every visible string outside the legal pages: navigation, headings, the home page's argument, the donation copy, the key figures, the sponsorship tiers |
| `src/i18n/legal.ts` | The three legal pages, the processor register, and the committee's own facts — address, e-mail, telephone, IDE number |
| `docs/content/site-copy.md` | The committee's approved FR/EN copy. Where code and this disagree, this wins |

An editor changes none of it. They change events and the Bureau, and everything
else is a commit by whoever maintains the site.

## Why it is like that

**Three of these are not text.** The processor register in `legal.ts` is a list
of third parties the site is audited against: the compliance suite compares it
to what the built site actually contacts and fails in both directions. The
committee's facts are `null` on purpose, so an unsupplied address renders as
*à fournir par le Comité* instead of an invention. The trilingual fallback keys
off which strings exist per language — a page serves French, and says so, until
every string it needs exists in the language asked for. An editor emptying a
field would put a page into fallback without knowing they had.

**Two of the legal pages are statements the association is answerable for.**
Tests forbid a tax-deductibility claim and a receipt-by-email promise, because
no cantonal decision exists and nothing sends receipts. Those tests read the
built site, so they would still fire — the build would fail, in CI, after an
editor had saved. Failing there is far worse than not offering the field: the
committee sees a red cross on something they did an hour ago and cannot fix it
themselves.

**And the copy was formally approved.** `docs/content/site-copy.md` is the
source of truth precisely because somebody signed it off. Making it editable
means the site and the approved text can silently diverge.

## What would have to be built

Not much, and that is the point of writing it down rather than treating it as
impossible.

1. **A content collection for the editable blocks.** `src/content/textes/`, one
   entry per block, one field per language — the same shape as the Bureau's
   biographies. Not a free-form page: a named block with a known place.
2. **A `files` collection in `public/admin/config.yml`**, with a French label
   and a hint per block saying where on the site it appears. Sveltia calls this
   a settings-style collection; it edits fixed entries rather than creating new
   ones, which is what stops it becoming a page builder.
3. **The boundary reads it.** `src/lib/content.ts` gains one accessor, and the
   pages ask it the way they ask for events. A block with no entry falls back to
   the string in `ui.ts`, so the site never renders a hole.
4. **A test per editable block** asserting the fallback: an empty entry renders
   the approved copy, not an empty section.

The cost is not the code. It is that every editable string becomes a string that
can be wrong in one language only, and nobody will notice in the two languages
they do not read.

## What to make editable first, if anything

In order, and each for a reason that is about how often it actually changes:

1. **The committee's contact details** — postal address, e-mail, telephone.
   These are `null` today and blocking (#9); they change when the committee
   moves or when the mailbox changes hands, and they appear on the contact page,
   in the legal notices and in the privacy policy at once. This is the one block
   where editing beats a commit, because the person who knows the new address is
   not the person who knows the repository.
2. **The key figures on the home page** — they are a claim about the
   association's work and they date.
3. **The sponsorship tier amounts** — the brief marks them indicative, and a
   committee that raises them should not have to ask.

Everything else — the mission paragraphs, the history, the values, the donation
argument — is approved copy that changes when the committee decides to say
something different, which is a conversation, not an edit.

## The recommendation

**Do none of it until the committee asks.** The contact details are the only
block with a real editing case, and they are blocked on #9 rather than on this:
once supplied they go in `legal.ts` in one commit and stop being urgent.

If the committee does ask, do item 1 alone and stop. A back-office that edits
three things well is a better inheritance than one that edits thirty things
nobody remembers the rules for.
