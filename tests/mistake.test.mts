// "This was a mistake": counts a kind, reads nothing else, and refuses anything that is not a known kind or an allowed site.
import { eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import handler, { __useStoreForTests } from '../netlify/functions/mistake.mts';
import { ok } from './helpers.mts';
const data = new Map<string, { v: string; e: number }>(); let etag = 0;
__useStoreForTests({
  async getWithMetadata(k: string) { const d = data.get(k); return d ? { data: d.v, etag: String(d.e) } : null; },
  async set(k: string, v: string, o: any) { const d = data.get(k); if (o?.onlyIfNew && d) return { modified: false }; if (o?.onlyIfMatch && (!d || String(d.e) !== o.onlyIfMatch)) return { modified: false }; data.set(k, { v, e: ++etag }); return { modified: true }; },
});
const post = (body: unknown, origin = 'https://nenya.biz', path = '/api/mistake', method = 'POST') => handler(new Request('https://nenya.biz' + path, { method, headers: { 'content-type': 'application/json', origin }, body: method === 'GET' ? undefined : JSON.stringify(body) }));
const n = (k: string) => Number(data.get(eventKey(capDay(), `coach.mistake.${k}`))?.v ?? 0);
ok('a known kind is counted', (await post({ kind: 'challenge' })).status === 200 && n('challenge') === 1);
await post({ kind: 'offer' }); await post({ kind: 'form' }); await post({ kind: 'form' });
ok('each kind has its own count', n('offer') === 1 && n('form') === 2);
ok('an unknown kind is refused and counts nothing', (await post({ kind: 'anything' })).status === 400 && [...data.keys()].every((k) => /coach\.mistake\.(challenge|offer|form)$/.test(k)));
ok('a message sent by mistake is not read or kept', (await post({ kind: 'form', text: 'a private message' })).status === 200 && ![...data.values()].some((x) => /private/.test(x.v)));
ok('a site that is not allowed is refused', (await post({ kind: 'form' }, 'https://evil.example')).status === 403);
ok('a wrong method or path is refused', (await post({}, 'https://nenya.biz', '/api/mistake', 'GET')).status === 405 && (await post({}, 'https://nenya.biz', '/api/other')).status === 404);
ok('the stored counts hold only names and numbers', [...data.keys()].every((k) => /^m\/\d{4}-\d{2}-\d{2}\/coach\.mistake\.[a-z]+$/.test(k)));
