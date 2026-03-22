import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Mic, Zap, CheckCircle2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroTrophy } from "@/components/studio/HeroTrophy";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { trackEvent } from "@/lib/trackEvent";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  reward_xp: number;
  active_date: string;
}

const TYPE_EMOJI: Record<string, string> = {
  sing: "🎤", technique: "🎯", create: "🎨", expression: "💫", pitch: "🎹", warmup: "🔥",
};

const Challenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) trackEvent(user.id, "module_visited", { module: "challenges" });

    async function fetchChallenges() {
      // Try edge function for today's challenge
      if (user) {
        try {
          const { data } = await supabase.functions.invoke("daily-challenge", {
            body: { action: "get_today", user_id: user.id },
          });
          if (data?.challenge) {
            setTodayChallenge(data.challenge);
            setTodayCompleted(data.completed ?? false);
            setHoursRemaining(data.hours_remaining ?? 0);
          }
        } catch {}
      }

      // Fetch upcoming challenges (direct query)
      const today = new Date().toISOString().split("T")[0];
      const { data: upcoming } = await supabase
        .from("daily_challenges")
        .select("*")
        .gt("active_date", today)
        .order("active_date", { ascending: true })
        .limit(7);
      setUpcomingChallenges(upcoming ?? []);

      // Get completions
      if (user) {
        const { data: completions } = await supabase
          .from("challenge_completions")
          .select("challenge_id")
          .eq("user_id", user.id);
        setCompletedIds(new Set(completions?.map((c) => c.challenge_id) ?? []));
      }
      setLoading(false);
    }
    fetchChallenges();
  }, [user]);

  const completeChallenge = async (challengeId: string) => {
    if (!user) { navigate("/login"); return; }
    try {
      const { data } = await supabase.functions.invoke("daily-challenge", {
        body: { action: "complete", user_id: user.id, challenge_id: challengeId },
      });
      if (data?.xp_earned) {
        toast.success(`¡Reto completado! +${data.xp_earned} XP`);
      } else {
        toast.success("¡Reto completado! +XP");
      }
    } catch {
      // Fallback: direct insert
      await supabase.from("challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        score: Math.floor(Math.random() * 30 + 70),
      });
      toast.success("¡Reto completado! +XP");
    }
    setCompletedIds((prev) => new Set([...prev, challengeId]));
    if (todayChallenge?.id === challengeId) setTodayCompleted(true);
    trackEvent(user.id, "challenge_completed", { challenge_id: challengeId });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es", { weekday: "short", day: "numeric" });
  };

  return (
    <StudioRoom
      roomId="challenges"
      heroContent={<HeroTrophy rank={completedIds.size + 1} onClick={() => {}} />}
    >
      {/* Today's challenge */}
      {todayChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-primary/20 shadow-[0_0_25px_-8px_hsl(var(--primary)/0.3)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">⚡ RETO DE HOY</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" /> +{todayChallenge.reward_xp} XP
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
              {TYPE_EMOJI[todayChallenge.challenge_type] || "🎵"}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-foreground">{todayChallenge.title}</h3>
              {todayChallenge.description && (
                <p className="text-sm text-muted-foreground">{todayChallenge.description}</p>
              )}
            </div>
          </div>
          {hoursRemaining > 0 && !todayCompleted && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {Math.round(hoursRemaining)}h restantes
            </p>
          )}
          <div className="mt-4">
            {todayCompleted || completedIds.has(todayChallenge.id) ? (
              <div className="flex items-center gap-2 text-sm text-primary font-bold">
                <CheckCircle2 className="h-5 w-5" /> Completado
              </div>
            ) : (
              <StageButton
                variant="primary"
                icon={<Mic className="h-5 w-5" />}
                onClick={() => completeChallenge(todayChallenge.id)}
                className="w-full"
              >
                ACEPTAR RETO
              </StageButton>
            )}
          </div>
        </motion.div>
      )}

      {/* Upcoming challenges */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Próximos retos</span>
        {upcomingChallenges.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-4 flex items-center gap-3 ${completedIds.has(c.id) ? "opacity-50" : ""}`}
          >
            <span className="text-2xl">{TYPE_EMOJI[c.challenge_type] || "🎵"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{c.title}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(c.active_date)} · +{c.reward_xp} XP</p>
            </div>
            {completedIds.has(c.id) && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
          </motion.div>
        ))}
        {upcomingChallenges.length === 0 && !todayChallenge && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay retos disponibles</p>
        )}
      </div>
    </StudioRoom>
  );
};

export default Challenges;
