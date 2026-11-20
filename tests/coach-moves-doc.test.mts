// The public plain-language description of the coach's moves (docs/coach-moves.md): CNVC credited exactly, the communal layer marked as ours, nothing private in it.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const doc = readFileSync('docs/coach-moves.md', 'utf8');
const scope = readFileSync('docs/coach-modules-scope.md', 'utf8');
ok('the CNVC credit is given exactly as CNVC asks', /The Center for Nonviolent Communication © 2023, \[www\.CNVC\.org\]\(https:\/\/www\.CNVC\.org\)/.test(doc));
ok('the communal needs layer is called a project extension, not CNVC\'s, and untested', /communal needs[^.]*extension by this project and is not CNVC/.test(doc) && /not yet been tested/.test(doc));
ok('the source is credited with the approved sentence word for word, and with no claim of endorsement', doc.includes(`Dr. Yvette Erasmus, clinical psychologist and founder of the School of Human Connection, whose publicly available Conversations from the Heart podcast provided source material for identifying relational coaching patterns used in developing Nenya.`) && /does not mean she endorses, reviewed or stands behind Nenya/.test(doc) && !/Credit for the source of the patterns goes here/.test(doc));
ok('it says the labels are model annotations, the examples are new, and rare moves are drafts', /model annotations, not expert-verified/.test(doc) && /newly written/.test(doc) && (doc.match(/\(draft\)/g) ?? []).length >= 2);
ok('it says the app\'s safety rules come first and no move is used in distress', /Nothing here overrides the app's safety rules/.test(doc) && /no move below is used/.test(doc));
ok('it covers each move, and leaves out the body invitation', ['Reflecting back', 'Naming the need underneath', 'Another way of seeing it', 'Words they could say', 'One open question', 'A short explanation', 'Saying where you stop', 'Permission to want or feel it', 'Practicing the first sentence'].every((h) => doc.includes(h)) && /does not use the body or breathing as an opening/.test(doc));
ok('it carries no private text: no module wording header, no counts from the source calls, no ids', !/In the coach's own words/.test(doc) && !/\b(?:230|63 episodes|46%|23%)\b/.test(doc) && !/PRIVATE_id_map|nenya_anonymized/.test(doc));
ok('the scope records the structure agreed, and that the wording stays private and was not uploaded', /## The moveset \(2026-11-20\)/.test(scope) && /not uploaded to the store/.test(scope) && /ARC_EXCLUDED_MODULES/.test(scope));
