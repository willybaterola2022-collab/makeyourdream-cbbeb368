import { motion } from "framer-motion";

interface Props {
  rank?: number;
  onClick: () => void;
}

export function HeroTrophy({ rank = 4, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center cursor-pointer z-10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Gold glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 250, height: 250 }}
        animate={{
          boxShadow: [
            "0 0 50px 20px hsl(45 90% 50% / 0.15)",
            "0 0 80px 35px hsl(45 90% 50% / 0.25)",
            "0 0 50px 20px hsl(45 90% 50% / 0.15)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{ left: `${30 + i * 10}%`, top: `${20 + (i % 3) * 15}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        >
          ✨
        </motion.div>
      ))}

      {/* Trophy */}
      <motion.div
        className="relative z-10 text-8xl md:text-[140px]"
        animate={{ rotateY: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🏆
      </motion.div>

      {/* Rank */}
      <motion.div
        className="mt-4 flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-4xl md:text-5xl font-serif font-bold" style={{ color: "hsl(45 90% 55%)" }}>
          #{rank}
        </span>
      </motion.div>

      <motion.p
        className="mt-2 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
        style={{ color: "hsl(45 90% 55%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        ⚔️ COMPITE AHORA ⚔️
      </motion.p>
    </motion.button>
  );
}
