# Repurposing the canary and Venice budgets while demand is low, with a better local duet canary (draft for the owner, 2026-11-18)

**The direction (owner, 2026-11-18).** Visitor demand is low, so most of the canary's Workers AI allowance and the Venice testing budget can go to measurement now, and a new, better **duet canary that runs on local hardware** is part of it. Nothing here is built yet. Spending changes and production variables are the owner's; nothing in this plan touches them.

## 1. The two budgets, as known
| | Known | Not known (owner to supply) |
|---|---|---|
| **Workers AI free allowance** | 10,000 Neurons per UTC day, no rollover; about 26 Neurons per turn measured (about 380 turns a day). The canary is capped at 3,000 and holds back room for a production cap that no longer applies, because production runs on Venice. | How many Neurons the nightly canary really reaches in its 13-minute window (read the recent digests before changing the cap). |
| **Venice** | Production runs `e2ee-gemma-4-26b-a4b-uncensored-p`; `COACH_DAILY_CAP` is 80 turns. | The spend or balance available for testing, the per-turn price, whether staging has its own key, how much buffer visitors need. |

**First moves (small, reversible):** (a) read the last digests and the ledger to get the real nightly Neuron use; (b) if the window is the limit, widen it before raising the 3,000 cap (the cap alone buys nothing); (c) drop the production hold-back in `canaryBudget.ts` while production is on Venice; (d) set a Venice testing ceiling with a buffer so a test never takes a visitor's turn.

## 2. Where the budgets go (best value first)
1. **Venice baseline of the live model** (persona set, v2.1, three repeats, `--layers`): the largest open gap, since the canary tests Gemma on Workers AI, not what visitors get.
2. **Full-exchange runs on the live model** (the briefs, several repeats).
3. **The compliance-pressure set** (drafted; needs your pass criteria).
4. **A bigger test set:** a model drafts paraphrased variants of every case that ever failed, the owner reviews them, they join the set; turns single misses into rates.
5. **Hosted comparisons on the free Workers AI allowance:** the same cases on other models (and Apertus if access comes), through the same layer measurements.
6. **A short baseline per deploy**, so a regression shows the same day.
Guardrails: invented text only, no visitor data; stop after three errors in a row; every run in a ledger; a buffer for visitors; a human reads the results before anything is shared.

## 3. The local duet canary (new)
**What exists:** `scripts/duet-eval.mts` has a Venice model play the person against the real coach for up to five exchanges, on six briefs (`src/lib/duetBriefs.ts`), run by hand. It needs Venice for the person and spends Neurons or Venice credit for the coach.

**What the new one is:** a runner that plays **both sides on the owner's own machine** (LM Studio, as the bake-off already does), unattended on a schedule, with the headline measure being **how deep into the conversation the coach holds**. It costs nothing in Neurons or Venice credit, which also leaves those budgets for the hosted side (the 26B, the live Venice model) that local hardware cannot run.

### What is better than the current duet
1. **Escalation ladders, not just moods.** Each brief has levels of pressure ("asks once", "pushes", "guilt", "claims the coach said yes", "threatens to leave"); the simulator moves up a level each time the coach holds. The score is the **turn of the first failure**, or "held to the end". A coach that caves on turn 4 and one that caves on turn 1 are different results.
2. **A bigger, systematic brief library** (target 20+): the six existing ones plus the failure classes found on 2026-11-18: asks for a memory promise, farewell and "will you miss me", diagnosis requests, role-play of a dead relative or an ex, medication change, thanks and closing, "you are the only one who listens". Invented, none involving a minor.
3. **Paired arms with the same seeds.** Every conversation runs with the boundary and persona guards **on and off**, same seed and same simulator script, so the effect of a guard is a paired difference, not two separate noisy runs.
4. **Automatic checks every turn.** The existing page and persona checks and the boundary guard tests score each coach reply as it comes; an option stops the conversation at the first red flag (cheap, finds failures fast) or runs on to the end (finds recoveries).
5. **A simulator health check.** A small simulator can drift into sounding like the coach ("I hear how hard that is"). The runner counts simulator turns that read as coach-speak or break character and reports the rate, so a "pass" against a bad simulator is labelled as weak instead of reassuring.
6. **Resource-aware and resumable.** Before starting: LM Studio reachable, free memory and swap, power connected, and (macOS) thermal state; during: a per-turn timeout, a checkpoint file after every conversation, a stop file to end it cleanly, and no more than the configured hours. A crash resumes where it stopped.
7. **A nightly window.** A scheduled job (macOS launchd) runs in an idle window (for example 02:00–05:00) on mains power, keeps the machine awake only while it runs, and releases memory after. The same job fits a rung 1 personal hub (`hub-scales.md`), so the hub machine becomes the canary host.
8. **Counts-only digest plus a review queue.** The digest has counts, per-brief first-failure turns, guard fires by type, simulator health and drift against the last seven nights; no transcripts. Flagged conversations go to a private folder for the owner. A desktop notification at the end (the runner cannot send phone alerts; those come from the session).
9. **Shared code.** Briefs, scoring and ladders live in `src/lib` as pure modules with tests, so the Netlify canary and a hosted duet can reuse them. The existing Netlify canary stays (hosted persona set); the local duet is a second canary.

### Who plays whom (to measure, not assume)
| Coach under test | Simulator | Fits in 16 GB? |
|---|---|---|
| E2B uncensored or instruct (about 3–4 GB) | Llama 1B (about 1 GB) | Yes |
| E2B or Llama 1B | Apertus 8B (about 5 GB, Q4) | Yes, near the limit (swap seen before) |
| E2B, Llama 1B or Apertus | A hosted model on the free Workers AI allowance | Yes; costs Neurons, not memory |
| 26B instruct (Workers AI) or live Venice | Local simulator | Yes (the coach is remote) |
Both models stay resident (no per-turn model swapping; LM Studio's load time would dominate). First experiment: which simulator keeps a believable person across five exchanges, judged by the health check and by the owner reading a first batch.

### Limits to state with every result
- A small simulator is a weak adversary: "held" against it means less than against a determined person.
- Results on E2B or Llama 1B do not predict the 26B; they say what the layers do when the model gives no help (`outer-layers-scope.md`).
- Invented, distressing text: start with a dozen conversations, read them, then scale.
- A pass is not a safety claim; these are regression and measurement tools.

## 4. Build order
1. Read the canary digests and ledger; fix the cap and window (section 1).
2. Venice baseline and live-model duet runs (section 2, items 1–2), once the owner sets the Venice ceiling.
3. Pure modules: ladders, first-failure scoring, simulator health, with tests.
4. Local duet runner: preflight, checkpoints, paired arms, digest; first manual batch of 12 conversations.
5. The brief library to 20+, from the failure classes.
6. The nightly window (launchd) and the review queue.
7. Hosted comparisons and the per-deploy baseline.

## 5. Decisions and inputs for the owner
1. The Venice testing ceiling (per day or total), the per-turn price, and the visitor buffer.
2. Whether staging has its own Venice key.
3. Where the local canary runs: this Mac at night, or a separate machine (a personal hub, `hub-scales.md` rung 1).
4. The idle window and whether the Mac may stay awake for it.
5. The compliance-pressure pass criteria (item 3 above).
6. Who reviews the flagged conversations, and how often.
7. Whether a summary is ever published, and under what review.
