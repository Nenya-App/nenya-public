// The gem kaleidoscope visitor setting (src/lib/deviceMemory.ts): off by default, saved only while remembering, validated, erased with the rest.
const store: Record<string, string> = {};
(globalThis as any).localStorage = { get length() { return Object.keys(store).length; }, key: (i: number) => Object.keys(store)[i] ?? null, getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = String(v); }, removeItem: (k: string) => { delete store[k]; } };
(globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
import { ok } from './helpers.mts';
const dm = await import('../src/lib/deviceMemory.ts');
ok('the kaleidoscope is off by default', dm.getGemKaleidoscope() === false);
dm.setGemKaleidoscope(true);
ok('switching it on is not saved while the device is not remembering', dm.getGemKaleidoscope() === true && store['nenya.prefs'] === undefined);
dm.setRemembering(true);
dm.setGemKaleidoscope(true);
ok('switching it on is saved while remembering', dm.loadPrefs().gemKaleidoscope === true);
store['nenya.prefs'] = JSON.stringify({ gemKaleidoscope: 'yes' });
ok('a non-boolean saved value is dropped', dm.loadPrefs().gemKaleidoscope === undefined);
store['nenya.prefs'] = JSON.stringify({ gemKaleidoscope: true });
dm.wipeDevice({ keepOwner: false });
ok('forgetting erases the saved setting', store['nenya.prefs'] === undefined);
