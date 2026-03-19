import { motion } from "framer-motion";

interface Props {
  layerCount: number;
  isRecording: boolean;
  onClick: () => void;
}

export function HeroMixer({ layerCount, isRecording, onClick }: Props) {
  const channels = Math.max(layerCount, 4);
  const channelColors = ["hsl(0 70% 55%)", "hsl(210 80% 55%)", "hsl(275 85% 60%)", "hsl(280 60% 55%)", "hsl(30 80% 55%)", "hsl(160 60% 50%)"];

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex flex-col items-center cursor-pointer z-10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 300, height: 200 }}
        animate={{
          boxShadow: isRecording
            ? ["0 0 60px 25px hsl(0 70% 50% / 0.4)", "0 0 90px 40px hsl(0 70% 50% / 0.3)", "0 0 60px 25px hsl(0 70% 50% / 0.4)"]
            : ["0 0 40px 15px hsl(0 70% 55% / 0.1)", "0 0 60px 25px hsl(0 70% 55% / 0.15)", "0 0 40px 15px hsl(0 70% 55% / 0.1)"],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Mixer console */}
      <div className="relative z-10 bg-card/80 border border-border/40 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
        <div className="flex gap-3 md:gap-5">
          {Array.from({ length: channels }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {/* LED */}
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: channelColors[i % channelColors.length] }}
                animate={i < layerCount ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.15 }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
              {/* Fader track */}
              <div className="w-3 md:w-4 h-28 md:h-36 rounded-full bg-muted/30 relative overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-full"
                  style={{ background: channelColors[i % channelColors.length] }}
                  animate={{ height: i < layerCount ? `${40 + Math.random() * 50}%` : "10%" }}
                  transition={{ duration: 0.5 }}
                />
                {/* Fader knob */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-5 md:w-6 h-3 rounded-sm bg-foreground/80"
                  style={{ bottom: i < layerCount ? `${30 + i * 10}%` : "5%" }}
                />
              </div>
              {/* Channel label */}
              <span className="text-[8px] font-bold text-muted-foreground uppercase">
                {i < layerCount ? `CH${i + 1}` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <motion.p
        className="mt-6 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
        style={{ color: isRecording ? "hsl(0 70% 55%)" : "hsl(0 70% 55%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isRecording ? "🔴 GRABANDO" : "🎛️ MEZCLA EN VIVO 🎛️"}
      </motion.p>
    </motion.button>
  );
}
