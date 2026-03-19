import { motion } from "framer-motion";

interface Props {
  isActive: boolean;
  volume: number;
  onClick: () => void;
  state: "idle" | "recording" | "finished";
}

export default function VintageMicrophone({ isActive, volume, onClick, state }: Props) {
  const pulseScale = isActive ? 1 + (volume / 100) * 0.12 : 1;
  const glowIntensity = isActive ? Math.max(25, volume * 0.9) : 0;

  return (
    <div className="relative flex flex-col items-center justify-center py-8 md:py-12">
      {/* Always-visible idle rings — soft when idle, intense when recording */}
      {[1, 2, 3, 4].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            border: `1px solid`,
            borderColor: isActive
              ? `hsl(275 85% 60% / ${0.3 - ring * 0.05})`
              : `hsl(185 90% 55% / ${0.15 - ring * 0.03})`,
          }}
          initial={{ width: 100, height: 100, opacity: 0 }}
          animate={{
            width: [100, 100 + ring * 70],
            height: [100, 100 + ring * 70],
            opacity: isActive ? [0.5, 0] : [0.25, 0],
          }}
          transition={{
            duration: isActive ? 1.5 : 3,
            repeat: Infinity,
            delay: ring * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Active glow halo */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          boxShadow: isActive
            ? `0 0 ${glowIntensity}px ${glowIntensity / 2}px hsl(275 85% 60% / 0.35), 0 0 ${glowIntensity * 0.7}px ${glowIntensity * 0.3}px hsl(185 90% 55% / 0.2)`
            : "0 0 20px 8px hsl(275 85% 60% / 0.08), 0 0 40px 15px hsl(185 90% 55% / 0.05)",
        }}
        style={{ width: 160, height: 160 }}
        transition={{ duration: 0.15 }}
      />

      {/* Idle breathing glow */}
      {!isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 170, height: 170 }}
          animate={{
            boxShadow: [
              "0 0 30px 10px hsl(275 85% 60% / 0.06), 0 0 60px 20px hsl(185 90% 55% / 0.04)",
              "0 0 50px 18px hsl(275 85% 60% / 0.15), 0 0 80px 30px hsl(185 90% 55% / 0.1)",
              "0 0 30px 10px hsl(275 85% 60% / 0.06), 0 0 60px 20px hsl(185 90% 55% / 0.04)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main microphone button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        animate={{ scale: pulseScale }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="relative z-10 flex flex-col items-center justify-center cursor-pointer"
        aria-label={state === "idle" ? "Empezar a cantar" : state === "recording" ? "Parar" : "Reiniciar"}
      >
        {/* Mic body */}
        <div className="relative">
          {/* Head / grille — MUCH BIGGER */}
          <motion.div
            className="w-28 h-36 md:w-36 md:h-44 rounded-t-full border-2 flex items-center justify-center overflow-hidden"
            style={{
              background: isActive
                ? `radial-gradient(ellipse at center, hsl(275 85% 60% / 0.2), hsl(185 90% 55% / 0.08), hsl(0 0% 8% / 0.95))`
                : `radial-gradient(ellipse at center, hsl(275 85% 25% / 0.3), hsl(0 0% 8%))`,
              borderColor: isActive
                ? `hsl(275 85% 60%)`
                : `hsl(275 85% 40% / 0.5)`,
            }}
            animate={{
              borderColor: isActive
                ? [`hsl(275 85% 60%)`, `hsl(185 90% 55%)`, `hsl(275 85% 60%)`]
                : [`hsl(275 85% 35% / 0.4)`, `hsl(185 90% 40% / 0.4)`, `hsl(275 85% 35% / 0.4)`],
            }}
            transition={{ duration: isActive ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Grille lines */}
            <div className="absolute inset-4 md:inset-5 flex flex-col gap-[4px] md:gap-[5px]">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-full"
                  style={{ height: 2.5 }}
                  animate={{
                    backgroundColor: isActive && volume > 10
                      ? `hsl(${275 - (i * 8)} ${85 - i * 2}% ${50 + (volume / 100) * 30}%)`
                      : `hsl(275 40% ${25 + i * 2}%)`,
                    scaleX: isActive ? 0.6 + (volume / 100) * 0.4 : 0.65,
                  }}
                  transition={{ duration: 0.06, delay: i * 0.012 }}
                />
              ))}
            </div>

            {/* Center recording indicator */}
            {isActive && (
              <motion.div
                className="absolute bottom-3 w-3 h-3 rounded-full bg-destructive"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Neck ring */}
          <div className="mx-auto w-14 md:w-16 h-3 md:h-4 rounded-b-md stage-gradient opacity-70" />

          {/* Stem */}
          <div className="mx-auto w-4 md:w-5 h-10 md:h-12 bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10 rounded-b-full" />

          {/* Base */}
          <div className="mx-auto w-20 md:w-24 h-2.5 bg-muted-foreground/20 rounded-full" />
        </div>
      </motion.button>

      {/* Label — BIG and BRIGHT */}
      <motion.div
        className="absolute -bottom-3 md:-bottom-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {state === "idle" && (
          <motion.p
            className="text-sm md:text-base font-bold uppercase tracking-[0.2em] neon-text"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ⚡ TOCA Y CANTA ⚡
          </motion.p>
        )}
        {state === "recording" && (
          <motion.p
            className="text-sm font-semibold uppercase tracking-wider text-destructive"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ● GRABANDO — TOCA PARA PARAR
          </motion.p>
        )}
        {state === "finished" && (
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Toca para reiniciar
          </p>
        )}
      </motion.div>
    </div>
  );
}
