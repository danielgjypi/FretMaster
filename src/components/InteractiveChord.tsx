import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Trash2, Plus, Sparkles } from 'lucide-react';
import { ChordGroupType, Chord, getBestVoicing } from '../lib/chords';
import { ChordDiagram } from './ChordDiagram';
import { playChord } from '../lib/synth';
import { cn } from '../lib/utils';

interface InteractiveChordProps {
  key?: React.Key;
  group?: ChordGroupType;
  chord?: Chord;
  viewMode: 'library' | 'progression' | 'compact';
  onAdd?: (chord: Chord) => void;
  onRemove?: () => void;
  onUpdateChord?: (chord: Chord) => void;
  indexLabel?: number | string;
  lastChord?: Chord;
  isCurrentlyPlaying?: boolean;
}

export function InteractiveChord({
  group,
  chord: initialChord,
  viewMode,
  onAdd,
  onRemove,
  onUpdateChord,
  indexLabel,
  lastChord,
  isCurrentlyPlaying
}: InteractiveChordProps) {
  
  const [internalIdx, setInternalIdx] = useState(0);

  // Determine the best voicing based on the last chord
  const bestVoicing = group && lastChord ? getBestVoicing(lastChord, group) : group?.voicings[0];
  
  useEffect(() => {
     if (initialChord && group) {
         // The chord ID is typically v.id or v.id + '-' + timestamp or sugg- + v.id + '-' + timestamp
         // Let's find exactly the matching voicing by ignoring sugg- prefix and -timestamp suffix
         let baseId = initialChord.id;
         if (baseId.startsWith('sugg-')) baseId = baseId.replace('sugg-', '');
         baseId = baseId.replace(/-(\d+)$/, '');
         
         const idx = group.voicings.findIndex(v => baseId === v.id);
         if (idx !== -1) setInternalIdx(idx);
     }
  }, [initialChord, group]);

  // Auto-select the best voicing in the library when the last chord changes
  useEffect(() => {
     if (viewMode === 'library' && group && bestVoicing && !initialChord) {
         const idx = group.voicings.findIndex(v => v.id === bestVoicing.id);
         if (idx !== -1) setInternalIdx(idx);
     }
  }, [lastChord, group, viewMode, bestVoicing, initialChord]);

  if (!group || group.voicings.length === 0) return null;

  const currentChord = group.voicings[internalIdx];
  const isBest = bestVoicing && currentChord.id === bestVoicing.id && lastChord;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (internalIdx - 1 + group.voicings.length) % group.voicings.length;
    setInternalIdx(nextIdx);
    onUpdateChord?.(group.voicings[nextIdx]);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (internalIdx + 1) % group.voicings.length;
    setInternalIdx(nextIdx);
    onUpdateChord?.(group.voicings[nextIdx]);
  };

  const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      playChord(currentChord);
  };

  const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAdd?.(currentChord);
  };

  // Compact View (for suggestions)
  if (viewMode === 'compact') {
      return (
          <div className="flex flex-col gap-1 items-center bg-background border border-border p-2 hover:border-primary transition-colors cursor-default rounded-sm">
             <div className="flex items-center gap-1 w-full justify-between px-1">
                 <span className="font-serif italic text-foreground text-sm font-bold flex items-center gap-1">
                     {currentChord.root}<span className="text-xs">{currentChord.suffix}</span>
                     {isBest && <Sparkles size={12} className="text-primary ml-1" title="Best Voice Leading" />}
                 </span>
                 <div className="flex gap-1">
                    <button onClick={handlePlay} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Play size={12} fill="currentColor" /></button>
                    <button onClick={handleAdd} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Plus size={12} /></button>
                 </div>
             </div>
             <div className="scale-[0.6] origin-top opacity-80 pointer-events-none h-[60px] -mt-1">
                 <ChordDiagram chord={currentChord} className="!border-none !bg-transparent !p-0" />
             </div>
          </div>
      );
  }

  // Library View (Block-style)
  if (viewMode === 'library') {
    return (
       <div className="group relative flex flex-col justify-between py-3 px-4 border-l-2 border-transparent transition-colors hover:bg-muted/50 cursor-default">
           <div className="flex items-center justify-between w-full">
               <div className="flex items-center gap-3">
                   <button onClick={handlePlay} className="text-muted-foreground hover:text-primary transition-colors"><Play size={16} fill="currentColor" /></button>
                   <div className="flex flex-col items-start leading-none">
                       <span className="font-serif italic text-foreground text-lg flex items-center gap-2">
                           {currentChord.root}<span className="text-sm">{currentChord.suffix}</span>
                       </span>
                       <span className="text-[10px] text-muted-foreground font-mono mt-1">{currentChord.quality}</span>
                   </div>
               </div>
               
               <div className="flex items-center gap-2">
                   {group.voicings.length > 1 && (
                       <div className="flex items-center gap-1 bg-background border border-border rounded-sm mr-2">
                           <button onClick={goPrev} className="p-1 text-muted-foreground hover:text-foreground"><ChevronLeft size={14} /></button>
                           <span className="text-[10px] font-mono text-muted-foreground min-w-[20px] text-center">
                               {internalIdx + 1}
                           </span>
                           <button onClick={goNext} className="p-1 text-muted-foreground hover:text-foreground"><ChevronRight size={14} /></button>
                       </div>
                   )}
                   {onAdd && (
                       <button onClick={handleAdd} className="px-3 py-1 bg-primary text-primary-foreground text-[10px] uppercase font-bold hover:bg-primary/90 transition-colors rounded-sm">Add</button>
                   )}
               </div>
           </div>
       </div>
    );
  }

  // Progression View (Diagram-style with robust interactive elements)
  return (
      <div className={cn(
        "group relative flex flex-col items-center bg-muted/50 border border-border p-4 transition-all hover:border-primary/50 w-[180px] h-[206px] shrink-0",
        isBest && !isCurrentlyPlaying && "border-primary/50 bg-primary/5",
        isCurrentlyPlaying && "border-primary ring-2 ring-primary shadow-[0_0_15px_var(--primary)] bg-primary/10"
      )}>
          {indexLabel !== undefined && (
               <span className="text-[10px] text-muted-foreground font-mono absolute top-2 left-2 z-20">{indexLabel}</span>
           )}
          {onRemove && (
               <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive z-20 opacity-50 group-hover:opacity-100 transition-opacity">
                 <Trash2 size={14} />
               </button>
           )}

           <div className="w-full flex justify-center items-center mb-4 z-20 h-8">
               <span className="font-serif italic text-foreground text-2xl flex gap-1 items-center">
                   {currentChord.root}<span className="text-lg">{currentChord.suffix}</span>
                   {isBest && <Sparkles size={14} className="text-primary ml-1" title="Best Voice Leading" />}
               </span>
           </div>
           
           <div className="relative w-[130px] h-[80px] z-10 pointer-events-none mb-4">
               <ChordDiagram chord={currentChord} className="!p-0 !bg-transparent !border-none !hover:border-transparent absolute top-0 left-0" />
           </div>

           <div className="w-full flex justify-between items-center z-20">
               {group.voicings.length > 1 ? (
                   <button onClick={goPrev} className="p-1 text-muted-foreground hover:text-primary transition-colors bg-background border border-border rounded-sm"><ChevronLeft size={16}/></button>
               ) : <div className="w-7" />}
               
               <div className="flex gap-2 items-center">
                   <button onClick={handlePlay} className="p-1.5 bg-background border border-border hover:border-primary hover:text-primary transition-colors rounded-full shadow-sm text-foreground">
                       <Play size={12} fill="currentColor" />
                   </button>
                   <span className="text-[10px] font-mono text-muted-foreground px-2 bg-background border border-border rounded-sm py-1 min-w-[36px] text-center">
                     V{internalIdx + 1}/{group.voicings.length}
                   </span>
               </div>
               
               {group.voicings.length > 1 ? (
                   <button onClick={goNext} className="p-1 text-muted-foreground hover:text-primary transition-colors bg-background border border-border rounded-sm"><ChevronRight size={16}/></button>
               ) : <div className="w-7" />}
           </div>
      </div>
  );
}
