import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNotes, type ModuleSet } from '../src/lib/coachModules.ts';

test('the provenance record never reaches the notes the model reads', () => {
  const set: ModuleSet = {
    core: 'CORE TEXT',
    modules: { reserves: 'RESERVES TEXT' },
    provenance: { reserves: { tag: 'F', note: 'PROVENANCE-SECRET-NOTE' } },
  };
  const notes = buildNotes(set, ['I have nothing left, I am exhausted and running on fumes']);
  assert.ok(notes.includes('CORE TEXT'));
  assert.ok(!notes.includes('PROVENANCE-SECRET-NOTE'));
  assert.ok(!/provenance/i.test(notes));
});
