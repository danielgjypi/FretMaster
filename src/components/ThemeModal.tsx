import React, { useState, useEffect } from 'react';
import { X, Play, Copy, LayoutTemplate, Trash2, Github, Search } from 'lucide-react';
import { Theme, CustomThemeData } from './ThemeProvider';
import { THEMES } from '../lib/themes';
import { CHORD_GROUPS, Chord } from '../lib/chords';
import { cn } from '../lib/utils';
import { ChordDiagram } from './ChordDiagram';
import { motion, AnimatePresence } from 'motion/react';
import { useEasterEgg } from './EasterEgg';

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
  const { registerClick } = useEasterEgg();
  const [customThemes, setCustomThemes] = useState<CustomThemeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOpenGithub = () => {
    if (window.electronAPI) {
      window.electronAPI.openExternal('https://github.com/danielgjypi/FretMaster');
    } else {
      window.open('https://github.com/danielgjypi/FretMaster', '_blank');
    }
  };

  const filteredCustomThemes: CustomThemeData[] = customThemes.filter((t: CustomThemeData) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPresetThemes = THEMES.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        {/* Header - Matching Standard Style */}
        <div className="py-6 border-b border-border px-6 shrink-0 bg-muted/10 relative">
          <div className="flex items-center justify-between gap-8">
            <div className="shrink-0">
              <h2 className="text-xl font-serif italic text-foreground leading-none">Theme Gallery</h2>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-2">Personalize your visual experience</p>
            </div>

            {/* Sleek Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search themes..."
                    className="w-full bg-background/50 border border-border hover:border-primary/50 focus:border-primary px-10 py-2 text-xs focus:outline-none transition-all placeholder:text-muted-foreground/50 rounded-none"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <button 
                onClick={onClose} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
            >
                <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {filteredCustomThemes.length > 0 && (
              <div className="col-span-full mt-4 mb-2">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-primary border-b border-border/50 pb-2">Custom Creations</h3>
              </div>
            )}

            {filteredCustomThemes.map((t) => {
              const chord = getStableRandomChord(t.id);
              return (
              <div 
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={cn(
                  "theme-preview-card border cursor-pointer hover:scale-[1.02] transition-transform duration-200 flex flex-col overflow-hidden relative group/theme rounded-none",
                  currentTheme === t.id 
                    ? "ring-1 ring-primary border-primary shadow-[0_0_15px_var(--primary)]"
                    : "border-border hover:border-primary/50"
                )}
                style={{ 
                  height: '240px',
                  '--background': t.colors.background,
                  '--color-background': t.colors.background,
                  '--foreground': t.colors.foreground,
                  '--color-foreground': t.colors.foreground,
                  '--primary': t.colors.primary,
                  '--color-primary': t.colors.primary,
                  '--primary-foreground': t.colors.primaryForeground,
                  '--color-primary-foreground': t.colors.primaryForeground,
                  '--muted': t.colors.muted,
                  '--color-muted': t.colors.muted,
                  '--muted-foreground': t.colors.mutedForeground,
                  '--color-muted-foreground': t.colors.mutedForeground,
                  '--border': t.colors.border,
                  '--color-border': t.colors.border,
                  '--card': t.colors.card,
                  '--color-card': t.colors.card,
                  '--dot-glow': 'drop-shadow(0 0 4px var(--primary))',
                } as React.CSSProperties}
              >
                {/* Delete Button */}
                <button 
                  onClick={(e) => deleteCustomTheme(e, t.id)}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-none border border-border/50 opacity-0 group-hover/theme:opacity-100 transition-opacity z-20"
                >
                  <Trash2 size={12} />
                </button>

                {/* Top preview half */}
                <div className="flex-1 bg-background relative flex items-center justify-center border-b border-border p-4 h-full w-full">
                  
                  {/* Decorative UI elements inside the preview */}
                  <div className="absolute top-3 left-3 text-foreground font-serif italic text-xl font-bold opacity-40">
                    Aa
                  </div>

                  {/* Tiny mock chord diagram */}
                  <div className="scale-[0.55] origin-center -mt-2 opacity-90 pointer-events-none">
                     <ChordDiagram chord={chord} className="!bg-transparent !border-none !p-0" />
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="px-2 py-0.5 bg-primary text-primary-foreground text-[7px] uppercase font-bold rounded-none">
                      Active
                    </div>
                  </div>
                </div>

                {/* Bottom info half */}
                <div className="h-16 bg-card px-4 flex items-center justify-between z-10 border-t border-black/10 gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-foreground text-xs truncate">{t.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground truncate opacity-70">{t.description || "Custom Theme"}</span>
                  </div>
                  {currentTheme === t.id && (
                     <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0"></div>
                  )}
                </div>
              </div>
            )})}

            {filteredPresetThemes.length > 0 && (
              <div className="col-span-full mt-2 mb-2">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-primary border-b border-border/50 pb-2">Factory Presets</h3>
              </div>
            )}

            {filteredPresetThemes.map((t) => {
              const chord = getStableRandomChord(t.id);
              return (
              <div 
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={cn(
                  "theme-preview-card border cursor-pointer hover:scale-[1.02] transition-transform duration-200 flex flex-col overflow-hidden rounded-none",
                  `theme-${t.id}`,
                  currentTheme === t.id 
                    ? (t.isLight ? "ring-1 ring-primary border-primary" : "ring-1 ring-primary border-primary shadow-[0_0_15px_var(--primary)]") 
                    : "border-border hover:border-primary/50"
                )}
                style={{ 
                  height: '240px',
                  '--background': t.colors.bg,
                  '--color-background': t.colors.bg,
                  '--foreground': t.colors.fg,
                  '--color-foreground': t.colors.fg,
                  '--primary': t.colors.primary,
                  '--color-primary': t.colors.primary,
                  '--primary-foreground': t.colors.primaryFg,
                  '--color-primary-foreground': t.colors.primaryFg,
                  '--muted': t.colors.muted,
                  '--color-muted': t.colors.muted,
                  '--muted-foreground': t.colors.mutedFg,
                  '--color-muted-foreground': t.colors.mutedFg,
                  '--border': t.colors.border,
                  '--color-border': t.colors.border,
                  '--card': t.colors.card,
                  '--color-card': t.colors.card,
                  '--dot-glow': t.isLight ? 'none' : 'drop-shadow(0 0 4px var(--primary))',
                } as React.CSSProperties}
              >
                {/* Top preview half */}
                <div className="flex-1 bg-background relative flex items-center justify-center border-b border-border p-4 h-full w-full">
                  
                  {/* Decorative UI elements inside the preview */}
                  <div className="absolute top-3 left-3 text-foreground font-serif italic text-xl font-bold opacity-40">
                    Aa
                  </div>

                  {/* Tiny mock chord diagram */}
                  <div className="scale-[0.55] origin-center -mt-2 opacity-90 pointer-events-none">
                     <ChordDiagram chord={chord} className="!bg-transparent !border-none !p-0" />
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="px-2 py-0.5 bg-primary text-primary-foreground text-[7px] uppercase font-bold rounded-none">
                      Studio
                    </div>
                  </div>
                </div>

                {/* Bottom info half */}
                <div className="h-16 bg-card px-4 flex items-center justify-between z-10 border-t border-black/10 gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-foreground text-xs truncate">{t.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground truncate opacity-70">{t.id}</span>
                  </div>
                  {currentTheme === t.id && (
                     <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0"></div>
                  )}
                </div>
              </div>
            )})}

            {filteredCustomThemes.length === 0 && filteredPresetThemes.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <LayoutTemplate size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-sm font-serif italic">No themes match your search</p>
                </div>
            )}
          </div>
        </div>

        {/* Footer - Consistent Branding */}
        <div className="p-6 border-t border-border flex justify-between items-center opacity-50 bg-muted/5 shrink-0">
            <button 
                onClick={handleOpenGithub}
                className="text-[10px] uppercase tracking-[0.2em] font-mono flex items-center gap-1.5 hover:text-primary transition-colors group"
            >
                <Github size={12} className="text-primary" /> danielgjypi/FretMaster
            </button>
            <span 
              className="text-[10px] font-mono font-bold text-foreground/80 cursor-pointer hover:text-primary transition-colors select-none"
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
