import { Play, Pause, RotateCcw, Mic, MicOff, SkipForward, Headphones } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const lyrics = [
  { time: 0, text: "Bésame, bésame mucho", targetNote: "G4" },
  { time: 4, text: "Como si fuera esta noche", targetNote: "A4" },
  { time: 8, text: "La última vez", targetNote: "B4" },
  { time: 12, text: "Bésame, bésame mucho", targetNote: "G4" },
  { time: 16, text: "Que tengo miedo a perderte", targetNote: "A4" },
  { time: 20, text: "Perderte después", targetNote: "F4" },
  { time: 24, text: "Quiero tenerte muy cerca", targetNote: "G4" },
  { time: 28, text: "Mirarme en tus ojos", targetNote: "A4" },
  { time: 32, text: "Verte junto a mí", targetNote: "G4" },
];

const SONG_DURATION = 36; // seconds

const Karaoke = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const { isListening, volume, waveformData, requestMic, stopMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isPlaying);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Live scoring accumulators
  const scoreSamplesRef = useRef({ pitchHits: 0, pitchTotal: 0, timingHits: 0, timingTotal: 0 });
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });

  // Current active line
  const activeLine = lyrics.reduce((best, line, i) => (elapsed >= line.time ? i : best), 0);

  // Waveform bars
  const bars = waveformData.length > 0
    ? waveformData.slice(0, 60).map((v) => Math.max(v, 5))
    : Array.from({ length: 60 }, (_, i) => 5 + (isPlaying ? Math.random() * 8 : 0));

  // Timer logic
  useEffect(() => {
    if (isPlaying && !finished) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.25;
          if (next >= SONG_DURATION) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setFinished(true);
            return SONG_DURATION;
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, finished]);

  // Live scoring: sample every 500ms while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const s = scoreSamplesRef.current;
      // Timing: are they singing (volume > 15) during a lyric line?
      s.timingTotal++;
      if (volume > 15) s.timingHits++;
      // Pitch: if we detect a note, score it
      if (pitch) {
        s.pitchTotal++;
        if (Math.abs(pitch.cents) < 30) s.pitchHits++; // within 30 cents = good
      }
      // Update displayed scores
      setScores({
        pitch: s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0,
        timing: s.timingTotal > 0 ? Math.round((s.timingHits / s.timingTotal) * 100) : 0,
        expression: Math.min(Math.round(volume * 1.2), 100),
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, volume, pitch]);

  // Finished handler — save to cloud
  useEffect(() => {
    if (finished) {
      stopRecording();
      // Save recording + session to cloud after a tick (wait for blob)
      setTimeout(async () => {
        const result = await saveRecording("Bésame Mucho - Karaoke", {
          pitch_score: scores.pitch,
          timing_score: scores.timing,
          expression_score: scores.expression,
        });
        if (result && user) {
          await supabase.from("training_sessions").insert({
            user_id: user.id,
            module: "karaoke",
            song_title: "Bésame Mucho",
            pitch_score: scores.pitch,
            timing_score: scores.timing,
            expression_score: scores.expression,
            overall_score: Math.round((scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2)),
            recording_id: result.recordingId,
          });
        }
        toast.success("¡Sesión completada! Escucha tu grabación 🎧");
      }, 500);
    }
  }, [finished, stopRecording]);

  const handlePlay = async () => {
    if (finished) return;
    if (!isPlaying) {
      if (!isListening) {
        const ok = await requestMic();
        if (!ok) return;
      }
      // Small delay to ensure stream is ready
      setTimeout(() => {
        const mic = (document.querySelector("[data-mic-stream]") as any)?._stream;
      }, 100);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      clearInterval(timerRef.current);
    }
  };

  // Start recording when playing starts and stream is available
  useEffect(() => {
    if (isPlaying && stream && !isRecording) {
      startRecording(stream);
    }
  }, [isPlaying, stream, isRecording, startRecording]);

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setElapsed(0);
    setFinished(false);
    stopRecording();
    clearRecording();
    scoreSamplesRef.current = { pitchHits: 0, pitchTotal: 0, timingHits: 0, timingTotal: 0 };
    setScores({ pitch: 0, timing: 0, expression: 0 });
  };

  const globalScore = Math.round((scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2));
  const progress = (elapsed / SONG_DURATION) * 100;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Karaoke Core</h1>
        <p className="text-muted-foreground text-sm mt-1">Canta, mide y mejora en tiempo real</p>
      </div>

      {/* Song Card */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Headphones className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground">Bésame Mucho</h3>
          <p className="text-sm text-muted-foreground">Consuelo Velázquez · {formatTime(SONG_DURATION)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-serif font-bold gold-text">{globalScore || "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
        </div>
      </div>

      {/* Pitch indicator */}
      {isPlaying && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Nota detectada</span>
          <span className="font-mono text-lg font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{pitch.frequency} Hz</span>
        </div>
      )}

      {/* Waveform */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-1 h-20 mb-4">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-100 ${
                isListening && h > 20 ? "gold-gradient" : "bg-muted"
              }`}
              style={{ height: `${Math.min(h, 100)}%` }}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <div className="h-full gold-gradient rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
          <span>{formatTime(elapsed)}</span>
          {isListening && (
            <span className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${volume > 30 ? "bg-primary" : "bg-muted-foreground"}`} />
              Vol: {Math.round(volume)}%
            </span>
          )}
          <span>{formatTime(SONG_DURATION)}</span>
        </div>
      </div>

      {/* Score indicators — LIVE */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Afinación", value: scores.pitch, color: "gold-gradient" },
          { label: "Timing", value: scores.timing, color: "bg-secondary" },
          { label: "Expresión", value: scores.expression, color: "gold-gradient" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-serif font-bold text-foreground">{s.value || "—"}</p>
            <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${s.color} transition-all duration-300`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lyrics — synced */}
      <div className="glass-card p-5 space-y-3 max-h-64 overflow-y-auto">
        {lyrics.map((line, i) => (
          <p
            key={i}
            className={`font-serif text-lg transition-all duration-300 ${
              i === activeLine
                ? "text-primary font-semibold text-xl scale-105 origin-left"
                : i < activeLine
                ? "text-muted-foreground/50"
                : "text-muted-foreground"
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* Replay after finish */}
      {finished && audioUrl && (
        <div className="glass-card p-4 text-center space-y-3">
          <p className="text-sm text-muted-foreground">🎧 Escucha tu interpretación</p>
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download="mi-karaoke.webm"
            className="inline-block text-xs text-primary underline"
          >
            Descargar grabación
          </a>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="h-10 w-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handlePlay}
          disabled={finished}
          className="h-14 w-14 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity glow-gold disabled:opacity-40"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>
        <button
          onClick={() => {
            if (isListening) stopMic();
            else requestMic();
          }}
          className={`h-10 w-10 rounded-full glass-card flex items-center justify-center transition-colors ${isListening ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default Karaoke;
