// The collapsible cards in the breathing and accessibility panel: closed on every visit, never stored, a real disclosure button, and the live preview stays outside them.
import { readFileSync } from 'node:fs';
import { CARDS_INSTRUCTION, NO_CARDS_OPEN, SETTINGS_CARD_IDS, allCardsOpen, closeAllCards, noCardsOpen, openAllCards, toggleCard } from '../src/lib/settingsCards.ts';
import { ok } from './helpers.mts';

ok('the panel starts with every card closed', noCardsOpen(NO_CARDS_OPEN) && !allCardsOpen(NO_CARDS_OPEN) && SETTINGS_CARD_IDS.every((id) => !NO_CARDS_OPEN[id]));
ok('selecting a heading opens its card and again closes it, leaving the others as they were', (() => { const a = toggleCard(NO_CARDS_OPEN, 'logo-look'); const b = toggleCard(a, 'theme'); const c = toggleCard(b, 'logo-look'); return a['logo-look'] === true && !a.theme && b.theme === true && b['logo-look'] === true && c['logo-look'] === false && c.theme === true; })());
ok('toggling does not change the state it was given', (() => { const s = {}; toggleCard(s, 'theme'); return Object.keys(s).length === 0; })());
ok('open all opens every card and close all closes every card', allCardsOpen(openAllCards()) && noCardsOpen(closeAllCards()) && SETTINGS_CARD_IDS.length === 8 && new Set(SETTINGS_CARD_IDS).size === 8);
ok('the instruction says how a card opens and closes', /opens when you select its heading/.test(CARDS_INSTRUCTION) && /again to close/.test(CARDS_INSTRUCTION));

const card = readFileSync('src/app/components/SettingsCard.tsx', 'utf8');
ok('a card is a heading holding a real button with aria-expanded and aria-controls, and a region named by the heading', /<h4/.test(card) && /<button/.test(card) && /type="button"/.test(card) && /aria-expanded=\{open\}/.test(card) && /aria-controls=\{`\$\{id\}-body`\}/.test(card) && /role="region"/.test(card) && /aria-labelledby=\{`\$\{id\}-heading`\}/.test(card) && /hidden=\{!open\}/.test(card));
ok('the button is at least 44 px tall and has no animation or transition (so nothing to switch off for reduced motion)', /min-h-11/.test(card) && !/transition|animate|animation/.test(card.replace(/\/\/.*$/gm, '')));
ok('the heading button leaves the focus ring to the site\'s own (it removes no outline)', !/outline-none|focus:outline-none/.test(card));

const panel = readFileSync('src/app/components/AccessibilitySettings.tsx', 'utf8');
ok('the panel keeps its open cards in its own state, starting closed, and stores nothing', /useState<OpenCards>\(NO_CARDS_OPEN\)/.test(panel) && !/localStorage|sessionStorage|savePref|usePref/.test(panel));
ok('the panel gives the instruction and Open all / Close all at the top', /\{CARDS_INSTRUCTION\}/.test(panel) && />Open all</.test(panel) && />Close all</.test(panel));
ok('every card id is used once, with its own title', SETTINGS_CARD_IDS.every((id) => (panel.match(new RegExp(`card\\('${id}',`, 'g')) ?? []).length === 1));
ok('Logo look is a card of its own', /card\('logo-look', 'Logo look'/.test(panel));
const popout = readFileSync('src/app/components/BreathingPopout.tsx', 'utf8');
ok('the live preview is in the popout\'s left column, outside the cards, so changes are seen as they are made', popout.indexOf('<ValarBreathingLogo') > -1 && popout.indexOf('<ValarBreathingLogo') < popout.indexOf('<AccessibilitySettingsContent'));
