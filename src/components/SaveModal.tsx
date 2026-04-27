import React, { useState, useEffect } from 'react';
import { X, Save, Download, Copy, Trash2, Check, ExternalLink, FileText, Image as ImageIcon, Type, Music, FolderPlus, Folder, FolderOpen, MoreVertical, LayoutGrid, Github, Printer } from 'lucide-react';
import { Chord } from '../lib/chords';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportProgressionToMidi } from '../lib/midiExport';
import { THEMES } from '../lib/themes';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ChordDiagram } from './ChordDiagram';
import { useTheme } from './ThemeProvider';
import { useEasterEgg } from './EasterEgg';

interface SavedProgression {
  id: string;
  name: string;
  chords: Chord[];
  date: number;
  collectionId?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgression: Chord[];
  onLoadProgression: (p: Chord[], name?: string) => void;
  trackName: string;
  onTrackNameChange: (name: string) => void;
  bpm: number;
}

export function SaveModal({ isOpen, onClose, currentProgression, onLoadProgression, trackName, onTrackNameChange, bpm }: SaveModalProps) {
  const { registerClick } = useEasterEgg();
  const { theme } = useTheme();
  const [saved, setSaved] = useState<SavedProgression[]>([]);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExportPromptOpen, setIsExportPromptOpen] = useState(false);
  const [exportName, setExportName] = useState('');
  const [duplicatePromptOpen, setDuplicatePromptOpen] = useState(false);
  const [pendingSaveName, setPendingSaveName] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'export'>('save');
  const [exportDetail, setExportDetail] = useState<'low' | 'medium' | 'high'>(() => {
    const s = localStorage.getItem('fm_export_settings');
    if (s) { try { return JSON.parse(s).detail || 'medium'; } catch (e) {} }
    return 'medium';
  });
  const [exportResolution, setExportResolution] = useState<'small' | 'medium' | 'large' | 'xl'>(() => {
    const s = localStorage.getItem('fm_export_settings');
    if (s) { try { return JSON.parse(s).resolution || 'medium'; } catch (e) {} }
    return 'medium';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [exportZoom, setExportZoom] = useState(() => {
    const s = localStorage.getItem('fm_export_settings');
    if (s) { try { return JSON.parse(s).zoom || 1; } catch (e) {} }
    return 1;
  });
  const [exportAspectRatio, setExportAspectRatio] = useState<'auto' | '1:1' | '16:9' | '9:16' | 'a4' | 'letter'>(() => {
    const s = localStorage.getItem('fm_export_settings');
    if (s) { try { return JSON.parse(s).aspectRatio || 'auto'; } catch (e) {} }
    return 'auto';
  });
  const [isPrintMode, setIsPrintMode] = useState(() => {
    const s = localStorage.getItem('fm_export_settings');
    if (s) { try { return JSON.parse(s).isPrintMode ?? false; } catch (e) {} }
    return false;
  });
  const [movingTrackId, setMovingTrackId] = useState<string | null>(null);

  const resMultipliers = {
    small: 1,
    medium: 1.5,
    large: 2,
    xl: 3
  };
  const BASE_WIDTH = 1200;

  useEffect(() => {
    if (isOpen) {
      const s = localStorage.getItem('fm_progressions');
      if (s) {
        try { setSaved(JSON.parse(s)); } catch (e) {}
      }
      const c = localStorage.getItem('fm_collections');
      if (c) {
        try { setCollections(JSON.parse(c)); } catch (e) {}
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const settings = {
      detail: exportDetail,
      resolution: exportResolution,
      zoom: exportZoom,
      aspectRatio: exportAspectRatio,
      isPrintMode
    };
    localStorage.setItem('fm_export_settings', JSON.stringify(settings));
  }, [exportDetail, exportResolution, exportZoom, exportAspectRatio, isPrintMode]);

  useEffect(() => {
    if (isOpen) {
      setName(trackName);
    }
  }, [isOpen, trackName]);

  const saveCollections = (newCols: Collection[]) => {
    setCollections(newCols);
    localStorage.setItem('fm_collections', JSON.stringify(newCols));
  };

  const saveToWebStorage = () => {
    if (!name.trim() || currentProgression.length === 0) return;
    const saveName = name.trim();
    if (saved.some(s => s.name === saveName)) {
      setPendingSaveName(saveName);
      setDuplicatePromptOpen(true);
      return;
    }
    performSave(saveName);
  };

  const performSave = (saveName: string, idToReplace?: string) => {
    const newProg = { 
      id: idToReplace || Date.now().toString(), 
      name: saveName, 
      chords: currentProgression, 
      date: Date.now(),
      collectionId: activeCollectionId === 'all' || activeCollectionId === 'uncategorized' ? undefined : activeCollectionId
    };
    let nextSaved;
    if (idToReplace) {
       nextSaved = saved.map(s => s.id === idToReplace ? newProg : s);
    } else {
       nextSaved = [newProg, ...saved];
    }
    setSaved(nextSaved);
    localStorage.setItem('fm_progressions', JSON.stringify(nextSaved));
    setName('');
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCol = { id: Date.now().toString(), name: newCollectionName.trim() };
    saveCollections([...collections, newCol]);
    setNewCollectionName('');
    setIsCreatingCollection(false);
  };

  const deleteCollection = (id: string) => {
    saveCollections(collections.filter(c => c.id !== id));
    setSaved(saved.map(s => s.collectionId === id ? { ...s, collectionId: undefined } : s));
    if (activeCollectionId === id) setActiveCollectionId('all');
  };

  const moveTrackToCollection = (trackId: string, colId: string | undefined) => {
    const nextSaved = saved.map(s => s.id === trackId ? { ...s, collectionId: colId } : s);
    setSaved(nextSaved);
    localStorage.setItem('fm_progressions', JSON.stringify(nextSaved));
    setMovingTrackId(null);
  };

  const cancelSave = () => setDuplicatePromptOpen(false);
  const replaceSave = () => {
      const existing = saved.find(s => s.name === pendingSaveName);
      if (existing) performSave(pendingSaveName, existing.id);
      setDuplicatePromptOpen(false);
  };
  const makeCopySave = () => {
      performSave(`${pendingSaveName} (Copy)`);
      setDuplicatePromptOpen(false);
  };

  const deleteSaved = (id: string) => {
    const nextSaved = saved.filter(s => s.id !== id);
    setSaved(nextSaved);
    localStorage.setItem('fm_progressions', JSON.stringify(nextSaved));
  };

  const handleExportClick = () => {
    setExportName(name || '');
    setIsExportPromptOpen(true);
  };

  const confirmExport = () => {
    downloadFile(exportName || 'My_Track', currentProgression);
    setIsExportPromptOpen(false);
  };

  const downloadFile = (progName: string, chords: Chord[]) => {
    const data = JSON.stringify(chords, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    
    const safeName = progName.replace(/[^a-zA-Z0-9]/g, '_') || 'Progression';
    a.download = `${safeName}.${hh}${min}${dd}.${mm}.${yy}.fmprog`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = currentProgression.map(c => `${c.root}${c.suffix}`).join(' - ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    onTrackNameChange(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string) as Chord[];
        if (Array.isArray(json) && json.length > 0 && json[0].root) {
             onLoadProgression(json);
             onClose();
        } else {
            alert('Invalid progression file');
        }
      } catch (err) {
        alert('Could not parse file');
      }
    };
    reader.readAsText(file);
  };

  const handleProExport = async (format: 'pdf' | 'png' | 'txt') => {
    setIsGenerating(true);
    const fileName = (name || 'FretMaster_Progression').replace(/[^a-zA-Z0-9]/g, '_');
    
    if (format === 'txt') {
      const separator = "==========================================";
      let content = `\n${separator}\n`;
      content += ` F R E T M A S T E R .\n`;
      content += `${separator}\n\n`;
      
      content += `DOCUMENT: ${name || 'Untitled Progression'}\n`;
      content += `DATE:     ${new Date().toLocaleDateString()}\n`;
      content += `CHORDS:   ${currentProgression.length} Tracks\n\n`;
      content += `${separator}\n\n`;
      
      if (exportDetail === 'low') {
        content += "PROGRESSION:\n";
        content += currentProgression.map(c => `${c.root}${c.suffix}`).join('  —  ');
      } else {
        content += currentProgression.map((c, i) => {
          let chordLine = `[${(i + 1).toString().padStart(2, '0')}] ${c.root}${c.suffix}\n`;
          chordLine += `     Quality: ${c.quality}\n`;
          if (exportDetail === 'medium' || exportDetail === 'high') {
             chordLine += `     Frets:   ${c.frets.map(f => f === -1 ? 'X' : f).join(' ')}\n`;
          }
          if (exportDetail === 'high') {
             chordLine += `     Notes:   ${c.notes.join(' ')}\n`;
          }
          return chordLine;
        }).join('\n');
      }
      
      content += `\n\n${separator}\n`;
      content += `Export via danielgjypi/FretMaster\n`;
      content += `${separator}\n`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      a.click();
      setIsGenerating(false);
      return;
    }

    const element = document.getElementById('export-target-inner');
    if (!element) return;

    try {
      // Use html-to-image to get a high-quality data URL
      const exportThemeId = isPrintMode ? 'zinc-light' : (theme?.id || 'default');
      const bgColor = isPrintMode ? '#ffffff' : (getComputedStyle(document.body).getPropertyValue('--background') || '#000000');

      const dataUrl = await htmlToImage.toPng(element, {
        pixelRatio: resMultipliers[exportResolution],
        backgroundColor: bgColor,
      });

      if (format === 'png') {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${fileName}.png`;
        a.click();
      } else if (format === 'pdf') {
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        const pdf = new jsPDF({
          orientation: width > height ? 'l' : 'p',
          unit: 'px',
          format: [width, height]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. This usually happens due to complex theme colors.');
    } finally {
      setIsGenerating(false);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-card border border-border max-w-6xl w-full h-[650px] shadow-2xl flex flex-col md:flex-row overflow-hidden"
          >
        
        <div className="w-full md:w-[45%] flex flex-col border-r border-border shrink-0">
            <div className="flex border-b border-border h-14 shrink-0">
               <button 
                onClick={() => setActiveTab('save')}
                className={cn("flex-1 px-6 text-xs font-bold uppercase tracking-widest transition-colors", 
                  activeTab === 'save' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
                )}
               >
                 Track Manager
               </button>
               <button 
                onClick={() => setActiveTab('export')}
                className={cn("flex-1 px-6 text-xs font-bold uppercase tracking-widest transition-colors", 
                  activeTab === 'export' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
                )}
               >
                 Song Sheet
               </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                {activeTab === 'save' ? (
                    <>
                    <div className="h-9 flex flex-col justify-center border-b border-border -mx-6 px-6 mb-3 shrink-0">
                        <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">Current Track</h2>
                    </div>
                        
                        {currentProgression.length > 0 ? (
                            <>
                                <div className="bg-muted/50 p-4 border border-border font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap custom-scrollbar">
                                    {currentProgression.map(c => `${c.root}${c.suffix}`).join(' - ')}
                                </div>
                                
                                <div className="flex gap-2">
                                    <input 
                                            type="text" 
                                            value={name}
                                            onChange={e => handleNameChange(e.target.value)}
                                            placeholder="Progression Name..."
                                            className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors min-w-0"
                                        />
                                        <button 
                                            onClick={saveToWebStorage}
                                            disabled={!name.trim()}
                                            className="px-6 py-2 bg-primary text-primary-foreground font-bold text-xs uppercase hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                    </div>

                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Export Options</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleExportClick}
                                            className="px-4 py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2"
                                        >
                                            <Download size={14} className="text-primary" /> As .fmprog
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-4 py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-primary" />} 
                                            {copied ? 'Copied' : 'Copy Text'}
                                        </button>
                                        <button
                                            onClick={() => exportProgressionToMidi(name, currentProgression, bpm)}
                                            className="col-span-2 px-4 py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2 group"
                                        >
                                            <Music size={14} className="text-primary" /> Export as MIDI
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                                Your track is empty.
                            </div>
                        )}
                        
                        <div className="mt-auto pt-6 mt-10 border-t border-border">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-2">Import File</label>
                            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 border border-dashed border-border hover:border-primary text-xs font-bold uppercase transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                                <ExternalLink size={14} /> Load .fmprog File
                                <input type="file" accept=".fmprog" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 flex flex-col h-full pb-12 -mt-6">
                        <div className="py-6 border-b border-border -mx-6 px-6 mb-6 shrink-0 bg-muted/10">
                            <h2 className="text-xl font-serif italic text-foreground leading-none">Sheet Designer</h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-2">Customize document export</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Document Title</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Untitled Progression"
                                className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Level of Detail</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'low', label: 'Minimal', desc: 'Chords' },
                                    { id: 'medium', label: 'Standard', desc: '+ Diagrams' },
                                    { id: 'high', label: 'Full Pro', desc: '+ Tabs' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setExportDetail(opt.id as any)}
                                        className={cn(
                                            "p-2 border transition-all text-left",
                                            exportDetail === opt.id 
                                                ? "bg-primary/10 border-primary text-primary" 
                                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        <div className="text-[10px] font-bold uppercase mb-0.5">{opt.label}</div>
                                        <div className="text-[9px] opacity-70 leading-none">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Resolution (Export Width)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'small', label: 'SM', val: '800px' },
                                    { id: 'medium', label: 'MD', val: '1200px' },
                                    { id: 'large', label: 'LG', val: '1800px' },
                                    { id: 'xl', label: 'XL', val: '2400px' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setExportResolution(opt.id as any)}
                                        className={cn(
                                            "p-2 border transition-all text-center",
                                            exportResolution === opt.id 
                                                ? "bg-primary/10 border-primary text-primary" 
                                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        <div className="text-[10px] font-bold uppercase mb-0.5">{opt.label}</div>
                                        <div className="text-[9px] opacity-70 leading-none">{opt.id === 'small' ? '1x' : opt.id === 'medium' ? '1.5x' : opt.id === 'large' ? '2x' : '3x'}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'auto', label: 'Auto' },
                                    { id: '1:1', label: 'Square' },
                                    { id: '16:9', label: '16:9' },
                                    { id: '9:16', label: '9:16' },
                                    { id: 'a4', label: 'A4' },
                                    { id: 'letter', label: 'Letter' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setExportAspectRatio(opt.id as any)}
                                        className={cn(
                                            "p-2 border transition-all text-center",
                                            exportAspectRatio === opt.id 
                                                ? "bg-primary/10 border-primary text-primary" 
                                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        <div className="text-[10px] font-bold uppercase">{opt.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Zoom (Element Size)</label>
                            <div className="flex gap-1">
                                {[
                                    { id: 0.75, label: 'Small' },
                                    { id: 1, label: 'Normal' },
                                    { id: 1.25, label: 'Large' },
                                    { id: 1.5, label: 'Huge' }
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => setExportZoom(opt.id)}
                                        className={cn(
                                            "flex-1 py-2 border transition-all text-center text-[10px] font-bold uppercase",
                                            exportZoom === opt.id 
                                                ? "bg-primary text-primary-foreground border-primary" 
                                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                             <button
                                onClick={() => setIsPrintMode(!isPrintMode)}
                                className={cn(
                                    "w-full p-4 border flex items-center justify-between transition-all group",
                                    isPrintMode 
                                        ? "bg-primary/10 border-primary text-primary" 
                                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                )}
                             >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-6 rounded-full relative transition-colors p-1",
                                        isPrintMode ? "bg-primary" : "bg-muted"
                                    )}>
                                        <div className={cn(
                                            "w-4 h-4 rounded-full bg-white transition-transform",
                                            isPrintMode ? "translate-x-4" : "translate-x-0"
                                        )} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-bold uppercase">Print Mode</div>
                                        <div className="text-[9px] opacity-70">Force Paper White theme</div>
                                    </div>
                                </div>
                                <Printer size={16} className={cn(isPrintMode ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                             </button>
                        </div>


                        <div className="space-y-3 mt-6 pt-2 pb-12">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary block">Export Format</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => handleProExport('pdf')}
                                    disabled={isGenerating || currentProgression.length === 0}
                                    className="w-full py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <FileText size={14} className="text-primary" />
                                    {isGenerating ? 'Generating...' : 'Export as PDF Document'}
                                </button>
                                <button
                                    onClick={() => handleProExport('png')}
                                    disabled={isGenerating || currentProgression.length === 0}
                                    className="w-full py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <ImageIcon size={14} className="text-primary" />
                                    {isGenerating ? 'Generating...' : 'Export as High-Res Image'}
                                </button>
                                <button
                                    onClick={() => handleProExport('txt')}
                                    disabled={isGenerating || currentProgression.length === 0}
                                    className="w-full py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <Type size={14} className="text-primary" />
                                    {isGenerating ? 'Generating...' : 'Export as Text Sheet'}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>

            {/* Right pane: Saved list OR Preview */}
        <div className="flex-1 flex flex-col bg-muted/20 relative overflow-x-hidden">
            {activeTab === 'save' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Collections Sidebar */}
                    <div className="w-56 border-r border-border bg-background/50 flex flex-col shrink-0">
                        <div className="h-14 p-4 border-b border-border flex items-center">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Collections</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-10 flex flex-col gap-1">
                            {[
                                { id: 'all', name: 'All Tracks', icon: LayoutGrid },
                                { id: 'uncategorized', name: 'Unsorted', icon: Folder }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCollectionId(cat.id)}
                                    className={cn(
                                        "w-full px-3 py-2 text-[10px] uppercase font-bold text-left flex items-center gap-2 transition-colors",
                                        activeCollectionId === cat.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <cat.icon size={12} />
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                            <div className="h-px bg-border my-2" />
                            {collections.map(col => (
                                <div key={col.id} className="group flex items-center">
                                    <button
                                        onClick={() => setActiveCollectionId(col.id)}
                                        className={cn(
                                            "flex-1 px-3 py-2 text-[10px] uppercase font-bold text-left flex items-center gap-2 transition-colors truncate",
                                            activeCollectionId === col.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        {activeCollectionId === col.id ? <FolderOpen size={12} /> : <Folder size={12} />}
                                        <span className="truncate">{col.name}</span>
                                    </button>
                                    <button 
                                        onClick={() => deleteCollection(col.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t border-border">
                            {isCreatingCollection ? (
                                <div className="flex flex-col gap-2">
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={newCollectionName}
                                        onChange={e => setNewCollectionName(e.target.value)}
                                        placeholder="Name..."
                                        className="w-full bg-background border border-border px-2 py-1 text-[10px] focus:outline-none"
                                        onKeyDown={e => { if (e.key === 'Enter') createCollection(); if (e.key === 'Escape') setIsCreatingCollection(false); }}
                                    />
                                    <div className="flex gap-1">
                                        <button onClick={createCollection} className="flex-1 bg-primary text-primary-foreground text-[8px] font-bold py-1">ADD</button>
                                        <button onClick={() => setIsCreatingCollection(false)} className="flex-1 bg-muted text-foreground text-[8px] font-bold py-1">X</button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsCreatingCollection(true)}
                                    className="w-full py-2 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors text-[9px] font-bold uppercase flex items-center justify-center gap-2"
                                >
                                    <FolderPlus size={12} /> New
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center justify-between px-6 h-14 border-b border-border bg-background shrink-0">
                          <h2 className="text-lg font-serif italic text-foreground truncate">
                              {activeCollectionId === 'all' ? 'All Tracks' : 
                               activeCollectionId === 'uncategorized' ? 'Unsorted' : 
                               collections.find(c => c.id === activeCollectionId)?.name}
                          </h2>
                          <button onClick={onClose} className="hidden md:block text-muted-foreground hover:text-foreground">
                             <X size={16} />
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
                           {saved.filter(s => {
                               if (activeCollectionId === 'all') return true;
                               if (activeCollectionId === 'uncategorized') return !s.collectionId;
                               return s.collectionId === activeCollectionId;
                           }).length === 0 ? (
                               <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mt-10">No tracks here.</p>
                           ) : (
                               saved.filter(s => {
                                   if (activeCollectionId === 'all') return true;
                                   if (activeCollectionId === 'uncategorized') return !s.collectionId;
                                   return s.collectionId === activeCollectionId;
                               }).map((item) => (
                                   <div key={item.id} className="bg-background border border-border p-4 hover:border-primary/50 transition-colors group flex flex-col gap-3 relative">
                                       <div className="flex items-start justify-between">
                                           <div>
                                               <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                                               <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                                   {new Date(item.date).toLocaleDateString()} • {item.chords.length} chords
                                               </p>
                                           </div>
                                           <div className="flex items-center gap-1">
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setMovingTrackId(movingTrackId === item.id ? null : item.id)}
                                                        className="text-muted-foreground hover:text-primary p-1 transition-colors"
                                                        title="Move to Collection"
                                                    >
                                                        <Folder size={14} />
                                                    </button>
                                                    {movingTrackId === item.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-card border border-border shadow-xl z-50 py-1 min-w-[120px] animate-in slide-in-from-top-1">
                                                            <button 
                                                                onClick={() => moveTrackToCollection(item.id, undefined)}
                                                                className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-muted uppercase font-bold"
                                                            >
                                                                Unsorted
                                                            </button>
                                                            {collections.map(c => (
                                                                <button 
                                                                    key={c.id}
                                                                    onClick={() => moveTrackToCollection(item.id, c.id)}
                                                                    className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-muted uppercase font-bold flex items-center gap-2"
                                                                >
                                                                    <Folder size={10} /> {c.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => deleteSaved(item.id)}
                                                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                           </div>
                                       </div>
                                       <div className="text-xs font-serif italic text-muted-foreground truncate">
                                           {item.chords.map(c => `${c.root}${c.suffix}`).join(' - ')}
                                       </div>
                                       <div className="flex gap-2 mt-2 pt-3 border-t border-border">
                                           <button 
                                               onClick={() => { onLoadProgression(item.chords, item.name); onClose(); }}
                                               className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] uppercase font-bold py-2 transition-colors"
                                           >
                                               Load Track
                                           </button>
                                           <button 
                                               onClick={() => downloadFile(item.name, item.chords)}
                                               className="bg-background border border-border hover:border-primary text-muted-foreground hover:text-foreground px-3 flex items-center justify-center transition-colors"
                                               title="Download"
                                           >
                                               <Download size={14} />
                                           </button>
                                       </div>
                                   </div>
                               ))
                           )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 h-14 border-b border-border bg-background shrink-0">
                      <h2 className="text-lg font-serif italic text-foreground">Live Export Preview</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase bg-muted px-2 py-0.5">{exportResolution}</span>
                        <button onClick={onClose} className="hidden md:block text-muted-foreground hover:text-foreground">
                            <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`flex-1 flex flex-col overflow-hidden theme-${isPrintMode ? 'zinc-light' : (theme || 'zinc')} bg-background/5 border-l border-white/5`}>
                        {/* Centered Scrollable Area */}
                        <div className="flex-1 overflow-auto custom-scrollbar p-10 flex flex-col items-center">
                            <div 
                                className="relative shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 shrink-0 my-auto"
                                style={{ 
                                    zoom: (340 / BASE_WIDTH).toFixed(3),
                                    width: `${BASE_WIDTH}px`,
                                    backgroundColor: isPrintMode ? '#ffffff' : 'var(--background)',
                                    color: isPrintMode ? '#09090b' : 'var(--foreground)'
                                }}
                            >
                                <PreviewContent 
                                    name={name} 
                                    chords={currentProgression} 
                                    detail={exportDetail} 
                                    theme={isPrintMode ? 'zinc-light' : (theme || 'zinc')} 
                                    width={BASE_WIDTH}
                                    zoom={exportZoom}
                                    aspectRatio={exportAspectRatio}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </motion.div>
    </motion.div>
      )}

      {isExportPromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm shadow-xl p-6 relative">
            <button onClick={() => setIsExportPromptOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Export File</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={exportName}
                onChange={e => setExportName(e.target.value)}
                placeholder="Name your file (e.g. My_Track)"
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') confirmExport() }}
              />
              <button 
                onClick={confirmExport}
                className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download .fmprog
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicatePromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm shadow-xl p-6 relative">
            <button onClick={cancelSave} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">File Already Exists</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
               A progression named <span className="font-bold text-foreground">\"{pendingSaveName}\"</span> already exists. How would you like to proceed?
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={replaceSave}
                className="w-full py-2 bg-destructive text-destructive-foreground font-bold text-xs uppercase hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Replace Existing
              </button>
              <button 
                onClick={makeCopySave}
                className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs uppercase hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Make a Copy
              </button>
              <button 
                onClick={cancelSave}
                className="w-full py-2 bg-background border border-border text-foreground font-bold text-xs uppercase hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportTemplate 
        name={name} 
        chords={currentProgression} 
        detail={exportDetail} 
        theme={isPrintMode ? 'zinc-light' : (theme || 'zinc')} 
        width={BASE_WIDTH}
        zoom={exportZoom}
        aspectRatio={exportAspectRatio}
      />
    </AnimatePresence>
  );
}

function PreviewContent({ 
    name, chords, detail, theme, width = 1200, zoom = 1, aspectRatio = 'auto' 
}: { 
    name: string, chords: Chord[], detail: 'low' | 'medium' | 'high', theme: string, width?: number, zoom?: number, aspectRatio?: 'auto' | '1:1' | '16:9' | '9:16' | 'a4' | 'letter' 
}) {
    const { registerClick } = useEasterEgg();
    const getRatioHeight = () => {
        switch(aspectRatio) {
            case '1:1': return width;
            case '16:9': return width * (9/16);
            case '9:16': return width * (16/9);
            case 'a4': return width * 1.414;
            case 'letter': return width * 1.294;
            default: return undefined;
        }
    };

    const targetHeight = getRatioHeight();

  const themeData = THEMES.find(t => t.id === theme);
  const colors = themeData?.colors;
  const containerId = `preview-container-${theme}`;

  return (
    <div 
        id={containerId}
        className={cn(
            "p-16 font-sans shadow-2xl overflow-hidden flex flex-col transition-colors", 
            `theme-${theme}`
        )}
        style={{ 
            width: `${width}px`,
            height: targetHeight ? `${targetHeight}px` : undefined,
            minHeight: targetHeight ? `${targetHeight}px` : undefined,
            maxHeight: targetHeight ? `${targetHeight}px` : undefined,
            backgroundColor: colors?.bg || 'var(--background)',
            color: colors?.fg || 'var(--foreground)',
        }}
    >
        <style>{`
            #${containerId} {
                --background: ${colors?.bg} !important;
                --foreground: ${colors?.fg} !important;
                --primary: ${colors?.primary} !important;
                --primary-foreground: ${colors?.primaryFg} !important;
                --muted: ${colors?.muted} !important;
                --muted-foreground: ${colors?.mutedFg} !important;
                --border: ${colors?.border} !important;
                --card: ${colors?.card} !important;

                /* Force Tailwind v4 specific color variables */
                --color-background: ${colors?.bg} !important;
                --color-foreground: ${colors?.fg} !important;
                --color-primary: ${colors?.primary} !important;
                --color-primary-foreground: ${colors?.primaryFg} !important;
                --color-muted: ${colors?.muted} !important;
                --color-muted-foreground: ${colors?.mutedFg} !important;
                --color-border: ${colors?.border} !important;
                --color-card: ${colors?.card} !important;
            }
        `}</style>
            <div style={{ zoom: zoom, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="border-b-4 border-primary pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-serif italic tracking-tighter text-primary">FretMaster.</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-serif italic text-foreground mb-1">{name || 'Untitled Progression'}</h2>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        {new Date().toLocaleDateString()} • {chords.length} Chords
                    </p>
                </div>
            </div>

            <div className={cn(
                "grid gap-12 mt-8 mb-8",
                detail === 'low' ? "grid-cols-1" : "grid-cols-3"
            )}>
                {detail === 'low' ? (
                    <div className="text-4xl font-serif italic border p-12 bg-muted/20 text-center">
                        {chords.map((c, i) => <span key={`low-${i}`}>{c.root}{c.suffix}{i < chords.length - 1 ? '  —  ' : ''}</span>)}
                    </div>
                ) : (
                    chords.map((chord, i) => (
                        <div key={`exp-${chord.id}-${i}`} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <h3 className="text-2xl font-serif italic text-foreground">{chord.root}{chord.suffix}</h3>
                            </div>
                            
                            <div className="bg-muted/10 border border-border/50">
                                <ChordDiagram chord={chord} className="scale-110 !bg-transparent !border-none p-6" />
                            </div>

                            {detail === 'high' && (
                                <div className="space-y-2 mt-2 px-1">
                                    <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Quality</span>
                                        <span className="text-[10px] font-bold text-foreground uppercase">{chord.quality}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</span>
                                        <span className="text-[10px] font-mono text-primary">{chord.notes.join(' ')}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-border/50 pb-1">
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Frets</span>
                                        <span className="text-[10px] font-mono text-foreground">{chord.frets.map(f => f === -1 ? 'X' : f).join(' ')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-auto pt-8 mt-16 border-t border-border flex justify-between items-center opacity-50">
                <p className="text-[10px] uppercase tracking-[0.2em] font-mono flex items-center gap-1.5">
                    <Github size={10} className="text-primary" /> danielgjypi/FretMaster
                </p>
                <span 
                    className="text-[10px] font-mono font-bold text-foreground cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={registerClick}
                >
                    v1.1.1
                </span>
            </div>
            </div>
        </div>
    );
}

function ExportTemplate({ 
    name, chords, detail, theme, width, zoom, aspectRatio 
}: { 
    name: string, chords: Chord[], detail: 'low' | 'medium' | 'high', theme: string, width: number, zoom: number, aspectRatio: 'auto' | '1:1' | '16:9' | '9:16' | 'a4' | 'letter' 
}) {
    return (
        <div 
            id="export-target" 
            style={{ 
                position: 'fixed',
                left: '-9999px',
                top: 0,
                zIndex: -1
            }}
        >
            <div id="export-target-inner">
                <PreviewContent 
                    name={name} 
                    chords={chords} 
                    detail={detail} 
                    theme={theme} 
                    width={width} 
                    zoom={zoom} 
                    aspectRatio={aspectRatio} 
                />
            </div>
        </div>
    );
}
