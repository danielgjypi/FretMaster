import React, { useState, useEffect } from 'react';
import { X, Save, Download, Copy, Trash2, Check, ExternalLink } from 'lucide-react';
import { Chord } from '../lib/chords';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SavedProgression {
  id: string;
  name: string;
  chords: Chord[];
  date: number;
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgression: Chord[];
  onLoadProgression: (p: Chord[]) => void;
}

export function SaveModal({ isOpen, onClose, currentProgression, onLoadProgression }: SaveModalProps) {
  const [saved, setSaved] = useState<SavedProgression[]>([]);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExportPromptOpen, setIsExportPromptOpen] = useState(false);
  const [exportName, setExportName] = useState('');
  const [duplicatePromptOpen, setDuplicatePromptOpen] = useState(false);
  const [pendingSaveName, setPendingSaveName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const s = localStorage.getItem('fm_progressions');
      if (s) {
        try { setSaved(JSON.parse(s)); } catch (e) {}
      }
    }
  }, [isOpen]);

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
    const newProg = { id: idToReplace || Date.now().toString(), name: saveName, chords: currentProgression, date: Date.now() };
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
    
    // format date {hhmm}{dd}.{mm}.{yy}
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
            className="bg-card border border-border max-w-4xl w-full h-[600px] shadow-2xl flex flex-col md:flex-row overflow-hidden"
          >
        
        {/* Left pane: Current action */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-serif italic text-foreground">Current Track</h2>
              <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
                 <X size={16} />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                {currentProgression.length > 0 ? (
                    <>
                        <div className="bg-muted/50 p-4 border border-border font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap custom-scrollbar">
                            {currentProgression.map(c => `${c.root}${c.suffix}`).join(' - ')}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Save to Web Storage</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Progression Name..."
                                    className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                                />
                                <button 
                                    onClick={saveToWebStorage}
                                    disabled={!name.trim()}
                                    className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs uppercase hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    <Save size={14} /> Save
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Export Options</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleExportClick}
                                    className="px-4 py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2"
                                >
                                    <Download size={14} /> As .fmprog
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-3 bg-background border border-border hover:border-primary transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />} 
                                    {copied ? 'Copied' : 'Copy Text'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                        Your track is empty.
                    </div>
                )}
                
                <div className="mt-auto pt-6 border-t border-border">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-2">Import File</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 border border-dashed border-border hover:border-primary text-xs font-bold uppercase transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                        <ExternalLink size={14} /> Load .fmprog File
                        <input type="file" accept=".fmprog" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>
        </div>

        {/* Right pane: Saved list */}
        <div className="w-full md:w-1/2 flex flex-col bg-muted/20">
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <h2 className="text-xl font-serif italic text-foreground">Saved Tracks</h2>
              <button onClick={onClose} className="hidden md:block text-muted-foreground hover:text-foreground">
                 <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
               {saved.length === 0 ? (
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mt-10">No saved progressions yet.</p>
               ) : (
                   saved.map((item) => (
                       <div key={item.id} className="bg-background border border-border p-4 hover:border-primary/50 transition-colors group flex flex-col gap-3">
                           <div className="flex items-start justify-between">
                               <div>
                                   <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                                   <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                       {new Date(item.date).toLocaleDateString()} • {item.chords.length} chords
                                   </p>
                               </div>
                               <button 
                                  onClick={() => deleteSaved(item.id)}
                                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete"
                               >
                                   <Trash2 size={14} />
                               </button>
                           </div>
                           <div className="text-xs font-serif italic text-muted-foreground truncate">
                               {item.chords.map(c => `${c.root}${c.suffix}`).join(' - ')}
                           </div>
                           <div className="flex gap-2 mt-2 pt-3 border-t border-border">
                               <button 
                                   onClick={() => { onLoadProgression(item.chords); onClose(); }}
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
               A progression named <span className="font-bold text-foreground">"{pendingSaveName}"</span> already exists. How would you like to proceed?
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
    </AnimatePresence>
  );
}
