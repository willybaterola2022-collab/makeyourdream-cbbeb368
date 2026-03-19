import { useState, useEffect, useRef } from "react";
import { Download, Cloud } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import { useMetronome } from "@/hooks/useMetronome";
import VintageMicrophone from "./VintageMicrophone";
import SingingFeedback from "./SingingFeedback";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function FreestyleMode({ genre, pitchRange, bpm }: Props) {
  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isRecording);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const metronome = useMetronome(bpm);
  const samplesRef = useRef({ pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, volumeVariance: 0, prevVolumes: [] as number[] });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Real scoring
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const s = samplesRef.current;
      s.totalSamples++;
      s.prevVolumes.push(volume);
      if (s.prevVolumes.length > 40) s.prevVolumes.shift();

      // Pitch: only count if actually detecting pitch, and check cents accuracy
      if (pitch) {
        s.pitchTotal++;
        if (Math.abs(pitch.cents) < 25) s.pitchHits++;
      }

      // Timing: penalize silence heavily in freestyle (you should be singing!)
      if (volume < 8) s.silentSamples++;
      s.volumeSum += volume;
      s.volumeMax = Math.max(s.volumeMax, volume);

      // Expression: calculate dynamic range (variation in volume)
      const avg = s.volumeSum / s.totalSamples;
      const variance = s.prevVolumes.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / Math.max(s.prevVolumes.length, 1);
      const dynamicRange = Math.sqrt(variance);

      const pitchScore = s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0;
      const singingRatio = 1 - (s.silentSamples / s.totalSamples);
      const timingScore = Math.round(singingRatio * 100);
      // Expression: reward dynamic range (not just loud)
      const expressionScore = Math.min(Math.round(dynamicRange * 3 + (s.volumeMax > 40 ? 15 : 0)), 100);

      setScores({ pitch: pitchScore, timing: timingScore, expression: expressionScore });
    }, 500);
    return () => clearInterval(interval);
  }, [isRecording, volume, pitch]);

  const handleMicClick = async () => {
    if (finished) {
      // Reset
      clearRecording();
      setElapsed(0);
      setFinished(false);
      setScores({ pitch: 0, timing: 0, expression: 0 });
      samplesRef.current = { pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, volumeVariance: 0, prevVolumes: [] };
      return;
    }
    if (isRecording) {
      // Stop
      stopRecording();
      metronome.stop();
      clearInterval(timerRef.current);
      setFinished(true);
      return;
    }
    // Start
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

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const micState = finished ? "finished" : isRecording ? "recording" : "idle";

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Freestyle</h2>
        <p className="text-sm text-muted-foreground">{genre} · {pitchRange === "low" ? "Grave" : pitchRange === "high" ? "Agudo" : "Medio"}{bpm > 0 ? ` · ${bpm} BPM` : ""}</p>
      </div>

      {/* Pitch display */}
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

      {/* Vintage Microphone */}
      <VintageMicrophone
        isActive={isRecording}
        volume={volume}
        onClick={handleMicClick}
        state={micState}
      />

      {/* Waveform */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-0.5 h-16">
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

      {/* Live scores while recording */}
      <SingingFeedback scores={scores} isActive={isRecording} finished={finished} />

      {/* Playback after finish */}
      {finished && audioUrl && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center">🎧 Escucha tu grabación</p>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <a
              href={audioUrl}
              download={`freestyle-${genre}.webm`}
              className="flex-1 glass-card p-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
            >
              <Download className="h-4 w-4" /> Descargar
            </a>
            <button
              onClick={() => saveRecording(`Freestyle ${genre}`, { genre, pitchRange, scores })}
              disabled={isUploading}
              className="flex-1 stage-gradient p-2.5 flex items-center justify-center gap-2 text-sm text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Cloud className="h-4 w-4" /> {isUploading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
