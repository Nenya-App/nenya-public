// Signs a terms receipt (src/lib/termsReceipt.ts) when a visitor agrees to the Terms of Use and Privacy Policy. Nothing is stored and no address or other identifier is recorded or signed: the answer holds the
// Terms' effective date, the site's time, the build, and a signature. The page keeps it for the visit.
import { hostAllowed } from '../../src/lib/originHosts.ts';
import { signTerms } from '../../src/lib/termsReceipt.ts';
import { LEGAL_EFFECTIVE_DATE } from '../../src/lib/legalDocument.ts';
import { buildLabel } from '../../src/lib/buildInfo.ts';

const ROUTE = '/api/terms-agree';
const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  if (new URL(req.url).pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  let originHost = '';
  try { const o = req.headers.get('origin'); originHost = o ? new URL(o).hostname : ''; } catch { originHost = ''; }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return json(403, { error: 'origin' });
  const receipt = signTerms(LEGAL_EFFECTIVE_DATE, buildLabel(process.env.COACH_BUILD), new Date(), process.env.COACH_SIGNING_KEY);
  // Without a signing key there is no receipt; the page carries on with an unsigned note on this device only.
  return receipt ? json(200, { receipt }) : json(503, { error: 'signing-off' });
};

// Literal values on purpose: Netlify reads this block by static analysis. Keep `path` in step with ROUTE above.
export const config = { path: '/api/terms-agree', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
