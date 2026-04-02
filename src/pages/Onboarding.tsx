import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeVocalDna, VocalDnaResult } from "@/lib/vocalDnaAnalysis";
import { AuthModal } from "@/components/AuthModal";
import { VocalRadar } from "@/components/VocalRadar";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";
import VintageMicrophone from "@/components/karaoke/VintageMicrophone";

type Step = "welcome" | "record" | "analyzing" | "result" | "signup";

const stepVariants = {
  initial: { opacity: 0, x: 60, scale: 0.96 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, x: -60, scale: 0.96, transition: { duration: 0.3 } },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("welcome");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [dnaResult, setDnaResult] = useState<VocalDnaResult | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isListening, volume, requestMic, stopMic } = useMicrophone(2048);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const pitchesRef = useRef<number[]>([]);
  const energiesRef = useRef<number[]>([]);

  // If user is already logged in, skip to home
  useEffect(() => {
    if (user) {
      // Check if they already have a fingerprint
      supabase.from("vocal_fingerprints").select("id").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data) navigate("/", { replace: true }); });
    }
  }, [user, navigate]);

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
      requestMic();
      pitchesRef.current = [];
      energiesRef.current = [];
      setStep("record");
      setIsRecording(true);
      setRecordTime(0);

      const bufLen = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufLen);
      const collectData = () => {
        animRef.current = requestAnimationFrame(collectData);
        analyser.getFloatTimeDomainData(dataArray);
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
        let sum = 0;
        for (let i = 0; i < bufLen; i++) sum += dataArray[i] ** 2;
        energiesRef.current.push(Math.sqrt(sum / bufLen));
      };
      collectData();
    } catch {
      toast.error("No se pudo acceder al micrófono.");
    }
  }, [requestMic]);

  // Record timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordTime((t) => {
        if (t >= 15) {
          setIsRecording(false);
          finishRecording();
          return 15;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const finishRecording = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    stopMic();
    setIsRecording(false);
    setStep("analyzing");
  }, [stopMic]);

  // Analyze
  useEffect(() => {
    if (step !== "analyzing") return;
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          const result = analyzeVocalDna(pitchesRef.current, energiesRef.current);
          setDnaResult(result);
          setTimeout(() => setStep("result"), 400);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [step]);

  const saveFingerprint = useCallback(async (userId: string) => {
    if (!dnaResult) return;
    setSaving(true);
    try {
      await supabase.functions.invoke("vocal-fingerprint", {
        body: {
          action: "save",
          user_id: userId,
          dimensions: {
            pitch: dnaResult.radarValues[0], rhythm: dnaResult.radarValues[1],
            vibrato: dnaResult.radarValues[2], sustain: dnaResult.radarValues[3],
            control: dnaResult.radarValues[4], range: dnaResult.radarValues[5],
          },
          classification: dnaResult.classification,
          similar_artists: [dnaResult.celebrityMatch],
          vocal_range_low: 0, vocal_range_high: 0,
        },
      });
      // Award first badge
      await supabase.functions.invoke("gamification-engine", {
        body: { action: "add_badge", user_id: userId, badge: { id: "primera_nota", name: "Primera Nota", description: "Completaste tu primera grabación", icon: "mic" } },
      });
      toast.success("+25 XP — Tu huella vocal está guardada");
      navigate("/", { replace: true });
    } catch {
      toast.error("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [dnaResult, navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthOpen(false);
    // After signup, user context will update — save fingerprint
    const checkUser = async () => {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        trackEvent(newUser.id, "onboarding_completed");
        await saveFingerprint(newUser.id);
      }
    };
    checkUser();
  }, [saveFingerprint]);

  const handleContinueToSignup = () => {
    if (user) {
      saveFingerprint(user.id);
    } else {
      setAuthOpen(true);
    }
  };

  const steps: Step[] = ["welcome", "record", "analyzing", "result"];
  const stepIndex = steps.indexOf(step === "signup" ? "result" : step);

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
              animate={{ width: i === stepIndex ? 32 : 8 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Welcome */}
          {step === "welcome" && (
            <motion.div key="welcome" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <div className="mb-6">
                <VintageMicrophone isActive={false} volume={0} onClick={() => {}} state="idle" size="section" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
                Descubre tu <span className="text-primary">voz única</span>
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Graba 15 segundos cantando lo que quieras. Nuestra IA analizará tu perfil vocal al instante.
              </p>
              <div className="space-y-3 mb-8">
                {["Canta al menos 15 segundos", "Busca un lugar tranquilo", "Canta como te salga, sin miedo"].map((tip, i) => (
                  <motion.div key={tip} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-3 flex items-center gap-3 text-left">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{tip}</span>
                  </motion.div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={startRecording} className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-lg flex items-center gap-3 mx-auto transition-transform duration-200">
                Estoy listo <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Record */}
          {step === "record" && (
            <motion.div key="record" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {isRecording ? "Te escuchamos..." : "Toca para grabar"}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">Canta tu canción favorita</p>
              <VintageMicrophone
                isActive={isRecording}
                volume={volume}
                onClick={isRecording && recordTime >= 10 ? finishRecording : startRecording}
                state={isRecording ? "recording" : "idle"}
                size="section"
              />
              {/* Timer */}
              <div className="relative w-20 h-20 mx-auto mt-6">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeDasharray={276.46} strokeDashoffset={276.46 * (1 - recordTime / 15)} className="transition-all duration-1000" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-xl text-foreground">{recordTime}</span>
              </div>
              {isRecording && recordTime >= 10 && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }} onClick={finishRecording} className="mt-4 h-12 px-6 rounded-xl glass-card text-foreground font-medium transition-transform duration-200">
                  Terminar grabación
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Analyzing */}
          {step === "analyzing" && (
            <motion.div key="analyzing" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-20 w-20 rounded-full border-4 border-muted border-t-primary mx-auto mb-8" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Analizando tu voz...</h2>
              <div className="space-y-3 mt-8 text-left">
                {[
                  { label: "Detectando rango vocal", threshold: 15 },
                  { label: "Analizando timbre", threshold: 35 },
                  { label: "Evaluando afinación", threshold: 55 },
                  { label: "Clasificando tipo vocal", threshold: 75 },
                  { label: "Generando Vocal Fingerprint", threshold: 90 },
                ].map((item) => (
                  <motion.div key={item.label} initial={{ opacity: 0.3 }} animate={{ opacity: analyzeProgress > item.threshold ? 1 : 0.3 }} className="glass-card p-3 flex items-center gap-3">
                    <motion.div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${analyzeProgress > item.threshold ? "bg-primary" : "bg-muted"}`} animate={analyzeProgress > item.threshold ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                      {analyzeProgress > item.threshold && <Sparkles className="h-3 w-3 text-primary-foreground" />}
                    </motion.div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${Math.min(analyzeProgress, 100)}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {step === "result" && dnaResult && (
            <motion.div key="result" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-6 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <h2 className="font-serif text-3xl font-bold text-primary mb-1">{dnaResult.classification}</h2>
                <p className="text-foreground">{dnaResult.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu voz se acerca a <span className="text-primary font-medium">{dnaResult.celebrityMatch.name}</span> ({dnaResult.celebrityMatch.percent}%)
                </p>
              </motion.div>

              <VocalRadar values={dnaResult.radarValues} size="full" />

              <div className="glass-card p-4 border-primary/20">
                <p className="font-mono text-lg text-foreground">{dnaResult.rangeLabel}</p>
                <p className="text-sm text-primary mt-1">Tu punto fuerte: {dnaResult.strongPoint}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinueToSignup}
                disabled={saving}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-transform duration-200 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)]"
              >
                {saving ? "Guardando..." : "Guardar mi Vocal DNA"}
                <ChevronRight className="h-5 w-5" />
              </motion.button>
              <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Explorar sin guardar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthModal open={authOpen} onOpenChange={setAuthOpen} onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};

export default Onboarding;
