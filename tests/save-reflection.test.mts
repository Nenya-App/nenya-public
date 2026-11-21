// "Save and return later" (owner, 2026-11-15; docs/save-and-return-scope.md): on this device only, encrypted under the session ID and a simple
// passcode, 24 hours, ID never stored, a wrong pair and "nothing saved" answer alike, erased by Forget me and Emergency Exit.
import { readFileSync } from 'node:fs';
// A small localStorage for Node.
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
const { SAVED_KEY, deleteSaved, normalizeId, openReflection, purgeExpired, saveReflection, sessionIdFrom, shadowId } = await import('../src/lib/savedReflection.ts');
const { wipeDevice } = await import('../src/lib/deviceMemory.ts');
const { gradeLevel } = await import('../src/lib/readingLevel.ts');
const { saveCopyLines, SAVE_COPY } = await import('../src/lib/saveCopy.ts');
import { ok } from './helpers.mts';

const payload = { v: 1 as const, selectedGateways: ['touch', 'sight'], gatewayData: [{ gateway: 'touch', data: { currentSurface: 'silk', currentDescription: 'tight chest' } }], bodyMapData: { placements: [], notes: {} }, interfaceColors: { color1: '#7a9b9e', color2: '#dac682' } };
const ID = '#7a9b9e.#dac682';
const t0 = Date.UTC(2026, 10, 15, 12);

ok('the session ID is the two colors, lower case, with #', sessionIdFrom('#7A9B9E', 'DAC682') === ID && sessionIdFrom('#12345', '#dac682') === null);
ok('a shadow ID is two random colors in the same form', /^#[0-9a-f]{6}\.#[0-9a-f]{6}$/.test(shadowId()) && shadowId() !== shadowId());
ok('the ID is accepted as typed or pasted', [ID, '7a9b9e.dac682', '#7A9B9E #DAC682', '7a9b9e, dac682', ' #7a9b9e/#dac682 '].every((x) => normalizeId(x) === ID) && normalizeId('#7a9b9e') === null);

mem.clear();
ok('saving with the ID and "watermelon" works', (await saveReflection(payload, ID, 'watermelon', t0)) === 'saved');
const stored = mem.get(SAVED_KEY)!;
ok('the stored copy is sealed: no answers, no colors, no ID, no passcode in it', !/silk|tight chest|7a9b9e|dac682|watermelon|touch/i.test(stored) && /"ct":/.test(stored));
ok('it expires 24 hours after saving', JSON.parse(stored).expiresAt === t0 + 24 * 3600 * 1000);
ok('the wrong passcode opens nothing and leaves the save in place', (await openReflection(ID, 'melon', t0 + 1000)) === null && mem.has(SAVED_KEY));
ok('the wrong ID opens nothing', (await openReflection('#7a9b9e.#dac683', 'watermelon', t0 + 1000)) === null);
const back = await openReflection('7A9B9E DAC682', 'watermelon', t0 + 2000);
ok('the right pair (typed loosely) opens it, exactly as saved', JSON.stringify(back) === JSON.stringify(payload));
ok('opening removes the saved copy', !mem.has(SAVED_KEY));
ok('after that, the same pair gets the same answer as a wrong one', (await openReflection(ID, 'watermelon', t0 + 3000)) === null);

mem.clear();
await saveReflection(payload, ID, 'watermelon', t0);
ok('just before 24 hours it still opens', (await openReflection(ID, 'watermelon', t0 + 24 * 3600 * 1000 - 1)) !== null);
await saveReflection(payload, ID, 'watermelon', t0);
purgeExpired(t0 + 24 * 3600 * 1000);
ok('at 24 hours it is erased on the next visit, before anyone could try', !mem.has(SAVED_KEY));
await saveReflection(payload, ID, 'watermelon', t0);
deleteSaved();
ok('"Delete it" erases it', !mem.has(SAVED_KEY));
await saveReflection(payload, ID, 'watermelon', t0);
wipeDevice({ keepOwner: true });
ok('Forget me erases it', !mem.has(SAVED_KEY));
await saveReflection(payload, ID, 'watermelon', t0);
wipeDevice({ keepOwner: false });
ok('Emergency Exit erases it', !mem.has(SAVED_KEY));
ok('an empty passcode or a malformed ID does not save', (await saveReflection(payload, ID, '', t0)) === 'invalid' && (await saveReflection(payload, 'not-an-id', 'x', t0)) === 'invalid');

const lib = readFileSync('src/lib/savedReflection.ts', 'utf8');
ok('it never sends anything', !/fetch\(|XMLHttpRequest|sendBeacon/.test(lib));
const ui = readFileSync('src/app/components/SaveReflection.tsx', 'utf8');
ok('password managers can keep both: a username field holding the ID and a password field', /name="username" type="text" autoComplete="username"/.test(ui) && /autoComplete="new-password"/.test(ui) && /autoComplete="current-password"/.test(ui) && !/onPaste/.test(ui));
ok('the passcode can be shown, and every control is 44px', /SAVE_COPY\.show/.test(ui) && (ui.match(/min-h-11/g) ?? []).length >= 8);
ok('"Continue" is shown whenever saving is on, whatever is saved, and a miss says the same thing every time', /if \(!api\?\.on\) return null;/.test(ui) && /SAVE_COPY\.notFound/.test(ui) && !/purgeExpired|localStorage/.test(ui));
const worst = saveCopyLines().map((l) => ({ l, g: gradeLevel(l) })).sort((a, b) => b.g - a.g)[0];
ok('every line reads at grade 8 or below', worst.g <= 8, `${worst.g.toFixed(1)}: ${worst.l}`);
ok('the panel states the limits plainly', /stops a glance/.test(SAVE_COPY.limits) && /no other way back in/.test(SAVE_COPY.saved) && /Nothing is sent to Nenya/.test(SAVE_COPY.intro));

const app = readFileSync('src/app/App.tsx', 'utf8');
ok('the ID comes from Sight, then Sound, then a shadow pair; it is never stored', /sessionIdFor\(sightDone, soundDone, shadow\)/.test(app) && /sessionIdFrom\(sight\.color1, sight\.color2\)\) \|\|\s*\(sound && sessionIdFrom\(sound\.melodyColor1, sound\.melodyColor2\)\) \|\|\s*shadow/.test(readFileSync('src/lib/shadowSession.ts', 'utf8')) && !/localStorage[^\n]*sessionId/.test(app));
ok('an expired save is cleared on every visit; an opened one resumes at the next unfinished gateway or the review', /if \(saveOn\) purgeExpired\(\);/.test(app) && /navigateTo\(next \?\? 'gateway-review'\)/.test(app));
ok('the links sit in every gateway header, on the review, and "Continue" on the gateway choice', /<SaveReflectionLink \/>/.test(readFileSync('src/app/components/GatewayProgress.tsx', 'utf8')) && /<SaveReflectionLink \/>/.test(readFileSync('src/app/components/pages/GatewayReviewPage.tsx', 'utf8')) && /<ContinueSavedLink \/>/.test(readFileSync('src/app/components/pages/GatewaysPage.tsx', 'utf8')));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const t = JSON.stringify(LEGAL_PARTS);
  ok('the Terms describe it: your choice, this device, encrypted, 24 hours, ID and passcode not stored, erased by Forget me and Emergency Exit, its limits', /Save and return later/.test(t) && /for at most 24 hours/.test(t) && /Neither the ID nor the passcode is stored/.test(t) && /Forget me and Emergency Exit/.test(t) && /stops a glance/.test(t) && /storage tools can see that something locked is saved/.test(t));
}

