import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Copy, LayoutTemplate, Trash2 } from 'lucide-react';
import { Theme, CustomThemeData } from './ThemeProvider';
import { THEMES } from '../lib/themes';
import { CHORD_GROUPS, Chord } from '../lib/chords';
import { cn } from '../lib/utils';
import { ChordDiagram } from './ChordDiagram';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

// Function to deterministically pick a chord from CHORD_GROUPS based on string hash
const getStableRandomChord = (id: string): Chord => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const allChords = CHORD_GROUPS.flatMap(g => g.voicings);
  const index = Math.abs(hash) % allChords.length;
  return allChords[index];
};

export function ThemeModal({ isOpen, onClose, currentTheme, onSelectTheme }: ThemeModalProps) {
  const [customThemes, setCustomThemes] = useState<CustomThemeData[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('fretmaster-custom-themes');
      if (saved) {
        try {
          setCustomThemes(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  const deleteCustomTheme = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newThemes = customThemes.filter(t => t.id !== id);
    setCustomThemes(newThemes);
    localStorage.setItem('fretmaster-custom-themes', JSON.stringify(newThemes));
    if (currentTheme === id) {
      onSelectTheme('zinc'); // Fallback to default
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-card border border-border max-w-5xl w-full h-[80vh] min-h-[600px] shadow-2xl flex flex-col overflow-hidden text-foreground"
          >
        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-serif italic text-foreground flex items-center gap-2">
            <LayoutTemplate size={20} className="text-primary" /> Theme Gallery
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {customThemes.length > 0 && (
              <div className="col-span-full mt-4 mb-2">
                <h3 className="text-sm uppercase font-bold tracking-widest text-muted-foreground border-b border-border pb-2">Custom Themes</h3>
              </div>
            )}

            {customThemes.map((t) => {
              const chord = getStableRandomChord(t.id);
              return (
              <div 
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={cn(
                  "theme-preview-card border cursor-pointer hover:scale-[1.02] transition-transform duration-200 flex flex-col overflow-hidden relative group/theme",
                  currentTheme === t.id 
                    ? "ring-2 ring-primary border-primary shadow-[0_0_15px_var(--primary)]"
                    : "border-border hover:border-primary/50"
                )}
                style={{ 
                  height: '240px',
                  '--color-background': t.colors.background,
                  '--color-foreground': t.colors.foreground,
                  '--color-primary': t.colors.primary,
                  '--color-primary-foreground': t.colors.primaryForeground,
                  '--color-muted': t.colors.muted,
                  '--color-muted-foreground': t.colors.mutedForeground,
                  '--color-border': t.colors.border,
                  '--color-card': t.colors.card,
                  '--dot-glow': 'drop-shadow(0 0 4px var(--primary))',
                } as React.CSSProperties}
              >
                {/* Delete Button */}
                <button 
                  onClick={(e) => deleteCustomTheme(e, t.id)}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-md opacity-0 group-hover/theme:opacity-100 transition-opacity z-20"
                >
                  <Trash2 size={14} />
                </button>

                {/* Top preview half */}
                <div className="flex-1 bg-background relative flex items-center justify-center border-b border-border p-4 h-full w-full">
                  
                  {/* Decorative UI elements inside the preview */}
                  <div className="absolute top-3 left-3 text-foreground font-serif italic text-xl font-bold">
                    Aa
                  </div>

                  {/* Tiny mock chord diagram */}
                  <div className="scale-[0.55] origin-center -mt-2 opacity-90 pointer-events-none">
                     <ChordDiagram chord={chord} className="!bg-transparent !border-none !p-0" />
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="px-2 py-0.5 bg-primary text-primary-foreground text-[8px] uppercase font-bold rounded-sm">
                      Active
                    </div>
                    <div className="px-2 py-0.5 border border-border text-foreground text-[8px] uppercase font-bold rounded-sm">
                      Btn
                    </div>
                  </div>
                </div>

                {/* Bottom info half */}
                <div className="h-16 bg-card px-3 flex items-center justify-between z-10 border-t border-black/10 gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-foreground text-sm truncate">{t.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{t.description || "Custom Theme"}</span>
                  </div>
                  {currentTheme === t.id && (
                     <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-2 py-1 rounded shrink-0">Current</span>
                  )}
                </div>
              </div>
            )})}

            <div className="col-span-full mt-4 mb-2">
              <h3 className="text-sm uppercase font-bold tracking-widest text-muted-foreground border-b border-border pb-2">Preset Themes</h3>
            </div>

            {THEMES.map((t) => {
              const chord = getStableRandomChord(t.id);
              return (
              <div 
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={cn(
                  "theme-preview-card border cursor-pointer hover:scale-[1.02] transition-transform duration-200 flex flex-col overflow-hidden",
                  currentTheme === t.id 
                    ? (t.isLight ? "ring-2 ring-primary border-primary" : "ring-2 ring-primary border-primary shadow-[0_0_15px_var(--primary)]") 
                    : "border-border hover:border-primary/50"
                )}
                style={{ 
                  height: '240px',
                  '--color-background': t.colors.bg,
                  '--color-foreground': t.colors.fg,
                  '--color-primary': t.colors.primary,
                  '--color-primary-foreground': t.colors.primaryFg,
                  '--color-muted': t.colors.muted,
                  '--color-muted-foreground': t.colors.mutedFg,
                  '--color-border': t.colors.border,
                  '--color-card': t.colors.card,
                  '--dot-glow': t.isLight ? 'none' : 'drop-shadow(0 0 4px var(--primary))',
                } as React.CSSProperties}
              >
                {/* Top preview half */}
                <div className="flex-1 bg-background relative flex items-center justify-center border-b border-border p-4 h-full w-full">
                  
                  {/* Decorative UI elements inside the preview */}
                  <div className="absolute top-3 left-3 text-foreground font-serif italic text-xl font-bold">
                    Aa
                  </div>

                  {/* Tiny mock chord diagram */}
                  <div className="scale-[0.55] origin-center -mt-2 opacity-90 pointer-events-none">
                     <ChordDiagram chord={chord} className="!bg-transparent !border-none !p-0" />
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="px-2 py-0.5 bg-primary text-primary-foreground text-[8px] uppercase font-bold rounded-sm">
                      Active
                    </div>
                    <div className="px-2 py-0.5 border border-border text-foreground text-[8px] uppercase font-bold rounded-sm">
                      Btn
                    </div>
                  </div>
                </div>

                {/* Bottom info half */}
                <div className="h-16 bg-card px-3 flex items-center justify-between z-10 border-t border-black/10 gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-foreground text-sm truncate">{t.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{t.id}</span>
                  </div>
                  {currentTheme === t.id && (
                     <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-2 py-1 rounded shrink-0">Current</span>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
        
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
