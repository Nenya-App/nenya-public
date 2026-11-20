import { LinkedText } from '../app/components/ExternalLink';
import { resourcesFor, type SafetyFlag } from '../lib/safetyFlags';
import { WORDS } from '../lib/rephraseWords';

// What the reader sees when their device finds words that may be about someone being in danger (docs/dyad-rephrase-scope.md,
// section 7), with VITE_REPHRASE on. Written for two people in a cell: there is no AI here, so it does not speak as one, and it does
// not repeat the message or say who wrote it. Resources are the site's usual ones for the kind of danger found.
export default function ReaderNotice({ flag }: { flag: SafetyFlag }) {
  return (
    <section role="alert" aria-label={WORDS.readerTitle} className="space-y-3 rounded-lg border-2 border-foreground p-3">
      <h4 className="text-sm font-bold">{WORDS.readerTitle}</h4>
      <p className="text-sm">{WORDS.readerBody}</p>
      <ul className="space-y-2 text-sm">
        {resourcesFor(flag.category, flag.kind).map((r) => (
          <li key={r.name} className="rounded-md border border-border p-2">
            <span className="block font-medium">{r.name}</span>
            <span className="text-muted-foreground"><LinkedText text={r.detail} /></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
