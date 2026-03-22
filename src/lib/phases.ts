export interface Phase {
  number: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  minXp: number;
  maxXp: number;
}

const PHASES: Phase[] = [
  { number: 1, name: "¿Puedo cantar?",    minLevel: 1,  maxLevel: 2,  minXp: 0,     maxXp: 299 },
  { number: 2, name: "Estoy mejorando",   minLevel: 3,  maxLevel: 4,  minXp: 300,   maxXp: 999 },
  { number: 3, name: "Esto es divertido", minLevel: 5,  maxLevel: 6,  minXp: 1000,  maxXp: 2199 },
  { number: 4, name: "Quiero más",        minLevel: 7,  maxLevel: 8,  minXp: 2200,  maxXp: 3999 },
  { number: 5, name: "Soy buena",         minLevel: 9,  maxLevel: 10, minXp: 4000,  maxXp: 7499 },
  { number: 6, name: "Soy Leyenda",       minLevel: 11, maxLevel: 12, minXp: 7500,  maxXp: 10000 },
];

export function getPhase(level: number): Phase {
  return PHASES.find(p => level >= p.minLevel && level <= p.maxLevel) || PHASES[0];
}

export function getPhaseByXp(xp: number): Phase {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (xp >= PHASES[i].minXp) return PHASES[i];
  }
  return PHASES[0];
}

export function getPhaseProgress(xp: number): number {
  const ph = getPhaseByXp(xp);
  const range = ph.maxXp - ph.minXp;
  if (range <= 0) return 100;
  return Math.min(100, Math.round(((xp - ph.minXp) / range) * 100));
}

export { PHASES };
