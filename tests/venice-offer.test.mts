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

// Venice AI's own terms: linked, and what they ask of people using its service through Nenya is passed on.
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const { VENICE_TERMS_URL, VENICE_PRIVACY_URL } = await import('../src/lib/veniceLinks.ts');
  const terms = JSON.stringify(LEGAL_PARTS);
  ok('the Terms link Venice AI’s terms and privacy policy', terms.includes(VENICE_TERMS_URL) && terms.includes(VENICE_PRIVACY_URL));
  ok('under-18s use the coach only with a parent’s or guardian’s consent (Venice terms, section 4)', /under 18, please use the coach demo only with a parent/.test(terms) && /under 18, please use it only\s+with a parent/.test(coach));
  ok('the prohibited uses Venice asks for are in the Terms (section 12)', ['anything illegal', 'abuses or exploits a child', 'name, voice or likeness', 'misstate your age', 'bots, scripts or automated requests', 'resell or pass on access', 'death, serious injury or significant harm'].every((p) => terms.includes(p)));
  ok('no warranty is made on Venice’s behalf, and the limits protect it too (section 7.3)', /We make no promise on Venice AI.s behalf/.test(terms) && /also protect Venice AI/.test(terms) && /not medical, legal, financial, tax or mental health advice/.test(terms));
  // The About page "AI Chat Demo (Venice)" (About-thesis chapter 5, 2026-11-22) states the differences in its own words, dated, without the unverified clause
  // "most features need an account" that VENICE_DIFFERENCES still carries; the coach and the review screen keep using VENICE_DIFFERENCES.
  const veniceChat = src('src/app/components/about/VeniceChat.tsx').replace(/\s+/g, ' ');
  ok('every place that offers Venice links its terms and privacy policy', [coach, review].every((f) => f.includes('VENICE_TERMS_URL') && f.includes('VENICE_PRIVACY_URL') && f.includes('VENICE_DIFFERENCES')) && veniceChat.includes('VENICE_TERMS_URL') && veniceChat.includes('VENICE_PRIVACY_URL'));
  ok('the Venice page states the differences itself: under 18, United States, arbitration with a 30-day opt-out, and the date of the terms', /Anyone under 18 needs a parent(?:&rsquo;|’|')s or guardian(?:&rsquo;|’|')s consent/.test(veniceChat) && /intended for people in the United States/.test(veniceChat) && /binding individual arbitration with no class actions, unless you opt out by mail within 30 days \(Venice terms, updated 8 June 2026\)/.test(veniceChat));
}
