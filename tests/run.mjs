// Runs every tests/*.test.* file in its own process and fails if any check fails.
//   npm test
// Needs Node 22.18 or newer (the test files are TypeScript and Node strips the types itself).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const root = fileURLToPath(new URL('..', import.meta.url));
const files = readdirSync(dir).filter((f) => /\.test\.m?[tj]s$/.test(f)).sort();
let pass = 0, fail = 0, crashed = 0;

for (const f of files) {
  const r = spawnSync(process.execPath, [dir + f], { cwd: root, encoding: 'utf8', timeout: 180000, env: { ...process.env, COACH_SIGNING_KEY: '', COACH_EXTRA_HOSTS: '', COACH_FORM_CHECK: 'off' } });
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
