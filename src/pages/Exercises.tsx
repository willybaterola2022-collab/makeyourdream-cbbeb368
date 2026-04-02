import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Play, Mic, Volume2, ChevronRight, Lock } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const CATEGORY_ICONS: Record<string, string> = {
  breathing: "🫁", pitch: "🎯", range: "📈", vibrato: "〰️", articulation: "💬", ear: "👂",
  warmup: "🔥", expression: "🎭", timing: "⏱️", general: "🎵",
};

const Exercises = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const currentFrequency = pitch?.frequency ?? 0;
  const audioEngine = useAudioEngine();

  const [plan, setPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseDetail, setExerciseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"list" | "detail" | "active" | "result">("list");
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pitchHits = useRef(0);
  const pitchTotal = useRef(0);

  useEffect(() => {
    if (user) trackEvent(user.id, "module_visited", { module: "exercises" });
    fetchPlan();
  }, [user]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("vocal-exercises-v2", {
        body: { action: "get_progressive_plan", user_id: user?.id },
      });
      if (data?.plan) setPlan(data.plan);
    } catch {}
    setLoading(false);
  };

  const loadExerciseDetail = async (exercise: any) => {
    setSelectedExercise(exercise);
    setPhase("detail");
    try {
      const { data } = await supabase.functions.invoke("vocal-exercises-v2", {
        body: { action: "get_exercise_detail", exercise_id: exercise.id || exercise.exercise_id },
      });
      if (data?.exercise) setExerciseDetail(data.exercise);
      else setExerciseDetail(exercise);
    } catch {
      setExerciseDetail(exercise);
    }
  };

  const startExercise = useCallback(async () => {
    const ok = await requestMic();
    if (!ok) return;
    pitchHits.current = 0;
    pitchTotal.current = 0;
    setPhase("active");
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); finishExercise(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [requestMic]);

  useEffect(() => {
    if (phase !== "active" || !currentFrequency) return;
    pitchTotal.current++;
    // Simple accuracy: check if singing in a reasonable range
    if (currentFrequency > 80 && currentFrequency < 1200) pitchHits.current++;
  }, [currentFrequency, phase]);

  const finishExercise = useCallback(async () => {
    stopMic();
    clearInterval(timerRef.current);
    const accuracy = pitchTotal.current > 0
      ? Math.round((pitchHits.current / pitchTotal.current) * 100)
      : 50;
    setScore(accuracy);
    setPhase("result");

    if (user && selectedExercise) {
      try {
        const { data } = await supabase.functions.invoke("vocal-exercises-v2", {
          body: { action: "complete_exercise", user_id: user.id, exercise_id: selectedExercise.id || selectedExercise.exercise_id, scores: { pitch: accuracy } },
        });
        if (data?.xp_earned) toast.success(`+${data.xp_earned} XP`);
        setCompletedToday((prev) => new Set(prev).add(selectedExercise.id || selectedExercise.exercise_id));
      } catch {}

      // Also save training session
      try {
        await supabase.functions.invoke("save-training-session", {
          body: { user_id: user.id, module: "exercises", scores: { pitch: accuracy, timing: 50, expression: 50 } },
        });
      } catch {}

      trackEvent(user.id, "exercise_completed", { exercise_id: selectedExercise.id, score: accuracy });
    }
  }, [stopMic, user, selectedExercise]);

  const todayExercises = plan?.days?.[selectedDay]?.exercises || [];
  const dayFocus = plan?.days?.[selectedDay]?.focus || "Entrenamiento";

  if (loading) {
    return (
      <StudioRoom roomId="exercises" heroContent={<div className="h-20" />}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </StudioRoom>
    );
  }

  return (
    <StudioRoom
      roomId="exercises"
      heroContent={
        <motion.div className="flex flex-col items-center z-10" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div className="text-7xl" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {CATEGORY_ICONS[plan?.today_focus] || "🔥"}
          </motion.div>
          {plan && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Nivel {plan.level} — {plan.level_name}
            </p>
          )}
        </motion.div>
      }
    >
      <AnimatePresence mode="wait">
        {phase === "list" && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Weekly calendar */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {DAYS.map((day, i) => {
                const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-1 min-w-[44px] py-2 rounded-xl text-center transition-all duration-200 ${
                      selectedDay === i
                        ? "bg-primary text-primary-foreground"
                        : isToday
                        ? "glass-card border-primary/30 text-foreground"
                        : "glass-card text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{day}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Day focus */}
            <div className="glass-card p-3 border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-wider">Enfoque del día</p>
              <p className="text-sm text-foreground mt-0.5">{dayFocus}</p>
            </div>

            {/* Exercises list */}
            {todayExercises.length > 0 ? (
              <div className="space-y-2">
                {todayExercises.map((ex: any, i: number) => {
                  const exId = ex.id || ex.exercise_id;
                  const done = completedToday.has(exId);
                  return (
                    <motion.button
                      key={exId || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => loadExerciseDetail(ex)}
                      className={`w-full glass-card p-4 flex items-center gap-3 text-left transition-all duration-200 ${done ? "border-primary/30" : ""}`}
                    >
                      <span className="text-xl">{CATEGORY_ICONS[ex.category] || "🎵"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ex.title || ex.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{ex.category} · {ex.difficulty || "medio"}</p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay ejercicios para este día</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Selecciona otro día del plan</p>
              </div>
            )}
          </motion.div>
        )}

        {phase === "detail" && (exerciseDetail || selectedExercise) && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => { setPhase("list"); setSelectedExercise(null); setExerciseDetail(null); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Volver al plan
            </button>
            <div className="glass-card p-5 border-primary/20 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CATEGORY_ICONS[(exerciseDetail || selectedExercise).category] || "🎵"}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">{(exerciseDetail || selectedExercise).title || (exerciseDetail || selectedExercise).name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{(exerciseDetail || selectedExercise).category} · {(exerciseDetail || selectedExercise).difficulty || "medio"}</p>
                </div>
              </div>
              {exerciseDetail?.description && (
                <p className="text-sm text-muted-foreground">{exerciseDetail.description}</p>
              )}
              {exerciseDetail?.instructions && (
                <div className="space-y-2">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Instrucciones</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{exerciseDetail.instructions}</p>
                </div>
              )}
              {exerciseDetail?.technique && (
                <div className="glass-card p-3 bg-primary/5 border-primary/10">
                  <p className="text-xs text-primary font-bold">Técnica</p>
                  <p className="text-sm text-foreground mt-1">{exerciseDetail.technique}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <StageButton variant="glass" icon={<Volume2 className="h-5 w-5" />} onClick={() => {
                  const notes = exerciseDetail?.target_notes || [261.63, 293.66, 329.63];
                  notes.forEach((freq: number, i: number) => {
                    setTimeout(() => audioEngine.playNote?.(freq, 0.4), i * 500);
                  });
                }} className="flex-1">
                  DEMO
                </StageButton>
                <StageButton variant="primary" icon={<Play className="h-5 w-5" />} onClick={startExercise} className="flex-1" pulse>
                  EMPEZAR
                </StageButton>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-5 border-primary/20 text-center space-y-4">
            <Mic className="h-10 w-10 text-primary mx-auto" />
            <p className="text-4xl font-bold text-foreground font-mono">{timeLeft}s</p>
            <div className="mx-auto max-w-xs h-4 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${volume}%` }} transition={{ duration: 0.05 }} />
            </div>
            {currentFrequency > 0 && (
              <p className="text-lg font-mono text-primary">{Math.round(currentFrequency)}Hz</p>
            )}
            <p className="text-xs text-muted-foreground">Sigue las instrucciones del ejercicio</p>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-5 text-center space-y-4">
            <p className="text-5xl font-bold text-primary">{score}%</p>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? "Excelente trabajo" : score >= 60 ? "Buen intento, sigue practicando" : "Necesitas más práctica — no te rindas"}
            </p>
            <div className="flex gap-3">
              <StageButton variant="glass" onClick={() => { setPhase("detail"); }} className="flex-1">
                REPETIR
              </StageButton>
              <StageButton variant="primary" onClick={() => { setPhase("list"); setSelectedExercise(null); setExerciseDetail(null); }} className="flex-1">
                SIGUIENTE
              </StageButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StudioRoom>
  );
};

export default Exercises;
