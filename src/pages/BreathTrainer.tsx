import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronLeft } from "lucide-react";
import { useAudioEngine, noteToFreq } from "@/hooks/useAudioEngine";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroLungs } from "@/components/studio/HeroLungs";
import { Skeleton } from "@/components/ui/skeleton";
import MicroTutorial from "@/components/MicroTutorial";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface Technique {
  id: string;
  name: string;
  description: string;
  purpose: string;
  difficulty: string;
  total_seconds: number;
}

interface TechniqueDetail {
  name: string;
  description: string;
  purpose: string;
  steps: string[];
  pattern: { phase: string; seconds: number }[];
  tips: string[];
  reps: number;
  rest_seconds: number;
}

type Phase = "inhale" | "hold" | "exhale" | "pause";

const phaseEmoji: Record<string, string> = { inhale: "🫁", hold: "⏸️", exhale: "💨", pause: "😌" };
const phaseLabel: Record<string, string> = { inhale: "Inhala", hold: "Aguanta", exhale: "Exhala", pause: "Pausa" };

const BreathTrainer = () => {
  const { user } = useAuth();
  const { playSweep, playTone, stopTone } = useAudioEngine();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "breath-trainer" }); }, []);

  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [selected, setSelected] = useState<Technique | null>(null);
  const [detail, setDetail] = useState<TechniqueDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [patternIdx, setPatternIdx] = useState(0);

  // Fetch technique list
  useEffect(() => {
    supabase.functions.invoke("breath-technique", { body: { action: "list" } })
      .then(({ data }) => {
        if (data?.techniques) setTechniques(data.techniques);
        setLoadingList(false);
      })
      .catch(() => setLoadingList(false));
  }, []);

  // Fetch technique detail
  const selectTechnique = useCallback(async (tech: Technique) => {
    setSelected(tech);
    setLoadingDetail(true);
    setRunning(false);
    setPhase("inhale");
    setTimer(0);
    setReps(0);
    setPatternIdx(0);
    stopTone();

    const { data } = await supabase.functions.invoke("breath-technique", {
      body: { action: "get_technique", technique_id: tech.id },
    });
    setDetail(data?.technique || null);
    setLoadingDetail(false);
  }, [stopTone]);

  // Get current phase duration from pattern
  const currentPhaseDuration = detail?.pattern?.[patternIdx]?.seconds || 4;
  const currentPhaseName = (detail?.pattern?.[patternIdx]?.phase || "inhale") as Phase;

  const playPhaseSound = useCallback((p: Phase) => {
    if (!soundOn) return;
    stopTone();
    switch (p) {
      case "inhale": playSweep(noteToFreq("C4"), noteToFreq("G4"), 0.4, 0.12); break;
      case "hold": playTone(noteToFreq("C3"), "sine", 0.08); break;
      case "exhale": playSweep(noteToFreq("G4"), noteToFreq("C4"), 0.4, 0.12); break;
      case "pause": stopTone(); break;
    }
  }, [soundOn, playSweep, playTone, stopTone]);

  // Timer loop
  useEffect(() => {
    if (!running || !detail?.pattern?.length) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t + 1 >= currentPhaseDuration) {
          // Next pattern step
          const nextIdx = patternIdx + 1;
          if (nextIdx >= detail.pattern.length) {
            // One rep complete
            setReps(r => {
              const newReps = r + 1;
              if (newReps >= (detail.reps || 5)) {
                setRunning(false);
                stopTone();
                // Complete technique
                if (user) {
                  supabase.functions.invoke("breath-technique", {
                    body: { action: "complete", user_id: user.id, technique_id: selected?.id, duration_seconds: (detail.reps || 5) * detail.pattern.reduce((s, p) => s + p.seconds, 0) },
                  }).then(({ data }) => {
                    if (data?.xp_earned) toast.success(`+${data.xp_earned} XP 🫁`);
                  }).catch(() => {});
                }
              }
              return newReps;
            });
            setPatternIdx(0);
            const nextPhase = detail.pattern[0].phase as Phase;
            setPhase(nextPhase);
            playPhaseSound(nextPhase);
          } else {
            setPatternIdx(nextIdx);
            const nextPhase = detail.pattern[nextIdx].phase as Phase;
            setPhase(nextPhase);
            playPhaseSound(nextPhase);
          }
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, currentPhaseDuration, patternIdx, detail, playPhaseSound, user, selected, stopTone]);

  const handleToggle = () => {
    if (!running) { setRunning(true); playPhaseSound(currentPhaseName); }
    else { setRunning(false); stopTone(); }
  };

  const reset = () => {
    setRunning(false); setPhase("inhale"); setTimer(0); setReps(0); setPatternIdx(0); stopTone();
  };

  // Technique list view
  if (!selected) {
    return (
      <StudioRoom roomId="breath" heroContent={<HeroLungs phase="inhale" progress={0} isActive={false} onClick={() => {}} />}>
        <MicroTutorial storageKey="breath" steps={[
          { icon: "🫁", title: "Elige", description: "Una técnica" },
          { icon: "⏸️", title: "Sigue", description: "El ritmo visual" },
          { icon: "💨", title: "Completa", description: "Gana XP" },
        ]} />

        <h2 className="text-lg font-display text-center">Técnicas de Respiración</h2>

        {loadingList && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}

        {!loadingList && techniques.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🫁</p>
            <p className="text-sm text-muted-foreground">No hay técnicas disponibles</p>
          </div>
        )}

        <div className="space-y-3">
          {techniques.map((tech, i) => (
            <motion.button
              key={tech.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => selectTechnique(tech)}
              className="w-full glass-card p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🫁</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{tech.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tech.purpose || tech.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground capitalize">{tech.difficulty}</p>
                <p className="text-xs text-sky-400 font-mono">{tech.total_seconds}s</p>
              </div>
            </motion.button>
          ))}
        </div>
      </StudioRoom>
    );
  }

  // Technique detail + exercise view
  const totalReps = detail?.reps || 5;
  const progress = currentPhaseDuration > 0 ? timer / currentPhaseDuration : 0;

  return (
    <StudioRoom
      roomId="breath"
      heroContent={<HeroLungs phase={phase} progress={progress} isActive={running} onClick={handleToggle} />}
    >
      {/* Back button */}
      <button onClick={() => { reset(); setSelected(null); setDetail(null); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Técnicas
      </button>

      {loadingDetail && <Skeleton className="h-40 rounded-xl" />}

      {!loadingDetail && detail && (
        <>
          {/* Info card */}
          <div className="glass-card p-4 rounded-xl space-y-2">
            <h3 className="text-lg font-display text-foreground">{detail.name}</h3>
            <p className="text-xs text-muted-foreground">{detail.purpose}</p>
            {detail.steps?.length > 0 && (
              <ol className="space-y-1 mt-2">
                {detail.steps.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Phase indicator */}
          <div className="text-center space-y-2">
            <p className="text-4xl">{phaseEmoji[currentPhaseName]}</p>
            <p className="text-2xl font-display text-foreground">{phaseLabel[currentPhaseName]}</p>
            <p className="text-3xl font-bold text-sky-400">{currentPhaseDuration - timer}s</p>
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
              <span className="text-2xl font-bold text-sky-400">{reps}/{totalReps}</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reps</p>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl text-center">
              <span className="text-sm font-bold text-foreground">
                {detail.pattern.map(p => p.seconds).join("-")}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrón</p>
            </div>
          </div>

          {/* Tips */}
          {detail.tips?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tips</p>
              {detail.tips.map((tip, i) => (
                <div key={i} className="glass-card p-3 rounded-xl text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary">💡</span> {tip}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </StudioRoom>
  );
};

export default BreathTrainer;
