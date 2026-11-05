# Coach method notes (private)

Longer guidance for the coach (for example how it reasons with nonviolent communication and ICARUS) is **not in this repo**. It lives in Netlify Blobs, store `coach-private`, key `method-notes`, and is added to the system instruction on each call. If the blob is empty or cannot be read, the function uses the `COACH_METHOD_NOTES` environment variable, and if that is empty too, the core instructions alone.

Limits: 12,000 characters are used; the rest is ignored. The notes are sent with every message, so shorter and distilled is better. The function re-reads them at most every five minutes, so a change takes effect without a redeploy.

## Upload or replace
With the Netlify CLI, linked to this site:

    netlify blobs:set coach-private method-notes --input path/to/notes.txt

Check what is stored:

    netlify blobs:get coach-private method-notes

Do not commit the notes file. Do not put transcripts, names, or caller details in it.

## Honesty note
Because part of the coach's instructions is private, the public pages say the *core* instructions are public and that method notes may be kept outside the code.

## Modular notes (preferred)
Instead of one long text, store JSON under key `modules` in the same store:

    { "core": "...always included...", "modules": { "reserves": "...", "legitimacy": "..." } }

`src/lib/coachModules.ts` (public) decides which modules, up to three, are added for a conversation by matching phrases in the person's own messages, in a fixed order of attention. When the conversation is in the "soften" tier (possible distress), only the core is added. If the `modules` key is absent or invalid, the function falls back to `method-notes`. Module ids must match the ids in `coachModules.ts`; unknown ids are never selected.

Upload (replace the path):

    netlify blobs:set coach-private modules --input path/to/modules.json

Nothing about the conversation is sent anywhere to choose modules, and the selection is not logged.

## Building the combined modules document
The private drafts (a lens set and a richer set of coaching-move modules with the coach's own wording as examples) are turned into the single `modules` document with:

    node scripts/build-module-set.mts --lens PATH/lens-draft.json --moves PATH/moves-draft.json --out PATH/combined.json

The script (see `src/lib/moduleSet.ts`) refuses to write a set where a module has no trigger in `coachModules.ts`, a trigger has no text, or the worst case for one reply is over the 12,000-character cap. Keep the drafts and the output outside the repository.

Which modules a reply gets: at most three, in this order of attention: one safety module, up to two lenses, then coaching moves, then one resource. A lens that applies holds back the moves that would pull against it (depleted reserves: no action-planning moves; deliberate harm: no perspective-taking toward the other party or skill-building). Soften-tier conversations still get the core only.

Before uploading to a preview site, check which site the CLI is linked to (`netlify status`). The repository's CLI is linked to production.

