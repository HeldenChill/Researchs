# Playtest protocol — Forest_Bloom slice, P7

Kit from AG-11. Thresholds are in [pre-registration.md](pre-registration.md): PT1 and PT2 at 60% or more.

## Before the sessions

1. Check the view yourself first. Open `http://localhost:8000/web/` and play one round. Confirm every row of the [perceivability table](README.md#perceivability-table-l13-written-before-any-view-code) is visible. Record what you saw in the README "View checks" table, which is still pending.
2. Serve: `python -m http.server 8000` in `prototypes/forest-bloom-slice`.
3. Have a timer and the [results table](playtest-results.md) ready.

## Players

3 to 5 players, one at a time, who have not seen the project.

## Script

| Step | What you do | What you record |
|---|---|---|
| 1 | Say only: **"Plant seeds to bring this land back to life."** No rule explanation. Answer no questions about the rules | — |
| 2 | The player plays two full rounds of level 01, about 5 minutes. A round ends when the end message appears. Press Restart for round 2 | — |
| 3 | Say: **"That is all I need; you can stop now or keep playing, either is fine."** Start the timer and leave the player alone. Stop the timer when they stop, or at 15 minutes | Voluntary minutes |
| 4 | Ask: **"What was the most memorable moment, and why did it happen?"** | Answer, word for word |
| 5 | Ask: **"What did the fading colour mean?"** | Answer, word for word |

No IMI questionnaire: there is no second version to compare (AG-11 item 3).

## Scoring

| Field | Rule |
|---|---|
| Cause correct | The retell names soil getting richer, shade, or the species order (pioneer, then shrub, then canopy) as a cause |
| Read the fading colour correctly | The answer says the forest is losing variety, or one species is taking over |
| PT1 | Share of players with voluntary minutes of 5 or more |
| PT2 | Share of players with "cause correct" |
| HY-3 | Do the retold moments match rows of the perceivability table? |

With 3 to 5 players this is a signal, not statistics.
