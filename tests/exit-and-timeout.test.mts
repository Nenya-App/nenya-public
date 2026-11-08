// Emergency Exit that cannot be backed out of, an Exit that is reachable behind every overlay, the coach's quiet timeout,
// the optional sound step, transcript file names, and Identity email links.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { shouldLeaveAgain, noteIsStale, EXIT_NOTE_KEY, EXIT_URL } from '../src/lib/emergencyExit.ts';
import { quietState, TIMEOUT_CHOICES, DEFAULT_TIMEOUT, TICKET_MINUTES, OPEN_REMINDER_MINUTES } from '../src/lib/chatTimeout.ts';
import { transcriptFilename } from '../src/lib/transcript.ts';
import { identityTarget } from '../src/admin/identityRedirect.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const MIN = 60000;

// ---- the Back guard
ok('after an exit, a page reached by Back leaves again', shouldLeaveAgain('back_forward', '1'));
ok('so does a page restored from the browser cache', shouldLeaveAgain('navigate', '1', true));
ok('a fresh visit (typed address, link, reload) does not', !shouldLeaveAgain('navigate', '1') && !shouldLeaveAgain('reload', '1') && !shouldLeaveAgain(undefined, '1'));
ok('with no exit note nothing happens', !shouldLeaveAgain('back_forward', null) && !noteIsStale('navigate', null));
ok('a fresh visit clears a stale note; a Back visit keeps it', noteIsStale('navigate', '1') && !noteIsStale('back_forward', '1') && !noteIsStale('navigate', '1', true));
ok('the exit goes to a neutral page and uses replace, not a new history entry', /^https:\/\/en\.wikipedia\.org\//.test(EXIT_URL) && /location\.replace\(EXIT_URL\)/.test(src('src/lib/emergencyExit.ts')) && !/location\.href\s*=/.test(src('src/lib/emergencyExit.ts')));
ok('the note lives in session storage (this tab only) and is set after the wipe', EXIT_NOTE_KEY === 'nenya.exited' && /wipeDevice\([\s\S]*sessionStorage\.setItem\(EXIT_NOTE_KEY/.test(src('src/lib/emergencyExit.ts')));
ok('every visitor page runs the guard before drawing', ['src/main.tsx', 'src/coach/main.tsx', 'src/verify/main.tsx'].every((f) => src(f).includes('guardBackAfterExit()')));
ok('both the button and the dialog leave through the one routine', (src('src/app/components/EmergencyExit.tsx').match(/leaveNow\(/g) ?? []).length >= 2 && !/location\.replace/.test(src('src/app/components/EmergencyExit.tsx')));

// ---- the Exit is reachable behind every overlay
const app = src('src/app/App.tsx');
ok('the main page shows a pinned Exit during the loading screen, the first-visit panel, the tour offer and the tour', /<EmergencyExitDock\s+show=\{!veilGone \|\| !termsAgreed \|\| tourOffered \|\| tutorialActive\}/.test(app));
ok('the pinned Exit is outside the inert wrapper and before the loading screen', app.indexOf('<EmergencyExitDock') < app.indexOf('<LoadingVeil') && app.indexOf('<EmergencyExitDock') < app.indexOf('inert'));
const dock = src('src/app/components/EmergencyExit.tsx');
ok('the pinned Exit sits above every overlay and respects the phone notch', /z-\[300\]/.test(dock) && /safe-area-inset-top/.test(dock));
ok('the coach page and the verify page carry one too', src('src/coach/CoachPage.tsx').includes('<EmergencyExitDock') && src('src/verify/VerifyPage.tsx').includes('<EmergencyExitDock show'));

// ---- the quiet timeout
ok('the choices are 10, 15 and 20 minutes plus leave open, and stop short of the ticket lifetime', JSON.stringify(TIMEOUT_CHOICES) === '[10,15,20]' && Math.max(...TIMEOUT_CHOICES) < TICKET_MINUTES && DEFAULT_TIMEOUT === 15);
ok('the ticket lifetime here matches the server', new RegExp(`TICKET_TTL_MS = ${TICKET_MINUTES} \\* 60 \\* 1000`).test(src('netlify/functions/coach.mts')));
ok('nothing happens early', quietState(15, 0).kind === 'fine' && quietState(15, 9 * MIN).kind === 'fine');
const w = quietState(15, 10 * MIN + 1);
ok('the first warning comes with five minutes left', w.kind === 'warn' && !w.last && w.minutesLeft === 5);
const w2 = quietState(15, 14 * MIN + 30000);
ok('the last warning comes with a minute left', w2.kind === 'warn' && w2.last);
ok('it closes at the chosen time and stays closed', quietState(15, 15 * MIN).kind === 'closed' && quietState(15, 99 * MIN).kind === 'closed');
ok('a 10 minute choice warns at five minutes of quiet', quietState(10, 5 * MIN).kind === 'warn' && quietState(10, 4 * MIN).kind === 'fine');
ok('leave open never closes, and reminds once quiet runs close to the ticket limit', quietState('open', 19 * MIN).kind === 'fine' && quietState('open', OPEN_REMINDER_MINUTES * MIN).kind === 'open-reminder' && quietState('open', 500 * MIN).kind !== 'closed');
ok('negative time is treated as zero', quietState(10, -5000).kind === 'fine');
const demo = src('src/coach/CoachDemo.tsx');
ok('the start screen and the chat both offer the choice', demo.includes('id="coach-quiet-start"') && demo.includes('id="coach-quiet-chat"'));
ok('closing by quiet does not count as a finished conversation (no rest is set)', !/setTimedOut\(true\);[\s\S]{0,40}markFinished/.test(demo) && /useEffect\(\(\) => \{\s*if \(stage === 'done' && !stopped\) markFinished\(\)/.test(demo));
ok('the quiet clock pauses while a reply is on its way and the notice never takes focus', /sending \? 0 : now - activeAt/.test(demo) && !/focus\(/.test(src('src/coach/QuietTimeout.tsx')));
ok('the choice is kept only in memory', !/localStorage|sessionStorage/.test(src('src/coach/QuietTimeout.tsx') + src('src/lib/chatTimeout.ts')));

// ---- the sound step is optional
const picker = src('src/coach/SessionKeyPicker.tsx');
ok('the session key can be continued without playing the sound', !picker.includes('Hear your sound first') && /disabled=\{!valid\} onClick=\{\(\) => onComplete/.test(picker));

// ---- transcript file names
const hash = 'ce7819e8aa5b8c3ba503ff28d264553debc6c7ed8e4729263dc8444e549bb60c';
ok('a signed file name carries the first 8 of the hash and the time to the second', transcriptFilename({ hash, issuedAt: '2026-11-07T20:53:46.474Z' }, 'json') === 'nenya-coach-transcript-ce7819e8-20261107T205346Z.json');
ok('the readable copy matches', transcriptFilename({ hash, issuedAt: '2026-11-07T20:53:46.474Z' }, 'txt') === 'nenya-coach-transcript-ce7819e8-20261107T205346Z.txt');
ok('an unsigned copy says so and uses the time it was made', transcriptFilename(null, 'txt', new Date('2026-11-08T01:02:03.456Z')) === 'nenya-coach-transcript-unsigned-20261108T010203Z.txt');
ok('odd characters can never reach the file name', /^nenya-coach-transcript-[0-9a-f]{0,8}-?[0-9TZ]*|^nenya-coach-transcript-unsigned/.test(transcriptFilename({ hash: '../../evil;rm', issuedAt: 'x' }, 'json')) && !/[\/\;: ]/.test(transcriptFilename({ hash: '../../evil;rm', issuedAt: '2026-11-07T20:53:46.474Z' }, 'json')));
ok('a bad time falls back to now rather than a broken name', /^nenya-coach-transcript-[0-9a-f]{8}-\d{8}T\d{6}Z\.json$/.test(transcriptFilename({ hash, issuedAt: 'garbage' }, 'json')));

// ---- Identity email links
ok('an invite, reset, confirmation or email-change link on the front page is passed to /admin/ with its token', ['invite_token', 'recovery_token', 'confirmation_token', 'email_change_token'].every((t) => identityTarget(`#${t}=abc`) === `/admin/#${t}=abc`));
ok('ordinary visits are left alone', identityTarget('') === null && identityTarget('#about') === null && identityTarget('#xrecovery_token=1') === null && identityTarget('?recovery_token=1') === null);
ok('the front page loads only the tiny forwarder, not the sign-in library', src('src/main.tsx').includes('forwardIdentityLinks()') && !/@netlify\/identity/.test(src('src/admin/identityRedirect.ts')));
