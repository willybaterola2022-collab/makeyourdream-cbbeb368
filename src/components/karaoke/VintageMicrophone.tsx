import { motion } from "framer-motion";

interface Props {
  isActive: boolean;
  volume: number;
  onClick: () => void;
  state: "idle" | "recording" | "finished";
}

export default function VintageMicrophone({ isActive, volume, onClick, state }: Props) {
  const pulseScale = isActive ? 1 + (volume / 100) * 0.15 : 1;
  const glowIntensity = isActive ? Math.max(20, volume * 0.8) : 0;

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Concentric sound rings */}
      {isActive && (
        <>
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-primary/20"
              initial={{ width: 80, height: 80, opacity: 0.6 }}
              animate={{
                width: [80, 80 + ring * 60],
                height: [80, 80 + ring * 60],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: ring * 0.4,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          boxShadow: isActive
            ? `0 0 ${glowIntensity}px ${glowIntensity / 2}px hsl(46 65% 52% / 0.3)`
            : "0 0 0px 0px hsl(46 65% 52% / 0)",
        }}
        style={{ width: 120, height: 120 }}
        transition={{ duration: 0.1 }}
      />

      {/* Main microphone button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: pulseScale }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative z-10 flex flex-col items-center justify-center"
        aria-label={state === "idle" ? "Empezar a cantar" : state === "recording" ? "Parar" : "Reiniciar"}
      >
        {/* Mic body */}
        <div className="relative">
          {/* Head / grille */}
          <motion.div
            className="w-20 h-24 rounded-t-full border-2 border-primary/60 flex items-center justify-center overflow-hidden"
            style={{
              background: isActive
                ? `radial-gradient(ellipse at center, hsl(46 65% 52% / 0.25), hsl(0 0% 10% / 0.9))`
                : `radial-gradient(ellipse at center, hsl(0 0% 18%), hsl(0 0% 8%))`,
            }}
            animate={{
              borderColor: isActive
                ? `hsl(46 65% ${52 + (volume / 100) * 20}%)`
                : "hsl(0 0% 30%)",
            }}
            transition={{ duration: 0.1 }}
          >
            {/* Grille lines */}
            <div className="absolute inset-3 flex flex-col gap-[3px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-full"
                  style={{ height: 2 }}
                  animate={{
                    backgroundColor: isActive && volume > 10
                      ? `hsl(46 65% ${40 + (volume / 100) * 30}%)`
                      : "hsl(0 0% 25%)",
                    scaleX: isActive ? 0.7 + (volume / 100) * 0.3 : 0.7,
                  }}
                  transition={{ duration: 0.05, delay: i * 0.01 }}
                />
              ))}
            </div>

            {/* Center dot / on indicator */}
            {isActive && (
              <motion.div
                className="absolute bottom-2 w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Neck ring */}
          <div className="mx-auto w-10 h-3 bg-gradient-to-b from-primary/40 to-primary/20 rounded-b-md" />

          {/* Stem */}
          <div className="mx-auto w-3 h-8 bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10 rounded-b-full" />

          {/* Base */}
          <div className="mx-auto w-14 h-2 bg-muted-foreground/20 rounded-full" />
        </div>
      </motion.button>

      {/* Label */}
      <motion.p
        className="absolute -bottom-2 text-xs text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {state === "idle" && "Toca para cantar"}
        {state === "recording" && "Toca para parar"}
        {state === "finished" && "Toca para reiniciar"}
      </motion.p>
    </div>
  );
}
