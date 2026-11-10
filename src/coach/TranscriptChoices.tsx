// What the person allows us to do with a transcript they send, and for how long (src/lib/transcriptPolicy.ts). Nothing is chosen for them: a keeping time must
// be picked before it can be sent, the other uses start unchecked, and publishing asks what to show.
import { USES, KEEPS, USE_LABELS, KEEP_LABELS, type Choices, type Keep, type Use } from '../lib/transcriptPolicy';

export interface ChoiceState {
  keep: Keep | null;
  uses: Use[];
  /** 'all', or the numbers of the messages to show; empty until chosen. */
  portions: 'all' | number[];
  /** How long it may stay on the public page; null until chosen. */
  showFor: Keep | null;
}
export const emptyChoices = (): ChoiceState => ({ keep: null, uses: [], portions: [], showFor: null });

const RANK: Record<Keep, number> = { '30d': 1, '90d': 2, '1y': 3, 'until-asked': 4 };
/** A copy cannot stay on show longer than the transcript is kept. */
export const showForFits = (keep: Keep, show: Keep): boolean => RANK[keep] >= RANK[show];

/** The valid choices to send, or null while something still has to be chosen. */
export function choicesToSend(c: ChoiceState): Choices | null {
  if (!c.keep) return null;
  if (c.uses.includes('publish')) {
    if (c.portions !== 'all' && c.portions.length === 0) return null;
    if (!c.showFor || !showForFits(c.keep, c.showFor)) return null;
  }
  return { keep: c.keep, uses: c.uses, ...(c.uses.includes('publish') ? { portions: c.portions, showFor: c.showFor! } : {}) };
}

interface Props {
  value: ChoiceState;
  onChange: (next: ChoiceState) => void;
  /** The conversation's messages, so a person can pick which to show. */
  messages: { role: 'user' | 'assistant'; content: string }[];
  /** True when the site's safety check stopped a message: such a conversation cannot be offered for the public page. */
  publishBlocked?: boolean;
}

export function TranscriptChoices({ value, onChange, messages, publishBlocked = false }: Props) {
  const toggleUse = (u: Use) => onChange({ ...value, uses: value.uses.includes(u) ? value.uses.filter((x) => x !== u) : [...value.uses, u] });
  const publishing = value.uses.includes('publish');
  const picked = value.portions === 'all' ? [] : value.portions;
  return (
    <div className="space-y-4 rounded-lg border border-border p-3 text-sm">
      <fieldset className="space-y-2">
        <legend className="font-medium">What may we do with it?</legend>
        <p className="text-xs text-muted-foreground">We will read it and consider what you wrote: that is why you are sending it. Everything else below is up to you, and nothing is checked for you.</p>
        {USES.map((u) => {
          const blocked = u === 'publish' && publishBlocked;
          return (
            <label key={u} className={`flex items-start gap-2 ${blocked ? 'opacity-60' : ''}`}>
              <input type="checkbox" className="mt-1 size-4" disabled={blocked} checked={!blocked && value.uses.includes(u)} onChange={() => toggleUse(u)} />
              <span>
                {USE_LABELS[u].label}
                <span className="block text-xs text-muted-foreground">
                  {blocked ? 'Not available for this conversation. When the site\u2019s safety check stops a message, we never offer the conversation for the public page, to protect you.' : USE_LABELS[u].detail}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {publishing && (
        <fieldset className="space-y-2 rounded-md bg-muted/40 p-2">
          <legend className="font-medium">What would we show?</legend>
          <label className="flex items-start gap-2">
            <input type="radio" name="portions" className="mt-1 size-4" checked={value.portions === 'all'} onChange={() => onChange({ ...value, portions: 'all' })} />
            <span>The whole conversation<span className="block text-xs text-muted-foreground">With names and contact details removed.</span></span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="portions" className="mt-1 size-4" checked={value.portions !== 'all'} onChange={() => onChange({ ...value, portions: picked })} />
            <span>Only the messages I choose<span className="block text-xs text-muted-foreground">An excerpt, with names and contact details removed.</span></span>
          </label>
          {value.portions !== 'all' && (
            <ul className="ml-6 space-y-1">
              {messages.map((m, i) => (
                <li key={i}>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1 size-4" checked={picked.includes(i)} onChange={() => onChange({ ...value, portions: picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i].sort((a, b) => a - b)})} />
                    <span className="text-xs"><b>{m.role === 'user' ? 'You' : 'The AI'}:</b> {m.content.length > 140 ? m.content.slice(0, 140) + '…' : m.content}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div role="radiogroup" aria-label="How long may it stay on the page?" className="space-y-1">
            <p className="font-medium">How long may it stay up once it is there?</p>
            {KEEPS.map((k) => {
              const fits = !value.keep || showForFits(value.keep, k);
              return (
                <label key={k} className={`flex items-center gap-2 ${fits ? '' : 'opacity-50'}`}>
                  <input type="radio" name="showfor" className="size-4" disabled={!fits} checked={value.showFor === k} onChange={() => onChange({ ...value, showFor: k })} />
                  {KEEP_LABELS[k].replace('Delete it after', 'Take it down after').replace('Keep it until I ask for it to be deleted', 'Until I ask for it to come down')}
                </label>
              );
            })}
            {!value.showFor && <p className="text-xs text-muted-foreground" role="status">Choose one to be able to send. It comes down by itself on that day; it can never stay up longer than we keep the transcript.</p>}
          </div>
          <p className="text-xs text-muted-foreground">Names and contact details were replaced as you wrote, but not every name is caught. Read what you are choosing. A person at Nenya reads and edits it by hand before anything goes up, and may decide not to show it.</p>
        </fieldset>
      )}

      <fieldset className="space-y-2">
        <legend className="font-medium">How long may we keep it?</legend>
        {KEEPS.map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="radio" name="keep" className="size-4" checked={value.keep === k} onChange={() => onChange({ ...value, keep: k })} />
            {KEEP_LABELS[k]}
          </label>
        ))}
        {!value.keep && <p className="text-xs text-muted-foreground" role="status">Choose one to be able to send.</p>}
      </fieldset>

      <p className="text-xs text-muted-foreground">
        <b>Taking it back later.</b> Keep the signed file you download. Showing it at nenya.biz/my-transcript lets you stop any of these uses, take a public copy down, or ask for it to be deleted. It can only ever remove permissions, never add them. Whoever holds the file can do this, so keep it as private as the conversation. We remove what we hold at once or on the day you chose; we cannot recall copies other people made, and a copy in our email inbox is removed by hand.
      </p>
    </div>
  );
}
