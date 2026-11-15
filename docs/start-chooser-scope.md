# Start chooser: scope (decided and built behind a switch, 2026-11-15)

**The idea (owner):** a first screen that says what Nenya offers and asks where to start: breathing, reflection or the coach, with "Learn more" on each. Breathing leads to the rhythm picker, reflection to the gateways, the coach to the coach page. The coach page's own "Begin with a breath first?" stays.

## Today's first visit
1. "Welcome to Nenya: let's begin with your breath", with the rhythm picker (`OnboardingFlow`, step `rhythm`).
2. The Terms (`OnboardingFlow`, step `terms`).
3. "Would you like a quick tour?" (`TourOffer`).
4. A five-step spotlight tour (`WelcomeTutorial`): the logo, the counter, the top controls, the menu, the reflection button.
5. The front page, with Breathe, Reflect and Coach in the quick links (`QuickNav`).

A visitor who did not choose "Remember on this device" sees steps 1 and 2 on every visit (the Terms are asked each time).

## Proposed flow
1. **Start chooser** (new): what is here, and where to start. Breathing is listed first and marked as a gentle place to begin, but nothing is preselected or required.
2. **Terms** (unchanged). Agreeing comes after the visitor knows what they are agreeing to use.
3. **The path they chose:**
   - **Breathing:** the rhythm picker (today's step 1, without its "Welcome" heading), then the front page with the glow.
   - **Reflection:** the gateway chooser. The rhythm stays Steady and can be changed later from the counter.
   - **Coach:** the coach page, which already offers "Begin with a breath first?" and then the color choice.
4. **No automatic tour.** The chooser's "Learn more" does the orienting. The spotlight tour stays in the help menu for anyone who wants it.

A remembered visitor (Terms already agreed for this version) does not see the chooser again; they land where they do today. "Start over" in the help menu reopens it.

## Draft wording (for approval; held to the reading-level test)
- **Heading:** Welcome to Nenya
- **Line:** A private place to pause. Here is what you will find. Where would you like to start?
- **Breathing:** A minute of paced breathing, at a rhythm you choose.
  - *Learn more:* A glow and a counter breathe with you. You can change the rhythm any time, or turn the motion off. Many people start here.
- **Reflection:** Describe how you feel with color, sound, touch and more.
  - *Learn more:* Six short gateways, all optional, in any order. Pick one or all six. A summary is made on your device, to keep or to bring to someone you trust.
- **Coach:** A short conversation with an AI about feelings and needs.
  - *Learn more:* At most five exchanges, then it ends. It is an AI, not therapy, and not for emergencies. Open to connections in the United States for now.
- **Below the choices:** Not sure? Breathing is a gentle place to begin. · In danger or crisis? Call or text 988 (US and Canada).

## Decided (owner, 2026-11-15)
Chooser before the Terms; the automatic tour offer retired (the tour stays in the help menu); the choice counted as a plain daily total (Terms Section 13 updated); the coach shown everywhere with "Open in the United States for now". Built behind `VITE_START_CHOOSER=on`: `src/lib/startCopy.ts`, `OnboardingFlow` (`start` step), `App` (routing and counting), `src/lib/counters.ts` (`onboarding.start.*`), tests in `tests/start-chooser.test.mts`.

## The decisions as they were put
1. **Order:** chooser, then Terms (recommended: people know what they are agreeing to use), or Terms first?
2. **The tour:** retire the automatic offer and keep the tour in the help menu (recommended), or offer it after the breathing path only?
3. **Counting the choice:** a plain daily total of which start was chosen would show what people want, with nothing about who chose. It needs one line changed in the Terms (Section 13 counts "whether the tour is taken" today, which goes stale either way). Count it, or not?
4. **The coach option outside the US:** show it with "United States for now" (recommended: honest, and the coach page explains IP addresses), or hide it when the region check says no (needs the check before the chooser, one extra request)?

## Build plan (after the decisions)
1. `StartChooser` component: three options as large buttons, each with a native "Learn more" disclosure; heading focus; 44px targets; works with the motion off; wording in `src/lib/gatewayCopy.ts`-style constants under the reading-level test.
2. `OnboardingFlow`: a `choose` step before `terms`; the `rhythm` step only on the breathing path.
3. `App`: after Terms, route by the choice (front page, gateway chooser, or `/coach/`); no `TourOffer` (behind the switch).
4. Behind `VITE_START_CHOOSER=on`, on staging first, so the current flow stays on production until approved.
5. Terms and About updates if the tour offer goes or the choice is counted (archive, new effective date).
6. Tests: each path lands where it should; remembered visitors skip it; the tour stays reachable from help; wording reading level; no choice is preselected.

## Out of scope
The front page's own layout, the quick links, and the gateways themselves (the simpler gateways are separate work, starting with Touch).

## Part 2: one address per part of the site (owner, 2026-11-15; scope, not built)

**The idea:** the site divides into `/breath`, `/senses` and `/coach`. The front page with the breathing animation stays as it is and lives at `/breath`.

**Today:** the main app never changes the address except for `/about/...`. Every other path already loads the main app (Netlify's catch-all), always on the front page. `/coach` is its own page.

**Proposed map**

| Address | Shows | Notes |
|---|---|---|
| `/breath` | the front page with the breathing animation, as today | canonical address of the front page |
| `/` | the same front page; the address bar changes to `/breath` | every old link and home-screen icon keeps working |
| `/senses` | the gateway choice, then the gateways and the review | the whole reflection stays at `/senses` |
| `/coach` | the coach | the in-app coach after a reflection shows `/coach` too |
| `/about/...` | unchanged | |

- **Moving around:** each part gets a browser history entry, so Back and Forward move between Breath, Senses and Coach. Inside a reflection, Back keeps behaving as the app's own Back does now.
- **Reload:** a reflection lives only in the tab's memory (by design), so reloading `/senses` opens the gateway choice again, and reloading the in-app coach opens the standalone coach. Say so where it matters, and keep the existing warning before leaving with unsaved work.
- **First visit:** the start chooser appears at `/` and `/breath`. Arriving directly at `/senses` means reflection was chosen, so only the Terms are asked (as for an About link today). `/coach` keeps its own Terms step and "Begin with a breath first?".
- **Links to update:** the quick links (Breathe, Reflect, Coach), "Start with a reflection instead" on the coach (`/` to `/senses`), the coach's "Open the breathing tool" (`/` to `/breath`), the manifest's start address, the sitemap, canonical and Open Graph addresses, `llms.txt` and `about-nenya.html`.
- **Counting:** unchanged (screens are already counted by name).
- **Switch:** the same `VITE_START_CHOOSER`, since the chooser leads to these parts; one rollout.

**Decisions for the owner**
1. `/`: the same page with the address bar updated to `/breath` (recommended: no extra trip to the server, and nothing breaks), or a server redirect from `/` to `/breath`.
2. Gateways: everything at `/senses` (recommended: a reflection cannot be resumed from an address, because nothing is kept), or `/senses/touch` and so on, which would suggest a page you could return to.
3. The in-app coach after a reflection showing `/coach` (recommended: one address for the coach), or `/senses/coach`.
