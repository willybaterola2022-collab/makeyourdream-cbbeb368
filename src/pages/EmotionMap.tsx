import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Heart, Smile, Flame, Cloud, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMicrophone } from "@/hooks/useMicrophone";

interface Emotion {
  label: string;
  emoji: string;
  value: number;
  color: string;
  icon: typeof Heart;
}

const EMOTIONS: Emotion[] = [
  { label: "Melancolía", emoji: "😢", value: 72, color: "bg-blue-500", icon: Cloud },
  { label: "Poder", emoji: "💪", value: 58, color: "bg-primary", icon: Flame },
  { label: "Ternura", emoji: "🥰", value: 45, color: "bg-pink-500", icon: Heart },
  { label: "Alegría", emoji: "😄", value: 35, color: "bg-emerald-500", icon: Smile },
  { label: "Rabia", emoji: "🔥", value: 20, color: "bg-red-500", icon: Zap },
];

const TIPS = [
  "Tu verso suena 72% melancólico — perfecto para baladas",
  "El coro pierde emoción. Prueba con más aire y dinámica",
  "Tienes un pico de poder en el puente — ¡mantén esa energía!",
  "Agrega vibrato sutil en las notas largas para más ternura",
];

export default function EmotionMap() {
  const { isListening, requestMic, stopMic } = useMicrophone();
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (isListening) {
      stopMic();
      setAnalyzed(true);
    } else {
      setAnalyzed(false);
      await requestMic();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Emotion Map</h1>
        <p className="text-muted-foreground mt-1">No solo técnica — analiza la emoción de tu canto</p>
      </div>

      {/* Record */}
      <Card className="p-6 bg-card border-border/40 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {isListening ? "Cantando... detectando emociones" : "Canta un fragmento para analizar"}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${
            isListening ? "bg-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.5)]" : "stage-gradient"
          }`}
        >
          <Mic className={`h-8 w-8 ${isListening ? "text-destructive-foreground" : "text-primary-foreground"}`} />
        </motion.button>
      </Card>

      {/* Emotion Results */}
      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Radial summary */}
          <Card className="p-5 bg-card border-border/40">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Mapa emocional
            </h2>
            <div className="space-y-4">
              {EMOTIONS.map((e, i) => (
                <motion.div key={e.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">{e.emoji}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{e.label}</span>
                    <span className="text-sm font-bold text-foreground">{e.value}%</span>
                  </div>
                  <Progress value={e.value} className="h-2" />
                </motion.div>
              ))}
            </div>
          </Card>

          {/* AI Tips */}
          <Card className="p-5 bg-card border-primary/20">
            <h3 className="text-sm font-semibold text-foreground mb-3">💡 Feedback de la IA</h3>
            <div className="space-y-2">
              {TIPS.map((tip, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="text-sm text-muted-foreground"
                >
                  • {tip}
                </motion.p>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
