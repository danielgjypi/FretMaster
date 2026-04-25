import React, { useState, useEffect } from 'react';
import { Settings2, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { NOTES, SCALES, TUNINGS, getScaleNotes, getNoteIndex, getFullNoteName } from '../lib/scales';
import { CustomSelect } from './CustomSelect';
import { AnimatedScrollInput } from './AnimatedScrollInput';

interface ScaleMasterProps {
  currentTheme: string;
  onLogoClick?: () => void;
}

export function ScaleMaster({ currentTheme, onLogoClick }: ScaleMasterProps) {
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
        const currentNote = NOTES[noteIdx];
        const isScaleNote = scaleNotes.includes(currentNote);
        const isRoot = currentNote === rootNote;
        
        frets.push({
            fret: i,
            note: currentNote,
            isScaleNote,
            isRoot
        });
    }
    return frets;
  }).reverse(); // standard view: highest pitch string on top

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
                <div className="absolute inset-x-0 top-6 bottom-6 flex">
                   {/* Nut */}
                   <div className="w-10 h-full shrink-0 z-10 border-r-4 border-border/80" />
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
                    {strings.map((stringInfo, sIdx) => (
                        <div key={sIdx} className="w-full relative flex items-center group z-10">
                            {/* The physical string line */}
                            <div className="absolute inset-x-0 bg-border/80 pointer-events-none shadow-sm" 
                                style={{ height: `${1 + (sIdx * 0.4)}px`, opacity: 0.9 }} 
                            />
                            
                            {/* Nut note */}
                            <div className="w-10 h-full flex items-center justify-center shrink-0 z-20 relative">
                                {stringInfo[0].isScaleNote && (
                                    <div className={cn(
                                        "rounded-full flex items-center justify-center text-[12px] font-bold font-sans z-20 transition-colors",
                                        stringInfo[0].isRoot ? "bg-primary w-8 h-8 text-[14px] text-primary-foreground shadow-sm" : "bg-foreground w-7 h-7 text-background shadow-sm"
                                    )}>
                                        {stringInfo[0].note}
                                    </div>
                                )}
                            </div>

                            <div className="w-2 shrink-0" /> {/* Spacer for nut */}

                            {/* Fret notes */}
                            {stringInfo.slice(1).map((fretInfo, fIdx) => (
                                <div key={fIdx} className="flex-1 flex items-center justify-center relative z-20 group">
                                     {fretInfo.isScaleNote && (
                                         <div className={cn(
                                             "rounded-full flex items-center justify-center text-[12px] font-bold font-sans z-20 transform transition-all hover:scale-110",
                                             fretInfo.isRoot ? "bg-primary w-8 h-8 text-[14px] text-primary-foreground shadow-sm" : "bg-foreground w-7 h-7 text-background shadow-sm hover:opacity-80",
                                         )}>
                                             {fretInfo.note}
                                         </div>
                                     )}
                                     {/* Hover helper text */}
                                     {!fretInfo.isScaleNote && (
                                         <div className="opacity-0 group-hover:opacity-100 absolute w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans flex items-center justify-center pointer-events-none transition-opacity">
                                             {fretInfo.note}
                                         </div>
                                     )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {/* Fret Numbers Below */}
            <div className="w-full min-w-[1000px] max-w-[1600px] flex mt-4 text-[10px] font-mono text-muted-foreground font-bold">
                 <div className="w-10 shrink-0 text-center">0</div>
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

        {/* Easter Egg Logo (placed in the middle of the available space) */}
        <div className="flex-1 flex justify-center">
            <div 
              className="flex space-x-2 items-center cursor-pointer select-none opacity-70 hover:opacity-100 transition-opacity"
              onClick={onLogoClick}
            >
               <span className="text-primary animate-[pulse_2s_ease-in-out_infinite]">●</span>
               <span className="font-serif italic font-bold tracking-tighter text-primary text-xl leading-none">FM.</span>
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

