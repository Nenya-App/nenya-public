import { Eye, Lock } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { MODES, type ModeId } from '../lib/privacyModes';

// The choice between a witnessed and a sealed conversation (docs/ghost-footprint-stack.md). Shown only when the server
// has sealed mode switched on; otherwise the coach opens witnessed, as it always has. All wording comes from
// src/lib/privacyModes.ts, so this screen says exactly what the modes do and do not do.
export default function ModeChooser({ onChoose, onBack }: { onChoose: (m: Extract<ModeId, 'witnessed' | 'sealed'>) => void; onBack: () => void }) {
  const options = [
    { mode: MODES.witnessed, icon: <Eye className="size-5" aria-hidden="true" /> },
    { mode: MODES.sealed, icon: <Lock className="size-5" aria-hidden="true" /> },
  ];
  return (
    // The page around it is pinned to the window (the app's global style), so this screen scrolls inside itself: it fills the space it is given and scrolls there.
    <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl">How should this conversation be kept?</h1>
        <p className="text-sm text-muted-foreground">
          Both are the same coach, with the same five exchanges. They differ in who can read your words, where the safety checks run, and whether Nenya can
          sign a record of the conversation. You choose once, for this conversation.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map(({ mode, icon }) => (
          <Card key={mode.id} className="flex flex-col gap-3 p-5">
            <h2 className="flex items-center gap-2 text-lg">
              {icon}
              {mode.name}
            </h2>
            <p className="text-sm">{mode.summary}</p>
            <dl className="space-y-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Who can read your words</dt>
                <dd>{mode.whoCanRead.length ? mode.whoCanRead.join('; ') : 'No one but you'}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Safety checks</dt>
                <dd>{mode.checks}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Encryption</dt>
                <dd>{mode.encryption}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">A signed record</dt>
                <dd>{mode.canSign ? 'Yes: you can download one, and choose to share it as a Witnessed Encounter.' : 'No: Nenya never sees the words, so it cannot sign them.'}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Footprint</dt>
                <dd>{mode.footprint}</dd>
              </div>
            </dl>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {mode.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <Button className="mt-auto" onClick={() => onChoose(mode.id as 'witnessed' | 'sealed')}>
              Use {mode.name.toLowerCase()}
            </Button>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">The coach is an AI. It is not therapy and it is not for emergencies. In the US, call or text 988.</p>
      <Button variant="ghost" onClick={onBack}>
        ← Choose different colors
      </Button>
    </div>
    </div>
  );
}
