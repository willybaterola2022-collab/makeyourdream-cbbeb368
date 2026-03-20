import { motion } from "framer-motion";
import { Play, Pause, Save, Share2, RotateCcw, Square } from "lucide-react";

interface Props {
  isActive: boolean;
  volume: number;
  onClick: () => void;
  state: "idle" | "recording" | "finished";
  size?: "hero" | "section";
  onPlay?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onRetry?: () => void;
  isPlaying?: boolean;
}

export default function VintageMicrophone({
  isActive,
  volume,
  onClick,
  state,
  size = "section",
  onPlay,
  onSave,
  onShare,
  onRetry,
  isPlaying,
}: Props) {
  const isHero = size === "hero";
  const pulseScale = isActive ? 1 + (volume / 100) * 0.15 : 1;
  const glowIntensity = isActive ? Math.max(35, volume * 1.2) : 0;

  const ringCount = isHero ? 8 : 6;
  const ringSpacing = isHero ? 80 : 65;

  return (
    <div className={`relative flex flex-col items-center justify-center ${isHero ? "py-6 md:py-10" : "py-6 md:py-8"}`}>
      {/* Expanding rings — more, faster, brighter */}
      {Array.from({ length: ringCount }).map((_, ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            border: `1.5px solid`,
            borderColor: isActive
              ? `hsl(275 85% 60% / ${0.45 - ring * 0.04})`
              : `hsl(185 90% 55% / ${0.3 - ring * 0.03})`,
          }}
          initial={{ width: 120, height: 120, opacity: 0 }}
          animate={{
            width: [120, 120 + ring * ringSpacing],
            height: [120, 120 + ring * ringSpacing],
            opacity: isActive ? [0.7, 0] : [0.4, 0],
          }}
          transition={{
            duration: isActive ? 1.0 : 1.8,
            repeat: Infinity,
            delay: ring * 0.3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Active glow halo */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          boxShadow: isActive
            ? `0 0 ${glowIntensity * 1.5}px ${glowIntensity * 0.7}px hsl(275 85% 60% / 0.4), 0 0 ${glowIntensity}px ${glowIntensity * 0.4}px hsl(185 90% 55% / 0.25)`
            : "0 0 40px 16px hsl(275 85% 60% / 0.15), 0 0 80px 30px hsl(185 90% 55% / 0.1)",
        }}
        style={{ width: isHero ? 280 : 200, height: isHero ? 280 : 200 }}
        transition={{ duration: 0.12 }}
      />

      {/* Idle breathing glow — INTENSE double layer */}
      {!isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: isHero ? 340 : 240, height: isHero ? 340 : 240 }}
          animate={{
            boxShadow: [
              "0 0 50px 20px hsl(275 85% 60% / 0.15), 0 0 100px 40px hsl(185 90% 55% / 0.1)",
              "0 0 90px 40px hsl(275 85% 60% / 0.45), 0 0 150px 65px hsl(185 90% 55% / 0.25)",
              "0 0 50px 20px hsl(275 85% 60% / 0.15), 0 0 100px 40px hsl(185 90% 55% / 0.1)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main microphone button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        animate={{
          scale: isActive ? pulseScale : [1, 1.04, 1],
        }}
        transition={
          isActive
            ? { type: "spring", stiffness: 220, damping: 16 }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative z-10 flex flex-col items-center justify-center cursor-pointer"
        aria-label={state === "idle" ? "Empezar a cantar" : state === "recording" ? "Parar" : "Reiniciar"}
      >
        {/* Mic body */}
        <div className="relative">
          {/* Head / grille — MASSIVE */}
          <motion.div
            className={`${
              isHero
                ? "w-56 h-72 md:w-72 md:h-96"
                : "w-40 h-48 md:w-48 md:h-60"
            } rounded-t-full border-2 flex items-center justify-center overflow-hidden`}
            style={{
              background: isActive
                ? `radial-gradient(ellipse at center, hsl(275 85% 60% / 0.25), hsl(185 90% 55% / 0.1), hsl(0 0% 6% / 0.95))`
                : `radial-gradient(ellipse at center, hsl(275 85% 25% / 0.35), hsl(0 0% 6%))`,
              borderColor: isActive ? `hsl(275 85% 60%)` : `hsl(275 85% 40% / 0.5)`,
            }}
            animate={{
              borderColor: isActive
                ? [`hsl(275 85% 60%)`, `hsl(185 90% 55%)`, `hsl(275 85% 60%)`]
                : [`hsl(275 85% 35% / 0.5)`, `hsl(185 90% 40% / 0.5)`, `hsl(275 85% 35% / 0.5)`],
            }}
            transition={{ duration: isActive ? 1.2 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Grille lines — flickering in idle */}
            <div className={`absolute ${isHero ? "inset-8 md:inset-10" : "inset-5 md:inset-7"} flex flex-col gap-[5px] md:gap-[6px]`}>
              {Array.from({ length: isHero ? 16 : 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-full"
                  style={{ height: isHero ? 4 : 3 }}
                  animate={
                    isActive && volume > 10
                      ? {
                          backgroundColor: `hsl(${275 - i * 6} ${85 - i}% ${50 + (volume / 100) * 35}%)`,
                          scaleX: 0.55 + (volume / 100) * 0.45,
                        }
                      : {
                          backgroundColor: [
                            `hsl(275 40% ${20 + i * 2}%)`,
                            `hsl(275 50% ${30 + i * 3}%)`,
                            `hsl(275 40% ${20 + i * 2}%)`,
                          ],
                          scaleX: [0.5, 0.7, 0.5],
                        }
                  }
                  transition={
                    isActive
                      ? { duration: 0.05, delay: i * 0.01 }
                      : { duration: 1.5, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }
                  }
                />
              ))}
            </div>

            {/* Center recording indicator */}
            {isActive && (
              <motion.div
                className="absolute bottom-4 md:bottom-5 flex items-center gap-2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Square className="h-4 w-4 md:h-5 md:w-5 text-destructive fill-destructive" />
              </motion.div>
            )}
          </motion.div>

          {/* Neck ring */}
          <div className={`mx-auto ${isHero ? "w-24 md:w-28 h-5 md:h-6" : "w-18 md:w-22 h-3.5 md:h-4"} rounded-b-md stage-gradient opacity-80`} />

          {/* Stem */}
          <div className={`mx-auto ${isHero ? "w-6 md:w-7 h-16 md:h-20" : "w-4 md:w-5 h-11 md:h-14"} bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10 rounded-b-full`} />

          {/* Base */}
          <div className={`mx-auto ${isHero ? "w-32 md:w-36 h-3.5" : "w-22 md:w-26 h-2.5"} bg-muted-foreground/20 rounded-full`} />
        </div>
      </motion.button>

      {/* Labels & post-recording controls */}
      <motion.div
        className={`${isHero ? "mt-6 md:mt-8" : "mt-4 md:mt-5"} text-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {state === "idle" && (
          <motion.p
            className={`${isHero ? "text-2xl md:text-4xl" : "text-lg md:text-2xl"} font-bold uppercase tracking-[0.25em] neon-text`}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            ⚡ TOCA Y CANTA ⚡
          </motion.p>
        )}
        {state === "recording" && (
          <motion.div className="flex items-center justify-center gap-3">
            <motion.div
              className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <p className={`${isHero ? "text-lg md:text-2xl" : "text-sm md:text-base"} font-bold uppercase tracking-widest text-destructive`}>
              GRABANDO
            </p>
          </motion.div>
        )}
        {state === "finished" && (
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {onPlay && (
              <button
                onClick={(e) => { e.stopPropagation(); onPlay(); }}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full glass-card flex items-center justify-center hover:border-primary/40 transition-all group active:scale-95"
                aria-label="Escuchar"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 md:h-7 md:w-7 text-primary group-hover:scale-110 transition-transform" />
                ) : (
                  <Play className="h-6 w-6 md:h-7 md:w-7 text-primary ml-0.5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}
            {onSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onSave(); }}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full glass-card flex items-center justify-center hover:border-secondary/40 transition-all group active:scale-95"
                aria-label="Guardar"
              >
                <Save className="h-6 w-6 md:h-7 md:w-7 text-secondary group-hover:scale-110 transition-transform" />
              </button>
            )}
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full glass-card flex items-center justify-center hover:border-primary/40 transition-all group active:scale-95"
                aria-label="Compartir"
              >
                <Share2 className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
              </button>
            )}
            {onRetry && (
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(); }}
                className="h-14 w-14 md:h-16 md:w-16 rounded-full glass-card flex items-center justify-center hover:border-primary/40 transition-all group active:scale-95"
                aria-label="Otra vez"
              >
                <RotateCcw className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
              </button>
            )}
            {!onPlay && !onSave && !onShare && !onRetry && (
              <p className={`${isHero ? "text-base" : "text-sm"} font-medium uppercase tracking-wider text-muted-foreground`}>
                Toca para reiniciar
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
