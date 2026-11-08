import { describeChoice, TICKET_MINUTES, TIMEOUT_CHOICES, type QuietState, type TimeoutChoice } from '../lib/chatTimeout';

// The chosen length of quiet before a conversation closes by itself. Used on the start screen and inside the chat.
export function QuietTimeoutPicker({
  value,
  onChange,
  id,
  compact = false,
}: {
  value: TimeoutChoice;
  onChange: (v: TimeoutChoice) => void;
  id: string;
  compact?: boolean;
}) {
  const options: TimeoutChoice[] = [...TIMEOUT_CHOICES, 'open'];
  return (
    <div className={compact ? 'flex flex-wrap items-center gap-2 text-xs text-muted-foreground' : 'space-y-2'}>
      <label htmlFor={id} className={compact ? '' : 'block text-sm font-medium'}>
        Close this conversation after quiet for
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(e.target.value === 'open' ? 'open' : (Number(e.target.value) as TimeoutChoice))}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {describeChoice(o)}
          </option>
        ))}
      </select>
      {!compact && (
        <p className="text-xs text-muted-foreground">
          This is your own boundary, and you can change it in the chat. Before it closes you will be reminded that you can
          save a copy. Choosing &ldquo;Leave open&rdquo; means this page will not close the conversation, but the coach can
          only continue one that has had a message in the last {TICKET_MINUTES} minutes.
        </p>
      )}
    </div>
  );
}

// A gentle notice shown in the conversation when it has been quiet for a while. Announced politely, never moving focus.
export function QuietNotice({
  state,
  choice,
  onKeepOpen,
  onSave,
}: {
  state: QuietState;
  choice: TimeoutChoice;
  onKeepOpen: () => void;
  onSave: () => void;
}) {
  if (state.kind !== 'warn' && state.kind !== 'open-reminder') return null;
  const text =
    state.kind === 'warn'
      ? state.last
        ? 'This conversation will close in about a minute. Nothing is kept, so save a copy now if you would like one.'
        : `It has been quiet for a while. This conversation will close in about ${state.minutesLeft} minutes (you chose ${describeChoice(choice)}). You can save a copy first; nothing is kept on our side.`
      : `It has been quiet for ${state.minutesQuiet} minutes. The coach can only continue a conversation that has had a message in the last ${TICKET_MINUTES} minutes, so if you want a signed copy, this is a good time to save one.`;
  return (
    <div role="status" aria-live="polite" className="space-y-3 rounded-2xl border border-border bg-card/60 p-4 text-sm">
      <p>{text}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onSave} className="rounded-md border border-border px-3 py-2 hover:bg-accent">
          Save a copy
        </button>
        {state.kind === 'warn' && (
          <button type="button" onClick={onKeepOpen} className="rounded-md border border-border px-3 py-2 hover:bg-accent">
            Keep it open a while longer
          </button>
        )}
      </div>
    </div>
  );
}
