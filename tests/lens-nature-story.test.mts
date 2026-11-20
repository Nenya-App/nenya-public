// Nature (the seventh lens) and Story (the eighth): behind their own switches, counted from one place, built like the other lenses (docs/lens-story-nature.md).
import { readFileSync } from 'node:fs';
import { activeLenses, lensCountWord, addLens, emptyLensState, openLens, readSavedDraft, reportShape, LENS_ORDER } from '../src/lib/lensState.ts';
import { NATURE, STORY, cleanWordCards, wordCardLines, type WordCardsData } from '../src/lib/lensWordCards.ts';
import { formatGatewayData, gatewayTitles } from '../src/lib/reportText.ts';
import { SENSE_WORDS, MATERIALS_EXTENSION_GROUPS, wordsOf } from '../src/lib/senseWords.ts';
import { isKnownEvent } from '../src/lib/counters.ts';
import { lensSummaries, lensNamesLine } from '../src/lib/gatewaySummaries.ts';
import { REPORT_SECTIONS } from '../src/lib/reportShare.ts';
import { composeDescription } from '../src/lib/describeChoices.ts';
import { ok } from './helpers.mts';

const read = (f: string) => readFileSync(f, 'utf8');

// ── the switches and the count
const six = ['sight', 'sound', 'touch', 'essence', 'movement', 'insight'];
ok('both switches off (the default): the six lenses only, and the count word is six', activeLenses({}).join() === six.join() && lensCountWord(activeLenses({})) === 'six' && activeLenses(undefined).join() === six.join());
ok('Nature on: it is the seventh', activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'on' }).join() === [...six, 'nature'].join() && lensCountWord(activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'on' })) === 'seven');
ok('both on: Story is the eighth, the count word is eight', activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'on', VITE_LENS_STORY: 'on' }).join() === [...six, 'nature', 'story'].join() && lensCountWord(activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'on', VITE_LENS_STORY: 'on' })) === 'eight');
ok('Story alone is the seventh in the list, never before Nature', activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_STORY: 'on' }).join() === [...six, 'story'].join());
ok('without the tray neither appears, whatever their own switches say', activeLenses({ VITE_LENS_NATURE: 'on', VITE_LENS_STORY: 'on' }).join() === six.join());
ok('anything but "on" is off', activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'true', VITE_LENS_STORY: '1' }).join() === six.join());
ok('the order is the six, then Nature, then Story', LENS_ORDER.join() === [...six, 'nature', 'story'].join());

const on8 = activeLenses({ VITE_LENS_TRAY: 'on', VITE_LENS_NATURE: 'on', VITE_LENS_STORY: 'on' });
ok('the lens list and the welcome summaries follow what is on, in order, with a name and a sentence for each', lensSummaries(on8).map((g) => g.id).join() === on8.join() && lensSummaries(on8).every((g) => g.name && g.summary.length > 20) && lensSummaries([...six] as any).length === 6);
ok('the names line lists every lens that is on, ending "and Story"; the six read as before', lensNamesLine(on8) === 'Sight, Sound, Touch, Essence, Movement, Insight, Nature and Story' && lensNamesLine(activeLenses({})) === 'Sight, Sound, Touch, Essence, Movement and Insight');

// ── the tray state treats them like any lens
let s = emptyLensState();
s = addLens(s, 'story', { v: 1 }); s = addLens(s, 'sight', 1); s = openLens(s, 'nature');
ok('added lenses sort into tray order, with Story last; an examined Nature is named in the one line', s.added.map((a) => a.gateway).join() === 'sight,story' && reportShape(s).line === 'Examined, not included: Nature.');
const draft = { v: 2, examined: ['story'], gatewayData: [{ gateway: 'nature', data: { v: 1 } }, { gateway: 'sight', data: 1 }], bodyMapData: null, interfaceColors: {} };
ok('a saved draft with Nature reads where Nature is on, and leaves it out where it is off', readSavedDraft(draft, on8)!.gatewayData.length === 2 && readSavedDraft(draft, on8)!.examined.join() === 'story' && readSavedDraft(draft, six as any)!.gatewayData.length === 1 && readSavedDraft(draft, six as any)!.examined.length === 0);
ok('their daily totals are known events (lens.opened and lens.added, per lens), and nothing else is', isKnownEvent('lens.opened.nature') && isKnownEvent('lens.added.story') && !isKnownEvent('lens.added.ninth'));

