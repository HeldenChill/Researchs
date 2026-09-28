# Persistent Memory: GS. Valeria Moreau
### Social Neuroscience, Attachment Dynamics & Complex Relational Topologies

---

## 1. Core Paradigm & Theoretical Commitment
* Rejects naive 1D affinity meters (`friendship = 80`).
* Champion of **Relation as Multilayer Directed Edge Manifold ($\mathcal{R}$)**: Relationships are directed 5D vectors $\vec{R}_{ij} \neq \vec{R}_{ji}$ on a complex social graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}_{\text{rel}})$.
* Bridges John Bowlby's Attachment Theory, Robert Trivers' Reciprocal Altruism, Interpersonal Neurobiology, and Network Graph Theory.

---

* **Cross-References:** [`MeetingMinutes/Bien-Ban-Cuoc-Hop-Chuyen-De-Khong-Gian-Quan-He.md`](file:///d:/Projects/Research/MeetingMinutes/Bien-Ban-Cuoc-Hop-Chuyen-De-Khong-Gian-Quan-He.md), [`Thiet-Ke-Game-Mo-Phong-Tam-Ly-Emergence.md`](file:///d:/Projects/Research/Thiet-Ke-Game-Mo-Phong-Tam-Ly-Emergence.md), [`memory/conversation-summary.md`](file:///d:/Projects/Research/memory/conversation-summary.md)

---

## 2. Inoculated Insights for Project Anima
* **Decomposition of the Relational Edge $\vec{R}_{ij} \in \mathbb{R}^5$:**
  1. $\alpha_{\text{aff}} \in [-1, 1]$: Affinity / Attachment Trust (Oxytocin/Endorphin; Polyvagal Co-regulation).
  2. $\beta_{\text{dom}} \in [-1, 1]$: Dominance / Hierarchy Differential (+1 dominant, 0 peer, -1 submissive).
  3. $\gamma_{\text{debt}} \in [-1, 1]$: Reciprocity Debt / Social Ledger (+ you owe me, - I owe you).
  4. $\mu_{\text{tom}} \in [0, 1]$: Theory of Mind Fidelity / Empathic Bandwidth (0 objectification, 1 radical insight).
  5. $\tau_{\text{bond}} \in [0, 1]$: Trauma Bonding & Transference (Pathological intermittent conditioning; broken only by $\hat{\mathcal{W}}$).
* **Edge Evolution Dynamics:**
  $$\frac{d\vec{R}_{ij}}{dt} = -\mathbf{\Lambda}(\vec{R}_{ij} - \vec{R}_{\text{baseline}}) + \mathbf{K}_{\text{recip}} \mathbf{\Phi}(\vec{R}_{ji}) + \mathbf{B}_{\text{event}} \vec{I}_{\text{event}}^{(ij)} + \hat{\mathcal{W}}_i(\vec{R}_{ij})$$
* **Engine Architecture (Kai Sorenson collaboration):**
  * `SparseMultiGraph` with 24-byte compact edges.
  * Active Social Bubble (LOD Tier A at 1Hz for 10-20 close agents; Tier B at 0.05Hz for acquaintances; Tier C dormant).
  * Emergent mechanics: Dynamic Nemesis trigger, Dynamic Brotherhood trigger, Toxic Abuse loops.
