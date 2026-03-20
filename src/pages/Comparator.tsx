import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, Play, Pause, TrendingUp, Calendar, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Recording {
  id: string;
  title: string | null;
  file_url: string;
  module: string;
  created_at: string;
  duration_seconds: number | null;
  metadata: any;
}

const Comparator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(-1);
  const [playingBefore, setPlayingBefore] = useState(false);
  const [playingAfter, setPlayingAfter] = useState(false);
  const beforeAudioRef = useRef<HTMLAudioElement | null>(null);
  const afterAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("recordings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const recs = data || [];
        setRecordings(recs);
        if (recs.length >= 2) {
          setBeforeIdx(0);
          setAfterIdx(recs.length - 1);
        }
        setLoading(false);
      });
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

  // Extract scores from metadata
  const getScores = (rec: Recording) => {
    const meta = rec.metadata as any;
    if (meta?.scores) return meta.scores;
    return null;
  };

  const beforeRec = recordings[beforeIdx];
  const afterRec = afterIdx >= 0 ? recordings[afterIdx] : null;
  const beforeScores = beforeRec ? getScores(beforeRec) : null;
  const afterScores = afterRec ? getScores(afterRec) : null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GitCompareArrows className="h-16 w-16 text-primary/40" />
        <h2 className="font-serif text-2xl font-bold text-foreground text-center">Before / After</h2>
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
        <div className="text-muted-foreground">Cargando grabaciones...</div>
      </div>
    );
  }

  if (recordings.length < 2) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GitCompareArrows className="h-16 w-16 text-primary/40" />
        <h2 className="font-serif text-2xl font-bold text-foreground text-center">Before / After</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Necesitás al menos 2 grabaciones para comparar. ¡Ve a cantar primero!
        </p>
        <StageButton variant="primary" onClick={() => navigate("/karaoke")}>
          IR A CANTAR
        </StageButton>
      </div>
    );
  }

  // Calculate deltas
  const metrics = beforeScores && afterScores
    ? [
        { name: "Afinación", before: beforeScores.pitch || 0, after: afterScores.pitch || 0 },
        { name: "Timing", before: beforeScores.timing || 0, after: afterScores.timing || 0 },
        { name: "Expresión", before: beforeScores.expression || 0, after: afterScores.expression || 0 },
      ]
    : null;

  const totalDelta = metrics
    ? Math.round(metrics.reduce((a, m) => a + (m.after - m.before), 0) / metrics.length)
    : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GitCompareArrows className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Before / After</h1>
          <p className="text-sm text-muted-foreground">Compara tu evolución vocal</p>
        </div>
      </div>

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
            {beforeScores && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Pitch</p>
                  <p className="text-sm font-bold text-muted-foreground">{beforeScores.pitch}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Timing</p>
                  <p className="text-sm font-bold text-muted-foreground">{beforeScores.timing}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Expresión</p>
                  <p className="text-sm font-bold text-muted-foreground">{beforeScores.expression}</p>
                </div>
              </div>
            )}
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
            {afterScores && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Pitch</p>
                  <p className="text-sm font-bold text-primary">{afterScores.pitch}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Timing</p>
                  <p className="text-sm font-bold text-primary">{afterScores.timing}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">Expresión</p>
                  <p className="text-sm font-bold text-primary">{afterScores.expression}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delta badge */}
      {totalDelta !== null && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex justify-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${
            totalDelta >= 0
              ? "bg-primary/10 border-primary/20"
              : "bg-destructive/10 border-destructive/20"
          }`}>
            <TrendingUp className={`h-5 w-5 ${totalDelta >= 0 ? "text-primary" : "text-destructive"}`} />
            <span className={`font-serif text-lg font-bold ${totalDelta >= 0 ? "text-primary" : "text-destructive"}`}>
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
              {metrics.map((m) => {
                const delta = m.after - m.before;
                return (
                  <div key={m.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{m.name}</span>
                      <span className={`font-bold ${delta >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                        {delta >= 0 ? "+" : ""}{delta}%
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
                );
              })}
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
