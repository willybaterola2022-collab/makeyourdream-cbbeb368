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
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const TARGET_NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63];
const EXERCISE_DURATION = 20;

const Exercises = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const currentFrequency = pitch?.frequency ?? 0;
  const audioEngine = useAudioEngine();

  const [phase, setPhase] = useState<"ready" | "demo" | "exercise" | "result">("ready");
  const [exerciseId, setExerciseId] = useState("pitch_match_easy");
  const [exerciseName, setExerciseName] = useState("Escala Mayor C4");
  const [exerciseDesc, setExerciseDesc] = useState("Canta las notas de la escala con afinación");
  const [targetNotes, setTargetNotes] = useState(TARGET_NOTES);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pitchHits = useRef(0);
  const pitchTotal = useRef(0);

  // Fetch exercises
  useEffect(() => {
    if (user) trackEvent(user.id, "module_visited", { module: "exercises" });

    // Get all exercises
    supabase.functions.invoke("daily-exercise", {
      body: { action: "get_all" },
    }).then(({ data }) => {
      if (data?.exercises) setAllExercises(data.exercises);
    }).catch(() => {});

    // Get recommended
    if (user) {
      supabase.functions.invoke("daily-exercise", {
        body: { action: "get_recommended", user_id: user.id },
      }).then(({ data }) => {
        if (data?.exercise) {
          setExerciseId(data.exercise.id || "pitch_match_easy");
          setExerciseName(data.exercise.name || "Escala Mayor C4");
          setExerciseDesc(data.exercise.description || "Canta las notas de la escala con afinación");
          if (data.exercise.demo_notes?.length) setTargetNotes(data.exercise.demo_notes);
        }
      }).catch(() => {});
    }
  }, [user]);

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

  useEffect(() => {
    if (phase !== "exercise" || !currentFrequency) return;
    pitchTotal.current++;
    const closest = targetNotes.reduce((a, b) =>
      Math.abs(b - currentFrequency) < Math.abs(a - currentFrequency) ? b : a
    );
    const cents = 1200 * Math.log2(currentFrequency / closest);
    if (Math.abs(cents) < 50) pitchHits.current++;
  }, [currentFrequency, phase]);

  const finishExercise = useCallback(async () => {
    stopMic();
    const accuracy = pitchTotal.current > 0
      ? Math.round((pitchHits.current / pitchTotal.current) * 100)
      : 0;
    setScore(accuracy);
    setPhase("result");

    if (accuracy >= 70) {
      audioEngine.playNote?.(523.25, 0.3);
      setTimeout(() => audioEngine.playNote?.(659.25, 0.3), 150);
      setTimeout(() => audioEngine.playNote?.(783.99, 0.3), 300);
    }

    // Complete exercise via edge function
    if (user) {
      try {
        const { data } = await supabase.functions.invoke("daily-exercise", {
          body: { action: "complete", user_id: user.id, exercise_id: exerciseId, score: accuracy },
        });
        if (data?.xp_earned) {
          toast.success(`+${data.xp_earned} XP`);
        }
      } catch {}
      trackEvent(user.id, "exercise_completed", { exercise_id: exerciseId, score: accuracy });
    }
  }, [stopMic, audioEngine, user, exerciseId]);

  const selectExercise = (ex: any) => {
    setExerciseId(ex.id);
    setExerciseName(ex.name);
    setExerciseDesc(ex.description);
    if (ex.demo_notes?.length) setTargetNotes(ex.demo_notes);
    setPhase("ready");
  };

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
        </motion.div>
      }
    >
      {/* Today's exercise card */}
      <div className="glass-card p-5 border-primary/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{exerciseName}</h3>
            <p className="text-xs text-muted-foreground">{exerciseDesc}</p>
          </div>
        </div>

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
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <Volume2 className="h-10 w-10 text-primary mx-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">Escuchando demo...</p>
          </motion.div>
        )}

        {phase === "exercise" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
            <p className="text-3xl font-bold text-foreground">{timeLeft}s</p>
            <div className="mx-auto max-w-xs h-4 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${volume}%` }} transition={{ duration: 0.05 }} />
            </div>
            {currentFrequency > 0 && (
              <p className="text-lg font-mono text-primary">{Math.round(currentFrequency)}Hz</p>
            )}
            <p className="text-xs text-muted-foreground">Cantá la escala que escuchaste</p>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3">
            <p className="text-5xl font-bold text-primary">{score}%</p>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? "¡Excelente afinación!" : score >= 60 ? "Buen intento, seguí practicando" : "Necesitás más práctica — no te rindas"}
            </p>
            <StageButton variant="glass" onClick={() => setPhase("ready")}>REPETIR</StageButton>
          </motion.div>
        )}
      </div>

      {/* Exercise list */}
      {allExercises.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Todos los ejercicios</span>
          {allExercises.map((ex, i) => (
            <motion.button
              key={ex.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => selectExercise(ex)}
              className={`w-full glass-card p-3 flex items-center gap-3 text-left ${exerciseId === ex.id ? "border-primary/30" : ""}`}
            >
              <span className="text-lg">{ex.focus === "pitch" ? "🎹" : ex.focus === "timing" ? "🥁" : "💫"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{ex.focus} · {ex.difficulty}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </StudioRoom>
  );
};

export default Exercises;
