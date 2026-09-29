# Theoretical Foundations & Mathematical Formulations

> **Evidence note (updated 2026-09-29):** Equations and cross-domain mappings below include Project Anima design hypotheses. The independent council's [psychological-space review](2026-09-28-hoi-dong-tham-dinh-va-ban-giao-antigravity.md) and [willpower review](2026-09-29-tham-dinh-khong-gian-y-chi.md) distinguish mathematical deductions, outside evidence, and unverified simulation/clinical claims. Read the relevant review before treating these formulations as validated scientific results.
**Project:** Computational Modeling of Psychological Systems, Trauma Dynamics & Willpower  
**File Type:** Project-Internal Theoretical Memory  
**Language:** English  

---

## 1. The Core Dynamical Equation (Langevin-type SDE)

The state vector of the psyche at time $t$ is denoted as $\vec{S}(t) = \big(x_1(t), x_2(t), \dots, x_N(t)\big) \in \mathbb{R}^N$. Its temporal evolution is governed by:

$$\frac{d\vec{S}(t)}{dt} = -\nabla V(\vec{S}) + \mathbf{W}\vec{S}(t) + \mathbf{I}(t) + \eta(t) + \vec{F}_{\text{will}}(t)$$

### Parameters & Terms:
* **$-\nabla V(\vec{S})$ (Internal Potential Gradient):** The negative gradient of the free-energy landscape $V(\vec{S})$. It pulls the state vector toward local potential energy minima (Attractor Basins).
* **$\mathbf{W} \in \mathbb{R}^{N \times N}$ (Coupling Matrix):** Cross-subspace interaction weights connecting somatic arousal, affective valence, cognitive bandwidth, attachment, and temporal processing.
* **$\mathbf{I}(t)$ (Environmental Inputs / Triggers):** Exogenous sensory signals and social perturbations.
* **$\eta(t)$ (Stochastic Neural Noise):** Zero-mean Gaussian white noise satisfying $\langle \eta(t) \rangle = 0$ and $\langle \eta(t)\eta(t') \rangle = 2D\delta(t-t')$.
* **$\vec{F}_{\text{will}}(t)$ (Anti-Gradient Volitional Force):** Endogenous meta-cognitive force capable of overriding natural descent into negative attractor basins.

---

## 2. Potential Energy Function $V(\vec{S})$ & Confinement

$$V(\vec{S}) = \frac{k_{\text{conf}}}{4}\sum_{k=1}^N x_k^4 - \sum_{i=1}^M A_i \exp\left( -\frac{\|\vec{S} - \vec{\mu}_i\|^2}{2\sigma_i^2} \right)$$

* $k_{\text{conf}}$: Confinement constant preventing state trajectories from escaping to infinity.
* $M$: Number of active attractor basins.
* $\vec{\mu}_i$: Centroid coordinate of basin $i$.
* $A_i$: Depth / pull intensity of basin $i$ ($A_{\text{trauma}} \gg A_{\text{healthy}}$).
* $\sigma_i$: Width / basin radius of attraction.

---

## 3. Nonlinear Phenomena & Tipping Point Metrics

### 3.1. Hysteresis in Trauma Capture and Release
$$\Delta E_{\text{escape}} \gg \Delta E_{\text{fall}}$$
* **Entry:** Free-fall descent occurs when a minor trigger exceeding threshold $I_{\text{trigger}} > I_{\text{threshold}}$ pushes the state over the barrier.
* **Exit:** Due to steep, deep potential walls and depletion of self-regulatory bandwidth, escape requires external co-regulatory intervention or high activation energy ($I_{\text{recovery}} \gg I_{\text{trigger}}$).

### 3.2. Critical Slowing Down (Early Warning Signals)
Prior to a catastrophic phase shift (Tipping Point into trauma / panic):
1. **Recovery time diverges:** $\tau_{\text{recovery}} \to \infty$ as the local potential well flattens.
2. **Variance spikes:** $\operatorname{Var}(\vec{S}) \to \infty$.
3. **Autocorrelation (lag-1) approaches 1:** $\operatorname{ACF}(1) \to 1$.

