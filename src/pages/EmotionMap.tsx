import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";

interface Emotion { label: string; emoji: string; value: number; color: string; }

export default function EmotionMap() {
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode, isListening);
  const [analyzed, setAnalyzed] = useState(false);
  const [emotions, setEmotions] = useState<Emotion[]>([
    { label: "Melancolía", emoji: "😢", value: 0, color: "hsl(210 80% 55%)" },
    { label: "Poder", emoji: "💪", value: 0, color: "hsl(275 85% 60%)" },
    { label: "Ternura", emoji: "🥰", value: 0, color: "hsl(330 70% 55%)" },
    { label: "Alegría", emoji: "😄", value: 0, color: "hsl(160 70% 50%)" },
    { label: "Rabia", emoji: "🔥", value: 0, color: "hsl(0 70% 55%)" },
  ]);

  const volumeSamples = useRef<number[]>([]);
  const pitchSamples = useRef<number[]>([]);

  useEffect(() => {
    if (!isListening) return;
    volumeSamples.current.push(volume);
    if (pitch?.frequency) pitchSamples.current.push(pitch.frequency);
  }, [isListening, volume, pitch]);

  const handleAnalyze = async () => {
    if (isListening) {
      stopMic();
      // Analyze real data
      const vols = volumeSamples.current;
      const pitches = pitchSamples.current;
      const avgVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 50;
      const maxVol = vols.length ? Math.max(...vols) : 50;
      const avgPitch = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 300;

      // Heuristic emotion mapping based on volume + pitch
      const melancholy = Math.min(95, Math.max(10, 80 - avgVol * 0.5 + (avgPitch < 250 ? 20 : 0)));
      const power = Math.min(95, Math.max(10, avgVol * 0.8 + (maxVol > 60 ? 15 : 0)));
      const tenderness = Math.min(95, Math.max(10, 70 - Math.abs(avgVol - 40) * 1.5));
      const joy = Math.min(95, Math.max(10, avgPitch > 350 ? 60 + avgVol * 0.3 : 20 + avgVol * 0.2));
      const rage = Math.min(95, Math.max(10, maxVol > 70 ? maxVol * 0.8 : 10));

      setEmotions([
        { label: "Melancolía", emoji: "😢", value: Math.round(melancholy), color: "hsl(210 80% 55%)" },
        { label: "Poder", emoji: "💪", value: Math.round(power), color: "hsl(275 85% 60%)" },
        { label: "Ternura", emoji: "🥰", value: Math.round(tenderness), color: "hsl(330 70% 55%)" },
        { label: "Alegría", emoji: "😄", value: Math.round(joy), color: "hsl(160 70% 50%)" },
        { label: "Rabia", emoji: "🔥", value: Math.round(rage), color: "hsl(0 70% 55%)" },
      ]);
      setAnalyzed(true);
    } else {
      volumeSamples.current = [];
      pitchSamples.current = [];
      setAnalyzed(false);
      await requestMic();
    }
  };

  const dominantEmotion = emotions.reduce((max, e) => e.value > max.value ? e : max, emotions[0]);

  return (
    <StudioRoom
      roomId="emotion"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div className="relative">
            <div className="w-48 h-60 md:w-56 md:h-72 rounded-t-full border-2 overflow-hidden flex items-center justify-center"
              style={{ borderColor: "hsl(320 60% 40%)", background: "hsl(320 20% 6%)" }}>
              {analyzed ? (
                <motion.div className="absolute inset-4 rounded-t-full overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {emotions.map((e, i) => (
                    <motion.div key={e.label} className="absolute inset-0 rounded-t-full"
                      style={{ background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 8}%, ${e.color}${Math.round(e.value * 0.4).toString(16).padStart(2, '0')}, transparent 60%)` }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">{dominantEmotion.emoji}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div className="text-6xl"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  🪞
                </motion.div>
              )}
            </div>
            <div className="mx-auto w-32 md:w-40 h-3 bg-muted-foreground/20 rounded-b-lg" />
          </motion.div>

          <div className="mt-6">
            <StageButton
              variant={isListening ? "danger" : "scan"}
              icon={<Mic className="h-5 w-5" />}
              onClick={handleAnalyze}
            >
              {isListening ? "DETENER" : analyzed ? "REPETIR" : "ANALIZAR"}
            </StageButton>
          </div>
        </motion.div>
      }
    >
      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {emotions.sort((a, b) => b.value - a.value).map((e, i) => (
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

          <div className="glass-card p-4 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground">Tu voz transmite principalmente</p>
            <p className="text-xl font-serif font-bold text-foreground mt-1">{dominantEmotion.emoji} {dominantEmotion.label}</p>
          </div>
        </motion.div>
      )}
    </StudioRoom>
  );
}