// ── the tray and the lists count nothing by hand
const tray = read('src/app/components/pages/LensTrayPage.tsx'), gateways = read('src/app/components/pages/GatewaysPage.tsx');
ok('the tray lists whatever is on (trayLensCards), not a fixed six', /trayLensCards\(\)\.map/.test(tray) && /activeLenses\(\)\.includes\(c\.id as LensId\)/.test(gateways));
ok('the older choose-several page never lists them', /g\.id !== 'nature' && g\.id !== 'story'/.test(gateways));
const bad = ['src/app/components/pages/LensTrayPage.tsx', 'src/app/components/WordCardLens.tsx'].filter((f) => /length === 6|length < 7|\[0, 1, 2, 3, 4, 5\]|\bsix\b(?! lenses and)/i.test(read(f).replace(/\/\/.*$/gm, '')));
ok('no lens count is written into the tray or the new cards', bad.length === 0, bad.join());

// ── the words
ok('Nature has the four lists the owner named, each a real list', (['plantsAnimals', 'weather', 'landscape', 'materialProperties'] as const).every((c) => wordsOf(c).length >= 30) && NATURE.cards.map((c) => c.category).join() === 'plantsAnimals,weather,landscape,materialProperties');
ok('Physical Properties holds the materials words the owner gave as examples', ['Stiff', 'Translucent', 'Brittle', 'Flowing'].every((w) => wordsOf('materialProperties').includes(w)));
ok('Physical Properties has a clear, empty extension point for the materials documents (no file is read)', Array.isArray(MATERIALS_EXTENSION_GROUPS) && MATERIALS_EXTENSION_GROUPS.length === 0 && /EXTENSION POINT/.test(read('src/lib/senseWords.ts')) && !/readFileSync|fetch\(|import\(/.test(read('src/lib/senseWords.ts')));
ok('Story has four lists: where and when, who, what changes, how it ends', STORY.cards.map((c) => c.category).join() === 'storySetting,storyCast,storyChange,storyEnding' && STORY.cards.every((c) => (SENSE_WORDS[c.category] ?? []).length >= 2));
ok('each card has a plain heading, a one-line ask and a box label, and the ids are unique', [NATURE, STORY].every((d) => d.cards.every((c) => c.title && c.ask.length > 20 && c.boxLabel && c.reportLabel) && new Set(d.cards.map((c) => c.id)).size === d.cards.length));

// ── saved data and the report
const nat: WordCardsData = { v: 1, words: { plantsAnimals: ['Heron', 'Oak'], weather: ['Drizzle'], landscape: [], properties: ['Brittle', 'Translucent'] }, texts: { plantsAnimals: 'A heron standing still.', weather: '', landscape: '', properties: '' }, summary: 'Heron, oak and drizzle.', wish: 'More like a stream.' };
const nl = formatGatewayData('nature', nat);
ok('the Nature report names each card that has something, words first and the description under it, then the summary and the wish', nl[0] === 'Plants and animals: Heron, Oak' && nl[1] === '  Description: A heron standing still.' && nl.includes('Weather and climate: Drizzle') && nl.includes('Physical properties: Brittle, Translucent') && !nl.some((l) => /^Landscapes/.test(l)) && nl.includes('In a few words: Heron, oak and drizzle.') && nl.includes('  What I would like it to be like: More like a stream.'));
ok('a card with only the person\'s own sentence still reaches the report', wordCardLines(NATURE, { v: 1, words: {}, texts: { weather: 'Grey and still.' } }).join('|') === 'Weather and climate: described in words only|  Description: Grey and still.');
ok('nothing chosen gives no lines (the report then says no data captured), and data that is not ours gives none', wordCardLines(STORY, { v: 1, words: {}, texts: {} }).length === 0 && wordCardLines(STORY, null).length === 0 && wordCardLines(STORY, { v: 2 }).length === 0 && formatGatewayData('story', { v: 1, words: {}, texts: {} }).join() === 'No data captured');
const hostile = cleanWordCards(NATURE, { v: 1, words: { weather: ['x'.repeat(200), 5, '', 'Fog', ...Array.from({ length: 30 }, (_, i) => `w${i}`)], bogus: ['no'] }, texts: { weather: 't'.repeat(900) }, summary: 's'.repeat(2000), wish: 'w'.repeat(900) })!;
ok('saved data is cleaned: unknown cards dropped, non-words dropped, lengths capped', !('bogus' in hostile.words) && hostile.words.weather.length === 12 && hostile.words.weather.every((w) => w.length <= 60) && hostile.texts.weather.length === 400 && hostile.summary.length === 800 && hostile.wish.length === 400);
const sto: WordCardsData = { v: 1, words: { setting: ['A kitchen', 'Late at night'], cast: ['Just me'], change: ['A door opens'], ending: ['Quiet'] }, texts: { setting: '', cast: '', change: '', ending: '' }, summary: STORY.compose([['A kitchen', 'Late at night'], ['Just me'], ['A door opens'], ['Quiet']]), wish: '' };
ok('the Story box is composed card by card from the choices, in plain words', sto.summary === 'Where and when: a kitchen and late at night. Who is in it: just me. What changes: a door opens. How it ends: quiet.' && STORY.compose([[], [], [], []]) === '' && STORY.compose([[], ['A friend'], [], []]) === 'Who is in it: a friend.');
ok('the Nature box is the same one-line description every lens uses', NATURE.compose([['Heron'], ['Drizzle', 'Fog'], [], []]) === composeDescription(['Heron', 'Drizzle', 'Fog']) && NATURE.compose([[], [], [], []]) === '');
ok('both have their own report section name and title, and the coach hand-off accepts the section names', gatewayTitles.nature === 'Nature - The Natural World' && gatewayTitles.story === 'Story - Narrative' && (REPORT_SECTIONS as readonly string[]).includes('Nature') && (REPORT_SECTIONS as readonly string[]).includes('Story'));

// ── the screens
const wc = read('src/app/components/WordCardLens.tsx'), natureP = read('src/app/components/pages/NatureGatewayPage.tsx'), storyP = read('src/app/components/pages/StoryGatewayPage.tsx'), app = read('src/app/App.tsx');
ok('each activity is its own card, with the word bar, the soft limit, an auto description and the shared nav and add parts', /<WordPicker/.test(wc) && /onAddText=\{\(t\) => descs\[index\]\.add\(t\)\}/.test(wc) && /needsFewerWarning/.test(wc) && /<FewerWarning/.test(wc) && /useAutoDescription/.test(wc) && /<LensCardNav/.test(wc) && /<AddToReport/.test(wc) && /<FewerNote/.test(wc));
ok('Put this down is in the header of both lens pages, and Add puts the lens in the report', [natureP, storyP].every((p) => /<PutThisDown onClick=\{onBack\}/.test(p) && /onAdd=\{\(data\) => onComplete\(data\)\}/.test(p) && /initial=\{initialData\}/.test(p)));
ok('App routes both lenses and reopens them with what was added', /currentScreen === 'nature'/.test(app) && /currentScreen === 'story'/.test(app) && /gateway === 'nature'\)\?\.data/.test(app) && /gateway === 'story'\)\?\.data/.test(app) && /NatureGatewayPage/.test(app) && /StoryGatewayPage/.test(app));
ok('a new card moves focus to its heading, and every box has a label (keyboard and screen reader)', /heading\.current\?\.focus\(\)/.test(wc) && (wc.match(/<Textarea/g) ?? []).length === (wc.match(/<label htmlFor/g) ?? []).length);
ok('nothing animates and nothing is a picture: no motion, no image, no canvas, no color-only meaning', !/motion|animate|transition|<img|<svg|<canvas|style=\{\{/.test(wc + natureP + storyP));
ok('visible words say lens, never gateway, and are English only', ![wc, natureP, storyP, read('src/lib/lensWordCards.ts')].some((t) => /gateway/i.test(t.replace(/\/\/.*$/gm, '').replace(/GatewayPage|totalGateways|currentIndex/g, ''))));
const sw = JSON.stringify([...Object.values(SENSE_WORDS.plantsAnimals), ...Object.values(SENSE_WORDS.storyCast)]);
ok('descriptions make no medical claims in the new lists', !/\b(?:diagnos|disorder|trauma|therapy|treat(?:s|ment)|cure|heal|symptom|anxiety|depress)/i.test(JSON.stringify(['plantsAnimals', 'weather', 'landscape', 'materialProperties', 'storySetting', 'storyCast', 'storyChange', 'storyEnding'].map((c) => (SENSE_WORDS as any)[c]))) && sw.length > 0);

// ── the switches are set the way every other lens switch is
const toml = read('netlify.toml'), dev = read('.env.development'), prod = read('docs/production-env.md'), readme = read('README.md'), state = read('src/lib/lensState.ts');
ok('they are read as import.meta.env?.VITE_X === \'on\'', /import\.meta\.env\?\.VITE_LENS_NATURE === 'on'/.test(state) && /import\.meta\.env\?\.VITE_LENS_STORY === 'on'/.test(state));
ok('they are on for dev builds and local dev only, and nowhere else', /\[context\.dev\.environment\][\s\S]*VITE_LENS_NATURE = "on"[\s\S]*VITE_LENS_STORY = "on"[\s\S]*\[functions\]/.test(toml) && /^VITE_LENS_NATURE=on$/m.test(dev) && /^VITE_LENS_STORY=on$/m.test(dev) && !/VITE_LENS_(NATURE|STORY)/.test(toml.slice(0, toml.indexOf('[context.dev.environment]'))));
ok('they have a row in docs/production-env.md (off by default) and a line in the README, and the design doc exists', /\| `VITE_LENS_NATURE` \|/.test(prod) && /\| `VITE_LENS_STORY` \|/.test(prod) && /VITE_LENS_NATURE/.test(readme) && /VITE_LENS_STORY/.test(readme) && /lens-story-nature\.md/.test(readme));
