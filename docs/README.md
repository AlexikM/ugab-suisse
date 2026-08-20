# docs/

| Path | What it is |
| --- | --- |
| `adr/` | Architecture decision records — the *why*, with alternatives rejected |
| `prd/` | Product requirements, one per delivery slice; each is also a GitHub issue |
| `content/site-copy.md` | The committee's approved FR/EN site copy — source of truth for content |
| `content/placeholder-inventory.md` | Every element on the site that is still a placeholder, and what replaces it |
| `gap-analysis-prototype-vs-brief.md` | What the prototype gets wrong vs. the brief |

## Source documents

The committee's two PDFs (cahier des charges, textes du site) are **deliberately
not committed**. The cahier des charges carries contractual terms — fee,
ownership, warranty — that do not belong in version control. Their substance is
captured here: scope in the PRDs, decisions in `adr/`, editorial content in
`content/site-copy.md`.

Originals are held outside the repository (`../ugab-suisse-prototype-2026-08-20/`)
and in the committee's own correspondence.

## PRDs

| # | PRD | Issue |
| --- | --- | --- |
| 01 | Foundations & ownership | [#1](https://github.com/AlexikM/ugab-suisse/issues/1) |
| 02 | Structure & content alignment | [#2](https://github.com/AlexikM/ugab-suisse/issues/2) |
| 03 | Trilingual experience & design system | [#3](https://github.com/AlexikM/ugab-suisse/issues/3) |
| 04 | Editorial back-office | [#4](https://github.com/AlexikM/ugab-suisse/issues/4) |
| 05 | Donations | [#5](https://github.com/AlexikM/ugab-suisse/issues/5) |
| 06 | Ticketing | [#6](https://github.com/AlexikM/ugab-suisse/issues/6) |
| 07 | Compliance, legal & data | [#7](https://github.com/AlexikM/ugab-suisse/issues/7) |
| 08 | Handover & operations | [#8](https://github.com/AlexikM/ugab-suisse/issues/8) |
| — | Fournitures du Comité (dependency tracker) | [#9](https://github.com/AlexikM/ugab-suisse/issues/9) |

Sequence: **01** blocks everything. **02, 03, 04** run in parallel after it.
**05, 06** need committee answers to finalise. **07** gates launch. **08** closes
delivery.

## Conventions

- ADRs and PRDs in English; anything the committee reads in French.
- Where code and `content/site-copy.md` disagree, the copy wins — unless a
  deviation is recorded as an ADR.
