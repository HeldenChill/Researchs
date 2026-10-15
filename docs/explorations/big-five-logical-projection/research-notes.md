# Research Notes: Big Five Dynamics in Logical Game Space

> **Sandbox:** `docs/explorations/big-five-logical-projection/`  
> **Status:** Active Working Draft.  
> **Upstream Anchor:** [basis-mapping.md](basis-mapping.md) $\longrightarrow$ Core Logical Space.

---

## 1. Initial Research Problem

How to transform an initial character archetype into a closed, deterministic yet emergent rule system using Big Five facets without resorting to hardcoded scripted behaviors?

### Reference Mechanics from Reference Games
* **Dwarf Fortress:** 30 facets influencing continuous need accumulation and thought triggers.
* **Disco Elysium:** 24 internal skills speaking as coupled voices with threshold checks.
* **RimWorld:** Discrete traits applying scalar stat offsets and mental break thresholds.

---

## 2. Hypothesis: Trait-Driven Potential Warping

Instead of static stat modifiers, each Big Five coordinate $(\alpha_O, \alpha_C, \alpha_E, \alpha_A, \alpha_N)$ shapes the **action-potential landscape** $U(x)$ for the agent:

$$\frac{dx_i}{dt} = -\nabla_{x_i} U(x; \vec{\alpha}_{\text{OCEAN}}) + \sigma_N \, \xi(t)$$

* Higher **Neuroticism ($N$)** increases diffusion noise $\sigma_N$ and creates shallower potential wells (easier phase shift into panic).
* Higher **Conscientiousness ($C$)** deepens the attractor basin for the current assigned goal (resisting goal disruption).
* Higher **Agreeableness ($A$)** shifts minimum energy towards cooperative graph states.

---

## 3. Open Design Hazards (Per Critical Debate Rule)

1. **Hazard 1 (Combinatorial Explosion):** 5 traits with continuous $[0, 1]$ values create an infinite state space. If gameplay mechanics check specific combinations (e.g. high $O$ + low $C$ + high $N$), rule authoring becomes exponential.
   * *Mitigation Idea:* Project into 2 meta-axes first: Plasticity ($O + E$) and Stability ($C + A - N$) as proposed in DeYoung's CB5T.
2. **Hazard 2 (Player Perception Opacity):** Players may not perceive subtle 5D dynamical shifts, mistaking nuanced emergent behavior for random bugs or AI stupidity.
   * *Mitigation Idea:* Clear feedback channels (UI state indicators, distinct animation telegraphs, or inner monologue dialogue cues).
