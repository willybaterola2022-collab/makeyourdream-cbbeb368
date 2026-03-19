import { useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { StudioRoom } from "@/components/studio/StudioRoom";

interface Emotion { label: string; emoji: string; value: number; color: string; }

const EMOTIONS: Emotion[] = [
  { label: "Melancolía", emoji: "😢", value: 72, color: "hsl(210 80% 55%)" },
  { label: "Poder", emoji: "💪", value: 58, color: "hsl(275 85% 60%)" },
  { label: "Ternura", emoji: "🥰", value: 45, color: "hsl(330 70% 55%)" },
  { label: "Alegría", emoji: "😄", value: 35, color: "hsl(160 70% 50%)" },
  { label: "Rabia", emoji: "🔥", value: 20, color: "hsl(0 70% 55%)" },
];

const TIPS = [
  "Tu verso suena 72% melancólico — perfecto para baladas",
  "El coro pierde emoción. Prueba más aire y dinámica",
  "Pico de poder en el puente — ¡mantén esa energía!",
  "Agrega vibrato en notas largas para más ternura",
];

export default function EmotionMap() {
  const { isListening, requestMic, stopMic } = useMicrophone();
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (isListening) { stopMic(); setAnalyzed(true); }
    else { setAnalyzed(false); await requestMic(); }
  };

  return (
    <StudioRoom
      roomId="emotion"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {/* Mirror hero */}
          <motion.div className="relative">
            {/* Mirror frame */}
            <div className="w-48 h-60 md:w-56 md:h-72 rounded-t-full border-2 overflow-hidden flex items-center justify-center"
              style={{ borderColor: "hsl(320 60% 40%)", background: "hsl(320 20% 6%)" }}>
              {/* Emotional aura inside mirror */}
              {analyzed ? (
                <motion.div className="absolute inset-4 rounded-t-full overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {EMOTIONS.map((e, i) => (
                    <motion.div key={e.label} className="absolute inset-0 rounded-t-full"
                      style={{ background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 8}%, ${e.color}${Math.round(e.value * 0.4)}, transparent 60%)` }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
                  ))}
                </motion.div>
              ) : (
                <motion.div className="text-6xl"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  🪞
                </motion.div>
              )}
            </div>
            {/* Mirror base */}
            <div className="mx-auto w-32 md:w-40 h-3 bg-muted-foreground/20 rounded-b-lg" />
          </motion.div>

          <motion.button whileTap={{ scale: 0.95 }} onClick={handleAnalyze}
            className={`mt-6 h-14 w-14 rounded-full flex items-center justify-center ${
              isListening ? "bg-destructive shadow-[0_0_25px_hsl(var(--destructive)/0.5)]" : "stage-gradient shadow-[0_0_25px_hsl(var(--primary)/0.3)]"
            }`}>
            <Mic className={`h-6 w-6 ${isListening ? "text-destructive-foreground" : "text-primary-foreground"}`} />
          </motion.button>

          <motion.p className="mt-3 text-lg font-bold uppercase tracking-[0.2em]"
            style={{ color: "hsl(320 60% 55%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}>
            {isListening ? "🎙️ CANTANDO..." : "🪞 REFLEJA TU EMOCIÓN 🪞"}
          </motion.p>
        </motion.div>
      }
    >
      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Emotion bars */}
          {EMOTIONS.map((e, i) => (
            <motion.div key={e.label} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-4 flex items-center gap-3">
              <span className="text-2xl">{e.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-foreground">{e.label}</span>
                  <span className="text-xs font-bold" style={{ color: e.color }}>{e.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: e.color }}
                    initial={{ width: 0 }} animate={{ width: `${e.value}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Tips */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <span className="text-sm font-bold text-foreground">💡 IA Feedback</span>
            {TIPS.map((tip, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                className="text-xs text-muted-foreground">• {tip}</motion.p>
            ))}
          </div>
        </motion.div>
      )}
    </StudioRoom>
  );
}
