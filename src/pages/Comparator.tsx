import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, Play, Pause, TrendingUp, TrendingDown, Calendar, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";

interface Recording {
  id: string;
  title: string | null;
  file_url: string;
  module: string;
  created_at: string;
  duration_seconds: number | null;
  metadata: any;
}

interface ComparisonResult {
  before: { date: string; song: string; pitch: number; timing: number; expression: number; overall: number };
  after: { date: string; song: string; pitch: number; timing: number; expression: number; overall: number };
  deltas: { pitch: number; timing: number; expression: number; overall: number };
  days_between: number;
  summary: string;
}

const Comparator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(-1);
  const [playingBefore, setPlayingBefore] = useState(false);
  const [playingAfter, setPlayingAfter] = useState(false);
  const beforeAudioRef = useRef<HTMLAudioElement | null>(null);
  const afterAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    trackEvent(user.id, "module_visited", { module: "comparator" });

    // Try edge function suggest_pair first
    (async () => {
      try {
        const { data: suggestion } = await supabase.functions.invoke("compare-recordings", {
          body: { action: "suggest_pair", user_id: user.id },
        });
        if (suggestion?.suggestion) {
          // Load the comparison
          const { data: comp } = await supabase.functions.invoke("compare-recordings", {
            body: {
              action: "compare",
              user_id: user.id,
              recording_a_id: suggestion.suggestion.before?.recording_id,
              recording_b_id: suggestion.suggestion.after?.recording_id,
            },
          });
          if (comp?.comparison) {
            setComparison(comp.comparison);
            trackEvent(user.id, "comparison_made");
          }
        }
      } catch {}

      // Also load recordings for manual selection
      const { data } = await supabase
        .from("recordings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      const recs = data || [];
      setRecordings(recs);
      if (recs.length >= 2) {
        setBeforeIdx(0);
        setAfterIdx(recs.length - 1);
      }
      setLoading(false);
    })();
  }, [user]);

  const togglePlay = (which: "before" | "after") => {
    const rec = which === "before" ? recordings[beforeIdx] : recordings[afterIdx];
    if (!rec) return;
    const ref = which === "before" ? beforeAudioRef : afterAudioRef;
    const setPlaying = which === "before" ? setPlayingBefore : setPlayingAfter;

    if (!ref.current) {
      ref.current = new Audio(rec.file_url);
      ref.current.onended = () => setPlaying(false);
    } else if (ref.current.src !== rec.file_url) {
      ref.current.src = rec.file_url;
    }

    if (which === "before" ? playingBefore : playingAfter) {
      ref.current.pause();
      setPlaying(false);
    } else {
      ref.current.play();
      setPlaying(true);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GitCompareArrows className="h-16 w-16 text-primary/40" />
        <h2 className="font-display text-2xl font-bold text-foreground text-center">Before / After</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Inicia sesión para comparar tus grabaciones y ver tu evolución vocal.
        </p>
        <StageButton variant="primary" icon={<LogIn className="h-5 w-5" />} onClick={() => navigate("/login")}>
          INICIAR SESIÓN
        </StageButton>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (recordings.length < 2) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GitCompareArrows className="h-16 w-16 text-primary/40" />
        <h2 className="font-display text-2xl font-bold text-foreground text-center">Before / After</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Necesitás al menos 2 grabaciones para comparar. ¡Ve a cantar primero!
        </p>
        <StageButton variant="primary" onClick={() => navigate("/karaoke")}>
          IR A CANTAR
        </StageButton>
      </div>
    );
  }

  // Use comparison from edge function if available, otherwise fallback to metadata
  const getMetrics = () => {
    if (comparison) {
      return [
        { name: "Afinación", before: comparison.before.pitch, after: comparison.after.pitch, delta: comparison.deltas.pitch },
        { name: "Timing", before: comparison.before.timing, after: comparison.after.timing, delta: comparison.deltas.timing },
        { name: "Expresión", before: comparison.before.expression, after: comparison.after.expression, delta: comparison.deltas.expression },
      ];
    }
    const beforeRec = recordings[beforeIdx];
    const afterRec = afterIdx >= 0 ? recordings[afterIdx] : null;
    const bScores = (beforeRec?.metadata as any)?.scores;
    const aScores = (afterRec?.metadata as any)?.scores;
    if (bScores && aScores) {
      return [
        { name: "Afinación", before: bScores.pitch || 0, after: aScores.pitch || 0, delta: (aScores.pitch || 0) - (bScores.pitch || 0) },
        { name: "Timing", before: bScores.timing || 0, after: aScores.timing || 0, delta: (aScores.timing || 0) - (bScores.timing || 0) },
        { name: "Expresión", before: bScores.expression || 0, after: aScores.expression || 0, delta: (aScores.expression || 0) - (bScores.expression || 0) },
      ];
    }
    return null;
  };

  const metrics = getMetrics();
  const totalDelta = metrics ? Math.round(metrics.reduce((a, m) => a + m.delta, 0) / metrics.length) : null;
  const beforeRec = recordings[beforeIdx];
  const afterRec = afterIdx >= 0 ? recordings[afterIdx] : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GitCompareArrows className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Before / After</h1>
          <p className="text-sm text-muted-foreground">Compara tu evolución vocal</p>
        </div>
      </div>

      {/* AI Summary */}
      {comparison?.summary && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border-primary/20">
          <p className="text-sm text-foreground leading-relaxed">{comparison.summary}</p>
          {comparison.days_between > 0 && (
            <p className="text-xs text-muted-foreground mt-2">📅 {comparison.days_between} días entre grabaciones</p>
          )}
        </motion.div>
      )}

      {/* Recording selector */}
      <div className="flex flex-wrap gap-2">
        {recordings.map((r, i) => (
          <motion.button
            key={r.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (i < afterIdx || afterIdx < 0) setBeforeIdx(i);
              else setAfterIdx(i);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              i === beforeIdx
                ? "bg-muted-foreground/20 text-foreground ring-1 ring-muted-foreground/30"
                : i === afterIdx
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3 w-3 inline mr-1" />
            {formatDate(r.created_at)} — {r.title || r.module}
          </motion.button>
        ))}
      </div>

      {/* Split players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-muted-foreground/10">ANTES</Badge>
              {beforeRec ? formatDate(beforeRec.created_at) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">{beforeRec?.title || beforeRec?.module}</p>
            <StageButton
              variant="glass"
              icon={playingBefore ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              onClick={() => togglePlay("before")}
              className="w-full"
            >
              {playingBefore ? "PAUSAR" : "REPRODUCIR"}
            </StageButton>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge className="text-[10px] bg-primary/20 text-primary border-0">DESPUÉS</Badge>
              {afterRec ? formatDate(afterRec.created_at) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">{afterRec?.title || afterRec?.module}</p>
            {afterRec && (
              <StageButton
                variant="primary"
                icon={playingAfter ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                onClick={() => togglePlay("after")}
                className="w-full"
              >
                {playingAfter ? "PAUSAR" : "REPRODUCIR"}
              </StageButton>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delta badge */}
      {totalDelta !== null && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex justify-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${
            totalDelta >= 0 ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
          }`}>
            {totalDelta >= 0 ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            <span className={`font-display text-lg font-bold ${totalDelta >= 0 ? "text-primary" : "text-destructive"}`}>
              Mejora: {totalDelta >= 0 ? "+" : ""}{totalDelta}% promedio
            </span>
          </div>
        </motion.div>
      )}

      {/* Metrics comparison bars */}
      {metrics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas comparativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((m) => (
                <div key={m.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{m.name}</span>
                    <span className={`font-bold ${m.delta >= 0 ? "text-primary" : "text-destructive"}`}>
                      {m.delta >= 0 ? "+" : ""}{m.delta}%
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.before}%` }}
                      transition={{ duration: 0.8 }}
                      className="absolute h-full rounded-full bg-muted-foreground/30"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.after}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="absolute h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Antes: {m.before}%</span>
                    <span>Después: {m.after}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!metrics && (
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Las grabaciones no tienen datos de scores. Graba en modo Karaoke para obtener métricas comparativas.
          </p>
        </div>
      )}
    </div>
  );
};

export default Comparator;
