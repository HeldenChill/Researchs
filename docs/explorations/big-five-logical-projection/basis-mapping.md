# Basis Mapping Adapter: Big Five $\longleftrightarrow$ Logical Game Space

> **Role:** Single point of synchronization between Core Logical Space and Big Five Domain Exploration.
> **Parent Baseline:** Logical Space Baseline (`2026-10-04-logical-space-v0.1`).
> **Rule:** If upstream Logical Space definitions or coordinates change, update this table only. Do not rewrite research notes.

---

## 1. Coordinate Mapping Matrix

| Big Five Dimension / Subspace | Psychological Meaning | Candidate Logical Space Coordinate | Game Design Primitive / Affordance |
|---|---|---|---|
| **O - Openness** | Exploration vs. Exploitation, novelty seeking | $\mathbf{e}_{\text{explore}}$ (State-space search radius) | Information horizon, tech/craft discovery unlock rate, tolerance to unknown events |
| **C - Conscientiousness** | Goal-directed persistence, impulse inhibition | $\mathbf{e}_{\text{order}}$ (Entropy suppression / Duty cycle) | Task execution fidelity, fatigue threshold, schedule compliance, repair prioritization |
| **E - Extraversion** | Reward sensitivity, social signaling | $\mathbf{e}_{\text{energy}}$ (Action potential & Signal gain) | Initiative in interaction graphs, broadcast radius, positive feedback amplification |
| **A - Agreeableness** | Altruism, non-zero-sum coordination | $\mathbf{e}_{\text{synergy}}$ (Coupling weight in multi-agent graph) | Cooperation payoff multiplier, conflict damping, shared pool resource contribution |
| **N - Neuroticism** | Threat vigilance, negative affect volatility | $\mathbf{e}_{\text{stability}}^{-1}$ (Sensitivity to perturbation / Noise gain $\sigma$) | Panic threshold, defensive reflex sensitivity, state basin depth under stress |

---

## 2. Orthogonality & Decomposition Checks

> **Flag (2026-10-24):** the independence claim and the projection formula below are non-conformant with core v0.2. See [README conformance note](README.md).

* **Empirical Independence (unverified):** In psychometrics, OCEAN traits have low cross-correlation ($|r| \le 0.2$ in standard populations), making them viable candidates for orthogonal decomposition in an agent state space.
* **Fourier-Style Projection Analogy:**
  $$\Psi_{\text{agent}} = \sum_{k \in \{O, C, E, A, N\}} \alpha_k \cdot \phi_k(\text{game\_state})$$
  *Note:* Analogy pending formal mathematical definition of the basis operator $\phi_k$.

---

## 3. Drift & Re-alignment Log

* **2026-10-16:** Initial mapping created against Logical Space v0.1. Mapped 5 traits to candidate primitive coordinates $(\mathbf{e}_{\text{explore}}, \mathbf{e}_{\text{order}}, \mathbf{e}_{\text{energy}}, \mathbf{e}_{\text{synergy}}, \mathbf{e}_{\text{stability}})$.
* **2026-10-24:** Audited against core v0.2. Non-conformant with P0, L1, L3, L4, L6; independence claim unverified. Mapping left unchanged; pin stays v0.1 until game-first rework. Details in [README](README.md).
