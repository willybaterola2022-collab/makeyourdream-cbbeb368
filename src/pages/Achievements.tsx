import { useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const ALL_BADGES = [
  { id: "first_recording", label: "Primera Grabación", desc: "Graba tu primera canción", emoji: "🎤" },
  { id: "streak_7", label: "Semana de Fuego", desc: "7 días de racha", emoji: "🔥" },
  { id: "streak_30", label: "Mes Imparable", desc: "30 días de racha", emoji: "⚡" },
  { id: "first_s_rank", label: "Perfección", desc: "Consigue un rango S", emoji: "💎" },
  { id: "xp_1000", label: "Millar", desc: "Acumula 1000 XP", emoji: "🌟" },
  { id: "xp_5000", label: "Leyenda XP", desc: "Acumula 5000 XP", emoji: "👑" },
  { id: "fingerprint_created", label: "Huella Vocal", desc: "Completa tu test de ADN vocal", emoji: "🧬" },
  { id: "duel_won", label: "Gladiador", desc: "Gana tu primer duelo", emoji: "⚔️" },
  { id: "social_first_post", label: "Voz Pública", desc: "Publica en el feed", emoji: "📢" },
  { id: "10_sessions", label: "Dedicación", desc: "Completa 10 sesiones", emoji: "🎯" },
  { id: "cover_published", label: "Artista", desc: "Publica un cover", emoji: "🎵" },
  { id: "collab_first", label: "Colaborador", desc: "Completa una colaboración", emoji: "🤝" },
];

const Achievements = () => {
  const { user } = useAuth();
  const { data: progress } = useUserProgress();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "achievements" }); }, []);

  const userBadges: string[] = Array.isArray(progress?.badges) ? progress.badges : [];
  const unlocked = ALL_BADGES.filter(b => userBadges.includes(b.id));
  const locked = ALL_BADGES.filter(b => !userBadges.includes(b.id));

  return (
    <StudioRoom config={{ hero: "trophy", title: "Galería de Logros", subtitle: `${unlocked.length} de ${ALL_BADGES.length} desbloqueados` }}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        {unlocked.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Desbloqueados ({unlocked.length})
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 rounded-2xl text-center space-y-2 shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
                  <span className="text-3xl block">{b.emoji}</span>
                  <p className="text-xs font-medium leading-tight">{b.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" /> Por desbloquear ({locked.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {locked.map(b => (
              <div key={b.id} className="glass-card p-4 rounded-2xl text-center space-y-2 opacity-30">
                <span className="text-3xl block grayscale">{b.emoji}</span>
                <p className="text-xs font-medium leading-tight">{b.label}</p>
                <p className="text-[10px] text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudioRoom>
  );
};

export default Achievements;
