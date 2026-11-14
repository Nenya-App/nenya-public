// After a safety stop, the site never offers Venice AI as a substitute.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { noteSafetyStop, veniceOfferAllowed, resetVeniceOffer } from '../src/lib/veniceOffer.ts';
import { ok } from './helpers.mts';
const src = (f: string) => readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), f), 'utf8');
const coach = src('src/coach/CoachDemo.tsx');
const review = src('src/app/components/pages/GatewayReviewPage.tsx');
const lib = src('src/lib/veniceOffer.ts');

resetVeniceOffer();
ok('the offer is allowed before any stop', veniceOfferAllowed());
noteSafetyStop();
ok('after a stop the offer is withdrawn for the rest of the visit', !veniceOfferAllowed());
resetVeniceOffer();
ok('the stop is held only in page memory, never in storage', !/localStorage|sessionStorage|indexedDB|document\.cookie/.test(lib.replace(/^\s*\/\/.*$/gm, '')));
ok('a stop caught on the device is noted', /if \(local\?\.tier === 'stop'\) \{\s*noteSafetyStop\(\);/.test(coach));
ok('a stop returned by the server is noted', /if \(data\.flag\.tier === 'stop'\) noteSafetyStop\(\);/.test(coach));
ok('every place the coach shows the Venice panel is gated', (coach.match(/\{venicePanel\}|&& venicePanel\}/g) ?? []).length === 3 && (coach.match(/offerVenice && venicePanel\}/g) ?? []).length === 3);
ok('the panel is never offered after any safety notice in the conversation', /const offerVenice = !flag && veniceOfferAllowed\(\);/.test(coach));
ok('the rest and limit screens mention Venice only when the offer is allowed', !/You can also continue with the\s*\n\s*same character on Venice/.test(coach) && /offerVenice \? ', or you can continue/.test(coach));
ok('the review page hides "Take it to Venice" and its note after a stop', (review.match(/veniceOfferAllowed\(\) &&/g) ?? []).length === 2);
