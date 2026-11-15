// Serves the DRAFT learning cards (not approved) to a dev site's page for testing: only where COACH_CARD_DRAFTS=on (otherwise this does not exist), from the site's private store (key cards/drafts.json,
// written from the private card folder with scripts/build-draft-cards.mts and uploaded by the owner). Never on production: nothing is read from the repository, and without the variable the answer is 404.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';

export const DRAFTS_KEY = 'cards/drafts.json';
let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s; };

export default async function handler(req: Request): Promise<Response> {
  if (process.env.COACH_CARD_DRAFTS !== 'on') return new Response('Not found', { status: 404 });
  if (req.method !== 'GET') return new Response(null, { status: 405 });
  try {
    const store = (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as { get(k: string, o: { type: 'text' }): Promise<string | null> };
    const text = await store.get(DRAFTS_KEY, { type: 'text' });
    return new Response(text ?? '[]', { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch {
    return new Response('[]', { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
}

export const config = { path: '/api/card-drafts' };
