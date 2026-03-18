import { useCallback, useRef } from "react";

// Note-to-frequency mapping using equal temperament: 440 * 2^((n-69)/12)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteFreqMap: Record<string, number> = {};
for (let midi = 21; midi <= 108; midi++) {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  noteFreqMap[`${name}${octave}`] = 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToFreq(note: string): number {
  return noteFreqMap[note] ?? 440;
}

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeOscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /** Play a note with ADSR envelope, auto-stops after duration */
  const playNote = useCallback((frequency: number, duration = 0.5, type: OscillatorType = "triangle") => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // Attack
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    // Sustain then release
    gain.gain.setValueAtTime(0.3, ctx.currentTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  /** Start a continuous tone, returns stop function */
  const playTone = useCallback((frequency: number, type: OscillatorType = "sine", volume = 0.15) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    activeOscRef.current = { osc, gain };
    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      setTimeout(() => { try { osc.stop(); } catch {} }, 150);
    };
  }, [getCtx]);

  /** Stop any active continuous tone */
  const stopTone = useCallback(() => {
    if (activeOscRef.current) {
      const { osc, gain } = activeOscRef.current;
      const ctx = ctxRef.current;
      if (ctx) {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        setTimeout(() => { try { osc.stop(); } catch {} }, 150);
      }
      activeOscRef.current = null;
    }
  }, []);

  /** Play a quick ascending or descending sweep */
  const playSweep = useCallback((startFreq: number, endFreq: number, duration = 0.3, volume = 0.15) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  }, [getCtx]);

  /** Play a success chord (C-E-G) */
  const playSuccess = useCallback(() => {
    [261.63, 329.63, 392.00].forEach((freq, i) => {
      setTimeout(() => playNote(freq, 0.4, "triangle"), i * 100);
    });
  }, [playNote]);

  return { playNote, playTone, stopTone, playSweep, playSuccess, noteToFreq: noteToFreq };
}
