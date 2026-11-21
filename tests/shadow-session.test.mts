// The shadow ID (src/lib/shadowSession.ts): random, in memory only, kept for the session, the person's own colors win, made at agreement under the switch.
import { readFileSync } from 'node:fs';
import { newShadow, sessionIdFor, termsFirstOn } from '../src/lib/shadowSession.ts';
import { sessionIdFrom } from '../src/lib/savedReflection.ts';
import { ok } from './helpers.mts';

const src = readFileSync('src/lib/shadowSession.ts', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');

const a = newShadow(), b = newShadow();
ok('a shadow pair is two random colors in the session-ID form, and a new one differs', /^#[0-9a-f]{6}\.#[0-9a-f]{6}$/.test(a) && a !== b);
ok('it is built from the random source it is given (nothing time-derived)', newShadow(() => new Uint8Array([1, 2, 3, 4, 5, 6])) === '#010203.#040506' && newShadow(() => new Uint8Array([1, 2, 3, 4, 5, 6])) === '#010203.#040506');
ok('with no colors chosen the shadow pair is the session ID', sessionIdFor(undefined, undefined, a) === a);
const sight = { color1: '#112233', color2: '#445566' }, sound = { melodyColor1: '#AABBCC', melodyColor2: '#DDEEFF' };
ok('the person\'s own Sight colors are the session ID', sessionIdFor(sight, sound, a) === sessionIdFrom('#112233', '#445566'));
ok('Sound\'s melody colors are the session ID when Sight is not there', sessionIdFor(undefined, sound, a) === sessionIdFrom('#AABBCC', '#DDEEFF'));
ok('if both lenses are dropped, the same shadow pair is the ID again (it was kept)', sessionIdFor(sight, sound, a) !== a && sessionIdFor(undefined, undefined, a) === a);
ok('it can be made again at any time and the session ID simply follows', sessionIdFor(undefined, undefined, b) === b);
ok('a bad color pair falls through to the shadow pair', sessionIdFor({ color1: 'red', color2: '#445566' }, undefined, a) === a);
ok('the switch is off by default', termsFirstOn() === false);
ok('the module never stores or sends anything', !/localStorage|sessionStorage|indexedDB|fetch\(|document\.cookie/.test(src));
ok('App makes the pair at agreement under the switch, and the mark is not set before it exists', /termsFirst && !termsAgreed \? '' : newShadow\(\)/.test(app) && /termsFirst && termsAgreed && !shadow/.test(app) && /setSessionMarkId\(sessionId \|\| null\)/.test(app));
