import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { Trophy, Zap, RotateCcw, Volume2 } from "lucide-react";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroPiano } from "@/components/studio/HeroPiano";
import MicroTutorial from "@/components/MicroTutorial";

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const allNotes = notes.map((n) => `${n}4`);

const intervals = [
  { name: "2da menor", semitones: 1 },
  { name: "2da mayor", semitones: 2 },
  { name: "3ra menor", semitones: 3 },
  { name: "3ra mayor", semitones: 4 },
  { name: "5ta justa", semitones: 7 },
  { name: "8va", semitones: 12 },
];

const PitchTraining = () => {
  const { playNote } = useAudioEngine();
  const [mode, setMode] = useState<"notes" | "intervals">("notes");
  const [target, setTarget] = useState(() => allNotes[Math.floor(Math.random() * 7)]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [level, setLevel] = useState(1);
  const [targetInterval, setTargetInterval] = useState(intervals[0]);
  const [baseNote] = useState("C4");
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    if (mode === "notes") {
      playNote(noteToFreq(target), 1.2);
    } else {
      const baseFreq = noteToFreq(baseNote);
      const targetFreq = baseFreq * Math.pow(2, targetInterval.semitones / 12);
      playNote(baseFreq, 0.6);
      setTimeout(() => playNote(targetFreq, 0.6), 700);
    }
  }, [target, targetInterval, mode, playNote, baseNote]);

  const newRound = useCallback(() => {
    setFeedback(null);
    hasPlayedRef.current = false;
    if (mode === "notes") setTarget(allNotes[Math.floor(Math.random() * (6 + level * 2))]);
    else setTargetInterval(intervals[Math.floor(Math.random() * Math.min(level + 1, intervals.length))]);
  }, [mode, level]);

  const replaySound = () => {
    if (mode === "notes") playNote(noteToFreq(target), 1.2);
    else {
      const baseFreq = noteToFreq(baseNote);
      playNote(baseFreq, 0.6);
      setTimeout(() => playNote(baseFreq * Math.pow(2, targetInterval.semitones / 12), 0.6), 700);
    }
  };

  const handleNoteClick = (note: string) => {
    if (feedback) return;
    playNote(noteToFreq(note), 0.4);
    if (note === target) {
      setScore((s) => s + 10 * (1 + streak)); setStreak((s) => s + 1); setFeedback("correct");
      if (streak > 0 && streak % 5 === 4) setLevel((l) => Math.min(l + 1, 5));
    } else { setStreak(0); setFeedback("wrong"); }
    setTimeout(newRound, 1200);
  };

  const handleIntervalClick = (interval: typeof intervals[0]) => {
    if (feedback) return;
    const baseFreq = noteToFreq(baseNote);
    playNote(baseFreq, 0.4);
    setTimeout(() => playNote(baseFreq * Math.pow(2, interval.semitones / 12), 0.4), 500);
    if (interval.name === targetInterval.name) {
      setScore((s) => s + 15 * (1 + streak)); setStreak((s) => s + 1); setFeedback("correct");
    } else { setStreak(0); setFeedback("wrong"); }
    setTimeout(newRound, 1200);
  };

  const reset = () => { setScore(0); setStreak(0); setLevel(1); setFeedback(null); hasPlayedRef.current = false; newRound(); };

  return (
    <StudioRoom
      roomId="pitch"
      heroContent={
        mode === "notes" ? (
          <HeroPiano targetNote={target} onNoteClick={handleNoteClick} feedback={feedback} />
        ) : (
          <div className="flex flex-col items-center z-10">
            <motion.div
              key={targetInterval.name}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-serif font-bold mb-4"
              style={{ color: feedback === "correct" ? "hsl(160 70% 50%)" : feedback === "wrong" ? "hsl(0 70% 55%)" : "hsl(45 80% 60%)" }}
            >
              🎵 {targetInterval.name}
            </motion.div>
            <motion.button onClick={replaySound} whileTap={{ scale: 0.95 }} className="glass-card px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Escuchar
            </motion.button>
          </div>
        )
      }
    >
      {/* Micro-tutorial */}
      <MicroTutorial
        storageKey="pitch"
        steps={[
          { icon: "🔊", title: "Escuchá", description: "La nota suena" },
          { icon: "🎹", title: "Elegí", description: "Tocá la correcta" },
          { icon: "🏆", title: "Sumá", description: "Puntos y racha" },
        ]}
      />

      {/* Mode + stats */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <div className="flex gap-1 glass-card rounded-xl p-1">
          {(["notes", "intervals"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); reset(); }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === m ? "stage-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {m === "notes" ? "🎹 Notas" : "🎶 Intervalos"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4">
        <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: "hsl(45 80% 60%)" }} />
          <span className="text-lg font-bold text-foreground">{score}</span>
        </div>
        <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">x{streak}</span>
        </div>
        <div className="glass-card px-4 py-3 rounded-2xl">
          <span className="text-xs font-bold text-muted-foreground">LVL {level}</span>
        </div>
      </div>

      {/* Interval buttons (when in interval mode) */}
      {mode === "intervals" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {intervals.map((iv, i) => (
            <motion.button
              key={iv.name}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleIntervalClick(iv)}
              className="glass-card p-4 text-center hover:border-primary/30 transition-all"
            >
              <p className="text-sm font-bold text-foreground">{iv.name}</p>
              <p className="text-[10px] text-muted-foreground">{iv.semitones} semitonos</p>
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <motion.button whileTap={{ scale: 0.93 }} onClick={reset}
          className="glass-card px-6 py-3 rounded-2xl flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </motion.button>
      </div>
    </StudioRoom>
  );
};

export default PitchTraining;
