import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Trophy, Star } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { StreakFlame } from "@/components/StreakFlame";

const MILESTONES = [
  { days: 7, label: "Primera semana", emoji: "🔥" },
  { days: 14, label: "Dos semanas", emoji: "⚡" },
  { days: 30, label: "Un mes", emoji: "🌟" },
  { days: 60, label: "Dos meses", emoji: "💎" },
  { days: 100, label: "Centurión", emoji: "👑" },
  { days: 365, label: "Un año", emoji: "🏆" },
];

const StreakDashboard = () => {
  const { user } = useAuth();
  const { data: progress } = useUserProgress();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "streak" }); }, []);

  const streak = progress?.streak_days || 0;
  const longest = progress?.longest_streak || 0;
  const milestones = MILESTONES.map(m => ({ ...m, unlocked: longest >= m.days }));

  const heatmap = useMemo(() => {
    const days = [];
    for (let i = 83; i >= 0; i--) days.push({ offset: i, active: i < streak });
    return days;
  }, [streak]);

  return (
    <StudioRoom roomId="challenges" heroContent={<div className="text-center"><StreakFlame days={streak} className="mx-auto text-3xl" /><h1 className="text-xl font-display mt-2">Tu Racha</h1><p className="text-sm text-muted-foreground">{streak} días consecutivos</p></div>}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <p className="text-5xl font-display text-primary">{streak}</p>
          <p className="text-sm text-muted-foreground">días de racha actual</p>
          <p className="text-xs text-muted-foreground">Récord: {longest} días</p>
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Últimos 84 días</h3>
          <div className="grid grid-cols-12 gap-1">
            {heatmap.map((d, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm ${d.active ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" : "bg-muted/30"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4" /> Hitos</h3>
          {milestones.map(m => (
            <div key={m.days} className={`glass-card p-3 rounded-xl flex items-center gap-3 ${m.unlocked ? "opacity-100" : "opacity-40"}`}>
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1"><p className="text-sm font-medium">{m.label}</p><p className="text-xs text-muted-foreground">{m.days} días</p></div>
              {m.unlocked && <Star className="w-5 h-5 text-primary fill-primary" />}
            </div>
          ))}
        </div>
      </div>
    </StudioRoom>
  );
};

export default StreakDashboard;
