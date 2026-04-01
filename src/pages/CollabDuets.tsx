import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Mic, Music, RefreshCw, Plus } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface Recording {
  id: string;
  title: string | null;
  module: string;
  created_at: string;
}

interface Duet {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const CollabDuets = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [duets, setDuets] = useState<Duet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "duets" });
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch user recordings
      const { data: recs } = await supabase
        .from("recordings")
        .select("id, title, module, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setRecordings(recs || []);

      // Fetch collab rooms as duets
      const { data: rooms } = await supabase
        .from("collab_rooms")
        .select("id, title, status, created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      setDuets(rooms || []);
    } catch {
      toast.error("Error cargando datos");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const mergeTracks = async () => {
    if (!user || !selectedA || !selectedB) return;
    setMerging(true);
    try {
      const { data, error } = await supabase.functions.invoke("audio-merge", {
        body: {
          action: "merge",
          user_id: user.id,
          recording_a_id: selectedA,
          recording_b_id: selectedB,
        },
      });
      if (error) throw error;
      toast.success("Dueto creado");
      setSelectedA(null);
      setSelectedB(null);
      fetchData();
    } catch {
      toast.error("Error al crear dueto");
    }
    setMerging(false);
  };

  return (
    <StudioRoom
      roomId="collab"
      heroContent={
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-display mt-2">Collab Duets</h1>
          <p className="text-sm text-muted-foreground">
            Canta con otros artistas
          </p>
        </div>
      }
    >
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {!user && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4">
            <Music className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Inicia sesion para crear duetos
            </p>
          </div>
        )}

        {user && loading && (
          <div className="glass-card p-8 rounded-2xl text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RefreshCw className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
          </div>
        )}

        {user && !loading && (
          <>
            {/* Create duet section */}
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <h2 className="text-sm font-display flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Crear dueto
              </h2>
              {recordings.length < 2 ? (
                <p className="text-xs text-muted-foreground">
                  Necesitas al menos 2 grabaciones para crear un dueto. Ve a Karaoke o Cover Studio a grabar.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Pista A:</p>
                    <div className="flex gap-2 flex-wrap">
                      {recordings.slice(0, 6).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedA(r.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs ${
                            selectedA === r.id
                              ? "bg-primary text-primary-foreground"
                              : "glass-card"
                          }`}
                        >
                          {r.title || r.module}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Pista B:</p>
                    <div className="flex gap-2 flex-wrap">
                      {recordings
                        .filter((r) => r.id !== selectedA)
                        .slice(0, 6)
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedB(r.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs ${
                              selectedB === r.id
                                ? "bg-primary text-primary-foreground"
                                : "glass-card"
                            }`}
                          >
                            {r.title || r.module}
                          </button>
                        ))}
                    </div>
                  </div>
                  <StageButton
                    onClick={mergeTracks}
                    disabled={!selectedA || !selectedB || merging}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {merging ? "Mezclando..." : "Mezclar pistas"}
                  </StageButton>
                </>
              )}
            </div>

            {/* Existing duets */}
            {duets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-display">Mis duetos</h3>
                {duets.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-3 rounded-xl flex items-center gap-3"
                  >
                    <Users className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.status} · {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </StudioRoom>
  );
};

export default CollabDuets;
