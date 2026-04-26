import * as Tone from 'tone';
import { Chord } from './chords';

let currentInstrumentName = 'acoustic_guitar_nylon';
const instruments: Record<string, Tone.Sampler> = {};
let instrument: Tone.Sampler | null = null;
let initialized = false;

export async function initSynth(instrumentName: string = 'acoustic_guitar_nylon') {
  await Tone.start();
  
  if (instruments[instrumentName]) {
    instrument = instruments[instrumentName];
    currentInstrumentName = instrumentName;
    initialized = true;
    return;
  }

  try {
    if (instrumentName === 'custom') {
      console.warn("Custom instrument selected but not yet implemented. Falling back to nylon guitar.");
      return initSynth('acoustic_guitar_nylon');
    }
    const url = `soundfonts/${instrumentName}-mp3.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const mapping = await response.json();
    
    return new Promise<void>((resolve, reject) => {
      const sampler = new Tone.Sampler({
        urls: mapping,
        onload: () => {
          instruments[instrumentName] = sampler;
          instrument = sampler;
          currentInstrumentName = instrumentName;
          initialized = true;
          sampler.toDestination();
          resolve();
        },
        onerror: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Failed to load instrument ${instrumentName}:`, error);
  }
}

export async function setSynthInstrument(name: string) {
  await initSynth(name);
}

export function getCurrentInstrumentName() {
  return currentInstrumentName;
}

export function setBpm(bpm: number) {
  Tone.Transport.bpm.value = bpm;
}

export function setVolume(vol: number) {
  if (vol <= 0) {
    Tone.Destination.mute = true;
  } else {
    Tone.Destination.mute = false;
    Tone.Destination.volume.value = 20 * Math.log10(Math.max(vol / 100, 0.001));
  }
}

export function stopSynth() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  if (instrument) {
    instrument.releaseAll();
  }
}

export async function playChord(chord: Chord, time?: number, playbackSpeedMulti: number = 1, duration: number = 2) {
  if (!initialized || !instrument) {
    await initSynth(currentInstrumentName);
  }
  
  if (!instrument) return;

  const startTime = time !== undefined ? time : Tone.now();
  const strumSpeed = 0.03 / playbackSpeedMulti; 
  
  chord.notes.forEach((note, i) => {
    instrument!.triggerAttackRelease(note, duration, startTime + i * strumSpeed);
  });
}
