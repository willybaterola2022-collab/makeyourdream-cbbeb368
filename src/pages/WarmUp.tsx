import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, CheckCircle2, RotateCcw, PartyPopper } from "lucide-react";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroThermometer } from "@/components/studio/HeroThermometer";
import MicroTutorial from "@/components/MicroTutorial";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { toast } from "sonner";

interface Exercise {
  name: string;
  duration: number;
  emoji: string;
}

const routines: Record<number, Exercise[]> = {
  3: [
    { name: "Lip Trills", duration: 40, emoji: "💋" },
    { name: "Sirenas suaves", duration: 50, emoji: "🌊" },
    { name: "Escalas en 'Ma'", duration: 50, emoji: "🎵" },
  ],
  5: [
    { name: "Lip Trills", duration: 45, emoji: "💋" },
    { name: "Humming", duration: 40, emoji: "🐝" },
    { name: "Sirenas amplias", duration: 50, emoji: "🌊" },
    { name: "Escalas en 'Ni'", duration: 60, emoji: "🎵" },
    { name: "Staccato en 'Ha'", duration: 55, emoji: "⚡" },
  ],
  10: [
    { name: "Respiración", duration: 60, emoji: "🫁" },
    { name: "Lip Trills", duration: 60, emoji: "💋" },
    { name: "Humming", duration: 50, emoji: "🐝" },
    { name: "Sirenas", duration: 70, emoji: "🌊" },
    { name: "Escalas", duration: 60, emoji: "🎵" },
    { name: "Arpegios", duration: 60, emoji: "🎶" },
    { name: "Staccato", duration: 50, emoji: "⚡" },
    { name: "Legato", duration: 70, emoji: "🎻" },
    { name: "Riffs", duration: 60, emoji: "🔥" },
    { name: "Cool down", duration: 60, emoji: "❄️" },
  ],
};

const WarmUp = () => {
  const { playNote, playSuccess } = useAudioEngine();
  const { saveSession } = useTrainingSession();
  const [duration, setDuration] = useState(5);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const exercises = routines[duration];
  const allDone = completed.size === exercises.length;
  const progress = exercises.length > 0 ? (completed.size / exercises.length) * 100 : 0;

  useEffect(() => {
    if (!running || activeIdx < 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= exercises[activeIdx].duration) {
          setCompleted((c) => new Set(c).add(activeIdx));
          setRunning(false);
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
    playNote(noteToFreq("C4"), 0.5);
  };

  const resetAll = () => { setActiveIdx(-1); setTimer(0); setRunning(false); setCompleted(new Set()); };

  return (
    <StudioRoom
      roomId="warmup"
      heroContent={
        <HeroThermometer
          progress={progress}
          onClick={running ? () => {} : start}
        />
      }
    >
      {/* Micro-tutorial */}
      <MicroTutorial
        storageKey="warmup"
        steps={[
          { icon: "🔊", title: "Escuchá", description: "Toca Play" },
          { icon: "🎤", title: "Repetí", description: "Con tu voz" },
          { icon: "✅", title: "Resultado", description: "Ve tu avance" },
        ]}
      />

      {/* Duration selector */}
      <div className="flex gap-2 justify-center">
        {[3, 5, 10].map((d) => (
          <motion.button
            key={d}
            whileTap={{ scale: 0.93 }}
            onClick={() => { setDuration(d); resetAll(); }}
            className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all ${
              duration === d
                ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-400 shadow-[0_0_20px_-5px_hsl(30_80%_55%/0.3)]"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {d} min
          </motion.button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {exercises.map((ex, i) => {
          const isDone = completed.has(i);
          const isActive = i === activeIdx && !isDone;
          return (
            <motion.div
              key={`${duration}-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 md:p-5 flex flex-col items-center gap-2 text-center transition-all ${
                isActive ? "border-orange-500/40 shadow-[0_0_25px_-8px_hsl(30_80%_55%/0.4)]" :
                isDone ? "border-emerald-500/30 bg-emerald-500/5" : ""
              }`}
            >
              <span className="text-3xl">{ex.emoji}</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isDone ? "text-emerald-400" : isActive ? "text-orange-400" : "text-muted-foreground"
              }`}>{ex.name}</span>
              {isActive && running ? (
                <motion.span
                  className="text-2xl font-bold text-orange-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {ex.duration - timer}s
                </motion.span>
              ) : isDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <span className="text-xs text-muted-foreground">{ex.duration}s</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      {allDone ? (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-6">
          <PartyPopper className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-orange-400">🔥 ¡LISTO PARA CANTAR!</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetAll}
            className="mt-4 glass-card px-6 py-3 rounded-2xl text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-5 w-5 inline mr-2" /> Repetir
          </motion.button>
        </motion.div>
      ) : (
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={start}
            disabled={running}
            className="h-16 w-16 rounded-full flex items-center justify-center stage-gradient text-primary-foreground disabled:opacity-50 shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)]"
          >
            <Play className="h-7 w-7 ml-0.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={resetAll}
            className="h-16 w-16 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-6 w-6" />
          </motion.button>
        </div>
      )}
    </StudioRoom>
  );
};

export default WarmUp;
