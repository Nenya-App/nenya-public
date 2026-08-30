# Body Map Integration Spec

Status: **implemented 2026-08-30**, same session as the revision below.
Build and a full TypeScript type-check pass both clean. Kept for reference
on the final design and the reasoning behind it.

## History (context for future-me, don't re-litigate)

1. First pass (rejected): added a free-text "Where do you feel this in your
   body?" textarea independently to each non-Sight gateway page, disconnected
   from the real body map.
2. Feedback: the body map itself should be accessible from every gateway and
   accumulate information as the user goes — not six separate text boxes.
3. First revised spec (also more than needed): proposed per-gateway/per-state
   tagged markers with multiple dots per body part, color-coded by source
   gateway. User simplified this further — see below.

## Final design (this is the one to build)

**Body map stays exactly as it works today for color placement** — one
`ColorPlacement` per body part (`{ bodyPartId, color, colorName? }`,
unchanged shape, re-clicking a part still overwrites its color), open-ended
color palette (see "remove the paywall gate" below). No per-gateway tagging,
no multiple dots per part, no current/wish split on markers. That part of
today's rejected multi-dot design is dropped entirely.

**What's actually new:**

1. The body map (`BodyMapData` + its `BodyMapAvatar` UI) is lifted out of
   Sight-only data into shared state accessible from *every* gateway, so
   placements persist regardless of which gateways the user visits or in
   what order.
2. Each body part gets an **optional text note** — a simple annotation, not
   tied to any specific gateway. Any gateway's entry point opens the same
   map; clicking/expanding a body part reveals a small text field to add or
   edit that part's note. One note per body part (not one per gateway that
   touched it) — explicitly rejected the "complete each gateway per body
   section" idea as arduous and not worth building for a vanishingly
   unlikely usage pattern.
3. Remove the paywall/gating language around adding more than the initial 2
   colors (details below) — the color picker should just be open-ended, no
   upsell interruption.

## Step 0 — undo today's first (rejected) free-text attempt

Remove the standalone per-gateway textareas added earlier today — these are
superseded by the real body-map notes in Step 3 below.

1. Remove `currentBodyLocation`/`potentialBodyLocation` state, their two
   `Textarea` blocks, and the `sanitizePlainText(...)` calls in `handleNext`
   from all five gateway pages:
   - `src/app/components/pages/SoundGatewayPage.tsx`
   - `src/app/components/pages/TouchGatewayPage.tsx`
   - `src/app/components/pages/EssenceGatewayPage.tsx`
   - `src/app/components/pages/MovementGatewayPage.tsx`
   - `src/app/components/pages/InsightGatewayPage.tsx`
2. Remove the corresponding `Body sensation:` lines (current + potential,
   one pair per gateway case) from `formatGatewayData` in
   `src/app/components/pages/GatewayReviewPage.tsx`.
3. **Keep** `src/lib/textSanitize.ts` (the extracted `sanitizePlainText`
   helper) and keep `reportSubmission.ts` importing from it — still correct,
   and Step 3 below reuses it for body-part notes.
4. **Keep** the PDF line-wrapping fix in `nenyaPdfReport.ts`
   (`doc.splitTextToSize` on indented lines) — a real pre-existing bug
   (long `Description:` text could already overflow the page) independent
   of the body-map rework, and body-part notes will need it too.
5. `npm run build` clean before moving on.

## Step 1 — remove the color-picker paywall gate

In `src/app/components/BodyMapAvatar.tsx`, currently:

- `hasArchivistJournal` state gates adding more than the initial 2 colors
  (`userColors.color1`/`color2`).
- `handleAddColor()` opens a "Structured Integration" upsell modal
  (`showIntegrationModal`, the "Archivist's Journal" dialog, lines ~402–457)
  instead of adding a color, until that gate is toggled on.
- Two `Badge` elements advertise "Archivist's Journal" (header, ~line 205;
  "Add More Colors" button, ~line 321).

Remove all of it:

- Delete `hasArchivistJournal` and `showIntegrationModal` state.
- Delete both `Badge` elements referencing "Archivist's Journal".
- Simplify `handleAddColor()` to just generate and add a random color
  directly (the same logic currently buried in the modal's "Enable Journal"
  confirm handler and the post-gate branch of `handleAddColor` itself) —
  no gate, no modal.
- Delete the entire "Structured Integration Modal" `<Dialog>` block
  (~lines 402–457).

