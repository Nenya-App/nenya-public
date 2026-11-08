# What Nenya may keep on a visitor's device

All of it goes through [`src/lib/deviceMemory.ts`](../src/lib/deviceMemory.ts). Local storage only, no cookies, nothing sent to
a server, no random identifiers, and never anything a visitor writes, draws, answers, or picks as a session color.

| Key | What | When it is written |
|---|---|---|
| `nenya.coach.ownerToken` | The owner's secret token (only in the owner's own browser) | Never automatic; set from the console. Sent to the coach as a header to lift the per-connection limit while testing. Kept by Forget me, erased by Emergency Exit |
| `nenya.coach.rest` | Time a coach conversation ended | Automatically, when one ends (not after a crisis stop). Drives the 6-hour rest |
| `nenya.remember` | `1` | Only when the visitor turns on "Remember my settings on this device" |
| `nenya.prefs` | Theme, text size, animation and breathing choices (validated allow-list) | Only while `nenya.remember` is on |
| `nenya.terms` | The date of the terms the visitor agreed to | Only while `nenya.remember` is on; ignored if the terms date changes |
| `nenya.coach.owner` | `1` in the owner's own browser, to skip the rest while testing | Set by hand, see `docs/coach-testing.md` |

**Erasing it.** Turning the switch off removes `nenya.remember`, `nenya.prefs` and `nenya.terms`. "Forget me" (a button in the settings menu, and a link at the bottom of every page), after an "Are you sure?" step (Cancel is the first and default button, and Escape cancels),
removes every key starting with `nenya` except the owner flag, then **reloads the current page at its own path** (`forgetMeAndRestart` in `deviceMemory.ts`). The
agreement to the terms is one of the things erased, so the page asks for it again, the coach's rest is gone, and nothing entered in that visit survives. Emergency Exit removes all of them,
including the owner flag, before leaving the page.

**Adding something new.** Put it in `deviceMemory.ts` (add it to the `Prefs` validator if it is a display setting), list it here
and in policy Section 19, and keep it out of anything derived from what a visitor wrote.


## Emergency Exit and the Back button

Emergency Exit erases everything above, then *replaces* the current page with a neutral one (no new history entry). Earlier Nenya pages in the same tab would still be in the Back list, so the exit also leaves one note, `nenya.exited`, in that tab's **session storage** (this tab only; gone when the tab closes). Any Nenya page reached by Back or Forward, or restored from the browser's page cache, finds the note and leaves again before drawing anything. A page opened any other way (typed address, link, reload) is a fresh visit and clears the note. Nothing is written to the device's permanent storage. A browser will always let a person go back to whatever page they were on *before* Nenya; that cannot be, and should not be, blocked. See `src/lib/emergencyExit.ts`.

The Exit button is pinned above every overlay (loading screen, first-visit rhythm and terms panel, tour offer, tour) and is first in the page, so keyboard and screen-reader users meet it first.

## The coach's quiet timeout

The person picks 10, 15 or 20 minutes of quiet, or "Leave open", before starting, and can change it in the chat. It lives only in the page's memory (nothing stored or sent). Warnings come with five minutes and one minute left, and say a copy can be saved first; closing does not count as a finished conversation (no rest is set). The choices stop at 20 minutes because the server's ticket lasts 30 minutes, so a signed copy can still be made just after closing. "Leave open" never closes the page's conversation but reminds the person at 20 minutes that the coach can only continue one that had a message in the last 30. See `src/lib/chatTimeout.ts`.


## Breathing tones
`breathingTones` is one more saved display setting (off by default; saved only while "Remember on this device" is on; erased by "Forget me" and Emergency Exit). It is shared by three switches, so it lives in `src/lib/deviceMemory.ts`. Nothing about it is counted or sent.

`breathingSound` (harp, bowls, chord or scale; harp by default) is the style the tones are played in, kept and erased the same way.
