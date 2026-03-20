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

// BACKEND-REQUEST: vocal-analysis
// Input: { recording_id: string, audio_url: string }
// Output: { dimensions: {name, value}[], classification: string, similar_artists: string[] }
// Descripción: Análisis profundo post-grabación de la performance vocal

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function FreestyleMode({ genre, pitchRange, bpm }: Props) {
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
  const samplesRef = useRef({ pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, volumeVariance: 0, prevVolumes: [] as number[] });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const s = samplesRef.current;
      s.totalSamples++;
      s.prevVolumes.push(volume);
      if (s.prevVolumes.length > 40) s.prevVolumes.shift();
      if (pitch) {
        s.pitchTotal++;
        if (Math.abs(pitch.cents) < 25) s.pitchHits++;
      }
      if (volume < 8) s.silentSamples++;
      s.volumeSum += volume;
      s.volumeMax = Math.max(s.volumeMax, volume);
      const avg = s.volumeSum / s.totalSamples;
      const variance = s.prevVolumes.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / Math.max(s.prevVolumes.length, 1);
      const dynamicRange = Math.sqrt(variance);
      const pitchScore = s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0;
      const singingRatio = 1 - (s.silentSamples / s.totalSamples);
      const timingScore = Math.round(singingRatio * 100);
      const expressionScore = Math.min(Math.round(dynamicRange * 3 + (s.volumeMax > 40 ? 15 : 0)), 100);
      setScores({ pitch: pitchScore, timing: timingScore, expression: expressionScore });
    }, 500);
    return () => clearInterval(interval);
  }, [isRecording, volume, pitch]);

  const handleMicClick = async () => {
    if (finished) return;
    if (isRecording) {
      stopRecording();
      metronome.stop();
      clearInterval(timerRef.current);
      setFinished(true);
      // Play celebration if good score
      const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
      if (global >= 60) setTimeout(() => playSuccess(), 300);
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
    samplesRef.current = { pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, volumeVariance: 0, prevVolumes: [] };
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

      {/* Mic only shown when NOT finished — results take over */}
      {!finished && (
        <VintageMicrophone
          isActive={isRecording}
          volume={volume}
          onClick={handleMicClick}
          state={micState}
        />
      )}

      {/* Waveform — bigger during recording */}
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
