import { motion } from "framer-motion";
import { getStreakMultiplier } from "./skillTreeData";

interface StreakMultiplierProps {
  streak: number;
}

export function StreakMultiplier({ streak }: StreakMultiplierProps) {
  const mult = getStreakMultiplier(streak);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
    >
      {/* Glow rings for high streaks */}
      {mult.tier === "fire" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: `1px solid ${mult.color}`, opacity: 0 }}
              animate={{ scale: [1, 1.3 + i * 0.15], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </>
      )}
      {mult.tier === "orange" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${mult.color}` }}
          animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      <span className="text-sm">🔥</span>
      <span
        className="text-[10px] font-bold"
        style={{ color: mult.color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {streak}d
      </span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
        style={{
          color: mult.color,
          background: `${mult.color}15`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {mult.label}
      </span>
    </motion.div>
  );
}
