import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Film, Share2, TrendingUp, Award, Flame, Music } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useUserProgress, getPhase } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const RecapReel = () => {
  const { user } = useAuth();
  const { data: progress } = useUserProgress();
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "recap" });
    if (!user?.id) return;
    supabase.from("training_sessions").select("*", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setSessionCount(count || 0));
  }, [user?.id]);

  const level = progress?.level || 1;
  const phase = getPhase(level);
  const badges: string[] = Array.isArray(progress?.badges) ? progress.badges : [];

  const shareRecap = async () => {
    if (!user?.id) return;
    try {
      await supabase.functions.invoke("generate-share-card", {
        body: { user_id: user.id, card_type: "recap", card_data: { xp: progress?.xp, level, streak: progress?.streak_days, sessions: sessionCount } },
      });
      toast.success("Card generada para compartir");
    } catch { toast.error("Error al generar card"); }
  };

  const stats = [
    { icon: TrendingUp, label: "XP total", value: progress?.xp || 0 },
    { icon: Flame, label: "Racha", value: `${progress?.streak_days || 0}d` },
    { icon: Music, label: "Sesiones", value: sessionCount },
    { icon: Award, label: "Badges", value: badges.length },
  ];

  return (
    <StudioRoom roomId="challenges" heroContent={<div className="text-center"><Film className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Tu Recap</h1></div>}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl text-center space-y-3">
          <p className="text-4xl">{phase.emoji}</p>
          <h2 className="text-xl font-display">{phase.name}</h2>
          <p className="text-sm text-muted-foreground">Nivel {level}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-4 rounded-xl text-center space-y-1">
              <s.icon className="w-5 h-5 mx-auto text-primary" />
              <p className="text-xl font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Badges</h3>
            <div className="flex flex-wrap gap-2">{badges.map(b => <span key={b} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">{b}</span>)}</div>
          </div>
        )}

        <StageButton onClick={shareRecap}><Share2 className="w-4 h-4 mr-2" /> Compartir mi recap</StageButton>
      </div>
    </StudioRoom>
  );
};

export default RecapReel;
