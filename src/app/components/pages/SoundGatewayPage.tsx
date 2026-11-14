import { useState, useEffect, useCallback, useRef } from 'react';
import { StageSlot, StageIntro, StageNav, type PairStage } from '../GatewayStages';
import { GatewayProgress } from '../GatewayProgress';
import { getReadableTextColor } from '../ColorUtils';
import { Button } from '../ui/button';
import { unsetSlider, sliderValue } from '../../../lib/optionalSlider';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon, Link2, Unlink, User } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import PanelLogo from '../PanelLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { MusicalStaff } from '../MusicalStaff';
import { ScaleRow } from '../ScaleRow';
import { KotoStringDiagram } from '../KotoStringDiagram';
import {
  TonalSystem,
  TONAL_SYSTEM_LABELS,
  RAST_STAFF_NOTES,
  BLUES_STAFF_NOTES,
  colorsToMelody,
  melodyToColors,
  isValidHex,
  getScale,
  getNoteNames,
  playNote,
  setTimbre,
  getTimbre,
  Timbre,
} from '../../../lib/audio';

import { WordPicker } from '../WordPicker';
import { PhraseMelody, type Active } from '../PhraseMelody';
import { buildPhrases, movePhrase, playlist, remapScale, setMuted, setNote, type Phrase } from '../../../lib/longMelody';
import { playSequence, renderWav, clampStep, clampVolume, DEFAULT_STEP } from '../../../lib/melodyPlayer';
interface SoundGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string; color1Name?: string | null; color2Name?: string | null; generatedPalettes?: { colors?: { hex: string; name?: string }[]; useInSound?: boolean }[] | null };
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
  /** Whether the Sight gateway is still to come in this session (so the melody's colors can be brought to it). */
  sightComesLater?: boolean;
}


const TIMBRE_OPTIONS: { label: string; value: Timbre }[] = [
  { label: 'Soft', value: 'soft' },
  { label: 'Pure', value: 'pure' },
  { label: 'Bell', value: 'bell' },
  { label: 'Pluck', value: 'pluck' },
  { label: 'Bowl', value: 'bowl' },
];

const TONAL_SYSTEM_ORDER: TonalSystem[] = ['western', 'rast', 'slendro', 'bhairav', 'miyakobushi', 'blues'];

// Which of the three note-picker modalities each tonal system uses:
// 'staff' for systems that map onto real staff positions (Western, Rast's
// quarter-tone accidentals, and Blues, which has no notation of its own so
// borrows the ordinary staff), 'row' for cipher/solfège-style plain labels
// (Slendro's numerals, Bhairav's Sargam), and 'koto' for Miyako-bushi's
// numbered-string convention.
const PICKER_KIND: Record<TonalSystem, 'staff' | 'row' | 'koto'> = {
  western: 'staff',
  rast: 'staff',
  blues: 'staff',
  slendro: 'row',
  bhairav: 'row',
  miyakobushi: 'koto',
};

const PICKER_HINT: Record<'staff' | 'row' | 'koto', string> = {
  staff: 'on the staff',
  row: 'below',
  koto: 'on a string',
};

const INSTRUCTION_CARDS = [
  {
    title: 'Welcome to the Sound Gateway',
    description: 'Every color has a sound. In this gateway, your two chosen colors become a six-note melody — or you can compose one directly.',
    detail: 'The first three notes carry your current state. The last three carry your wish state. Both can be adjusted freely.',
  },
  {
    title: 'Connected or Independent',
    description: "If you've chosen colors in the Sight gateway, your melody is already waiting for you. You can keep it, adjust it, or disconnect and compose from silence.",
    detail: 'Either way, what you arrive at is yours — a sound signature for this session.',
  },
  {
    title: 'Then: words for what you hear',
    description: "After the melody, you'll have the option to describe the sonic quality of what you chose — timbre, rhythm, texture.",
    detail: 'These are optional. The melody itself is enough.',
  },
];

// Accent color per note slot: first three (current state) warm red, last three (wish state) green
const NOTE_ACCENT_COLORS = ['#E07060', '#E07060', '#E07060', '#60B86C', '#60B86C', '#60B86C'];
const STATE_LABELS = ['current', 'wish'];

