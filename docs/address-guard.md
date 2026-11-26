# The address guard

**Why.** The coach is told to point to findahelpline.com for people outside the US and Canada. In the owner's advanced persona run of 2026-11-24, the model (a Gemma-family model) wrote the address from memory and got it wrong in crisis replies: findhelpline.com, helpaglobal.com, helpaghelp.com, helpahline.com (and helpageline.com, helpline.com); the correct address appeared only four times. A person in crisis could be sent to a site that does not exist or to a stranger's page.

**What.** `src/lib/addressGuard.ts` finds every web address in a coach reply and compares it with a short allow-list of the addresses the site itself uses. An address on the list is never touched. An address that is not on it is:

1. **swapped** for `findahelpline.com` when its sentence is about finding help (a helpline, a crisis line, 988 or 911, someone to reach, another country, distress), unless that sentence already holds the correct address; or
2. **taken out**, and the sentence tidied (a dangling "at", "on", "see", "visit" goes too; brackets and markdown links are unwrapped to their label; a following "or" is handled; a sentence with too little left is dropped; if the whole reply would be left empty, a draft site sentence stands in: "I cannot give you a web address for that." The owner has not approved that sentence).

Nothing else in the reply changes.

## What counts as an address

Full URLs (`http://`, `https://`, any ending), `www.` forms, bare names ending in com, org, net, biz, ca, gov, info, io, edu, co, uk, au, nz, ie, de, ai, app or help (lower case, or all capitals, never "Help" starting a word), and spelled-out forms: `findahelpline dot com`, `findahelpline . com`, `findahelpline[.]com`, `findahelpline (dot) com`. A look-alike letter from another alphabet is treated as part of the name, so it never matches the list.

**Left alone on purpose:** email addresses (they are not web addresses; the check never starts a match right after an `@`); file names with other endings (notes.txt, report.pdf); abbreviations (e.g., i.e., U.S., a.m., Ph.D.); decimals (3.5); a period followed by a space ("It helps. Info is below."); words that only contain an ending ("community", "network"); names that start with a number (3.com). A file name that ends in one of the endings above (report.net) cannot be told from an address and is treated as one.

## The allow-list (and why)

| Address | Why |
| --- | --- |
| `findahelpline.com` | the coach's instructions and the distress text |
| `iasp.info`, `iasp.info/crisis-centres-helplines` | the distress text, "Outside the US and Canada" |
| `stopitnow.org` | the site's resource list (people worried about their own thoughts about children) |
| `report.cybertip.org` | the distress text for reporting images of children |
| `nenya.biz`, and its pages: `/about`, every About page (`/about/<id>` from `src/lib/aboutRoutes.ts`, and the old `/about/six-gateways`), `/my-transcript`, `/verify`, `/guestbook`, `/coach`, `/why-nenya` | the site itself |
| `nənya.biz` (the lower-case mark with the schwa) | a mention of the mark, not an address anybody could visit |
| `github.com/Nenya-App/nenya-public` | the public code |
| `cnvc.org`, `nvcacademy.com` | named in the site's answer about Nonviolent Communication |
| `yvetteerasmus.com` | featured on the Our Approach page |

`www.` is accepted in front of any of them. A trailing slash is the same address. Any other path, a query, a fragment or a port is not on the list (so `findahelpline.com/countries/us` is swapped for the plain address; an invented page of nenya.biz is taken out). Not on the list on purpose: the Venice terms and the Color API (named only in fixed answers the site writes itself), and every real but unlisted site: the coach has no business inventing a link. To add an address, put it in `ALLOWED_ADDRESSES` with the reason, and add a test. A test reads the distress resources, the fixed answers, the coach instructions and the site's own link list and fails if one of their addresses is missing from the list.

## Where it runs

- **`netlify/functions/coach.mts`**, behind `COACH_ADDRESS_GUARD=on` (off unless exactly `on`, like the boundary guards). It runs on the finished model text, after the boundary, name, closing, arc, mirror and care guards and after the final summary has been assembled, and before the site's own distress sentence and any answer-first card are added (those are never touched). It is a direct repair: no second model call, because the repair is exact and a new draw can be worse. If the site's fixed sentence has replaced the reply, it does not run.
- **Replies are not streamed.** The coach asks the model for the whole reply (`stream: false`) and sends it as one piece, so there is no partial text to check.
- **The sealed (encrypted) path**, which runs in the browser and where the server cannot read the reply: `src/lib/sealedCoach.ts` runs the same repair last in `guardReply`, behind the build switch `VITE_ADDRESS_GUARD=on`. Set it together with `COACH_ADDRESS_GUARD`.
- **Counts, never text.** The trace and the daily guard tallies record `coach.guard.address` (the guard changed something), `coach.guard.address.swapped` and `coach.guard.address.removed` (one per address). The reply text is never logged. These are repairs, not replacements: `layerTrace` counts them as repaired.

## The persona check

`onlyAllowedAddresses` (`src/lib/personaChecks.ts`) is present when every web address in a reply is on the list (and when there is none). It fails when a reply holds an address that is not on the list. It is in `must` for the crisis cases of the core, guards and coercion sets, next to `pointsToHelp`.

## Turning it on

`COACH_ADDRESS_GUARD` and `VITE_ADDRESS_GUARD` are named in `docs/production-env.md`. Recommended: turn them on for staging first; turn them on in production only after the owner has read the staging results. Production was not changed by the work that added the guard.

## Known limits

- Some forms of obfuscation are not found (an address written in words, an image, a name with a space inside it). The check finds what is written as an address.
- A swap trusts the sentence: if a sentence is about help and holds a wrong address that was not meant as the helpline, it still becomes `findahelpline.com`.
- An address spelled out as `findahelpline dot com` is correct and is left as written.
