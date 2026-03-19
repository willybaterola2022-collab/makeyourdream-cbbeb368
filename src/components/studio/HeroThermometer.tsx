import { motion } from "framer-motion";

interface Props {
  progress: number; // 0-100
  onClick: () => void;
  label?: string;
}

export function HeroThermometer({ progress, onClick, label }: Props) {
  // Color transitions from blue (cold) → amber (warm) → red (hot)
  const getColor = (p: number) => {
    if (p < 30) return "hsl(210 80% 55%)";
    if (p < 60) return "hsl(30 80% 55%)";
    return "hsl(0 70% 55%)";
  };

  const getGlow = (p: number) => {
    if (p < 30) return "hsl(210 80% 55% / 0.4)";
    if (p < 60) return "hsl(30 80% 55% / 0.4)";
    return "hsl(0 70% 55% / 0.5)";
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center cursor-pointer"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 200, height: 200, top: "30%" }}
        animate={{
          boxShadow: [
            `0 0 40px 15px ${getGlow(progress)}`,
            `0 0 70px 30px ${getGlow(progress)}`,
            `0 0 40px 15px ${getGlow(progress)}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Thermometer body */}
      <div className="relative z-10">
        {/* Bulb */}
        <div className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: getColor(progress), background: `${getColor(progress)}20` }}
        >
          <motion.div
            className="w-12 h-12 md:w-14 md:h-14 rounded-full"
            style={{ background: getColor(progress) }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Tube */}
        <div className="mx-auto w-10 md:w-12 h-40 md:h-56 rounded-t-lg border-2 border-b-0 relative overflow-hidden -mt-2"
          style={{ borderColor: `hsl(0 0% 30%)`, background: "hsl(0 0% 8%)" }}
        >
          {/* Mercury fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-sm"
            style={{ background: `linear-gradient(to top, ${getColor(progress)}, ${getColor(Math.max(0, progress - 20))})` }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Tick marks */}
          {[20, 40, 60, 80].map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-muted-foreground/20"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>
      </div>

      {/* Label */}
      <motion.p
        className="mt-6 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
        style={{ color: getColor(progress) }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {label || (progress < 30 ? "❄️ FRÍO" : progress < 70 ? "🔥 CALENTANDO" : "🌡️ ¡LISTO!")}
      </motion.p>
    </motion.button>
  );
}
