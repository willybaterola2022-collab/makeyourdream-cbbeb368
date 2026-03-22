import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Share2, RotateCcw } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { StageButton } from "@/components/ui/StageButton";
import ShareCard from "@/components/ShareCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/trackEvent";

const ANALYSIS_DURATION = 15;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function freqToNote(freq: number): string {
  const noteNum = 12 * (Math.log2(freq / 440)) + 69;
  const note = NOTE_NAMES[Math.round(noteNum) % 12];
  const octave = Math.floor(Math.round(noteNum) / 12) - 1;
  return `${note}${octave}`;
}

interface Dimensions { name: string; value: number; }

const Fingerprint = () => {
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const { user } = useAuth();
  const currentFrequency = pitch?.frequency ?? 0;
  const currentNote = pitch ? `${pitch.note}${pitch.octave}` : null;

  const [phase, setPhase] = useState<"idle" | "analyzing" | "result">("idle");
  const [timeLeft, setTimeLeft] = useState(ANALYSIS_DURATION);
  const [dimensions, setDimensions] = useState<Dimensions[]>([
    { name: "Afinación", value: 0 }, { name: "Timing", value: 0 },
    { name: "Vibrato", value: 0 }, { name: "Sustain", value: 0 },
    { name: "Control", value: 0 }, { name: "Registro", value: 0 },
  ]);
  const [globalScore, setGlobalScore] = useState(0);
  const [vocalRange, setVocalRange] = useState({ low: "", high: "" });
  const [similarArtist, setSimilarArtist] = useState("");
  const [evolution, setEvolution] = useState<number[]>([]);
  const [showShare, setShowShare] = useState(false);

  const pitchSamples = useRef<number[]>([]);
  const volumeSamples = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Load existing fingerprint on mount
  useEffect(() => {
    if (!user) return;
    trackEvent(user.id, "module_visited", { module: "fingerprint" });

    (async () => {
      try {
        const { data } = await supabase.functions.invoke("vocal-fingerprint", {
          body: { action: "get_latest", user_id: user.id },
        });
        if (data?.fingerprint) {
          const fp = data.fingerprint;
          if (fp.dimensions) {
            const newDims = Object.entries(fp.dimensions).map(([name, value]) => ({
              name,
              value: value as number,
            }));
            if (newDims.length > 0) setDimensions(newDims);
          }
          if (fp.global_score) setGlobalScore(fp.global_score);
          if (fp.classification) {
            const parts = fp.classification.split(" → ");
            if (parts.length === 2) setVocalRange({ low: parts[0], high: parts[1] });
          }
          if (fp.similar_artists?.length > 0) setSimilarArtist(fp.similar_artists[0]);
          if (data.evolution) setEvolution(data.evolution);
          if (fp.global_score > 0) setPhase("result");
        }
      } catch {
        // Fallback: direct query
        const { data: fp } = await supabase
          .from("vocal_fingerprints")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fp) {
          if (fp.dimensions) {
            const d = fp.dimensions as any;
            const newDims = Object.entries(d).map(([name, value]) => ({ name, value: value as number }));
            if (newDims.length > 0) setDimensions(newDims);
          }
          if (fp.global_score) setGlobalScore(fp.global_score);
          if (fp.classification) {
            const parts = fp.classification.split(" → ");
            if (parts.length === 2) setVocalRange({ low: parts[0], high: parts[1] });
          }
          if (fp.similar_artists) {
            const artists = fp.similar_artists as any[];
            if (artists.length > 0) setSimilarArtist(typeof artists[0] === "string" ? artists[0] : artists[0].name);
          }
          if (fp.global_score && fp.global_score > 0) setPhase("result");
        }
      }
    })();
  }, [user]);

  const startAnalysis = useCallback(async () => {
    const ok = await requestMic();
    if (!ok) return;
    pitchSamples.current = [];
    volumeSamples.current = [];
    setPhase("analyzing");
    setTimeLeft(ANALYSIS_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); finishAnalysis(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [requestMic]);

  useEffect(() => {
    if (phase !== "analyzing") return;
    if (currentFrequency > 0) pitchSamples.current.push(currentFrequency);
    volumeSamples.current.push(volume);
  }, [currentFrequency, volume, phase]);

  const finishAnalysis = useCallback(async () => {
    stopMic();
    setPhase("result");

    const pitches = pitchSamples.current;
    const volumes = volumeSamples.current;

    // Try edge function first
    if (user && pitches.length > 5) {
      try {
        const lowFreq = Math.min(...pitches);
        const highFreq = Math.max(...pitches);
        const dims = computeLocalDimensions(pitches, volumes);
        const { data, error } = await supabase.functions.invoke("vocal-fingerprint", {
          body: {
            action: "save",
            user_id: user.id,
            dimensions: dims.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {}),
            vocal_range_low: lowFreq,
            vocal_range_high: highFreq,
          },
        });
        if (!error && data?.fingerprint) {
          const fp = data.fingerprint;
          if (fp.dimensions) {
            const newDims = Object.entries(fp.dimensions).map(([name, value]) => ({
              name, value: value as number,
            }));
            if (newDims.length > 0) setDimensions(newDims);
          }
          if (fp.classification) {
            const parts = fp.classification.split(" → ");
            if (parts.length === 2) setVocalRange({ low: parts[0], high: parts[1] });
          }
          if (fp.similar_artists?.length > 0) setSimilarArtist(fp.similar_artists[0]);
          if (fp.global_score) setGlobalScore(fp.global_score);
          toast.success("Fingerprint guardado");
          trackEvent(user.id, "fingerprint_created");
          return;
        }
      } catch {}
    }

    // Fallback: local analysis
    const localDims = computeLocalDimensions(pitches, volumes);
    const global = Math.round(localDims.reduce((a, b) => a + b.value, 0) / localDims.length);
    const SIMILAR_ARTISTS = ["Adele", "Sam Smith", "Freddie Mercury", "Whitney Houston", "Ed Sheeran", "Billie Eilish", "Bruno Mars", "Sia"];
    const artist = SIMILAR_ARTISTS[Math.floor(Math.random() * SIMILAR_ARTISTS.length)];

    let lowNote = "", highNote = "";
    if (pitches.length > 0) {
      lowNote = freqToNote(Math.min(...pitches));
      highNote = freqToNote(Math.max(...pitches));
    }

    setDimensions(localDims);
    setGlobalScore(global);
    setVocalRange({ low: lowNote, high: highNote });
    setSimilarArtist(artist);

    if (user) {
      try {
        const lowFreq = pitches.length > 0 ? Math.min(...pitches) : null;
        const highFreq = pitches.length > 0 ? Math.max(...pitches) : null;
        await supabase.from("vocal_fingerprints").insert([{
          user_id: user.id,
          dimensions: localDims.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {}),
          global_score: global,
          vocal_range_low: lowFreq,
          vocal_range_high: highFreq,
          classification: `${lowNote} → ${highNote}`,
          similar_artists: [artist],
        }]);
        toast.success("Fingerprint guardado");
        trackEvent(user.id, "fingerprint_created");
      } catch (e) {
        console.error("Error saving fingerprint:", e);
      }
    }
  }, [stopMic, user]);

  function computeLocalDimensions(pitches: number[], volumes: number[]): Dimensions[] {
    const avgVol = volumes.length ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
    let pitchAccuracy = 75;
    if (pitches.length > 5) {
      const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      const variance = pitches.reduce((a, b) => a + (b - mean) ** 2, 0) / pitches.length;
      const cv = Math.sqrt(variance) / mean;
      pitchAccuracy = Math.min(98, Math.max(40, 95 - cv * 200));
    }
    let vibratoScore = 60;
    if (pitches.length > 10) {
      let oscillations = 0;
      for (let i = 2; i < pitches.length; i++) {
        if ((pitches[i] - pitches[i - 1]) * (pitches[i - 1] - pitches[i - 2]) < 0) oscillations++;
      }
      vibratoScore = Math.min(95, Math.max(30, 40 + (oscillations / pitches.length) * 120));
    }
    const sustainScore = Math.min(95, Math.max(40, 50 + avgVol * 0.6));
    let controlScore = 70;
    if (volumes.length > 5) {
      const volMean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const volVar = volumes.reduce((a, b) => a + (b - volMean) ** 2, 0) / volumes.length;
      controlScore = Math.min(95, Math.max(35, 90 - Math.sqrt(volVar) * 2));
    }
    let rangeScore = 65;
    if (pitches.length > 0) {
      const minFreq = Math.min(...pitches);
      const maxFreq = Math.max(...pitches);
      const semitones = 12 * Math.log2(maxFreq / minFreq);
      rangeScore = Math.min(98, Math.max(30, 40 + semitones * 3));
    }
    const timingScore = Math.min(95, Math.max(45, pitchAccuracy * 0.8 + 10));
    return [
      { name: "Afinación", value: Math.round(pitchAccuracy) },
      { name: "Timing", value: Math.round(timingScore) },
      { name: "Vibrato", value: Math.round(vibratoScore) },
      { name: "Sustain", value: Math.round(sustainScore) },
      { name: "Control", value: Math.round(controlScore) },
      { name: "Registro", value: Math.round(rangeScore) },
    ];
  }

  const reset = () => { setPhase("idle"); setTimeLeft(ANALYSIS_DURATION); clearInterval(timerRef.current); };

  const numDims = dimensions.length;
  const cx = 150, cy = 150, maxR = 110;
  const getPoint = (i: number, val: number) => {
    const angle = (2 * Math.PI * i) / numDims - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };
  const polygonPoints = dimensions.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}`; }).join(" ");
  const gridPolygon = (pct: number) => Array.from({ length: numDims }).map((_, i) => { const p = getPoint(i, pct); return `${p.x},${p.y}`; }).join(" ");

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Vocal Fingerprint 6D</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu identidad vocal única</p>
      </div>

      {phase === "result" && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Score Global</p>
            <motion.p className="text-4xl font-display font-bold text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{globalScore}</motion.p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Similar a</p>
            <p className="text-sm font-bold text-primary">{similarArtist}</p>
            {vocalRange.low && <p className="text-xs text-muted-foreground mt-1">{vocalRange.low} → {vocalRange.high}</p>}
          </div>
        </motion.div>
      )}

      {/* Evolution */}
      {evolution.length > 1 && phase === "result" && (
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Evolución</p>
          <div className="flex items-end gap-1 h-12">
            {evolution.map((score, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(score / 100) * 100}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 rounded-t bg-primary/60"
                title={`${score}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-5 flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[400px]">
          {[25, 50, 75, 100].map((pct) => (
            <polygon key={pct} points={gridPolygon(pct)} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
          {dimensions.map((_, i) => { const p = getPoint(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />; })}
          <motion.polygon points={polygonPoints} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
          {dimensions.map((d, i) => { const p = getPoint(i, d.value); return <motion.circle key={i} cx={p.x} cy={p.y} r="5" fill="hsl(var(--primary))" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />; })}
          {dimensions.map((d, i) => { const p = getPoint(i, 120); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px] font-bold">{d.name}</text>; })}
        </svg>
      </div>

      {phase === "analyzing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <motion.div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            <Mic className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-2xl font-bold text-foreground">{timeLeft}s</p>
          <p className="text-sm text-muted-foreground">Cantá algo... estamos analizando tu voz</p>
          {currentNote && <p className="text-lg font-mono text-primary">{currentNote} — {Math.round(currentFrequency)}Hz</p>}
          <div className="mx-auto max-w-xs h-3 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${volume}%` }} transition={{ duration: 0.05 }} />
          </div>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        {phase === "idle" && (
          <StageButton variant="primary" icon={<Mic className="h-6 w-6" />} onClick={startAnalysis} pulse>HACER ANÁLISIS</StageButton>
        )}
        {phase === "result" && (
          <>
            <StageButton variant="glass" icon={<RotateCcw className="h-5 w-5" />} onClick={reset}>REPETIR</StageButton>
            <StageButton variant="glass" icon={<Share2 className="h-5 w-5" />} onClick={() => setShowShare(true)}>COMPARTIR</StageButton>
          </>
        )}
      </div>

      {phase === "result" && (
        <div className="space-y-3">
          {dimensions.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-3 flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20 shrink-0">{d.name}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
              </div>
              <span className="text-sm font-bold text-foreground w-8 text-right">{d.value}</span>
            </motion.div>
          ))}
        </div>
      )}

      {showShare && (
        <ShareCard dimensions={dimensions} globalScore={globalScore} similarArtist={similarArtist} vocalRange={vocalRange} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default Fingerprint;
