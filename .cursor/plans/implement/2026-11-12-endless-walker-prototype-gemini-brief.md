# Gemini brief: Endless Walker feel pass and hook test (round 2)

Status: plan approved by owner, launched by Claude 2026-11-12. Round 1 (prototype build) finished 2026-11-12, reviewed, 38/38 tests.

## Read first

1. `.cursor/plans/implement/2026-11-12-endless-walker-feel-pass-and-hook.md` (the plan; follow it exactly)
2. `.cursor/plans/design/2026-11-12-endless-walker-feel-pass-and-hook-spike.md` (approved design)
3. `.claude/rules/no-case-study-bias-and-basis-orthogonality.md`

Do not follow the round 1 plan (`2026-11-12-endless-walker-prototype.md`); it is finished.

## Scope

Tasks 0 to 7 of the round 2 plan, in order. Write only under `docs/explorations/endless-walker/prototype/`. The only other edit allowed: ticking boxes and writing PENDING notes in the round 2 plan file.

## Hard safety rules

- No `git add`, `commit`, `push`, `reset`, `checkout`, `clean`, `stash`, `rm`. No deleting any file.
- No package installs (`npm install`, `pip install`, `npx` anything).
- No changes to services, firewall, processes or ports, except starting `python -m http.server 8765 --bind 127.0.0.1` from the prototype folder and stopping that same process. Port 8080 belongs to another app: never touch it.
- No elevation. No edits outside scope. Do not edit `src/config.js` or `tests/config.test.js`.
- Never change an expected value in any test, old or new. If a test fails, STOP and report.
- Surprise of any kind: STOP and report.
- Tick a box only when you observed it. Otherwise `PENDING: <reason>`.

## Report format

```
Tasks done: <list>
node --test: pass N fail M
STOP events: <none or details>
PENDING boxes: <list with reason>
Deviations from plan: <none or each with reason>
Files created or modified: <list>
```
