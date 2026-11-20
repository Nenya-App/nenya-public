import { useId, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { valarColors } from './ValarBreathingLogo';
import { describePlainly } from '../../lib/colorNames';
import { shapesFor } from '../../lib/gatewayShapes';
import { DESCRIPTION_MAX, MAX_CUSTOM_LENSES, NAME_MAX, type CustomLens, type CustomLensField } from '../../lib/customLens';

// A minimal form for a lens of your own (docs/eight-sided-gem-scope.md Part 2, section 5), shown with the lens ring. It is for this visit only: nothing typed here is saved to the device,
// added to a report or sent anywhere, and the form says so. The text is shown back as plain text (React escapes it), never as markup.

interface Props {
  count: number;
  onAdd: (input: { name: string; color: number; description: string; pattern: string }) => { errors: Partial<Record<CustomLensField, string>> | null; added: CustomLens | null };
}

export function CustomLensForm({ count, onAdd }: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<number | null>(null);
  const [pattern, setPattern] = useState('');
  const [errors, setErrors] = useState<Partial<Record<CustomLensField, string>>>({});
  const [done, setDone] = useState('');
  const full = count >= MAX_CUSTOM_LENSES;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = onAdd({ name, color: color as number, description, pattern });
    setErrors(r.errors ?? {});
    if (r.added) {
      setDone(`Your lens ${r.added.name} was added. It is the last leaf of the ring and the last lens in the list below.`);
      setName(''); setDescription(''); setColor(null); setPattern(''); setOpen(false);
    } else setDone('');
  };

  return (
    <section aria-label="Make a lens of your own" className="space-y-3">
      <p role="status" aria-live="polite" className="text-sm text-center">{done}</p>
      {!open && (
        <div className="text-center space-y-1">
          <Button variant="outline" className="min-h-11" disabled={full} aria-expanded={false} onClick={() => { setOpen(true); setDone(''); }}>Make a lens of your own</Button>
          {full && <p className="text-sm text-muted-foreground">You have made {MAX_CUSTOM_LENSES} lenses, which is the most. Take one out to make another.</p>}
        </div>
      )}
      {open && (
        <form onSubmit={submit} className="max-w-xl mx-auto space-y-4 border border-border rounded-lg p-4 sm:p-6" noValidate>
          <h2 className="text-xl">A lens of your own</h2>
          <p className="text-sm text-muted-foreground">It stays on this device and only for this visit. It is not saved, not added to your report, and not sent anywhere. Write in English. You can make up to {MAX_CUSTOM_LENSES}.</p>
          {errors.limit && <p role="alert" className="text-sm text-destructive">{errors.limit}</p>}
          <div className="space-y-1">
            <Label htmlFor={`${uid}-name`}>Name (1 to {NAME_MAX} characters)</Label>
            <Input id={`${uid}-name`} className="min-h-11" value={name} maxLength={NAME_MAX * 2} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-error` : undefined} autoComplete="off" />
            {errors.name && <p id={`${uid}-name-error`} role="alert" className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${uid}-desc`}>One line about it (optional, up to {DESCRIPTION_MAX} characters)</Label>
            <Textarea id={`${uid}-desc`} rows={2} value={description} maxLength={DESCRIPTION_MAX * 2} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} aria-describedby={errors.description ? `${uid}-desc-error` : undefined} />
            {errors.description && <p id={`${uid}-desc-error`} role="alert" className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <fieldset className="space-y-2" aria-describedby={errors.color ? `${uid}-color-error` : undefined}>
            <legend className="text-sm">Colour</legend>
            <div className="flex flex-wrap gap-2">
              {valarColors.map((v, i) => {
                const hex = v.vector[0];
                return (
                  <label key={v.name} className={`relative inline-flex items-center gap-2 min-h-11 min-w-11 px-2 rounded-md border cursor-pointer ${color === i ? 'border-foreground border-4' : 'border-border'}`}>
                    <input type="radio" name={`${uid}-color`} className="sr-only" checked={color === i} onChange={() => setColor(i)} aria-label={`${v.name}, ${describePlainly(hex)}`} />
                    <span aria-hidden="true" className="inline-block size-6 rounded-full border border-foreground" style={{ background: hex }} />
                    <span className="text-sm">{v.name}{color === i ? ' (chosen)' : ''}</span>
                  </label>
                );
              })}
            </div>
            {errors.color && <p id={`${uid}-color-error`} role="alert" className="text-sm text-destructive">{errors.color}</p>}
          </fieldset>
          <div className="space-y-1">
            <Label htmlFor={`${uid}-pattern`}>A Pattern to open with it (optional)</Label>
            <select id={`${uid}-pattern`} className="min-h-11 w-full rounded-md border border-border bg-background px-2" value={pattern} onChange={(e) => setPattern(e.target.value)} aria-describedby={errors.pattern ? `${uid}-pattern-error` : undefined}>
              <option value="">None</option>
              {shapesFor('pattern').map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            {errors.pattern && <p id={`${uid}-pattern-error`} role="alert" className="text-sm text-destructive">{errors.pattern}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-h-11">Add my lens</Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => { setOpen(false); setErrors({}); }}>Cancel</Button>
          </div>
        </form>
      )}
    </section>
  );
}
