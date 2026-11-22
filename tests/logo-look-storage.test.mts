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

// The outer glow settings are stored like the others.
store['nenya.prefs'] = JSON.stringify({ orbHalo: 'random', orbHaloWidth: 7, orbHaloSeed: 99 });
ok('a stored glow style, width and seed are read back', M.loadPrefs().orbHalo === 'random' && M.loadPrefs().orbHaloWidth === 7 && M.loadPrefs().orbHaloSeed === 99);
store['nenya.prefs'] = JSON.stringify({ orbHalo: 'neon', orbHaloWidth: 6, orbHaloSeed: 1.5 });
ok('values that are not offered are dropped when read', M.loadPrefs().orbHalo === undefined && M.loadPrefs().orbHaloWidth === undefined && M.loadPrefs().orbHaloSeed === undefined);
M.setOrbHaloWidth(6);
ok('a width set in code snaps to a preset', [3.4, 5, 7].includes(M.getOrbHaloWidth()));
M.setOrbHaloStyle('palette');
ok('a style set in code is kept', M.getOrbHaloStyle() === 'palette');

// The preview size is a percentage, stored like the other display settings; an older size in pixels is converted.
store['nenya.prefs'] = JSON.stringify({ previewPercent: 150 });
ok('a stored preview percentage is read back', M.loadPrefs().previewPercent === 150);
store['nenya.prefs'] = JSON.stringify({ previewPercent: 5000 });
ok('a preview percentage outside the limits is dropped', M.loadPrefs().previewPercent === undefined);
M.setBreathPreviewPercent(133);
ok('a percentage set in code snaps to a step', M.getBreathPreviewPercent() === 130 && JSON.parse(store['nenya.prefs']).previewPercent === 130);
ok('the older pixel key is not written any more', JSON.parse(store['nenya.prefs']).previewSize === undefined);
store['nenya.prefs'] = JSON.stringify({ previewSize: 300 });
ok('an older stored size in pixels is still accepted when read', M.loadPrefs().previewSize === 300 && M.loadPrefs().previewPercent === undefined);

// The leaves' sway and the colour choices: off and original unless chosen; only the choice is kept; a hand-edited value is dropped.
const K = await import('../src/lib/keptPalettes.ts');
ok('before anything is chosen: sway on and the Night colours (the owner\'s defaults, 2026-11-22)', M.getLeafSway() === true && M.getBreathColourChoice() === 'preset:night' && M.getOrbColourChoice() === 'preset:night');
M.setLeafSway(true);
M.setBreathColourChoice('preset:cool');
M.setOrbColourChoice('palette:Tide');
const lookSaved = JSON.parse(store['nenya.prefs']);
ok('with Remember on, the sway and both colour choices are stored (the choice only, no colours)', lookSaved.leafSway === true && lookSaved.breathColours === 'preset:cool' && lookSaved.orbColours === 'palette:Tide' && !JSON.stringify(lookSaved).includes('#'));
ok('and read back', M.loadPrefs().leafSway === true && M.loadPrefs().breathColours === 'preset:cool' && M.loadPrefs().orbColours === 'palette:Tide');
store['nenya.prefs'] = JSON.stringify({ leafSway: 'yes', breathColours: 'neon', orbColours: 'palette:Nobody' });
ok('values that are not offered are dropped when read', M.loadPrefs().leafSway === undefined && M.loadPrefs().breathColours === undefined && M.loadPrefs().orbColours === undefined);
store['nenya.prefs'] = JSON.stringify({ breathColours: 'mine-both', orbColours: 'mine-2' });
ok('a saved-palette choice is accepted as a choice (whether it can be used depends on the palettes kept in this visit)', M.loadPrefs().breathColours === 'mine-both' && M.loadPrefs().orbColours === 'mine-2');
M.setOrbColourChoice('not a choice');
ok('a choice set in code that is not offered becomes the original', M.getOrbColourChoice() === 'original');
K.setKeptPalettes([{ colors: [{ hex: '#112233' }, { hex: '#445566' }] }]);
ok('a kept palette is held for the visit, and was not written to the device', K.getKeptPalettes().length === 1 && !Object.values(store).some((v) => v.includes('112233')));
M.wipeDevice({ keepOwner: true });
ok('"Forget me" clears the kept palettes held in memory, and the stored choices', K.getKeptPalettes().length === 0 && !('nenya.prefs' in store));

// The inner orbs behind the gem: moving unless chosen, stored as innerOrbs.
M.setRemembering(true);
ok('the inner orbs move before anything is chosen', M.getInnerOrbMode() === 'moving');
M.setInnerOrbMode('hidden');
ok('a choice is stored as innerOrbs', JSON.parse(store['nenya.prefs']).innerOrbs === 'hidden' && M.getInnerOrbMode() === 'hidden' && M.loadPrefs().innerOrbs === 'hidden');
M.setInnerOrbMode('still');
ok('and can be changed to still', JSON.parse(store['nenya.prefs']).innerOrbs === 'still');
store['nenya.prefs'] = JSON.stringify({ innerOrbs: 'gone' });
ok('a value that is not offered is dropped when read', M.loadPrefs().innerOrbs === undefined);
M.setInnerOrbMode('nonsense');
ok('a value set in code that is not offered becomes moving', M.getInnerOrbMode() === 'moving');

// The defaults (owner, 2026-11-22) and "chose Original" against "never chose", read by a fresh copy of the module each time so nothing is cached.
const fresh = async (tag: string, prefs: Record<string, unknown> | null) => {
  for (const k of Object.keys(store)) delete store[k];
  if (prefs) { store['nenya.remember'] = '1'; store['nenya.prefs'] = JSON.stringify(prefs); }
  return (await import(`../src/lib/deviceMemory.ts?${tag}`)) as typeof M;
};
const none = await fresh('none', null);
ok('a visitor who has set nothing: sway on, Night colours, palette glow, Lively and following the breath, 120% preview, moving lights, six leaves, eight-sided gem', none.getLeafSway() === true && none.getBreathColourChoice() === 'preset:night' && none.getOrbColourChoice() === 'preset:night' && none.getOrbHaloStyle() === 'palette' && none.getBreathPreviewPercent() === 120 && none.getInnerOrbMode() === 'moving' && none.getLogoLeaves() === 6 && none.getGemSidesChoice() === 8);
const chose = await fresh('chose', { breathColours: 'original', orbColours: 'original', leafSway: false, orbHalo: 'own', innerOrbs: 'still', previewPercent: 100, gemKaleidoscope: false, gemKaleidoscopeLook: 'calm', gemKaleidoscopeBreath: false, logoLeaves: 8, gemSides: 10 });
ok('a stored choice always wins, "Original" included: someone who chose it stays on Original, and an off stays off', chose.getBreathColourChoice() === 'original' && chose.getOrbColourChoice() === 'original' && chose.getLeafSway() === false && chose.getOrbHaloStyle() === 'own' && chose.getInnerOrbMode() === 'still' && chose.getBreathPreviewPercent() === 100 && chose.getGemKaleidoscope() === false && chose.getLogoLeaves() === 8 && chose.getGemSidesChoice() === 10);
const odd = await fresh('odd', { breathColours: 'neon' });
ok('a stored value that is not offered is dropped, so the default applies', odd.getBreathColourChoice() === 'preset:night');
