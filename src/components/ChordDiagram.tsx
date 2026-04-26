import React, { useEffect, useState } from 'react';
import { Chord } from '../lib/chords';
import { cn } from '../lib/utils';

// Used for calculating note names on the fly
const STRING_TUNINGS = [40, 45, 50, 55, 59, 64]; 
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface ChordDiagramProps {
  chord: Chord;
  className?: string;
}

export function ChordDiagram({ chord, className }: ChordDiagramProps) {
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showGlow, setShowGlow] = useState(true);

  useEffect(() => {
    // Read from localStorage to respect global settings, we assume it's updated in MainApp
    const updateSettings = () => {
      const savedNotes = localStorage.getItem('fretmaster-notes');
      setShowNoteNames(savedNotes !== 'false');
      const savedGlow = localStorage.getItem('fretmaster-glow');
      setShowGlow(savedGlow !== 'false');
    };
    
    // Check initially
    updateSettings();
    
    // We can pool for changes or just listen to an event, let's listen to storage event which fires across iframes/tabs
    // or just assume a refresh is fine, but we can set up an interval for now for live updates
    const interval = setInterval(updateSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine fret range to display
  const activeFrets = chord.frets.filter(f => f > 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
  
  // Usually show 4 frets per diagram.
  let startFret = minFret <= 2 ? 1 : minFret - 1;

  // y coords for strings. stringIndex 0 is Low E (bottom), 5 is high E (top).
  const stringYs = [70, 58, 46, 34, 22, 10]; // Low E, A, D, G, B, e

  return (
    <div className={cn("flex flex-col items-center bg-muted/50 border border-border p-4 rounded-none transition-all hover:border-primary/50", className)}>
      <div className="relative">
        <svg viewBox="0 0 130 80" className="w-[130px] h-[80px] select-none text-foreground overflow-visible">
          {/* Fretboard Grid */}
          <g className="opacity-80">
            {/* Strings (Horizontal) */}
            {stringYs.map((y, i) => (
              <line key={`string-${i}`} x1="20" y1={y} x2="120" y2={y} stroke="currentColor" strokeWidth={i === 0 ? "1.5" : "1"} />
            ))}
            
            {/* Frets (Vertical) */}
            {[0, 1, 2, 3, 4].map(i => {
              const x = 20 + i * 25;
              return (
                <line key={`fret-${i}`} x1={x} y1="10" x2={x} y2="70" stroke="currentColor" strokeWidth={startFret === 1 && i === 0 ? "4" : "1"} />
              );
            })}
          </g>

          {/* Fret Numbers Marker */}
          {startFret > 1 && (
            <text x="32.5" y="85" fontSize="10" fill="currentColor" className="text-muted-foreground font-mono" textAnchor="middle">{startFret}fr</text>
          )}

          {/* Dots & Mutes */}
          {chord.frets.map((fret, stringIndex) => {
            const cy = stringYs[stringIndex];
            if (fret === -1) {
              // Muted string (X) at the left
              return (
                <text key={`mute-${stringIndex}`} x="8" y={cy + 3} fontSize="10" fill="currentColor" className="text-muted-foreground font-bold font-mono" textAnchor="middle">X</text>
              );
            } else if (fret === 0) {
              // Open string (O) at the left
              return (
                <text key={`open-${stringIndex}`} x="8" y={cy + 3} fontSize="10" fill="currentColor" className="text-muted-foreground font-bold font-mono" textAnchor="middle">O</text>
              );
            } else {
              // Fretted note dot
              const relativeFret = fret - startFret;
              if (relativeFret >= 0 && relativeFret <= 3) {
                const cx = 20 + relativeFret * 25 + 12.5; // middle of the fret
                const noteName = NOTES[(STRING_TUNINGS[stringIndex] + fret) % 12];
                return (
                  <g key={`dot-${stringIndex}`}>
                    <circle  
                      cx={cx} 
                      cy={cy} 
                      r="6" 
                      fill="var(--primary)"
                      style={{ filter: showGlow ? 'var(--dot-glow, drop-shadow(0 0 4px var(--primary)))' : 'none' }}
                    />
                    {showNoteNames && (
                      <text x={cx} y={cy + 2.5} fontSize="6" fill="var(--primary-foreground)" className="font-bold pointer-events-none" textAnchor="middle">
                        {noteName}
                      </text>
                    )}
                  </g>
                );
              }
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}
