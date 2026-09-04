import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon, Link2, Unlink, User } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import NenyaLogo from '../NenyaLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { MusicalStaff } from '../MusicalStaff';
import { ScaleRow } from '../ScaleRow';
import {
  MAQAM_RAST_NOTES,
  TonalSystem,
  colorsToMelody,
  melodyToColors,
  isValidHex,
  getScale,
  getNoteNames,
  playNote,
  playMelody,
  setTimbre,
  Timbre,
} from '../../../lib/audio';

interface SoundGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
}

const timbres = ['Resonant', 'Hollow', 'Bright', 'Warm', 'Metallic', 'Breathy', 'Rich', 'Thin'];
const rhythms = ['Steady', 'Syncopated', 'Flowing', 'Staccato', 'Irregular', 'Pulsing', 'Languid', 'Urgent'];

const TIMBRE_OPTIONS: { label: string; value: Timbre }[] = [
  { label: 'Soft', value: 'soft' },
  { label: 'Pure', value: 'pure' },
  { label: 'Bell', value: 'bell' },
  { label: 'Pluck', value: 'pluck' },
  { label: 'Bowl', value: 'bowl' },
];

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

export default function SoundGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap }: SoundGatewayPageProps) {
  const hasValidColors = !!userColors?.color1 && !!userColors?.color2 && isValidHex(userColors.color1) && isValidHex(userColors.color2);
  const [showBodyMap, setShowBodyMap] = useState(false);

  // Step state
  const [step, setStep] = useState<'instructions' | 'melody' | 'qualitative'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);

  // Tonal system state
  const [tonalSystem, setTonalSystem] = useState<TonalSystem>('western');
  const scale = getScale(tonalSystem);
  const noteNames = getNoteNames(tonalSystem);

  // Melody state
  const [melodyConnected, setMelodyConnected] = useState(hasValidColors && tonalSystem === 'western');
  const seedMelody = useCallback(
    () => (hasValidColors && melodyConnected ? colorsToMelody(userColors!.color1!, userColors!.color2!) : Array(6).fill(null)),
    [hasValidColors, melodyConnected, userColors]
  );
  const [melody, setMelody] = useState<(number | null)[]>(seedMelody);
  useEffect(() => {
    if (melodyConnected && hasValidColors) {
      setMelody(colorsToMelody(userColors!.color1!, userColors!.color2!));
    } else if (!melodyConnected) {
      setMelody(Array(6).fill(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [melodyConnected]);

  const handleSelectTonalSystem = (system: TonalSystem) => {
    if (system === tonalSystem) return;
    setTonalSystem(system);
    if (system !== 'western') setMelodyConnected(false);
    setMelody(Array(6).fill(null));
    setHasPlayed(false);
  };

  const [melodyColor1, melodyColor2] = melodyToColors(melody.map((n) => n ?? 0));
  const melodyComplete = melody.every((n) => n !== null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [activeTimbre, setActiveTimbre] = useState<Timbre>('soft');

  const accentCurrent = melodyConnected && hasValidColors ? userColors!.color1! : '#A08060';
  const accentWish = melodyConnected && hasValidColors ? userColors!.color2! : '#608060';

  const handlePlayMelody = () => {
    if (isPlaying || !melodyComplete) return;
    setIsPlaying(true);
    playMelody(melody, scale, () => {
      setIsPlaying(false);
      setHasPlayed(true);
    });
  };

  const handleSelectNote = (noteIndex: number) => {
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
      playMelody(random, scale, () => {
        setIsPlaying(false);
        setHasPlayed(true);
      });
    }, 100);
  };

  const handleSelectTimbre = (timbre: Timbre) => {
    setTimbre(timbre);
    setActiveTimbre(timbre);
  };

  // Current state
  const [currentPitch, setCurrentPitch] = useState([50]);
  const [currentVolume, setCurrentVolume] = useState([50]);
  const [currentTimbres, setCurrentTimbres] = useState<string[]>([]);
  const [currentTimbreOther, setCurrentTimbreOther] = useState('');
  const [currentRhythms, setCurrentRhythms] = useState<string[]>([]);
  const [currentRhythmOther, setCurrentRhythmOther] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');

  // Potential state
  const [potentialPitch, setPotentialPitch] = useState([50]);
  const [potentialVolume, setPotentialVolume] = useState([50]);
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
      melody,
      tonalSystem,
      melodyColor1,
      melodyColor2,
      melodyConnected,
      currentPitch: currentPitch[0],
      currentVolume: currentVolume[0],
      currentTimbres: currentTimbres.length > 0 ? currentTimbres : null,
      currentTimbreOther: currentTimbreOther || null,
      currentRhythms: currentRhythms.length > 0 ? currentRhythms : null,
      currentRhythmOther: currentRhythmOther || null,
      currentDescription: currentDescription || null,
      potentialPitch: potentialPitch[0],
      potentialVolume: potentialVolume[0],
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
            <NenyaLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Sound · Audition
                <GatewaySubtitleLink href="https://bio.libretexts.org/Bookshelves/Human_Biology/Human_Anatomy_Lab/13:_The_Somatic_Nervous_System_(Special_Senses)/13.03:_Audition_(Hearing)" />
              </h1>
              <p className="text-xs text-muted-foreground">
                Gateway {currentIndex + 1} of {totalGateways}
              </p>
            </div>
          </div>

          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto scroll-container">
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
                    <p className="text-sm text-muted-foreground">
                      {instructionCardIndex + 1} of {INSTRUCTION_CARDS.length}
                    </p>
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
            <div className="flex items-center justify-center gap-2">
              {(['western', 'rast'] as TonalSystem[]).map((system) => (
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
                  {system === 'western' ? 'Western' : 'Arabic (Maqam Rast)'}
                </button>
              ))}
            </div>

            {tonalSystem === 'western' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{melodyConnected ? 'Connected to Sight' : 'Independent melody'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {melodyConnected ? 'Your colors shape the melody. Adjust freely.' : 'Composing from silence. Colors and melody are separate.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMelodyConnected((c) => !c)}
                  className="gap-2 shrink-0"
                  disabled={!hasValidColors}
                  title={hasValidColors ? undefined : 'Visit the Sight gateway first to enable connection'}
                >
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
            )}

            {tonalSystem === 'western' && (
              <div className="flex items-center justify-center gap-8">
                <ColorSwatch hex={melodyColor1} label="current" muted={!melodyConnected && !melodyComplete} />
                <div
                  className="h-px flex-1 max-w-16 transition-opacity"
                  style={{ background: `linear-gradient(to right, ${melodyColor1}, ${melodyColor2})`, opacity: melodyComplete ? 0.6 : 0.15 }}
                />
                <ColorSwatch hex={melodyColor2} label="wish" muted={!melodyConnected && !melodyComplete} />
              </div>
            )}

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

            <div className="space-y-2">
              {!melodyComplete && (
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
                  Click a note {tonalSystem === 'western' ? 'on the staff' : 'below'} for the{' '}
                  <span style={{ color: melody.findIndex((n) => n === null) < 3 ? accentCurrent : accentWish }}>
                    {STATE_LABELS[melody.findIndex((n) => n === null) < 3 ? 0 : 1]} state
                  </span>
                </p>
              )}
              {tonalSystem === 'western' ? (
                <MusicalStaff
                  currentSelected={melody.slice(0, 3).filter((n): n is number => n !== null)}
                  wishSelected={melody.slice(3, 6).filter((n): n is number => n !== null)}
                  onSelect={handleSelectNote}
                  accentCurrent={accentCurrent}
                  accentWish={accentWish}
                />
              ) : (
                <ScaleRow
                  notes={MAQAM_RAST_NOTES}
                  currentSelected={melody.slice(0, 3).filter((n): n is number => n !== null)}
                  wishSelected={melody.slice(3, 6).filter((n): n is number => n !== null)}
                  onSelect={handleSelectNote}
                  accentCurrent={accentCurrent}
                  accentWish={accentWish}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={melody.every((n) => n === null)}>
                  ← Undo
                </Button>
                <Button variant="outline" size="sm" onClick={handleRandomize} disabled={isPlaying}>
                  ♩ Randomize
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handlePlayMelody}
                disabled={!melodyComplete || isPlaying}
                style={melodyComplete && !isPlaying ? { background: accentCurrent, color: '#fff' } : undefined}
              >
                {isPlaying ? '♩ playing…' : hasPlayed ? '▷ Play again' : '▷ Hear it'}
              </Button>
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
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                      {timbres.map((timbre) => (
                        <div key={timbre} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ct-${timbre}`}
                            checked={currentTimbres.includes(timbre)}
                            onCheckedChange={(checked) => handleCheckboxChange(timbre, checked as boolean, currentTimbres, setCurrentTimbres)}
                          />
                          <label htmlFor={`ct-${timbre}`} className="text-xs cursor-pointer">
                            {timbre}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-2 pt-2 border-t border-border">
                        <Checkbox
                          id="ct-other"
                          checked={currentTimbreOther.length > 0}
                          onCheckedChange={(checked) => {
                            if (!checked) setCurrentTimbreOther('');
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor="ct-other" className="text-xs cursor-pointer block mb-1">
                            Other
                          </label>
                          <Input placeholder="Describe…" value={currentTimbreOther} onChange={(e) => setCurrentTimbreOther(e.target.value)} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Rhythm (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                      {rhythms.map((rhythm) => (
                        <div key={rhythm} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cr-${rhythm}`}
                            checked={currentRhythms.includes(rhythm)}
                            onCheckedChange={(checked) => handleCheckboxChange(rhythm, checked as boolean, currentRhythms, setCurrentRhythms)}
                          />
                          <label htmlFor={`cr-${rhythm}`} className="text-xs cursor-pointer">
                            {rhythm}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-2 pt-2 border-t border-border">
                        <Checkbox
                          id="cr-other"
                          checked={currentRhythmOther.length > 0}
                          onCheckedChange={(checked) => {
                            if (!checked) setCurrentRhythmOther('');
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor="cr-other" className="text-xs cursor-pointer block mb-1">
                            Other
                          </label>
                          <Input placeholder="Describe…" value={currentRhythmOther} onChange={(e) => setCurrentRhythmOther(e.target.value)} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sounds (optional)</Label>
                    <Textarea placeholder="What song or sounds come to mind?" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} className="min-h-20 resize-none text-sm" />
                  </div>
                </CardContent>
              </Card>

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
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                      {timbres.map((timbre) => (
                        <div key={timbre} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pt-${timbre}`}
                            checked={potentialTimbres.includes(timbre)}
                            onCheckedChange={(checked) => handleCheckboxChange(timbre, checked as boolean, potentialTimbres, setPotentialTimbres)}
                          />
                          <label htmlFor={`pt-${timbre}`} className="text-xs cursor-pointer">
                            {timbre}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-2 pt-2 border-t border-border">
                        <Checkbox
                          id="pt-other"
                          checked={potentialTimbreOther.length > 0}
                          onCheckedChange={(checked) => {
                            if (!checked) setPotentialTimbreOther('');
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor="pt-other" className="text-xs cursor-pointer block mb-1">
                            Other
                          </label>
                          <Input placeholder="Describe…" value={potentialTimbreOther} onChange={(e) => setPotentialTimbreOther(e.target.value)} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Rhythm (optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                      {rhythms.map((rhythm) => (
                        <div key={rhythm} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pr-${rhythm}`}
                            checked={potentialRhythms.includes(rhythm)}
                            onCheckedChange={(checked) => handleCheckboxChange(rhythm, checked as boolean, potentialRhythms, setPotentialRhythms)}
                          />
                          <label htmlFor={`pr-${rhythm}`} className="text-xs cursor-pointer">
                            {rhythm}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-2 pt-2 border-t border-border">
                        <Checkbox
                          id="pr-other"
                          checked={potentialRhythmOther.length > 0}
                          onCheckedChange={(checked) => {
                            if (!checked) setPotentialRhythmOther('');
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor="pr-other" className="text-xs cursor-pointer block mb-1">
                            Other
                          </label>
                          <Input placeholder="Describe…" value={potentialRhythmOther} onChange={(e) => setPotentialRhythmOther(e.target.value)} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Describe the sounds (optional)</Label>
                    <Textarea placeholder="What sounds would you like to move toward?" value={potentialDescription} onChange={(e) => setPotentialDescription(e.target.value)} className="min-h-20 resize-none text-sm" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleNext} className="px-12">
                {currentIndex + 1 < totalGateways ? 'Next Gateway' : 'Continue'}
              </Button>
            </div>
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
