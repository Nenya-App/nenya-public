// The version label that goes into signed transcripts: release number, branch (unless main) and commit, written at build time.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { BUILD_INFO } from '../src/generated/build-info.ts';
import { buildLabel, formatBuild } from '../src/lib/buildInfo.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const sha = '679c4d2e1f0a9b8c7d6e5f40312a9b8c7d6e5f40';

ok('production (main) has no branch part', formatBuild({ version: '1.1.0', commit: sha, branch: 'main' }) === '1.1.0+679c4d2');
ok('staging (dev) carries its branch name', formatBuild({ version: '1.1.0', commit: sha, branch: 'dev' }) === '1.1.0-dev+679c4d2');
ok('branch names are made safe and short', formatBuild({ version: '1.1.0', commit: sha, branch: 'Feature/Odd Name!! with-very-long-text' }) === '1.1.0-feature-odd-name+679c4d2');
ok('no git information still gives a label, never "unknown"', formatBuild({ version: '1.1.0', commit: '', branch: '' }) === '1.1.0-local+nogit' && !formatBuild({ version: '', commit: '', branch: '' }).includes('unknown'));
ok('a malformed version falls back rather than leaking text', formatBuild({ version: 'x; rm', commit: sha, branch: 'main' }) === '0.0.0+679c4d2');
ok('an explicit override wins, kept to safe characters and 40 long', buildLabel('my build/1', BUILD_INFO) === 'mybuild1' && buildLabel('a'.repeat(80), BUILD_INFO).length === 40 && buildLabel('', BUILD_INFO) === formatBuild(BUILD_INFO) && buildLabel(undefined, BUILD_INFO) === formatBuild(BUILD_INFO));
ok('the generated file carries the package.json version', BUILD_INFO.version === pkg.version);
ok('it is regenerated before the build, the tests, the type check and the dev server, and not committed', ['prebuild', 'pretest', 'pretypecheck', 'predev'].every((k) => pkg.scripts[k] === 'node scripts/write-build-info.mjs') && /^src\/generated\/$/m.test(readFileSync(join(root, '.gitignore'), 'utf8')));
ok('the coach signs the generated label, not a host variable it cannot see', /buildLabel\(process\.env\.COACH_BUILD\)/.test(readFileSync(join(root, 'netlify/functions/coach.mts'), 'utf8')) && !/COMMIT_REF/.test(readFileSync(join(root, 'netlify/functions/coach.mts'), 'utf8')));
