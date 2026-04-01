import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Users } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const VocalBattle = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"lobby" | "waiting" | "battle" | "result">("lobby");
  const [round, setRound] = useState(1);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "vocal-battle" }); }, []);

  const startBattle = async () => {
    if (!user?.id) { toast.error("Inicia sesión para batallar"); return; }
    setPhase("waiting");
    try {
      const { data } = await supabase.functions.invoke("duel-matchmaking", {
        body: { user_id: user.id, action: "find_match" },
      });
      if (data) { setPhase("battle"); setRound(1); }
    } catch { setPhase("battle"); setRound(1); }
  };

  return (
    <StudioRoom roomId="duelos" heroContent={<div className="text-center"><Swords className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Vocal Battle</h1><p className="text-sm text-muted-foreground">Rondas múltiples, un ganador</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {phase === "lobby" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <Users className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-lg font-display">Modo Batalla</h2>
              <p className="text-sm text-muted-foreground">3 rondas contra otro cantante. Gana 2 de 3 para avanzar en el bracket.</p>
            </div>
            <StageButton onClick={startBattle}>Buscar oponente</StageButton>
          </motion.div>
        )}

        {phase === "waiting" && (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Buscando oponente...</p>
          </div>
        )}

        {phase === "battle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Ronda {round} de 3</p>
            <div className="flex items-center justify-center gap-6">
              <div className="glass-card p-4 rounded-xl text-center flex-1"><p className="text-2xl">🎤</p><p className="text-xs mt-1">Tú</p></div>
              <span className="text-primary font-display text-xl">VS</span>
              <div className="glass-card p-4 rounded-xl text-center flex-1"><p className="text-2xl">🎙️</p><p className="text-xs mt-1">Oponente</p></div>
            </div>
            <StageButton onClick={() => { if (round >= 3) setPhase("result"); else setRound(r => r + 1); }}>
              {round >= 3 ? "Ver resultado" : "Siguiente ronda"}
            </StageButton>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <Trophy className="w-16 h-16 mx-auto text-primary" />
            <h2 className="text-2xl font-display">¡Victoria!</h2>
            <StageButton variant="glass" onClick={() => { setPhase("lobby"); setRound(1); }}>Otra batalla</StageButton>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default VocalBattle;
