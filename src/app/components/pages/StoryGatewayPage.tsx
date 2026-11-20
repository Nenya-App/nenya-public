import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import PanelLogo from '../PanelLogo';
import { AppFooter } from '../AppFooter';
import { PutThisDown } from '../LensCardParts';
import { WordCardLensCards } from '../WordCardLens';
import { STORY, cleanWordCards } from '../../../lib/lensWordCards';
import type { BodyMapData } from '../BodyMapAvatar';

// The Story lens in the tray (docs/lens-story-nature.md): cards of words, one activity each, then add. It exists only in the tray (VITE_LENS_TRAY) and only where VITE_LENS_STORY is on.
// It takes the same props as the other lens pages; it has no colors, sounds or body map of its own.
interface StoryGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
  /** What was added before, so Edit opens with it. */
  initialData?: any;
}

export default function StoryGatewayPage({ onComplete, onBack, initialData }: StoryGatewayPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollContainerRef.current?.scrollTo({ top: 0 }); }, []);
  return (
    <div className="size-full flex flex-col bg-background">
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="size-4" />Back</Button>
          <div className="flex items-center gap-3">
            <PanelLogo size={32} />
            <h1 className="text-lg">Story</h1>
          </div>
          <PutThisDown onClick={onBack} name="Story" />
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-auto scroll-container">
        <WordCardLensCards def={STORY} initial={initialData} added={cleanWordCards(STORY, initialData) !== null} onPutDown={onBack} onAdd={(data) => onComplete(data)} />
        <AppFooter />
      </div>
    </div>
  );
}
