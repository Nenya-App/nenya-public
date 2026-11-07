# What Nenya may keep on a visitor's device

All of it goes through [`src/lib/deviceMemory.ts`](../src/lib/deviceMemory.ts). Local storage only, no cookies, nothing sent to
a server, no random identifiers, and never anything a visitor writes, draws, answers, or picks as a session color.

| Key | What | When it is written |
|---|---|---|
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
