// Testing a Venice character card on its own: the request that is built, how an answer is read, and the script's card mode.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildCardRequest, readCardReply, isCardSlug, VENICE_CHAT_URL } from '../src/lib/veniceCard.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const req = buildCardRequest('nenya-21', 'deepseek-v3.2', [{ role: 'user', content: 'Are you a real person?' }]);
ok('the request names the character and sends no system message: the card is the only instruction', req.venice_parameters.character_slug === 'nenya-21' && !req.messages.some((m: any) => m.role === 'system') && req.venice_parameters.include_venice_system_prompt === false && req.model === 'deepseek-v3.2');
ok('it turns off web search, scraping and citations, as the coach does, and asks for a whole answer', req.venice_parameters.enable_web_search === 'off' && req.venice_parameters.enable_web_scraping === false && req.venice_parameters.enable_web_citations === false && req.stream === false);
ok('it goes to Venice\'s chat endpoint, and carries only the conversation (no ticket, no session colors, no key)', VENICE_CHAT_URL === 'https://api.venice.ai/api/v1/chat/completions' && JSON.stringify(req).indexOf('ticket') < 0 && JSON.stringify(req).indexOf('Bearer') < 0);
ok('an answer is read and thinking is removed; an empty or odd answer gives null', readCardReply({ choices: [{ message: { content: '<think>hmm</think> I am an AI.' } }] }) === 'I am an AI.' && readCardReply({ choices: [{ message: { content: '  ' } }] }) === null && readCardReply({}) === null && readCardReply(null) === null);
ok('a slug is letters, digits and hyphens only', isCardSlug('nenya-20') && isCardSlug('Nenya-21') && !isCardSlug('nenya 20') && !isCardSlug('../x') && !isCardSlug('https://venice.ai/c/nenya-20') && !isCardSlug(''));
const script = readFileSync(join(root, 'scripts/eval-persona.mts'), 'utf8');
ok('the script has --card and --card-model, validates the slug, records which card was tested, and never prints the key', /--card /.test(script) && /--card-model/.test(script) && /isCardSlug\(card\)/.test(script) && /instructions = card \? `card:\$\{card\}`/.test(script) && !/console\.(?:log|error)\([^)]*process\.env\.VENICE_API_KEY/.test(script));
ok('in card mode every call goes straight to Venice with the card (the coach function is not used)', /pacedSend\(card \? cardSend : rawSend/.test(script) && /buildCardRequest\(card!, cardModel, messages\)/.test(script));
