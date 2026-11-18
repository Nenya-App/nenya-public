// The tray screens (behind VITE_LENS_TRAY): source-level checks that the tray, App and Sight are wired as the wireframes say, and that the old flow stays when off.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const app = readFileSync('src/app/App.tsx', 'utf8');
const tray = readFileSync('src/app/components/pages/LensTrayPage.tsx', 'utf8');
const sight = readFileSync('src/app/components/pages/SightGatewayPage.tsx', 'utf8');
const parts = readFileSync('src/app/components/LensCardParts.tsx', 'utf8');

ok('the tray opens with the shared opening line', /Choosing fewer can be more helpful than choosing many/.test(tray) && /FEWER_LINE/.test(parts));
ok('App shows the tray only when the switch is on, and the old page otherwise', /currentScreen === 'home' && lensTrayOn\(\)/.test(app) && /currentScreen === 'home' && !lensTrayOn\(\)/.test(app));
ok('finishing a lens in tray mode adds it and returns to the tray', /if \(lensTrayOn\(\)\) \{[\s\S]{0,400}addLens\([\s\S]{0,500}navigateTo\('home'\)/.test(app));
ok('Sight, in tray mode, hides "Gateway n of m", offers Add / Put this down, and warns before a fourth word', /!tray && <GatewayProgress/.test(sight) && /AddToReport/.test(sight) && /needsFewerWarning/.test(sight) && /FewerWarning/.test(sight));
ok('Sight tucks the word list under More descriptions in tray mode', /<MoreDescriptions>[\s\S]{0,300}WordPicker/.test(sight));
ok('Sight reopens with what was added (Edit)', /initialData/.test(sight) && /initialData=\{gatewayData\.find/.test(app));
ok('the soft limit is a warning, never a block (the fourth waits for Add it anyway)', /Add it anyway/.test(parts) && /Keep three/.test(parts));

const sound = readFileSync('src/app/components/pages/SoundGatewayPage.tsx', 'utf8');
ok('Sound, in tray mode, hides "Gateway n of m", offers Add / Put this down, and warns before a fourth word', /!tray && <GatewayProgress/.test(sound) && /<AddToReport name="Sound"/.test(sound) && /needsFewerWarning/.test(sound) && /<FewerWarning/.test(sound));
ok('Sound keeps Pitch and Volume up front and tucks words and sounds under More descriptions', (sound.match(/<MoreDescriptions>/g) ?? []).length === 2 && /label="Pitch"/.test(sound));
ok('Sound reopens with what was added', /initialData/.test(sound) && /initialData=\{gatewayData\.find\(\(g\) => g\.gateway === 'sound'\)/.test(app));

const touch = readFileSync('src/app/components/pages/TouchGatewayPage.tsx', 'utf8');
ok('Touch, in tray mode, uses the simpler card, hides "Gateway n of m", shows the opening line and Add / Put this down', /simpleGatewaysOn\(\) \|\| tray/.test(touch) && /!tray && <GatewayProgress/.test(touch) && /<FewerNote \/>/.test(touch) && /<AddToReport name="Touch"/.test(touch));
ok('Touch reopens with what was added', /initialData/.test(touch) && /initialData=\{gatewayData\.find\(\(g\) => g\.gateway === 'touch'\)/.test(app));

const essence = readFileSync('src/app/components/pages/EssenceGatewayPage.tsx', 'utf8');
ok('Essence, in tray mode, hides "Gateway n of m", shows the opening line, offers Add / Put this down and warns before a fourth word', /!tray && <GatewayProgress/.test(essence) && /<FewerNote \/>/.test(essence) && /<AddToReport name="Essence"/.test(essence) && /needsFewerWarning/.test(essence) && (essence.match(/<FewerWarning/g) ?? []).length === 4);
ok('Essence keeps taste, scent and intensity up front and tucks the description under More descriptions', (essence.match(/<MoreDescriptions>/g) ?? []).length === 2 && /label="Intensity"/.test(essence));
ok('Essence reopens with what was added', /initialData/.test(essence) && /initialData=\{gatewayData\.find\(\(g\) => g\.gateway === 'essence'\)/.test(app));

const movement = readFileSync('src/app/components/pages/MovementGatewayPage.tsx', 'utf8');
const shapePicker = readFileSync('src/app/components/ShapePicker.tsx', 'utf8');
ok('Movement, in tray mode, hides "Gateway n of m", shows the opening line, offers Add / Put this down', /!tray && <GatewayProgress/.test(movement) && /<FewerNote \/>/.test(movement) && /<AddToReport name="Movement"/.test(movement));
ok('Movement warns before a fourth drawing, direction or quality on each card (six lists), and never blocks', (movement.match(/<FewerWarning/g) ?? []).length === 6 && /needsFewerWarning/.test(movement) && /soft=\{tray\}/.test(movement));
ok('the drawing picker keeps its hard limit of three outside the tray and is soft inside it', /const full = !soft && selected\.length >= MAX_SHAPES/.test(shapePicker));
ok('Movement keeps drawings, Energy and Speed up front and tucks direction, quality, drawing and words under More descriptions', /return tray \? \[b\[0\], b\[2\], b\[3\], <MoreDescriptions/.test(movement) && (movement.match(/\{b\[1\]\}\{b\[4\]\}\{b\[5\]\}\{b\[6\]\}/g) ?? []).length === 2);
ok('Movement reopens with what was added, including the drawn pattern', /initialData/.test(movement) && /initialDataUrl=\{init\?\.currentMovementDrawing\}/.test(movement) && /initialDataUrl=\{init\?\.potentialMovementDrawing\}/.test(movement) && /initialData=\{gatewayData\.find\(\(g\) => g\.gateway === 'movement'\)/.test(app));

const insight = readFileSync('src/app/components/pages/InsightGatewayPage.tsx', 'utf8');
ok('Pattern (the Insight page), in tray mode, hides "Gateway n of m", shows the opening line, offers Add / Put this down under the lens\'s own name', /!tray && <GatewayProgress/.test(insight) && /<FewerNote \/>/.test(insight) && /<AddToReport name=\{sixthLensName\(\)\}/.test(insight));
ok('Pattern warns before a fourth drawing, pattern word or perspective on each card (six lists), and never blocks', (insight.match(/<FewerWarning/g) ?? []).length === 6 && /needsFewerWarning/.test(insight) && /soft=\{tray\}/.test(insight));
ok('Pattern keeps drawings, Clarity and Depth up front and tucks pattern words, perspective, drawing pad and words under More descriptions', /return tray \? \[b\[0\], b\[2\], b\[3\], <MoreDescriptions/.test(insight) && (insight.match(/\{b\[1\]\}\{b\[4\]\}\{b\[5\]\}\{b\[6\]\}/g) ?? []).length === 2);
ok('Pattern reopens with what was added, including the drawn pattern', /initialData/.test(insight) && /initialDataUrl=\{init\?\.currentPatternDrawing\}/.test(insight) && /initialDataUrl=\{init\?\.potentialPatternDrawing\}/.test(insight) && /initialData=\{gatewayData\.find\(\(g\) => g\.gateway === 'insight'\)/.test(app));

const review = readFileSync('src/app/components/pages/GatewayReviewPage.tsx', 'utf8');
const pdf = readFileSync('src/lib/nenyaPdfReport.ts', 'utf8');
ok('the review page shows the "Examined, not included" line, writes it into the text report, and gives it to the PDF', /examinedLine\?: string/.test(review) && /\{examinedLine && <p[^>]*data-examined-line>/.test(review) && /if \(examinedLine\) report \+= /.test(review) && /formatBodyMapLines, examinedLine\)/.test(review));
ok('the PDF draws the line after the lens sections and before the body map, only when there is one', /examinedLine\?: string/.test(pdf) && /if \(examinedLine\) \{/.test(pdf) && pdf.indexOf('if (examinedLine) {') < pdf.indexOf("Body Map -- shared across every gateway"));
ok('App passes the line only in tray mode, from the tray state', /examinedLine=\{lensTrayOn\(\) \? reportShape\(trayState\)\.line : undefined\}/.test(app));

const quick = readFileSync('src/app/components/QuickNav.tsx', 'utf8');
ok('the quick nav keeps its present words (Breathe, Reflect, Coach) and marks the part you are in', />Breathe</.test(quick) && />Reflect</.test(quick) && />Coach</.test(quick) && /current === 'breathe'/.test(quick) && /current === 'reflect'/.test(quick));
ok('the tray page carries the quick nav, marked Reflect, with Breathe going back; Coach stays its own page', /<QuickNav current="reflect" onBreathe=\{onBack\}/.test(tray) && /coachHref = '\/coach\/'/.test(quick));
ok('on the breathing page Reflect leads to the start screen, which is the tray when the tray switch is on', /onReflect=\{onContinue\}/.test(readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8')) && /currentScreen === 'home' && lensTrayOn\(\)/.test(app));
