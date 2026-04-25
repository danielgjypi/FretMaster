export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = [
  { id: 'major', name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'minor', name: 'Minor (Natural)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'harmonicMinor', name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'pentatonicMajor', name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9] },
  { id: 'pentatonicMinor', name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10] },
  { id: 'blues', name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  { id: 'dorian', name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian', name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian', name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian', name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'locrian', name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
];

export const TUNINGS = [
  { id: 'e_standard', name: 'E Standard', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'eb_standard', name: 'Eb Standard', notes: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
  { id: 'd_standard', name: 'D Standard', notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { id: 'db_standard', name: 'Db Standard', notes: ['C#2', 'F#2', 'B2', 'E3', 'G#3', 'C#4'] },
  { id: 'c_standard', name: 'C Standard', notes: ['C2', 'F2', 'A#2', 'D#3', 'G3', 'C4'] },
  { id: 'b_standard', name: 'B Standard', notes: ['B1', 'E2', 'A2', 'D3', 'F#3', 'B3'] },
  { id: 'drop_d', name: 'Drop D', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'drop_db', name: 'Drop Db', notes: ['C#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
  { id: 'drop_c', name: 'Drop C', notes: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { id: 'drop_b', name: 'Drop B', notes: ['B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4'] },
  { id: 'drop_a', name: 'Drop A', notes: ['A1', 'E2', 'A2', 'D3', 'F#3', 'B3'] },
  { id: 'dadgad', name: 'DADGAD', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
  { id: 'custom', name: 'Custom', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
];

export function getFullNoteName(note: string) {
  return note.replace('b', '#'); // simplistic normalization for this context
}

export function getNoteIndex(noteName: string) {
  // strip octave
  const name = noteName.replace(/[0-9]/g, '');
  return NOTES.indexOf(name);
}

export function getScaleNotes(root: string, scaleId: string) {
  const scale = SCALES.find(s => s.id === scaleId);
  if (!scale) return [];
  
  const rootIdx = getNoteIndex(root);
  return scale.intervals.map(interval => {
    return NOTES[(rootIdx + interval) % 12];
  });
}