function NoteSlot({
  note,
  index,
  isNext,
  accentColor,
  onClear,
  noteNames,
}: {
  note: number | null;
  index: number;
  isNext: boolean;
  accentColor: string;
  onClear: () => void;
  noteNames: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={note !== null ? onClear : undefined}
        className="w-full py-2.5 rounded-xl flex items-center justify-center transition-all duration-300 text-xs"
        style={{
          background: isNext ? `${accentColor}20` : note !== null ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isNext ? `${accentColor}70` : note !== null ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: isNext ? `0 0 14px ${accentColor}28` : 'none',
          cursor: note !== null ? 'pointer' : 'default',
          fontFamily: "'JetBrains Mono', monospace",
          color: note !== null ? 'rgba(228,234,240,0.88)' : isNext ? accentColor : 'rgba(255,255,255,0.18)',
        }}
        title={note !== null ? 'Click to clear this note' : undefined}
      >
        {note !== null ? noteNames[note] : isNext ? '…' : '—'}
      </button>
      <span
        className="text-xs"
        style={{ fontSize: '9px', letterSpacing: '0.1em', color: NOTE_ACCENT_COLORS[index], opacity: 0.65, fontFamily: "'DM Sans', sans-serif" }}
      >
        {['R', 'G', 'B'][index % 3]}
      </span>
    </div>
  );
}

function ColorSwatch({ hex, label, muted }: { hex: string; label: string; muted: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-10 h-10 rounded-full transition-all duration-500"
        style={{ background: hex, boxShadow: muted ? 'none' : `0 0 20px ${hex}60`, opacity: muted ? 0.4 : 1 }}
      />
      <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </span>
    </div>
  );
}

