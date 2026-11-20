import { LinkedText } from '../app/components/ExternalLink';
import { resourcesFor, type SafetyFlag } from '../lib/safetyFlags';
import { WORDS } from '../lib/rephraseWords';

// The writer's private notice (docs/dyad-rephrase-scope.md, section 7): shown only on the device of the person who wrote the words,
// before they send them. It informs and never blocks, and the other person is never told. Written for one person talking to another
// (the coach's notices speak as an AI and would be wrong here); the resources are the site's usual ones.
export default function PrivateNotice({ flag }: { flag: SafetyFlag }) {
  return (
    <section role="alert" aria-label={WORDS.privateTitle} className="space-y-3 rounded-lg border-2 border-foreground p-3">
      <h4 className="text-sm font-bold">{WORDS.privateTitle}</h4>
      <p className="text-sm">{WORDS.privateBody}</p>
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
