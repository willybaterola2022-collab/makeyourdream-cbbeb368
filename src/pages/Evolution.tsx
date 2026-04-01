import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";

interface FP { id: string; global_score: number; classification: string; created_at: string; }

const Evolution = () => {
  const { user } = useAuth();
  const [fps, setFps] = useState<FP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "evolution" });
    if (!user?.id) { setLoading(false); return; }
    supabase.from("vocal_fingerprints").select("id,global_score,classification,created_at").eq("user_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => { setFps((data as FP[]) || []); setLoading(false); });
  }, [user?.id]);

  const latest = fps[fps.length - 1];
  const first = fps[0];
  const delta = latest && first ? (latest.global_score || 0) - (first.global_score || 0) : 0;
  const maxScore = Math.max(...fps.map(f => f.global_score || 0), 1);

  return (
    <StudioRoom roomId="diagnostico" heroContent={<div className="text-center"><TrendingUp className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Evolución Vocal</h1><p className="text-sm text-muted-foreground">{fps.length} análisis</p></div>}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
        ) : fps.length === 0 ? (
          <div className="text-center py-12"><TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30" /><p className="text-muted-foreground mt-3">Completa tu primer test de ADN vocal</p></div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl text-center space-y-2">
              <p className="text-4xl font-display text-primary">{latest?.global_score || 0}</p>
              <p className="text-sm text-muted-foreground">Score actual</p>
              {delta !== 0 && (
                <div className={`flex items-center justify-center gap-1 text-sm ${delta > 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {delta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {delta > 0 ? "+" : ""}{delta} desde el primer análisis
                </div>
              )}
            </motion.div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-end gap-1 h-32">
                {fps.map((f, i) => (
                  <motion.div key={f.id} initial={{ height: 0 }} animate={{ height: `${((f.global_score || 0) / maxScore) * 100}%` }}
                    transition={{ delay: i * 0.05 }} className="flex-1 bg-primary/60 rounded-t-sm hover:bg-primary transition-colors min-w-[4px]" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Historial</h3>
              {[...fps].reverse().map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass-card p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{f.global_score}</div>
                  <div className="flex-1"><p className="text-sm font-medium capitalize">{f.classification || "—"}</p><p className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString("es")}</p></div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudioRoom>
  );
};

export default Evolution;
