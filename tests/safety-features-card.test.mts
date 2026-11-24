// The safety features card (owner approved the draft 2026-11-24; docs/safety-features-card.md): the exact words, where they may appear, what they say about the code, and that no model
// can write or change them. The rendering of the card and of the notice is checked in tests/safety-features-card-render.test.mjs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { CHANGES_FROM_APPROVED, NEVER_SAVES, NEVER_SAVES_WITH_SAVE_RETURN, SAFETY_CARD_TITLE, safetyCardText } from '../src/lib/safetyFeaturesCard.ts';
import { flagWantsSafetyCard, SAFETY_CARD_MODULE_IDS, shouldShowSafetyCard } from '../src/lib/safetyCardRule.ts';
import { CATEGORY_LABELS, checkConversation, detectFlag, resourcesFor, type FlagCategory, type SafetyFlag } from '../src/lib/safetyFlags.ts';
import { COERCION_IDS } from '../src/lib/coachModules.ts';
import { EXIT_PAGE_NAME } from '../src/lib/emergencyExit.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');

// ---- The approved draft, word for word (section 1 of safety-features-card-draft-2026-11-24.md), one line per paragraph or bullet. Do not edit this to match the code:
// a change to the card's words is made in src/lib/safetyFeaturesCard.ts, listed in CHANGES_FROM_APPROVED, and approved by the owner.
const APPROVED = `Learn more about our current safety and privacy features
What we have, what it does, and what it cannot do.

## Emergency Exit
Where it is. A button in the header and the footer of the pages, and on the coach page. It is red and says “Emergency Exit.”
What it does.
- It erases everything Nenya saved on this device: your settings, your timers, and your agreement to the terms.
- It replaces your page with a Wikipedia page. It does not add to your history, so Back does not bring the Nenya page you were on.
- If you press Back to an earlier Nenya page in the same tab, it sends you away again. This stops when you close the tab.
- It sends nothing to us.
What it cannot do.
- It cannot erase your browser’s own history. Your browser may still show that you visited nenya.biz, and the page it sent you to.
- It does not close other tabs or windows.
- It does not delete files you saved, such as a PDF or a transcript.
- It cannot hide your visit from your internet provider, your network, or anyone who controls your device or your accounts.

## Forget me
Where it is. A link at the bottom of every page, and a button under “Remember on this device” in the display settings.
What it does. It erases what Nenya saved in this browser: your display settings, your choice to remember, your agreement to the terms, and the timer that follows a coach conversation. It sends nothing to us. Nenya never saves what you write or draw on your device.
What it cannot do.
- It cannot erase your browser’s own history, or files you downloaded.
- The coach sends your messages through our server to an outside AI service to get a reply. We do not store them. We cannot see or control what that service does with them.
- If you chose to send us a conversation, Forget me does not remove it. Email us and we will delete it.

## What we have not built
- There is no disguised app, no password or lock, and no key that hides the page.
- Nenya is not a safety plan, and it is not a crisis service.

## If you are not safe
Call your local emergency number. The help lines are in the notice on this page.

Nenya is a free, early prototype and is not therapy. No clinician or lawyer has reviewed it. We have not studied whether it helps.`;