// Version 2 (tray mode, VITE_LENS_TRAY): the added lenses plus the ones opened but not added. Version 1 still opens, and the reader gives either one back in the tray's shape.
{
  const { readSavedDraft } = await import('../src/lib/lensState.ts');
  const v2 = { ...payload, v: 2 as const, selectedGateways: ['touch'], examined: ['sight', 'sound'] };
  mem.clear();
  await saveReflection(v2, ID, 'watermelon', t0);
  const open2 = await openReflection(ID, 'watermelon', t0 + 1000);
  ok('a version 2 draft is sealed like version 1 and opens exactly as saved', JSON.stringify(open2) === JSON.stringify(v2) && !mem.has(SAVED_KEY));
  ok('the sealed copy does not show which lenses were examined', (await saveReflection(v2, ID, 'watermelon', t0), !/sight|sound|examined/i.test(mem.get(SAVED_KEY)!)));
  const d2 = readSavedDraft(open2)!;
  ok('the tray reads version 2: touch is added, sight and sound are examined', d2.gatewayData.map((g) => g.gateway).join() === 'touch' && d2.examined.join() === 'sight,sound');
  mem.clear();
  await saveReflection(payload, ID, 'watermelon', t0);
  const d1 = readSavedDraft(await openReflection(ID, 'watermelon', t0 + 1000))!;
  ok('a version 1 draft still opens in the tray: its lenses are added, none is examined', d1.gatewayData.length === 1 && d1.examined.length === 0);
  mem.clear();
  await saveReflection({ ...payload, v: 3 as any }, ID, 'watermelon', t0);
  ok('an unknown version opens nothing', (await openReflection(ID, 'watermelon', t0 + 1000)) === null);
  const app = readFileSync('src/app/App.tsx', 'utf8');
  ok('App writes version 2 only in tray mode (version 1 otherwise) and opens a draft at the tray', /lensTrayOn\(\)\s*\n\s*\? \{ v: 2, selectedGateways: gatewayData\.map/.test(app) && /: \{ v: 1, selectedGateways, gatewayData/.test(app) && /const draft = readSavedDraft\(saved\);/.test(app) && /setExamined\(draft\.examined\);/.test(app));
}
