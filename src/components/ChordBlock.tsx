import React from 'react';
import { Chord } from '../lib/chords';
import { playChord } from '../lib/synth';
import { cn } from '../lib/utils';

interface ChordBlockProps {
  chord: Chord;
  className?: string;
}

export function ChordBlock({ chord, className }: ChordBlockProps) {
  return (
    <button 
      onClick={() => playChord(chord)}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card",
        "transition-all active:scale-95 hover:bg-muted hover:border-primary/50 text-foreground cursor-pointer focus:ring-2 focus:ring-primary outline-none",
        className
      )}
    >
      <span className="font-bold text-xl block mb-1">
        {chord.root}<span className="text-muted-foreground text-lg">{chord.suffix}</span>
      </span>
      <div className="flex gap-1">
        {chord.frets.map((f, i) => (
          <span key={i} className="text-xs text-muted-foreground opacity-70">
            {f === -1 ? 'X' : f}
          </span>
        ))}
      </div>
    </button>
  );
}
