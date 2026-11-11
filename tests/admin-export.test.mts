// The admin page's spreadsheet export and names.
import { totalsCsv, csvFilename } from '../src/admin/exportCsv.ts';
import { label, groupTitle, GROUPS } from '../src/admin/labels.ts';
import { ALL_EVENTS } from '../src/lib/counters.ts';
import { ok } from './helpers.mts';

const stats = {
  days: ['2026-11-07', '2026-11-06', '2026-11-05'], // newest first, as the endpoint sends them
  events: ['coach.turn.sent', 'coach.turn.blocked.ip', 'page.view.welcome', 'onboarding.rhythm.box'],
  counts: { '2026-11-07': { 'coach.turn.sent': 5, 'page.view.welcome': 3 }, '2026-11-05': { 'coach.turn.sent': 2 } },
};
const csv = totalsCsv(stats);
const lines = csv.trim().split('\r\n');
ok('the header has the columns and the days oldest first', lines[0] === 'Group,Event,Name,Total,2026-11-05,2026-11-06,2026-11-07');
ok('there is one row per event, including events with no count', lines.length === 1 + stats.events.length && lines[2].startsWith('Coach demo,coach.turn.blocked.ip,Blocked: ip,0,0,0,0'));
ok('a row has its total and its days in order', lines[1] === 'Coach demo,coach.turn.sent,Messages sent,7,2,0,5');
ok('rows are grouped by their section', lines[3].startsWith('Screens shown,') && lines[4].startsWith('Opening and tour,'));
ok('the file ends with a line break and uses spreadsheet line endings', csv.endsWith('\r\n') && !csv.includes('\n\n'));
ok('the file name carries the date range', csvFilename(stats.days) === 'nenya-numbers-2026-11-05-to-2026-11-07.csv' && csvFilename([]) === 'nenya-numbers.csv');
ok('every real event has a name, a group and nothing odd in its row', ALL_EVENTS.every((e) => label(e).length > 0 && groupTitle(e) !== 'Other'));
ok('an empty range still gives a header', totalsCsv({ days: [], events: [], counts: {} }) === 'Group,Event,Name,Total\r\n');
ok('cells with a comma, quote or line break are quoted', totalsCsv({ days: ['d'], events: ['a,"b'], counts: {} }).includes('"a,""b"'));
ok('the groups cover the coach, partner practice, the opening and the screens', GROUPS.map((g) => g.title).join() === 'Coach demo,Partner practice,Opening and tour,Screens shown');
