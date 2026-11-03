# Session memory — Logical Space critique, v0.3, Forest_Bloom direction

**Session date:** 2026-11-03. **Workspace:** `D:\Projects\Research`. Continues [Forest_Bloom review and basis ladder](2026-10-24-forest-bloom-review-and-basis-ladder-session.md). Substantive summary, not a transcript.

## Read first in the next session

| File | What |
|---|---|
| [critique and study record](../.cursor/plans/design/2026-11-03-logical-space-critique-and-study.md) | **Vietnamese** living record: holes H1–H6, ideas ID-1 to ID-7, Forest_Bloom sections 2.1–2.4, roadmap and progress, hypotheses HY-1 to HY-4, contribution C1–C5, comparison table 5.1, prior art links, open questions |
| [core theory v0.3-draft](../docs/theory/Logical-Space-Base-Theory.md) | L1–L17, AG-1 to AG-11, gates P0–P7, prior art section 11 |
| [playbook v3.1](../.cursor/playbooks/playbook-decompose-game-to-logical-space.md) | Vietnamese; 13 steps, 2B sandbox-and-levels, 9 traps, lessons |
| [Designer Guide](../docs/theory/Logical-Space-Designer-Guide.md) | English internal guide: quickstart, glossary, templates, costly mistakes |
| [QD level generation](../docs/research/quality-diversity-level-generation/README.md) | 6 arXiv PDFs + English synthesis |

## How the session went

1. Owner asked for a deep critical review and to turn the theory into a "real study". Brainstorming skill used. Owner: theory is mostly on paper; only Forest_Bloom applied it — "interesting in simulation, not fun yet".
2. Assistant read core + design record, researched prior art (Sellers PLW, Machinations, Juul, MDA, BotW chemistry, Cook, Koster, Ludocore, Browne Ludi, Bedau). Found H1–H6.
3. Owner: patch the holes, open a discussion file. **Language rule:** discussion and the record in Vietnamese; English documents stay English.
4. Core patched v0.3; theory questions resolved one by one (table below). Playbook synced v3.0, later v3.1.
5. Owner did not understand Sellers/MDA vs Fourier; assistant explained: they share only the general thesis (few parts + rules → rich results); what Fourier really gives is **measuring backwards** and **testing the basis** (independence, minimality). Comparison table saved.
6. Forest_Bloom direction worked out (below). QD papers saved on request.
7. Commits on branch `theory/v0.3-critique-and-study`: `0aad690` (v0.3, playbook, record, QD, memory), `c697420` (Designer Guide). Not merged, not pushed.

## Holes found (H1–H6) and resolution

| Hole | Resolution |
|---|---|
| H1 interaction ≠ emergence | **AG-7**, new L6: emergence = outcome of rules iterated over many steps that nobody enumerated (Bedau weak emergence); single interaction term is necessary, not sufficient. M1 caution |
| H2 basis undefined | Model adds vocabulary $\mathcal{V}$; L2 = P3 witness + ablation minimality; Fourier analogy limit stated; **AG-10** basis selection rule (player-visible, fewer operators, code reuse; record reason) |
| H3 no player | Model adds $Y$ and mental-model loop; meta-action term (old T2); L13; gate P7; **AG-11** playtest kit |
| H4 unfalsifiable | L14 pre-register; positioned as **method**, not theory of all games |
| H5 no progression | Progression structure term; L15 |
| H6 measures unvalidated | Validation via Browne Ludi method — **still open, needs data from reference case** |

## Owner decisions this session

| ID | Decision |
|---|---|
| Q1 | English docs stay English; discussion Vietnamese |
| AG-7 | New L6 (narrows AG-1) |
| Q3 | Contribution: method for systemic games from idea to code; testable ontology, ladder with stopping rule, gates to player experience. New vs prior art: C1 ontology with tests, C2 ladder, C3 design→code, C4 regime map as playground, C5 catalog with tests |
| Q5 | Target = **high-quality internal guide** for owner and designers, not a paper |
| Roadmap | 6 steps; **step 1 done** (except H6); steps 2–3 **deferred until Forest_Bloom migration finishes** |
| AG-8 | Viability condition ≠ target interestingness → core L16 |
| AG-9 | Compress through Y: 1–2 directional signals + visual, thresholds hidden → core L17 |
| AG-10 | Basis selection rule in L3 |
| AG-11 | P7 kit: (1) free-choice continuation minutes, (2) retell cause = legibility, (3) IMI only for A/B |

## Forest_Bloom direction

| Item | Content |
|---|---|
| Origin | Started as hyper casual puzzle, Candy Crush-like chain reaction, repeated over levels or endless. Goal has moved beyond hyper casual; still learn from it |
| Balance | "Not the goal; the condition for tree species to mean anything" → viability (AG-8). Dominance boring when one species ≈ all trees **and** > 12 trees |
| FB-1 | Mode C gene sandbox **encompasses** mode A Terra Nil-style restoration levels; develop in parallel. Guards: one shared $\mathcal{V}$; each level is a detector for C; add rules only when a level needs them |
| P0 (approved) | Target I6: plant the right seed in the right spot → restoration/succession wave spreads. Skill gap via M6 best vs random. Owner's favourite Terra Nil moment: "restoration chain spreading when placing a building in the right spot" |
| Y signals | Effective species count (Hill number $e^H$) as **map color richness** (monoculture fades to grey) + **trend arrow**; takeover warning by spreading color and pulsing border. Hidden: dominance ~90% & > 12 trees, k species, W ticks, q% seeds (k, W, q open) |
| vs Terra Nil | Terra Nil's spread is mostly hand-written radius rules; Forest_Bloom can spread via iterated local succession rules |
| ID-7 | Levels found by quality-diversity search (constrained MAP-Elites); owner chose **hybrid** (machine searches, designer curates, edits fed back; model: Alvarez 2019 Interactive Constrained MAP-Elites). Hard constraint = viability; fitness = skill gap; pick 2 diversity dimensions (open). Warning from Mario GAN paper: agent quality caps search quality |
| Reference case | Assistant recommended smallest Forest_Bloom slice (3 species, one level, new minimal headless prototype, old engine as parts bin); later a second, different case (Bump_Hero). Deferred until migration done |

## Open items

- H6: validate M1–M6 (needs reference case data).
- Forest_Bloom values k, W, q; QD diversity dimensions; best-placement agent.
- Hypotheses HY-1 to HY-4 to pre-register when the reference case starts.
- Branch `theory/v0.3-critique-and-study` not merged/pushed.
- Earlier deferrals still stand: Bump_Hero M6 spike after its package adoption.

## Working-style notes

- Owner often asks "em nghĩ sao?" — wants a concrete recommendation with reasons, then decides.
- Owner approves in short replies ("duyệt", "đồng ý"); record each as AG-n with date in core, playbook, record and this memory.
- Owner prefers simple player-facing signals over raw numbers; keep detailed criteria hidden.
