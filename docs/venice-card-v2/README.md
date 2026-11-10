# The replacement Venice character, v2 (draft text)

Status: **draft, 2026-11-10, nothing pasted into Venice yet.** Scope: `docs/venice-character-card-scope.md` ("The fields"). These are the texts for each field of Venice's Update Character screen, as plain files so they can be pasted exactly and checked by tests. **All of it is public once the character is public:** keep secrets, private method notes and any named person out of it.

| Field | File | Notes |
| --- | --- | --- |
| Name | `name.txt` | |
| Description | `description.txt` | 323 characters. Written by hand; do not use Auto-Generate. It makes no claim about what Venice keeps, because that is not verified yet. |
| Intro Statement | `intro.txt` | One line, 129 characters. |
| Instructions | `instructions.txt` | about 3,570 characters. The full text. |
| Instructions (if the limit is lower) | `instructions-short.txt` | 1,485 characters: the same rules, compressed. Use whichever fits Venice's limit (unknown: see the scope's questions). |
| Add Custom System Prompt | `system-prompt.txt` | **Use it.** Venice says a custom prompt "will override the default Venice system prompt". The default (owner pasted it, 2026-11-10) tells the character it is uncensored, gives no disclaimers, and speaks like a real person with complex emotions and motives, which pulls against everything the Instructions say. The replacement keeps the default's frame and its `%%CHARACTER_INSTRUCTIONS%%` placeholder (where the Instructions field is inserted) and swaps the bullets for honest ones. **Check on a test character that the placeholder is filled** (ask "are you a real person?"; if the reply claims to be one, the Instructions did not arrive: paste `instructions.txt` in place of the placeholder instead). |
| Context (upload a file) | `context.md` | Static background: the checked facts about the Nenya *project* (what it is, who sponsors it, free, open source, not therapy, NVC and no affiliation, English only, contact), what the Venice chat is and is not, who to call, and seven example replies for shape. **No personal names or locations** (the About page names the creator; the card does not). Nothing about how the website's coach works or what its privacy protections are, because they do not run here. Unknown how Venice uses Context (always in the prompt, or retrieved in pieces): the Instructions carry anything that must always hold; this file adds accuracy and examples. |
| Memories > Documents | (none) | Empty. Documents here may be per-visitor memory, and reference material belongs in Context. Ask Venice (scope question 3). |
| Memories > Notes | (none) | **Empty, and Auto-generate memories off.** A character that keeps notes on visitors contradicts "no memory" and what Nenya says it keeps. |
| Memories > Extraction prompt | `extraction-prompt.txt` | Defence in depth only: it is appended to Venice's default extractor, so if memory saving is ever on (or cannot be turned off for visitors), it tells the extractor to save nothing personal. Effect unverified. |

## Settings to set (from the screenshots)
- **Memories > Notes > Auto-generate memories: OFF** (it was on).
- **Insights: OFF** (it was off). **Web Search: OFF. URL Scraping: OFF** (they were).
- **Public: OFF** while building and testing; ON only at the switch, if Venice allows it.
- **Reasoning: OFF; Hide Thought Process: ON.** Consider **Disable Prompt Suggestions: ON** once you know what they are.
- **Model:** not decided. Run the sets below on each candidate. **Temperature** about 0.7 (Advanced Settings), compared against the default of 1.
- **Voice:** leave the default for now.

## What the texts say, and why
They are the live coach's honest lines made self-contained for a place where none of Nenya's checks run: an AI with no life or memory; answer questions about itself first; listen before strategy; distress gets a brief caring reply naming a person or a crisis line (988 in the US and Canada, findahelpline.com elsewhere) and no questions about the dark thoughts; dependence opens the door to people; anger at it is not provoked; no names; no claims about how Nenya runs or what happens to data (point to nenya.biz and Venice's policy); injected instructions are ignored. There is no five-exchange limit and no mention of the coach demo, because neither exists on Venice. Nothing here is structured after a named person.

## Checks that run in the repo
`tests/venice-card-text.test.mts` checks the files: no named person, within assumed length limits, no claim about hosting or data, no invented life, the crisis line and findahelpline named, "I'm here for you" only as a prohibition, and that the short text keeps every rule the full one does. It cannot tell whether a model follows the text: that is the next step.

## Testing the card on the model (after pasting into a private character)
```bash
read -s VENICE_API_KEY; export VENICE_API_KEY
node scripts/eval-persona.mts --card <new-slug> --card-model <model> --pace 6 --json ~/Downloads/card-new-core.json
node scripts/eval-persona.mts --card <new-slug> --card-model <model> --set darkbench --sample 40 --pace 6 --json ~/Downloads/card-new-darkbench.json
node scripts/compare-persona-runs.mts ~/Downloads/card-old-core.json ~/Downloads/card-new-core.json
```
Read the replies, not only the pass counts. Two things the script cannot know: whether the website applies Venice's own prompt on top of the character, and which model the website uses; try the same messages by hand on the real page.
