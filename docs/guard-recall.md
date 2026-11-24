# Guard recall

**What it is.** A script that runs a set of invented paraphrase families through the site's own phrase check and reports, the same way every time: of the many ways of saying one thing, how many are flagged, at the right tier, and how many harmless near-misses are wrongly flagged. It replaces fixing one missed sibling at a time with a number per family that can be watched.

**What it is not.** It is not a detection rate for real people, and it makes no claim that anyone is safe. The messages are invented, the labels are one reader's, and the check reads words, not meaning. The right words are "recall on the invented families" and "false-flag rate on the invented near-misses". Do not write "detects", "catches" or "protects" about its numbers.

No model, no network, no key, no clock (apart from the `ranAt` stamp). It calls `checkConversation` from `src/lib/safetyFlags.ts`, the entry the site uses, so the self-injury ladder and the carried-over distress rule are exercised too. It copies no pattern and changes none. Two runs on the same file give identical results.

Files: `scripts/guard-recall.mts` (the command), `src/lib/guardRecall.ts` (the pure library), `tests/guard-recall.test.mts` (tests on a small synthetic file).

## The families file is not in the repository

The labels (which message should flag, at what tier and kind) are the owner's to review, and the held-out half should not be readable by whoever tunes the patterns. So the script takes the file's **path** and the repository holds only a tiny made-up fixture inside the test. Never copy a real families file into the repository.

Shape (fields it does not know are ignored; `src`, `split` and `_label` in a draft file are not used):

```json
{
  "version": "v1",
  "families": [
    {
      "id": "FAMILY-ID", "category": "self-harm", "tier": "soften", "kind": null,
      "title": "optional",
      "pos": [ { "id": "FAM-FAMILY-ID-01", "reg": "P", "turns": ["one or more messages, oldest first; the last is under test"] } ],
      "neg": [ { "id": "FAM-FAMILY-ID-10", "note": "optional", "turns": ["a near-miss that must not flag"] } ]
    }
  ]
}
```

- `category`: self-harm, self-injury, harm-others, abuse or distress. `tier`: stop or soften. `kind`: a string the flag must carry, or `null` when the kind is not asserted.
- `pos` are paraphrases that should flag as the family's category, tier and (if asserted) kind. `neg` are near-misses that should not flag at all. `reg` is the register: P plain, I indirect, Y casual (young-sounding), F formal, T text-speak, X typos, L lead-in sentence, M mid-conversation (earlier turns first). The full names are accepted too.
- `version` is optional but should be set. It is part of the split rule below.
- Ids are unique across the file. A malformed file stops the run with exit code 3 and a list of every problem found (the first 20 are shown).

## How to run

```
node scripts/guard-recall.mts --families <path>                      the table, on the terminal
node scripts/guard-recall.mts --families <path> --json <out.json>    also write the full result
node scripts/guard-recall.mts --families <path> --split tune         only the tuning half
node scripts/guard-recall.mts --families <path> --only SI-NOPOINT    one family, or one paraphrase id
node scripts/guard-recall.mts --families <path> --list               families, counts and halves; runs nothing
```

Exit codes: 0 ran; 2 wrong use (an unknown option or `--only`, a bad `--split`); 3 the families file is missing, not JSON, or malformed.

## The held-out rule

Each paraphrase falls in one of two halves, by a fixed rule: take SHA-256 of the text `<version>:<id>` (the word `unversioned` if the file has no version), read the first byte, and an even byte means **tune**, an odd byte means **heldout**. Consequences:

- A paraphrase's half depends only on the file's version and its own id. Adding, removing or rewording other rows moves nothing. The held-out half therefore changes only when the version changes (or an id does).
- The halves are about, not exactly, equal, and a family of four near-misses can fall all on one side. That is the price of a rule that needs no stored list.
- The `split` field a draft file may carry is ignored.
- The tuning half (`--split tune`) is the one whoever changes the phrase lists may read, run and look at the misses of. The held-out half is for judging, at a decision point, whether a change generalizes (does heldout recall move, and not only tune?). Look at it after every edit and it stops being held out.
- The script does not hide the held-out text from anyone who can read the families file, and `--split all` (the default) prints held-out ids. The rule only works if the person or model tuning patterns does not read the held-out rows. Keep the file, and any `--json` made from it, outside the repository.

## How to read the output

The terminal summary has, in order: a header (families version, split, guard fingerprint, repo commit, file hash), then

- **overall**: "flagged at all" (a flag of any kind was raised) next to "as expected" (category and tier matched, and kind too where the family asserts one). The gap is flagged-but-differently: a soften where a stop was expected (the message still reaches the coach), a stop where a soften was expected (the conversation ends sooner), or another category or kind.
- **by tier, kind, category, register and split** (of the paraphrases that should flag, grouped by what was expected), each as `k/n percent [low-high]`, a 95% Wilson interval.
- **near-misses falsely flagged**: how many of the harmless near-misses were flagged, how many of those were stops (the tier that ends a conversation) and how many softens, and the rate for the near-misses of stop-tier and of soften-tier families.
- **by family**: flagged, as expected, and false flags.
- **missed paraphrases and falsely flagged near-misses**, by family, **ids only**. The text of a message is never printed to the terminal; it is in the `--json` file.

The `--json` file has `kind: "guard-recall"` and the persona-run shape the private results viewer already reads: `ranAt`, `condition` (which ends in `dev <commit>`), `fingerprint`, and a `results` list with `id`, `category` (the family id), `outcome` and `verdict` (pass or fail), `how` (`flag` or `none`), `note` and `failures` (`expected ...; the check raised ...`). Beyond that: `familiesVersion`, `familiesSha256`, `commit`, `split`, `summary` (all the groups above), and lists `missed`, `falseFlags` and `differs` with the invented text in `turns`. The viewer was not changed, so it shows the file as a run in which a pass means "flagged as expected, or a near-miss left alone"; it cannot show the message text (its catalog does not know these ids), and its "pass" wording is about replies, so read the per-case `failures` lines instead. The JSON holds invented messages: keep it private and never commit it.

## Limits

- **The labels are the model's draft and are not independent.** A model wrote the families and the expected tier and kind, and it had read the repository's own phrase tests. One reader (the owner) is reviewing them. A different label changes the count.
- **A baseline is not a rate for ordinary talk.** The near-misses were chosen to sit next to a phrase on purpose, so the false-flag rate is a stress rate. The families were written to cover known wordings; the recall is recall on those wordings.
- **The intervals are too narrow.** Wilson treats the nine wordings of a family as independent, but they share a meaning and one writer. A family's interval is wide (6 of 9 spans about 35% to 88%): families are for finding where to look, not for ranking. The design also names a cluster bootstrap for the overall figures; it is not built here.
- **Phrase matching, English only.** It reads words, not meaning.
- **Overfitting.** A pattern fitted to these wordings moves the tune half and not much else. Compare tune with heldout, and write a fresh held-out half (by a different writer) when it has been used to choose between changes.
- **No claim of safety.** A high number means the lists know many wordings, nothing more.
- Comparing two runs, freezing a version with a lock file, `--compare` and `--fail-under` from the design are not built; compare two `--json` files by hand.
