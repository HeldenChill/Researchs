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

## 5. The 4-Axis Emergent Game Mechanics Engine

$$\vec{S}_{\text{game}} = \big(A, V, C, S\big)$$

1. **Arousal ($A \in [-1, 1]$):** Dorsal shutdown ($-1$) to Window of Tolerance ($0$) to Sympathetic overdrive ($+1$).
2. **Safety / Valence ($V \in [0, 1]$):** Neuroception of existential security.
3. **Cognitive Bandwidth ($C \in [0, 1]$):** 
   $$C(t) = C_{\text{base}} \times \max\left(0, 1 - \left(\frac{A}{A_{\text{thresh}}}\right)^2\right) \times V(t)$$
4. **Attachment ($S \in [-1, 1]$):** Hostile isolation ($-1$) to secure social trust ($+1$).

### Event-to-Force Two-Gear Abstraction:
$$\vec{I}_{\text{perceived}} = \mathbf{M}_{\text{filter}}(\vec{S}, \text{Trauma\_Scars}) \times \vec{I}_{\text{raw}}$$
* $\vec{I}_{\text{raw}} = (\Delta A, \Delta V, \Delta C, \Delta S)$.
* $\mathbf{M}_{\text{filter}}$ modulates amplitude: attenuation ($\approx 0.1\times$) for healthy baselines, amplification ($\ge 5.0\times$) for active trauma scars (e.g., Toxic Shame).
