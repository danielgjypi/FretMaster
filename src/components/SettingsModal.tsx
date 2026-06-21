import React, { useState, useEffect } from 'react';
import { X, Github, Zap, Eye, Sparkles, Activity } from 'lucide-react';
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
  keyboardLabelMode: 'none' | 'scientific' | 'solfege';
  onKeyboardLabelModeChange: (mode: 'none' | 'scientific' | 'solfege') => void;
  audioDeviceId?: string | null;
  onAudioDeviceChange?: (deviceId: string) => void;
  strictPitchMatching: boolean;
  onStrictPitchMatchingChange: (enabled: boolean) => void;
  isLeftHanded: boolean;
  onLeftHandedChange: (enabled: boolean) => void;
  flipVertical: boolean;
  onFlipVerticalChange: (enabled: boolean) => void;
  noiseGate: number;
  onNoiseGateChange: (gate: number) => void;
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
  onShowGlowChange,
  keyboardLabelMode,
  onKeyboardLabelModeChange,
  audioDeviceId,
  onAudioDeviceChange,
  strictPitchMatching,
  onStrictPitchMatchingChange,
  isLeftHanded,
  onLeftHandedChange,
  flipVertical,
  onFlipVerticalChange,
  noiseGate,
  onNoiseGateChange
}: SettingsModalProps) {
  const { registerClick } = useEasterEgg();
  const [audioDevices, setAudioDevices] = useState<{value: string, label: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'visuals' | 'audio' | 'playback'>('visuals');

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const inputs = devices
            .filter(d => d.kind === 'audioinput')
            .map(d => ({
              value: d.deviceId,
              label: d.label || `Microphone ${d.deviceId.slice(0, 5)}...`
            }));
          setAudioDevices([{ value: 'default', label: 'Default System Mic' }, ...inputs]);
        })
        .catch(console.error);
    }
  }, [isOpen]);

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
        
        {/* Tabs Bar */}
        <div className="flex border-b border-border bg-muted/5 shrink-0">
            {(['visuals', 'audio', 'playback'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "flex-1 py-4 px-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 text-center border-r last:border-r-0 border-border/50",
                        activeTab === tab
                            ? "bg-background text-primary shadow-[inset_0_-2px_0_var(--primary)]"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar h-[420px] bg-background">
          {activeTab === 'audio' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Audio Input Source</label>
                <CustomSelect
                  options={audioDevices.length > 0 ? audioDevices : [{ value: 'default', label: 'Default System Mic' }]}
                  value={audioDeviceId || 'default'}
                  onChange={(val) => onAudioDeviceChange?.(val === 'default' ? '' : val)}
                />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic mb-2">Hardware device for pitch detection</p>
                
                <button 
                    onClick={() => onStrictPitchMatchingChange(!strictPitchMatching)}
                    className={cn(
                        "w-full p-4 border flex items-center justify-between transition-all group mt-6",
                        strictPitchMatching 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors p-1",
                            strictPitchMatching ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                strictPitchMatching ? "translate-x-4" : "translate-x-0"
                            )} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase">Strict Octave Matching</div>
                            <div className="text-[9px] opacity-70">Only highlight exact pitch (e.g. D3 ≠ D4)</div>
                        </div>
                    </div>
                    <Activity size={16} className={cn(strictPitchMatching ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                </button>
                
                <div className="pt-4 space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Input Sensitivity (Noise Gate)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="0.1" 
                      step="0.001" 
                      value={noiseGate} 
                      onChange={(e) => onNoiseGateChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-[10px] font-mono w-8 text-right">{(noiseGate * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic">Increase to reject background noise</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playback' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Progression Speed</label>
                <CustomSelect
                  options={SPEED_OPTIONS}
                  value={playbackSpeed.toString()}
                  onChange={(val) => onPlaybackSpeedChange(parseFloat(val))}
                />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic">Speed of the chord progression player</p>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Automation</label>
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
                            <div className="text-[9px] opacity-70">Hear chords instantly when added</div>
                        </div>
                    </div>
                    <Zap size={16} className={cn(autoPlayEnabled ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'visuals' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Fretboard Display</label>
                <div className="space-y-2">
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
                                <div className="text-[9px] opacity-70">Display interval names on frets</div>
                            </div>
                        </div>
                        <Eye size={16} className={cn(showNoteNames ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                    </button>

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

              <div className="space-y-3 pt-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Layout & Orientation</label>
                <div className="space-y-2">
                    <button 
                        onClick={() => onLeftHandedChange(!isLeftHanded)}
                        className={cn(
                            "w-full p-4 border flex items-center justify-between transition-all group",
                            isLeftHanded 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-6 rounded-full relative transition-colors p-1",
                                isLeftHanded ? "bg-primary" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                    isLeftHanded ? "translate-x-4" : "translate-x-0"
                                )} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase">Left-Handed Mode</div>
                                <div className="text-[9px] opacity-70">Horizontal flip (Nut on right)</div>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => onFlipVerticalChange(!flipVertical)}
                        className={cn(
                            "w-full p-4 border flex items-center justify-between transition-all group",
                            flipVertical 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-6 rounded-full relative transition-colors p-1",
                                flipVertical ? "bg-primary" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                    flipVertical ? "translate-x-4" : "translate-x-0"
                                )} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase">Flip Strings Vertically</div>
                                <div className="text-[9px] opacity-70">Low E on top, High E on bottom</div>
                            </div>
                        </div>
                    </button>
                </div>
              </div>



              <div className="space-y-3 pt-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Virtual Keyboard</label>
                <div className="flex border border-border bg-background">
                  {(['none', 'scientific', 'solfege'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onKeyboardLabelModeChange(mode)}
                      className={cn(
                        "flex-1 py-3 px-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 text-center border-r last:border-r-0 border-border/50",
                        keyboardLabelMode === mode 
                          ? "bg-primary/20 text-primary shadow-[inset_0_2px_10px_rgba(var(--primary),0.2)]" 
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      {mode === 'none' ? 'None' : mode === 'scientific' ? 'Scientific' : 'Solfège'}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic">Naming convention for piano keys</p>
              </div>
            </div>
          )}
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
              v1.2.0
            </span>
        </div>
        
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
