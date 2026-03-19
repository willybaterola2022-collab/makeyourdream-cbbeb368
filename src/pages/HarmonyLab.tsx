import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMicrophone } from "@/hooks/useMicrophone";

const STYLES = [
  { id: "gospel", label: "Gospel", emoji: "⛪" },
  { id: "barbershop", label: "Barbershop", emoji: "🎩" },
  { id: "kpop", label: "K-Pop", emoji: "🇰🇷" },
  { id: "classical", label: "Clásico", emoji: "🎻" },
];

const HARMONY_LINES = [
  { label: "Tu voz (Melodía)", color: "hsl(var(--primary))", offset: 0 },
  { label: "2da voz (IA)", color: "hsl(var(--secondary))", offset: 1 },
  { label: "3ra voz (IA)", color: "hsl(46, 80%, 70%)", offset: 2 },
];

export default function HarmonyLab() {
  const { isListening, waveformData, requestMic, stopMic } = useMicrophone();
  const [style, setStyle] = useState("gospel");
  const [harmoniesActive, setHarmoniesActive] = useState(true);

  const handleToggle = async () => {
    if (isListening) {
      stopMic();
    } else {
      await requestMic();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Harmony Lab</h1>
        <p className="text-muted-foreground mt-1">Canta y la IA genera armonías en tiempo real</p>
      </div>

      {/* Style Selector */}
      <div className="flex gap-2 flex-wrap">
        {STYLES.map((s) => (
          <Button
            key={s.id}
            variant={style === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => setStyle(s.id)}
            className={style === s.id ? "stage-gradient text-primary-foreground" : ""}
          >
            {s.emoji} {s.label}
          </Button>
        ))}
      </div>

      {/* Harmony Visualizer */}
      <Card className="p-6 bg-card border-border/40 min-h-[200px] relative overflow-hidden">
        {isListening ? (
          <div className="space-y-6">
            {HARMONY_LINES.map((line, idx) => (
              <div key={line.label}>
                <p className="text-xs text-muted-foreground mb-1">{line.label}</p>
                <div className="flex items-end gap-[2px] h-12">
                  {waveformData.slice(0, 48).map((v, i) => {
                    const shifted = Math.max(0, Math.min(100, v + (idx * 15 - 10) * Math.sin(i * 0.3)));
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ backgroundColor: line.color, opacity: idx === 0 || harmoniesActive ? 0.8 : 0.2 }}
                        animate={{ height: `${shifted}%` }}
                        transition={{ duration: 0.05 }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Music2 className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Pulsa el micrófono para empezar</p>
          </div>
        )}
      </Card>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className={`h-16 w-16 rounded-full flex items-center justify-center ${
            isListening ? "bg-destructive" : "stage-gradient"
          }`}
        >
          <Mic className={`h-7 w-7 ${isListening ? "text-destructive-foreground" : "text-primary-foreground"}`} />
        </motion.button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center flex-wrap">
        {HARMONY_LINES.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
