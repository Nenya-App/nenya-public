// Guard recall: runs the invented paraphrase families through the site's own phrase check (checkConversation) and reports recall by family, tier, kind, category and register,
// and the false-flag rate on the near-misses, with 95% Wilson intervals. No model, no network, no key. See docs/guard-recall.md.
//
//   node scripts/guard-recall.mts --families <file> [--only <family or paraphrase id>] [--split all|tune|heldout] [--json <out>] [--list]
//
// The families file is NOT in the repository (its labels are the owner's to review); it is read from the path given. The terminal summary prints ids and counts, never the text of a message;
// the text is in the --json file only, which therefore stays private. This is a recall on invented wordings, not a detection rate for real people, and not a claim of safety.
// Exit codes: 0 ran, 2 wrong use, 3 the families file is missing or malformed, 1 anything else.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { buildReport, FamiliesError, formatSummary, parseFamilies, runAll, sha256Hex, splitOf, type SplitChoice } from '../src/lib/guardRecall.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const USAGE = 'Usage: node scripts/guard-recall.mts --families <file> [--only <family or paraphrase id>] [--split all|tune|heldout] [--json <out>] [--list]';
const fail = (code: number, msg: string): never => {
  console.error(msg);
  process.exit(code);
};

const args = process.argv.slice(2);
const opt = (name: string): string | undefined => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) fail(2, `${name} needs a value.\n${USAGE}`);
  return v;
};
const known = new Set(['--families', '--only', '--split', '--json', '--list']);
const withValue = new Set(['--families', '--only', '--split', '--json']);
for (let i = 0; i < args.length; i++) {
  if (!args[i].startsWith('--')) fail(2, `Unexpected argument: ${args[i]}\n${USAGE}`);
  if (!known.has(args[i])) fail(2, `Unknown option: ${args[i]}\n${USAGE}`);
  if (withValue.has(args[i])) i++;
}
const familiesPath = opt('--families');
if (!familiesPath) fail(2, USAGE);
const split = (opt('--split') ?? 'all') as SplitChoice;
if (!['all', 'tune', 'heldout'].includes(split)) fail(2, `--split must be all, tune or heldout.\n${USAGE}`);
const only = opt('--only');
const jsonOut = opt('--json');

let bytes: Buffer;
try {
  bytes = readFileSync(familiesPath!);
} catch (e) {
  fail(3, `Cannot read the families file: ${(e as Error).message}`);
}
let file;
try {
  file = parseFamilies(JSON.parse(bytes!.toString('utf8')));
} catch (e) {
  if (e instanceof FamiliesError) fail(3, e.message);
  fail(3, `The families file is not valid JSON: ${(e as Error).message}`);
}
const familiesSha256 = sha256Hex(bytes!);

if (args.includes('--list')) {
  console.log(`families ${file!.version ?? 'unversioned'}, sha256 ${familiesSha256.slice(0, 16)}...  (ids and counts only)`);
  for (const f of file!.families) {
    const ids = f.items.map((i) => splitOf(file!.version, i.id));
    const pos = f.items.filter((i) => i.expectFlag).length;
    console.log(`${f.id.padEnd(22)} ${f.category}, ${f.tier}${f.kind ? ', ' + f.kind : ''}   should flag ${pos}, near-misses ${f.items.length - pos}   tune ${ids.filter((s) => s === 'tune').length}, heldout ${ids.filter((s) => s === 'heldout').length}`);
  }
  process.exit(0);
}

// The guard's own source files, so a result says which code it describes.
const GUARD_FILES = ['safetyPhrases.ts', 'safetyFlags.ts', 'selfInjury.ts', 'safetyConstructs.ts', 'safetyNormalize.ts'];
let fingerprint: string | null = null;
try {
  fingerprint = sha256Hex(GUARD_FILES.map((n) => readFileSync(root + 'src/lib/' + n, 'utf8')).join('\n----\n')).slice(0, 16);
} catch {
  /* left null */
}
let commit: string | null = null;
try {
  commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
} catch {
  /* not a git checkout */
}

let run;
try {
  run = runAll(file!, { split, only });
} catch (e) {
  fail(2, (e as Error).message);
}
const sel = { split, only };
const report = buildReport(file!, run!.families, run!.results, sel, { ranAt: new Date().toISOString(), familiesPath: basename(familiesPath!), familiesSha256, commit, fingerprint });
console.log(formatSummary(report, run!.results));
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(report, null, 2) + '\n');
  console.log(`\nWrote ${jsonOut} (it holds the invented messages: keep it private, never commit it).`);
}
