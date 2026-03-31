import { useState, useEffect, useRef } from "react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";
import VintageMicrophone from "./VintageMicrophone";
import SingingFeedback from "./SingingFeedback";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function CustomLyricsMode({ genre, pitchRange, bpm }: Props) {
  const { user } = useAuth();
  const [lyrics, setLyrics] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [speed, setSpeed] = useState(4);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, started);
  const { playSuccess } = useAudioEngine();
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const [elapsed, setElapsed] = useState(0);
  const samplesRef = useRef({ pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, prevVolumes: [] as number[] });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  const handleStart = async () => {
    const parsed = lyrics.split("\n").filter((l) => l.trim().length > 0);
    if (parsed.length === 0) return;
    setLines(parsed);
    setActiveLine(0);
    setElapsed(0);
    setFinished(false);
    samplesRef.current = { pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, prevVolumes: [] };
    if (!isListening) {
      const ok = await requestMic();
      if (!ok) return;
    }
    setTimeout(() => {
      if (stream) {
        startRecording(stream);
        setStarted(true);
      }
    }, 200);
  };

  useEffect(() => {
    if (!started || lines.length === 0) return;
    timerRef.current = setInterval(() => {
      setElapsed((p) => p + 1);
      setActiveLine((prev) => {
        const next = prev + 1;
        if (next >= lines.length) {
          clearInterval(timerRef.current);
          stopRecording();
          setStarted(false);
          setFinished(true);
          const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
          if (global >= 60) setTimeout(() => playSuccess(), 300);
          return prev;
        }
        return next;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [started, lines, speed]);

  // Score sampling
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      const s = samplesRef.current;
      s.totalSamples++;
      s.prevVolumes.push(volume);
      if (s.prevVolumes.length > 40) s.prevVolumes.shift();
      if (pitch) { s.pitchTotal++; if (Math.abs(pitch.cents) < 25) s.pitchHits++; }
      if (volume < 8) s.silentSamples++;
      s.volumeSum += volume;
      s.volumeMax = Math.max(s.volumeMax, volume);
      const avg = s.volumeSum / s.totalSamples;
      const variance = s.prevVolumes.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / Math.max(s.prevVolumes.length, 1);
      setScores({
        pitch: s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0,
        timing: Math.round((1 - (s.silentSamples / s.totalSamples)) * 100),
        expression: Math.min(Math.round(Math.sqrt(variance) * 3 + (s.volumeMax > 40 ? 15 : 0)), 100),
      });
    }, 500);
    return () => clearInterval(interval);
  }, [started, volume, pitch]);

  const handleStop = async () => {
    clearInterval(timerRef.current);
    stopRecording();
    setStarted(false);
    setFinished(true);
    const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
    if (global >= 60) setTimeout(() => playSuccess(), 300);

    if (user?.id) {
      try {
        const { data } = await supabase.functions.invoke("save-training-session", {
          body: {
            user_id: user.id,
            module: "karaoke",
            song_title: "Letra propia",
            scores: {
              pitch: Math.round(scores.pitch),
              timing: Math.round(scores.timing),
              expression: Math.round(scores.expression),
            },
          },
        });
        if (data?.success) {
          toast.success(`${data.grade} — +${data.xp_earned} XP`);
          data.badges_earned?.forEach((b: string) => toast.success(`Nuevo badge: ${b}!`));
        }
        trackEvent(user.id, "recording_completed", { grade: data?.grade, module: "karaoke", song: "Letra propia" });
      } catch {}
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    stopRecording();
    clearRecording();
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlayingBack(false);
    setActiveLine(0);
    setElapsed(0);
    setStarted(false);
    setFinished(false);
    setScores({ pitch: 0, timing: 0, expression: 0 });
  };

  const handleMicClick = () => {
    if (finished) return;
    if (started) { handleStop(); return; }
    handleStart();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const micState = finished ? "finished" : started ? "recording" : "idle";

  if (!started && !finished) {
    return (
      <div className="p-4 md:p-8 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Tu Letra</h2>
          <p className="text-sm text-muted-foreground">Pega o escribe la letra que quieras cantar</p>
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder={"Escribe tu letra aquí...\nCada línea aparecerá una a una\nmientras cantas"}
          className="w-full h-48 glass-card p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 rounded-xl text-sm"
        />
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Velocidad (seg/línea)</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((s) => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-full text-sm ${speed === s ? "stage-gradient text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                {s}s
              </button>
            ))}
          </div>
        </div>
        <VintageMicrophone isActive={false} volume={0} onClick={handleStart} state="idle" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Tu Letra</h2>
        <span className="font-mono text-foreground">{formatTime(elapsed)}</span>
      </div>

      {started && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : Math.abs(pitch.cents) < 40 ? "text-yellow-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
        </div>
      )}

      {lines.length > 0 && !finished && (
        <div className="glass-card p-5 space-y-2 max-h-64 overflow-y-auto">
          {lines.map((line, i) => (
            <p key={i} className={`font-serif text-lg transition-all duration-300 ${
              i === activeLine ? "text-primary font-semibold text-xl" : i < activeLine ? "text-muted-foreground/40" : "text-muted-foreground/70"
            }`}>{line}</p>
          ))}
        </div>
      )}

      {!finished && (
        <VintageMicrophone
          isActive={started}
          volume={volume}
          onClick={handleMicClick}
          state={micState}
        />
      )}

      <SingingFeedback
        scores={scores}
        isActive={started}
        finished={finished}
        onRetry={handleReset}
        onSave={audioUrl ? () => saveRecording(`Letra propia - ${genre}`) : undefined}
        songTitle="Tu Letra"
      />
      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
