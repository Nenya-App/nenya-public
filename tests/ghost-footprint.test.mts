// The low-footprint pieces: the device profile, the footprint calculator, and the privacy modes' descriptions.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { profileFrom } from '../src/lib/deviceProfile.ts';
import { scenarios, table, transfer, inference, TRANSFER_MODELS } from '../src/lib/footprint.ts';
import { MODES, availableModes } from '../src/lib/privacyModes.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (p: string) => readFileSync(root + p, 'utf8');

// Device profile
ok('an old phone gets the light path', profileFrom({ deviceMemory: 1, hardwareConcurrency: 2, webgl2: true }).tier === 'lite' && profileFrom({ deviceMemory: 1 }).gem.quality === 'low');
ok('data saver or a slow connection gets the light path, and nothing optional early', profileFrom({ saveData: true }).tier === 'lite' && profileFrom({ effectiveType: 'slow-2g' }).tier === 'lite' && profileFrom({ effectiveType: '3g' }).prefetch === false && profileFrom({ effectiveType: '4g' }).tier === 'standard');
ok('missing signals count as standard', profileFrom({}).tier === 'standard' && profileFrom({}).gem.engine === 'live');
ok('only a recent device with WebGPU is "capable", and only it may run the coach on the device', profileFrom({ webgpu: true, deviceMemory: 8, hardwareConcurrency: 8 }).coachOnDevice && !profileFrom({ webgpu: true, deviceMemory: 4, hardwareConcurrency: 8 }).coachOnDevice);
ok('no WebGL2 means the sprite; reduced motion means a still gem', profileFrom({ webgl2: false }).gem.engine === 'sprite' && profileFrom({ reducedMotion: true }).gem.still);

// Footprint
ok('transfer scales with bytes and spans both model versions', (() => { const a = transfer(1e9); return Math.abs(a.wh.high - 810) < 1 && Math.abs(a.wh.low - 300) < 1 && transfer(2e9).wh.high === 2 * a.wh.high; })());
ok('the v4 model is the sum of its six parts', Math.abs(TRANSFER_MODELS.swd4.kWhPerGB - 0.3) < 1e-9);
ok('inference ranges are ordered and grow with tokens', (() => { const a = inference(1000, 100), b = inference(2000, 200); return a.wh.low < a.wh.high && b.wh.high > a.wh.high; })());
const rows = scenarios();
const find = (t: string, o: string) => rows.find((x) => x.task.startsWith(t) && x.option.startsWith(o))!;
ok('the live gem makes a first visit lighter than the sprite', find('First visit', 'Live').wh.high < find('First visit', 'Today').wh.high / 2);
ok('a whole coach conversation is lighter than five prompts to a large service', find('Coach', 'Witnessed').wh.high < find('Coach', 'Large').wh.low);
ok('adaptive polling is lighter than fixed polling', find('Partner', 'Mailbox, adaptive').wh.high < find('Partner', 'Mailbox, fixed').wh.high);
ok('an on-device model download is not presented as greener', find('On-device', 'Small').wh.low > find('Coach', 'Witnessed').wh.high * 100 && /not a greener/.test(find('On-device', 'Small').notes));
ok('the table has a row per scenario', table().split('\n').length === rows.length + 2);

// Modes
ok('only Witnessed is offered until a switch is turned on', availableModes().map((m) => m.id).join() === 'witnessed' && availableModes({ sealed: true, cell: true }).length === 3);
ok('only modes Nenya can witness may sign', Object.values(MODES).every((m) => m.canSign === (m.id === 'witnessed')));
ok('Witnessed is never called end-to-end; Sealed names what it does not check', /Not end-to-end/.test(MODES.witnessed.encryption) && /does not yet check the hardware evidence/.test(MODES.sealed.encryption));
ok('the planned on-device mode admits its footprint', /highest/.test(MODES.local.footprint));
ok('the server switches are off by default', /process\.env\.COACH_SEALED !== 'on'/.test(src('netlify/functions/coach.mts')) && /process\.env\.CELL_ENABLED !== 'true'/.test(src('netlify/functions/cell.mts')));
ok('the new functions add no rate-limit rule (the plan allows two, both used)', !/rateLimit/.test(src('netlify/functions/cell.mts')) && !/rateLimit/.test(src('netlify/functions/cell-cleanup.mts')));
ok('the partner-practice preview no longer uses Math.random for its code', !/Math\.random/.test(src('src/app/components/DyadicCellCreation.tsx')));
