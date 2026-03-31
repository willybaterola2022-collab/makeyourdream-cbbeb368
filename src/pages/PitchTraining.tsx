import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { Trophy, Zap, RotateCcw, Volume2, Piano, Guitar } from "lucide-react";
import { useAudioEngine, noteToFreq, type InstrumentType } from "@/hooks/useAudioEngine";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroPiano } from "@/components/studio/HeroPiano";
import { StageButton } from "@/components/ui/StageButton";
import MicroTutorial from "@/components/MicroTutorial";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

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

const INSTRUMENT_OPTIONS: { id: InstrumentType; label: string; emoji: string }[] = [
  { id: "piano", label: "Piano", emoji: "🎹" },
  { id: "guitar", label: "Guitarra", emoji: "🎸" },
  { id: "sax", label: "Saxo", emoji: "🎷" },
  { id: "bass", label: "Bajo", emoji: "🎸" },
  { id: "flute", label: "Flauta", emoji: "🪈" },
];

const PitchTraining = () => {
  const { playNote, playInstrument } = useAudioEngine();
  const { saveSession } = useTrainingSession();
  const savedRef = useRef(false);
  const [mode, setMode] = useState<"notes" | "intervals">("notes");
  const [instrument, setInstrument] = useState<InstrumentType>("piano");
  const [target, setTarget] = useState(() => allNotes[Math.floor(Math.random() * 7)]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [level, setLevel] = useState(1);
  const [targetInterval, setTargetInterval] = useState(intervals[0]);
  const [baseNote] = useState("C4");
  const hasPlayedRef = useRef(false);

  const playCurrentNote = useCallback(() => {
    if (mode === "notes") {
      playInstrument(noteToFreq(target), instrument, 1.2);
    } else {
      const baseFreq = noteToFreq(baseNote);
      const targetFreq = baseFreq * Math.pow(2, targetInterval.semitones / 12);
      playInstrument(baseFreq, instrument, 0.6);
      setTimeout(() => playInstrument(targetFreq, instrument, 0.6), 700);
    }
  }, [mode, target, targetInterval, instrument, playInstrument, baseNote]);

  useEffect(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playCurrentNote();
  }, [target, targetInterval, mode, playCurrentNote]);

  const newRound = useCallback(() => {
    setFeedback(null);
    hasPlayedRef.current = false;
    if (mode === "notes") setTarget(allNotes[Math.floor(Math.random() * Math.min(6 + level * 2, 12))]);
    else setTargetInterval(intervals[Math.floor(Math.random() * Math.min(level + 1, intervals.length))]);
  }, [mode, level]);

  const handleNoteClick = (note: string) => {
    if (feedback) return;
    playInstrument(noteToFreq(note), instrument, 0.4);
    if (note === target) {
      setScore((s) => s + 10 * (1 + streak)); setStreak((s) => s + 1); setFeedback("correct");
      if (streak > 0 && streak % 5 === 4) {
        setLevel((l) => Math.min(l + 1, 5));
        if (!savedRef.current) {
          savedRef.current = true;
          saveSession({ module: "pitch", overall_score: Math.min(100, score + 50), pitch_score: 85, song_title: `Pitch Lvl ${level}` }).then((s) => {
            if (s) toast.success(`+XP 🎯 Level up!`);
            savedRef.current = false;
          });
        }
      }
    } else { setStreak(0); setFeedback("wrong"); }
    setTimeout(newRound, 1200);
  };

  const handleIntervalClick = (interval: typeof intervals[0]) => {
    if (feedback) return;
    const baseFreq = noteToFreq(baseNote);
    playInstrument(baseFreq, instrument, 0.4);
    setTimeout(() => playInstrument(baseFreq * Math.pow(2, interval.semitones / 12), instrument, 0.4), 500);
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
          <HeroPiano targetNote={target} onNoteClick={handleNoteClick} feedback={feedback} instrument={instrument} />
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
            <StageButton variant="glass" icon={<Volume2 className="h-4 w-4" />} onClick={playCurrentNote}>
              Escuchar
            </StageButton>
          </div>
        )
      }
    >
      <MicroTutorial
        storageKey="pitch"
        steps={[
          { icon: "🔊", title: "Escuchá", description: "La nota suena" },
          { icon: "🎹", title: "Elegí", description: "Tocá la correcta" },
          { icon: "🏆", title: "Sumá", description: "Puntos y racha" },
        ]}
      />

      {/* Instrument selector */}
      <div className="flex gap-2 justify-center overflow-x-auto pb-1">
        {INSTRUMENT_OPTIONS.map((inst) => (
          <StageButton
            key={inst.id}
            variant="capsule"
            active={instrument === inst.id}
            onClick={() => { setInstrument(inst.id); hasPlayedRef.current = false; }}
            className="text-[10px]"
          >
            {inst.emoji} {inst.label}
          </StageButton>
        ))}
      </div>

      {/* Mode toggle */}
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

      {/* Interval buttons */}
      {mode === "intervals" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {intervals.map((iv, i) => (
            <StageButton key={iv.name} variant="glass" onClick={() => handleIntervalClick(iv)}>
              <div className="text-center">
                <p className="text-sm font-bold">{iv.name}</p>
                <p className="text-[10px] text-muted-foreground">{iv.semitones} semitonos</p>
              </div>
            </StageButton>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <StageButton variant="glass" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>
          Reiniciar
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default PitchTraining;
