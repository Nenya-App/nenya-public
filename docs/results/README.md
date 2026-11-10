# Publishing test results: the rules we follow

Written 2026-11-10. Not legal advice; a plain reading of the licences and of what makes a result fair. Where a point depends on a person's judgment, it says who decides. Nothing here has been published yet.

## 1. Using a noncommercial dataset (ESConv, and EmpatheticDialogues once confirmed) privately
**Short answer: very likely yes, for evaluation and development of a free tool.** Creative Commons "NonCommercial" (CC BY-NC 4.0) means the use must not be *primarily intended for or directed toward commercial advantage or monetary compensation*. Reading prompts to test whether a free, nonprofit-sponsored tool misfires is not that. What makes it less than certain:
- CC says nonprofit status does not by itself settle it either way; the question is the use. Nenya takes donations and is fiscally sponsored by a 501(c)(3); that is not commercial advantage, but it is the part a careful reader could ask about. **Fractured Atlas is the right place to ask**, and the dataset authors can be asked by email (a note of what we do and that it is free).
- **Evaluation is the safe use; training is not.** Our registry (`src/lib/testSets.ts`) marks ESConv as *no redistribute, no train*. Fine-tuning on it would make an adapted model that carries the licence's terms and invites the "is the product commercial" question. We do not do it.
- **Keep the data out of the repository and out of any public place**, and out of the signed transcripts. The runner reads it from a folder you choose.
- The licence card I read was on a pull-request branch: confirm it on the dataset's main page before relying on it.

## 2. What may be published, by licence
| Licence | Results (counts, ids, rates) | A few short quotes | The data itself | Training |
| --- | --- | --- | --- | --- |
| CC BY 4.0 (XSTest) | Yes, with credit | Yes, with credit | Yes, with credit | Yes |
| Apache 2.0 (OASST2) | Yes | Yes, with credit | Yes, with the licence notice | Yes |
| CC BY-SA 3.0 (Dolly) | Yes, with credit | Yes, with credit | Only under the same licence | Check what the model's output would then carry |
| CC BY-NC 4.0 (ESConv) | Yes, with credit | A few, with credit, in a noncommercial publication | **No** | **No** |
Aggregate numbers and prompt ids are not the dataset's creative expression, so publishing them is safe under all four. Quoting is where the licence matters: credit every quote, mark any change, and keep the quotes few and short (the runner caps them at 200 characters, and only for sets that allow it).

## 3. The credit
Every published result prints the set's credit line, which is in `src/lib/testSets.ts` and is written into each results file by the runner. When results are published, add the set to `ATTRIBUTIONS.md` as DarkBench is. Cite the paper as well as the data.

## 4. Fair reporting (what a reader needs to trust it)
- **Say how many, and how chosen.** The runner records the pool size, the sample size and the **seed**; a seeded shuffle, not our picks.
- **Report everything that was run**, including the misses, and the prompts the site refused. No cherry-picking: if we show examples, they come from the sample in order (`--quote N` takes the first N), not from the best or the worst.
- **Say what counted as a miss before looking**, and who read the replies. A flag on a prompt that truly is about harm is not a false alarm; the numbers alone cannot tell, so **a person reads every flagged reply and a tenth of the others** (the private file exists for that).
- **Give intervals, not just rates** (the runner prints a 95% interval).
- **Name the coach**: the site's build and instruction version, the model, the date, and which switches were on (practice arc, guards, Learn). A result for one build is not a result for the next.
- **Say what it does not show**: first messages only, a small sample, phrase checks that are not judgments, one small model. The runner writes that paragraph into every file; do not delete it.
- **Never claim the coach is safe** because it passed. Wording to prefer: "in this sample, it did X on N of M prompts."
- **Publish the method and the script**, so someone can get the data themselves and repeat it. Do not publish the data.
- **Correct it when wrong.** If a bug in our script or checks is found, update the page and say what changed.

## 5. The coach's replies
These are model outputs from a hosted model. Before publishing a reply (rather than counts) read the hosting service's and the model's terms for publishing outputs; I have not checked them. The runner's public file contains no replies at all. A reply to a *test prompt* carries no privacy question; a reply to a real visitor is never published.

## 6. Steps to publish a result
1. Download the set to a folder outside the repository, read its licence at the source, and confirm `licenceChecked` in `src/lib/testSets.ts`.
2. Run `scripts/eval-prompts.mts` (it writes a public JSON, a Markdown summary and a **private** file).
3. Read the private file: every flagged reply and a tenth of the rest. Write down what you judged.
4. Put the Markdown summary, the JSON and your reading notes in `docs/results/` (or a page on the site), with the credit.
5. Add the set to `ATTRIBUTIONS.md`. Add a short line to the page: date, build, and the "does not show" paragraph.
6. Re-run when the coach changes, and keep the old results with their build named.
