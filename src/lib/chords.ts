export type Chord = {
  id: string; // generated
  root: string;
  quality: string;
  suffix: string;
  frets: number[]; // -1 implies muted
  notes: string[]; // Evaluated note names e.g. ["E2", "B2", "E3", "G#3", "B3", "E4"]
};

export interface ChordGroupType {
  id: string; // e.g. "C-maj7"
  root: string;
  suffix: string;
  quality: string;
  voicings: Chord[];
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STRING_TUNINGS = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

export function midiToNoteName(midi: number): string {
  const noteName = NOTES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

type ShapeDefinition = {
  quality: string;
  suffix: string;
  frets: number[]; // Relative frets to root. Root fret is 0. Mutes are -1.
};

// Expanded CAGED shapes for more variety
const E_ROOT_SHAPES: ShapeDefinition[] = [
  { quality: 'Major', suffix: '', frets: [0, 2, 2, 1, 0, 0] },
  { quality: 'Minor', suffix: 'm', frets: [0, 2, 2, 0, 0, 0] },
  { quality: 'Dominant 7', suffix: '7', frets: [0, 2, 0, 1, 0, 0] },
  { quality: 'Minor 7', suffix: 'm7', frets: [0, 2, 0, 0, 0, 0] },
  { quality: 'Major 7', suffix: 'maj7', frets: [0, 2, 1, 1, 0, 0] },
  { quality: 'Major 7', suffix: 'maj7', frets: [0, -1, 1, 1, 0, -1] },
  { quality: 'Suspended 4', suffix: 'sus4', frets: [0, 2, 2, 2, 0, 0] },
  { quality: 'Suspended 2', suffix: 'sus2', frets: [0, 2, 4, 1, 0, 0] },
  { quality: 'Minor 7b5', suffix: 'm7b5', frets: [0, -1, 0, 0, -1, -1] },
  { quality: 'Diminished 7', suffix: 'dim7', frets: [0, -1, 2, 0, 2, 0] },
  { quality: 'Dominant 9', suffix: '9', frets: [0, 2, 0, 1, 0, 2] },
  { quality: 'Minor 9', suffix: 'm9', frets: [0, 2, 0, 0, 0, 2] },
  { quality: 'Add 9', suffix: 'add9', frets: [0, 2, 4, 1, 0, 0] },
  { quality: 'Major 6', suffix: '6', frets: [0, 2, 2, 1, 2, 0] },
  { quality: 'Minor 6', suffix: 'm6', frets: [0, 2, 2, 0, 2, 0] },
  { quality: 'Dominant 13', suffix: '13', frets: [0, -1, 0, 1, 2, 0] },
];

const A_ROOT_SHAPES: ShapeDefinition[] = [
  { quality: 'Major', suffix: '', frets: [-1, 0, 2, 2, 2, 0] },
  { quality: 'Minor', suffix: 'm', frets: [-1, 0, 2, 2, 1, 0] },
  { quality: 'Dominant 7', suffix: '7', frets: [-1, 0, 2, 0, 2, 0] },
  { quality: 'Minor 7', suffix: 'm7', frets: [-1, 0, 2, 0, 1, 0] },
  { quality: 'Major 7', suffix: 'maj7', frets: [-1, 0, 2, 1, 2, 0] },
  { quality: 'Suspended 2', suffix: 'sus2', frets: [-1, 0, 2, 2, 0, 0] },
  { quality: 'Suspended 4', suffix: 'sus4', frets: [-1, 0, 2, 2, 3, 0] },
  { quality: 'Diminished 7', suffix: 'dim7', frets: [-1, 0, 1, 2, 1, -1] },
  { quality: 'Minor 7b5', suffix: 'm7b5', frets: [-1, 0, 1, 0, 1, -1] },
  { quality: 'Augmented', suffix: 'aug', frets: [-1, 0, 3, 2, 2, -1] },
  { quality: 'Minor 6', suffix: 'm6', frets: [-1, 0, 2, 2, 1, 2] },
  { quality: 'Major 6', suffix: '6', frets: [-1, 0, 2, 2, 2, 2] },
  { quality: 'Dominant 9', suffix: '9', frets: [-1, 0, 2, 0, 0, 0] },
  { quality: 'Major 9', suffix: 'maj9', frets: [-1, 0, 2, 1, 0, 0] },
  { quality: 'Dominant 7#9', suffix: '7#9', frets: [-1, 0, 2, 0, 1, -1] },
];

const C_ROOT_SHAPES: ShapeDefinition[] = [
  { quality: 'Major', suffix: '', frets: [-1, 3, 2, 0, 1, 0] },
  { quality: 'Minor', suffix: 'm', frets: [-1, 3, 1, 0, 1, -1] },
  { quality: 'Major 7', suffix: 'maj7', frets: [-1, 3, 2, 0, 0, 0] },
  { quality: 'Dominant 7', suffix: '7', frets: [-1, 3, 2, 3, 1, 0] },
  { quality: 'Minor 7', suffix: 'm7', frets: [-1, 3, 1, 3, 1, -1] },
  { quality: 'Suspended 2', suffix: 'sus2', frets: [-1, 3, 0, 0, 1, 0] },
  { quality: 'Suspended 4', suffix: 'sus4', frets: [-1, 3, 3, 0, 1, 0] },
  { quality: 'Add 9', suffix: 'add9', frets: [-1, 3, 2, 0, 3, 0] },
  { quality: 'Major 9', suffix: 'maj9', frets: [-1, 3, 0, 0, 0, 0] },
  { quality: 'Dominant 9', suffix: '9', frets: [-1, 3, 2, 3, 3, 0] },
  { quality: 'Diminished 7', suffix: 'dim7', frets: [-1, 3, 4, 2, 4, -1] },
  { quality: 'Minor 7b5', suffix: 'm7b5', frets: [-1, 3, 4, 3, 4, -1] },
];

const G_ROOT_SHAPES: ShapeDefinition[] = [
  { quality: 'Major', suffix: '', frets: [3, 2, 0, 0, 0, 3] },
  { quality: 'Major', suffix: '', frets: [3, 2, 0, 0, 3, 3] },
  { quality: 'Minor', suffix: 'm', frets: [3, 1, 0, 0, 3, 3] },
  { quality: 'Dominant 7', suffix: '7', frets: [3, 2, 0, 0, 0, 1] },
  { quality: 'Major 7', suffix: 'maj7', frets: [3, 2, 0, 0, 0, 2] },
  { quality: 'Minor 7', suffix: 'm7', frets: [3, 1, 3, 0, 3, 3] },
  { quality: 'Suspended 2', suffix: 'sus2', frets: [3, 0, 0, 0, 3, 3] },
  { quality: 'Suspended 4', suffix: 'sus4', frets: [3, 3, 0, 0, 1, 3] },
  { quality: 'Add 9', suffix: 'add9', frets: [3, 0, 0, 0, 0, 3] },
];

const D_ROOT_SHAPES: ShapeDefinition[] = [
  { quality: 'Major', suffix: '', frets: [-1, -1, 0, 2, 3, 2] },
  { quality: 'Minor', suffix: 'm', frets: [-1, -1, 0, 2, 3, 1] },
  { quality: 'Dominant 7', suffix: '7', frets: [-1, -1, 0, 2, 1, 2] },
  { quality: 'Minor 7', suffix: 'm7', frets: [-1, -1, 0, 2, 1, 1] },
  { quality: 'Major 7', suffix: 'maj7', frets: [-1, -1, 0, 2, 2, 2] },
  { quality: 'Suspended 2', suffix: 'sus2', frets: [-1, -1, 0, 2, 3, 0] },
  { quality: 'Suspended 4', suffix: 'sus4', frets: [-1, -1, 0, 2, 3, 3] },
  { quality: 'Diminished', suffix: 'dim', frets: [-1, -1, 0, 1, 3, 1] },
  { quality: 'Add 9', suffix: 'add9', frets: [-1, -1, 0, 2, 3, 0] },
  { quality: 'Minor 9', suffix: 'm9', frets: [-1, -1, 0, 2, 1, 0] },
  { quality: 'Dominant 9', suffix: '9', frets: [-1, -1, 0, 2, 1, 0] },
  { quality: 'Major 6', suffix: '6', frets: [-1, -1, 0, 2, 0, 2] }, 
  { quality: 'Minor 6', suffix: 'm6', frets: [-1, -1, 0, 2, 0, 1] },
];

function generateChords(): ChordGroupType[] {
  const uniqueVoicings = new Map<string, Chord>();
  
  for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
    const rootName = NOTES[rootIndex];

    const addShapes = (shapes: ShapeDefinition[], stringTuningIndex: number, stringIndexForRoot: number) => {
      const shapeRootMidi = STRING_TUNINGS[stringIndexForRoot];
      const noteMidi = rootIndex;
      const shapeNoteIndex = shapeRootMidi % 12;
      const offset = (noteMidi - shapeNoteIndex + 12) % 12;

      shapes.forEach((shape) => {
        const normalizedOffset = offset > 8 ? offset - 12 : offset;
        
        let valid = true;
        const frets = shape.frets.map(f => {
            if (f === -1) return -1;
            const shifted = f + normalizedOffset;
            if (shifted < 0 || shifted > 16) valid = false;
            return shifted;
        });

        if (!valid) return;

        const maxDiff = Math.max(...frets.filter(f=>f>0)) - Math.min(...frets.filter(f=>f>0));
        if (maxDiff > 4) return;

        const notes = frets.map((f, i) => (f === -1 ? '' : midiToNoteName(STRING_TUNINGS[i] + f))).filter(n => n !== '');
        
        const c: Chord = {
          id: '',
          root: rootName,
          quality: shape.quality,
          suffix: shape.suffix,
          frets,
          notes
        };
        const key = `${c.root}${c.suffix}-${c.frets.join(',')}`;
        if (!uniqueVoicings.has(key)) {
          c.id = key;
          uniqueVoicings.set(key, c);
        }
      });
    };

    addShapes(E_ROOT_SHAPES, 0, 0); 
    addShapes(A_ROOT_SHAPES, 1, 1); 
    addShapes(C_ROOT_SHAPES, 1, 1); 
    addShapes(G_ROOT_SHAPES, 0, 0); 
    addShapes(D_ROOT_SHAPES, 2, 2); 
  }

  const groups = new Map<string, ChordGroupType>();
  uniqueVoicings.forEach(c => {
      const gId = `${c.root}-${c.suffix}`;
      if (!groups.has(gId)) {
          groups.set(gId, {
              id: gId,
              root: c.root,
              suffix: c.suffix,
              quality: c.quality,
              voicings: []
          });
      }
      groups.get(gId)!.voicings.push(c);
  });

  const result = Array.from(groups.values());
  result.forEach(g => {
      g.voicings.sort((a, b) => {
          const arrA = a.frets.filter(f=>f>=0);
          const arrB = b.frets.filter(f=>f>=0);
          const avgA = arrA.length ? arrA.reduce((a,b)=>a+b,0) / arrA.length : 0;
          const avgB = arrB.length ? arrB.reduce((a,b)=>a+b,0) / arrB.length : 0;
          return avgA - avgB;
      });
  });

  return result;
}

export const CHORD_GROUPS = generateChords();
export const ALL_CHORDS = CHORD_GROUPS.flatMap(g => g.voicings);

export function getVoiceLeadingDistance(c1: Chord, c2: Chord): number {
    let distance = 0;
    
    const played1 = c1.frets.filter(f => f >= 0);
    const played2 = c2.frets.filter(f => f >= 0);
    const avg1 = played1.length ? played1.reduce((a, b) => a + b, 0) / played1.length : 0;
    const avg2 = played2.length ? played2.reduce((a, b) => a + b, 0) / played2.length : 0;
    distance += Math.abs(avg1 - avg2) * 2;

    for (let i = 0; i < 6; i++) {
        const f1 = c1.frets[i];
        const f2 = c2.frets[i];
        if (f1 >= 0 && f2 >= 0) {
            distance += Math.abs(f1 - f2);
        } else if (f1 !== f2) {
            distance += 3;
        }
    }
    return distance;
}

export function getBestVoicing(lastChord: Chord | undefined | null, group: ChordGroupType): Chord {
    if (!lastChord) return group.voicings[0];
    let bestVoicing = group.voicings[0];
    let minScore = Infinity;
    group.voicings.forEach(v => {
        const score = getVoiceLeadingDistance(lastChord, v);
        if (score < minScore) {
            minScore = score;
            bestVoicing = v;
        }
    });
    return bestVoicing;
}

export function getSuggestions(currentProgression: Chord[]): Chord[] {
  if (currentProgression.length === 0) {
      const starterGroups = CHORD_GROUPS.filter(g => g.suffix === '' && ['C','G','D','A','E'].includes(g.root));
      return starterGroups.map(g => g.voicings[0]);
  }
  
  const lastChord = currentProgression[currentProgression.length - 1];
  const rootIndex = NOTES.indexOf(lastChord.root);
  
  let suggestedRoots: number[] = [];
  let suggestedSuffixes: string[] = [];

  if (lastChord.quality === 'Major') {
    suggestedRoots = [
      (rootIndex + 5) % 12, (rootIndex + 7) % 12, (rootIndex + 9) % 12, (rootIndex + 2) % 12, (rootIndex + 4) % 12
    ];
    suggestedSuffixes = ['maj7', '', 'm', 'm7', 'sus4'];
  } else if (lastChord.quality.includes('Minor')) {
    suggestedRoots = [
      (rootIndex + 8) % 12, (rootIndex + 10) % 12, (rootIndex + 3) % 12, (rootIndex + 5) % 12, (rootIndex + 7) % 12
    ];
    suggestedSuffixes = ['m', 'm7', '', 'maj7', 'sus2', '7'];
  } else {
    suggestedRoots = [ (rootIndex + 5) % 12, (rootIndex + 7) % 12, (rootIndex + 2) % 12 ];
    suggestedSuffixes = ['', 'm', '7', 'm7'];
  }

  const groupCandidates = CHORD_GROUPS.filter(g => {
    return suggestedRoots.includes(NOTES.indexOf(g.root)) && suggestedSuffixes.includes(g.suffix);
  });

  const bestVoicings = groupCandidates.map(g => {
      let bestVoicing = g.voicings[0];
      let minScore = Infinity;
      g.voicings.forEach(v => {
          const score = getVoiceLeadingDistance(lastChord, v);
          if (score < minScore) {
              minScore = score;
              bestVoicing = v;
          }
      });
      return { voicing: bestVoicing, score: minScore };
  });

  bestVoicings.sort((a,b) => a.score - b.score);

  return bestVoicings.slice(0, 8).map(x => x.voicing);
}
