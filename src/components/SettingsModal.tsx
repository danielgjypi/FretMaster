import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  autoPlayEnabled: boolean;
  onAutoPlayChange: (enabled: boolean) => void;
  showNoteNames: boolean;
  onShowNoteNamesChange: (show: boolean) => void;
  showGlow: boolean;
  onShowGlowChange: (show: boolean) => void;
}

export const INSTRUMENT_OPTIONS = [
  { value: 'acoustic_guitar_nylon', label: 'Acoustic Guitar (Nylon)' },
  { value: 'acoustic_guitar_steel', label: 'Acoustic Guitar (Steel)' },
  { value: 'electric_guitar_clean', label: 'Electric Guitar (Clean)' },
  { value: 'overdriven_guitar', label: 'Electric Guitar (Overdrive)' },
  { value: 'distortion_guitar', label: 'Electric Guitar (Distortion)' },
  { value: 'electric_guitar_jazz', label: 'Electric Guitar (Jazz)' },
];

const SPEED_OPTIONS = [
  { value: '0.5', label: '0.5x (Half Speed)' },
  { value: '0.75', label: '0.75x' },
  { value: '1', label: '1x (Normal)' },
  { value: '1.25', label: '1.25x' },
  { value: '1.5', label: '1.5x' },
  { value: '2', label: '2x (Double Speed)' },
];

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-background border border-border max-w-md w-full shadow-2xl flex flex-col text-foreground overflow-visible"
          >
        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-serif italic text-foreground flex items-center gap-2">
            <Settings2 size={20} className="text-primary" /> Settings
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">Playback Speed</label>
            <CustomSelect
              options={SPEED_OPTIONS}
              value={playbackSpeed.toString()}
              onChange={(val) => onPlaybackSpeedChange(parseFloat(val))}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Auto-play on add</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoPlayEnabled} 
                  onChange={(e) => onAutoPlayChange(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
            <p className="text-xs text-muted-foreground -mt-1">Automatically play chord sound when added to the progression.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Show Note Names</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showNoteNames} 
                  onChange={(e) => onShowNoteNamesChange(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
            <p className="text-xs text-muted-foreground -mt-1">Show interval names on the fingering dots in diagrams.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Show Glow Effect</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showGlow} 
                  onChange={(e) => onShowGlowChange(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
            <p className="text-xs text-muted-foreground -mt-1">Show a glowing drop shadow on chord dots (Dark themes only).</p>
          </div>
        </div>
        
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
