import { useState, useEffect, useRef, useCallback } from 'react';

export type MetronomeSound = 'digital' | 'woodblock' | 'cowbell';

export interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  beatsPerMeasure: number;
  currentBeat: number;
  sound: MetronomeSound;
  volume: number;
}

export function useMetronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [sound, setSound] = useState<MetronomeSound>('digital');
  const [volume, setVolume] = useState(0.8);

  // Use refs to always access the latest values inside the audio scheduler callbacks
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const soundRef = useRef(sound);
  const volumeRef = useRef(volume);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);
  useEffect(() => { soundRef.current = sound; }, [sound]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    };
  }, []);

  const playSound = useCallback((audioCtx: AudioContext, time: number, isAccent: boolean, soundType: MetronomeSound, vol: number) => {
    if (vol <= 0) return;

    if (soundType === 'digital') {
      const osc = audioCtx.createOscillator();
      const envelope = audioCtx.createGain();
      osc.connect(envelope);
      envelope.connect(audioCtx.destination);
      
      osc.frequency.value = isAccent ? 1200 : 800;
      const safeTime = Math.max(time, audioCtx.currentTime);
      envelope.gain.setValueAtTime(vol, safeTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, safeTime + 0.1);
      
      osc.start(safeTime);
      osc.stop(safeTime + 0.1);
    } else if (soundType === 'woodblock') {
      const osc = audioCtx.createOscillator();
      const envelope = audioCtx.createGain();
      osc.connect(envelope);
      envelope.connect(audioCtx.destination);
      
      osc.type = 'square';
      osc.frequency.value = isAccent ? 800 : 600;
      
      const safeTime = Math.max(time, audioCtx.currentTime);
      osc.frequency.setValueAtTime(osc.frequency.value, safeTime);
      osc.frequency.exponentialRampToValueAtTime(100, safeTime + 0.05);
      
      envelope.gain.setValueAtTime(vol, safeTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, safeTime + 0.05);
      
      osc.start(safeTime);
      osc.stop(safeTime + 0.05);
    } else if (soundType === 'cowbell') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const envelope = audioCtx.createGain();
      
      osc1.connect(envelope);
      osc2.connect(envelope);
      envelope.connect(audioCtx.destination);
      
      osc1.type = 'square';
      osc2.type = 'square';
      
      const baseFreq = isAccent ? 800 : 540;
      osc1.frequency.value = baseFreq;
      osc2.frequency.value = baseFreq * 1.5;
      
      const safeTime = Math.max(time, audioCtx.currentTime);
      envelope.gain.setValueAtTime(vol * 0.5, safeTime);
      envelope.gain.exponentialRampToValueAtTime(0.001, safeTime + 0.15);
      
      osc1.start(safeTime);
      osc2.start(safeTime);
      osc1.stop(safeTime + 0.15);
      osc2.stop(safeTime + 0.15);
    }
  }, []);

  const previewSound = useCallback((previewSoundType: MetronomeSound) => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    playSound(audioCtx, audioCtx.currentTime, true, previewSoundType, volumeRef.current);
  }, [playSound, getAudioContext]);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
    
    currentBeatRef.current++;
    if (currentBeatRef.current >= beatsPerMeasureRef.current) {
      currentBeatRef.current = 0;
    }
  }, []);

  const scheduleNote = useCallback((beatNumber: number, time: number) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const timeUntilNote = time - audioCtx.currentTime;
    setTimeout(() => {
      setCurrentBeat(beatNumber);
    }, Math.max(0, timeUntilNote * 1000));

    playSound(audioCtx, time, beatNumber === 0, soundRef.current, volumeRef.current);
  }, [playSound]);

  const scheduler = useCallback(() => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      scheduleNote(currentBeatRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [nextNote, scheduleNote]);

  const togglePlay = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (isPlaying) {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      currentBeatRef.current = 0;
      setCurrentBeat(0);
      nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  }, [isPlaying, scheduler, getAudioContext]);

  useEffect(() => {
    return () => {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
      }
    };
  }, []);

  return {
    bpm,
    setBpm,
    isPlaying,
    togglePlay,
    beatsPerMeasure,
    setBeatsPerMeasure,
    currentBeat,
    sound,
    setSound,
    volume,
    setVolume,
    previewSound
  };
}