// ---- 1. The words: the approved draft plus the listed changes, and nothing else
ok('the button says the approved title', SAFETY_CARD_TITLE === 'Learn more about our current safety and privacy features');
ok('the list of changes has five entries, and only the exit destination was forced by the owner\'s decision', CHANGES_FROM_APPROVED.length === 5 && CHANGES_FROM_APPROVED.filter((c) => c.forced).length === 1 && CHANGES_FROM_APPROVED[0].forced === true);
ok('every change starts from words that are in the approved draft exactly once, and says why', CHANGES_FROM_APPROVED.every((c) => APPROVED.split(c.from).length === 2 && c.why.length > 20 && c.to !== c.from));
const applied = (withSaveReturn: boolean) => CHANGES_FROM_APPROVED.filter((c) => withSaveReturn || c.from !== NEVER_SAVES).reduce((t, c) => t.replace(c.from, c.to), APPROVED);
ok('the card text is exactly the approved draft with the listed changes (with "Save and return later" off)', safetyCardText(false) === applied(false));
ok('with "Save and return later" on, only the one sentence about what is saved differs', safetyCardText(true) === applied(true) && safetyCardText(true) !== safetyCardText(false) && safetyCardText(false).includes(NEVER_SAVES) && safetyCardText(true).includes(NEVER_SAVES_WITH_SAVE_RETURN) && !safetyCardText(true).includes(NEVER_SAVES));
ok('the approved sentences that the changes do not touch are unchanged: the exit, Back, what it cannot do, the outside AI service, the email, what we have not built, the footer', [
  'It erases everything Nenya saved on this device: your settings, your timers, and your agreement to the terms.',
  'It does not add to your history, so Back does not bring the Nenya page you were on.',
  'If you press Back to an earlier Nenya page in the same tab, it sends you away again. This stops when you close the tab.',
  'It cannot hide your visit from your internet provider, your network, or anyone who controls your device or your accounts.',
  'The coach sends your messages through our server to an outside AI service to get a reply. We do not store them. We cannot see or control what that service does with them.',
  'If you chose to send us a conversation, Forget me does not remove it. Email us and we will delete it.',
  'Nenya is not a safety plan, and it is not a crisis service.',
  'Call your local emergency number. The help lines are in the notice on this page.',
  'Nenya is a free, early prototype and is not therapy. No clinician or lawyer has reviewed it. We have not studied whether it helps.',
].every((line) => safetyCardText(false).includes(line)));
ok('no word of Wikipedia, the Rings or the disguise remains, and the exit page is named from the one constant', !/wikipedia|rings of power/i.test(safetyCardText(true)) && safetyCardText(true).includes(`replaces your page with ${EXIT_PAGE_NAME}`));
ok('the card promises no safety: it says what it cannot do and that Nenya is not a safety plan or crisis service', /cannot hide your visit/.test(safetyCardText(true)) && /not a safety plan/.test(safetyCardText(true)) && !/\b(guarantee|guaranteed|secure|safe from|untraceable|anonymous)\b/i.test(safetyCardText(true).replace('If you are not safe', '')));
ok('it reads at about grade 5 to 6 or lower (Flesch-Kincaid)', gradeLevel(safetyCardText(true)) <= 6, `grade ${gradeLevel(safetyCardText(true)).toFixed(1)}`);

