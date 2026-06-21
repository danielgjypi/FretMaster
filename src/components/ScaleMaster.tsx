import React, { useState, useEffect } from 'react';
import { Settings2, Music, ChevronUp, ChevronDown, Activity, Mic } from 'lucide-react';
import { MetronomeIcon, TuningForkIcon } from './Icons';
import { THEMES } from '../lib/themes';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { NOTES, SCALES, TUNINGS, getScaleNotes, getNoteIndex, getFullNoteName } from '../lib/scales';
import { CustomSelect } from './CustomSelect';
import { AnimatedScrollInput } from './AnimatedScrollInput';
import { usePitchDetector } from '../hooks/usePitchDetector';
import { useMetronome } from '../hooks/useMetronome';
import { StrobeTuner } from './StrobeTuner';
import { MetronomePanel } from './MetronomePanel';
import { VirtualKeyboard } from './VirtualKeyboard';

interface ScaleMasterProps {
  currentTheme: string;
  onLogoClick?: () => void;
  audioDeviceId?: string | null;
  showKeyboard?: boolean;
  keyboardLabelMode?: 'none' | 'scientific' | 'solfege';
  strictPitchMatching?: boolean;
  isLeftHanded?: boolean;
  flipVertical?: boolean;
  noiseGate?: number;
}

