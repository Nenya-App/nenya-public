// The gateways copy: plain summaries that match the pages, and no claim that the number of routes is what protects privacy.
import { readFileSync } from 'node:fs';
import { GATEWAY_SUMMARIES, GATEWAY_ROUTES } from '../src/lib/gatewaySummaries.ts';
import { ok } from './helpers.mts';
const welcome = readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8');
const gateways = readFileSync('src/app/components/pages/GatewaysPage.tsx', 'utf8');
const touch = readFileSync('src/app/components/pages/TouchGatewayPage.tsx', 'utf8');

ok('one short summary for each of the six gateways, in the order of the gateways page', GATEWAY_SUMMARIES.map((g) => g.id).join() === 'sight,sound,touch,essence,movement,insight' && GATEWAY_SUMMARIES.every((g) => g.summary.split(' ').length <= 18));
ok('the route count is the real count: one to six gateways, in any order', GATEWAY_ROUTES === 6 + 30 + 120 + 360 + 720 + 720);
ok('the Touch summary names the five dimensions the page has', ['Texture', 'Temperature', 'Pressure', 'Weight', 'Sharpness'].every((d) => touch.includes(`label="${d}"`) && GATEWAY_SUMMARIES[2].summary.toLowerCase().includes(d.toLowerCase())));
ok('the old claims are gone: atoms, 10^108, "mathematical necessity", sovereignty', !/observable universe|10¹⁰⁸|mathematical necessity|sovereignty/.test(gateways));
ok('privacy is credited to what stays on the device, not to the number of routes', /what you choose stays on your device/.test(gateways));
ok('the welcome page shows the summaries under "Everything else can wait", as a labeled list', /lensSummaries\(\)\.map/.test(welcome) && /aria-labelledby="gateways-overview"/.test(welcome) && welcome.indexOf('Everything else can wait') < welcome.indexOf('gateways-overview'));
