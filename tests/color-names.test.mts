// Suggesting a name for a colour: the nearest name by OKLab distance from the bundled MIT list, a plain description for people who cannot see it, and
// the words a screen reader says. The real list is loaded the way the page loads it.
import { describePlainly, loadColorNames, speakSuggestion, suggestName, toOklab } from '../src/lib/colorNames.ts';
import { ok } from './helpers.mts';

ok('hex becomes OKLab, and black and white are where they should be', Math.abs(toOklab('#ffffff')![0] - 1) < 0.01 && Math.abs(toOklab('#000000')![0]) < 0.01 && toOklab('nope') === null && toOklab('#12') === null);
const tiny = [{ name: 'Test Red', hex: '#ff0000' }, { name: 'Test Blue', hex: '#0000ff' }, { name: 'Test Green', hex: '#00ff00' }, { name: 'Test Navy', hex: '#000080' }];
const s = suggestName('#fe0202', tiny)!;
ok('the nearest name is chosen, with how well it fits and the next nearest', s.name === 'Test Red' && s.closeness === 'close' && s.others.length === 3 && suggestName('#7f007f', tiny)!.closeness === 'loose');
ok('a bad colour or an empty list gives nothing', suggestName('x', tiny) === null && suggestName('#ff0000', []) === null);
ok('plain words describe a colour without the name', describePlainly('#000080') === 'a dark, vivid blue' || /dark.*blue/.test(describePlainly('#000080')));
ok('greys, white and black are described as such', describePlainly('#808080') === 'medium grey' && /white/.test(describePlainly('#ffffff')) && /black/.test(describePlainly('#000000')));
ok('hues are told apart', ['#cc0000:red', '#ff8800:orange', '#ddcc00:yellow', '#00aa00:green', '#0099aa:teal', '#2244cc:blue', '#8833cc:purple'].every((x) => { const [h, w] = x.split(':'); return new RegExp(w).test(describePlainly(h)); }));
const say = speakSuggestion('Current state', '#fe0202', s);
ok('what a screen reader says: the label, a plain description, the name and its fit, and that it is only a suggestion', /^Current state: a .* red\./.test(say) && /Test Red, a close match/.test(say) && /only a suggestion/.test(say) && /keep your own words/.test(say));
ok('without a name it still says what the colour is', /^Wish: a /.test(speakSuggestion('Wish', '#123456', null)));

// the real list, as the page loads it
const list = await loadColorNames();
ok('the list is the 5,000 "best of" names, each with a name and a hex', list.length === 5000 && list.every((c) => c.name && /^#[0-9a-f]{6}$/i.test(c.hex)));
const t0 = Date.now();
const real = suggestName('#1B4F6E', list)!;
ok('a real colour gets a real name, a fit, and alternatives, quickly', !!real.name && ['close', 'rough', 'loose'].includes(real.closeness) && real.others.length === 3 && Date.now() - t0 < 500, `${real.name} ${real.closeness}`);
ok('a colour that is in the list exactly is a close match', suggestName(list[0].hex, list)!.closeness === 'close' && suggestName(list[100].hex, list)!.name === list[100].name || suggestName(list[100].hex, list)!.closeness === 'close');
