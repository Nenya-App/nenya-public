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
