import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Play as PlayIcon } from 'lucide-react';
import { CustomThemeData, useTheme } from './ThemeProvider';
import { HexColorPicker } from 'react-colorful';
import { ChordDiagram } from './ChordDiagram';
import { motion, AnimatePresence } from 'motion/react';

interface CustomThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockThemeChord = {
  id: 'mock-C-theme',
  root: 'C',
  suffix: 'maj7',
  quality: 'Major',
  frets: [-1, 3, 2, 0, 0, 0],
  fingers: [0, 3, 2, 0, 0, 0],
  notes: ['C3', 'E3', 'G3', 'B3', 'E4']
};

export function CustomThemeModal({ isOpen, onClose }: CustomThemeModalProps) {
  const { setTheme } = useTheme();
  const [name, setName] = useState('My Custom Theme');
  const [description, setDescription] = useState('A personalized theme for Fretmaster.');
  const [activeColorPicker, setActiveColorPicker] = useState<keyof typeof defaultColors | null>(null);
  
  const defaultColors = {
    background: '#09090b',
    foreground: '#fafafa',
    primary: '#f4f4f5',
    primaryForeground: '#09090b',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
    card: '#09090b',
  };

  const [colors, setColors] = useState(defaultColors);

  useEffect(() => {
    if (isOpen) {
      // Just initialize with defaults for new theme creation 
      // (a real app might allow editing existing themes, but we'll focus on creation)
      setColors(defaultColors);
      setName('My Custom Theme');
      setDescription('A personalized theme for Fretmaster.');
      setActiveColorPicker(null);
    }
  }, [isOpen]);

  const updateColor = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const saveTheme = () => {
    try {
      const existing = localStorage.getItem('fretmaster-custom-themes');
      let themes: CustomThemeData[] = [];
      if (existing) {
        themes = JSON.parse(existing);
      }
      
      const newThemeId = `custom-${Date.now()}`;
      
      const newTheme: CustomThemeData = {
        id: newThemeId,
        name: name || 'Untitled Theme',
        description: description || '',
        colors: colors
      };
      
      themes.push(newTheme);
      localStorage.setItem('fretmaster-custom-themes', JSON.stringify(themes));
      
      setTheme(newThemeId);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDefault = () => {
    setColors(defaultColors);
    setActiveColorPicker(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-card border border-border w-full max-w-5xl h-[80vh] min-h-[600px] max-h-[800px] shadow-2xl flex flex-col md:flex-row overflow-hidden text-foreground"
          >
        
        {/* Mockup Panel */}
        <div 
           className="w-full md:w-[45%] p-8 flex flex-col border-b md:border-b-0 md:border-r border-border relative transition-colors duration-300"
           style={{ backgroundColor: colors.background, color: colors.foreground }}
        >
          <div className="flex flex-col gap-6 h-full max-w-sm mx-auto w-full pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif italic text-3xl transition-colors duration-300" style={{ color: colors.foreground }}>Fretmaster</h2>
              <div style={{ color: colors.primary }} className="text-2xl font-bold font-serif italic transition-colors duration-300">FM.</div>
            </div>

            <div 
               className="rounded-lg p-6 flex flex-col gap-6 border shadow-2xl transition-colors duration-300 relative overflow-hidden"
               style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
               <h3 className="text-xs font-bold uppercase tracking-widest transition-colors duration-300" style={{ color: colors.mutedForeground }}>Track Overview</h3>
               
               <div 
                 className="p-4 rounded-md flex items-center justify-center gap-4 text-sm font-mono font-bold transition-colors duration-300 shadow-inner relative"
                 style={{ backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, borderWidth: '1px', minHeight: '180px' }}
               >
                  <div className="flex flex-col items-center">
                    {/* Tiny mock chord diagram injected */}
                    <div className="scale-[0.6] origin-center -my-2" style={{
                      '--color-background': colors.background,
                      '--color-foreground': colors.foreground,
                      '--color-primary': colors.primary,
                      '--color-primary-foreground': colors.primaryForeground,
                      '--color-muted': colors.muted,
                      '--color-muted-foreground': colors.mutedForeground,
                      '--color-border': colors.border,
                      '--color-card': colors.card,
                      '--dot-glow': `drop-shadow(0 0 4px ${colors.primary})`,
                    } as React.CSSProperties}>
                       <ChordDiagram chord={mockThemeChord} className="!bg-transparent !border-none" />
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-2">
                  <button 
                    className="px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all duration-300"
                    style={{ backgroundColor: colors.primary, color: colors.primaryForeground, boxShadow: `0 4px 14px 0 ${colors.primary}40` }}
                  >
                    <PlayIcon size={14} fill="currentColor" /> Play
                  </button>
                  <button 
                    className="px-6 py-2.5 font-bold uppercase text-[10px] tracking-widest border transition-colors duration-300"
                    style={{ backgroundColor: 'transparent', color: colors.foreground, borderColor: colors.border }}
                  >
                    Clear
                  </button>
               </div>
            </div>

            <div className="mt-auto items-center flex gap-4 transition-colors duration-300" style={{ color: colors.mutedForeground }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-300" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                   <Palette size={16} />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest">
                  Preview 
                </div>
            </div>
          </div>
        </div>

        {/* Builder Panel */}
        <div className="w-full md:w-[55%] flex flex-col bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
                 Custom Theme Builder
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Design your own layout aesthetic.</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            
            {/* Meta */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Theme Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="E.g. Synthwave Dark"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="A cool dark theme with neon pinks..."
                />
              </div>
            </div>

            {/* Colors */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground border-b border-border pb-2">Color Palette</h3>
              
              <div className="grid gap-6">
                {Object.entries(colors).map(([key, val]) => {
                  return (
                    <div key={key} className="flex flex-col gap-3 bg-muted/30 p-4 border border-border/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-foreground font-bold">
                           --{key.replace(/([A-Z])/g, '-$1').toLowerCase()}
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={val as string}
                            onChange={e => updateColor(key as keyof typeof colors, e.target.value)}
                            className="bg-background border border-border px-2 py-1 text-xs focus:outline-none focus:border-primary w-20 uppercase font-mono text-foreground text-center"
                          />
                          <div 
                             className="w-6 h-6 rounded shrink-0 border border-border shadow-inner cursor-pointer relative"
                             style={{ backgroundColor: val as string }}
                             onClick={() => setActiveColorPicker(activeColorPicker === key ? null : key as keyof typeof defaultColors)}
                          />
                        </div>
                      </div>
                      
                      {/* React Colorful visual color picker */}
                      {activeColorPicker === key && (
                        <div className="pt-2 flex justify-center fade-in animate-in">
                          <HexColorPicker 
                            color={val as string} 
                            onChange={(newColor) => updateColor(key as keyof typeof colors, newColor)} 
                            style={{ width: '100%', height: '160px' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 bg-muted/10 shrink-0">
            <button 
              onClick={resetToDefault}
              className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase transition-colors"
            >
              Reset to default
            </button>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2 border border-border text-foreground hover:bg-muted text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveTheme}
                className="px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold uppercase flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
              >
                <Save size={14} /> Save Theme
              </button>
            </div>
          </div>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
