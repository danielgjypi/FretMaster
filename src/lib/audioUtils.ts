import { NOTES } from './scales';

// A4 is the standard reference pitch (440 Hz)
export const A4 = 440;

/**
 * Calculates the fundamental frequency of an audio buffer using the YIN/Auto-correlation algorithm.
 * @param buffer Float32Array of time-domain audio data
 * @param sampleRate The sample rate of the AudioContext (e.g. 48000)
 * @returns The detected frequency in Hz, or -1 if no pitch is detected
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return -1; // Not enough signal

  let r1 = 0, r2 = buffer.length - 1, thres = 0.2;
  for (let i = 0; i < buffer.length / 2; i++)
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < buffer.length / 2; i++)
    if (Math.abs(buffer[buffer.length - i]) < thres) { r2 = buffer.length - i; break; }

  buffer = buffer.slice(r1, r2);
  let c = new Array(buffer.length).fill(0);
  for (let i = 0; i < buffer.length; i++)
    for (let j = 0; j < buffer.length - i; j++)
      c[i] = c[i] + buffer[j] * buffer[j + i];

  let d = 0; while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < buffer.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

/**
 * Converts a frequency in Hz to a MIDI note number.
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * (Math.log2(frequency / A4))) + 69;
}

/**
 * Gets the target frequency for a given MIDI note.
 */
export function midiToFrequency(midiNote: number): number {
  return A4 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Calculates how many cents a frequency is off from a target MIDI note.
 */
export function getCentsOffPitch(frequency: number, midiNote: number): number {
  const targetFrequency = midiToFrequency(midiNote);
  return Math.floor(1200 * Math.log2(frequency / targetFrequency));
}

/**
 * Converts a MIDI note number to a musical note string (e.g. 'E2')
 */
export function midiToNoteName(midiNote: number): string {
  const noteIdx = midiNote % 12;
  // Handle negative octaves (MIDI note 0 is C-1)
  let octave = Math.floor(midiNote / 12) - 1;
  
  // Need positive mod
  let finalIdx = noteIdx;
  if (finalIdx < 0) {
     finalIdx += 12;
  }
  return `${NOTES[finalIdx]}${octave}`;
}

export function getNoteFromName(noteName: string): string {
  return noteName.replace(/[0-9]/g, '');
}