export default function SoundGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap, sightComesLater = true }: SoundGatewayPageProps) {
  const hasValidColors = !!userColors?.color1 && !!userColors?.color2 && isValidHex(userColors.color1) && isValidHex(userColors.color2);
  const [showBodyMap, setShowBodyMap] = useState(false);

  // Step state
  const [step, setStep] = useState<'instructions' | 'melody' | 'qualitative'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<PairStage>('present');
  useEffect(() => { scrollContainerRef.current?.scrollTo({ top: 0 }); }, [stage]);

  // Advancing between steps swaps content inside this same persistently-
  // mounted scroll container -- it never unmounts, so nothing else resets
  // its scroll position when the step changes.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Tonal system state
  const [tonalSystem, setTonalSystem] = useState<TonalSystem>('western');
  const scale = getScale(tonalSystem);
  const noteNames = getNoteNames(tonalSystem);

  // Melody state
  const [melodyConnected, setMelodyConnected] = useState(hasValidColors);
  // Sound first: should the melody's two colors be where the Sight gateway starts? Checked unless the person unchecks it.
  const [bringToSight, setBringToSight] = useState(true);
  const seedMelody = useCallback(
    () => (hasValidColors && melodyConnected ? colorsToMelody(userColors!.color1!, userColors!.color2!, scale.length) : Array(6).fill(null)),
    [hasValidColors, melodyConnected, userColors, scale.length]
  );
  const [melody, setMelody] = useState<(number | null)[]>(seedMelody);
  useEffect(() => {
    if (melodyConnected && hasValidColors) {
      setMelody(colorsToMelody(userColors!.color1!, userColors!.color2!, scale.length));
      setPhrases((prev) => (prev.length ? prev : makePhrases(scale.length)));
    } else if (!melodyConnected) {
      setMelody(Array(6).fill(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [melodyConnected, scale.length]);

  // The longer melody: one phrase for each color (the present and wish colors, and the palettes marked for sound). Seeded once from the Sight
  // colors; after that the notes and the colors are separate, and changing a note never changes a color.
  const makePhrases = (len: number): Phrase[] =>
    buildPhrases({ hex: userColors!.color1!, name: userColors?.color1Name }, { hex: userColors!.color2!, name: userColors?.color2Name }, (userColors?.generatedPalettes ?? []) as any, len);
  const [phrases, setPhrases] = useState<Phrase[]>(() => (hasValidColors ? makePhrases(scale.length) : []));
  const [activeSlot, setActiveSlot] = useState<Active | null>(null);
  const [playingSlot, setPlayingSlot] = useState<Active | null>(null);
  const [stepSeconds, setStepSeconds] = useState(DEFAULT_STEP);
  const [volume, setVolume] = useState(0.8);
  const stopRef = useRef<(() => void) | null>(null);
  const [fileNote, setFileNote] = useState('');
  useEffect(() => () => { stopRef.current?.(); }, []);
  const longMode = melodyConnected && hasValidColors;
  const played = longMode ? playlist(phrases) : null;

  const handleSelectTonalSystem = (system: TonalSystem) => {
    if (system === tonalSystem) return;
    if (longMode) setPhrases((prev) => remapScale(prev, scale.length, getScale(system).length));
    setTonalSystem(system);
    // Melody re-seeds automatically: the effect above reacts to scale.length,
    // re-translating from the same two colors when connected, or clearing
    // when independent (a manually composed melody's indices don't carry
    // meaning across a different note count).
    setHasPlayed(false);
  };

  const [derived1, derived2] = melodyToColors(melody.map((n) => n ?? 0), scale.length);
  // While the melody is connected to the Sight colors, those are the colors; the notes never rewrite them. Only a melody made from silence is shown in colors derived from its notes.
  const melodyColor1 = longMode ? userColors!.color1! : derived1;
  const melodyColor2 = longMode ? userColors!.color2! : derived2;
  const melodyComplete = longMode ? (played?.notes.length ?? 0) > 0 : melody.every((n) => n !== null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [activeTimbre, setActiveTimbre] = useState<Timbre>('soft');

  const accentCurrent = melodyConnected && hasValidColors ? userColors!.color1! : '#A08060';
  const accentWish = melodyConnected && hasValidColors ? userColors!.color2! : '#608060';

  const handlePlayMelody = () => {
    if (isPlaying || !melodyComplete) return;
    setFileNote('');
    setIsPlaying(true);
    const notes = longMode ? played!.notes : melody;
    stopRef.current = playSequence(notes, scale, {
      stepSeconds, volume, timbre: getTimbre(),
      onNote: (i) => setPlayingSlot(longMode ? played!.at[i] : null),
      onEnd: () => { setIsPlaying(false); setHasPlayed(true); setPlayingSlot(null); stopRef.current = null; },
    });
  };

  const handleStop = () => { stopRef.current?.(); };

  const handleDownload = async () => {
    const notes = longMode ? played!.notes : melody;
    setFileNote('Making the file…');
    try {
      const blob = await renderWav(notes, scale, { stepSeconds, volume, timbre: getTimbre() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nenya-melody.wav';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setFileNote('Your melody was saved as a sound file (nenya-melody.wav). It was made on your device and went nowhere.');
    } catch {
      setFileNote('This browser could not make the sound file.');
    }
  };

  const handleSelectNote = (noteIndex: number) => {
    if (longMode) {
      // Change the chosen note of the chosen phrase, then move to the next note.
      const target = activeSlot ?? { id: phrases[0]?.id ?? 'present', position: 0 };
      setPhrases((prev) => setNote(prev, target.id, target.position, noteIndex));
      const order = phrases.flatMap((p) => p.notes.map((_, position) => ({ id: p.id, position })));
      const at = order.findIndex((o) => o.id === target.id && o.position === target.position);
      setActiveSlot(order[at + 1] ?? null);
      setHasPlayed(false);
      playNote(noteIndex, scale);
      return;
    }
    if (melody.every((n) => n !== null)) return; // all six slots already filled
    setMelody((prev) => {
      const next = [...prev];
      const slot = next.findIndex((n) => n === null);
      if (slot === -1) return prev;
      next[slot] = noteIndex;
      return next;
    });
    setHasPlayed(false);
    playNote(noteIndex, scale);
  };

  const handleUndo = () => {
    setMelody((prev) => {
      const next = [...prev];
      const reverseIdx = [...next].reverse().findIndex((n) => n !== null);
      if (reverseIdx === -1) return prev;
      next[next.length - 1 - reverseIdx] = null;
      return next;
    });
    setHasPlayed(false);
  };

  const handleClearNote = (idx: number) => {
    setMelody((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setHasPlayed(false);
  };

  const handleRandomize = () => {
    const random = Array.from({ length: 6 }, () => Math.floor(Math.random() * scale.length));
    setMelody(random);
    setHasPlayed(false);
    setTimeout(() => {
      setIsPlaying(true);
      stopRef.current = playSequence(random, scale, { stepSeconds, volume, timbre: getTimbre(), onEnd: () => { setIsPlaying(false); setHasPlayed(true); stopRef.current = null; } });
    }, 100);
  };

  const handleSelectTimbre = (timbre: Timbre) => {
    setTimbre(timbre);
    setActiveTimbre(timbre);
  };

  // Current state
  const [currentPitch, setCurrentPitch] = useState(() => unsetSlider());
  const [currentVolume, setCurrentVolume] = useState(() => unsetSlider());
  const [currentTimbres, setCurrentTimbres] = useState<string[]>([]);
  const [currentTimbreOther, setCurrentTimbreOther] = useState('');
  const [currentRhythms, setCurrentRhythms] = useState<string[]>([]);
  const [currentRhythmOther, setCurrentRhythmOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');

  // Potential state
  const [potentialPitch, setPotentialPitch] = useState(() => unsetSlider());
  const [potentialVolume, setPotentialVolume] = useState(() => unsetSlider());
  const [potentialTimbres, setPotentialTimbres] = useState<string[]>([]);
  const [potentialTimbreOther, setPotentialTimbreOther] = useState('');
  const [potentialRhythms, setPotentialRhythms] = useState<string[]>([]);
  const [potentialRhythmOther, setPotentialRhythmOther] = useState('');
  const [potentialDescription, setPotentialDescription] = useState('');

  const handleCheckboxChange = (
    value: string,
    checked: boolean,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (checked) {
      setter([...currentValues, value]);
    } else {
      setter(currentValues.filter((v) => v !== value));
    }
  };

  const handleNextInstructionCard = () => {
    if (instructionCardIndex < INSTRUCTION_CARDS.length - 1) {
      setInstructionCardIndex(instructionCardIndex + 1);
    } else {
      setStep('melody');
    }
  };

  const handleNext = () => {
    onComplete({
      melody: longMode ? played!.notes : melody,
      melodyPhrases: longMode ? phrases.map((p) => ({ kind: p.kind, label: p.label, hex: p.hex, notes: p.notes, muted: p.muted })) : null,
      tonalSystem,
      melodyColor1,
      melodyColor2,
      melodyConnected,
      // Only meaningful when the melody was made before Sight: then it says whether Sight should start from the melody's colors.
      bringToSight: !hasValidColors && sightComesLater && bringToSight,
      currentPitch: sliderValue(currentPitch),
      currentVolume: sliderValue(currentVolume),
      currentTimbres: currentTimbres.length > 0 ? currentTimbres : null,
      currentTimbreOther: currentTimbreOther || null,
      currentRhythms: currentRhythms.length > 0 ? currentRhythms : null,
      currentRhythmOther: currentRhythmOther || null,
      currentDescription: currentDescription || null,
      potentialPitch: sliderValue(potentialPitch),
      potentialVolume: sliderValue(potentialVolume),
      potentialTimbres: potentialTimbres.length > 0 ? potentialTimbres : null,
      potentialTimbreOther: potentialTimbreOther || null,
      potentialRhythms: potentialRhythms.length > 0 ? potentialRhythms : null,
      potentialRhythmOther: potentialRhythmOther || null,
      potentialDescription: potentialDescription || null,
    });
  };

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <PanelLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Sound · Audition
                <GatewaySubtitleLink href="https://bio.libretexts.org/Bookshelves/Human_Biology/Human_Anatomy_Lab/13:_The_Somatic_Nervous_System_(Special_Senses)/13.03:_Audition_(Hearing)" />
              </h1>
              <GatewayProgress index={currentIndex} total={totalGateways} />
            </div>
          </div>

          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto scroll-container">
        {step === 'instructions' && (
          <div className="h-full flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="max-w-2xl w-full">
              <Card className="cursor-pointer transition-all hover:shadow-lg border-2" onClick={handleNextInstructionCard}>
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl">{INSTRUCTION_CARDS[instructionCardIndex].title}</CardTitle>
                  <CardDescription className="text-base md:text-lg">{INSTRUCTION_CARDS[instructionCardIndex].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{INSTRUCTION_CARDS[instructionCardIndex].detail}</p>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); if (instructionCardIndex > 0) setInstructionCardIndex(instructionCardIndex - 1); else onBack(); }}>
                        <ArrowLeft className="size-4" /> Back
                      </Button>
                      <p className="text-sm text-muted-foreground">{instructionCardIndex + 1} of {INSTRUCTION_CARDS.length}</p>
                    </div>
                    <Button variant="ghost" className="gap-2">
                      {instructionCardIndex < INSTRUCTION_CARDS.length - 1 ? (
                        <>
                          Next <ChevronRight className="size-4" />
                        </>
                      ) : (
                        <>
                          Begin <ArrowRightIcon className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 'melody' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {TONAL_SYSTEM_ORDER.map((system) => (
                <button
                  key={system}
                  onClick={() => handleSelectTonalSystem(system)}
                  className="rounded-full px-3.5 py-1.5 text-xs transition-all"
                  style={{
                    background: tonalSystem === system ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: `1px solid rgba(255,255,255,${tonalSystem === system ? '0.22' : '0.08'})`,
                    color: tonalSystem === system ? 'rgba(228,234,240,0.85)' : 'rgba(255,255,255,0.32)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {TONAL_SYSTEM_LABELS[system]}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Curious about building a melody from words? Solresol is a constructed language whose words are sequences of the seven notes.{' '}
              <a href="https://solresol.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                solresol.xyz<span className="sr-only"> (opens an outside site in a new tab)</span>
              </a>{' '}
              (from the Machine Perception and Cognitive Robotics Laboratory at Florida Atlantic University) has a translator and player. It is a separate site with its own terms, and nothing from Nenya is sent to it.
            </p>

            {hasValidColors ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{melodyConnected ? 'Connected to Sight' : 'Independent melody'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {melodyConnected ? 'Your colors shape the melody. Adjust freely.' : 'Composing from silence. Colors and melody are separate.'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMelodyConnected((c) => !c)} className="gap-2 shrink-0">
                  {melodyConnected ? (
                    <>
                      <Link2 className="size-3.5" /> Connected
                    </>
                  ) : (
                    <>
                      <Unlink className="size-3.5" /> Disconnected
                    </>
                  )}
                </Button>
              </div>
            ) : (
              sightComesLater && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={bringToSight} onChange={(e) => setBringToSight(e.target.checked)} className="size-4" />
                    Bring this to the Sight gateway?
                  </label>
                  <p className="text-muted-foreground">
                    {bringToSight
                      ? 'The two colors your melody makes will be where Sight starts, instead of plain black or white. You can change them there. Nothing you do in Sight changes your melody.'
                      : 'Sight will start from its usual plain colors. Your melody stays as it is.'}
                  </p>
                </div>
              )
            )}

            <div className="flex items-center justify-center gap-8">
              <ColorSwatch hex={melodyColor1} label="current" muted={!melodyConnected && !melodyComplete} />
              <div
                className="h-px flex-1 max-w-16 transition-opacity"
                style={{ background: `linear-gradient(to right, ${melodyColor1}, ${melodyColor2})`, opacity: melodyComplete ? 0.6 : 0.15 }}
              />
              <ColorSwatch hex={melodyColor2} label="wish" muted={!melodyConnected && !melodyComplete} />
            </div>

            {longMode ? (
              <PhraseMelody
                phrases={phrases}
                noteNames={noteNames}
                active={activeSlot}
                playing={playingSlot}
                onActivate={setActiveSlot}
                onMove={(id, by) => { setPhrases((prev) => movePhrase(prev, id, by)); setHasPlayed(false); }}
                onMute={(id, m) => { setPhrases((prev) => setMuted(prev, id, m)); setHasPlayed(false); }}
              />
            ) : (
            <div className="grid grid-cols-2 gap-6">
              {[0, 1].map((half) => {
                const slots = melody.slice(half * 3, half * 3 + 3);
                const nextSlot = melody.findIndex((n) => n === null);
                const accent = half === 0 ? accentCurrent : accentWish;
                return (
                  <div key={half} className="space-y-2">
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.22)', fontSize: '9px', letterSpacing: '0.14em', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {half === 0 ? 'Current state' : 'Wish state'}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {slots.map((note, i) => {
                        const idx = half * 3 + i;
                        return (
                          <NoteSlot
                            key={idx}
                            note={note}
                            index={idx}
                            isNext={idx === nextSlot}
                            accentColor={accent}
                            onClear={() => handleClearNote(idx)}
                            noteNames={noteNames}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            <div className="space-y-2">
              {longMode && (
                <p className="text-xs text-center text-muted-foreground">
                  {activeSlot ? 'Choose a note below to change the note you picked.' : 'Pick a note in a phrase above to change it; the colors in the Sight gateway stay as they are.'}
                </p>
              )}
              {!longMode && !melodyComplete && (
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
                  Click a note {PICKER_HINT[PICKER_KIND[tonalSystem]]} for the{' '}
                  <span style={{ color: melody.findIndex((n) => n === null) < 3 ? accentCurrent : accentWish }}>
                    {STATE_LABELS[melody.findIndex((n) => n === null) < 3 ? 0 : 1]} state
                  </span>
                </p>
              )}
              {PICKER_KIND[tonalSystem] === 'staff' ? (
                <MusicalStaff
                  notes={tonalSystem === 'rast' ? RAST_STAFF_NOTES : tonalSystem === 'blues' ? BLUES_STAFF_NOTES : undefined}
                  currentSelected={longMode ? (phrases.find((p) => p.kind === 'present')?.notes ?? []) : melody.slice(0, 3).filter((n): n is number => n !== null)}
                  wishSelected={longMode ? (phrases.find((p) => p.kind === 'wish')?.notes ?? []) : melody.slice(3, 6).filter((n): n is number => n !== null)}
                  onSelect={handleSelectNote}
                  accentCurrent={accentCurrent}
                  accentWish={accentWish}
                />
              ) : PICKER_KIND[tonalSystem] === 'koto' ? (
                <KotoStringDiagram
                  notes={scale}
                  currentSelected={longMode ? (phrases.find((p) => p.kind === 'present')?.notes ?? []) : melody.slice(0, 3).filter((n): n is number => n !== null)}
                  wishSelected={longMode ? (phrases.find((p) => p.kind === 'wish')?.notes ?? []) : melody.slice(3, 6).filter((n): n is number => n !== null)}
                  onSelect={handleSelectNote}
                  accentCurrent={accentCurrent}
                  accentWish={accentWish}
                />
              ) : (
                <ScaleRow
                  notes={scale}
                  currentSelected={longMode ? (phrases.find((p) => p.kind === 'present')?.notes ?? []) : melody.slice(0, 3).filter((n): n is number => n !== null)}
                  wishSelected={longMode ? (phrases.find((p) => p.kind === 'wish')?.notes ?? []) : melody.slice(3, 6).filter((n): n is number => n !== null)}
                  onSelect={handleSelectNote}
                  accentCurrent={accentCurrent}
                  accentWish={accentWish}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!longMode && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={melody.every((n) => n === null)}>
                      ← Undo
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRandomize} disabled={isPlaying}>
                      ♩ Randomize
                    </Button>
                  </>
                )}
                {isPlaying && (
                  <Button variant="outline" size="sm" onClick={handleStop}>■ Stop</Button>
                )}
              </div>
              <Button
                size="sm"
                onClick={handlePlayMelody}
                disabled={!melodyComplete || isPlaying}
                style={melodyComplete && !isPlaying ? { background: accentCurrent, color: getReadableTextColor(accentCurrent) } : undefined}
              >
                {isPlaying ? '♩ playing…' : hasPlayed ? '▷ Play again' : '▷ Hear it'}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Pace: {stepSeconds.toFixed(2)} seconds a note{stepSeconds >= 0.8 ? ' (slow)' : stepSeconds <= 0.3 ? ' (quick)' : ''}</span>
                <input type="range" min={0.2} max={1.2} step={0.05} value={stepSeconds} onChange={(e) => setStepSeconds(clampStep(Number(e.target.value)))} className="w-full" />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Volume: {Math.round(volume * 100)}%</span>
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(clampVolume(Number(e.target.value)))} className="w-full" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!melodyComplete || isPlaying}>Save as a sound file</Button>
              <p className="text-xs text-muted-foreground" role="status">{fileNote || 'The file is made on your device and is not sent anywhere.'}</p>
            </div>

            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
              {TIMBRE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectTimbre(opt.value)}
                  style={{
                    fontSize: '9px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: `1px solid rgba(255,255,255,${activeTimbre === opt.value ? '.4' : '.15'})`,
                    background: activeTimbre === opt.value ? 'rgba(255,255,255,.06)' : 'transparent',
                    cursor: 'pointer',
                    color: `rgba(255,255,255,${activeTimbre === opt.value ? '.75' : '.3'})`,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {melodyComplete && hasPlayed && (
              <p className="text-xs text-center" style={{ color: `${accentCurrent}90`, fontFamily: "'DM Sans', sans-serif" }}>
                ✓ Your melody is set.
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep('qualitative')} disabled={!melodyComplete} className="gap-2">
                Continue <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'qualitative' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Optional — words for what you just heard</p>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowBodyMap(true)} className="gap-2">
                <User className="size-4" />
                Open Body Map
              </Button>
            </div>
            <div className="mx-auto w-full max-w-2xl">
              <StageIntro stage={stage} />
              <StageSlot stage="present" current={stage}>
              {/* Current State Card */}
              <Card
                style={
                  accentCurrent
                    ? { boxShadow: `0 0 20px ${accentCurrent}40`, borderColor: `${accentCurrent}60`, borderWidth: '2px' }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Current State</CardTitle>
                  <CardDescription>The sonic qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SnappingSlider value={currentPitch} onValueChange={setCurrentPitch} label="Pitch" leftLabel="Deep Bass" rightLabel="High Treble" max={100} />
                  <SnappingSlider value={currentVolume} onValueChange={setCurrentVolume} label="Volume" leftLabel="Whisper" rightLabel="Roar" max={100} />

                  <div className="space-y-2">
                    <Label className="text-sm">Timbre (optional)</Label>
                    <WordPicker category="timbre" idPrefix="currentTimbres" selected={currentTimbres} onToggle={(t) => handleCheckboxChange(t, !currentTimbres.includes(t), currentTimbres, setCurrentTimbres)} other={{ value: currentTimbreOther, onChange: setCurrentTimbreOther, placeholder: "Describe…" }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Rhythm (optional)</Label>
                    <WordPicker category="rhythm" idPrefix="currentRhythms" selected={currentRhythms} onToggle={(t) => handleCheckboxChange(t, !currentRhythms.includes(t), currentRhythms, setCurrentRhythms)} other={{ value: currentRhythmOther, onChange: setCurrentRhythmOther, placeholder: "Describe…" }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sounds (optional)</Label>
                    <Textarea placeholder="What song or sounds come to mind?" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} className="min-h-20 resize-none text-sm" />
                  </div>
                </CardContent>
              </Card>

              </StageSlot>
              <StageSlot stage="wish" current={stage}>
              {/* Wish State Card */}
              <Card
                style={
                  accentWish
                    ? { boxShadow: `0 0 20px ${accentWish}40`, borderColor: `${accentWish}60`, borderWidth: '2px' }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Wish State</CardTitle>
                  <CardDescription>The sonic qualities of how you wish to feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SnappingSlider value={potentialPitch} onValueChange={setPotentialPitch} label="Pitch" leftLabel="Deep Bass" rightLabel="High Treble" max={100} />
                  <SnappingSlider value={potentialVolume} onValueChange={setPotentialVolume} label="Volume" leftLabel="Whisper" rightLabel="Roar" max={100} />

                  <div className="space-y-2">
                    <Label className="text-sm">Timbre (optional)</Label>
                    <WordPicker category="timbre" idPrefix="potentialTimbres" selected={potentialTimbres} onToggle={(t) => handleCheckboxChange(t, !potentialTimbres.includes(t), potentialTimbres, setPotentialTimbres)} other={{ value: potentialTimbreOther, onChange: setPotentialTimbreOther, placeholder: "Describe…" }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Rhythm (optional)</Label>
                    <WordPicker category="rhythm" idPrefix="potentialRhythms" selected={potentialRhythms} onToggle={(t) => handleCheckboxChange(t, !potentialRhythms.includes(t), potentialRhythms, setPotentialRhythms)} other={{ value: potentialRhythmOther, onChange: setPotentialRhythmOther, placeholder: "Describe…" }} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sounds (optional)</Label>
                    <Textarea placeholder="What sounds would you like to move toward?" value={potentialDescription} onChange={(e) => setPotentialDescription(e.target.value)} className="min-h-20 resize-none text-sm" />
                  </div>
                </CardContent>
              </Card>
            </StageSlot>
              <StageNav stage={stage} onChange={setStage} />
            </div>

            {stage === 'wish' && (
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleNext} className="px-12">
                {currentIndex + 1 < totalGateways ? 'Next Gateway' : 'Continue'}
              </Button>
            </div>
            )}
          </div>
        )}

        <AppFooter />
      </div>

      {showBodyMap && (
        <BodyMapAvatar
          userColors={userColors?.color1 && userColors?.color2 ? { color1: userColors.color1, color2: userColors.color2 } : undefined}
          onClose={() => setShowBodyMap(false)}
          onSave={(data) => onUpdateBodyMap(data)}
          initialPlacements={bodyMapData.placements}
          initialNotes={bodyMapData.notes}
        />
      )}
    </div>
  );
}