This doesn't touch the *concept* of an Archivist's Journal as a real planned
feature mentioned elsewhere in the app copy (e.g. the "fiscally sponsored
project of Fractured Atlas" framing already fixed in this file during
today's audit) — only removes the specific paywall gate blocking basic,
open-ended color selection on the body map, which is a UX regression the
map doesn't need.

## Step 2 — lift body map state out of Sight-only data

`BodyMapData` currently lives nested in `UserColors.bodyMap`, populated only
by the Sight gateway. Lift it to `App.tsx` as its own top-level state,
alongside `gatewayData`/`selectedGateways`:

```ts
const [bodyMapData, setBodyMapData] = useState<BodyMapData>({
  placements: [],
  notes: {},
});
```

Pass `bodyMapData` and an updater (`onUpdateBodyMap: (data: BodyMapData) => void`)
down to every gateway page as props, the same way `userColors` is already
threaded through all six today. This is the change that actually satisfies
"accessible within each gateway" — one shared map, not per-gateway data.

Sight's existing flow (open `BodyMapAvatar`, place colors, save) becomes
just one of six equivalent entry points into this same shared state, not a
special case.

## Step 3 — add per-body-part text notes to `BodyMapAvatar.tsx`

Extend the data shape (still in `BodyMapAvatar.tsx`):

```ts
export interface BodyMapData {
  placements: ColorPlacement[];   // unchanged
  notes: Record<string, string>;  // bodyPartId -> sanitized note text
  imageDataUrl?: string;
}
```

UI: make each body part clickable to expand/reveal a small note field (a
popover or an inline expand under the existing "Placed Colors" list is
simplest — reuse the list already rendered there rather than inventing new
layout). Typing stays unsanitized live (avoid cursor-jump), sanitize via
`sanitizePlainText` from `textSanitize.ts` on blur/save, matching the
pattern already used elsewhere in the app. Keep notes short — a single-line
input is enough, this isn't a journal entry.

`generateBodyMapImage()`'s canvas snapshot doesn't need to change — it's
still just the color placements; notes are text-only and render in the
review page / PDF as text, not baked into the image.

## Step 4 — entry point on every gateway page

Add a consistent "Open Body Map" button to all six gateway pages (Sight
included — replace its current Sight-specific "Body Map" button with the
same shared entry point). Reasonable placement: near the existing
Description/qualitative field on each page's `qualitative`/`selection` step
— same spot in the flow as today's (now-removed) free-text field, just a
different mechanism.

Opening it needs no gateway-specific context passed in anymore (no tagging,
per the simplified design) — it's just "open the shared map."

## Step 5 — review page + PDF: one shared body map section

Today, `GatewayReviewPage.tsx` and `nenyaPdfReport.ts` treat the body map as
Sight-specific (`gd.gateway === 'sight' && gd.data?.bodyMap?.imageDataUrl`).
Change to a standalone section, since the map is no longer owned by one
gateway:

- `GatewayReviewPage.tsx`: add a dedicated "Body Map" card (not nested under
  any one gateway's card) rendering the map image, plus a simple list of
  body parts that have a placement and/or note (reuse `getBodyPartLabel`).
- `nenyaPdfReport.ts`: same idea — one dedicated body-map section (after all
  gateway sections, before the footer), embedding `bodyMapData.imageDataUrl`,
  plus a text listing of parts with their notes (reuse the Step 0-kept
  `splitTextToSize` wrapping for any longer notes). Drop the old
  `hasBodyMap`/`gd.data.bodyMap` special-casing tied to the Sight case.
- `formatGatewayData`'s Sight case loses its
  `Body Map: N locations mapped` line — that information now lives in the
  dedicated section instead.

## Step 6 — build, verify, and browser-test

- `npm run build` after each step (data model, then `BodyMapAvatar.tsx`
  changes, then the six entry points, then review/PDF), not just at the end.
- Browser-verify with the *correct* dev server:
  `preview_start` with `{ name: "nenya-public-dev" }` (added to
  `~/Downloads/.claude/launch.json` this session) — **not** the plain
  `"nenya-dev"` entry, which points at a stale, unrelated project directory
  (`~/Desktop/nenya`). Sanity-check by confirming the gateway header reads
  current copy (e.g. "Sound · Audition", not "Sound · Sonesthesia") before
  testing anything else.
- Walk at least two gateways end-to-end: open the body map from one
  gateway, place a color and a note, navigate to a different gateway, open
  the map again and confirm both persisted, then check the review page's
  new body-map section and the downloaded PDF both show it correctly.
- Confirm the paywall gate is actually gone: adding a 3rd+ color should just
  work immediately with no modal interruption.
