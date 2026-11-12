# Rule: Gemini Executor Workflow

**Scope:** Universal — no project config needed. Applies only in projects where the owner uses Gemini as the implementing executor. Complements [plan-files.md](plan-files.md), [dispatch-brief.md](dispatch-brief.md) and [no-unrequested-subagents.md](no-unrequested-subagents.md).

---

## Policy

Roles: **Claude plans and reviews, Gemini implements.** The owner runs Gemini; Claude never claims a plan was executed until artifacts show it.

### Loop

1. Brainstorm (`superpowers:brainstorming`); put forks to the owner with previews.
2. Spec in `<PLAN_DIR>/design/`, plan in `<PLAN_DIR>/implement/` (see `plan-files.md`). Chat holds a pointer and the open question only.
3. Owner runs Gemini, one wave or phase at a time.
4. Claude reviews from artifacts, files credible findings in the bug ledger, and fixes only when the owner says so. A review request never starts later waves.

### A plan Gemini executes correctly

- Header rules: implement in order; never skip an "expect FAIL" step; **never change an expected value to make a test pass**; if a "replace this exact text" anchor is not found, **STOP and report**.
- Read the current files before writing the plan (a previous executor may have changed them). Give whole-file replacements or exact find/replace text.
- Every test with non-obvious numbers carries an "Expected-value reasoning" paragraph.
- Per task: an Interfaces block (exact names and types), exact Global Constraints, and Review Focus items each pinned to a test.
- Task 0 inspects the checkout and verifies baseline gates. Last task is a runtime checklist that tests alone cannot tick.
- Probe every external fact the plan relies on (library API, CLI behavior, file the tool writes) by running the exact behavior, including the case a guard should block, before writing it into the plan.
- Outward-facing steps (publish, delete, create public repo) are marked OWNER GO. Owner-only secrets steps are written for the owner.
- Commit the plan before handoff when the tool under test rejects dirty trees.

### Headless handoff (Antigravity CLI `agy`)

- Run `agy --print "read brief X and follow it"`. Put the instructions in a brief file under `<PLAN_DIR>/` (read-first list, scope, hard safety rules, report format).
- Headless mode auto-denies every shell command. A `permissions.allow` list matches exact command strings only, so it cannot cover git or build tools. The working path is `--dangerously-skip-permissions`, which needs explicit owner approval for each launch; if Claude Code's classifier blocks the call, the owner allows that exact call through `/permissions`. Retry only that call.
- Nothing enforces the brief under skip-permissions, so the brief needs a hard safety block: no push, reset, checkout or clean; no deletes; no service, firewall, process or port changes; no elevation or package installs; stop and report on surprise. Afterward check live state yourself.
- Exit code 0 does not mean work was done. Check `git log`.
- Live transcript: `%USERPROFILE%\.gemini\antigravity-cli\brain\<conversation id>\.system_generated\logs\transcript.jsonl` (newest by LastWriteTime). The `--print` output stays empty until the run ends.
- A file handoff is not a message to Gemini. Never say it was delivered because the file exists.

### Supervising a running Gemini

- Check progress **once per 3 minutes** while Gemini runs, never more often. Schedule the next check right after each one (`ScheduleWakeup` 180 s, or a background watcher that logs once per 180 s), so the cadence survives other work.
- Each check is cheap and read-only: agy process alive, newest transcript `step_index` and last status, `git log -1` and `git status --short`, and the plan's newly ticked boxes. Report one line per check: task, step, changed files, alive or dead.
- Stall: the transcript step index and git state are unchanged for 4 consecutive checks, or the process died. Report it to the owner with the last step; do not restart Gemini or rerun the brief on your own.
- Anomaly (action outside the brief's scope, a forbidden command, unexpected dirt): stop checking on a timer, report immediately and ask the owner.
- Stop the loop when agy exits, then run the Review section. Do not edit product files while Gemini is running; read only.

### Review (after Gemini says done)

1. Review from artifacts, never from Gemini's report: `git log`, `git status`, `git diff --stat` against the plan's file map, timestamps, logs, installed state, tags.
2. Run fresh gates yourself and record actual counts and revision. Historical or predicted counts are not gates.
3. Check tests were not weakened: grep the plan's key expected values in the test files.
4. Reproduce each ticked runtime step. If unobserved, mark it PENDING with the reason.
5. Recompute any go/no-go decision against the plan's own criteria.
6. Diff deviations from Global Constraints, especially anything touching secrets or unplanned conveniences.
7. Review Gemini's memory and status edits like code; they have contained wrong lessons.
8. A larger-than-expected diff may be right; ask for the justification before calling it churn.
9. Independent reviewer subagents follow `no-unrequested-subagents.md`: only on an explicit `superpowers:requesting-code-review` request or user ask; read-only, tailored brief, no recursion.

### Known Gemini habits

- Ticks plan steps it did not observe.
- Writes plausible but wrong explanations; check the evidence source matches the claim.
- Declares GO against the plan's own criteria.
- Leaves checkboxes unticked, writes no report, or skips steps that are hard to do while the owner summarizes "all working".
- Improves when told: "tick only when observed, otherwise write PENDING with the reason."

## Why

Gemini follows precise plans faithfully but over-reports its own verification. Pre-verified plans plus artifact-based review caught every defect that status notes missed. Headless runs without a safety block act with no enforcement at all.
