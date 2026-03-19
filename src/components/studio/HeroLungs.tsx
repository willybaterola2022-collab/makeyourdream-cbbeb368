import { motion } from "framer-motion";

interface Props {
  phase: "inhale" | "hold" | "exhale" | "pause";
  progress: number; // 0-1 within current phase
  isActive: boolean;
  onClick: () => void;
}

export function HeroLungs({ phase, progress, isActive, onClick }: Props) {
  const isExpanding = phase === "inhale" || phase === "hold";
  const scale = phase === "inhale" ? 0.7 + progress * 0.5 : phase === "exhale" ? 1.2 - progress * 0.5 : phase === "hold" ? 1.2 : 0.7;

  const phaseColors: Record<string, string> = {
    inhale: "hsl(160 70% 50%)",
    hold: "hsl(275 85% 60%)",
    exhale: "hsl(210 80% 55%)",
    pause: "hsl(0 0% 40%)",
  };

  const color = phaseColors[phase];
  const phaseLabels: Record<string, string> = {
    inhale: "INHALA",
    hold: "SOSTÉN",
    exhale: "EXHALA",
    pause: "PAUSA",
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center cursor-pointer"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 250, height: 250 }}
        animate={{
          boxShadow: isActive
            ? [`0 0 60px 25px ${color}40`, `0 0 90px 40px ${color}30`, `0 0 60px 25px ${color}40`]
            : [`0 0 30px 10px hsl(210 80% 55% / 0.1)`, `0 0 50px 20px hsl(210 80% 55% / 0.15)`, `0 0 30px 10px hsl(210 80% 55% / 0.1)`],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Lungs SVG */}
      <motion.div className="relative z-10" animate={{ scale }} transition={{ duration: 0.6, ease: "easeInOut" }}>
        <svg width="180" height="200" viewBox="0 0 180 200" className="md:w-[240px] md:h-[260px]">
          {/* Trachea */}
          <motion.rect x="82" y="5" width="16" height="50" rx="6" fill="none" stroke={color} strokeWidth="2.5" animate={{ stroke: color }} />
          {/* Left lung */}
          <motion.path
            d="M82 55 Q80 55 60 75 Q30 110 30 145 Q30 185 65 185 Q82 185 82 170 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ stroke: color }}
          />
          {/* Right lung */}
          <motion.path
            d="M98 55 Q100 55 120 75 Q150 110 150 145 Q150 185 115 185 Q98 185 98 170 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ stroke: color }}
          />
          {/* Inner glow fill */}
          <motion.path
            d="M82 55 Q80 55 60 75 Q30 110 30 145 Q30 185 65 185 Q82 185 82 170 Z"
            fill={`${color}15`}
            animate={{ fill: isActive ? `${color}25` : `${color}10` }}
          />
          <motion.path
            d="M98 55 Q100 55 120 75 Q150 110 150 145 Q150 185 115 185 Q98 185 98 170 Z"
            fill={`${color}15`}
            animate={{ fill: isActive ? `${color}25` : `${color}10` }}
          />
          {/* Bronchi lines */}
          <line x1="82" y1="65" x2="60" y2="90" stroke={color} strokeWidth="1.5" opacity="0.5" />
          <line x1="98" y1="65" x2="120" y2="90" stroke={color} strokeWidth="1.5" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Phase label */}
      <motion.p
        className="mt-4 text-xl md:text-2xl font-bold uppercase tracking-[0.25em]"
        style={{ color }}
        animate={{ opacity: isActive ? [0.5, 1, 0.5] : 1 }}
        transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
      >
        {isActive ? phaseLabels[phase] : "⚡ TOCA PARA RESPIRAR ⚡"}
      </motion.p>
    </motion.button>
  );
}
