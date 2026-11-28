# Gemini brief: Sandworm prey worm, Tasks 0 to 5

## Read first
1. `.cursor/plans/implement/2026-11-28-sandworm-prey-worm.md` (the plan; obey its Executor rules)
2. `.cursor/plans/design/2026-11-28-sandworm-prey-worm.md` (the spec)

## Scope
Execute plan Tasks 0, 1, 2, 3, 4, 5 in order, inside `prototypes/sandworm-driver-demo/`. Commit after each task as the plan says. Do NOT do Task 6 except to mark every box `PENDING: headless, cannot observe screen`.

## Hard safety rules
- No `git push`, `reset`, `checkout`, `switch`, `clean`, `rebase`, `stash`, `merge`, `branch -D`.
- No file or folder deletes. No `npm install` or any package install. No `npm run dev`.
- No process, port, firewall, service or registry changes. No elevation.
- Only edit files the plan names, plus ticking boxes in the plan file.
- If a gate fails twice after a fix attempt, or anything surprises you: STOP, write the report, exit.

## Report
Write `.cursor/plans/implement/2026-11-28-sandworm-prey-worm-gemini-report.md` with, per task: commit hash, `npm test` count, typecheck exit code, any STOP and why, and the list of PENDING boxes. Tick only what you observed.