### 3.3. Dimensionality Collapse (Participation Ratio - PR)
Given covariance matrix $C \in \mathbb{R}^{N \times N}$ computed over a sliding temporal window of width $W$:
$$\text{PR} = \frac{\left(\sum_{k=1}^N \lambda_k\right)^2}{\sum_{k=1}^N \lambda_k^2} \in [1.0, N]$$
* $\text{PR} \approx N$: High degrees of freedom, cognitive flexibility, complex emotional processing (Healthy Self-Organized Criticality).
* $\text{PR} \to 1.0$: Degeneration to a 1-dimensional binary survival axis (Fight/Flight or Freeze/Shutdown).

---

## 4. Coupled Therapeutic Co-Regulation

Interaction between Patient ($P$) and Therapist ($T$):

$$\begin{cases}
\frac{d\vec{S}_P(t)}{dt} = F_P\big(\vec{S}_P\big) + \mathbf{K}_{PT}\big(\vec{S}_T - \vec{S}_P\big) \\
\frac{d\vec{S}_T(t)}{dt} = F_T\big(\vec{S}_T\big) + \mathbf{K}_{TP}\big(\vec{S}_P - \vec{S}_T\big)
\end{cases}$$

* $\mathbf{K}_{PT}$: Interpersonal autonomic coupling matrix mediated by neuroception (vocal prosody, gaze, synchronized respiration - Polyvagal Theory).
* $\vec{S}_T$ acts as an Attractor Anchor, providing the entraining force that drags $\vec{S}_P$ across the hysteresis barrier.

---

## 5. The Two-Tier Emergent Engine (Plan B - Fiber Bundle Formulation)

The architecture upgraded from the flat 4-axis model to a **Two-Tier Fiber Bundle** ($\mathcal{E} \xrightarrow{\pi} \mathcal{B}$) to guarantee mathematical non-degeneracy, full Big Five (OCEAN) cybernetic mapping (CB5T), and dual-rate computational optimization:

$$\vec{S}(t) = \Big( \underbrace{A_{\text{phys}}, V_{\text{bio}}}_{\text{Tier 1: Base Space } \mathcal{B} \text{ (Fast 10 Hz)}} \;\Big|\; \underbrace{C, W, D, E_x}_{\text{Tier 2: Fiber Space } \mathcal{F} \text{ (Slow 1 Hz)}} \Big)$$

### 5.1. State Variable Definitions:
1. **$A_{\text{phys}} \in [0.0, 1.0]$ (Physiological Arousal):** Metabolic activation, sympathetic catecholamine release, heart rate.
2. **$V_{\text{bio}} \in [-1.0, +1.0]$ (Biological Neuroception / Valence):** Subcortical existential threat evaluation ($-1.0$ extinction alarm, $+1.0$ absolute physical sanctuary).
3. **$C \in [0.0, 1.0]$ (Cognitive Clarity & Executive Bandwidth):** Governed by an independent differential equation with ego depletion and metabolic recovery:
   $$\frac{dC}{dt} = \frac{C_{\text{target}}(A_{\text{phys}}, V_{\text{bio}}) - C(t)}{\tau_{\text{recovery}}} - \text{Drain}_{\text{task}}(t)$$
4. **$W \in [-1.0, +1.0]$ (Social Warmth / Affiliation):** Horizontal axis of the Interpersonal Circumplex (Altruistic empathy vs Machiavellian hostility).
5. **$D \in [-1.0, +1.0]$ (Dominance / Agency):** Vertical axis of the Interpersonal Circumplex (Assertive leadership vs Submissive obedience).
6. **$E_x \in [0.0, 1.0]$ (Epistemic Drive / Exploration):** Panksepp SEEKING system, curiosity and dopaminergic reward-seeking.

