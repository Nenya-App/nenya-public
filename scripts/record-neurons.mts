// Records Neurons you spent by hand (bake-offs, full-exchange tests) in the canary's ledger, so the nightly canary does not spend what you already did:
// Workers AI's free allowance is shared by every use of the account, and resets at 00:00 UTC.
//
//   node scripts/record-neurons.mts 1264                 # adds 1,264 to today's (UTC) manual total, on the staging store
//   node scripts/record-neurons.mts 1264 --site <id>     # another site's store
// Needs the Netlify CLI signed in. The bake-off and full-exchange scripts call this for you; it never fails them.
import { spawnSync } from 'node:child_process';
import { utcDay } from '../src/lib/canaryBudget.ts';

const STAGING = '97904664-55f7-489a-8d5d-8fefcbba44f0';
const STORE = 'coach-private-staging';
export function recordNeurons(n: number, site = STAGING, store = STORE): string {
  if (!Number.isFinite(n) || n <= 0) return 'nothing to record';
  const env = { ...process.env, NETLIFY_SITE_ID: site };
  const get = spawnSync('npx', ['netlify-cli', 'blobs:get', store, 'canary/manual'], { encoding: 'utf8', env, timeout: 60_000 });
  let manual: Record<string, number> = {};
  try { manual = JSON.parse(get.stdout || '{}'); } catch { manual = {}; }
  const day = utcDay();
  manual[day] = Math.round((manual[day] ?? 0) + n);
  const set = spawnSync('npx', ['netlify-cli', 'blobs:set', store, 'canary/manual', JSON.stringify(manual)], { encoding: 'utf8', env, timeout: 60_000 });
  return set.status === 0 ? `recorded ${Math.round(n)} Neurons for ${day} (today's manual total: ${manual[day]})` : 'could not record (is the Netlify CLI signed in?)';
}
if (process.argv[1]?.endsWith('record-neurons.mts')) {
  const a = process.argv.slice(2);
  console.log(recordNeurons(Number(a[0]), a.includes('--site') ? a[a.indexOf('--site') + 1] : STAGING));
}
