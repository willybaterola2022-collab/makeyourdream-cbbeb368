const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function freqToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

export function midiToNote(midi: number): string {
  const note = NOTE_NAMES[Math.round(midi) % 12];
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return `${note}${octave}`;
}

export function classify(lowHz: number): string {
  if (lowHz < 90) return "Bajo";
  if (lowHz < 140) return "Barítono";
  if (lowHz < 200) return "Tenor";
  if (lowHz < 260) return "Contralto";
  if (lowHz < 350) return "Mezzosoprano";
  return "Soprano";
}

interface ArtistProfile {
  name: string;
  pitch: number;
  rhythm: number;
  vibrato: number;
  sustain: number;
  control: number;
  range: number;
}

const REFERENCE_ARTISTS: ArtistProfile[] = [
  { name: "Adele",           pitch: 85, rhythm: 75, vibrato: 80, sustain: 90, control: 88, range: 70 },
  { name: "Billie Eilish",   pitch: 78, rhythm: 70, vibrato: 40, sustain: 85, control: 82, range: 55 },
  { name: "Freddie Mercury", pitch: 92, rhythm: 88, vibrato: 90, sustain: 95, control: 90, range: 95 },
  { name: "Amy Winehouse",   pitch: 80, rhythm: 85, vibrato: 70, sustain: 80, control: 75, range: 65 },
  { name: "Ed Sheeran",      pitch: 75, rhythm: 90, vibrato: 50, sustain: 70, control: 78, range: 60 },
  { name: "Shakira",         pitch: 82, rhythm: 88, vibrato: 65, sustain: 75, control: 80, range: 75 },
  { name: "Sam Smith",       pitch: 88, rhythm: 72, vibrato: 75, sustain: 85, control: 85, range: 72 },
  { name: "Whitney Houston", pitch: 95, rhythm: 82, vibrato: 92, sustain: 95, control: 92, range: 90 },
];

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

export function findSimilarArtist(dims: number[]): { name: string; percent: number } {
  let bestDist = Infinity;
  let bestArtist = REFERENCE_ARTISTS[0];

  for (const artist of REFERENCE_ARTISTS) {
    const artistDims = [artist.pitch, artist.rhythm, artist.vibrato, artist.sustain, artist.control, artist.range];
    const dist = euclideanDistance(dims, artistDims);
    if (dist < bestDist) {
      bestDist = dist;
      bestArtist = artist;
    }
  }

  // Convert distance to similarity percentage (max ~245 for completely opposite)
  const maxDist = Math.sqrt(6 * 100 * 100); // ~245
  const similarity = Math.max(40, Math.round((1 - bestDist / maxDist) * 100));

  return { name: bestArtist.name, percent: similarity };
}

export interface VocalDnaResult {
  classification: string;
  description: string;
  celebrityMatch: { name: string; percent: number };
  radarValues: number[];
  rangeLabel: string;
  strongPoint: string;
}

export function analyzeVocalDna(pitches: number[], energies: number[]): VocalDnaResult {
  if (pitches.length < 10) return fallbackResult();

  const sorted = [...pitches].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.05)];
  const high = sorted[Math.floor(sorted.length * 0.95)];

  // Stability (inverse of variance)
  const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const variance = pitches.reduce((a, b) => a + (b - mean) ** 2, 0) / pitches.length;
  const stability = Math.max(0, Math.min(100, 100 - Math.sqrt(variance) / 2));

  // Energy
  const avgEnergy = energies.length > 0 ? energies.reduce((a, b) => a + b, 0) / energies.length : 0;
  const energyScore = Math.min(100, avgEnergy * 500);

  // Range
  const rangeSemitones = 12 * Math.log2(high / low);
  const rangeScore = Math.min(100, rangeSemitones * 4);

  // Vibrato detection
  let oscillations = 0;
  for (let i = 2; i < pitches.length; i++) {
    if ((pitches[i] - pitches[i - 1]) * (pitches[i - 1] - pitches[i - 2]) < 0) oscillations++;
  }
  const vibratoScore = Math.min(95, Math.max(20, 40 + (oscillations / pitches.length) * 120));

  // Rhythm approximation from energy variance
  const energyVariance = energies.length > 5
    ? energies.reduce((a, b) => a + (b - avgEnergy) ** 2, 0) / energies.length
    : 0;
  const rhythmScore = Math.min(90, Math.max(40, 70 + Math.sqrt(energyVariance) * 5));

  const radarValues = [
    Math.round(stability),                      // Afinación
    Math.round(rhythmScore),                     // Ritmo
    Math.round(vibratoScore),                    // Vibrato
    Math.round(stability * 0.8),                 // Sustain
    Math.round((stability + energyScore) / 2),   // Control
    Math.round(rangeScore),                      // Rango
  ];

  const classification = classify(low);

  // Description
  const traits: string[] = [];
  if (energyScore > 60) traits.push("potente");
  if (stability > 70) traits.push("controlada");
  if (energyScore < 40) traits.push("íntima");
  if (stability > 60 && energyScore > 50) traits.push("cálida");
  if (vibratoScore > 60) traits.push("expresiva");
  traits.push("única");
  const description = `Tu voz es ${traits.slice(0, 3).join(". ")}. ${traits[traits.length - 1]}.`;

  // Strong point
  const labels = ["afinación", "ritmo", "vibrato", "sustain", "control", "rango"];
  const maxIdx = radarValues.indexOf(Math.max(...radarValues));
  const strongPoint = labels[maxIdx] ?? "expresividad";

  // Celebrity match (deterministic)
  const celebrity = findSimilarArtist(radarValues);

  const rangeLabel = `${midiToNote(freqToMidi(low))} — ${midiToNote(freqToMidi(high))}`;

  return { classification, description, celebrityMatch: celebrity, radarValues, rangeLabel, strongPoint };
}

export function fallbackResult(): VocalDnaResult {
  return {
    classification: "Voz única",
    description: "Tu voz es singular. Expresiva. Personal.",
    celebrityMatch: { name: "Adele", percent: 72 },
    radarValues: [50, 50, 30, 40, 50, 40],
    rangeLabel: "—",
    strongPoint: "expresividad",
  };
}
