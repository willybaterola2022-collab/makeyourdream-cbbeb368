import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  ChevronRight,
  Music,
  Award,
  Share2,
  Sparkles,
} from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";

type Step = "welcome" | "record" | "analyzing" | "result";

const dimensionResults = [
  { name: "Registro", value: 88 },
  { name: "Afinación", value: 82 },
  { name: "Potencia", value: 76 },
  { name: "Resonancia", value: 91 },
  { name: "Expresividad", value: 85 },
];

const stepVariants = {
  initial: { opacity: 0, x: 60, scale: 0.96 },
  animate: {
    opacity: 1, x: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, x: -60, scale: 0.96, transition: { duration: 0.3 } },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const { isListening, volume, waveformData, requestMic, stopMic } = useMicrophone(128);

  // Waveform: use real mic data if available, else fallback
  const displayWaveform = isListening && waveformData.length > 0
    ? waveformData.slice(0, 40).map((v) => Math.max(v, 10))
    : isRecording
      ? Array.from({ length: 40 }, () => 15 + Math.random() * 70)
      : Array.from({ length: 40 }, () => 10);

  // Simulate waveform fallback when no mic but recording
  const [fallbackWave, setFallbackWave] = useState<number[]>(Array.from({ length: 40 }, () => 10));
  useEffect(() => {
    if (!isRecording || isListening) return;
    const interval = setInterval(() => {
      setFallbackWave(Array.from({ length: 40 }, () => 15 + Math.random() * 70));
    }, 120);
    return () => clearInterval(interval);
  }, [isRecording, isListening]);

  const finalWaveform = isListening ? displayWaveform : fallbackWave;

  // Record timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordTime((t) => {
        if (t >= 10) {
          setIsRecording(false);
          stopMic();
          setTimeout(() => setStep("analyzing"), 600);
          return 10;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, stopMic]);

  // Analyze simulation
  useEffect(() => {
    if (step !== "analyzing") return;
    setAnalyzeProgress(0);
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 100) {
          setTimeout(() => setStep("result"), 400);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [step]);

  const startRecording = useCallback(async () => {
    const ok = await requestMic();
    // Start recording regardless (fallback to simulated waveform)
    setIsRecording(true);
    setRecordTime(0);
  }, [requestMic]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    stopMic();
    setTimeout(() => setStep("analyzing"), 500);
  }, [stopMic]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["welcome", "record", "analyzing", "result"] as Step[]).map((s, i) => {
            const stepIndex = ["welcome", "record", "analyzing", "result"].indexOf(step);
            return (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all duration-500 ${i <= stepIndex ? "stage-gradient" : "bg-muted"}`}
                animate={{ width: i === stepIndex ? 32 : 8 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div key="welcome" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-24 w-24 rounded-3xl stage-gradient flex items-center justify-center mx-auto mb-8 glow-stage"
              >
                <Music className="h-12 w-12 text-primary-foreground" />
              </motion.div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
                Bienvenido a<br /><span className="neon-text">MakeYourDream</span>
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Vamos a descubrir tu voz única. Graba un fragmento cantando y nuestra IA analizará tu perfil vocal en segundos.
              </p>
              <div className="space-y-3">
                {["Canta al menos 10 segundos", "Busca un lugar tranquilo", "Canta como te salga, sin miedo"].map((tip, i) => (
                  <motion.div key={tip} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="glass-card p-3 flex items-center gap-3 text-left">
                    <div className="h-7 w-7 rounded-full stage-gradient flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{tip}</span>
                  </motion.div>
                ))}
              </div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep("record")} className="mt-8 h-14 px-8 rounded-xl stage-gradient text-primary-foreground font-semibold text-lg flex items-center gap-3 mx-auto">
                Estoy listo <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Record Step */}
          {step === "record" && (
            <motion.div key="record" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {isRecording ? "Te escuchamos..." : "Toca para grabar"}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {isRecording ? "Canta tu canción favorita" : "Pulsa el micrófono y canta al menos 10 segundos"}
              </p>

              {/* Volume indicator */}
              {isListening && isRecording && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className={`inline-block h-3 w-3 rounded-full transition-colors ${volume > 40 ? "bg-primary" : volume > 15 ? "bg-primary/50" : "bg-muted"}`} />
                  <span className="text-xs text-muted-foreground">Nivel: {Math.round(volume)}%</span>
                </div>
              )}

              {/* Waveform */}
              <div className="h-20 flex items-center gap-0.5 mb-8 px-4">
                {finalWaveform.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-full ${isRecording ? "stage-gradient" : "bg-muted"}`}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>

              {/* Mic button */}
              <div className="relative inline-block">
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ boxShadow: ["0 0 0 0px hsl(275 85% 60% / 0.4)", "0 0 0 30px hsl(275 85% 60% / 0)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-destructive text-destructive-foreground" : "stage-gradient text-primary-foreground glow-stage"}`}
                >
                  {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </motion.button>
              </div>

              {/* Timer */}
              <motion.p className="mt-6 text-3xl font-serif font-bold text-foreground" animate={isRecording ? { opacity: [0.5, 1, 0.5] } : {}} transition={isRecording ? { duration: 1, repeat: Infinity } : {}}>
                0:{recordTime.toString().padStart(2, "0")}
                <span className="text-muted-foreground text-lg"> / 0:10</span>
              </motion.p>

              {isRecording && recordTime >= 5 && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={stopRecording} className="mt-6 h-12 px-6 rounded-xl glass-card text-foreground font-medium">
                  Terminar grabación
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Analyzing Step */}
          {step === "analyzing" && (
            <motion.div key="analyzing" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-20 w-20 rounded-full border-4 border-muted border-t-primary mx-auto mb-8" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Analizando tu voz...</h2>
              <div className="space-y-3 mt-8 text-left">
                {[
                  { label: "Detectando rango vocal", threshold: 15 },
                  { label: "Analizando timbre y resonancia", threshold: 35 },
                  { label: "Evaluando afinación", threshold: 55 },
                  { label: "Clasificando tipo vocal", threshold: 75 },
                  { label: "Generando Vocal Fingerprint", threshold: 90 },
                ].map((item) => (
                  <motion.div key={item.label} initial={{ opacity: 0.3 }} animate={{ opacity: analyzeProgress > item.threshold ? 1 : 0.3 }} className="glass-card p-3 flex items-center gap-3">
                    <motion.div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${analyzeProgress > item.threshold ? "stage-gradient" : "bg-muted"}`} animate={analyzeProgress > item.threshold ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                      {analyzeProgress > item.threshold && <Sparkles className="h-3 w-3 text-primary-foreground" />}
                    </motion.div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full stage-gradient" animate={{ width: `${Math.min(analyzeProgress, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{Math.min(Math.round(analyzeProgress), 100)}%</p>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === "result" && (
            <motion.div key="result" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                <Award className="h-14 w-14 text-primary mx-auto mb-4" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-1">Tu clasificación vocal</p>
                <h2 className="font-serif text-3xl font-bold neon-text mb-1">Mezzosoprano Lírica</h2>
                <p className="text-muted-foreground text-sm">Rango: A3 — E5 · Top 12%</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 space-y-2">
                {dimensionResults.map((d, i) => (
                  <div key={d.name} className="glass-card p-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium text-foreground">{d.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full rounded-full stage-gradient" initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }} />
                    </div>
                  </div>
                ))}
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 glass-card p-4 border-primary/20">
                <p className="text-sm text-foreground mb-1"><span className="neon-text font-semibold">Suenas a Adele</span> — 87% de similitud</p>
                <p className="text-xs text-muted-foreground">Timbre cálido con gran control de registro medio</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-8 space-y-3">
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px hsl(46 65% 52% / 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/")} className="w-full h-14 rounded-xl gold-gradient text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2">
                  Comenzar mi transformación <ChevronRight className="h-5 w-5" />
                </motion.button>
                <button className="w-full h-12 rounded-xl glass-card text-muted-foreground font-medium flex items-center justify-center gap-2 hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" /> Compartir mi diagnóstico
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
