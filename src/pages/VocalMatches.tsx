import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Mic, Music, RefreshCw, User } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface VocalMatch {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  compatibility: number;
  vocal_range: string;
  classification: string;
}

const VocalMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<VocalMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFingerprint, setHasFingerprint] = useState(true);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "matches" });
  }, []);

  const fetchMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vocal-match", {
        body: { action: "find_matches", user_id: user.id },
      });
      if (error) throw error;
      if (data?.error === "no_fingerprint") {
        setHasFingerprint(false);
        setMatches([]);
      } else {
        setMatches(data?.matches || []);
        setHasFingerprint(true);
      }
    } catch {
      toast.error("Error buscando matches vocales");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchMatches();
  }, [user]);

  return (
    <StudioRoom
      roomId="emotion"
      heroContent={
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-display mt-2">Vocal Matches</h1>
          <p className="text-sm text-muted-foreground">
            Encuentra voces complementarias
          </p>
        </div>
      }
    >
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {!user && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Inicia sesion para encontrar matches vocales
            </p>
          </div>
        )}

        {user && loading && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Buscando voces compatibles...
            </p>
          </div>
        )}

        {user && !loading && !hasFingerprint && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <Mic className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-display">
              Completa tu test de ADN vocal
            </h2>
            <p className="text-sm text-muted-foreground">
              Necesitamos tu huella vocal para encontrar voces que complementen
              la tuya.
            </p>
            <StageButton
              onClick={() => (window.location.href = "/vocal-dna-test")}
            >
              Hacer test vocal
            </StageButton>
          </div>
        )}

        {user && !loading && hasFingerprint && matches.length === 0 && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <Music className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h2 className="text-lg font-display">Sin matches aun</h2>
            <p className="text-sm text-muted-foreground">
              No hay suficientes usuarios con huella vocal. Invita a tus amigos.
            </p>
            <StageButton variant="glass" onClick={fetchMatches}>
              <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
            </StageButton>
          </div>
        )}

        {user && !loading && matches.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {matches.length} voces compatibles
              </p>
              <StageButton variant="glass" onClick={fetchMatches}>
                <RefreshCw className="w-4 h-4" />
              </StageButton>
            </div>
            <div className="space-y-3">
              {matches.map((match, i) => (
                <motion.div
                  key={match.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4 rounded-2xl flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {match.avatar_url ? (
                      <img
                        src={match.avatar_url}
                        className="w-12 h-12 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm truncate">
                      {match.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.classification} · {match.vocal_range}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-display text-primary">
                      {match.compatibility}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">match</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudioRoom>
  );
};

export default VocalMatches;
