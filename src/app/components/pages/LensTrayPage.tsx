import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft } from 'lucide-react';
import { AppFooter } from '../AppFooter';
import { gatewayCards } from './GatewaysPage';
import { L } from '../../../lib/vocabulary';
import { lensStatus, reportShape, type LensId, type LensState } from '../../../lib/lensState';

// The lens tray (docs/lens-rewrite-scope.md, behind VITE_LENS_TRAY): six lenses, any order, any number. Each shows whether it is not opened, examined or included.
interface Props {
  state: LensState;
  onOpen: (lens: LensId) => void;
  onRemove: (lens: LensId) => void;
  onReport: () => void;
  onBack: () => void;
}

const STATUS_TEXT = { 'not-opened': 'Not opened', examined: 'Examined, not added', included: 'Added to my report' } as const;

export default function LensTrayPage({ state, onOpen, onRemove, onReport, onBack }: Props) {
  const shape = reportShape(state);
  return (
    <div className="size-full flex flex-col overflow-auto scroll-container">
      <div className="border-b border-border px-4 md:px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="size-4" />Back</Button>
      </div>
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 md:py-12">
        <div className="w-full max-w-5xl space-y-6">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl">Which {L('lens')} would you like to look through?</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Choosing fewer can be more helpful than choosing many. Open any {L('lens')}, in any order. Nothing goes into your report until you add it.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
            {gatewayCards.map((c) => {
              const Icon = c.icon;
              const st = lensStatus(state, c.id as LensId);
              return (
                <li key={c.id}>
                  <Card className={`p-4 sm:p-6 h-full space-y-3 ${st === 'included' ? 'border-nenya-accent-warm bg-nenya-accent-warm/10' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-muted text-muted-foreground"><Icon className="size-6" aria-hidden="true" /></div>
                      <h2 className="text-xl">{c.name}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <p className="text-sm" data-lens-status={st}>{STATUS_TEXT[st]}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => onOpen(c.id as LensId)} aria-label={`${st === 'included' ? 'Edit' : 'Open'} ${c.name}`}>{st === 'included' ? 'Edit' : 'Open'}</Button>
                      {st === 'included' && <Button size="sm" variant="outline" onClick={() => onRemove(c.id as LensId)} aria-label={`Take ${c.name} out of my report`}>Take out</Button>}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
          {shape.line && <p className="text-sm text-center text-muted-foreground">{shape.line}</p>}
          {shape.included.length > 0 && (
            <div className="flex justify-center pt-2"><Button size="lg" onClick={onReport}>See my report</Button></div>
          )}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
