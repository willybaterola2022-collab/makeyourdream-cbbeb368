import { useRef, useCallback } from "react";

// Note frequencies (Hz)
const NOTES: Record<string, number> = {
  C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56, E3: 164.81, F3: 174.61,
  "F#3": 185.00, G3: 196.00, "G#3": 207.65, A3: 220.00, "A#3": 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63, F4: 349.23,
  "F#4": 369.99, G4: 392.00, "G#4": 415.30, A4: 440.00, "A#4": 466.16, B4: 493.88,
  Bb3: 233.08, Bb4: 466.16, Eb3: 155.56, Eb4: 311.13, Ab3: 207.65, Ab4: 415.30,
};

type ChordType = "major" | "minor" | "7" | "dim";

interface ChordDef {
  root: string;
  type: ChordType;
}

interface SongChords {
  chords: { time: number; chord: ChordDef }[];
  bpm: number;
  style: "ballad" | "pop" | "latin" | "rock" | "reggae";
}

// Chord intervals in semitones
function getChordFreqs(rootNote: string, type: ChordType): number[] {
  const root = NOTES[rootNote] || NOTES[rootNote + "3"] || 220;
  const ratios: Record<ChordType, number[]> = {
    major: [1, 5 / 4, 3 / 2],
    minor: [1, 6 / 5, 3 / 2],
    "7": [1, 5 / 4, 3 / 2, 9 / 5],
    dim: [1, 6 / 5, 7 / 5],
  };
  return (ratios[type] || ratios.major).map((r) => root * r);
}

// Song chord progressions
const SONG_CHORDS: Record<string, SongChords> = {
  "Bésame Mucho": {
    bpm: 100, style: "ballad",
    chords: [
      { time: 0, chord: { root: "G3", type: "minor" } },
      { time: 4, chord: { root: "A3", type: "7" } },
      { time: 8, chord: { root: "D3", type: "minor" } },
      { time: 12, chord: { root: "G3", type: "minor" } },
      { time: 16, chord: { root: "A3", type: "7" } },
      { time: 20, chord: { root: "D3", type: "minor" } },
      { time: 24, chord: { root: "G3", type: "minor" } },
      { time: 28, chord: { root: "C3", type: "major" } },
      { time: 32, chord: { root: "D3", type: "minor" } },
    ],
  },
  "Cielito Lindo": {
    bpm: 120, style: "latin",
    chords: [
      { time: 0, chord: { root: "C3", type: "major" } },
      { time: 4, chord: { root: "G3", type: "major" } },
      { time: 8, chord: { root: "C3", type: "major" } },
      { time: 12, chord: { root: "G3", type: "major" } },
      { time: 16, chord: { root: "C3", type: "major" } },
      { time: 20, chord: { root: "F3", type: "major" } },
      { time: 24, chord: { root: "C3", type: "major" } },
      { time: 28, chord: { root: "G3", type: "major" } },
    ],
  },
  "La Bamba": {
    bpm: 140, style: "latin",
    chords: [
      { time: 0, chord: { root: "C3", type: "major" } },
      { time: 2, chord: { root: "F3", type: "major" } },
      { time: 4, chord: { root: "G3", type: "major" } },
      { time: 6, chord: { root: "C3", type: "major" } },
      { time: 8, chord: { root: "F3", type: "major" } },
      { time: 10, chord: { root: "G3", type: "major" } },
      { time: 12, chord: { root: "C3", type: "major" } },
      { time: 14, chord: { root: "F3", type: "major" } },
      { time: 16, chord: { root: "G3", type: "major" } },
      { time: 20, chord: { root: "C3", type: "major" } },
      { time: 24, chord: { root: "F3", type: "major" } },
    ],
  },
  "Bohemian Rhapsody": {
    bpm: 72, style: "ballad",
    chords: [
      { time: 0, chord: { root: "Bb3", type: "major" } },
      { time: 3, chord: { root: "F3", type: "major" } },
      { time: 6, chord: { root: "Eb3", type: "major" } },
      { time: 9, chord: { root: "Bb3", type: "major" } },
      { time: 12, chord: { root: "Eb3", type: "major" } },
      { time: 15, chord: { root: "Bb3", type: "major" } },
      { time: 18, chord: { root: "Eb3", type: "major" } },
      { time: 21, chord: { root: "Ab3", type: "major" } },
      { time: 24, chord: { root: "Eb3", type: "major" } },
      { time: 28, chord: { root: "Bb3", type: "major" } },
      { time: 32, chord: { root: "F3", type: "major" } },
      { time: 36, chord: { root: "Eb3", type: "major" } },
    ],
  },
  "Imagine": {
    bpm: 76, style: "ballad",
    chords: [
      { time: 0, chord: { root: "C3", type: "major" } },
      { time: 4, chord: { root: "F3", type: "major" } },
      { time: 8, chord: { root: "C3", type: "major" } },
      { time: 12, chord: { root: "F3", type: "major" } },
      { time: 16, chord: { root: "C3", type: "major" } },
      { time: 20, chord: { root: "F3", type: "major" } },
      { time: 24, chord: { root: "C3", type: "major" } },
      { time: 28, chord: { root: "E3", type: "minor" } },
      { time: 32, chord: { root: "F3", type: "major" } },
    ],
  },
  "Despacito": {
    bpm: 89, style: "latin",
    chords: [
      { time: 0, chord: { root: "B3", type: "minor" } },
      { time: 4, chord: { root: "E3", type: "minor" } },
      { time: 8, chord: { root: "F#3", type: "major" } },
      { time: 12, chord: { root: "B3", type: "minor" } },
      { time: 16, chord: { root: "G3", type: "major" } },
      { time: 19, chord: { root: "D3", type: "major" } },
      { time: 23, chord: { root: "A3", type: "major" } },
      { time: 27, chord: { root: "E3", type: "minor" } },
      { time: 31, chord: { root: "B3", type: "minor" } },
    ],
  },
  "Someone Like You": {
    bpm: 68, style: "ballad",
    chords: [
      { time: 0, chord: { root: "A3", type: "major" } },
      { time: 4, chord: { root: "E3", type: "major" } },
      { time: 7, chord: { root: "F#3", type: "minor" } },
      { time: 10, chord: { root: "D3", type: "major" } },
      { time: 14, chord: { root: "A3", type: "major" } },
      { time: 17, chord: { root: "E3", type: "major" } },
      { time: 20, chord: { root: "F#3", type: "minor" } },
      { time: 25, chord: { root: "D3", type: "major" } },
      { time: 30, chord: { root: "A3", type: "major" } },
      { time: 34, chord: { root: "E3", type: "major" } },
    ],
  },
  "Vivir Mi Vida": {
    bpm: 126, style: "latin",
    chords: [
      { time: 0, chord: { root: "G3", type: "minor" } },
      { time: 4, chord: { root: "Eb3", type: "major" } },
      { time: 8, chord: { root: "Bb3", type: "major" } },
      { time: 12, chord: { root: "F3", type: "major" } },
      { time: 16, chord: { root: "G3", type: "minor" } },
      { time: 20, chord: { root: "Eb3", type: "major" } },
      { time: 24, chord: { root: "Bb3", type: "major" } },
      { time: 28, chord: { root: "F3", type: "major" } },
    ],
  },
  "Losing My Religion": {
    bpm: 126, style: "rock",
    chords: [
      { time: 0, chord: { root: "A3", type: "minor" } },
      { time: 4, chord: { root: "E3", type: "minor" } },
      { time: 7, chord: { root: "A3", type: "minor" } },
      { time: 10, chord: { root: "D3", type: "major" } },
      { time: 14, chord: { root: "G3", type: "major" } },
      { time: 18, chord: { root: "A3", type: "minor" } },
      { time: 22, chord: { root: "E3", type: "minor" } },
      { time: 26, chord: { root: "A3", type: "minor" } },
      { time: 30, chord: { root: "D3", type: "major" } },
    ],
  },
  "No Woman No Cry": {
    bpm: 80, style: "reggae",
    chords: [
      { time: 0, chord: { root: "C3", type: "major" } },
      { time: 4, chord: { root: "G3", type: "major" } },
      { time: 8, chord: { root: "A3", type: "minor" } },
      { time: 12, chord: { root: "F3", type: "major" } },
      { time: 16, chord: { root: "C3", type: "major" } },
      { time: 20, chord: { root: "G3", type: "major" } },
      { time: 24, chord: { root: "A3", type: "minor" } },
      { time: 28, chord: { root: "F3", type: "major" } },
    ],
  },
};

