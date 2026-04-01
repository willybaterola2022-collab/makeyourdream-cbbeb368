import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Wind, Music, Mic, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const STEPS = [
  { id: "breathe", label: "Respiración", icon: Wind, duration: 60, instruction: "Inhala 4s — Sostén 4s — Exhala 6s", color: "text-blue-400" },
  { id: "scales", label: "Escalas", icon: Music, duration: 90, instruction: "Sigue las notas con tu voz", color: "text-primary" },
  { id: "phrase", label: "Frase del Día", icon: Mic, duration: 60, instruction: "Canta esta frase con emoción", color: "text-amber-400" },
];

const DailyFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<"intro" | "active" | "done">("intro");
  const [timeLeft, setTimeLeft] = useState(STEPS[0].duration);
  const [dailyPhrase, setDailyPhrase] = useState("Hoy canto con todo mi corazón");
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "daily-flow" });
    supabase.functions.invoke("daily-exercise", {
      body: { action: "get_recommended", user_id: user?.id || "anon" },
    }).then(({ data }) => {
      if (data?.phrase) setDailyPhrase(data.phrase);
    }).catch(() => {});
  }, []);

  const startFlow = () => {
    setPhase("active");
    setCurrentStep(0);
    setTimeLeft(STEPS[0].duration);
    startTimer(STEPS[0].duration);
  };

  const startTimer = (duration: number) => {
    clearInterval(timerRef.current);
    let t = duration;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        advanceStep();
      }
    }, 1000);
  };

  const advanceStep = () => {
    const next = currentStep + 1;
    if (next >= STEPS.length) {
      setPhase("done");
      saveSession();
    } else {
      setCurrentStep(next);
      setTimeLeft(STEPS[next].duration);
      startTimer(STEPS[next].duration);
    }
  };

  const saveSession = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.functions.invoke("save-training-session", {
        body: { user_id: user.id, module: "daily-flow", scores: { pitch: 75, timing: 80, expression: 70 }, song_title: "Daily Warmup" },
      });
      if (data?.grade) toast.success(`${data.grade} — +${data.xp_earned} XP`);
      trackEvent(user.id, "daily_flow_completed", { grade: data?.grade });
    } catch { toast.error("No se pudo guardar la sesión"); }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const step = STEPS[currentStep];
  const totalDuration = STEPS.reduce((a, s) => a + s.duration, 0);
  const elapsed = STEPS.slice(0, currentStep).reduce((a, s) => a + s.duration, 0) + (step.duration - timeLeft);
  const progress = (elapsed / totalDuration) * 100;

  return (
    <StudioRoom config={{ hero: "thermometer", title: "Rutina Diaria", subtitle: "5 minutos para despertar tu voz" }}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {phase === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-display">Buenos días, artista</h2>
            <p className="text-muted-foreground">3 pasos · {Math.round(totalDuration / 60)} minutos · tu voz lo agradecerá</p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 glass-card p-3 rounded-xl">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-sm flex-1">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.duration}s</span>
                </div>
              ))}
            </div>
            <StageButton onClick={startFlow} className="w-full">Empezar rutina</StageButton>
          </motion.div>
        )}

        {phase === "active" && (
          <motion.div key={currentStep} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center space-y-6">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Paso {currentStep + 1} de {STEPS.length}</p>
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className={`w-10 h-10 ${step.color}`} />
            </div>
            <h2 className="text-xl font-display">{step.label}</h2>
            <p className="text-muted-foreground">{step.id === "phrase" ? dailyPhrase : step.instruction}</p>
            <div className="text-5xl font-mono text-primary tabular-nums">{timeLeft}s</div>
            <motion.div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/20 relative" style={{ background: `conic-gradient(hsl(var(--primary)) ${(1 - timeLeft / step.duration) * 360}deg, transparent 0deg)` }}>
              <div className="absolute inset-1 rounded-full bg-background" />
            </motion.div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-display">¡Rutina completada!</h2>
            <p className="text-muted-foreground">Tu voz está lista para el día</p>
            <div className="flex gap-3 justify-center">
              <StageButton variant="outline" onClick={() => { setPhase("intro"); setCurrentStep(0); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Repetir
              </StageButton>
            </div>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default DailyFlow;