// ---- 2. Where it appears: the rule
const f = (category: FlagCategory, kind?: string, tier: 'stop' | 'soften' = 'stop'): SafetyFlag => ({ category, tier, label: CATEGORY_LABELS[category], ...(kind ? { kind } : {}) });
const abuseKinds = ['partner-or-family', 'control-or-fear', 'child-or-dependent', 'sexual', 'trafficking', undefined];
ok('every abuse kind, in both tiers, and the older abuse rules with no kind, show the card', abuseKinds.every((k) => (['stop', 'soften'] as const).every((t) => shouldShowSafetyCard(f('abuse', k, t)))));
ok('the admitted-partner case shows the card, in the stop tier the site uses for it', shouldShowSafetyCard(f('harm-others', 'admitted-partner')));
ok('the other admissions and graphic violence do not (the card is about a person being watched, not about someone who hurt a child, a stranger or in a story)', ['admitted', 'admitted-child', 'admitted-child-sexual', 'admitted-sexual', 'admitted-trafficking', 'child-attraction', 'graphic', undefined].every((k) => !shouldShowSafetyCard(f('harm-others', k))));
ok('suicide and self-harm, in every kind, do not', [undefined, 'imminent'].every((k) => (['stop', 'soften'] as const).every((t) => !shouldShowSafetyCard(f('self-harm', k, t)))));
ok('hurting yourself on purpose, in every rung, does not', ['background', 'other', 'present', 'ends', 'emergency', undefined].every((k) => !shouldShowSafetyCard(f('self-injury', k, k === 'ends' || k === 'emergency' ? 'stop' : 'soften'))));
ok('serious distress does not', !shouldShowSafetyCard(f('distress', undefined, 'soften')));
ok('exactly two flag shapes show it, and no category was left unchecked', Object.keys(CATEGORY_LABELS).every((c) => ['abuse', 'harm-others', 'self-harm', 'self-injury', 'distress'].includes(c)) && Object.keys(CATEGORY_LABELS).length === 5);
ok('no flag, null, undefined and an empty list show nothing', !shouldShowSafetyCard() && !shouldShowSafetyCard(null) && !shouldShowSafetyCard(undefined) && !shouldShowSafetyCard([]) && !shouldShowSafetyCard([null, undefined]) && !flagWantsSafetyCard(null));
ok('a list of flags shows it if any one is an abuse flag, and not otherwise', shouldShowSafetyCard([f('distress'), f('abuse', 'control-or-fear', 'soften')]) && !shouldShowSafetyCard([f('distress'), f('self-harm')]));
ok('the three coercion modules show it, with or without a flag', SAFETY_CARD_MODULE_IDS.every((id) => shouldShowSafetyCard(null, id) && shouldShowSafetyCard(f('distress'), id)));
ok('the list of module ids is the coercion modules, exactly (a copy, so the page does not load the coach\'s module code)', [...SAFETY_CARD_MODULE_IDS].sort().join() === [...COERCION_IDS].sort().join());
ok('no other module shows it', ['offer_a_smaller_step', 'grieve_before_deciding', 'coercion', 'coercion_', '', null, undefined, 'a_lens'].every((id) => !shouldShowSafetyCard(null, id)));
// With the real checks: sentences that raise each flag
{
  const cases: [string, boolean][] = [
    ['My husband hits me.', true],
    ['I am afraid of my husband.', true],
    ['My stepfather touches my sister inappropriately.', true],
    ['I was raped last month.', true],
    ['I have been hitting my wife.', true],
    ['I want to kill myself tonight.', false],
    ['I am thinking about suicide.', false],
    ['I feel so hopeless and worthless.', false],
    ['I want to hurt him.', false],
    ['I killed someone.', false],
    ['I have been abusing my child.', false],
  ];
  const got = cases.map(([text, want]) => ({ text, want, flag: detectFlag(text) ?? checkConversation([text]) }));
  ok('real sentences: the card goes with abuse and the admitted-partner case, and with nothing else', got.every((g) => !!g.flag && shouldShowSafetyCard(g.flag) === g.want), got.filter((g) => !g.flag || shouldShowSafetyCard(g.flag) !== g.want).map((g) => `${g.text} -> ${JSON.stringify(g.flag)}`).join(' | '));
  ok('the help lines are still given for every abuse flag (the card never replaces them)', abuseKinds.every((k) => resourcesFor('abuse', k).length >= 6 && resourcesFor('abuse', k).some((r) => /Domestic Violence/.test(r.name)) && resourcesFor('abuse', k).some((r) => /Immediate danger/.test(r.name))));
}

