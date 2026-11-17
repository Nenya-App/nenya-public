# 6. Working with the owner

The owner is the sole decision-maker and the only person who pushes, merges, sets production variables and approves visitor-facing wording. They work fast, in short messages, often mid-task. Match that: lead with the result or the recommendation, keep it plain, and ask one clear question when a decision is theirs.

## Always
- **Commit each finished, checked change yourself, one commit per change**, with a full message: a summary line, then what changed and why, what it was found by, what the tests cover, and any caveat. End with the attribution line your tooling asks for. The owner reads these messages (often to paste into a pull request).
- **Run `npm run check`** (typecheck, tests, build) before committing. Report the number passing. If something fails, say so, with the output.
- **Say what you did not check.** "Not run against the live site", "not rerun after this edit". The owner relies on it.
- **Recommend, then ask.** Offer a default ("I'd go with option 1"). The owner often replies "go with your recommendation".
- **Give runnable commands in their own code block**, one per block, for the owner's Terminal. Anything with a secret reads it with `read -rs` so it never appears in chat.
- **Conserve tokens when asked** (weekly limits): read only what you need, reuse results, avoid re-deriving settled decisions, keep replies short.
- **Update the docs a test demands** in the same change (production-env, README function table, scripts/README, data register, archive of the Terms).
- **Keep private things private** (file 1 and the companion).

## Never
- **Push, merge, amend or force-push.** (The tooling refuses a push anyway; the owner uses GitHub Desktop.)
- Put a secret, token or key in chat, a file, a commit or a URL; or send the owner's personal details to an outside service.
- Change production variables or deploy on your own initiative. Staging variables only when asked; production only on a clear instruction, and say exactly what was set.
- Change owner-approved wording (pre-written answers, safety notices, the Terms) without asking; show the draft first.
- Describe the coach or the site as doing something you have not read in the code.
- Add satire, jabs, names of people or organizations to criticize, hype, or a louder public voice.
- Say a site element is "not reviewed by a lawyer"; call the project "Nenya Project"; use the schwa outside the footer mark; flag the Tolkien codenames.
- Draft the owner's own writing for applications or grants (they write their answers; you may keep a facts list, privately).
- Run browser or visual checks "to be sure" after code changes (the owner has asked for build and type-check verification instead) unless a change is specifically visual and they ask for it.

## How decisions have gone (patterns, not rules)
- The owner prefers **fewer, calmer, plainer** over more features; "make it simpler" is usually right.
- Anything that touches **what a vulnerable visitor sees** is decided slowly and with exact wording; anything internal (tests, docs, tooling) moves fast.
- They like **evidence**: bake-offs, persona runs, drift flags, a measured number. Offer a measurement before an opinion.
- They want **legal and honest** framing: facts, no persuasion, no certainty you do not have (the harm-disclosure directions are the model).
- They value **stopping before overbuilding**: propose the smallest thing that answers the question, then extend.
- Corrections come plainly ("that's wrong"); take them without defending, fix, and record the lesson.

## Handy facts
- The test runner: `npm test` runs every `tests/*.test.mts`; a file crashing counts as a failure.
- Git: you work on `dev`; `main` is production. Check `git log origin/main..dev` to see what is not yet live.
- Netlify variable changes need a redeploy; `VITE_*` need the Builds scope.
- A short list of the owner's operational preferences is also kept in the AI's own memory files for Claude Code (`MEMORY.md`); other tools will not have it, so the companion repeats what matters.
