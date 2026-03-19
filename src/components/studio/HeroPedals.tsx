import { motion } from "framer-motion";

interface Props {
  activeEffects: string[];
  onClick: () => void;
}

const PEDALS = [
  { id: "reverb", label: "REVERB", color: "hsl(210 80% 55%)", emoji: "🌊" },
  { id: "delay", label: "DELAY", color: "hsl(275 85% 60%)", emoji: "🔁" },
  { id: "chorus", label: "CHORUS", color: "hsl(160 60% 50%)", emoji: "👥" },
  { id: "dist", label: "DIST", color: "hsl(0 70% 55%)", emoji: "⚡" },
];

export function HeroPedals({ activeEffects, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex flex-col items-center cursor-pointer z-10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{ width: 300, height: 200 }}
        animate={{
          boxShadow: [
            "0 0 40px 15px hsl(275 85% 60% / 0.12)",
            "0 0 70px 30px hsl(275 85% 60% / 0.2)",
            "0 0 40px 15px hsl(275 85% 60% / 0.12)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Pedal board */}
      <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4">
        {PEDALS.map((pedal, i) => {
          const isOn = activeEffects.includes(pedal.id);
          return (
            <motion.div
              key={pedal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-24 h-28 md:w-28 md:h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 relative"
              style={{
                background: isOn ? `${pedal.color}15` : "hsl(0 0% 8%)",
                borderColor: isOn ? pedal.color : "hsl(0 0% 20%)",
              }}
            >
              {/* LED */}
              <motion.div
                className="w-3 h-3 rounded-full absolute top-2 right-2"
                style={{ background: isOn ? pedal.color : "hsl(0 0% 20%)" }}
                animate={isOn ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-2xl">{pedal.emoji}</span>
              <span className="text-[9px] font-bold tracking-wider" style={{ color: isOn ? pedal.color : "hsl(0 0% 40%)" }}>
                {pedal.label}
              </span>
              {/* Stomp button */}
              <div
                className="w-12 h-4 rounded-full border"
                style={{
                  background: isOn ? `${pedal.color}30` : "hsl(0 0% 12%)",
                  borderColor: isOn ? pedal.color : "hsl(0 0% 25%)",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="mt-6 text-lg md:text-2xl font-bold uppercase tracking-[0.2em] neon-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🎸 EFECTOS 🎸
      </motion.p>
    </motion.button>
  );
}
