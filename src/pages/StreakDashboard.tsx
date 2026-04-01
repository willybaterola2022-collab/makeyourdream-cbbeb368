import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, Trophy, Star } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { StreakFlame } from "@/components/StreakFlame";

const MILESTONES = [
  { days: 7, label: "Primera semana", emoji: "🔥", unlocked: false },
  { days: 14, label: "Dos semanas", emoji: "⚡", unlocked: false },
  { days: 30, label: "Un mes", emoji: "🌟", unlocked: false },
  { days: 60, label: "Dos meses", emoji: "💎", unlocked: false },
  { days: 100, label: "Centurión", emoji: "👑", unlocked: false },
  { days: 365, label: "Un año", emoji: "🏆", unlocked: false },
];

const StreakDashboard = () => {
  const { user } = useAuth();
  const { data: progress, isLoading } = useUserProgress();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "streak" }); }, []);

  const streak = progress?.streak_days || 0;
  const longest = progress?.longest_streak || 0;
  const milestones = MILESTONES.map(m => ({ ...m, unlocked: longest >= m.days }));

  // Generate last 12 weeks heatmap (84 days)
  const heatmap = useMemo(() => {
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const active = i < streak;
      days.push({ offset: i, active });
    }
    return days;
  }, [streak]);

  return (
    <StudioRoom config={{ hero: "trophy", title: "Tu Racha", subtitle: `${streak} días consecutivos` }}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        {/* Current streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <StreakFlame streak={streak} />
          </div>
          <div>
            <p className="text-5xl font-display text-primary">{streak}</p>
            <p className="text-sm text-muted-foreground">días de racha actual</p>
          </div>
          <p className="text-xs text-muted-foreground">Récord personal: {longest} días</p>
        </motion.div>

        {/* Heatmap */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Últimos 84 días
          </h3>
          <div className="grid grid-cols-12 gap-1">
            {heatmap.map((d, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm transition-colors ${d.active ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" : "bg-muted/30"}`} />
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Hitos
          </h3>
          {milestones.map(m => (
            <div key={m.days} className={`glass-card p-3 rounded-xl flex items-center gap-3 transition-opacity ${m.unlocked ? "opacity-100" : "opacity-40"}`}>
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.days} días</p>
              </div>
              {m.unlocked && <Star className="w-5 h-5 text-primary fill-primary" />}
            </div>
          ))}
        </div>
      </div>
    </StudioRoom>
  );
};

export default StreakDashboard;
