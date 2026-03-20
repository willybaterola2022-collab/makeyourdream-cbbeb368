import { useCallback, useRef } from "react";

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

export type InstrumentType = "piano" | "guitar" | "sax" | "bass" | "flute";

interface InstrumentConfig {
  type: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterFreq?: number;
  filterQ?: number;
  octaveShift: number;
  volume: number;
}

const INSTRUMENTS: Record<InstrumentType, InstrumentConfig> = {
  piano: { type: "triangle", attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.3, octaveShift: 0, volume: 0.3 },
  guitar: { type: "sawtooth", attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.4, filterFreq: 2000, filterQ: 1, octaveShift: 0, volume: 0.2 },
  sax: { type: "square", attack: 0.04, decay: 0.05, sustain: 0.7, release: 0.2, filterFreq: 3000, filterQ: 2, octaveShift: 0, volume: 0.15 },
  bass: { type: "sine", attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2, octaveShift: -1, volume: 0.35 },
  flute: { type: "sine", attack: 0.06, decay: 0.05, sustain: 0.8, release: 0.15, octaveShift: 1, volume: 0.2 },
};

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeOscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /** Play a note with ADSR envelope */
  const playNote = useCallback((frequency: number, duration = 0.5, type: OscillatorType = "triangle") => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getCtx]);

  /** Play a note with instrument-specific timbre */
  const playInstrument = useCallback((frequency: number, instrument: InstrumentType = "piano", duration = 0.6) => {
    const ctx = getCtx();
    const cfg = INSTRUMENTS[instrument];
    const freq = frequency * Math.pow(2, cfg.octaveShift);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // ADSR envelope
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(cfg.volume, now + cfg.attack);
    gain.gain.linearRampToValueAtTime(cfg.volume * cfg.sustain, now + cfg.attack + cfg.decay);
    gain.gain.setValueAtTime(cfg.volume * cfg.sustain, now + duration - cfg.release);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    let lastNode: AudioNode = osc;

    // Optional filter for guitar/sax
    if (cfg.filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cfg.filterFreq, now);
      filter.Q.setValueAtTime(cfg.filterQ || 1, now);
      osc.connect(filter);
      lastNode = filter;
    }

    if (lastNode === osc) {
      osc.connect(gain);
    } else {
      (lastNode as BiquadFilterNode).connect(gain);
    }
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }, [getCtx]);

  /** Start a continuous tone */
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

  /** Play a quick sweep */
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

  return { playNote, playInstrument, playTone, stopTone, playSweep, playSuccess, noteToFreq };
}
