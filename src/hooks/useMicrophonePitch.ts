import { useState, useRef, useCallback, useEffect } from 'react';
import { YIN } from 'pitchfinder';
import { frequencyToMidi, midiToNoteName } from '../utils/scoring';

export interface DetectedPitch {
  pitchHz: number;
  midiNote: number;
  noteName: string;
}

export function useMicrophonePitch() {
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [currentPitch, setCurrentPitch] = useState<DetectedPitch | null>(null);
  const [rmsVolume, setRmsVolume] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pitchHistoryRef = useRef<number[]>([]);

  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission('denied');
        return false;
      }

      // 1. Request microphone access with raw musical audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;
      setMicPermission('granted');

      // 2. Initialize AudioContext & AnalyserNode
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Balance between pitch resolution and low latency
      analyserRef.current = analyser;

      // CRITICAL: Passive analysis only. NEVER connect to audioCtx.destination!
      sourceNode.connect(analyser);

      // 3. Initialize YIN detector
      const detectPitch = YIN({
        sampleRate: audioCtx.sampleRate,
        threshold: 0.15,
      });

      const audioBuffer = new Float32Array(analyser.fftSize);

      // 4. Real-time Analysis Loop
      const processAudio = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getFloatTimeDomainData(audioBuffer);

        // Calculate RMS Volume
        let sumSq = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
          sumSq += audioBuffer[i] * audioBuffer[i];
        }
        const rms = Math.sqrt(sumSq / audioBuffer.length);
        const normalizedVolume = Math.min(1.0, rms * 5.0); // Amplify for VU meter
        setRmsVolume(normalizedVolume);

        // Gate threshold: Ignore ambient silence/humming below -36dB (rms ~0.015)
        if (rms > 0.015) {
          const pitchHz = detectPitch(audioBuffer);

          // Validate vocal frequency range: ~70 Hz (C#2) to ~1100 Hz (C6)
          if (pitchHz && pitchHz >= 70 && pitchHz <= 1100) {
            const midi = frequencyToMidi(pitchHz);
            const noteName = midiToNoteName(midi);

            setCurrentPitch({
              pitchHz: Math.round(pitchHz),
              midiNote: midi,
              noteName,
            });

            pitchHistoryRef.current.push(pitchHz);
          } else {
            setCurrentPitch(null);
            pitchHistoryRef.current.push(0);
          }
        } else {
          setCurrentPitch(null);
          pitchHistoryRef.current.push(0);
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      animFrameRef.current = requestAnimationFrame(processAudio);
      setIsListening(true);
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setMicPermission('denied');
      setIsListening(false);
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setCurrentPitch(null);
    setRmsVolume(0);
  }, []);

  const clearPitchHistory = useCallback(() => {
    pitchHistoryRef.current = [];
  }, []);

  const getPitchSamples = useCallback(() => {
    return [...pitchHistoryRef.current];
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    micPermission,
    currentPitch,
    rmsVolume,
    startListening,
    stopListening,
    clearPitchHistory,
    getPitchSamples,
  };
}
