// The recorder behind the live figures (scripts/lib/checksRecord.mts, used by scripts/eval-detect.mts --record): the version fingerprint, the checks on the groups file, and appending a run to the record. Counts only.
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendRun, buildRun, codeFingerprint, listsFingerprint, parseGroupsFile } from '../scripts/lib/checksRecord.mts';
import { ok } from './helpers.mts';

const g = (cases: number, caught: number, slurCases = 10, slursCaught = 5) => ({ cases, caught, slurCases, slursCaught });
const cnt = (flagged: number, tested: number) => ({ flagged, tested });
type Rec = { current: { lists: string; model: string | null } | null; runs: { date: string; groups?: Record<string, { cases: number }> }[] };

{
  const dir = mkdtempSync(join(tmpdir(), 'checks-'));
  const file = join(dir, 'record.json');
  const fp = listsFingerprint('list text', 'decisions text', 'abcdef12');
  ok('the fingerprint is hashes only and changes with the list, the decisions and the code', /^[0-9a-f]{12}\.[0-9a-f]{8}\.abcdef12$/.test(fp) && fp !== listsFingerprint('list text2', 'decisions text', 'abcdef12') && fp !== listsFingerprint('list text', 'decisions text2', 'abcdef12') && fp !== listsFingerprint('list text', 'decisions text', 'abcdef13') && /\.none\./.test(listsFingerprint('x', null, 'abcdef12')));
  ok('the code fingerprint is eight hex characters and stable', /^[0-9a-f]{8}$/.test(codeFingerprint(new URL('../src/lib', import.meta.url).pathname)) && codeFingerprint(new URL('../src/lib', import.meta.url).pathname) === codeFingerprint(new URL('../src/lib/', import.meta.url).pathname));
  const groups = parseGroupsFile(JSON.stringify({ model: 'abc123 int8 at the 2% line', modelFalseAlarms: { hatecheck: cnt(20, 1165), ethos: cnt(15, 565) }, neutralIdentity: cnt(0, 315), groups: { women: g(373, 169, 24, 20) } }));
  const r1 = buildRun({ now: new Date(2026, 10, 22, 3, 0), source: 'nightly', lists: fp, listFalseAlarms: { hatecheck: cnt(12, 1165), ethos: cnt(2, 565) }, groupsFile: groups });
  const a1 = appendRun(file, r1, false);
  ok('the first run is recorded but not used until a current version is set', a1.current === null && !a1.usedByPage);
  const a2 = appendRun(file, buildRun({ now: new Date(2026, 10, 23, 3, 0), source: 'nightly', lists: fp, listFalseAlarms: { hatecheck: cnt(12, 1165), ethos: cnt(2, 565) }, groupsFile: groups }), true);
  ok('--set-current pins the version and counts both runs of it', a2.usedByPage && a2.runsOfCurrent === 2 && a2.current?.lists === fp && a2.current?.model === groups.model);
  const a3 = appendRun(file, buildRun({ now: new Date(2026, 10, 24, 3, 0), source: 'nightly', lists: listsFingerprint('changed list', 'decisions text', 'abcdef12'), listFalseAlarms: { hatecheck: cnt(0, 1165), ethos: cnt(0, 565) } }), false);
  ok('a run of another version is appended but not used, and the page keeps the current version', !a3.usedByPage && a3.runsOfCurrent === 2);
  const written = JSON.parse(readFileSync(file, 'utf8')) as Rec;
  ok('the date is the local date of the run', written.runs[0].date === '2026-11-22' && written.runs[1].date === '2026-11-23');
  ok('the file holds the three runs, and the groups of the first two', written.runs.length === 3 && written.runs.filter((r) => r.groups).length === 2);
  const badFiles = [
    { model: 'x', modelFalseAlarms: { hatecheck: cnt(2, 1), ethos: cnt(0, 1) }, neutralIdentity: cnt(0, 1), groups: { women: g(1, 1) } }, // flagged above tested
    { model: 'x', modelFalseAlarms: { hatecheck: cnt(0, 1), ethos: cnt(0, 1) }, neutralIdentity: cnt(0, 1), groups: { 'some words here: 1': g(1, 1) } }, // a group name that is not a name
    { model: 'a\nb', modelFalseAlarms: { hatecheck: cnt(0, 1), ethos: cnt(0, 1) }, neutralIdentity: cnt(0, 1), groups: { women: g(1, 1) } }, // text in the model string
    { model: 'x', modelFalseAlarms: { hatecheck: cnt(0, 1), ethos: cnt(0, 1) }, neutralIdentity: cnt(0, 1), groups: { women: g(1.5, 1) } }, // not a whole number
  ];
  const refusals = badFiles.map((b) => { try { parseGroupsFile(JSON.stringify(b)); return false; } catch { return true; } });
  ok('the groups file is refused when counts are impossible, a name or the model string carries text, or a number is not whole', refusals.every(Boolean), refusals.join(','));
  const extra = parseGroupsFile(JSON.stringify({ model: 'x', extra: 'words', modelFalseAlarms: { hatecheck: cnt(0, 1), ethos: cnt(0, 1) }, neutralIdentity: cnt(0, 1), groups: { women: { ...g(1, 1), text: 'words' } } }));
  ok('an unknown field in the groups file is dropped, never copied into the record', !JSON.stringify(extra).includes('words'));
  let srcRefused = false;
  try { buildRun({ now: new Date(), source: 'a line\nwith a break', lists: fp, listFalseAlarms: { hatecheck: cnt(0, 1), ethos: cnt(0, 1) } }); } catch { srcRefused = true; }
  ok('a source label with odd characters is refused', srcRefused);
}
