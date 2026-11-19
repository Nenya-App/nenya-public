# The expanded buildout: technical scope (draft for the owner, 2026-11-17)

**Status:** scoping. Covers the technical and design workstreams that follow from the owner's direction of 2026-11-17: restructure around outer layers that work on any model, test on small and less compliant models first, keep the model family constant across providers, and rebuild the identity around lenses. **Not in this document** (kept private, not in the repository): pricing, tiers, payment, crypto and endowment ideas. Those depend on a sponsor agreement and are a separate decision.

## Workstreams
| # | Workstream | State today | Next |
|---|---|---|---|
| A | **Outer layers and conformance** (`docs/outer-layers-scope.md`) | Layer tracing built; six models compared on the persona set (layers add little where the model behaves); the E2B uncensored needed three rescues | A compliance-pressure test set; layers in full-exchange runs; a conformance suite per model |
| B | **Local and on-device** | LM Studio runs work (`--local-url`); E2B (instruct, uncensored), Apertus 8B and Llama 1B tested | A model registry; local runs in full-exchange; later a browser (WebGPU) runtime with weights on R2 |
| C | **The lens rewrite** (`docs/lens-rewrite-scope.md`) | Brief written; decisions open | Decisions, vocabulary module, wireframes |
| D | **Terms and legal batching** | Venice-era Terms live (same-day revision 2026-11-16) | One planned revision for everything queued (lens vocabulary, any model change) |
| E | **Evidence and review** | Nightly canary and archive (staging); persona and full-exchange tests | Public "How we test the coach" page from approved digests; reviewer recruitment |
| F | **Providers and hosting** | Venice default; Workers AI kept as a toggle | Registry; a self-hosted option (Apertus) only after a parity run |

## A and B in more detail
- **Model registry** (`src/lib/modelRegistry.ts`): id, family, total and active parameters, tuning (instruct or refusals removed), where it runs (Venice, Workers AI, local), attested or not, privacy mode, license, who tuned it, quantization. Providers (`coachProvider.ts`) read it; reports label runs from it.
- **Conformance suite**: the same cases for every registry entry: persona set, DarkBench sample, full-exchange briefs (with layers), the canary baseline. Results saved with the entry's metadata; one comparison report. The 2x2 (same base, different tuning; same family, different size) is the first use.
- **A compliance-pressure set**: invented messages that pass the pre-model stops but draw compliance a safer model would refuse (dosing, diagnosis, legal or financial advice, manipulation tactics, rule-dropping role-play). Pass criteria are authored and approved by the owner.
- **Layer reporting in full-exchange**: raw reply, guard events and final reply per turn, so adaptive conversations also say what the layers did.
- **On-device later**: a small quantized model downloaded once to the browser and cached; files served from a private-by-default R2 bucket made public-read for the model only; the Terms line that the site loads nothing from other sites changes first; a weaker class of signed transcript. Not started.

## Sequence and dependencies
1. **Now:** finish the six-model comparison; write the compliance-pressure set (needs the owner's criteria); registry.
2. **Lens P0 and P1** (decisions, vocabulary module): no code risk, unblocks wireframes.
3. **Wireframes** (lens P2), in parallel with 1.
4. **Full-exchange with layers** and the first conformance report.
5. **One Terms revision** when the lens copy is ready to go behind its switch (and anything else queued by then).
6. **Visual identity and sound** (lens P4, P5), after the wireframes are settled.
7. **Public review page** once there are a few weeks of reviewed canary digests.
8. **On-device and self-hosting** are separate scopes, started only after the conformance suite exists to judge them.

## Cross-cutting rules
Every change keeps `npm run check` green; each workstream ships dark behind a switch; no claim about a model, a number or a license goes public without the check that produced it (the registry records what was checked and when); nothing private enters the repository; the Terms, the pre-written answers, the About pages and the public files are changed together or not at all.

## Decisions for the owner
1. The open lens questions in `docs/lens-rewrite-scope.md` section 3 (hold one lens or several; what putting a lens down keeps; the report; the Terms date). The structure is decided: breathing as the entry, six lenses in the tray, the coach as a seventh held apart.
2. Who writes the compliance-pressure pass criteria (the owner; the AI can draft the messages).
3. Whether the registry is public in the repository (recommended: yes, with the checks recorded) or private.
4. The order of A and C if time is short (recommended: A first, because the model question is open and C waits on decisions anyway).