### 5.2. Cybernetic Big Five Mapping (CB5T):
* **Neuroticism ($N$):** Sensitivity and gradient of Tier 1 ($A_{\text{phys}}, V_{\text{bio}}$).
* **Extraversion ($E$):** Composite of $D > 0$, $E_x > 0$, and $W > 0$.
* **Openness ($O$):** Epistemic exploration axis $E_x$.
* **Agreeableness ($A$):** Warmth axis $W$ under condition $V_{\text{bio}} > 0$.
* **Conscientiousness ($C$):** Executive bandwidth maintenance $C$ + Volitional override weight $\vec{F}_{\text{will}}$.

### 5.3. Event-to-Force Two-Gear Abstraction (6D):
$$\vec{I}_{\text{perceived}} = \mathbf{M}_{\text{filter}}(\vec{S}, \text{Trauma\_Scars}, \text{Nemesis\_Weights}) \times \vec{I}_{\text{raw}}$$
* $\vec{I}_{\text{raw}} = (\Delta A_{\text{phys}}, \Delta V_{\text{bio}} \mid \Delta C, \Delta W, \Delta D, \Delta E_x)$ with `target_id`.
* $\mathbf{M}_{\text{filter}}$ modulates amplitudes: attenuation ($\approx 0.1\times$) for resilient personalities, amplification ($\ge 5.0\times$) for active trauma basins.

---

## 6. Dynamical Nemesis System Formulations

### 6.1. Saddle-Node Bifurcation of Relational Potential
A catastrophic humiliation/defeat event exceeding injury threshold ($\text{Loss} > \theta$) triggers a structural bifurcation in the relational potential landscape $U_{ij}(\vec{S}_{\text{rel}})$:
$$\frac{dU_{ij}}{dt} = \mu_{\text{trauma}} - S_{\text{rel}}^2$$
* For $\mu_{\text{trauma}} > 0$, a new stable fixed point (Obsession / Nemesis Attractor) and an unstable saddle point emerge, permanently trapping character $i$'s relational dynamics toward target $j$.

### 6.2. Coupled Forced Oscillations (Hostile Resonance)
Proximity $d(i, \text{Nemesis})$ injects a periodic driving force into $A_{\text{phys}, i}$:
$$\frac{d^2 A_{\text{phys}, i}}{dt^2} + \gamma \frac{dA_{\text{phys}, i}}{dt} + \omega_0^2 A_{\text{phys}, i} = F_0 \cdot \exp\big(-k \cdot d(i, \text{Nemesis})\big) \cdot \cos(\Omega t)$$
* This resonant excitation locks the target in high arousal, collapsing Tier 2 executive bandwidth and precluding ventral vagal social co-regulation.

---

## 7. The Master 6-Space Unified Architecture

Ratified by the Project Director on September 28, 2026, *Project Anima* elevates the two-tier agent engine into a **Master 6-Space Unified Architecture**. This structure strictly delineates between objective physical reality, biological hardware, psychological phase dynamics, existential worldview priors, distributed social topology, and transcendent meta-volition:

```
[ LEVEL 0: META-VOLITION ]
       𝒲 (Second-Order Lie Deformation Operator)
         |
         +-------------------+-------------------+-------------------+
         | (Warps Potential) | (Gates Pain)      | (Crushes Hatred)  | (Breaks Dogma)
         v                   v                   v                   v
[ LEVEL 1: DYNAMICAL SPACES (Mutually Linearly Independent) ]
  Ɛ (Event Space)   ==>  ℋ (Somatic)  ==>  ℳ (Psychological) <== ℘ (Belief)
  (Exogenous World)      (Bio-Hardware)    (Two-Tier Phase)      (Priors / Values)
                                                  ^
                                                  | (Coupling Edges)
                                           ℛ (Relational Graph)
```

### 7.1. Space Taxonomies & Ontological Roles:
1. **$\mathcal{W}$ (Meta-Volitional Dimension — Rank 0 Operator):**
   * An endogenous second-order deformation operator $\hat{\mathcal{W}}$ capable of restructuring the geometry of adjacent manifolds.
2. **$\mathcal{E}$ (Global Exogenous Event Space):**
   * The universe of environmental, contextual, and physical triggers outside the organism's Markov Blanket. Decomposed into Visceral shocks and Semantic payloads.
