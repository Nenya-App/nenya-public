// Tells IndexNow search engines (Bing, Yandex, Naver, Seznam) which public pages changed.
// Run after a deploy is live:  npm run indexnow          (sends)
//                              npm run indexnow -- --dry (prints what would be sent)
// Only the URLs in public/sitemap.xml, the host, and the public key go out. No visitor data.
import { readFileSync } from 'node:fs';

const HOST = 'nenya.biz';
const KEY = '2acef17ab61946f1845fa3e4b410c777'; // public by design; the same string is served at /<key>.txt
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urlList.length || urlList.some((u) => new URL(u).host !== HOST)) {
  console.error('Sitemap is empty or lists a URL outside ' + HOST + '. Nothing sent.');
  process.exit(1);
}

const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };

if (process.argv.includes('--dry')) {
  console.log('Would POST to ' + ENDPOINT + ':\n' + JSON.stringify(body, null, 2));
  process.exit(0);
}

// The key file has to be live first, or the engines reject the submission.
const check = await fetch(body.keyLocation);
if (!check.ok || (await check.text()).trim() !== KEY) {
  console.error('Key file is not live at ' + body.keyLocation + '. Deploy first, then run this again.');
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log(`IndexNow responded ${res.status} (200 or 202 means accepted).`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
