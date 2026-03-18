import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Thermometer, Play, CheckCircle2, Circle, Clock, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";

interface Exercise {
  name: string;
  duration: number;
  desc: string;
}

const routines: Record<number, Exercise[]> = {
  3: [
    { name: "Lip Trills", duration: 40, desc: "Vibración de labios con escala ascendente" },
    { name: "Sirenas suaves", duration: 50, desc: "Glissando de grave a agudo y vuelta" },
    { name: "Escalas en 'Ma'", duration: 50, desc: "Escala mayor en Do con sílaba Ma" },
  ],
  5: [
    { name: "Lip Trills", duration: 45, desc: "Vibración de labios con escala" },
    { name: "Humming", duration: 40, desc: "Tarareo con resonancia nasal" },
    { name: "Sirenas amplias", duration: 50, desc: "Rango completo, suave" },
    { name: "Escalas en 'Ni'", duration: 60, desc: "Escala mayor con Ni-na-no" },
    { name: "Staccato en 'Ha'", duration: 55, desc: "Notas cortas con soporte" },
  ],
  10: [
    { name: "Respiración profunda", duration: 60, desc: "4-7-8 breathing x5" },
    { name: "Lip Trills", duration: 60, desc: "Escala cromática ascendente" },
    { name: "Humming resonante", duration: 50, desc: "Tarareo en diferentes vocales" },
    { name: "Sirenas completas", duration: 70, desc: "Del grave más bajo al agudo" },
    { name: "Escalas mayores", duration: 60, desc: "Do, Re, Mi bemol mayor" },
    { name: "Arpegios", duration: 60, desc: "1-3-5-8 en varias tonalidades" },
    { name: "Staccato dinámico", duration: 50, desc: "Piano a forte en Ha-Ha-Ha" },
    { name: "Legato largo", duration: 70, desc: "Frases largas conectadas" },
    { name: "Riffs simples", duration: 60, desc: "Ornamentación básica en escala" },
    { name: "Cool down", duration: 60, desc: "Sirenas descendentes suaves" },
  ],
};

const WarmUp = () => {
  const { playNote, playSuccess } = useAudioEngine();
  const [duration, setDuration] = useState(5);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const exercises = routines[duration];
  const allDone = completed.size === exercises.length;

  useEffect(() => {
    if (!running || activeIdx < 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= exercises[activeIdx].duration) {
          setCompleted((c) => new Set(c).add(activeIdx));
          setRunning(false);
          // Play success chord on exercise completion
          playSuccess();
          if (activeIdx < exercises.length - 1) {
            setActiveIdx(activeIdx + 1);
            return 0;
          }
          return t + 1;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, activeIdx, exercises, playSuccess]);

  const start = () => {
    if (activeIdx < 0) setActiveIdx(0);
    setRunning(true);
    // Play start tone (C4)
    playNote(noteToFreq("C4"), 0.5);
  };

  const resetAll = () => { setActiveIdx(-1); setTimer(0); setRunning(false); setCompleted(new Set()); };

  const progress = exercises.length > 0 ? (completed.size / exercises.length) * 100 : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <StaggerContainer>
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Thermometer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Vocal Warm-Up</h1>
              <p className="text-sm text-muted-foreground">Calienta tu voz antes de cantar</p>
            </div>
          </div>
        </StaggerItem>

        {/* Duration selector */}
        <StaggerItem>
          <div className="flex gap-2">
            {[3, 5, 10].map((d) => (
              <button key={d} onClick={() => { setDuration(d); resetAll(); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${duration === d ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}>
                {d} min
              </button>
            ))}
          </div>
        </StaggerItem>

        {/* Progress */}
        <StaggerItem>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completed.size} de {exercises.length} ejercicios</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </StaggerItem>

        {/* Exercise list */}
        {exercises.map((ex, i) => {
          const isDone = completed.has(i);
          const isActive = i === activeIdx && !isDone;
          return (
            <StaggerItem key={`${duration}-${i}`}>
              <Card className={`transition-colors ${isActive ? "border-primary/40 bg-primary/5" : isDone ? "border-emerald-500/20 bg-emerald-500/5" : "bg-muted/20"}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Clock className="h-5 w-5 text-primary" />
                      </motion.div>
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "text-emerald-400" : isActive ? "text-foreground" : "text-muted-foreground"}`}>{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {isActive && running ? (
                      <div>
                        <p className="text-lg font-bold text-primary">{ex.duration - timer}s</p>
                        <Progress value={(timer / ex.duration) * 100} className="h-1 w-16" />
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">{ex.duration}s</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}

        {/* Controls */}
        <StaggerItem>
          {allDone ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center p-6">
              <PartyPopper className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="font-serif text-xl font-bold text-foreground">¡Calentamiento completo!</p>
              <p className="text-sm text-muted-foreground mt-1">Tu voz está lista para brillar</p>
              <Button onClick={resetAll} variant="outline" className="mt-4">Repetir</Button>
            </motion.div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={start} disabled={running} className="gap-2"><Play className="h-4 w-4" />{activeIdx < 0 ? "Comenzar" : running ? "En progreso..." : "Continuar"}</Button>
              <Button onClick={resetAll} variant="outline">Reiniciar</Button>
            </div>
          )}
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default WarmUp;
