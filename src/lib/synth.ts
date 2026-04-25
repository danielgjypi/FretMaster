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

  const audioContext = Tone.getContext().rawContext as AudioContext;
  console.log(`AudioContext state: ${audioContext.state}`);
  
  try {
    const url = `soundfonts/${instrumentName}-mp3.json`;
    console.log(`Fetching soundfont: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const mapping = await response.json();
    
    // Use Tone.Sampler instead of soundfont-player for better reliability
    return new Promise<void>((resolve, reject) => {
      const sampler = new Tone.Sampler({
        urls: mapping,
        onload: () => {
          instruments[instrumentName] = sampler;
          instrument = sampler;
          currentInstrumentName = instrumentName;
          initialized = true;
          console.log(`Instrument ${instrumentName} loaded successfully via Tone.Sampler`);
          resolve();
        },
        onerror: (error) => {
          console.error(`Failed to load sampler for ${instrumentName}:`, error);
          reject(error);
        }
      }).toDestination();
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

let currentBpm = 120;

export function setBpm(bpm: number) {
  currentBpm = bpm;
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
  if (instrument) {
    instrument.releaseAll();
  }
}

export async function playChord(chord: Chord, time?: number, playbackSpeedMulti: number = 1, duration: number = 2) {
  console.log(`Playing chord: ${chord.root}${chord.suffix}`);
  if (!initialized || !instrument) {
    await initSynth(currentInstrumentName);
  }
  
  if (!instrument) return;

  const startTime = time !== undefined ? time : Tone.now();
  const strumSpeed = 0.03 / playbackSpeedMulti; 
  
  // DEBUG: Play a simple beep to verify audio context
  // const debugOsc = new Tone.Oscillator(440, "sine").toDestination().start(startTime).stop(startTime + 0.1);
  // debugOsc.volume.value = -20;

  chord.notes.forEach((note, i) => {
    instrument!.triggerAttackRelease(note, duration, startTime + i * strumSpeed);
  });
}
