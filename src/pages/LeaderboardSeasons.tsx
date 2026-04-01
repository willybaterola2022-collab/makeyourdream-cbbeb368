import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Users, Calendar, RefreshCw } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface Season {
  id: string;
  title: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  xp_earned: number;
  rank: number;
}

const LeaderboardSeasons = () => {
  const { user } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "seasons" });
  }, []);

  const fetchSeason = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seasonal-engine", {
        body: { action: "get_current" },
      });
      if (error) throw error;
      if (data?.season) {
        setSeason(data.season);
        setLeaderboard(data.leaderboard || []);
        if (user && data.leaderboard?.some((e: LeaderboardEntry) => e.user_id === user.id)) {
          setJoined(true);
        }
      }
    } catch {
      toast.error("Error cargando temporada");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeason();
  }, []);

  const joinSeason = async () => {
    if (!user || !season) return;
    setJoining(true);
    try {
      const { error } = await supabase.functions.invoke("seasonal-engine", {
        body: { action: "join", user_id: user.id, season_id: season.id },
      });
      if (error) throw error;
      setJoined(true);
      toast.success("Te uniste a la temporada");
      fetchSeason();
    } catch {
      toast.error("Error al unirse");
    }
    setJoining(false);
  };

  const daysLeft = season
    ? Math.max(0, Math.ceil((new Date(season.end_date).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <StudioRoom
      roomId="challenges"
      heroContent={
        <div className="text-center">
          <Crown className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-display mt-2">Temporadas</h1>
          <p className="text-sm text-muted-foreground">Compite por temporada</p>
        </div>
      }
    >
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {loading && (
          <div className="glass-card p-8 rounded-2xl text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RefreshCw className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
          </div>
        )}

        {!loading && !season && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-display">No hay temporada activa</h2>
            <p className="text-sm text-muted-foreground">
              La proxima temporada se anunciara pronto.
            </p>
          </div>
        )}

        {!loading && season && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-display">{season.title}</h2>
                  <p className="text-xs text-muted-foreground">{season.theme}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display text-primary">{daysLeft}</p>
                  <p className="text-[10px] text-muted-foreground">dias restantes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{season.start_date} → {season.end_date}</span>
              </div>
              {user && !joined && (
                <StageButton onClick={joinSeason} disabled={joining}>
                  <Users className="w-4 h-4 mr-2" /> Unirse a la temporada
                </StageButton>
              )}
              {joined && (
                <p className="text-xs text-primary text-center">Ya estas participando</p>
              )}
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-sm font-display flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Leaderboard
              </h3>
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aun no hay participantes
                </p>
              )}
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-3 rounded-xl flex items-center gap-3 ${
                    entry.user_id === user?.id ? "ring-1 ring-primary" : ""
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
                    i === 0 ? "bg-amber-500/20 text-amber-400" :
                    i === 1 ? "bg-slate-300/20 text-slate-300" :
                    i === 2 ? "bg-orange-600/20 text-orange-400" :
                    "bg-muted/20 text-muted-foreground"
                  }`}>
                    {entry.rank || i + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{entry.display_name}</span>
                  <span className="text-sm font-display text-primary">{entry.xp_earned} XP</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudioRoom>
  );
};

export default LeaderboardSeasons;
