# docs/editorial/

Engineering notes about the back-office: what an editor can change, how an
announcement gets published, and how the vendored CMS is kept.

Anything the committee reads is in French, in
[`../comite/`](../comite/) — [publier un
événement](../comite/publier-un-evenement.md), [mettre à jour le
Bureau](../comite/mettre-a-jour-le-bureau.md). These pages are for whoever
maintains the site.

| Path | What it is |
| --- | --- |
| `publication.md` | Draft → review → publish: the three states, what decides them, and what is still missing |
| `back-office-maintenance.md` | The vendored CMS: why it is vendored, how to update it, and the unpkg dependency that remains |
| `editable-text-blocks.md` | Whether the site's own copy should become editable, what it would take, and the recommendation |

## What is editable, and what is deliberately not

The editing interface is `public/admin/config.yml`, read by Sveltia CMS
(ADR-0001). It offers exactly two collections — **Événements** and **Bureau du
Comité** — and nothing else.

**Not editable: page structure, navigation, layout, colours, or the site's own
copy.** This is a decision, not a missing feature. Two reasons:

1. A page builder is how a well-meaning volunteer breaks the design the night
   before a gala. The committee has no maintenance budget and no designer on
   call; the recovery cost of that afternoon is the whole argument.
2. Two of the three legal pages are statements the association is answerable
   for, and the site copy is the text the committee formally approved. Making
   those editable is a decision about liability, not a configuration change.

The site's own copy lives in `src/i18n/`. Which parts of it should become
editable, and what that would take, is a question worth answering properly
rather than by accident — see
[`editable-text-blocks.md`](editable-text-blocks.md).

**This has to be said to the committee out loud.** PRD 4 records it as the real
risk in the whole workstream: a committee told they are getting "a WordPress
back-office" expects to add pages and install plugins. They are getting
something better suited to their situation and narrower than that phrase
implies. One sentence during onboarding costs nothing; discovering it after
launch costs the relationship.

## The rule that keeps the interface honest

Every field in `config.yml` must exist in `src/content.config.ts`, with the same
name and the same optionality. A field invented in the interface is written into
the entry and silently dropped by the build. A field required by the schema but
optional in the interface fails the build after the editor has gone home. When
the schema changes, the interface changes in the same commit.
