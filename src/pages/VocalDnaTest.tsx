import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VocalRadar } from "@/components/VocalRadar";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import { analyzeVocalDna, VocalDnaResult } from "@/lib/vocalDnaAnalysis";
import { trackEvent } from "@/lib/trackEvent";

type Phase = "intro" | "recording" | "result";

export default function VocalDnaTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(30);
  const [result, setResult] = useState<VocalDnaResult | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pitchesRef = useRef<number[]>([]);
  const energiesRef = useRef<number[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setPhase("recording");

      const bufLen = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufLen);
      const draw = () => {
        animRef.current = requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray);

        // Autocorrelation pitch detection
        let maxCorr = 0, bestLag = 0;
        for (let lag = 20; lag < bufLen / 2; lag++) {
          let corr = 0;
          for (let i = 0; i < bufLen / 2; i++) corr += dataArray[i] * dataArray[i + lag];
          if (corr > maxCorr) { maxCorr = corr; bestLag = lag; }
        }
        if (bestLag > 0 && maxCorr > 0.1) {
          const pitch = ctx.sampleRate / bestLag;
          if (pitch > 60 && pitch < 2000) pitchesRef.current.push(pitch);
        }

        // RMS energy
        let sum = 0;
        for (let i = 0; i < bufLen; i++) sum += dataArray[i] ** 2;
        energiesRef.current.push(Math.sqrt(sum / bufLen));

        // Draw waveform
        const canvas = canvasRef.current;
        if (!canvas) return;
        const c = canvas.getContext("2d")!;
        const w = canvas.width, h = canvas.height;
        c.clearRect(0, 0, w, h);
        c.strokeStyle = "hsl(40, 55%, 58%)";
        c.lineWidth = 2;
        c.beginPath();
        const sliceWidth = w / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
          const v = dataArray[i] * 0.5 + 0.5;
          const y = v * h;
          if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
          x += sliceWidth;
        }
        c.stroke();
      };
      draw();

      let sec = 30;
      const timer = setInterval(() => {
        sec--;
        setCountdown(sec);
        if (sec <= 0) { clearInterval(timer); finishRecording(); }
      }, 1000);
    } catch {
      toast.error("No se pudo acceder al micrófono.");
    }
  }, []);

  const finishRecording = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();

    const dnaResult = analyzeVocalDna(pitchesRef.current, energiesRef.current);
    setResult(dnaResult);
    setPhase("result");
    trackEvent(user?.id, "fingerprint_created");
  }, [user]);

  const handleSave = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!result) return;
    setSaving(true);
    try {
      await supabase.functions.invoke("vocal-fingerprint", {
        body: {
          user_id: user.id,
          dimensions: {
            pitch: result.radarValues[0],
            rhythm: result.radarValues[1],
            vibrato: result.radarValues[2],
            sustain: result.radarValues[3],
            control: result.radarValues[4],
            range: result.radarValues[5],
          },
          classification: result.classification,
          similar_artists: [result.celebrityMatch],
          vocal_range_low: 0,
          vocal_range_high: 0,
        },
      });
      toast.success("Tu huella vocal está guardada.");
      navigate("/");
    } catch {
      toast.error("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = () => { handleSave(); };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-8 max-w-sm">
            <h1 className="font-display text-3xl text-foreground">Dejá tu huella</h1>
            <p className="text-base text-muted-foreground">Cantá 30 segundos. Solo eso.</p>
            <motion.button onClick={startRecording} whileTap={{ scale: 0.9 }} className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)]">
              <Mic className="w-10 h-10 text-primary-foreground" />
            </motion.button>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 w-full max-w-sm">
            <div className="flex items-center justify-end gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Escuchando...</span>
            </div>
            <canvas ref={canvasRef} width={320} height={120} className="w-full h-[120px]" />
            <div className="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeDasharray={276.46} strokeDashoffset={276.46 * (countdown / 30)} className="transition-all duration-1000" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-foreground">{countdown}</span>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8 py-8">
            <div className="text-center space-y-3">
              <h2 className="font-display text-3xl text-primary">{result.classification}</h2>
              <p className="text-lg text-foreground">{result.description}</p>
              <p className="text-sm text-muted-foreground">
                Tu color vocal se acerca a{" "}
                <span className="text-primary">{result.celebrityMatch.name}</span>{" "}
                <span className="font-mono">({result.celebrityMatch.percent}%)</span>
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <VocalRadar values={result.radarValues} size="full" />
              <p className="font-mono text-lg text-foreground">{result.rangeLabel}</p>
              <p className="text-sm text-primary">
                Tu punto fuerte es el <span className="font-medium">{result.strongPoint}</span>
              </p>
            </div>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl border border-primary/40 text-primary font-display text-sm hover:bg-primary/5 transition-colors">
                Compartir mi huella vocal
              </button>
              <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-base shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)] disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar mi Vocal DNA"}
              </button>
              <button onClick={() => navigate("/karaoke")} className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                Cantar una canción con tu huella calibrada →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onSuccess={handleAuthSuccess} />
    </div>
  );
}
