import { useState, useRef, useCallback, useEffect } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  // Check if there's enough signal
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return -1; // not enough signal

  // Trim silence from edges
  let r1 = 0, r2 = buf.length - 1;
  const threshold = 0.2;
  for (let i = 0; i < buf.length / 2; i++) {
    if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  }
  for (let i = 1; i < buf.length / 2; i++) {
    if (Math.abs(buf[buf.length - i]) < threshold) { r2 = buf.length - i; break; }
  }

  const trimmed = buf.slice(r1, r2);
  const len = trimmed.length;

  // Autocorrelation
  const c = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i];
    }
  }

  // Find first dip then peak
  let d = 0;
  while (c[d] > c[d + 1] && d < len - 1) d++;
  let maxVal = -1, maxPos = -1;
  for (let i = d; i < len; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; }
  }

  const T0 = maxPos;
  if (T0 === 0 || T0 === -1) return -1;
  return sampleRate / T0;
}

function freqToNote(freq: number) {
  const midi = 12 * (Math.log2(freq / 440)) + 69;
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const note = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { note, octave, cents, midi: rounded };
}

export interface PitchData {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
}

export function usePitchDetection(analyserNode: AnalyserNode | null, active = true) {
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const rafRef = useRef(0);

  const detect = useCallback(() => {
    if (!analyserNode) return;
    const buf = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(buf);
    const freq = autoCorrelate(buf, analyserNode.context.sampleRate);
    if (freq > 60 && freq < 1500) {
      const { note, octave, cents } = freqToNote(freq);
      setPitch({ frequency: Math.round(freq), note, octave, cents });
    } else {
      setPitch(null);
    }
    rafRef.current = requestAnimationFrame(detect);
  }, [analyserNode]);

  useEffect(() => {
    if (active && analyserNode) {
      rafRef.current = requestAnimationFrame(detect);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, analyserNode, detect]);

  return pitch;
}