export function ScaleMaster({ 
  currentTheme, 
  onLogoClick, 
  audioDeviceId, 
  showKeyboard, 
  keyboardLabelMode = 'scientific', 
  strictPitchMatching = true,
  isLeftHanded = false,
  flipVertical = false,
  noiseGate = 0.01
}: ScaleMasterProps) {
    const currentThemeData = THEMES.find(t => t.id === currentTheme);
    const isMonochromeTheme = currentThemeData ? currentThemeData.colors.primary.toLowerCase() === currentThemeData.colors.fg.toLowerCase() : (currentTheme === 'zinc' || currentTheme === 'zinc-light');
  const [rootNote, setRootNote] = useState(() => {
    return localStorage.getItem('scalemaster-root') || 'C';
  });
  
  const [scaleId, setScaleId] = useState(() => {
    return localStorage.getItem('scalemaster-scale') || 'major';
  });

  const [tuningId, setTuningId] = useState(() => {
    return localStorage.getItem('scalemaster-tuning') || 'e_standard';
  });

  const [customTuning, setCustomTuning] = useState<string[]>(() => {
    const saved = localStorage.getItem('scalemaster-custom-tuning');
    return saved ? JSON.parse(saved) : TUNINGS.find(t => t.id === 'e_standard')?.notes || [];
  });

  const [isLiveInputActive, setIsLiveInputActive] = useState(false);
  const [isTunerExpanded, setIsTunerExpanded] = useState(false);
  const { pitchData } = usePitchDetector(isLiveInputActive, audioDeviceId, noiseGate);

  const [isMetronomeOpen, setIsMetronomeOpen] = useState(false);
  const metronome = useMetronome();

  useEffect(() => {
    localStorage.setItem('scalemaster-root', rootNote);
    localStorage.setItem('scalemaster-scale', scaleId);
    localStorage.setItem('scalemaster-tuning', tuningId);
    localStorage.setItem('scalemaster-custom-tuning', JSON.stringify(customTuning));
  }, [rootNote, scaleId, tuningId, customTuning]);

  const activeTuning = tuningId === 'custom' 
    ? customTuning 
    : (TUNINGS.find(t => t.id === tuningId)?.notes || TUNINGS[0].notes);

  const scaleNotes = getScaleNotes(rootNote, scaleId);

  // Generate fretboard data
  const numFrets = 24;
  const strings = activeTuning.map(note => {
    const rootName = note.replace(/[0-9]/g, '');
    const octave = parseInt(note.replace(/[^0-9]/g, ''), 10);
    const startIdx = getNoteIndex(rootName);
    
    const frets = [];
    for (let i = 0; i <= numFrets; i++) {
        const noteIdx = (startIdx + i) % 12;
        const currentOctave = octave + Math.floor((startIdx + i) / 12);
        const currentNote = NOTES[noteIdx];
        const isScaleNote = scaleNotes.includes(currentNote);
        const isRoot = currentNote === rootNote;
        
        frets.push({
            fret: i,
            note: currentNote,
            noteNameWithOctave: `${currentNote}${currentOctave}`,
            isScaleNote,
            isRoot
        });
    }
    return frets;
  }).reverse();

  const displayStrings = flipVertical ? [...strings].reverse() : strings;

  const handleCustomTuningChange = (actualIndex: number, newVal: string) => {
    if (tuningId !== 'custom') {
      const newCustom = [...activeTuning];
      newCustom[actualIndex] = newVal;
      setCustomTuning(newCustom);
      setTuningId('custom');
    } else {
      const newCustom = [...customTuning];
      newCustom[actualIndex] = newVal;
      setCustomTuning(newCustom);
    }
  };

  const incrementNote = (noteStr: string, direction: 1 | -1) => {
    let name = noteStr.replace(/[0-9]/g, '');
    let octave = parseInt(noteStr.replace(/[^0-9]/g, '') || '0', 10);
    let idx = NOTES.indexOf(name);
    if (idx === -1) idx = NOTES.indexOf(getFullNoteName(name));
    if (idx === -1) return noteStr;

    idx += direction;
    if (idx > 11) { idx = 0; octave++; }
    if (idx < 0) { idx = 11; octave--; }
    return `${NOTES[idx]}${octave}`;
  };

  const getNoteAbsoluteIndex = (noteStr: string) => {
    let name = noteStr.replace(/[0-9]/g, '');
    let octave = parseInt(noteStr.replace(/[^0-9]/g, '') || '0', 10);
    let idx = NOTES.indexOf(name);
    if (idx === -1) idx = NOTES.indexOf(getFullNoteName(name));
    if (idx === -1) return 0;
    return octave * 12 + idx;
  };

  const compareNotes = (a: string | number, b: string | number) => {
    return getNoteAbsoluteIndex(a.toString()) > getNoteAbsoluteIndex(b.toString()) ? 1 : -1;
  };

  const getFretMarkersCoords = () => {
    return [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  };

  const SCALES_OPTIONS = SCALES.map(s => ({ value: s.id, label: s.name }));
  const TUNINGS_OPTIONS = TUNINGS.map(t => ({ value: t.id, label: t.name }));
  const ROOT_OPTIONS = NOTES.map(n => ({ value: n, label: n }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-background text-foreground animate-in fade-in duration-500 relative z-10 w-full">
      {/* Main Fretboard View */}
      <section className="flex-1 flex flex-col bg-background relative overflow-hidden z-10 w-full h-full pt-10 px-8">
        {/* Full Screen Tuner Overlay */}
        <AnimatePresence>
          {isLiveInputActive && isTunerExpanded && (
              <StrobeTuner 
                   pitchData={pitchData} 
                   onClose={() => setIsTunerExpanded(false)} 
              />
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-serif italic text-foreground tracking-tight transition-colors">
                {rootNote} {SCALES.find(s => s.id === scaleId)?.name}
            </h1>
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold">
                Scale
            </div>
            <div className="ml-auto text-xl font-serif italic text-muted-foreground tracking-wide">
                {TUNINGS.find(t => t.id === tuningId)?.name || 'Custom'} Layout
            </div>
        </div>

        <div className="flex-1 w-full max-w-full overflow-x-auto custom-scrollbar flex flex-col items-center justify-center pb-8 px-8">
            <div className="w-full min-w-[1000px] max-w-[1600px] h-[350px] relative mt-4">
                
                {/* Fretboard background */}
                <div className={cn(
                    "absolute inset-x-0 top-6 bottom-6 flex",
                    isLeftHanded ? "flex-row-reverse" : "flex-row"
                )}>
                   {/* Nut */}
                   <div className={cn("w-10 h-full shrink-0 z-10", isLeftHanded ? "border-l-4 border-border/80" : "border-r-4 border-border/80")} />
                   <div className="w-2 shrink-0" />
                   
                   {/* Frets */}
                   {Array.from({ length: numFrets }).map((_, i) => (
                       <div key={i} className="flex-1 relative flex justify-center">
                           {/* The actual fret line */}
                           <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-muted-foreground/40 via-muted-foreground/10 to-muted-foreground/50 shadow-[-1px_0_2px_rgba(0,0,0,0.4)] z-0 rounded-sm" />
                           {/* Markers */}
                           {getFretMarkersCoords().includes(i + 1) && (
                               i + 1 === 12 || i + 1 === 24 ? (
                                  <div className="absolute top-[30%] bottom-[30%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-between pointer-events-none z-0">
                                      <div className="w-4 h-4 rounded-full bg-border/40" />
                                      <div className="w-4 h-4 rounded-full bg-border/40" />
                                  </div>
                               ) : (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-border/40 pointer-events-none z-0" />
                               )
                           )}
                       </div>
                   ))}
                </div>

                {/* Strings and Notes */}
                <div className="absolute inset-0 flex flex-col justify-between py-6">
                    {displayStrings.map((stringInfo, sIdx) => (
                        <div key={sIdx} className={cn("w-full relative flex items-center group z-10", isLeftHanded ? "flex-row-reverse" : "flex-row")}>
                            {/* The physical string line */}
                            <div className="absolute inset-x-0 bg-border/80 pointer-events-none shadow-sm" 
                                style={{ height: `${1 + (sIdx * 0.4)}px`, opacity: 0.9 }} 
                            />
                            
                            {/* Nut note */}
                            <div className="w-10 h-full flex items-center justify-center shrink-0 z-20 relative group">
                                {(() => {
                                    const isExactPitch = stringInfo[0].noteNameWithOctave === pitchData?.noteName;
                                    const isNoteClassMatch = stringInfo[0].note === pitchData?.noteName?.replace(/[0-9]/g, '');
                                    const isDetectedNote = strictPitchMatching ? isExactPitch : isNoteClassMatch;
                                    const isDetectedClasses = isDetectedNote ? "shadow-[0_0_15px_var(--primary)] ring-2 ring-primary ring-offset-1 ring-offset-background" : "";
                                    
                                    return (
                                        <>
                                        {stringInfo[0].isScaleNote && (
                                            <div className={cn(
                                                "rounded-full flex items-center justify-center text-[12px] font-bold font-sans z-20 transform transition-all duration-300",
                                                stringInfo[0].isRoot 
                                                    ? "bg-primary w-8 h-8 text-[14px] text-primary-foreground shadow-sm" 
                                                    : isMonochromeTheme 
                                                        ? "bg-background border-[2px] border-foreground w-7 h-7 text-foreground shadow-sm hover:bg-foreground hover:text-background"
                                                        : "bg-foreground w-7 h-7 text-background shadow-sm hover:opacity-80",
                                                isDetectedClasses,
                                                isExactPitch ? "scale-125 bg-primary text-primary-foreground" : "hover:scale-110",
                                            )}>
                                                <div className={cn(isLeftHanded ? "scale-x-[-1]" : "")}>
                                                    {stringInfo[0].note}
                                                </div>
                                            </div>
                                        )}
                                        {!stringInfo[0].isScaleNote && (
                                             <div className={cn(
                                                "absolute w-6 h-6 rounded-full text-[10px] font-bold font-sans flex items-center justify-center pointer-events-none transition-all duration-300",
                                                isExactPitch 
                                                    ? "opacity-100 bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-125"
                                                    : "opacity-0 group-hover:opacity-100 bg-primary/10 text-primary"
                                             )}>
                                                <div className={cn(isLeftHanded ? "scale-x-[-1]" : "")}>
                                                    {stringInfo[0].note}
                                                </div>
                                             </div>
                                         )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="w-2 shrink-0" /> {/* Spacer for nut */}

                            {/* Fret notes */}
                            {stringInfo.slice(1).map((fretInfo, fIdx) => {
                                const isExactPitch = fretInfo.noteNameWithOctave === pitchData?.noteName;
                                const isNoteClassMatch = fretInfo.note === pitchData?.noteName?.replace(/[0-9]/g, '');
                                const isDetectedNote = strictPitchMatching ? isExactPitch : isNoteClassMatch;
                                const isDetectedClasses = isDetectedNote ? "shadow-[0_0_15px_var(--primary)] ring-2 ring-primary ring-offset-1 ring-offset-background" : "";

                                return (
                                <div key={fIdx} className="flex-1 flex items-center justify-center relative z-20 group">
                                     {fretInfo.isScaleNote && (
                                         <div className={cn(
                                             "rounded-full flex items-center justify-center text-[12px] font-bold font-sans z-20 transform transition-all duration-300",
                                             fretInfo.isRoot 
                                                ? "bg-primary w-8 h-8 text-[14px] text-primary-foreground shadow-sm" 
                                                : isMonochromeTheme
                                                    ? "bg-background border-[2px] border-foreground w-7 h-7 text-foreground shadow-sm hover:bg-foreground hover:text-background"
                                                    : "bg-foreground w-7 h-7 text-background shadow-sm hover:opacity-80",
                                             isDetectedClasses,
                                             isExactPitch ? "scale-125 bg-primary text-primary-foreground" : "hover:scale-110"
                                         )}>
                                             <div className={cn(isLeftHanded ? "scale-x-[-1]" : "")}>
                                                 {fretInfo.note}
                                             </div>
                                         </div>
                                     )}
                                     {/* Hover helper text */}
                                     {!fretInfo.isScaleNote && (
                                         <div className={cn(
                                            "absolute w-6 h-6 rounded-full text-[10px] font-bold font-sans flex items-center justify-center pointer-events-none transition-all duration-300",
                                            isExactPitch 
                                                ? "opacity-100 bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-125"
                                                : "opacity-0 group-hover:opacity-100 bg-primary/10 text-primary"
                                         )}>
                                             <div className={cn(isLeftHanded ? "scale-x-[-1]" : "")}>
                                                 {fretInfo.note}
                                             </div>
                                         </div>
                                     )}
                                </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {/* Fret Numbers Below */}
            <div className={cn(
                "w-full min-w-[1000px] max-w-[1600px] flex mt-4 text-[10px] font-mono text-muted-foreground font-bold",
                isLeftHanded ? "flex-row-reverse" : "flex-row"
            )}>
                 <div className={cn("w-10 shrink-0 text-center", isLeftHanded ? "order-last" : "")}>0</div>
                 <div className="w-2 shrink-0" />
                 {Array.from({ length: numFrets }).map((_, i) => (
                     <div key={i} className="flex-1 text-center">{i + 1}</div>
                 ))}
            </div>
        </div>
      </section>



      {/* Bottom Panel */}
      <footer className="h-32 border-t border-border px-8 flex items-center justify-between bg-background/90 backdrop-blur-sm shrink-0 z-20 relative text-[10px] uppercase font-mono tracking-widest text-muted-foreground w-full">
        
        {/* Left Side: Root Note and Scale Select */}
        <div className="flex items-center gap-10 shrink-0">
            <div className="flex items-center gap-4">
                <span>ROOT:</span>
                <CustomSelect 
                    options={ROOT_OPTIONS} 
                    value={rootNote} 
                    onChange={setRootNote} 
                    className="w-20"
                    menuClassName="bottom-full mb-1"
                />
            </div>

            <div className="flex items-center gap-4">
                <span>SCALE:</span>
                <CustomSelect 
                    options={SCALES_OPTIONS} 
                    value={scaleId} 
                    onChange={setScaleId} 
                    className="w-48"
                    menuClassName="bottom-full mb-1"
                />
            </div>
            
            <div className="flex items-center gap-4">
                <span>TUNING:</span>
                <CustomSelect 
                    options={TUNINGS_OPTIONS} 
                    value={tuningId} 
                    onChange={setTuningId} 
                    className="w-48"
                    menuClassName="bottom-full mb-1"
                />
            </div>
        </div>

        {/* Center Controls (Mic, Tuner, Metronome) */}
        <div className="flex-1 flex justify-center">
            <div className="flex items-center p-1 bg-background gap-1">
                <button 
                    onClick={() => {
                        const nextState = !isLiveInputActive;
                        setIsLiveInputActive(nextState);
                        if (!nextState) setIsTunerExpanded(false);
                    }}
                    className={cn(
                        "w-9 h-9 flex items-center justify-center transition-all duration-300",
                        isLiveInputActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title="Live Guitar Input"
                >
                    <Mic size={18} className={!isLiveInputActive ? "text-primary" : ""} />
                </button>
                <AnimatePresence>
                  {isLiveInputActive && (
                      <motion.button 
                          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                          animate={{ width: 36, opacity: 1, marginLeft: 4 }}
                          exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          onClick={() => setIsTunerExpanded(!isTunerExpanded)}
                          className={cn(
                              "h-9 flex items-center justify-center transition-colors duration-200 text-muted-foreground hover:bg-muted hover:text-foreground overflow-hidden",
                              isTunerExpanded ? "bg-muted text-foreground" : ""
                          )}
                          title={isTunerExpanded ? "Close Full-Screen Tuner" : "Open Full-Screen Tuner"}
                      >
                          <TuningForkIcon size={18} className="shrink-0 text-primary" />
                      </motion.button>
                  )}
                </AnimatePresence>
                
                <div className="w-px h-6 bg-border/50 mx-1" />
                
                <div className="relative">
                    <button 
                        onClick={() => setIsMetronomeOpen(!isMetronomeOpen)}
                        className={cn(
                            "w-9 h-9 flex items-center justify-center transition-all duration-300",
                            isMetronomeOpen || metronome.isPlaying ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        title="Metronome"
                    >
                        <MetronomeIcon size={18} className={!(isMetronomeOpen || metronome.isPlaying) ? "text-primary" : ""} />
                    </button>
                    {/* Metronome Panel positioned relative to this button */}
                    <MetronomePanel 
                         isOpen={isMetronomeOpen} 
                         onClose={() => setIsMetronomeOpen(false)} 
                         metronome={metronome} 
                    />
                </div>
            </div>
        </div>

        {/* Right Side: String tuning inputs */}
        <div className="flex items-center gap-4 shrink-0">
            <span>STRINGS:</span>
            <div className="flex gap-2">
                {[...activeTuning].map((note, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 group">
                        <button 
                             onClick={() => handleCustomTuningChange(idx, incrementNote(note, 1))}
                             className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary-foreground hover:bg-primary rounded-sm p-0.5"
                        >
                            <ChevronUp size={12} strokeWidth={3} />
                        </button>
                        <AnimatedScrollInput
                            value={note}
                            onChange={(val) => handleCustomTuningChange(idx, val.toUpperCase())}
                            onIncrement={() => handleCustomTuningChange(idx, incrementNote(note, 1))}
                            onDecrement={() => handleCustomTuningChange(idx, incrementNote(note, -1))}
                            compareValues={compareNotes}
                            className="w-10 h-6 text-[14px] font-serif italic text-foreground"
                        />
                        <button 
                             onClick={() => handleCustomTuningChange(idx, incrementNote(note, -1))}
                             className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary-foreground hover:bg-primary rounded-sm p-0.5"
                        >
                            <ChevronDown size={12} strokeWidth={3} />
                        </button>
                        <span className="text-[8px] opacity-50 mt-1">{6 - idx}</span>
                    </div>
                ))}
            </div>
        </div>
      </footer>
    </div>
  );
}

