// The choice of how the coach talks: Reflect (listens and reflects, the default) or Learn (adds a little teaching, one idea at a time).
// Changing it takes effect with the next exchange. Shown only where the site has turned Learn on. The server falls back to Reflect
// when someone seems to be in distress or the topic is a sensitive one, and says nothing about it beyond the care.
export type StanceChoice = 'nenya' | 'vilya';

export function StancePicker({ value, onChange, compact = false }: { value: StanceChoice; onChange: (v: StanceChoice) => void; compact?: boolean }) {
  const options: { id: StanceChoice; label: string; text: string }[] = [
    { id: 'nenya', label: 'Reflect', text: 'listens, reflects, and helps you find your own words' },
    { id: 'vilya', label: 'Learn', text: 'also shares a short idea now and then, when your own words show it fits' },
  ];
  return (
    <fieldset className={compact ? 'flex flex-wrap items-center gap-3 text-xs text-muted-foreground' : 'space-y-2'}>
      <legend className={compact ? 'sr-only' : 'text-sm font-medium'}>How would you like the coach to be?</legend>
      {options.map((o) => (
        <label key={o.id} className={compact ? 'flex items-center gap-1.5' : 'flex items-start gap-2 text-sm'}>
          <input type="radio" name={compact ? 'coach-stance-chat' : 'coach-stance-start'} checked={value === o.id} onChange={() => onChange(o.id)} className="mt-1" />
          <span>
            <span className={compact ? 'font-medium text-foreground' : 'font-medium'}>{o.label}</span>
            {!compact && <span className="text-muted-foreground">: {o.text}</span>}
          </span>
        </label>
      ))}
      {!compact && <p className="text-xs text-muted-foreground">You can change this at any time. If you seem to be having a hard time, the coach will go back to Reflect.</p>}
    </fieldset>
  );
}
