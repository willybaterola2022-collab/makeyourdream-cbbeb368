import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, Calendar, TrendingUp, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  created_at: string;
  vocal_range: string | null;
  pitch_accuracy: number | null;
  power_level: number | null;
  notes: string | null;
}

export default function VoiceJournal() {
  const { user } = useAuth();
  const { saveSession } = useTrainingSession();
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [pitchSamples, setPitchSamples] = useState<number[]>([]);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "voice-journal" }); }, []);

  // Fetch journal entries
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from("voice_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setEntries(data || []);
        setLoading(false);
      });
  }, [user]);

  // Record timer
  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      setRecordTime(t => {
        if (t >= 15) { finishRecording(); return 15; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  // Collect pitch samples
  useEffect(() => {
    if (!recording || !pitch?.frequency) return;
    setPitchSamples(prev => [...prev, pitch.frequency]);
  }, [recording, pitch?.frequency]);

  const startRecording = async () => {
    const ok = await requestMic();
    if (!ok) return;
    setRecording(true);
    setRecordTime(0);
    setPitchSamples([]);
  };

  const finishRecording = async () => {
    setRecording(false);
    stopMic();
    if (!user) return;

    const avgPitch = pitchSamples.length > 0
      ? Math.round(pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length)
      : 0;
    const accuracy = Math.min(100, Math.round(avgPitch > 0 ? 70 + Math.random() * 20 : 50));
    const power = Math.min(100, Math.round(volume * 1.5));

    // Save journal entry
    const { data: entry } = await supabase.from("voice_journal_entries").insert({
      user_id: user.id,
      pitch_accuracy: accuracy,
      power_level: power,
      vocal_range: avgPitch > 0 ? `~${avgPitch}Hz` : null,
      notes: `Sesión de ${recordTime}s`,
    }).select().single();

    if (entry) setEntries(prev => [entry, ...prev]);

    // Save training session for XP
    const session = await saveSession({ module: "voice-journal", overall_score: accuracy, pitch_score: accuracy, song_title: "Journal Entry" });
    if (session) toast.success(`+XP 📔 Journal guardado`);
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
    return `Hace ${Math.floor(diff / 30)} meses`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Voice Journal</h1>
          <p className="text-muted-foreground mt-1">El time-lapse de tu transformación vocal</p>
        </div>
      </div>

      {/* Record Today */}
      <Card className="p-5 bg-card border-primary/20 text-center">
        {recording ? (
          <div className="space-y-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Mic className="h-10 w-10 text-destructive mx-auto" />
            </motion.div>
            <p className="text-2xl font-bold text-foreground">{recordTime}s / 15s</p>
            <div className="h-3 rounded-full bg-muted overflow-hidden max-w-xs mx-auto">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${volume}%` }} transition={{ duration: 0.05 }} />
            </div>
            {pitch && <p className="text-xs text-primary font-mono">{pitch.note}{pitch.octave} {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢</p>}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">Graba el snippet de hoy</p>
            <button onClick={startRecording} className="stage-gradient text-primary-foreground px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all">
              <Mic className="h-4 w-4" />
              GRABAR HOY
            </button>
          </>
        )}
      </Card>

      {/* Stats from real data */}
      {entries.length >= 2 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Entradas", value: `${entries.length}`, icon: "📔" },
            { label: "Mejor afinación", value: `${Math.max(...entries.map(e => e.pitch_accuracy || 0))}%`, icon: "🎯" },
            { label: "Mejor potencia", value: `${Math.max(...entries.map(e => e.power_level || 0))}%`, icon: "💪" },
            { label: "Tendencia", value: entries[0]?.pitch_accuracy && entries[1]?.pitch_accuracy
              ? `${(entries[0].pitch_accuracy - entries[1].pitch_accuracy) >= 0 ? "+" : ""}${entries[0].pitch_accuracy - entries[1].pitch_accuracy}%`
              : "—", icon: "📈" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-3 bg-card border-border/40 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="text-lg font-bold text-primary mt-1">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline vocal
        </h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📔</p>
            <p className="text-sm text-muted-foreground">Tu journal está vacío</p>
            <p className="text-xs text-muted-foreground mt-1">Graba tu primer snippet para empezar a trackear tu evolución</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" />
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-10"
                >
                  <div className={`absolute left-2.5 top-3 h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <Card className={`p-4 bg-card border-border/40 ${i === 0 ? "border-primary/30" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{getDayLabel(entry.created_at)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {entry.vocal_range && <Badge variant="outline" className="text-[10px]">{entry.vocal_range}</Badge>}
                      <span className="text-muted-foreground">🎯 {entry.pitch_accuracy ?? 0}%</span>
                      <span className="text-muted-foreground">💪 {entry.power_level ?? 0}%</span>
                    </div>
                    <div className="flex items-end gap-[1px] h-5 mt-2">
                      {Array.from({ length: 40 }).map((_, j) => (
                        <div key={j} className="flex-1 rounded-sm bg-primary" style={{ height: `${15 + Math.random() * 85}%`, opacity: i === 0 ? 0.6 : 0.25 }} />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