// ---- 3. How it is built: collapsed, a real button, no motion, pre-written, no model path
const card = src('src/app/components/SafetyFeaturesCard.tsx');
ok('collapsed by default', /useState\(false\)/.test(card) && /hidden=\{!open\}/.test(card));
ok('a real button with aria-expanded and aria-controls pointing at the body, which is a region named by the button', /<button\s[^>]*type="button"/.test(card) && /aria-expanded=\{open\}/.test(card) && /aria-controls=\{bodyId\}/.test(card) && /id=\{bodyId\}/.test(card) && /role="region"/.test(card) && /aria-labelledby=\{headingId\}/.test(card) && /id=\{headingId\}/.test(card));
ok('keyboard: it is a native button (Enter and Space work), at least 44px high, with no key handler that could trap focus', /min-h-11/.test(card) && !/onKeyDown|onKeyUp|tabIndex/.test(card));
ok('no animation or transition at all, so Stop motion and reduced motion have nothing to switch off', !/transition|animate|duration|motion|@keyframes/i.test(card.replace(/\/\/.*$/gm, '')));
ok('focus is visible through the site\'s own 3px outline (no rule hides it)', !/outline-none|focus:outline-none|focus-visible:outline-none|ring-0/.test(card) && /:focus-visible \{ outline: 3px solid var\(--focus-ring\) !important;/.test(src('src/styles/globals.css')));
ok('text uses the full foreground color (AAA contrast), not the muted gray', /text-foreground/.test(card) && !/text-muted-foreground|opacity-/.test(card) && /text-sm leading-relaxed/.test(card));
ok('the arrow is hidden from screen readers; the heading is a real heading that holds the button', /aria-hidden="true"/.test(card) && /<h3 className="m-0 text-sm font-medium">\s*<button/.test(card) && /<h4 /.test(card));
ok('the component takes no text, no children and no message: only a class name', /export function SafetyFeaturesCard\(\{ className = '' \}: \{ className\?: string \}\)/.test(card) && !/children|flaggedMessage|messages|dangerouslySetInnerHTML/.test(card));
const text = src('src/lib/safetyFeaturesCard.ts') + src('src/lib/safetyCardRule.ts');
ok('no model, network, storage or visitor-text path: the words are constants, and the rule reads only a flag\'s category and kind', !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|netlify|venice|workers|openrouter|prompt|systemInstruction|\bmessage\b/i.test(text.replace(/\/\/.*$/gm, '')) && /Pick<SafetyFlag, 'category' \| 'kind'>/.test(src('src/lib/safetyCardRule.ts')));
ok('no coach instruction, module text or server function mentions the card, so the model never sees or writes it', !/safetyFeaturesCard|SafetyFeaturesCard|safetyCardRule/.test([src('src/lib/coachModules.ts'), src('src/lib/moduleDescriptions.ts'), src('src/lib/distressText.ts'), src('netlify/functions/coach.mts')].join('\n')));
const notice = src('src/coach/FlagNotice.tsx');
ok('the notice shows the card under the help lines, only through the rule, and the help lines and the reporting facts stay', /resourcesFor\(flag\.category, flag\.kind\)\.map/.test(notice) && /safetyCard && shouldShowSafetyCard\(flag\) && <SafetyFeaturesCard \/>/.test(notice) && notice.indexOf('resourcesFor(flag.category') < notice.indexOf('<SafetyFeaturesCard') && notice.indexOf('<SafetyFeaturesCard') < notice.indexOf('admitsHarm(flag) &&'));
ok('the partner cell turns the card off (its exit also closes the cell with our server, so "sends nothing" would be untrue there)', /<FlagNotice [^>]*safetyCard=\{false\}/.test(src('src/cell/CellPage.tsx')) && /safetyCard = true/.test(notice));

// ---- 4. The words match the code (the evidence table in docs/safety-features-card.md)
const exit = src('src/lib/emergencyExit.ts');
const leave = exit.slice(exit.indexOf('export function leaveNow'), exit.indexOf('export function guardBackAfterExit'));
ok('Exit erases all of Nenya\'s storage on the device and in the tab, then replaces (does not add to) the page', /localStorage\.removeItem\('nenya_session_data'\)/.test(leave) && /sessionStorage\.clear\(\)/.test(leave) && /wipeDevice\(\{ keepOwner: false \}\)/.test(leave) && /window\.location\.replace\(EXIT_URL\)/.test(leave) && !/location\.assign|location\.href\s*=|history\.pushState/.test(exit));
ok('Exit sends nothing: no request of any kind in the leaving code', !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|new Image/.test(exit));
ok('Exit leaves a note in this tab only (session storage) that sends a Back visit away again, and a fresh visit clears it', /sessionStorage\.setItem\(EXIT_NOTE_KEY, '1'\)/.test(exit) && /shouldLeaveAgain/.test(exit) && /noteIsStale/.test(exit) && /gone when the tab closes|goes when the tab closes|lives only in this tab/.test(exit));
const dm = src('src/lib/deviceMemory.ts');
ok('the wipe removes every Nenya key from the device (settings, timers, agreement, the choice to remember), the tab\'s agreement note and the kept palettes', /k\.toLowerCase\(\)\.startsWith\('nenya'\)/.test(dm) && /REST_KEY = 'nenya\.coach\.rest'/.test(dm) && /PAUSE_KEY = 'nenya\.coach\.pause'/.test(dm) && /REMEMBER_KEY = 'nenya\.remember'/.test(dm) && /TERMS_KEY = 'nenya\.terms'/.test(dm) && /clearKeptPalettes\(\)/.test(dm));
ok('Forget me erases the same things (keeping only the owner\'s testing flag), sends nothing, and goes back to the start of the page', /export function forgetMeAndRestart[\s\S]{0,200}wipeDevice\(\{ keepOwner: true \}\)/.test(dm) && !/fetch\(/.test(dm));
ok('Nothing a visitor writes or draws is kept on the device, except the optional "Save and return later" the card names when it is on', /Never kept: anything a visitor writes, draws/.test(dm) && /export const saveReflectionOn/.test(src('src/lib/savedReflection.ts')) && /VITE_SAVE_REFLECTION/.test(src('src/lib/savedReflection.ts')));
ok('the Exit button is in the header (both layouts) and the footer, and the coach page has the header; the transcript pages have only the pinned one', /<EmergencyExitButton variant="header"/.test(src('src/app/components/GlobalNavigation.tsx')) && (src('src/app/components/GlobalNavigation.tsx').match(/<EmergencyExitButton variant="header"/g) ?? []).length === 2 && /<EmergencyExitButton variant="footer"/.test(src('src/app/components/AppFooter.tsx')) && /<GlobalNavigation/.test(src('src/coach/CoachPage.tsx')) && /<EmergencyExitDock show \/>/.test(src('src/verify/VerifyPage.tsx')) && /<EmergencyExitDock show \/>/.test(src('src/mytranscript/MyTranscriptPage.tsx')) && !/AppFooter|<footer[^>]*>[\s\S]*ForgetMe/.test(src('src/verify/VerifyPage.tsx') + src('src/mytranscript/MyTranscriptPage.tsx').replace(/ForgetMe/g, '')) );
ok('the button is rust-colored (#89452D), not red, and says "Emergency Exit"', /const EMERGENCY_COLOR = '#89452D'/.test(src('src/app/components/EmergencyExit.tsx')) && />\s*Emergency Exit\s*<\/Button>/.test(src('src/app/components/EmergencyExit.tsx')));
ok('Forget me is a link in the footer and a button under "Remember on this device" in the settings window titled Accessibility Settings', /<ForgetMeLink \/>/.test(src('src/app/components/AppFooter.tsx')) && /card\('remember', 'Remember on this device', <DeviceMemoryControls \/>\)/.test(src('src/app/components/AccessibilitySettings.tsx')) && /<ForgetMeControl variant="button" \/>/.test(src('src/app/components/DeviceMemoryControls.tsx')) && /<DialogTitle>Accessibility Settings<\/DialogTitle>/.test(src('src/app/components/GlobalNavigation.tsx')));
ok('the Forget me link is on every page of the app but not on the two static pages: the card says "most pages"', /most pages/.test(safetyCardText(false)) && !/every page/.test(safetyCardText(true)));
ok('the privacy page says the coach sends messages through our server to an outside service, that we do not store them, and that a sent conversation is kept under the Terms', /sends your messages through our server to/.test(src('src/app/components/about/PrivacyPromise.tsx')) && /We do not store them\./.test(src('src/app/components/about/PrivacyPromise.tsx')) && /service does with them|outside service/.test(src('src/app/components/about/PrivacyPromise.tsx')));
ok('there is no key, password or lock that hides the page: Exit is called only from the two buttons', (src('src/app/components/EmergencyExit.tsx').match(/leaveNow\(/g) ?? []).length === 2);
