# Scoping: building the coach's modules

Status: scoping. Nothing here is built. This file describes structure only; no private text, source names or
episode details belong in it.

## What the modules are for

The coach is a general model. What makes it Nenya is what it is given: its instructions, the right teaching
content for what the person raised, and good ways to answer. Modules are that content, chosen by public phrase
matching (see `src/lib/coachModules.ts`) and added to the instruction for one reply. They are written for the
model first. Later, the same material gets a human-readable form so the site can show the person what the coach
is drawing on, with credit and links to outside help.

## Four kinds of module

| Kind | What it holds | Audience now | Public later? |
|---|---|---|---|
| **Skill** | A usable skill or piece of teaching: slowing down anxiety, naming a feeling and need, making a request, setting a boundary, repairing after conflict. Plain explanation, two to four steps, short example wording, what not to say. | The coach | Yes, as the educational documents |
| **Lens** | The framework's diagnostic reading of a pattern (the existing ICARUS-based modules): what is probably going on and what to avoid. | The coach only | Not until the instruments are validated (see the dropped Check-in). The coach never shows scores or labels. |
| **Shape** | How to answer a type of message: a direct question, a request for a script, a vent, a hand-off. Order of moves and length. | The coach | Yes |
| **Resource** | A vetted outside place to send the person: crisis lines, books, courses, podcasts. Link-out only, credited. | The coach and the page | Yes, with the owner's agreement |

## One record per module

```
id, kind, title, version, status (draft | reviewed | approved), visibility (private | public)
summary            one plain sentence for people
when_to_use        the situations it fits (the phrase patterns live in the public code)
when_not_to_use    including anything that should go to a person or a crisis line instead
guidance           the text the model reads: short, imperative, plain; no jargon, no labels
steps              for skill modules: two to four things the person can try
examples           short paraphrased phrasings, never quotes from a real call
credits            who the idea or wording comes from (required wherever it applies)
resources          ids of resource modules to offer
provenance         private note of the source material (never published)
review             who reviewed it and when
```

`visibility` is a flag, so a module can be written now and published later without being rewritten.

## Budget

- The model reads at most about 12,000 characters of notes (the function's cap). A 7B model also loses track of
  long notes, so aim for roughly 2,500 characters per reply: the core, at most one shape, and at most two modules.
- One module: about 300 to 700 characters of `guidance`. A skill with steps and examples may be longer in its human
  form; the model-facing form stays short.

## Provenance and rights

- Nothing is quoted from a real call. Examples are paraphrased and invented to illustrate. No names, places or
  identifying detail; no episode numbers or titles in anything public.
- Anything derived from the coaching material is private until the person it came from has agreed to its
  publication. `visibility: private` is the default for it.
- Feelings and needs word lists belong to their authors and must be credited wherever shown.
- Outside resources are added only with the owner's agreement where one is needed, and linked to, not copied.

## Pipeline

1. **Frameworks to modules.** Map each ICARUS variable and the bottleneck order to lens modules (the existing
   draft set is the starting point) and to plain-language skill modules ("what this feels like" and "what helps").
2. **Transcripts to technique cards.** From the distilled playbook and the anonymized calls, extract techniques
   (what the coach did, in what order, with what wording style), then write them fresh as skill and shape modules.
3. **Review.** Every module is read for tone, accuracy, reading level and safety limits before `reviewed`.
4. **Tests.** A private evaluation set (a direct question, a vent, a request for a script, injection, another
   language) is run for each module against each model. A small synthetic set stays in the repo so the selection
   logic and size limits are tested in CI.
5. **Store.** Modules go in the private store as a versioned document now. Public ones can move into the repo
   or a public store when cleared.

## Matching

Today's triggers match lens topics only. Skill and shape modules need their own triggers: topics (anxiety,
overwhelm, anger, conflict, grief, loneliness, motivation), intents (a direct question, a request for words to
say) and hand-offs. The patterns stay in the public code so the selection can be read and tested; only the wording
of private modules stays out of it.

## Candidate first batch (to confirm)

Skill: calming an anxious body quickly; overwhelm and next smallest step; naming the feeling and need; saying a
hard thing (observation, feeling, need, request); making a request; setting a boundary; repairing after a
conflict; sitting with grief or loss; loneliness; low energy and getting started.
Shape: answering a direct question; giving a script; staying with a vent; closing a conversation.
Resource: crisis lines (by region), CNVC materials, the podcast, other vetted places.

## What I need to proceed

1. Which framework documents are current and which parts the coach may draw on.
2. Whether I may read the anonymized dataset in this session (read-only, never the id map, nothing copied into the
   repo), and where it now lives.
3. The first topics and the order.
4. The resource list, with what you can name publicly.
5. Who reviews the wording, and the reading level to aim for.
6. Whether the existing draft modules are current and whether they are what staging uses now.
