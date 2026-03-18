import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

const exercises = [
  { id: "basic", name: "Diafragma básico", inhale: 4, hold: 2, exhale: 4, pause: 2, desc: "Respiración profunda con soporte abdominal" },
  { id: "478", name: "4-7-8 Relajación", inhale: 4, hold: 7, exhale: 8, pause: 2, desc: "Técnica de relajación y control de aire" },
  { id: "belting", name: "Soporte para belting", inhale: 3, hold: 1, exhale: 10, pause: 1, desc: "Exhalar lento y controlado para notas sostenidas" },
];

type Phase = "inhale" | "hold" | "exhale" | "pause";
const phaseLabels: Record<Phase, string> = { inhale: "Inhala", hold: "Sostén", exhale: "Exhala", pause: "Pausa" };
const phaseColors: Record<Phase, string> = { inhale: "text-emerald-400", hold: "text-primary", exhale: "text-sky-400", pause: "text-muted-foreground" };

const BreathTrainer = () => {
  const [selected, setSelected] = useState(exercises[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);

  const phaseDuration = phase === "inhale" ? selected.inhale : phase === "hold" ? selected.hold : phase === "exhale" ? selected.exhale : selected.pause;

  const nextPhase = useCallback(() => {
    setPhase((p) => {
      if (p === "inhale") return "hold";
      if (p === "hold") return "exhale";
      if (p === "exhale") { return "pause"; }
      setReps((r) => r + 1);
      return "inhale";
    });
    setTimer(0);
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= phaseDuration) {
          nextPhase();
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phaseDuration, nextPhase]);

  const reset = () => { setRunning(false); setPhase("inhale"); setTimer(0); setReps(0); };

  const circleScale = phase === "inhale" ? 1 + (timer / phaseDuration) * 0.5 : phase === "exhale" ? 1.5 - (timer / phaseDuration) * 0.5 : phase === "hold" ? 1.5 : 1;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <StaggerContainer>
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wind className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Breath Trainer</h1>
              <p className="text-sm text-muted-foreground">Entrena tu soporte de aire y diafragma</p>
            </div>
          </div>
        </StaggerItem>

        {/* Exercise selector */}
        <StaggerItem>
          <div className="flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => { setSelected(ex); reset(); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selected.id === ex.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </StaggerItem>

        {/* Breathing circle */}
        <StaggerItem>
          <Card className="overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[350px]">
              <div className="relative flex items-center justify-center mb-8">
                {/* Outer ring */}
                <motion.div
                  animate={{ scale: circleScale, opacity: 0.15 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute h-48 w-48 rounded-full bg-primary"
                />
                <motion.div
                  animate={{ scale: circleScale, opacity: 0.3 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute h-36 w-36 rounded-full bg-primary"
                />
                {/* Inner circle */}
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-28 w-28 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${phaseColors[phase]}`}>{phaseDuration - timer}</p>
                    <p className={`text-xs font-medium ${phaseColors[phase]}`}>{phaseLabels[phase]}</p>
                  </div>
                </motion.div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
                <Button size="lg" onClick={() => setRunning(!running)} className="gap-2 px-8">
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pausar" : "Iniciar"}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                <span>Repeticiones: <strong className="text-foreground">{reps}</strong></span>
                <span>Patrón: <strong className="text-foreground">{selected.inhale}-{selected.hold}-{selected.exhale}-{selected.pause}</strong></span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Exercise info */}
        <StaggerItem>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{selected.desc}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-[10px]">Inhala {selected.inhale}s</Badge>
                <Badge variant="outline" className="text-[10px]">Sostén {selected.hold}s</Badge>
                <Badge variant="outline" className="text-[10px]">Exhala {selected.exhale}s</Badge>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default BreathTrainer;
