import { motion } from "framer-motion";

interface PitchGradientBarProps {
  cents: number;
}

function getBarColor(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 5)  return "hsl(140 40% 55%)";  // green — success
  if (abs <= 15) return "hsl(140 35% 50%)";  // green lighter
  if (abs <= 25) return "hsl(40 55% 58%)";   // amber — primary
  if (abs <= 40) return "hsl(22 55% 54%)";   // copper — secondary
  return "hsl(0 45% 55%)";                   // red — destructive
}

export function PitchGradientBar({ cents }: PitchGradientBarProps) {
  const color = getBarColor(cents);
  const height = Math.max(10, Math.min(100, 100 - Math.abs(cents)));

  return (
    <div className="fixed left-2 top-1/2 -translate-y-1/2 z-30 w-2 h-48 rounded-full bg-muted/30 overflow-hidden">
      <motion.div
        className="absolute bottom-0 w-full rounded-full transition-colors duration-300"
        style={{ backgroundColor: color }}
        animate={{ height: `${height}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
