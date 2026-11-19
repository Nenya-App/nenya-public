# How Nenya was made, and how much of it is AI

Nenya is written by one person, Estëlle, working with AI. Most of the code and a large share of the written text were drafted, and then redrafted many times, by AI models. That is a large part of why the project is open source: so anyone can see how it was made and check it.

## What the AI did
- **Code.** AI wrote most of the code in this repository, including the website, the server functions, the tests and the scripts, working inside Claude Code.
- **Text.** AI drafted and revised large parts of the written material: documentation, scoping notes, wireframe notes, and many of the words visitors read. Some of it was redrafted many times.
- **The coach's instructions.** The instructions and guidance modules that shape the coach (`docs/coach-instructions-v2.1.md` and the modules) were drafted by AI too, from the patterns and the rules the owner set, then revised by the owner's direction. They were not hand-written.
- **Review and testing.** AI also helped test: it wrote and ran tests, ran automated checks, and ran simulated conversations against the coach (the troll arena in `docs/troll-arena.md`).

## What the person did
Estëlle chose what to build and what not to build, set the rules the code and text follow (privacy, safety, plain language, accessibility), decided what each change should say and do, and approved what went live.

## Where to see it
Most commits carry a co-author line naming the model that worked on them (for example "Co-Authored-By: Claude Sonnet 5.5"). Of this repository's commits at the time of writing, about 550 of 686 do. Commits without that line were made by the owner or by other tools. `git log` shows which.

## Which models
- **Making the code and text:** Anthropic's Claude models (Sonnet and Opus), through Claude Code. Some public brand materials were drafted with Venice AI models, and the commit history and documents say where.
- **Inside the product:** the optional coach runs on a hosted open-weights language model, Gemma 4 26B, through Venice AI (Cloudflare Workers AI is the built-in alternative). The coach is an AI and says so. The breathing and reflection tools contain no AI.

## Where the ideas came from
The coach's guidance draws on relational coaching patterns identified from publicly available material. The source credit is in [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md). The guidance was drafted fresh with AI; it is not copied from any recording or transcript.

## What this does not mean
AI involvement does not make anything here medical advice or therapy, and no AI company reviews or endorses Nenya. If you find a mistake, please say so (see `CONTRIBUTING.md`).

## Applications and grants
Where a funder's rules require the applicant's own words, those answers are the applicant's own.
