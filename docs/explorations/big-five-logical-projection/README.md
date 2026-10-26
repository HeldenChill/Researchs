# Research Sandbox: Big Five Character Dynamics Projection

> ### RESEARCH BRANCH CONTRACT & BOUNDARY SPECIFICATION
> * **Parent Ground Truth:** Core Theory of Logical Space for Game Design (Foundational Baseline: [AGENTS.md](../../../AGENTS.md#current-project-purpose-2026-10-04) / [Approved Scope](../../superpowers/specs/2026-10-04-project-corrections-design.md)).
> * **Baseline Version Pin:** `2026-10-04-logical-space-v0.1`
> * **Dependency Flow:** Strictly Downstream (`Core Logical Space` $\longrightarrow$ `Big Five Exploration`).
> * **Non-Interference Guarantee:** Hypotheses, mathematical models, or empirical psychological facets explored here do NOT mutate, constrain, or pollute the upstream Logical Space definitions or base engine specifications.
> * **Re-alignment Policy:** When Core Logical Space develops or refines its basis coordinates, updates are absorbed strictly via [basis-mapping.md](basis-mapping.md). Core files remain untouched.
> * **Status:** Exploratory Subspace / Domain Case Study.
> * **Conformance (2026-10-24): pre-v0.2, known non-conformant** with [core v0.2](../../theory/Logical-Space-Base-Theory.md). Pin stays at v0.1 until rework.
>   * **P0 / L4:** starts from a psychological model instead of a game spec; basis resolution not derived.
>   * **L3:** five traits fixed in advance as five coordinates (sacred number).
>   * **L1:** traits mapped as coordinates while acting as operator parameters (noise gain, coupling weight).
>   * **L6:** linear projection $\sum_k \alpha_k \phi_k$ cannot produce emergence.
>   * **Unverified claim:** OCEAN $|r| \le 0.2$; meta-analyses report larger correlations, and CB5T meta-axes exist because traits correlate. Population correlation is also not functional independence under operators (gate P2).
>   * **Planned rework:** game-first. Pick a concrete game needing character behavior, run P0 to P2, decide whether personality is needed and at what resolution; traits likely become per-agent config parameters modulating operators.

---

## 1. Objective of this Sandbox

This exploration investigates how the empirical psychological construct of **Big Five (OCEAN)** personality traits and their 30 facets can be decomposed and mapped into the **Logical Space for Game Design**.

* **Key Question:** Can Big Five traits serve as stable, orthogonal basis vectors or state coordinates to systematically generate coherent emergent game rules, character affordances, and progression curves?
* **Case Reference:** [Nghien-Cuu-Chuyen-Sau-Mo-Hinh-Tinh-Cach-Big-Five.md](../../../Nghien-Cuu-Chuyen-Sau-Mo-Hinh-Tinh-Cach-Big-Five.md) (Lexical hypothesis, Cybernetic Big Five Theory - CB5T).

---

## 2. Sandbox Structure

```text
docs/explorations/big-five-logical-projection/
├── README.md               # This contract, scope, and isolation boundaries
├── basis-mapping.md        # The adapter: mapping Big Five traits to Logical Space coordinates
└── research-notes.md       # Working notes, equations, and gameplay mechanics derivations
```

---

## 3. Ground Rules Inside this Sandbox

1. **Zero Upstream Contamination:** Never alter root theory files (`AGENTS.md`, `CLAUDE.md`, core math foundations) based on unverified branch deductions.
2. **Citation Over Duplication:** Always cite upstream definitions by link instead of copy-pasting text, preventing stale drift when base theory updates.
3. **Rigorous Design Hazard Audits:** Maintain [critical debate rule](../../../.agents/rules/critical-debate-and-rigor.md) — check every gameplay derivation for technical feasibility and ludic coherence.
