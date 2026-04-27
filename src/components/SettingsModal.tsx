import React from 'react';
import { X, Github, Zap, Eye, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CustomSelect } from './CustomSelect';
import { useEasterEgg } from './EasterEgg';

const SPEED_OPTIONS = [
  { value: '0.5', label: '0.5x (Slow)' },
  { value: '0.75', label: '0.75x' },
  { value: '1', label: '1x (Normal)' },
  { value: '1.25', label: '1.25x' },
  { value: '1.5', label: '1.5x' },
  { value: '2', label: '2x (Fast)' },
];

export const INSTRUMENT_OPTIONS = [
  { value: 'acoustic_guitar_nylon', label: 'Nylon String' },
  { value: 'acoustic_guitar_steel', label: 'Steel String Guitar' },
  { value: 'electric_guitar_clean', label: 'Clean Electric' },
  { value: 'electric_guitar_jazz', label: 'Jazz Electric' },
  { value: 'overdriven_guitar', label: 'Overdriven Guitar' },
  { value: 'distortion_guitar', label: 'Distortion Guitar' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  autoPlayEnabled: boolean;
  onAutoPlayChange: (enabled: boolean) => void;
  showNoteNames: boolean;
  onShowNoteNamesChange: (enabled: boolean) => void;
  showGlow: boolean;
  onShowGlowChange: (enabled: boolean) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  playbackSpeed, 
  onPlaybackSpeedChange,
  autoPlayEnabled,
  onAutoPlayChange,
  showNoteNames,
  onShowNoteNamesChange,
  showGlow,
  onShowGlowChange
}: SettingsModalProps) {
  const { registerClick } = useEasterEgg();

  const handleOpenGithub = () => {
    if (window.electronAPI) {
      window.electronAPI.openExternal('https://github.com/danielgjypi/FretMaster');
    } else {
      window.open('https://github.com/danielgjypi/FretMaster', '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-card border border-border max-w-md w-full shadow-2xl flex flex-col text-foreground overflow-hidden"
          >
        
        {/* Header - Matching SaveModal Style */}
        <div className="py-6 border-b border-border px-6 shrink-0 bg-muted/10 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif italic text-foreground leading-none">Global Settings</h2>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-2">Adjust playback and interface</p>
            </div>
            <button 
                onClick={onClose} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
                <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[65vh]">
          {/* Section: Playback */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Playback Speed</label>
            <CustomSelect
              options={SPEED_OPTIONS}
              value={playbackSpeed.toString()}
              onChange={(val) => onPlaybackSpeedChange(parseFloat(val))}
            />
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic">Speed of the progression player</p>
          </div>

          {/* Section: UX */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">User Experience</label>

            <div className="space-y-2">
                {/* Auto-play - Using SaveModal Toggle Style */}
                <button 
                    onClick={() => onAutoPlayChange(!autoPlayEnabled)}
                    className={cn(
                        "w-full p-4 border flex items-center justify-between transition-all group",
                        autoPlayEnabled 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors p-1",
                            autoPlayEnabled ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                autoPlayEnabled ? "translate-x-4" : "translate-x-0"
                            )} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase">Auto-play on add</div>
                            <div className="text-[9px] opacity-70">Hear chords instantly</div>
                        </div>
                    </div>
                    <Zap size={16} className={cn(autoPlayEnabled ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                </button>

                {/* Show Notes */}
                <button 
                    onClick={() => onShowNoteNamesChange(!showNoteNames)}
                    className={cn(
                        "w-full p-4 border flex items-center justify-between transition-all group",
                        showNoteNames 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors p-1",
                            showNoteNames ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                showNoteNames ? "translate-x-4" : "translate-x-0"
                            )} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase">Visual Note Labels</div>
                            <div className="text-[9px] opacity-70">Display interval names</div>
                        </div>
                    </div>
                    <Eye size={16} className={cn(showNoteNames ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                </button>

                {/* Glow Effect */}
                <button 
                    onClick={() => onShowGlowChange(!showGlow)}
                    className={cn(
                        "w-full p-4 border flex items-center justify-between transition-all group",
                        showGlow 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors p-1",
                            showGlow ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                showGlow ? "translate-x-4" : "translate-x-0"
                            )} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase">Diagram Glow Effect</div>
                            <div className="text-[9px] opacity-70">Neon aesthetic for dark themes</div>
                        </div>
                    </div>
                    <Sparkles size={16} className={cn(showGlow ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center opacity-50 bg-muted/5 shrink-0">
            <button 
                onClick={handleOpenGithub}
                className="text-[10px] uppercase tracking-[0.2em] font-mono flex items-center gap-1.5 hover:text-primary transition-colors group"
            >
                <Github size={12} className="text-primary" /> danielgjypi/FretMaster
            </button>
            <span 
              className="text-[10px] font-mono font-bold cursor-pointer hover:text-primary transition-colors select-none"
              onClick={registerClick}
            >
              v1.1.1
            </span>
        </div>
        
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
