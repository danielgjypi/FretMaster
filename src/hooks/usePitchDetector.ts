import { useState, useEffect, useRef, useCallback } from 'react';
import { autoCorrelate, frequencyToMidi, midiToNoteName, getCentsOffPitch } from '../lib/audioUtils';

export interface PitchData {
  frequency: number;
  midiNote: number;
  noteName: string; // e.g. 'E2'
  cents: number;
}

export function usePitchDetector(isActive: boolean, deviceId: string | null = null, noiseGateThreshold: number = 0.01) {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    setPitchData(null);
  }, []);

  const initAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
              echoCancellation: false, 
              autoGainControl: false, 
              noiseSuppression: false,
              ...(deviceId ? { deviceId: { exact: deviceId } } : {})
          } 
      });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.fftSize;
      const buffer = new Float32Array(bufferLength);

      const updatePitch = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        
        analyserRef.current.getFloatTimeDomainData(buffer);
        
        // Calculate RMS volume for noise gate
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        
        let freq = -1;
        if (rms >= noiseGateThreshold) {
          freq = autoCorrelate(buffer, audioContextRef.current.sampleRate);
        }
        
        if (freq !== -1) {
          const midiNote = frequencyToMidi(freq);
          const noteName = midiToNoteName(midiNote);
          const cents = getCentsOffPitch(freq, midiNote);
          
          setPitchData({
            frequency: freq,
            midiNote,
            noteName,
            cents
          });
        } else {
          // If no pitch detected, we can either clear it or keep the last one.
          // Let's clear it if it's silent for visual feedback
          setPitchData(null);
        }
        
        rafIdRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
      requestAnimationFrame(updatePitch);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure you have granted permission.');
    }
  }, [deviceId, cleanup, noiseGateThreshold]);

  useEffect(() => {
    if (isActive) {
      initAudio();
    } else {
      cleanup();
    }
    return cleanup;
  }, [isActive, deviceId, initAudio, cleanup]);

  return { pitchData, error };
}
