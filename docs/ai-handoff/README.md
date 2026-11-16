# Handing Nenya to a new AI instance (2026-11-16)

Start here. This folder is for an AI model (or a person) picking up work on Nenya with no memory of earlier sessions. It explains **what Nenya is for, how it is built, how it is designed, how its coach is kept honest, and how to work with its owner**. It does not repeat the rest of `docs/`: it points to it.

Read in this order. About forty minutes.

| # | File | What it gives you |
|---|---|---|
| 1 | [01-philosophy.md](01-philosophy.md) | Why Nenya exists, what it refuses to be, the rules that decide hard cases |
| 2 | [02-architecture.md](02-architecture.md) | The stack, the functions, the stores, the switches, how a change ships |
| 3 | [03-coach.md](03-coach.md) | The coach: the pipeline, the guards, instructions, providers, the tests that keep it honest |
| 4 | [04-design.md](04-design.md) | The visual and interaction language, accessibility (WCAG 2.2 AAA), copy, names |
| 5 | [05-safety-legal-data.md](05-safety-legal-data.md) | Crisis and harm handling, the Terms, the data register, what must never happen |
| 6 | [06-working-with-the-owner.md](06-working-with-the-owner.md) | How the owner works, what they have decided, what to do and never do |
| 7 | [07-state-2026-11-16.md](07-state-2026-11-16.md) | Where things stand today, what runs overnight, open decisions |

**Two kinds of documents.** These files are public-safe: the repository is public (AGPL-3.0). There is also a **private companion** that lives outside the repository (the owner holds it: `~/Downloads/Nenya (private)/ai-handoff-private.md`): private framework sources, a pending application, one person's permission, and private file locations. Never copy anything from the companion into the repository, a commit message, or a request to an outside service.

**The five rules that matter most** (details in file 6):
1. Never push, merge, amend or force-push. The owner pushes; you commit each finished, checked change yourself, with a full message.
2. No secrets in chat, files or commits. The owner sets tokens in their own Terminal.
3. Do not say the coach (or the site) does something you have not checked in the code.
4. The coach must never pretend to be a person, promise to remember, or stand in for people or a professional.
5. When unsure and the action is outward-facing or hard to undo, ask first.

**Commands.** `npm run check` (typecheck, all tests, build) before every commit. `node tests/<file>.test.mts` runs one test file. The suite had 3,166 passing tests on 2026-11-16.
