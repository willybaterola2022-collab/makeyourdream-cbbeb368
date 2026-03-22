import { cn } from "@/lib/utils";

const PHASES = [
  { min: 0, max: 299, name: "¿Puedo cantar?" },
  { min: 300, max: 999, name: "Estoy mejorando" },
  { min: 1000, max: 2199, name: "Esto es divertido" },
  { min: 2200, max: 3999, name: "Quiero más" },
  { min: 4000, max: 7499, name: "Soy buena" },
  { min: 7500, max: 10000, name: "Soy Leyenda" },
];

export function getLevelPhase(xp: number): { phase: number; name: string; progress: number } {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (xp >= PHASES[i].min) {
      const range = PHASES[i].max - PHASES[i].min;
      const progress = Math.min(((xp - PHASES[i].min) / range) * 100, 100);
      return { phase: i + 1, name: PHASES[i].name, progress };
    }
  }
  return { phase: 1, name: PHASES[0].name, progress: 0 };
}

interface PhaseProgressProps {
  xp: number;
  className?: string;
  compact?: boolean;
}

export function PhaseProgress({ xp, className, compact }: PhaseProgressProps) {
  const { name, progress } = getLevelPhase(xp);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("font-display text-primary", compact ? "text-sm" : "text-lg")}>
          {name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full amber-gradient transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
