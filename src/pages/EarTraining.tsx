import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Headphones, Mic, RotateCcw, Volume2, ChevronRight } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";
import MicroTutorial from "@/components/MicroTutorial";

const EarTraining = () => {
  const { user } = useAuth();
  const { playNote } = useAudioEngine();
  const { saveSession } = useTrainingSession();
  const { isListening, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);

  const [level, setLevel] = useState(1);
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"listen" | "sing" | "result">("listen");
  const [result, setResult] = useState<any>(null);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(10);
  const [scores, setScores] = useState<number[]>([]);
  const [centsOff, setCentsOff] = useState(0);
  const [direction, setDirection] = useState<string>("");
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "ear-training" }); }, []);

  // Fetch user progress for level
  useEffect(() => {
    if (!user) return;
    supabase.functions.invoke("ear-training", {
      body: { action: "get_progress", user_id: user.id },
    }).then(({ data }) => {
      if (data?.recommended_difficulty) setLevel(data.recommended_difficulty);
    }).catch(() => {});
  }, [user]);

  // Get exercise
  const fetchExercise = useCallback(async () => {
    setLoading(true);
    setPhase("listen");
    setResult(null);
    const { data } = await supabase.functions.invoke("ear-training", {
      body: { action: "get_exercise", difficulty_level: level, exercise_type: "sing_note" },
    });
    setExercise(data?.exercise || null);
    setLoading(false);
  }, [level]);

  useEffect(() => { fetchExercise(); }, [fetchExercise]);

  // Play reference note
  const playReference = () => {
    if (!exercise?.reference_frequency) return;
    playNote(exercise.reference_frequency, 1.5);
  };

  // Start singing phase
  const startSinging = async () => {
    const ok = await requestMic();
    if (!ok) return;
    setPhase("sing");
    setCentsOff(0);
    setDirection("");
  };

  // Evaluate when user has pitch
  useEffect(() => {
    if (phase !== "sing" || !pitch?.frequency || !exercise?.target_frequency) return;
    const cents = 1200 * Math.log2(pitch.frequency / exercise.target_frequency);
    setCentsOff(Math.round(cents));
    setDirection(cents > 5 ? "sharp" : cents < -5 ? "flat" : "perfect");
  }, [pitch?.frequency, phase, exercise]);

  // Submit evaluation
  const evaluate = async () => {
    stopMic();
    if (!pitch?.frequency || !exercise?.target_frequency) {
      setPhase("listen");
      return;
    }

    const { data } = await supabase.functions.invoke("ear-training", {
      body: { action: "evaluate", user_frequency: pitch.frequency, target_frequency: exercise.target_frequency },
    });
    setResult(data);
    setPhase("result");
    setScores(prev => [...prev, data?.correct ? 100 : Math.max(0, 100 - Math.abs(data?.cents_off || 50))]);
  };

  // Next round
  const nextRound = () => {
    if (round + 1 >= totalRounds) {
      finishSession();
      return;
    }
    setRound(r => r + 1);
    fetchExercise();
  };

  // Finish session
  const finishSession = async () => {
    setSessionDone(true);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
    const session = await saveSession({ module: "ear-training", overall_score: avg, pitch_score: avg, song_title: `Ear Training Lvl ${level}` });
    if (session) toast.success(`+XP 👂 Oído entrenado!`);
  };

  const reset = () => {
    setRound(0);
    setScores([]);
    setSessionDone(false);
    fetchExercise();
  };

  // Circle color based on accuracy
  const circleColor = phase === "sing"
    ? direction === "perfect" ? "border-emerald-400 shadow-emerald-400/30" : direction === "sharp" ? "border-amber-400 shadow-amber-400/30" : "border-red-400 shadow-red-400/30"
    : "border-primary shadow-primary/30";

  return (
    <StudioRoom
      roomId="pitch"
      heroContent={
        <motion.div className="flex flex-col items-center z-10">
          <motion.div
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 flex items-center justify-center transition-colors shadow-[0_0_30px_-5px] ${circleColor}`}
            animate={phase === "sing" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {phase === "listen" && <Headphones className="h-12 w-12 text-primary" />}
            {phase === "sing" && (
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{Math.abs(centsOff)}¢</p>
                <p className="text-xs text-muted-foreground">{direction === "sharp" ? "↑ Alto" : direction === "flat" ? "↓ Bajo" : "✓ Perfecto"}</p>
              </div>
            )}
            {phase === "result" && (
              <p className={`text-3xl font-bold ${result?.correct ? "text-emerald-400" : "text-amber-400"}`}>
                {result?.correct ? "✓" : "✗"}
              </p>
            )}
          </motion.div>
        </motion.div>
      }
    >
      <MicroTutorial
        storageKey="ear-training"
        steps={[
          { icon: "👂", title: "Escuchá", description: "La nota referencia" },
          { icon: "🎤", title: "Cantá", description: "Reprodúcela con tu voz" },
          { icon: "🎯", title: "Resultado", description: "Ve tu precisión" },
        ]}
      />

      {/* Progress bar */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs text-muted-foreground">{round + 1}/{totalRounds}</span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full stage-gradient" animate={{ width: `${((round + 1) / totalRounds) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">Lvl {level}</span>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map(l => (
          <button
            key={l}
            onClick={() => { setLevel(l); reset(); }}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${l === level ? "stage-gradient text-primary-foreground" : "glass-card text-muted-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <Skeleton className="h-20 rounded-xl" />}

      {sessionDone ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 py-6">
          <p className="text-5xl">👂</p>
          <p className="text-2xl font-display text-primary">
            {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}% precisión
          </p>
          <p className="text-sm text-muted-foreground">{scores.filter(s => s >= 80).length} de {totalRounds} notas acertadas</p>
          <StageButton onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>Otra ronda</StageButton>
        </motion.div>
      ) : !loading && exercise && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          {phase === "listen" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{exercise.instructions || "Escucha la nota y reprodúcela con tu voz"}</p>
              <StageButton onClick={playReference} icon={<Volume2 className="h-5 w-5" />}>
                Escuchar nota
              </StageButton>
              <StageButton variant="glass" onClick={startSinging} icon={<Mic className="h-5 w-5" />}>
                Cantar
              </StageButton>
            </div>
          )}

          {phase === "sing" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Canta la nota que escuchaste</p>
              {pitch && <p className="text-lg font-mono text-primary">{pitch.note}{pitch.octave}</p>}
              <StageButton onClick={evaluate}>Evaluar</StageButton>
            </div>
          )}

          {phase === "result" && result && (
            <div className="text-center space-y-4">
              <p className={`text-xl font-bold ${result.correct ? "text-emerald-400" : "text-amber-400"}`}>
                {result.correct ? "¡Perfecto!" : result.feedback || `${Math.abs(result.cents_off)}¢ ${result.direction === "sharp" ? "alto" : "bajo"}`}
              </p>
              <StageButton onClick={nextRound} icon={<ChevronRight className="h-4 w-4" />}>
                {round + 1 >= totalRounds ? "Ver resultado" : "Siguiente"}
              </StageButton>
            </div>
          )}
        </div>
      )}
    </StudioRoom>
  );
};

export default EarTraining;
