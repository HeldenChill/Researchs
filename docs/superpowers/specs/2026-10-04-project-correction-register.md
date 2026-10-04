# Current project correction register

**Date:** 2026-10-04. **Scope:** Owner-approved corrections to current workspace documents and embedded reference examples. This is not a claim that external Unity source was changed, that all scientific literature was audited, or that the entire theory is validated.

## Project purpose

The core goal is a theory of logical space for constructing coherent gameplay and progression from an initial game idea. Psychological dynamics and Forest_Bloom are case studies. Fourier-inspired decomposition is an analogy until basis functions, a domain, decomposition and reconstruction rules have been defined. New theory development resumes separately after this correction pass.

## Reviewed findings and disposition

| ID | Original issue | Workspace correction | Evidence / remaining limit |
| --- | --- | --- | --- |
| C-01 | Each WebSocket advanced shared engine | One lifespan-owned clock; subscribers consume size-one snapshot queues; cleanup in finally | Extracted async functions tested with 0/1/2 viewers; live FastAPI/NumPy integration pending |
| C-02 | Constant history reported PR=3/EXPANDED | Nonnegative eigenvalues without artificial floor; unavailable PR and explicit insufficient/stationary states | Static contract checked; full NumPy PR runtime pending |
| C-03 | In-place root coupling changed with iteration order | Frozen sensed values, accumulated deltas, simultaneous commit | Compiled C# pair order and sum regressions pass |
| C-04 | Wilt remained active indefinitely | Wilt capacities zero; five consecutive wilt steps remove plant through scene adapter; recovery under safe wet conditions | Compiled activity, death and recovery checks pass; external pooling behavior pending |
| C-05 | Phase 4 lacked diffusion; spores had no consumer | Conservative edge-based moisture/toxin diffusion; deterministic growth/conflict resolution into empty cells; adapter lifecycle | Compiled diffusion/conservation and birth checks pass; ecological balance not established |
| C-06 | Fifty-step result called Lyapunov proof; plan weakened spec | Renamed ecological smoke test; matching seed/log/occupancy/lifecycle acceptance; setup window specified | Criteria corrected; no external acceptance run supplied |
| C-07 | YELLOW reopened panic gate | Final gate after all species modifiers | Compiled YELLOW panic regression passes |
| C-08 | Dashboard stale during autoplay and missing metrics | Step-completed subscription; flora/blight/empty/moisture/safety; reset and listener cleanup | Dashboard example compiles against minimal stubs; actual Unity UI wiring pending; frontline chart explicitly pending |
| C-09 | Saddle-node equation differentiated potential instead of state | Correct local scalar normal form and derived potential; stable/unstable equilibria distinguished | Algebra: -U'(S)=mu-S² and f'(S)=-2S; no claim of global or permanent trapping |
| C-10 | Five belief blocks described as five dimensions | Five blocks, ten scalar coordinates; independence needs metric/evidence | Domain count: six moral scalars + four additional scalars |
| C-11 | Registry said no audits; corrected claims persisted without guidance | Registry updated; correction links in root research docs, original minutes, expert memories; operational memory corrected | Original meeting/dialogue body retained; current guidance takes precedence |

## Additional consistency repairs

- Negative RED heat emission from negative dominance is clamped to a nonnegative capacity.
- Force decay is scaled by elapsed simulation time, and packet velocity is displacement divided by dt.
- API direction has exactly three finite components; bounded strength/noise/depth/mesh inputs avoid malformed or unbounded work. Engine dt has a finite positive bound. State-changing endpoints share the event loop; examples require one server worker.
- Grid initialization rejects duplicated, asymmetric, off-grid or degree>4 neighborhoods. Lifecycle adapters are required before stepping so missing integrations fail before state mutation.
- Allostatic load is bounded below by zero and pooled plant initialization resets counters. It does not by itself implement phenotype mutation or demonstrate a bifurcation.
- Variance cannot diverge for bounded coordinates; PR is undefined at zero covariance. Orthogonality, chaos, self-organized criticality and healthy behavior are different concepts. Neither state dimensionality nor clinical diagnosis follows from trajectory PR alone.
- Somatic and relational operational-memory coordinate tuples now match the corresponding meeting's proposed engine fields. These are gameplay abstractions, not calibrated physiological or interpersonal measurements.
- Precision 1/(1.001-delta) is finite at delta=1; it does not itself erase prediction error. Zero interoceptive weights give tanh(bias), not necessarily zero.

## Historical/scientific reading rule

Original council votes, dialogue, PDFs and monographs preserve historical design proposals. A consensus among agent personas is not independent empirical evidence. Unsupported biological mappings, universal healthy-chaos claims, Big Five coverage, guaranteed clinical outcomes, performance numbers and permanent trauma trapping must be read as hypotheses or analogies until separately tested. Previously commissioned supplements remain the source-linked audits of their specific topics. This correction pass makes no new clinical or scientific-validation claim.

## Verification record

1. Original C# examples: six regressions failed (panic gate, negative emission, wilt activity, coupling order, pair conservation, missing diffusion). This established the faulty paths before changes.
2. `node tools/verify-project-corrections.cjs`: embedded C# compiled under .NET 9 with minimal Unity/UI stubs; eleven behavioral checks passed. Python clock/PR source contracts checked statically. This is not a Unity editor compile or scene run.
3. `tools/verify-python-examples.py` using the installed uv-managed CPython 3.11.15: nine embedded Python blocks compiled; extracted asyncio clock/subscriber functions passed 0/1/2-viewer scenarios with subscriber cleanup. NumPy/FastAPI are unavailable in that interpreter, so their integration and numerical runtime tests remain pending.
4. Repository diff whitespace and correction-link checks run separately; generated harness files stay under ignored `.correction-verification/`.

## External work still required

Bind the Unity scene's existing spawn/remove/pooling/reset APIs, preserve stable cell identities during reset, and wire dashboard controls. Profile allocations rather than claiming zero GC from structs. Run Unity compilation, lifecycle tests, toxin diffusion and deterministic multi-seed ecological acceptance before checking implementation tasks complete. Phenotype mutation and frontline chart remain future implementation tasks, explicitly outside verified functionality. Run the complete Python numerical/API/WebSocket suite with NumPy/FastAPI, including constant/one-axis/isotropic histories and malformed requests. No runtime task is marked complete solely from these document corrections.

## Related records

- [Approved scope](2026-10-04-project-corrections-design.md)
- [Correction plan](../plans/2026-10-04-project-corrections.md)
- [Python simulation reference](../plans/2026-09-27-psychological-trauma-simulation.md)
- [Forest_Bloom reference](../plans/2026-10-01-forest-bloom-symbiotic-defense.md)
- [Operational mathematical memory](../../../memory/theoretical-foundations.md)
- [Psychological-space supplement](../../../MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Khao-Sat-Kiem-Dinh-Khong-Gian-Tam-Ly.supplement.md)
- [Willpower supplement](../../../MeetingMinutes/Supplements/Bien-Ban-Cuoc-Hop-Chuyen-De-Khong-Gian-Y-Chi.supplement.md)

## API design references

Lifecycle ownership uses the application startup/shutdown context described in [FastAPI lifespan documentation](https://fastapi.tiangolo.com/advanced/events/). Request constraints target Pydantic v2; see [Pydantic field API](https://docs.pydantic.dev/latest/api/fields/). These documentation checks do not replace runtime verification of the example.
