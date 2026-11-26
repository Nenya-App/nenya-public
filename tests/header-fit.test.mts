// The header fits its screen (owner, 2026-11-26). The wide header needs about 920px, so it starts at the desktop width (1024); phones and tablets get the
// narrow one. On narrow phones the spacing tightens so nothing, the Emergency Exit information button included, runs off the side.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const src = (p: string) => readFileSync(p, 'utf8');
const nav = src('src/app/components/GlobalNavigation.tsx');
ok('the wide header starts at the desktop width, and the narrow one covers everything below it', /className="hidden lg:flex relative shrink-0/.test(nav) && /className="lg:hidden relative shrink-0/.test(nav) && !/md:flex relative|md:hidden relative/.test(nav));
const mark = src('src/app/components/NenyaMark.tsx');
ok('so the wide header always has room for "nənya.biz", and the mark needs no in-between form', /<NenyaMark face="body" playButton=\{false\} className="text-xl font-medium text-foreground" \/>/.test(nav) && !/compactBelowDesktop/.test(nav + mark));
ok('the narrow menu offers what the wide header does: tour, support, share, add to home screen, theme and accessibility', ['onTutorialReplay', 'handleSupportUsClick', '<ShareNenya variant="menu"', '<AddToHomeScreen variant="menu"', '<ThemeToggle', 'handleAccessibilityClick'].every((s) => nav.slice(nav.indexOf('{/* Mobile Navigation */}')).includes(s)));
// Narrow phones: "Emergency Exit" may take two lines (the same words, the same height), its arrow makes way on narrower ones, and the logo sits closer to the name.
// If the controls still do not fit (a very narrow screen with large text), they drop to a second line instead of running off the side.
const narrow = nav.slice(nav.indexOf('{/* Mobile Navigation */}'));
ok('below 440px the exit button\'s words may wrap to two lines, with less padding, and below 400px its arrow makes way', /<EmergencyExitButton variant="header" className="text-xs px-1\.5 sm:px-2 py-1 max-\[439px\]:max-w-\[6\.5rem\] max-\[439px\]:whitespace-normal max-\[439px\]:text-left max-\[439px\]:leading-tight max-\[439px\]:has-\[>svg\]:px-2 max-\[399px\]:\[&_svg\]:hidden"/.test(narrow));
ok('below 400px the logo and the name sit closer together', /<div className="flex items-center gap-1 min-\[400px\]:gap-2">/.test(narrow));
ok('the row can wrap, the controls keep to the right, and the menu opens under the whole header', /<div className="flex flex-wrap items-center justify-between gap-y-1 min-h-14 px-2 /.test(narrow) && /id="tutorial-header-tools-mobile" className="ml-auto flex /.test(narrow) && /className="absolute top-full left-0 right-0 bg-background/.test(narrow));
