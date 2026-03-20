import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Duelos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [duels, setDuels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("duels")
      .select("*")
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { setDuels(data ?? []); setLoading(false); });
  }, [user]);

  const createDuel = async () => {
    if (!user) { navigate("/login"); return; }
    const { data, error } = await supabase.from("duels").insert([{
      challenger_id: user.id,
      song_title: "Freestyle Battle",
      status: "pending",
    }]).select().single();
    if (data) {
      setDuels((prev) => [data, ...prev]);
      toast.success("¡Duelo creado! Esperando rival...");
    }
  };

  const activeDuels = duels.filter(d => d.status !== "completed");
  const completedDuels = duels.filter(d => d.status === "completed");

  return (
    <StudioRoom
      roomId="duelos"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div className="text-8xl md:text-[130px]"
            animate={{ rotateZ: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}>
            ⚔️
          </motion.div>
          <Badge className="mt-2 stage-gradient text-primary-foreground text-sm px-4 py-1">
            {activeDuels.length} duelos activos
          </Badge>
        </motion.div>
      }
    >
      {/* Create duel */}
      <StageButton variant="primary" icon={<Swords className="h-5 w-5" />} onClick={createDuel} pulse className="w-full">
        BUSCAR RIVAL
      </StageButton>

      {/* Active Duels */}
      {activeDuels.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🔥 Duelos activos</span>
          {activeDuels.map((duel, i) => (
            <motion.div key={duel.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{duel.song_title || "Freestyle"}</p>
                <p className="text-xs text-muted-foreground capitalize">{duel.status}</p>
              </div>
              <Badge variant={duel.status === "pending" ? "outline" : "default"}>
                {duel.status === "pending" ? "Esperando" : "En curso"}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completedDuels.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Historial</span>
          {completedDuels.map((duel, i) => (
            <div key={duel.id} className="glass-card p-3 flex items-center justify-between opacity-60">
              <span className="text-sm text-foreground">{duel.song_title}</span>
              <span className="text-xs font-bold">{duel.winner_id === user?.id ? "🏆 Victoria" : "Derrota"}</span>
            </div>
          ))}
        </div>
      )}

      {duels.length === 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground py-4">No tienes duelos aún. ¡Crea uno!</p>
      )}
    </StudioRoom>
  );
}
