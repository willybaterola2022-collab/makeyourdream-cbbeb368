import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { Ear, Zap, Trophy, RotateCcw, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const octave1 = notes.map((n) => `${n}4`);
const octave2 = notes.map((n) => `${n}5`);
const allNotes = [...octave1, ...octave2];
const isBlack = (n: string) => n.includes("#");

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
  const [target, setTarget] = useState(() => allNotes[Math.floor(Math.random() * 12)]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [level, setLevel] = useState(1);
  const [targetInterval, setTargetInterval] = useState(intervals[0]);
  const [baseNote] = useState("C4");
  const hasPlayedRef = useRef(false);

  // Play target note/interval when it changes
  useEffect(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    if (mode === "notes") {
      playNote(noteToFreq(target), 1.2);
    } else {
      const baseFreq = noteToFreq(baseNote);
      const targetFreq = noteToFreq(baseNote) * Math.pow(2, targetInterval.semitones / 12);
      playNote(baseFreq, 0.6);
      setTimeout(() => playNote(targetFreq, 0.6), 700);
    }
  }, [target, targetInterval, mode, playNote, baseNote]);

  const newRound = useCallback(() => {
    setFeedback(null);
    hasPlayedRef.current = false;
    if (mode === "notes") {
      setTarget(allNotes[Math.floor(Math.random() * (6 + level * 2))]);
    } else {
      setTargetInterval(intervals[Math.floor(Math.random() * Math.min(level + 1, intervals.length))]);
    }
  }, [mode, level]);

  const replaySound = () => {
    if (mode === "notes") {
      playNote(noteToFreq(target), 1.2);
    } else {
      const baseFreq = noteToFreq(baseNote);
      const targetFreq = baseFreq * Math.pow(2, targetInterval.semitones / 12);
      playNote(baseFreq, 0.6);
      setTimeout(() => playNote(targetFreq, 0.6), 700);
    }
  };

  const handleNoteClick = (note: string) => {
    if (feedback) return;
    playNote(noteToFreq(note), 0.4);
    if (note === target) {
      setScore((s) => s + 10 * (1 + streak));
      setStreak((s) => s + 1);
      setFeedback("correct");
      if (streak > 0 && streak % 5 === 4) setLevel((l) => Math.min(l + 1, 5));
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setTimeout(newRound, 1200);
  };

  const handleIntervalClick = (interval: typeof intervals[0]) => {
    if (feedback) return;
    // Play the selected interval for feedback
    const baseFreq = noteToFreq(baseNote);
    const selectedFreq = baseFreq * Math.pow(2, interval.semitones / 12);
    playNote(baseFreq, 0.4);
    setTimeout(() => playNote(selectedFreq, 0.4), 500);

    if (interval.name === targetInterval.name) {
      setScore((s) => s + 15 * (1 + streak));
      setStreak((s) => s + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setTimeout(newRound, 1200);
  };

  const reset = () => { setScore(0); setStreak(0); setLevel(1); setFeedback(null); hasPlayedRef.current = false; newRound(); };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <StaggerContainer>
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ear className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Pitch & Ear Training</h1>
              <p className="text-sm text-muted-foreground">Entrena tu oído musical</p>
            </div>
          </div>
        </StaggerItem>

        {/* Mode + stats */}
        <StaggerItem>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {(["notes", "intervals"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); reset(); }} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "notes" ? "Notas" : "Intervalos"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-auto text-sm">
              <span className="flex items-center gap-1 text-primary"><Trophy className="h-3.5 w-3.5" />{score}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Zap className="h-3.5 w-3.5" />Racha: {streak}</span>
              <Badge variant="outline" className="text-[10px]">Nivel {level}</Badge>
            </div>
          </div>
        </StaggerItem>

        {/* Target */}
        <StaggerItem>
          <Card className="border-primary/20 text-center">
            <CardContent className="p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {mode === "notes" ? "Identifica esta nota" : "Identifica este intervalo"}
              </p>
              <motion.div
                key={mode === "notes" ? target : targetInterval.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-5xl font-serif font-bold ${feedback === "correct" ? "text-emerald-400" : feedback === "wrong" ? "text-destructive" : "text-primary"}`}
              >
                {mode === "notes" ? target.replace(/\d/, "") : targetInterval.name}
              </motion.div>
              {feedback && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm mt-2 ${feedback === "correct" ? "text-emerald-400" : "text-destructive"}`}>
                  {feedback === "correct" ? "¡Correcto! 🎉" : "Intenta de nuevo"}
                </motion.p>
              )}
              <Button variant="ghost" size="sm" onClick={replaySound} className="mt-3 gap-1.5 text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5" /> Escuchar de nuevo
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Piano / Intervals */}
        <StaggerItem>
          {mode === "notes" ? (
            <Card>
              <CardContent className="p-4">
                <div className="relative flex justify-center overflow-x-auto pb-2">
                  <div className="flex">
                    {octave1.concat(octave2).map((note) => (
                      <button
                        key={note}
                        onClick={() => handleNoteClick(note)}
                        className={`relative transition-all ${
                          isBlack(note)
                            ? "h-20 w-7 -mx-3.5 z-10 rounded-b-md bg-foreground text-background text-[9px] hover:bg-foreground/80 flex items-end justify-center pb-1"
                            : "h-32 w-10 rounded-b-lg border border-border bg-background text-muted-foreground text-[10px] hover:bg-muted flex items-end justify-center pb-2"
                        }`}
                      >
                        {note.replace(/\d/, "")}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {intervals.map((iv) => (
                <motion.button
                  key={iv.name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleIntervalClick(iv)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors text-left"
                >
                  <p className="text-sm font-medium text-foreground">{iv.name}</p>
                  <p className="text-[10px] text-muted-foreground">{iv.semitones} semitonos</p>
                </motion.button>
              ))}
            </div>
          )}
        </StaggerItem>

        <StaggerItem>
          <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" />Reiniciar</Button>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default PitchTraining;
