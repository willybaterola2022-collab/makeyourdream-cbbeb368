import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, RotateCcw, Download, Cloud } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import { useMetronome } from "@/hooks/useMetronome";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function FreestyleMode({ genre, pitchRange, bpm }: Props) {
  const { isListening, volume, waveformData, requestMic, stopMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isRecording);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const metronome = useMetronome(bpm);

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

  const handleStart = async () => {
    if (!isListening) {
      const ok = await requestMic();
      if (!ok) return;
    }
    // wait a tick for stream
    setTimeout(() => {
      const s = (document.querySelector("body") as any)?.__micStream || stream;
      if (stream) {
        startRecording(stream);
        metronome.start();
      }
    }, 200);
  };

  const handleStop = () => {
    stopRecording();
    metronome.stop();
    clearInterval(timerRef.current);
  };

  const handleReset = () => {
    handleStop();
    clearRecording();
    setElapsed(0);
  };

  const handleSave = () => {
    saveRecording(`Freestyle ${genre}`, { genre, pitchRange });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Freestyle</h2>
        <p className="text-sm text-muted-foreground">Canta lo que quieras · {genre} · {pitchRange}</p>
      </div>

      {/* Pitch display */}
      {isRecording && pitch && (
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Nota</span>
          <span className="font-mono text-2xl font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-sm ${Math.abs(pitch.cents) < 20 ? "text-green-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{pitch.frequency} Hz</span>
        </div>
      )}

      {/* Waveform */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-0.5 h-24 mb-3">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-75 ${
                isRecording && h > 15 ? "gold-gradient" : "bg-muted"
              }`}
              style={{ height: `${Math.min(h, 100)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-mono text-foreground font-semibold text-lg">{formatTime(elapsed)}</span>
          {isListening && (
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <span className={`inline-block h-2 w-2 rounded-full ${volume > 20 ? "bg-primary" : "bg-muted-foreground"}`} />
              {Math.round(volume)}%
            </span>
          )}
          {bpm > 0 && (
            <span className="text-xs text-muted-foreground">{bpm} BPM</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5">
        <button onClick={handleReset} className="h-11 w-11 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="h-4 w-4" />
        </button>

        {!isRecording && !audioUrl && (
          <button
            onClick={handleStart}
            className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity glow-gold"
          >
            <Mic className="h-7 w-7" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={handleStop}
            className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground hover:opacity-90 transition-opacity animate-pulse"
          >
            <Square className="h-6 w-6" />
          </button>
        )}

        {!isRecording && audioUrl && (
          <button
            onClick={handleStart}
            className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity glow-gold"
          >
            <Mic className="h-7 w-7" />
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && !isRecording && (
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
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 gold-gradient p-2.5 flex items-center justify-center gap-2 text-sm text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
