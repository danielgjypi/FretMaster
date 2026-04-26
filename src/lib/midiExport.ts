import MidiWriter from 'midi-writer-js';
import { Chord } from './chords';

/**
 * Exports a progression of chords to a MIDI file and triggers a download.
 * Each chord is given a full measure (4 beats).
 */
export function exportProgressionToMidi(name: string, chords: Chord[], bpm: number = 120) {
  if (!chords || chords.length === 0) return;

  // Create a new track
  const track = new MidiWriter.Track();

  // Set tempo
  track.setTempo(bpm);
  
  // Set instrument (Nylon Guitar is usually Program 25, 0-indexed is 24)
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 24 }));

  // Add each chord as a NoteEvent
  chords.forEach((chord) => {
    // MidiWriter accepts note names like 'E2', 'G#3', etc.
    // Our Chord object already has these in chord.notes
    track.addEvent(new MidiWriter.NoteEvent({
      pitch: chord.notes,
      duration: '1', // 1 whole note (full measure)
      velocity: 85,  // Human-like velocity
    }));
  });

  // Build the MIDI file
  const writer = new MidiWriter.Writer(track);
  const base64Midi = writer.buildFile(); // returns a Uint8Array or similar depending on version
  
  // Create a blob and trigger download
  // MidiWriter.Writer.dataUri() is often easier
  const dataUri = writer.dataUri();
  
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = `${name || 'FretMaster_Progression'}.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
