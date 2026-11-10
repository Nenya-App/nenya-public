// Bringing part of a reflection report to the coach, always the visitor's choice (docs/report-to-coach-scope.md): the report is listed in pieces with
// NOTHING selected, the exact words that would be sent are shown (identifiers already replaced), and "No thanks" is as easy as "Share these".
// A report is not needed to use the coach; with none in memory, a saved text report can be pasted instead.
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Textarea } from '../app/components/ui/textarea';
import { paletteOfHex } from '../app/components/paletteLookup';
import { scrubPII, describeScrub } from '../lib/piiScrub';
import { describePlainly, loadColorNames, suggestName, type NamedColor } from '../lib/colorNames';
import { valarColors } from '../app/components/ValarBreathingLogo';
import { displayNameFor } from '../lib/paletteNames';
import { buildContext, buildFragments, fragmentsFromText, type Fragment, type SharedText } from '../lib/reportFragments';
import { MAX_SHARED_CHARS } from '../lib/reportShare';
import type { BodyMapLike, Gateway } from '../lib/reportText';

export interface ReportInput {
  gatewayData: { gateway: Gateway; data: any }[];
  bodyMap?: BodyMapLike;
}

interface ReportShareProps {
  report?: ReportInput;
  shared: SharedText | null;
  onChange: (next: SharedText | null) => void;
  /** Locked once the conversation has started (the shared text is bound into it). */
  locked?: boolean;
}

export function ReportShare({ report, shared, onChange, locked = false }: ReportShareProps) {
  const [pasted, setPasted] = useState('');
  const [pastedFragments, setPastedFragments] = useState<Fragment[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set()); // nothing is chosen by default
  // The colour names are a lazy chunk; once loaded, colours are described in plain words (and named) in what is shared.
  const [names, setNames] = useState<NamedColor[] | null>(null);
  useEffect(() => { let on = true; loadColorNames().then((l) => on && setNames(l)).catch(() => {}); return () => { on = false; }; }, []);
  const words = useMemo(() => (hex: string): string | null => {
    const plain = describePlainly(hex);
    const s = names ? suggestName(hex, names) : null;
    return s ? `${plain}; the nearest named colour is ${s.name}${s.closeness === 'close' ? '' : ` (a ${s.closeness} match)`}` : plain;
  }, [names]);
  const paletteColorWords = useMemo(() => (paletteName: string): string | null => {
    const v = valarColors.find((p) => displayNameFor(p.name) === paletteName);
    return v ? `Its colours, in words: ${v.vector.map((h) => `${h.toUpperCase()} ${words(h)}`).join('; ')}.` : null;
  }, [words]);
  const own = useMemo(() => (report && (report.gatewayData.length > 0 || report.bodyMap) ? buildFragments(report.gatewayData, report.bodyMap, paletteOfHex, words) : []), [report, words]);
  const fragments = pastedFragments ?? own;

  const chosen = fragments.filter((f) => picked.has(f.id));
  const built = useMemo(() => {
    const raw = buildContext(chosen, paletteColorWords);
    const scrubbed = scrubPII(raw.text);
    return { ...raw, text: scrubbed.text, chars: scrubbed.text.length, fits: scrubbed.text.length <= MAX_SHARED_CHARS, counts: scrubbed.counts, replaced: scrubbed.total };
  }, [chosen.map((f) => f.id).join('|'), fragments, paletteColorWords]);

  if (locked) {
    return shared ? (
      <p className="rounded-xl border border-border bg-card/50 p-3 text-xs text-muted-foreground" role="status">
        You brought parts of a report to this conversation ({shared.meta.sections.join(', ')}). They are part of it now.
      </p>
    ) : null;
  }

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <details className="rounded-2xl border border-border bg-card/50 p-4">
      <summary className="cursor-pointer text-sm text-foreground">Bring something from a report you made (optional)</summary>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground">
        <p>
          You do not need a report to talk with the coach, and nothing from one is shared unless you choose it here. If you do, you pick the pieces, and you
          see exactly the words the coach would be given. They go through our server to Venice AI along with your messages, and through the same safety
          checks. Palettes are starting points, not a measurement, and no color has a fixed meaning.
        </p>

        {fragments.length === 0 && (
          <div className="space-y-2">
            <label htmlFor="report-paste" className="block text-foreground">
              Paste a saved report (the .txt file from the review page)
            </label>
            <Textarea id="report-paste" value={pasted} onChange={(e) => setPasted(e.target.value)} rows={4} className="resize-none text-sm" maxLength={20000} />
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPastedFragments(fragmentsFromText(pasted, paletteOfHex))}
                disabled={!pasted.trim()}
              >
                Read it
              </Button>
              {pastedFragments && pastedFragments.length === 0 && (
                <span role="status" className="text-xs">That does not look like a Nenya report.</span>
              )}
            </div>
          </div>
        )}

        {fragments.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-foreground">Choose the pieces to share (none are chosen for you)</legend>
            {fragments.map((f) => (
              <label key={f.id} className="flex items-start gap-2">
                <input type="checkbox" checked={picked.has(f.id)} onChange={() => toggle(f.id)} className="mt-0.5 size-4 shrink-0" />
                <span>{f.title}</span>
              </label>
            ))}
          </fieldset>
        )}

        {chosen.length > 0 && (
          <div className="space-y-2">
            <p className="text-foreground">This is exactly what the coach would be given:</p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs text-foreground" aria-label="The words that would be shared">{built.text}</pre>
            {built.replaced > 0 && <p className="text-xs">Before sharing, I replaced {describeScrub(built.counts)} with placeholders.</p>}
            <p className={`text-xs ${built.fits ? '' : 'text-destructive'}`} role="status">
              {built.chars} of {MAX_SHARED_CHARS} characters{built.fits ? '.' : '. That is more than the coach can take at once: choose fewer pieces.'}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={() => onChange(built)}
            disabled={chosen.length === 0 || !built.fits}
          >
            Share these
          </Button>
          <button
            type="button"
            className="text-sm underline underline-offset-4 hover:text-foreground"
            onClick={() => { setPicked(new Set()); onChange(null); }}
          >
            No thanks, I would rather talk about something else
          </button>
        </div>
        {shared && (
          <p role="status" className="text-xs text-foreground">
            Sharing: {shared.meta.sections.join(', ')}. You can change or remove this until you start.
          </p>
        )}
      </div>
    </details>
  );
}
