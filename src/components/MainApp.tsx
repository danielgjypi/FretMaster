import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { CHORD_GROUPS, Chord, getSuggestions } from '../lib/chords';
import { playChord, setBpm, setSynthInstrument, getCurrentInstrumentName, stopSynth, setVolume } from '../lib/synth';
import { Play as PlayIcon, Trash2, Music, FastForward, Settings2, Sparkles, Save, X, Check, Search, ChevronDown, Palette, Volume2, Minus, Square } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';
import { InteractiveChord } from './InteractiveChord';
import { SaveModal } from './SaveModal';
import { ThemeModal } from './ThemeModal';
import { SettingsModal, INSTRUMENT_OPTIONS } from './SettingsModal';
import { CustomThemeModal } from './CustomThemeModal';
import { CustomSelect } from './CustomSelect';
import { SplashScreen } from './SplashScreen';
import { AnimatedScrollInput } from './AnimatedScrollInput';
import { ScaleMaster } from './ScaleMaster';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function MainApp() {
  const { theme, setTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'fretmaster' | 'scalemaster'>(() => {
    return (localStorage.getItem('fretmaster-active-tab') as 'fretmaster' | 'scalemaster') || 'fretmaster';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [progression, setProgression] = useState<Chord[]>(() => {
    try {
      const saved = localStorage.getItem('fretmaster-progression');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);
  const [bpm, setBpmState] = useState(() => {
    const saved = localStorage.getItem('fretmaster-bpm');
    return saved ? parseInt(saved) : 120;
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('fretmaster-volume');
    return saved ? parseInt(saved) : 80;
  });
  const [instrument, setInstrument] = useState<string>(() => {
    return localStorage.getItem('fretmaster-instrument') || 'acoustic_guitar_nylon';
  });

  useEffect(() => { localStorage.setItem('fretmaster-progression', JSON.stringify(progression)); }, [progression]);
  useEffect(() => { localStorage.setItem('fretmaster-bpm', bpm.toString()); }, [bpm]);
  useEffect(() => { localStorage.setItem('fretmaster-volume', volume.toString()); }, [volume]);
  useEffect(() => { localStorage.setItem('fretmaster-instrument', instrument); }, [instrument]);

  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showGlow, setShowGlow] = useState(() => {
    return localStorage.getItem('fretmaster-glow') === 'true';
  });
  const playIdRef = useRef(0);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomThemeOpen, setIsCustomThemeOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState<number[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMaximizedStatus((maximized) => {
        setIsMaximized(maximized);
      });
    }
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    const recentClicks = logoClicks.filter(t => now - t < 2000);
    const newClicks = [...recentClicks, now];
    if (newClicks.length >= 5) {
      setIsCustomThemeOpen(true);
      setLogoClicks([]);
    } else {
      setLogoClicks(newClicks);
    }
  };

  const themes: { id: Theme; name: string }[] = [
    { id: 'zinc', name: 'Charcoal' },
    { id: 'slate', name: 'Slate' },
    { id: 'emerald', name: 'Emerald' },
    { id: 'rose', name: 'Rose' },
    { id: 'amber', name: 'Amber' },
    { id: 'blue', name: 'Cerulean' },
  ];

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fretmaster-progression');
      if (saved) {
        setProgression(JSON.parse(saved));
      }
      const savedBpm = localStorage.getItem('fretmaster-bpm');
      if (savedBpm) setBpmState(parseInt(savedBpm, 10));
      
      const savedSpeed = localStorage.getItem('fretmaster-speed');
      if (savedSpeed) setPlaybackSpeed(parseFloat(savedSpeed));
      
      const savedInstrument = localStorage.getItem('fretmaster-instrument');
      if (savedInstrument) {
        setInstrument(savedInstrument);
        setSynthInstrument(savedInstrument);
      }
      
      const savedVolume = localStorage.getItem('fretmaster-volume');
      if (savedVolume) {
        const v = parseInt(savedVolume, 10);
        setVolumeState(v);
        setVolume(v);
      } else {
        setVolume(80);
      }
      
      const savedAutoPlay = localStorage.getItem('fretmaster-autoplay');
      if (savedAutoPlay) setAutoPlayEnabled(savedAutoPlay === 'true');

      const savedNotes = localStorage.getItem('fretmaster-notes');
      if (savedNotes) setShowNoteNames(savedNotes === 'true');

      const savedGlow = localStorage.getItem('fretmaster-glow');
      if (savedGlow) setShowGlow(savedGlow === 'true');
    } catch (e) {
      console.error("Failed to load state", e);
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    localStorage.setItem('fretmaster-progression', JSON.stringify(progression));
  }, [progression]);

  useEffect(() => {
    localStorage.setItem('fretmaster-autoplay', autoPlayEnabled.toString());
  }, [autoPlayEnabled]);

  useEffect(() => {
    localStorage.setItem('fretmaster-notes', showNoteNames.toString());
  }, [showNoteNames]);

  useEffect(() => {
    localStorage.setItem('fretmaster-glow', showGlow.toString());
  }, [showGlow]);

  useEffect(() => {
    localStorage.setItem('fretmaster-bpm', bpm.toString());
    setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    localStorage.setItem('fretmaster-speed', playbackSpeed.toString());
  }, [playbackSpeed]);

  useEffect(() => {
    localStorage.setItem('fretmaster-instrument', instrument);
    setSynthInstrument(instrument);
  }, [instrument]);

  useEffect(() => {
    localStorage.setItem('fretmaster-volume', volume.toString());
    setVolume(volume);
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('fretmaster-active-tab', activeTab);
  }, [activeTab]);

  // Filter chord groups based on search query
  const filteredGroups = CHORD_GROUPS.filter(group => 
    `${group.root}${group.suffix} ${group.quality}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestedChords = getSuggestions(progression);
  const lastChord = progression.length > 0 ? progression[progression.length - 1] : undefined;

  const addToProgression = async (chord: Chord) => {
    // Explicitly start audio on user gesture for Electron/Chrome compatibility
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }
    
    setProgression([...progression, { ...chord, id: `${chord.id}-${Date.now()}` }]);
    if (autoPlayEnabled) {
      playChord(chord);
    }
  };

  const removeFromProgression = (index: number) => {
    const newProgression = [...progression];
    newProgression.splice(index, 1);
    setProgression(newProgression);
  };
  
  const updateProgressionChord = (index: number, newChord: Chord) => {
    const newProgression = [...progression];
    // Extract timestamp at the end of the id to keep key stable
    const match = progression[index].id.match(/-(\d+)$/);
    const timestamp = match ? match[1] : Date.now().toString();
    newProgression[index] = { ...newChord, id: `${newChord.id}-${timestamp}` };
    setProgression(newProgression);
  };

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const playProgression = async () => {
    if (progression.length === 0 || isPlayingProgression) return;
    
    setIsPlayingProgression(true);
    playIdRef.current++;
    const currentPlayId = playIdRef.current;
    
    // Resume audio context if suspended (needed on some browsers)
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }

    const beatDurationMs = (60 / bpm) * 1000;
    const chordDurationMs = (beatDurationMs * 4) / playbackSpeed;
    const chordDurationSec = chordDurationMs / 1000;
    
    const startTime = Tone.now() + 0.1;
    
    for (let i = 0; i < progression.length; i++) {
        // Schedule audio perfectly
        playChord(progression[i], startTime + i * chordDurationSec, playbackSpeed, chordDurationSec);
        
        // Schedule UI update
        Tone.Draw.schedule(() => {
            if (playIdRef.current === currentPlayId) {
                setPlayingIndex(i);
            }
        }, startTime + i * chordDurationSec);
    }

    // Schedule cleanup
    Tone.Draw.schedule(() => {
        if (playIdRef.current === currentPlayId) {
            setIsPlayingProgression(false);
            setPlayingIndex(null);
        }
    }, startTime + progression.length * chordDurationSec);
  };


  const stopProgression = () => {
    playIdRef.current++;
    stopSynth();
    setIsPlayingProgression(false);
    setPlayingIndex(null);
  };

  const clearProgression = () => {
    setProgression([]);
    stopProgression();
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} currentTheme={theme} />}
      <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between pl-0 pr-0 bg-background z-50 shrink-0 select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <div className="flex items-center h-full">
            <button 
              onClick={() => setActiveTab('fretmaster')}
              className={cn("px-6 h-full flex flex-col justify-center border-r border-border transition-colors text-left", 
                activeTab === 'fretmaster' ? "bg-primary/5 relative after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-primary" : "hover:bg-muted/30"
              )}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <h1 className={cn("text-2xl font-serif italic tracking-tighter leading-none transition-colors", activeTab === 'fretmaster' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>FretMaster.</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Pro Composition & Voicing Suite</p>
            </button>
            
            <button 
              onClick={() => setActiveTab('scalemaster')}
              className={cn("px-6 h-full flex flex-col justify-center border-r border-border transition-colors text-left relative overflow-hidden group", 
                activeTab === 'scalemaster' ? "bg-primary/5 relative after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-primary" : "hover:bg-muted/30"
              )}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <h1 className={cn("text-2xl font-serif italic tracking-tighter leading-none transition-colors", activeTab === 'scalemaster' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>ScaleMaster.</h1>
              <svg className="w-full h-3 mt-1 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                 <path d="M0,10 Q5,0 10,10 T20,10 T30,10 T40,5 T50,15 T60,5 T70,10 T80,10 T90,15 T100,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={activeTab === 'scalemaster' ? "text-primary" : "text-muted-foreground"} />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 relative" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors text-[10px] font-mono tracking-widest uppercase text-muted-foreground"
            >
              <Settings2 size={14} className="text-primary" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setIsThemeOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors text-[10px] font-mono tracking-widest uppercase text-muted-foreground"
            >
              <Palette size={14} className="text-primary" />
              <span>Theme</span>
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-2"></div>
          
          <div className="flex items-center h-16 -mr-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button 
              onClick={() => window.electronAPI?.minimize()}
              className="w-12 h-full flex flex-col items-center justify-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Minus size={16} className="stroke-[1.5]" />
            </button>
            <button 
              onClick={() => window.electronAPI?.maximize()}
              className="w-12 h-full flex flex-col items-center justify-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors group"
            >
              {isMaximized ? <Square size={11} className="stroke-[2]" /> : <Square size={13} className="stroke-[1.5]" />}
            </button>
            <button 
              onClick={() => window.electronAPI?.close()}
              className="w-12 h-full flex flex-col items-center justify-center hover:bg-[#e81123] text-muted-foreground hover:text-white transition-colors group"
            >
              <X size={16} className="stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'fretmaster' ? (
          <motion.main 
            key="fretmaster"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex-1 flex min-h-0 absolute inset-0 w-full h-full"
          >
            {/* Left pane: Chord Library */}
        <aside className="w-[340px] border-r border-border flex flex-col bg-background/90 shrink-0 relative z-20">
          <div className="p-6 border-b border-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Library</span>
              <span className="text-[10px] font-mono text-muted-foreground">{CHORD_GROUPS.length} GROUPS</span>
            </div>
            
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                placeholder="Search chords (e.g. Cmaj7)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-0 py-0 custom-scrollbar">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-[10px] font-mono text-muted-foreground text-center mt-4">
                No chords found matching "{searchQuery}"
              </div>
            ) : (
              <div className="flex flex-col pb-10">
                {filteredGroups.map(group => (
                  <InteractiveChord 
                    key={group.id} 
                    group={group} 
                    viewMode="library"
                    onAdd={addToProgression} 
                    lastChord={lastChord}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right pane: Progression Builder */}
        <section className="flex-1 flex flex-col bg-background relative overflow-hidden z-10">
          <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-background/90 backdrop-blur-sm z-10 shrink-0">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Music size={14} /> Progression Track
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30 transition-colors text-xs font-bold uppercase flex items-center gap-2"
              >
                <Save size={14} /> Save / Load
              </button>
              <button
                onClick={clearProgression}
                disabled={progression.length === 0}
                className="px-4 py-1.5 border border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 disabled:opacity-50 transition-colors text-xs font-bold uppercase flex items-center gap-2"
              >
                <Trash2 size={14} /> Clear
              </button>
              {isPlayingProgression ? (
                <button
                  onClick={stopProgression}
                  className="px-6 py-1.5 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 disabled:opacity-50 transition-colors text-xs font-bold uppercase flex items-center gap-2 tracking-widest shadow-lg shadow-primary/10"
                >
                  <div className="w-2 h-2 rounded-sm bg-primary animate-pulse"></div> Stop
                </button>
              ) : (
                <button
                  onClick={playProgression}
                  disabled={progression.length === 0}
                  className="px-6 py-1.5 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors text-xs font-bold uppercase flex items-center gap-2 tracking-widest shadow-lg shadow-primary/20"
                >
                  <PlayIcon size={14} fill="currentColor" /> Play
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-card border-x border-border/50 shadow-2xl">
            {progression.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-70">
                <div className="w-48 h-32 border border-dashed border-border flex items-center justify-center bg-muted/20">
                  <span className="text-2xl text-border font-mono">+</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-mono">Empty Track. Add chords from the library.</p>
                <div className="flex gap-4 mt-4">
                  {CHORD_GROUPS.filter(g => ['C', 'G', 'D', 'A', 'E'].includes(g.root) && g.suffix === '').map(group => (
                    <button
                      key={`start-${group.id}`}
                      onClick={() => addToProgression(group.voicings[0])}
                      className="px-4 py-2 border border-border bg-muted/30 hover:border-primary hover:text-primary transition-colors text-xs font-bold uppercase"
                    >
                      Start with {group.root} {group.quality}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                <div className="flex flex-wrap gap-4 items-start">
                  {progression.map((chord, index) => {
                     const group = CHORD_GROUPS.find(g => g.root === chord.root && g.suffix === chord.suffix);
                     const previousChord = index > 0 ? progression[index - 1] : undefined;
                     const match = chord.id.match(/-(\d+)$/);
                     const timestamp = match ? match[1] : chord.id;
                     return (
                      <InteractiveChord 
                        key={timestamp} 
                        chord={chord}
                        group={group}
                        viewMode="progression"
                        indexLabel={index + 1}
                        lastChord={previousChord}
                        isCurrentlyPlaying={playingIndex === index}
                        onRemove={() => removeFromProgression(index)}
                        onUpdateChord={(newChord) => updateProgressionChord(index, newChord)}
                      />
                     );
                  })}
                  
                  <div className="pt-0 shrink-0">
                    <button 
                      className="w-[180px] h-[206px] shrink-0 border border-dashed border-border hover:border-primary flex items-center justify-center group transition-colors bg-muted/10 hover:bg-muted/30"
                      onClick={() => {
                        const el = document.querySelector('input[type="text"]') as HTMLInputElement;
                        el?.focus();
                      }}
                    >
                      <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors font-mono">+</span>
                    </button>
                  </div>
                </div>

                {/* Suggestions Box */}
                <div className="bg-muted/30 border border-border p-6 mt-8 w-full">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-2 mb-4">
                     <Sparkles size={12} /> Suggested Next Chords (Voice Leading Applied)
                   </h4>
                   <div className="flex flex-wrap gap-4">
                     {suggestedChords.map((sc, i) => {
                        const group = CHORD_GROUPS.find(g => g.root === sc.root && g.suffix === sc.suffix) || { id: '', root: sc.root, suffix: sc.suffix, quality: sc.quality, voicings: [sc] };
                        return (
                          <InteractiveChord 
                            key={'sugg-' + sc.id + i} 
                            chord={sc}
                            group={group}
                            lastChord={lastChord}
                            viewMode="compact"
                            onAdd={() => addToProgression(sc)}
                          />
                        );
                     })}
                   </div>
                </div>
              </div>
            )}
          </div>

          <footer className="h-12 border-t border-border px-8 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-mono shrink-0 bg-background/90 backdrop-blur-sm z-10">
            <div className="flex space-x-6 items-center">
               <div className="flex items-center gap-2">
                 <span>BPM:</span>
                 <AnimatedScrollInput
                   value={bpm}
                   onChange={(val) => {
                     const numVal = val.replace(/\D/g, '');
                     setBpmState(numVal ? parseInt(numVal) : 120);
                   }}
                   onIncrement={() => {
                     const currentBpm = typeof bpm === 'number' ? bpm : 120;
                     setBpmState(Math.min(300, currentBpm + 1));
                   }}
                   onDecrement={() => {
                     const currentBpm = typeof bpm === 'number' ? bpm : 120;
                     setBpmState(Math.max(30, currentBpm - 1));
                   }}
                   className="w-10 h-6 border-b border-border/50 text-[12px] hover:border-primary/50 text-foreground transition-colors"
                 />
               </div>
               <div className="flex items-center gap-2 w-24">
                 <Volume2 size={14} className="opacity-70" />
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={volume} 
                   onChange={(e) => setVolumeState(Number(e.target.value))} 
                 />
               </div>
               <span className="hidden sm:inline">CHORDS: {progression.length}</span>
               <div className="flex items-center gap-2">
                 <span>SYNTH:</span>
                 <CustomSelect 
                    options={INSTRUMENT_OPTIONS} 
                    value={instrument} 
                    onChange={setInstrument} 
                    className="w-56"
                    buttonClassName="px-2 py-1 text-[10px] h-6 border-b"
                    menuClassName="bottom-full mb-1 text-[10px]"
                    itemClassName="text-[10px] py-1.5 px-2"
                 />
               </div>
            </div>
            <div 
              className="flex space-x-2 items-center cursor-pointer select-none"
              onClick={handleLogoClick}
            >
               <span className="text-primary animate-[pulse_2s_ease-in-out_infinite]">●</span>
               <span className="font-serif italic font-bold tracking-tighter text-primary text-xl leading-none">FM.</span>
            </div>
          </footer>
        </section>
      </motion.main>
      ) : (
      <motion.div 
        key="scalemaster"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex-1 flex min-h-0 absolute inset-0 w-full h-full"
      >
        <ScaleMaster currentTheme={theme} onLogoClick={handleLogoClick} />
      </motion.div>
      )}
      </AnimatePresence>
      </div>

      {/* Save / Export Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentProgression={progression}
        onLoadProgression={(p) => setProgression(p)}
      />

      {/* Theme Selection Modal */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        playbackSpeed={playbackSpeed}
        onPlaybackSpeedChange={setPlaybackSpeed}
        autoPlayEnabled={autoPlayEnabled}
        onAutoPlayChange={setAutoPlayEnabled}
        showNoteNames={showNoteNames}
        onShowNoteNamesChange={setShowNoteNames}
        showGlow={showGlow}
        onShowGlowChange={setShowGlow}
      />

      <CustomThemeModal
        isOpen={isCustomThemeOpen}
        onClose={() => setIsCustomThemeOpen(false)}
      />
    </div>
    </>
  );
}

// Adding custom scrollbar styling in index.css is better but we can use Tailwind classes or global CSS
