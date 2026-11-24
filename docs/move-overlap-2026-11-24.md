# Narrow move wins (2026-11-24)

Owner-approved 2026-11-24. Code: `MOVE_PRECEDENCE` and the last lines of `selectModules` in `src/lib/coachModules.ts`. Tests: `tests/move-overlap.test.mts`. No module text, instruction, guard or check was changed.

## Why

A model-drafted review of the 36 moves cases (`persona-tests-2026-11-24/moves-review-2026-11-24.md`, in the private folder; it ran `selectModules` read-only) found that the expected move module was selected in all 36 cases, but older, broader modules came along and asked for the opposite:

- `rough_draft_first` (hear the unskilled version first) also got `open_a_hard_conversation` (offer one sample opening line) in 4 of 4 cases, and `offer_to_play_the_other` (rehearsal) in 2.
- `two_intentions` (ask which of two aims; draft nothing until they choose) also got `open_a_hard_conversation` in 3 of 4.
- `grieve_before_deciding` (room to feel, the decision waits) also got `field_cost` (what does it cost others; case 1, listed first because lenses come before moves) and `guess_then_check` (case 2).
- `permission_giving` (plainly allowed, no "but") also got `guess_then_check` (case 2), and the reply took that route.

`offer_a_smaller_step` already removes every other move, and `ask_one_question` was alone, and both worked cleanly. This note extends that idea to the four moves whose extras the review showed to contradict them.

## The table

| Narrow move | Drops | Why |
|---|---|---|
| `rough_draft_first` | `open_a_hard_conversation`, `offer_to_play_the_other` | The move is to hear the rough version first; a sample opening line and a rehearsal both ask for the finished version. |
| `two_intentions` | `open_a_hard_conversation` | Nothing is drafted until they choose between the two aims; a sample opening line drafts first. |
| `grieve_before_deciding` | `field_cost`, `guess_then_check` | Room to feel comes before any decision; weighing the cost to others, or guessing a need, is analysis for someone raw. |
| `permission_giving` | `guess_then_check` | Plain permission; a guess at a need after it turns it into analysis. |
| `offer_a_smaller_step` | (nothing) | Own rule: removes every other move. |
| `name_behavior_neutrally` | (nothing) | `open_a_hard_conversation` appears once (case 1) but the review does not call it contradictory. |
| `protective_not_punitive` | (nothing) | `ask_for_what_you_want` appears twice; not called contradictory. |
| `smallest_next_step`, `ask_one_question` | (nothing) | Nothing extra was selected with them. |

## How it works

- Applied to the final list, after the lens holds (`SUPPRESS`), `offer_a_smaller_step`'s exclusivity and the per-group caps. A dropped id is removed and **nothing takes its place**: the result is what the older rules chose minus the contradicting extras, and a module the cap had already left out does not appear (otherwise freeing a slot brought `guess_then_check` into rough-draft-first-1 and `offer_to_play_the_other` into two-intentions-1).
- Two moves in one message: both rows apply (the union of what each drops); order does not matter.
- Never targets: a safety or resource module, any of the nine v0.3 moves, a coercion module, or the lenses `reserves`, `care_depleted`, `harm_named_as_intended`. A test proves it, so a later edit to the table cannot do it silently. The distress path and the guards run before or beside module selection and do not read this table.
- The coercion modules return before this runs, and are exclusive as before.

## What changed (10 of the 36 cases)

| Case | Before | After |
|---|---|---|
| rough-draft-first-1, -2 | rough_draft_first, open_a_hard_conversation, offer_to_play_the_other | rough_draft_first |
| rough-draft-first-3, -4 | rough_draft_first, open_a_hard_conversation | rough_draft_first |
| two-intentions-1, -2, -3 | two_intentions, open_a_hard_conversation, ask_for_what_you_want | two_intentions, ask_for_what_you_want |
| grieve-before-deciding-1 | field_cost, grieve_before_deciding | grieve_before_deciding |
| grieve-before-deciding-2 | grieve_before_deciding, guess_then_check | grieve_before_deciding |
| permission-giving-2 | permission_giving, guess_then_check | permission_giving |

The other 26 are unchanged.

## Left for the owner

- `two_intentions` still gets `ask_for_what_you_want` (cases 1 to 3) and `offer_to_play_the_other` (case 4). A rehearsal before they choose looks as contradictory as the sample line; the review's list did not include it, so it is not dropped. The same goes for `name_behavior_neutrally` with `open_a_hard_conversation` and `protective_not_punitive` with `ask_for_what_you_want`.
- This changes which module text the model receives, not what the model does with it. The review's other findings (the arc guard rewrites, the checks, the missing example lines) are separate and untouched. Whether replies improve is not measured; re-running the 36 cases needs a model call and was not done.
