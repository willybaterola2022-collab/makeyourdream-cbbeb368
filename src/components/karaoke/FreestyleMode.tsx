import { useState, useEffect, useRef } from "react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import { useMetronome } from "@/hooks/useMetronome";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VintageMicrophone from "./VintageMicrophone";
import SingingFeedback from "./SingingFeedback";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

/** Continuous pitch score: 1.0 at 0 cents, 0.0 at ±50 cents */
function pitchScoreContinuous(cents: number): number {
  return Math.max(0, 1 - Math.abs(cents) / 50);
}

export default function FreestyleMode({ genre, pitchRange, bpm }: Props) {
  const { user } = useAuth();
  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isRecording);
  const { playSuccess } = useAudioEngine();
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const metronome = useMetronome(bpm);

  const samplesRef = useRef({
    pitchScoreSum: 0,
    pitchSamples: 0,
    sustainedCount: 0,
    lastNote: "",
    noteHoldFrames: 0,
    // Timing: sliding window
    recentSinging: [] as boolean[],
    // Expression: vibrato + dynamic range
    recentCents: [] as number[],
    volumeHistory: [] as number[],
    vibratoHits: 0,
    // Raw pitch data for edge function
    rawPitchSamples: [] as number[],
    onsetTimesMs: [] as number[],
    startTime: 0,
  });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  useEffect(() => {
    if (isRecording) {
      samplesRef.current.startTime = Date.now();
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Scoring loop — runs every 250ms during recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const s = samplesRef.current;

      // --- PITCH (continuous weighted) ---
      if (pitch && pitch.frequency > 0) {
        const score = pitchScoreContinuous(pitch.cents);
        // Sustained note bonus: 1.2x if same note held for >4 frames (~1s)
        const currentNote = `${pitch.note}${pitch.octave}`;
        if (currentNote === s.lastNote) {
          s.noteHoldFrames++;
        } else {
          s.lastNote = currentNote;
          s.noteHoldFrames = 1;
        }
        const sustainBonus = s.noteHoldFrames > 4 ? 1.2 : 1.0;
        s.pitchScoreSum += score * sustainBonus;
        s.pitchSamples++;
        if (s.noteHoldFrames > 4) s.sustainedCount++;

        // Track raw data for edge function
        s.rawPitchSamples.push(pitch.frequency);
        s.recentCents.push(pitch.cents);
        if (s.recentCents.length > 20) s.recentCents.shift(); // ~5s window
      }

      // --- TIMING (sliding window of last 40 frames = ~10s) ---
      const isSinging = volume > 8 && pitch && pitch.frequency > 0;
      s.recentSinging.push(!!isSinging);
      if (s.recentSinging.length > 40) s.recentSinging.shift();
      if (isSinging) {
        s.onsetTimesMs.push(Date.now() - s.startTime);
      }

      // --- EXPRESSION (vibrato detection + dynamic range) ---
      s.volumeHistory.push(volume);
      if (s.volumeHistory.length > 80) s.volumeHistory.shift();

      // Vibrato: check variance of cents in last ~0.5s (2 frames at 250ms)
      if (s.recentCents.length >= 4) {
        const last4 = s.recentCents.slice(-4);
        const mean = last4.reduce((a, b) => a + b, 0) / last4.length;
        const variance = last4.reduce((a, b) => a + (b - mean) ** 2, 0) / last4.length;
        // Vibrato: 15-50 cents variance range
        if (variance >= 15 && variance <= 2500) s.vibratoHits++;
      }

      // --- Calculate scores ---
      const pitchScore = s.pitchSamples > 0
        ? Math.round(Math.min(100, (s.pitchScoreSum / s.pitchSamples) * 100))
        : 0;

      const singingRatio = s.recentSinging.length > 0
        ? s.recentSinging.filter(Boolean).length / s.recentSinging.length
        : 0;
      const timingScore = Math.round(singingRatio * 100);

      // Expression: vibrato + dynamic range
      const sorted = [...s.volumeHistory].sort((a, b) => a - b);
      const p10 = sorted[Math.floor(sorted.length * 0.1)] || 0;
      const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
      const dynamicRange = p10 > 0 ? (p90 / p10) : 1;
      const vibratoRatio = s.pitchSamples > 0 ? Math.min(1, s.vibratoHits / s.pitchSamples) : 0;
      const expressionScore = Math.min(100, Math.round(
        vibratoRatio * 40 + Math.min(dynamicRange * 10, 40) + (s.sustainedCount > 2 ? 20 : 0)
      ));

      setScores({ pitch: pitchScore, timing: timingScore, expression: expressionScore });
    }, 250);
    return () => clearInterval(interval);
  }, [isRecording, volume, pitch]);

  const handleMicClick = async () => {
    if (finished) return;
    if (isRecording) {
      stopRecording();
      metronome.stop();
      clearInterval(timerRef.current);
      setFinished(true);
      const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
      if (global >= 60) setTimeout(() => playSuccess(), 300);

      // Try edge function for definitive scoring + save
      if (user) {
        const s = samplesRef.current;
        try {
          const { data, error } = await supabase.functions.invoke("vocal-analysis", {
            body: {
              user_id: user.id,
              pitch_samples: s.rawPitchSamples.slice(-200), // last 200 samples
              onset_times_ms: s.onsetTimesMs.slice(-200),
              expected_beat_ms: bpm > 0 ? Array.from({ length: 200 }, (_, i) => i * (60000 / bpm)) : [],
              expression_score: scores.expression,
              song_title: `Freestyle ${genre}`,
              module: "karaoke",
            },
          });
          if (!error && data?.analysis) {
            setScores({
              pitch: data.analysis.pitch ?? scores.pitch,
              timing: data.analysis.timing ?? scores.timing,
              expression: data.analysis.expression ?? scores.expression,
            });
          }
        } catch {
          // Fallback: save locally
          saveFallback(global);
        }
      }
      return;
    }
    if (!isListening) {
      const ok = await requestMic();
      if (!ok) return;
    }
    setTimeout(() => {
      if (stream) {
        startRecording(stream);
        metronome.start();
      }
    }, 200);
  };

  const saveFallback = (global: number) => {
    if (!user) return;
    supabase.from("training_sessions").insert([{
      user_id: user.id,
      module: "karaoke",
      song_title: `Freestyle ${genre}`,
      pitch_score: scores.pitch,
      timing_score: scores.timing,
      expression_score: scores.expression,
      overall_score: global,
    }]).then(() => {
      supabase.from("user_progress")
        .select("xp, streak_days, last_active_date")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const today = new Date().toISOString().split("T")[0];
            const isNewDay = data.last_active_date !== today;
            supabase.from("user_progress").update({
              xp: (data.xp || 0) + Math.round(global / 10),
              streak_days: isNewDay ? (data.streak_days || 0) + 1 : data.streak_days,
              last_active_date: today,
            }).eq("user_id", user.id).then(() => {});
          }
        });
    });
  };

  const handlePlay = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingBack(false);
    }
    if (isPlayingBack) {
      audioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      audioRef.current.play();
      setIsPlayingBack(true);
    }
  };

  const handleRetry = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlayingBack(false);
    clearRecording();
    setElapsed(0);
    setFinished(false);
    setScores({ pitch: 0, timing: 0, expression: 0 });
    samplesRef.current = {
      pitchScoreSum: 0, pitchSamples: 0, sustainedCount: 0,
      lastNote: "", noteHoldFrames: 0,
      recentSinging: [], recentCents: [], volumeHistory: [],
      vibratoHits: 0, rawPitchSamples: [], onsetTimesMs: [], startTime: 0,
    };
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      const blob = await fetch(audioUrl).then(r => r.blob());
      const file = new File([blob], `freestyle-${genre}.webm`, { type: "audio/webm" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: `Freestyle ${genre}` });
      }
    } catch {}
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const micState = finished ? "finished" : isRecording ? "recording" : "idle";

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Freestyle</h2>
        <p className="text-sm text-muted-foreground">{genre} · {pitchRange === "low" ? "Grave" : pitchRange === "high" ? "Agudo" : "Medio"}{bpm > 0 ? ` · ${bpm} BPM` : ""}</p>
      </div>

      {isRecording && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Nota</span>
          <span className="font-mono text-xl font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : Math.abs(pitch.cents) < 40 ? "text-yellow-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{pitch.frequency} Hz</span>
        </div>
      )}

      {!finished && (
        <VintageMicrophone
          isActive={isRecording}
          volume={volume}
          onClick={handleMicClick}
          state={micState}
        />
      )}

      {!finished && (
        <div className={`glass-card p-4 ${isRecording ? "py-6" : ""}`}>
          <div className={`flex items-center gap-0.5 ${isRecording ? "h-32 md:h-40" : "h-16"} transition-all duration-300`}>
            {bars.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-75 ${isRecording && h > 15 ? "stage-gradient" : "bg-muted"}`}
                style={{ height: `${Math.min(h, 100)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="font-mono text-foreground font-semibold">{formatTime(elapsed)}</span>
            {isListening && (
              <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <span className={`inline-block h-2 w-2 rounded-full ${volume > 20 ? "bg-primary" : "bg-muted-foreground"}`} />
                {Math.round(volume)}%
              </span>
            )}
          </div>
        </div>
      )}

      <SingingFeedback
        scores={scores}
        isActive={isRecording}
        finished={finished}
        onRetry={handleRetry}
        onSave={audioUrl ? () => saveRecording(`Freestyle ${genre}`, { genre, pitchRange, scores }) : undefined}
        onShare={handleShare}
        songTitle={`Freestyle ${genre}`}
      />
      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