3. **$\mathcal{H}$ (Internal Somatic Homeostasis Space):**
   * The objective biochemical/thermodynamic configuration space inside the Markov Blanket:
     $$\vec{H}(t) = \big( \text{Energy}_{\text{glucose}}, \text{Hydration}, \text{CoreTemp}, \text{TissueIntegrity}_{\text{HP}}, \text{Toxin}, \text{Fatigue} \big) \in \mathbb{R}^6$$
4. **$\mathcal{M}$ (Psychological Two-Tier Phase Space):**
   * The subjective regulatory phase manifold structured as a Fiber Bundle $\mathcal{E} \xrightarrow{\pi} \mathcal{B}$:
     $$\vec{S}(t) = \big( A_{\text{phys}}, V_{\text{bio}} \;\big|\; C, W, D, E_x \big) \in \mathbb{R}^2 \times \mathbb{R}^4$$
5. **$\mathcal{P}$ (Moral & Belief Parameter Manifold):**
   * The generative predictive prior space (Haidt's Moral Foundations & Existential Meaning):
     $$\vec{\theta}_{\text{belief}} = \big( \theta_{\text{care}}, \theta_{\text{hierarchy}}, \theta_{\text{loyalty}}, \theta_{\text{sanctity}}, \theta_{\text{existential}} \dots \big) \in [-1, 1]^K$$
   * Operates as parameter coefficients directly shaping potential landscape wells: $V(\vec{S}; \boldsymbol{\theta})$.
6. **$\mathcal{R}$ (Distributed Interpersonal Relational Topology):**
   * An asynchronous directed graph of pairwise interaction vectors between agents $i$ and $j$:
     $$\mathbf{R}_{ij} = \big( \text{Affinity}_{ij}, \text{Trust}_{ij}, \text{PowerDynamic}_{ij}, \text{Debt}_{ij}, \text{NemesisAttractor}_{ij} \big) \in \mathbb{R}^5$$

---

## 8. Meta-Volitional Space ($\mathcal{W}$) & Lie Deformation Operator ($\hat{\mathcal{W}}$)

> **Status after the 2026-09-29 review:** This section preserves the project's 2026-09-28 design proposal; its biological mappings and clinical effects are not established. The original meeting defines four state blocks and omits $\theta$ from the displayed tuple; this memory writes five blocks by adding $\theta$. Neither notation proves five linearly independent dimensions: $\Phi\in\mathbb S^{K-1}$ has $K-1$ intrinsic degrees of freedom, and $\theta$ may be a parameter rather than a state variable. See the [Willpower Supplement](../MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Chuyen-De-Khong-Gian-Y-Chi.supplement.md).

The 2026-09-28 meeting led by the Prof. Gabriel Brandt agent proposed five **conceptual components** and a potential-deformation rule. Their dimensional independence and biological mappings remain unverified:

$$\mathbf{W}(t) = \Big( \mathcal{W}_{\text{amp}}(t), \vec{\Phi}_{\text{intent}}(t), \kappa_{\text{coh}}(t), \tau_{\text{tenacity}}(t), \theta_{\text{transcend}} \Big) \in [0, 1] \times \mathbb{S}^{K-1} \times [0, 1] \times \mathbb{R}^+ \times [0, 1]$$

### 8.1. Five proposed components of $\mathcal{W}$:
1. **$\mathcal{W}_{\text{amp}} \in [0, 1]$ (Tenacity Amplitude):** Proposed control strength; a direct mapping to aMCC firing rate has not been established.
2. **$\vec{\Phi}_{\text{intent}} \in \mathbb{S}^{K-1}$ (Intentional Direction Vector, $\|\vec{\Phi}\| = 1$):** Proposed goal direction; its mapping to FPN/DLPFC activity needs a measurement model.
3. **$\kappa_{\text{coh}} \in [0, 1]$ (Phase Coherence / Dissonance Veto):** Proposed alignment parameter; a one-to-one mapping to 40–80 Hz synchrony across DLPFC, striatum and aMCC has not been shown.
4. **$\tau_{\text{tenacity}} \in \mathbb{R}^+$ (Duration Parameter):** Proposed persistence scale; glycogen and noradrenergic sensitivity have not been shown to set this exact value. A half-life is different from a maximum duration unless a specific law equates them.
5. **$\theta_{\text{transcend}} \in [0, 1]$ (Threshold Parameter):** Proposed gameplay threshold between ordinary effort and surge; a physical phase transition has not been demonstrated.

### 8.2. Proposed manifold potential warping equation:
$$V_{\text{warped}}(\vec{S}) = V(\vec{S}) - \Big[ \mathcal{W}_{\text{amp}} \cdot \kappa_{\text{coh}} \Big] \cdot \Big\langle \nabla V(\vec{S}), \vec{\Phi}_{\text{intent}} \Big\rangle_{\mathbf{G}}$$
* The meeting proposed that strong intent could cancel the fear barrier, $\lim_{\mathcal{W} \to 1} \Delta E_{\text{fear}} = 0$. This result does **not** follow generally from the displayed formula; the Supplement gives a quadratic counterexample in which the basin shifts without flattening.

### 8.3. Proposed cross-space effects and post-warp crash:
* **Somatic Gating & Boost:** $\text{Nociception}_{\text{perceived}} = \text{Nociception}_{\text{tissue}} \cdot (1 - \mathcal{W}_{\text{amp}}\kappa_{\text{coh}})$; $\text{Power}_{\text{muscle}} = \text{BasePower} \cdot (1 + \alpha_{\text{boost}}\mathcal{W}_{\text{amp}})$.
* **Metabolic Debt Accumulation:** $\frac{dD_{\text{met}}}{dt} = \beta_{\text{burn}} \cdot (\mathcal{W}_{\text{amp}})^2$.
* **Proposed crash rule:** Once $\tau_{\text{tenacity}}$ expires or intent is achieved, a game design could set $\mathcal{W} \to 0$ and apply exhaustion. The stated consequences $\vec{H}_{\text{energy}} \to 0, C \to 0, A_{\text{phys}} \to 0$ and coma do not follow from the current equations or reviewed clinical evidence.

**Review boundary:** The displayed warping term can shift, rather than flatten, a quadratic potential well; loss of a trauma attractor requires case-specific gradient/Hessian checks. The pain rule leaves 6.9% of its input for the meeting's $w=0.95,\kappa=0.98$ example and does not erase tissue damage. $\dot D_{\text{met}}=\beta w^2$ grows linearly in time for fixed $w$, not exponentially. The threshold rule has an undefined branch when $w\ge\theta$ but $\kappa\le0.8$ and does not itself demonstrate a physical bifurcation or energy conservation. The asserted inevitable coma/heart failure and clinical precision are unverified. See [W-01–W-12](../MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Chuyen-De-Khong-Gian-Y-Chi.supplement.md) for evidence and proposed wording.

---

## 9. Interoception & Dual-Stream Event Propagation

### 9.1. Interoceptive Inference Mapping ($\mathcal{H} \to \mathcal{M}$):
Physical damage in $\mathcal{H}$ translates to subjective neuroception in $\mathcal{M}$ via sensory projection:
$$V_{\text{bio}}(t) = \tanh\left( \mathbf{W}_{\text{intero}} \cdot \vec{H}(t) + b_{\text{neuroception}} \right)$$
* Explains clinical divergence: under anesthesia ($\mathbf{W}_{\text{intero}} \to 0$), severe tissue trauma ($\text{HP} \to 0$) does not trigger psychological panic ($V_{\text{bio}} \approx 0$).

### 9.2. Event Pipeline Equations:
An exogenous event $\mathbf{E} \in \mathcal{E}$ splits into dual propagation streams:
$$\mathbf{E} \Longrightarrow \begin{cases}
\vec{I}_{\text{visceral}} \xrightarrow{\Delta t \le 100\text{ms}} \Delta \vec{H} + \Delta (A_{\text{phys}}, V_{\text{bio}}) & \text{(Bypasses Cortical Appraisal)} \\
\vec{I}_{\text{semantic}} \xrightarrow{\text{Appraisal Filter}} \Delta (C, W, D, E_x) & \text{(Conditioned on } \vec{\theta}, \mathbf{R}_{ij}\text{)}
\end{cases}$$

---

## 10. Value & Belief Parameter Space ($\mathcal{P}$) & Thought Cabinet

Ratified in Session 4 (Prof. Thaddeus Mercer), Beliefs operate as the **Landscape Parameter Manifold** $\mathcal{P}$ governing potential geometry $V(\vec{S}; \boldsymbol{\theta})$:

$$\vec{\theta} = \Big( \vec{\theta}_{\text{moral}}, \delta_{\text{dogma}}, \sigma_{\text{sacred}}, \lambda_{\text{locus}}, \alpha_{\text{tribal}} \Big) \in [-1, 1]^6 \times [0, 1] \times [0, 1] \times [-1, 1] \times [0, 1]$$

### 10.1. The 5 Orthogonal Dimensions of $\mathcal{P}$:
1. **$\vec{\theta}_{\text{moral}} \in [-1, 1]^6$ (Haidt's Moral Foundations):** Care/Harm, Fairness/Cheating, Loyalty/Betrayal, Authority/Subversion, Sanctity/Degradation, Liberty/Oppression. Shapes behavioral attractor basins: $V_{\text{moral}} = -\sum_{k=1}^6 \theta_k \Psi_k(\vec{S})$.
2. **$\delta_{\text{dogma}} \in [0, 1]$ (Epistemic Calcification / Bayesian Dogmatism):** Defines the precision of prior beliefs: $\Pi_{\text{prior}} = \frac{1}{1.001 - \delta_{\text{dogma}}}$. When $\delta \to 1.0$, sensory prediction errors are zeroed out (Confirmation Bias / Fanaticism).
3. **$\sigma_{\text{sacred}} \in [0, 1]$ (Sacred Value Barrier):** Deontological cut-off switch disabling utilitarian cost-benefit circuitry (DLPFC). Creates an infinite repulsive potential wall:
   $$V_{\text{taboo}}(\vec{S}) = \sigma_{\text{sacred}} \cdot \frac{K_{\text{barrier}}}{\big(\text{DistanceToTaboo}(\vec{S})\big)^2} \xrightarrow{\text{taboo} \to 0} \infty$$
4. **$\lambda_{\text{locus}} \in [-1, 1]$ (Existential Locus of Control):** $+1.0$ Internal Agency (Master of Fate) vs. $-1.0$ External Fatalism (Helpless Pawn of Destiny).
5. **$\alpha_{\text{tribal}} \in [0, 1]$ (Tribal Memetic Coupling):** Entrainment rate of individual belief parameters to collective group narratives.

### 10.2. Belief Evolution & Crisis Bifurcation (Shattering):
Beliefs evolve under slow timescale $\tau_{\text{belief}}$ driven by cumulative Prediction Errors ($\overline{\text{PE}}$):
$$\frac{d\vec{\theta}}{dt} = \frac{1}{\tau_{\text{belief}}} (1.0 - \delta_{\text{dogma}}) \cdot \mathbf{J}_{\text{evidence}} \cdot \overline{\text{PE}}(t) + \hat{\mathcal{W}}(\vec{\theta})$$
* **Catastrophic Rupture:** When evidence overwhelms dogmatic shielding ($\overline{\text{PE}} > \theta_{\text{rupture}}$), a Saddle-Node Bifurcation annihilates the prior potential wells, inducing an **Existential Crisis** (Acute CSD: $C \to 0, A_{\text{phys}} \to 1.0, V_{\text{bio}} \to -1.0$) leading to psychotic breakdown or metamorphic re-birth.

### 10.3. Thought Cabinet Lifecycle Engine:
$$\text{Ideational Seed} \xrightarrow{\text{Incubation: } \text{Cognitive Dissonance penalty} (\Delta C < 0)} \text{Crystallized Thought} \big(\Delta \vec{\theta}_{\text{permanent}}\big)$$


