import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Plus, Minus, X, Volume2 } from 'lucide-react';
import { MetronomeIcon } from './Icons';
import { cn } from '../lib/utils';
import { useMetronome, MetronomeSound } from '../hooks/useMetronome';

interface MetronomePanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Passing the hook state down so we don't lose state when closing the panel
  metronome: ReturnType<typeof useMetronome>;
  className?: string;
}

const SOUND_OPTIONS: { id: MetronomeSound, label: string }[] = [
  { id: 'digital', label: 'Digital' },
  { id: 'woodblock', label: 'Woodblock' },
  { id: 'cowbell', label: 'Cowbell' }
];

export function MetronomePanel({ isOpen, onClose, metronome, className }: MetronomePanelProps) {
  const {
    bpm,
    setBpm,
    isPlaying,
    togglePlay,
    beatsPerMeasure,
    setBeatsPerMeasure,
    currentBeat,
    sound,
    setSound,
    volume,
    setVolume,
    previewSound
  } = metronome;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute bottom-[140%] left-1/2 -translate-x-1/2 z-50 w-80 p-6 bg-card border border-border shadow-2xl flex flex-col gap-6",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MetronomeIcon size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Metronome</span>
            </div>
            <button 
               onClick={onClose}
               className="p-1 hover:bg-muted text-muted-foreground transition-colors"
            >
               <X size={16} />
            </button>
          </div>

          {/* BPM Display */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-serif italic font-bold text-foreground tracking-tight mb-2">
              {bpm}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              BPM
            </div>
          </div>

          {/* BPM Controls */}
          <div className="flex items-center justify-center gap-4">
             <button 
                onClick={() => setBpm(Math.max(40, bpm - 1))}
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted text-foreground transition-colors"
             >
                <Minus size={18} />
             </button>
             <input 
                type="range" 
                min="40" 
                max="340" 
                value={bpm} 
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full h-1 bg-muted appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
             />
             <button 
                onClick={() => setBpm(Math.min(340, bpm + 1))}
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted text-foreground transition-colors"
             >
                <Plus size={18} />
             </button>
          </div>

          {/* Time Signature Controls */}
          <div className="flex flex-col gap-2">
             <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center">
                Time Signature
             </div>
             <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {[2, 3, 4, 5, 6, 7].map(beats => (
                   <button
                      key={beats}
                      onClick={() => setBeatsPerMeasure(beats)}
                      className={cn(
                         "w-10 h-8 text-xs font-bold transition-colors",
                         beatsPerMeasure === beats ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                   >
                      {beats}/4
                   </button>
                ))}
             </div>
          </div>

          {/* Sound & Volume Controls */}
          <div className="flex flex-col gap-4 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <Volume2 size={16} className="text-muted-foreground shrink-0" />
              <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-muted appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
            
            <div className="flex gap-1 bg-muted/30 p-1">
              {SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSound(opt.id);
                    previewSound(opt.id);
                  }}
                  className={cn(
                    "flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors",
                    sound === opt.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visualizer */}
          <div className="flex items-center justify-center gap-2 mt-2 h-4">
             {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                <div 
                   key={i}
                   className={cn(
                      "transition-all duration-100",
                      isPlaying && currentBeat === i 
                         ? (i === 0 ? "w-3 h-3 bg-primary shadow-[0_0_8px_var(--primary)]" : "w-2.5 h-2.5 bg-foreground") 
                         : "w-2 h-2 bg-muted"
                   )}
                />
             ))}
          </div>

          {/* Main Play Toggle */}
          <button 
             onClick={togglePlay}
             className={cn(
                "w-full h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors",
                isPlaying ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
             )}
          >
             {isPlaying ? (
                <>
                   <Square size={16} className="fill-current" /> STOP
                </>
             ) : (
                <>
                   <Play size={16} className="fill-current" /> PLAY
                </>
             )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
