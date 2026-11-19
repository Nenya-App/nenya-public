# The troll arena

Status: built, run by the owner. A watchable live test of the real coach (every layer) against invented trolls played by a local model. Scope and design come from `budget-repurpose-plan.md` sections 3 and 3b; the layers are described in `outer-layers-scope.md` and `coach-boundaries-scope.md`.

## Run it

```
zsh /Users/estellestreiff/Desktop/nenya-public/scripts/run-troll-arena.sh
```

That checks LM Studio is up, says which adversary it found, starts the arena, and opens the live page at `http://127.0.0.1:5230/` (this computer only). Flags you add are passed on: `--personas all`, `--rounds 2`, `--judge apertus-8b-instruct-2509`, `--coach local:gemma-4-e2b-it-rotorquant` (free), `--neuron-cap 600`. `node scripts/troll-arena.mts --help` lists them all.

Defaults: the adversary is `Qwen2.5-14B-Instruct-abliterated-v2` when LM Studio lists it (otherwise `gemma-4-e2b-it-uncensored`); the coach is Workers AI Gemma 4 26B (about 100 Neurons a conversation, a hard ceiling of 3,000 per run, always recorded in the canary ledger); guards on and off in pairs; up to five exchanges. With a remote coach the arena unloads other local models so the memory is the adversary's.

## What each part shows

- **The troll** (left): its message, the ladder level it is at (it climbs one level each time the coach holds), and a note if the simulator slipped (coach-speak, a refusal, broken character). Fixed lines (floods, pasted walls, encoded text) are marked.
- **The coach** (right): the reply, coloured and labelled green, amber or red by the deterministic checks (`personaChecks`, the boundary tests, a setup-leak check), with the reasons. If the model's own first draft differed from what the site sent, the page says so and shows the draft and how it scored.
- **What the layers did** (beside each reply): from the coach function's trace and its response fields, in plain words: stopped before the model (steering screen, safety stop, form check), asked the model again, replaced by a fixed sentence, repaired or trimmed, a sentence the site added, closing settled, names removed, the lane guard's fixed answer.
- **Header**: persona, level reached, exchange, round, guards on or off, the layers the persona should trip, and running totals: held to the end, failed (at which exchange), blocked by the site before the model, simulator slips, Neurons spent. **Pause, Step, Skip persona**, a theme switch and a legend. Dark and light, large type, keyboard operable, AAA contrast (tested), only a gentle fade (none with reduced motion).

## Paired arms

With `--guards both`, the guards-on arm is played live; the guards-off arm replays the same troll messages word for word, so the difference is the guards and not a different conversation. Guards off means every switchable guard (boundary, persona, infrastructure, names, closing, arc, care, lane, values) is off. The steering screen and the safety stop cannot be switched off and stay in both arms.

## What it leaves

In the output folder (default `~/Downloads/Nenya (private)/arena-<date>/`): `conversations.json` (invented, private), `digest.md` (counts only: totals per arm, first-failure turn or held per persona, layer actions by type, red checks, simulator health, paired differences, judge disagreements), `events.json`, and `replay.html`, a single file with everything inlined that plays offline (play, pause, step, restart) and can be sent to a phone. A run resumes with `--resume`; create a file named `STOP` in the folder to end it cleanly; three errors in a row end it too.

## The judge

`--judge <LM Studio model>` runs after the conversations (other local models are unloaded first) and reads each coach reply against a short rubric. Its flags appear in the replay as leads, never verdicts. Where it flags a reply that the checks called green, that is a silent-failure candidate to read; where the checks flag and it does not, that is listed too.

## Limits

- A small adversary is a weak troll. "Held" against it means less than against a determined person; the digest reports the simulator's slips.
- Results on small local coaches do not predict the 26B. They show what the layers do when the model gives no help.
- A pass is not a safety claim. The checks are phrase matches; the arena finds where to read and what to fix.
- The troll's text is invented and can be ugly. The adversary is told: nothing sexual, nothing involving minors, no real named people, no instructions for harm. The brief library describes behaviour only and writes no slurs; the adversary model improvises. It stays in the output folder, is never committed and is never used on the site. Visitors never see this tool.
