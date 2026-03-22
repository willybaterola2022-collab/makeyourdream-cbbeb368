import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Users, Trophy, TrendingUp, Mic } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StageButton } from "@/components/ui/StageButton";
import { useNavigate } from "react-router-dom";

interface Recording {
  id: string;
  title: string | null;
  created_at: string;
  module: string;
  metadata: any;
}

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [progress, setProgress] = useState<{ xp: number; level: number; streak_days: number; badges: any } | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; vocal_level: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const [recRes, progRes, profRes] = await Promise.all([
        supabase.from("recordings").select("id, title, created_at, module, metadata").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("user_progress").select("xp, level, streak_days, badges").eq("user_id", user!.id).maybeSingle(),
        supabase.from("profiles").select("display_name, vocal_level").eq("user_id", user!.id).maybeSingle(),
      ]);
      setRecordings(recRes.data ?? []);
      setProgress(progRes.data);
      setProfile(profRes.data);
    }
    fetch();
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Inicia sesión para ver tu portfolio</p>
        <StageButton variant="primary" onClick={() => navigate("/login")}>Iniciar sesión</StageButton>
      </div>
    );
  }

  const xp = progress?.xp ?? 0;
  const level = progress?.level ?? 1;
  const streak = progress?.streak_days ?? 0;
  const badges = (progress?.badges as any[]) ?? [];
  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Artista";
  const vocalLevel = profile?.vocal_level ?? "principiante";

  const formatDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    return `Hace ${diff} días`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
        <Avatar className="h-20 w-20 mx-auto mb-3">
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-serif font-bold">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-serif text-2xl font-bold text-foreground">{displayName}</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{vocalLevel}</p>

        <div className="flex justify-center gap-6 mt-4">
          {[
            { label: "XP", value: xp.toLocaleString(), icon: Trophy },
            { label: "Nivel", value: `${level}`, icon: TrendingUp },
            { label: "Racha", value: `${streak}🔥`, icon: Award },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-serif font-bold neon-text">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Badges</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {badges.map((b: any, i: number) => (
              <div key={i} className="glass-card p-3 min-w-[80px] text-center shrink-0 border-primary/20">
                <div className="text-2xl mb-1">{b.emoji || "🏅"}</div>
                <p className="text-[10px] text-muted-foreground">{b.name || "Badge"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordings */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Grabaciones recientes</h3>
        {recordings.length > 0 ? (
          <div className="space-y-2">
            {recordings.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${i === 0 ? "stage-gradient" : "bg-muted"}`}>
                  <Mic className={`h-4 w-4 ${i === 0 ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title || r.module}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Aún no tienes grabaciones</p>
            <StageButton variant="primary" icon={<Mic className="h-4 w-4" />} onClick={() => navigate("/karaoke")}>
              Grabar ahora
            </StageButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
