// Runs every tests/*.test.* file in its own process and fails if any check fails.
//   npm test
// Needs Node 24, as package.json says (the test files are TypeScript and Node strips the types itself; 22.18 is the oldest that can).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const root = fileURLToPath(new URL('..', import.meta.url));
const files = readdirSync(dir).filter((f) => /\.test\.m?[tj]s$/.test(f)).sort();
let pass = 0, fail = 0, crashed = 0;
// The site's own settings are left out, so a test gives the same result on a laptop with a .env, in a Netlify shell and in CI.
// A test that needs one of them sets it itself.
const SITE_VARS = /^(COACH_|CELL_|PALETTE_|TURNSTILE_|VENICE_|VITE_|NENYA_)/;
const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !SITE_VARS.test(k)));

for (const f of files) {
  const r = spawnSync(process.execPath, [dir + f], { cwd: root, encoding: 'utf8', timeout: 180000, env: { ...baseEnv, COACH_SIGNING_KEY: '', COACH_EXTRA_HOSTS: '', COACH_FORM_CHECK: 'off' } });
  const lines = (r.stdout ?? '').split('\n');
  const p = lines.filter((l) => l.startsWith('PASS')).length;
  const x = lines.filter((l) => l.startsWith('FAIL')).length;
  pass += p; fail += x;
  const bad = r.status !== 0 && x === 0;
  if (bad) crashed++;
  console.log(`${r.status === 0 ? 'ok  ' : 'FAIL'}  ${f.padEnd(34)} ${p} passed${x ? `, ${x} failed` : ''}`);
  if (r.status !== 0) {
    for (const l of lines.filter((l) => l.startsWith('FAIL'))) console.log('      ' + l);
    if (bad) console.log((r.stderr || r.stdout || '').split('\n').slice(0, 12).map((l) => '      ' + l).join('\n'));
  }
}
console.log(`\n${pass} passed, ${fail} failed${crashed ? `, ${crashed} test file(s) crashed` : ''}`);
process.exit(fail || crashed ? 1 : 0);
