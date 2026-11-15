import { useState, type FormEvent } from 'react';
import { deleteSubmission } from '../lib/reportSubmission';

// Delete a report or message you sent, with the code you were given (src/lib/submissions.ts). The code goes only to /api/submit; the answer is the same whether
// or not there was anything to delete, so a code cannot be used to learn what someone else sent.
export function DeleteSubmission() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || state === 'sending') return;
    setState('sending');
    try {
      await deleteSubmission(code.trim());
      setState('done');
      setCode('');
    } catch {
      setState('error');
    }
  };
  return (
    <section aria-labelledby="delete-submission" className="space-y-3 rounded-lg border border-border p-4">
      <h2 id="delete-submission" className="text-xl">Delete a report or message you sent</h2>
      <p className="text-sm text-muted-foreground">
        When you send a report, a reflection summary or a message, you get a deletion code. Enter it here and it is deleted at once. Without the code, it is deleted on
        its own 90 days after you sent it.
      </p>
      <form onSubmit={submit} className="space-y-2">
        <label htmlFor="deletion-code" className="block text-sm">Deletion code</label>
        <input
          id="deletion-code"
          type="text"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-base"
        />
        <button type="submit" disabled={state === 'sending'} className="min-h-11 rounded-md border border-border px-4 text-sm">
          Delete it
        </button>
      </form>
      <p role="status" className="text-sm">
        {state === 'done' && 'Done. If that code matched something you sent, it is deleted now.'}
        {state === 'error' && 'That did not go through. Try again in a moment.'}
      </p>
    </section>
  );
}
