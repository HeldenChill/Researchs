# Project Corrections Implementation Plan

> Execute inline in this session; the owner approved the correction scope. Preserve existing user changes. External Unity code is outside this plan.

**Goal:** Repair reviewed errors in research guidance and embedded simulation examples.

**Architecture:** Application-owned simulation clock; synchronous grid phases and explicit scene lifecycle adapter; current correction register linked from historical documents.

**Tech Stack:** Markdown, Python examples, Unity C# examples, PowerShell verification harness.

## Tasks

- [x] Extract existing C# examples and reproduce panic/wilt/coupling failures with a minimal harness.
- [x] Correct Python PR, clock ownership, input contracts and force decay in the existing implementation plan; align the spec.
- [x] Correct Forest_Bloom operators, lifecycle, snapshot coupling, diffusion, population contract and dashboard; align ecological acceptance and mark external execution pending.
- [x] Correct mathematical operational memory and add correction links to archived records, agent memories and research documents.
- [x] Run regression harness, consistency checks and diff review; report exact verification limits.

**Result:** Eleven compiled C# behavior checks, nine Python syntax checks, three extracted async subscriber scenarios and 93 local correction/reference links passed. `git diff --check` passed. Full Unity and NumPy/FastAPI execution remain pending. Approved design recorded in commit `3016de1`; implementation/document corrections remain in the working tree for review.

## Verification commands

`node tools/verify-project-corrections.cjs`

`python tools/verify-python-examples.py` (use a working installed Python interpreter; the WindowsApps alias is broken in this session).

`git diff --check`

Read both simulation specs against their updated plans; ensure scene adapter integration and empirical/ecological results remain explicitly pending.
