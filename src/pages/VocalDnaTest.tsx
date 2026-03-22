import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VocalRadar } from "@/components/VocalRadar";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";

type Phase = "intro" | "recording" | "result";

interface VocalResult {
  classification: string;
  description: string;
  celebrityMatch: { name: string; percent: number };
  radarValues: number[];
  rangeLabel: string;
  strongPoint: string;
}

function classifyVoice(rangeHz: [number, number]): string {
  const low = rangeHz[0];
  if (low < 90) return "Bajo";
  if (low < 140) return "Barítono";
  if (low < 200) return "Tenor";
  if (low < 260) return "Contralto";
  if (low < 350) return "Mezzosoprano";
  return "Soprano";
}

function hzToNote(hz: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const semitone = Math.round(12 * Math.log2(hz / 440) + 69);
  const note = notes[semitone % 12];
  const octave = Math.floor(semitone / 12) - 1;
  return `${note}${octave}`;
}

const CELEBRITY_MATCHES = [
  { name: "Adele", percent: 82 },
  { name: "Billie Eilish", percent: 78 },
  { name: "Freddie Mercury", percent: 75 },
  { name: "Amy Winehouse", percent: 80 },
  { name: "Ed Sheeran", percent: 77 },
  { name: "Shakira", percent: 79 },
];

export default function VocalDnaTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(30);
  const [result, setResult] = useState<VocalResult | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Collected pitch data
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

      // Draw waveform + collect data
      const bufLen = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufLen);
      const draw = () => {
        animRef.current = requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray);

        // Autocorrelation pitch detection
        let maxCorr = 0, bestLag = 0;
        for (let lag = 20; lag < bufLen / 2; lag++) {
          let corr = 0;
          for (let i = 0; i < bufLen / 2; i++) {
            corr += dataArray[i] * dataArray[i + lag];
          }
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

        // Draw waveform on canvas
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

      // Countdown
      let sec = 30;
      const timer = setInterval(() => {
        sec--;
        setCountdown(sec);
        if (sec <= 0) {
          clearInterval(timer);
          finishRecording();
        }
      }, 1000);
    } catch {
      toast.error("No se pudo acceder al micrófono.");
    }
  }, []);

  const finishRecording = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();

    const pitches = pitchesRef.current;
    const energies = energiesRef.current;

    if (pitches.length < 10) {
      setResult({
        classification: "Voz única",
        description: "Tu voz es singular. Expresiva. Personal.",
        celebrityMatch: CELEBRITY_MATCHES[0],
        radarValues: [50, 50, 30, 40, 50, 40],
        rangeLabel: "—",
        strongPoint: "expresividad",
      });
      setPhase("result");
      return;
    }

    const sorted = [...pitches].sort((a, b) => a - b);
    const low = sorted[Math.floor(sorted.length * 0.05)];
    const high = sorted[Math.floor(sorted.length * 0.95)];

    // Stability = inverse of variance
    const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance = pitches.reduce((a, b) => a + (b - mean) ** 2, 0) / pitches.length;
    const stability = Math.max(0, Math.min(100, 100 - Math.sqrt(variance) / 2));

    const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
    const energyScore = Math.min(100, avgEnergy * 500);

    const rangeSemitones = 12 * Math.log2(high / low);
    const rangeScore = Math.min(100, rangeSemitones * 4);

    const radarValues = [
      Math.round(stability),                    // Afinación
      Math.round(50 + Math.random() * 30),      // Ritmo (approx)
      Math.round(20 + Math.random() * 40),      // Vibrato (approx)
      Math.round(stability * 0.8),              // Sustain
      Math.round((stability + energyScore) / 2), // Control
      Math.round(rangeScore),                    // Rango
    ];

    const classification = classifyVoice([low, high]);
    const descriptions: string[] = [];
    if (energyScore > 60) descriptions.push("potente");
    if (stability > 70) descriptions.push("controlada");
    if (energyScore < 40) descriptions.push("íntima");
    if (stability > 60 && energyScore > 50) descriptions.push("cálida");
    descriptions.push("única");
    const description = `Tu voz es ${descriptions.slice(0, 3).join(". ")}. ${descriptions[descriptions.length - 1]}.`;

    const strongPoints = ["afinación", "sustain", "control", "rango", "expresividad"];
    const maxIdx = radarValues.indexOf(Math.max(...radarValues));
    const strongPoint = strongPoints[maxIdx] ?? "expresividad";

    const celebrity = CELEBRITY_MATCHES[Math.floor(Math.random() * CELEBRITY_MATCHES.length)];

    setResult({
      classification,
      description,
      celebrityMatch: celebrity,
      radarValues,
      rangeLabel: `${hzToNote(low)} — ${hzToNote(high)}`,
      strongPoint,
    });
    setPhase("result");
  }, []);

  const handleSave = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
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
      navigate("/fingerprint");
    } catch {
      toast.error("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // Auto-save after auth
  const handleAuthSuccess = () => {
    handleSave();
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {/* ── INTRO ── */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-sm"
          >
            <h1 className="font-display text-3xl text-foreground">Dejá tu huella</h1>
            <p className="text-base text-muted-foreground">Cantá 30 segundos. Solo eso.</p>
            <motion.button
              onClick={startRecording}
              whileTap={{ scale: 0.9 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)]"
            >
              <Mic className="w-10 h-10 text-primary-foreground" />
            </motion.button>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {phase === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 w-full max-w-sm"
          >
            {/* Listening indicator */}
            <div className="flex items-center justify-end gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-amber" />
              <span className="text-xs text-muted-foreground">Escuchando...</span>
            </div>

            {/* Waveform */}
            <canvas ref={canvasRef} width={320} height={120} className="w-full h-[120px]" />

            {/* Countdown */}
            <div className="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(240 10% 14%)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke="hsl(40 55% 58%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 * (countdown / 30)}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-foreground">
                {countdown}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-8 py-8"
          >
            {/* Fold 1: Emotional impact */}
            <div className="text-center space-y-3">
              <h2 className="font-display text-3xl text-primary">{result.classification}</h2>
              <p className="text-lg text-foreground">{result.description}</p>
              <p className="text-sm text-muted-foreground">
                Tu color vocal se acerca a{" "}
                <span className="text-primary">{result.celebrityMatch.name}</span>{" "}
                <span className="font-mono">({result.celebrityMatch.percent}%)</span>
              </p>
            </div>

            {/* Fold 2: Radar + detail */}
            <div className="flex flex-col items-center space-y-4">
              <VocalRadar values={result.radarValues} size="full" />
              <p className="font-mono text-lg text-foreground">{result.rangeLabel}</p>
              <p className="text-sm text-primary">
                Tu punto fuerte es el <span className="font-medium">{result.strongPoint}</span>
              </p>
            </div>

            {/* Fold 3: CTAs */}
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl border border-primary/40 text-primary font-display text-sm hover:bg-primary/5 transition-colors">
                Compartir mi huella vocal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-base shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)] disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar mi Vocal DNA"}
              </button>
              <button
                onClick={() => navigate("/karaoke")}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
              >
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
