# Theoretical Foundations & Mathematical Formulations
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

## 8. Meta-Volitional Lie Deformation Operator ($\hat{\mathcal{W}}$)

Willpower is formalized not as an algebraic state variable, but as an active **Manifold Deformation Operator**:

### 8.1. Mathematical Formulation:
$$V_{\text{warped}}(\vec{S}) = V(\vec{S}) - \mathcal{W} \cdot \vec{\Phi}_{\text{intent}}(\vec{S})$$

* $\mathcal{W} \in [0, 1]$: Amplitude of volitional activation.
* $\vec{\Phi}_{\text{intent}}$: Intentional vector field anchored in core beliefs ($\vec{\theta} \in \mathcal{P}$).
* **Annihilation of Fear Barriers:**
  $$\lim_{\mathcal{W} \to 1} \Delta E_{\text{escape}}(\text{Trauma Basin}) = 0$$
  As $\mathcal{W}$ reaches critical threshold $\theta_{\text{transcendent}}$, the potential well barrier around panic/trauma collapses to zero, freeing the state trajectory from instinctive 4F entrapment.

### 8.2. Cross-Space Warping:
* **Somatic Gating ($\hat{\mathcal{W}} \circ \mathcal{H}$):** aMCC-driven GABAergic inhibition of nociceptive signals and forced mobilization of peripheral glycogen.
* **Relational Override ($\hat{\mathcal{W}} \circ \mathcal{R}$):** Transient suspension of the Nemesis Attractor ($\text{NemesisAttractor}_{ij} \to 0$) enabling self-transcendent alliances.
* **Belief Restructuring ($\hat{\mathcal{W}} \circ \mathcal{P}$):** Metacognitive re-parameterization of priors (Nietzschean self-overcoming).

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