export function useBackingTrack() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const bassOscRef = useRef<OscillatorNode | null>(null);
  const bassGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setTimeout>>();
  const activeRef = useRef(false);

  const stopAll = useCallback(() => {
    activeRef.current = false;
    clearTimeout(schedulerRef.current);
    nodesRef.current.forEach((o) => { try { o.stop(); } catch {} });
    nodesRef.current = [];
    try { bassOscRef.current?.stop(); } catch {}
    bassOscRef.current = null;
  }, []);

  const playChord = useCallback((freqs: number[], style: string) => {
    if (!ctxRef.current || !gainRef.current) return;
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;

    // Stop previous chord oscs
    nodesRef.current.forEach((o) => { try { o.stop(); } catch {} });
    nodesRef.current = [];

    // Pad sound (warm synth)
    const wave: OscillatorType = style === "rock" ? "sawtooth" : style === "latin" ? "triangle" : "sine";
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = f;
      g.gain.value = style === "ballad" ? 0.06 : 0.045;
      osc.connect(g).connect(masterGain);
      osc.start();
      nodesRef.current.push(osc);

      // Slight detune for warmth
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = wave;
      osc2.frequency.value = f * 1.003;
      g2.gain.value = 0.025;
      osc2.connect(g2).connect(masterGain);
      osc2.start();
      nodesRef.current.push(osc2);
    });

    // Bass note
    try { bassOscRef.current?.stop(); } catch {}
    const bassOsc = ctx.createOscillator();
    if (!bassGainRef.current) {
      bassGainRef.current = ctx.createGain();
      bassGainRef.current.gain.value = style === "reggae" ? 0.12 : 0.08;
      bassGainRef.current.connect(masterGain);
    }
    bassOsc.type = "sine";
    bassOsc.frequency.value = freqs[0] / 2; // octave below root
    bassOsc.connect(bassGainRef.current);
    bassOsc.start();
    bassOscRef.current = bassOsc;
  }, []);

  const start = useCallback((songTitle: string) => {
    const songData = SONG_CHORDS[songTitle];
    if (!songData) return;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;

    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = 0.7;
      gainRef.current.connect(ctx.destination);
    }

    activeRef.current = true;
    const startTime = ctx.currentTime;

    // Schedule all chord changes
    songData.chords.forEach((c, i) => {
      const nextTime = songData.chords[i + 1]?.time ?? Infinity;
      const delayMs = c.time * 1000;

      schedulerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        const freqs = getChordFreqs(c.chord.root, c.chord.type);
        playChord(freqs, songData.style);
      }, delayMs);
    });
  }, [playChord]);

  const stop = useCallback(() => {
    stopAll();
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current?.currentTime || 0, 0.1);
    }
    gainRef.current = null;
    bassGainRef.current = null;
  }, [stopAll]);

  return { start, stop, hasBacking: (title: string) => !!SONG_CHORDS[title] };
}
