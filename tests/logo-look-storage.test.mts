// The logo look is kept like every other setting: only while "Remember on this device" is on, and a hand-edited value is dropped.
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
};
(globalThis as any).window ??= { addEventListener() {}, removeEventListener() {} };
const { ok } = await import('./helpers.mts');
const M = await import('../src/lib/deviceMemory.ts');

M.setGemSidesChoice(8);
ok('nothing is stored while Remember is off', !('nenya.prefs' in store));
ok('the choice still applies for the visit', M.getGemSidesChoice() === 8);
M.setRemembering(true);
M.setGemSidesChoice(10);
M.setLogoLeaves(12);
const saved = JSON.parse(store['nenya.prefs']);
ok('with Remember on, both choices are stored', saved.gemSides === 10 && saved.logoLeaves === 12);
ok('and read back', M.loadPrefs().gemSides === 10 && M.loadPrefs().logoLeaves === 12);
store['nenya.prefs'] = JSON.stringify({ gemSides: 7, logoLeaves: 13 });
ok('values that are not presets are dropped when read', M.loadPrefs().gemSides === undefined && M.loadPrefs().logoLeaves === undefined);
store['nenya.prefs'] = JSON.stringify({ gemSides: 'match', logoLeaves: 8 });
ok("'match' and a preset leaf count are accepted", M.loadPrefs().gemSides === 'match' && M.loadPrefs().logoLeaves === 8);
M.setGemSidesChoice(9);
ok('a value set in code snaps to a preset', [6, 8, 10].includes(M.getGemSidesChoice() as number));
