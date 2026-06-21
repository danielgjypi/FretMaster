import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { NOTES, getFullNoteName } from '../lib/scales';

interface VirtualKeyboardProps {
  activeNotes: string[];
  labelMode?: 'none' | 'scientific' | 'solfege';
}

const OCTAVES = [2, 3, 4]; // C2 to B4

const SOLFEGE_MAP: Record<string, string> = {
  'C': 'Do', 'C#': 'Di', 'D': 'Re', 'D#': 'Ri', 'E': 'Mi', 'F': 'Fa', 'F#': 'Fi', 'G': 'Sol', 'G#': 'Si', 'A': 'La', 'A#': 'Li', 'B': 'Ti'
};

export function VirtualKeyboard({ activeNotes, labelMode = 'scientific' }: VirtualKeyboardProps) {
  const [previewNotes, setPreviewNotes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const handleChordPlayed = (e: any) => {
      if (e.detail && e.detail.notes) {
        setPreviewNotes(e.detail.notes);
        // Clear preview notes slightly faster than full duration for snappiness
        setTimeout(() => setPreviewNotes([]), Math.min(e.detail.duration, 1500));
      }
    };
    window.addEventListener('chord-played', handleChordPlayed);
    return () => window.removeEventListener('chord-played', handleChordPlayed);
  }, []);

  // Normalize active notes to always use sharps
  const combinedNotes = [...activeNotes, ...previewNotes];
  const normalizedActive = combinedNotes.map(note => {
    const pitchClass = note.replace(/[0-9]/g, '');
    const octave = note.replace(/[^0-9]/g, '');
    const normalizedPitch = getFullNoteName(pitchClass) || pitchClass;
    return octave ? `${normalizedPitch}${octave}` : normalizedPitch;
  });

  const isNoteActive = (pitchClass: string, octave: number) => {
    const exact = `${pitchClass}${octave}`;
    return normalizedActive.includes(exact) || normalizedActive.includes(pitchClass);
  };

  const keys: { pitchClass: string; octave: number; isBlack: boolean; id: string }[] = [];
  
  OCTAVES.forEach((octave) => {
    NOTES.forEach((pitchClass) => {
      const isBlack = pitchClass.includes('#');
      keys.push({
        pitchClass,
        octave,
        isBlack,
        id: `${pitchClass}${octave}`
      });
    });
  });

  const getLabel = (pitchClass: string) => {
    if (labelMode === 'none') return '';
    if (labelMode === 'solfege') return SOLFEGE_MAP[pitchClass] || pitchClass;
    return pitchClass;
  };

  const totalWhiteKeys = keys.filter(k => !k.isBlack).length;
  const whiteKeyWidthPercent = 100 / totalWhiteKeys;

  return (
    <div className="w-full bg-muted/20 border-y border-border p-6 flex flex-col shrink-0">
      <div className="w-full flex border-[2px] border-border/80 bg-background relative h-32 lg:h-40 overflow-hidden shadow-md">
        
        {/* Render White Keys */}
        {keys.filter(k => !k.isBlack).map((keyInfo, index) => {
          const active = isNoteActive(keyInfo.pitchClass, keyInfo.octave);
          
          return (
            <div
              key={keyInfo.id}
              className={cn(
                "flex-1 border-r-[2px] border-border/80 last:border-r-0 flex items-end justify-center pb-2 md:pb-3 transition-colors relative z-0",
                active 
                  ? "bg-primary/20 text-primary shadow-[inset_0_-4px_0_rgba(var(--primary),0.5)]" 
                  : "bg-transparent hover:bg-primary/5 text-muted-foreground"
              )}
            >
              <span className={cn(
                "text-[8px] md:text-[10px] font-bold font-mono",
                labelMode === 'none' ? "opacity-0" : "opacity-100"
              )}>
                {getLabel(keyInfo.pitchClass)}
              </span>
            </div>
          );
        })}

        {/* Render Black Keys */}
        {keys.map((keyInfo, index) => {
          if (!keyInfo.isBlack) return null;
          
          const active = isNoteActive(keyInfo.pitchClass, keyInfo.octave);
          const whiteKeysBefore = keys.slice(0, index).filter(k => !k.isBlack).length;
          
          // Position exactly on the line between whiteKeysBefore-1 and whiteKeysBefore
          const leftPercent = whiteKeysBefore * whiteKeyWidthPercent;
          const blackKeyWidthPercent = whiteKeyWidthPercent * 0.65; // 65% of a white key's width
          
          return (
            <div
              key={keyInfo.id}
              className={cn(
                "absolute top-0 h-[60%] border-x border-b border-primary z-10 flex items-end justify-center pb-1.5 md:pb-2 transition-all shadow-sm",
                active 
                  ? "bg-primary text-primary-foreground brightness-75 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]" 
                  : "bg-primary text-primary-foreground hover:brightness-110"
              )}
              style={{
                left: `calc(${leftPercent}% - ${blackKeyWidthPercent / 2}%)`,
                width: `${blackKeyWidthPercent}%`
              }}
            >
              <span className={cn(
                "text-[7px] md:text-[8px] font-bold font-mono scale-90",
                labelMode === 'none' ? "opacity-0" : "opacity-100"
              )}>
                {getLabel(keyInfo.pitchClass)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
