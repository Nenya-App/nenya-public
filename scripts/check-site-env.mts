// Reads the PRODUCTION site's environment variables from Netlify (read-only) and reviews them against docs/production-env.md (src/lib/envReview.ts). It prints variable NAMES, and values only for
// plain switches; the value of anything secret-looking is never printed. Needs a Netlify token and the site id, from hidden prompts or the environment:
//   NETLIFY_API_TOKEN=... NETLIFY_SITE_ID=... node scripts/check-site-env.mts
// The Netlify call shape (account env endpoint) is from memory of their API: if it answers differently the script says so and stops, and nothing is changed. It only reads.
import { reviewEnv, showsValue, type EnvVar } from '../src/lib/envReview.ts';

const token = process.env.NETLIFY_API_TOKEN, siteId = process.env.NETLIFY_SITE_ID;
if (!token || !siteId) { console.error('needs NETLIFY_API_TOKEN and NETLIFY_SITE_ID (use the production site)'); process.exit(1); }
console.log(`Checking site ${siteId} (read-only)...`);
const get = async (path: string): Promise<any> => {
  let res: Response;
  try { res = await fetch(`https://api.netlify.com/api/v1${path}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) }); }
  catch (e) { console.error(`Could not reach Netlify (${(e as Error).name}). Nothing was changed.`); process.exit(1); }
  if (!res.ok) { console.error(`Netlify answered ${res.status} for ${path.split('?')[0]}. Nothing was changed.`); process.exit(1); }
  return res.json();
};
const site = await get(`/sites/${siteId}`);
if (!site.account_id) { console.error('Netlify did not accept the token (no account came back). Check it is a personal access token with access to this site. Nothing was changed.'); process.exit(1); }
console.log(`Site: ${site.name} (${site.url ?? site.ssl_url ?? 'no url'})`);
const raw = await get(`/accounts/${site.account_id}/env?site_id=${siteId}`);
if (!Array.isArray(raw)) { console.error('Unexpected answer from Netlify (not a list). Nothing was changed.'); process.exit(1); }
const vars: EnvVar[] = raw.map((e: any) => {
  const prodValue = (e.values ?? []).find((v: any) => v.context === 'production' || v.context === 'all');
  return { key: String(e.key), isSecret: !!e.is_secret, inProduction: !!prodValue, value: prodValue?.value ?? null };
});
console.log(`${vars.length} variables, ${vars.filter((v) => v.inProduction).length} with a production value.\n`);
for (const f of reviewEnv(vars)) console.log(`${f.level.padEnd(8)} ${f.key}  ${f.note}`);
console.log('\nAll names with a production value (values shown only for plain switches):');
for (const v of vars.filter((x) => x.inProduction).sort((a, b) => a.key.localeCompare(b.key))) console.log(`  ${v.key}${showsValue(v) && String(v.value).length <= 60 ? ` = ${v.value}` : ''}`);
