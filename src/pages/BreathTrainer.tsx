import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroLungs } from "@/components/studio/HeroLungs";
import MicroTutorial from "@/components/MicroTutorial";

const exercises = [
  { id: "basic", name: "Diafragma", inhale: 4, hold: 2, exhale: 4, pause: 2, emoji: "🫁" },
  { id: "478", name: "4-7-8", inhale: 4, hold: 7, exhale: 8, pause: 2, emoji: "😌" },
  { id: "belting", name: "Belting", inhale: 3, hold: 1, exhale: 10, pause: 1, emoji: "🔥" },
];

type Phase = "inhale" | "hold" | "exhale" | "pause";

const BreathTrainer = () => {
  const { playSweep, playTone, stopTone } = useAudioEngine();
  const [selected, setSelected] = useState(exercises[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const stopFnRef = useRef<(() => void) | null>(null);

  const phaseDuration = phase === "inhale" ? selected.inhale : phase === "hold" ? selected.hold : phase === "exhale" ? selected.exhale : selected.pause;

  const playPhaseSound = useCallback((p: Phase) => {
    if (!soundOn) return;
    if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
    switch (p) {
      case "inhale": playSweep(noteToFreq("C4"), noteToFreq("G4"), 0.4, 0.12); break;
      case "hold": stopFnRef.current = playTone(noteToFreq("C3"), "sine", 0.08); break;
      case "exhale": playSweep(noteToFreq("G4"), noteToFreq("C4"), 0.4, 0.12); break;
      case "pause": stopTone(); break;
    }
  }, [soundOn, playSweep, playTone, stopTone]);

  const nextPhase = useCallback(() => {
    setPhase((p) => {
      let next: Phase;
      if (p === "inhale") next = "hold";
      else if (p === "hold") next = "exhale";
      else if (p === "exhale") { next = "pause"; }
      else { setReps((r) => r + 1); next = "inhale"; }
      playPhaseSound(next);
      return next;
    });
    setTimer(0);
  }, [playPhaseSound]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= phaseDuration) { nextPhase(); return 0; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phaseDuration, nextPhase]);

  const handleToggle = () => {
    if (!running) { setRunning(true); playPhaseSound(phase); }
    else { setRunning(false); if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; } stopTone(); }
  };

  const reset = () => {
    setRunning(false); setPhase("inhale"); setTimer(0); setReps(0);
    if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
    stopTone();
  };

  return (
    <StudioRoom
      roomId="breath"
      heroContent={
        <HeroLungs
          phase={phase}
          progress={phaseDuration > 0 ? timer / phaseDuration : 0}
          isActive={running}
          onClick={handleToggle}
        />
      }
    >
      {/* Exercise selector */}
      <div className="flex gap-3 justify-center">
        {exercises.map((ex) => (
          <motion.button
            key={ex.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => { setSelected(ex); reset(); }}
            className={`glass-card p-4 md:p-5 flex flex-col items-center gap-2 min-w-[90px] transition-all ${
              selected.id === ex.id
                ? "border-sky-400/40 shadow-[0_0_20px_-5px_hsl(210_80%_55%/0.3)]"
                : "opacity-50 hover:opacity-80"
            }`}
          >
            <span className="text-3xl">{ex.emoji}</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              selected.id === ex.id ? "text-sky-400" : "text-muted-foreground"
            }`}>{ex.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button whileTap={{ scale: 0.93 }} onClick={reset}
          className="h-14 w-14 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-5 w-5" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={handleToggle}
          className="h-18 w-18 rounded-full flex items-center justify-center stage-gradient text-primary-foreground shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] p-5">
          {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setSoundOn(!soundOn)}
          className="h-14 w-14 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground">
          {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6">
        <div className="glass-card px-5 py-3 rounded-2xl text-center">
          <span className="text-2xl font-bold text-sky-400">{reps}</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reps</p>
        </div>
        <div className="glass-card px-5 py-3 rounded-2xl text-center">
          <span className="text-sm font-bold text-foreground">{selected.inhale}-{selected.hold}-{selected.exhale}-{selected.pause}</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrón</p>
        </div>
      </div>
    </StudioRoom>
  );
};

export default BreathTrainer;
