import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Play, Mic, Volume2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// BACKEND-REQUEST: daily-exercise
// Input: { user_id: string }
// Output: { exercise_id, name, demo_notes: number[], duration: number, difficulty: string, description: string }
// Descripción: Genera un ejercicio diario personalizado basado en el nivel del usuario

const TARGET_NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63]; // C4 scale
const EXERCISE_DURATION = 20; // seconds

const weekDays = [
  { day: "L", done: true }, { day: "M", done: true }, { day: "X", done: true },
  { day: "J", done: false, today: true }, { day: "V", done: false }, { day: "S", done: false }, { day: "D", done: false },
];

const Exercises = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const currentFrequency = pitch?.frequency ?? 0;
  const audioEngine = useAudioEngine();

  const [phase, setPhase] = useState<"ready" | "demo" | "exercise" | "result">("ready");
  const [exerciseName, setExerciseName] = useState("Escala Mayor C4");
  const [exerciseDesc, setExerciseDesc] = useState("Canta las notas de la escala con afinación");
  const [targetNotes, setTargetNotes] = useState(TARGET_NOTES);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pitchHits = useRef(0);
  const pitchTotal = useRef(0);

  // Fetch recommended exercise from edge function
  useEffect(() => {
    if (!user) return;
    supabase.functions.invoke("daily-exercise", {
      body: { action: "get_recommended", user_id: user.id },
    }).then(({ data }) => {
      if (data?.name) setExerciseName(data.name);
      if (data?.description) setExerciseDesc(data.description);
      if (data?.demo_notes?.length) setTargetNotes(data.demo_notes);
    }).catch(() => {});
  }, [user]);

  // Play demo scale
  const playDemo = useCallback(() => {
    setPhase("demo");
    targetNotes.forEach((freq, i) => {
      setTimeout(() => {
        audioEngine.playNote?.(freq, 0.4);
        if (i === targetNotes.length - 1) {
          setTimeout(() => setPhase("ready"), 500);
        }
      }, i * 500);
    });
  }, [audioEngine, targetNotes]);

  // Start exercise with mic
  const startExercise = useCallback(async () => {
    const ok = await requestMic();
    if (!ok) return;
    pitchHits.current = 0;
    pitchTotal.current = 0;
    setPhase("exercise");
    setTimeLeft(EXERCISE_DURATION);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishExercise();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [requestMic]);

  // Check pitch accuracy during exercise
  useEffect(() => {
    if (phase !== "exercise" || !currentFrequency) return;
    pitchTotal.current++;
    // Check if current frequency is close to any target note
    const closest = targetNotes.reduce((a, b) =>
      Math.abs(b - currentFrequency) < Math.abs(a - currentFrequency) ? b : a
    );
    const cents = 1200 * Math.log2(currentFrequency / closest);
    if (Math.abs(cents) < 50) pitchHits.current++;
  }, [currentFrequency, phase]);

  const finishExercise = useCallback(() => {
    stopMic();
    const accuracy = pitchTotal.current > 0
      ? Math.round((pitchHits.current / pitchTotal.current) * 100)
      : 0;
    setScore(accuracy);
    setPhase("result");
    if (accuracy >= 70) {
      audioEngine.playNote?.(523.25, 0.3); // C5 celebration
      setTimeout(() => audioEngine.playNote?.(659.25, 0.3), 150);
      setTimeout(() => audioEngine.playNote?.(783.99, 0.3), 300);
    }
  }, [stopMic, audioEngine]);

  return (
    <StudioRoom
      roomId="exercises"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div
            className="text-8xl md:text-[140px]"
            animate={{ scale: [1, 1.08, 1], y: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥
          </motion.div>
          <motion.p className="mt-4 text-3xl md:text-4xl font-bold" style={{ color: "hsl(15 80% 55%)" }}>
            3 DÍAS
          </motion.p>
          <motion.p
            className="text-lg font-bold uppercase tracking-[0.25em]"
            style={{ color: "hsl(15 80% 55%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚡ NO PARES ⚡
          </motion.p>
        </motion.div>
      }
    >
      {/* Week calendar */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex justify-between">
          {weekDays.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase">{d.day}</span>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  d.done ? "stage-gradient text-primary-foreground" :
                  d.today ? "border-2 border-primary text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {d.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's exercise card */}
      <div className="glass-card p-5 border-primary/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl stage-gradient flex items-center justify-center">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Escala Mayor C4</h3>
            <p className="text-xs text-muted-foreground">Canta las notas de la escala con afinación</p>
          </div>
        </div>

        {/* Demo / exercise / result */}
        {phase === "ready" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              1. Escuchá el ejemplo → 2. Repetí con tu voz → 3. Mirá tu score
            </p>
            <div className="flex gap-3">
              <StageButton variant="glass" icon={<Volume2 className="h-5 w-5" />} onClick={playDemo} className="flex-1">
                ESCUCHAR DEMO
              </StageButton>
              <StageButton variant="primary" icon={<Play className="h-5 w-5" />} onClick={startExercise} className="flex-1" pulse>
                EMPEZAR
              </StageButton>
            </div>
          </div>
        )}

        {phase === "demo" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 className="h-10 w-10 text-primary mx-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">Escuchando demo...</p>
          </motion.div>
        )}

        {phase === "exercise" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
            <p className="text-3xl font-bold text-foreground">{timeLeft}s</p>
            <div className="mx-auto max-w-xs h-4 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full stage-gradient" animate={{ width: `${volume}%` }} transition={{ duration: 0.05 }} />
            </div>
            {currentFrequency > 0 && (
              <p className="text-lg font-mono text-primary">{Math.round(currentFrequency)}Hz</p>
            )}
            <p className="text-xs text-muted-foreground">Cantá la escala que escuchaste</p>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3">
            <p className="text-5xl font-bold neon-text">{score}%</p>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? "¡Excelente afinación!" : score >= 60 ? "Buen intento, seguí practicando" : "Necesitás más práctica — no te rindas"}
            </p>
            <div className="flex gap-3 justify-center">
              <StageButton variant="glass" onClick={() => setPhase("ready")}>
                REPETIR
              </StageButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "5", label: "Sesiones", icon: "🎯" },
          { value: "+14%", label: "Mejora", icon: "📈" },
          { value: "21d", label: "Racha max", icon: "🔥" },
          { value: "Gold", label: "Próximo badge", icon: "🏅" },
        ].map((m) => (
          <div key={m.label} className="glass-card p-4 text-center">
            <span className="text-2xl">{m.icon}</span>
            <p className="text-xl font-bold text-foreground mt-1">{m.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>
    </StudioRoom>
  );
};

export default Exercises;
