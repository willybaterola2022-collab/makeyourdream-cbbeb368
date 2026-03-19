import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface RoomConfig {
  gradient: string;
  accentHsl: string;
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  karaoke: {
    gradient: "radial-gradient(ellipse at 50% 0%, hsl(275 85% 18% / 0.5) 0%, hsl(0 0% 4%) 70%)",
    accentHsl: "275 85% 60%",
  },
  warmup: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(30 80% 20% / 0.4) 0%, hsl(15 60% 12% / 0.2) 40%, hsl(0 0% 4%) 75%)",
    accentHsl: "30 80% 55%",
  },
  breath: {
    gradient: "radial-gradient(ellipse at 50% 30%, hsl(210 80% 18% / 0.5) 0%, hsl(220 60% 8% / 0.3) 50%, hsl(0 0% 4%) 80%)",
    accentHsl: "210 80% 55%",
  },
  pitch: {
    gradient: "radial-gradient(ellipse at 50% 10%, hsl(45 80% 18% / 0.4) 0%, hsl(275 40% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "45 80% 60%",
  },
  loop: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(0 70% 18% / 0.4) 0%, hsl(275 40% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "0 70% 55%",
  },
  sketch: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(150 50% 15% / 0.4) 0%, hsl(160 30% 8% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "150 50% 55%",
  },
  diagnostico: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(140 80% 15% / 0.5) 0%, hsl(140 60% 5% / 0.3) 50%, hsl(0 0% 4%) 80%)",
    accentHsl: "140 80% 50%",
  },
  emotion: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(320 60% 18% / 0.4) 0%, hsl(280 40% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "320 60% 55%",
  },
  challenges: {
    gradient: "radial-gradient(ellipse at 50% 10%, hsl(45 90% 25% / 0.35) 0%, hsl(30 60% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "45 90% 55%",
  },
  vocalfx: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(275 85% 20% / 0.5) 0%, hsl(185 60% 12% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "275 85% 60%",
  },
  duelos: {
    gradient: "radial-gradient(ellipse at 50% 20%, hsl(0 80% 20% / 0.4) 0%, hsl(30 60% 12% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "0 80% 55%",
  },
  collab: {
    gradient: "radial-gradient(ellipse at 50% 30%, hsl(260 60% 18% / 0.4) 0%, hsl(275 40% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "260 60% 55%",
  },
  exercises: {
    gradient: "radial-gradient(ellipse at 50% 15%, hsl(15 80% 20% / 0.4) 0%, hsl(30 50% 10% / 0.2) 50%, hsl(0 0% 4%) 75%)",
    accentHsl: "15 80% 55%",
  },
};

interface StudioRoomProps {
  roomId: keyof typeof ROOM_CONFIGS;
  heroContent: ReactNode;
  children: ReactNode;
  heroHeight?: string;
}

export function StudioRoom({ roomId, heroContent, children, heroHeight = "min-h-[55vh] md:min-h-[60vh]" }: StudioRoomProps) {
  const config = ROOM_CONFIGS[roomId] || ROOM_CONFIGS.karaoke;

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: config.gradient }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Light flash on entry */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        style={{ background: `radial-gradient(ellipse at 50% 30%, hsl(${config.accentHsl} / 0.15), transparent 60%)` }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />

      {/* Scroll 1 — Hero */}
      <section className={`${heroHeight} flex flex-col items-center justify-center relative overflow-hidden px-4`}>
        {/* Ambient spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] md:w-[800px] md:h-[500px] rounded-full opacity-25 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, hsl(${config.accentHsl} / 0.3), transparent 70%)` }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: `hsl(${config.accentHsl} / 0.4)`,
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 60}%`,
            }}
            animate={{ y: [-15, 15, -15], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
          />
        ))}

        {heroContent}
      </section>

      {/* Scroll 2 — Content */}
      <section className="flex-1 px-4 pb-24 space-y-6 max-w-4xl mx-auto w-full">
        {children}
      </section>
    </motion.div>
  );
}
