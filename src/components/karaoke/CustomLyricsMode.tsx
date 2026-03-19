import { useState, useEffect, useRef } from "react";
import { Download, Cloud } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import VintageMicrophone from "./VintageMicrophone";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function CustomLyricsMode({ genre, pitchRange, bpm }: Props) {
  const [lyrics, setLyrics] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [speed, setSpeed] = useState(4);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, started);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const [elapsed, setElapsed] = useState(0);

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

  // Advance lines
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
          return prev;
        }
        return next;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [started, lines, speed]);

  const handleStop = () => {
    clearInterval(timerRef.current);
    stopRecording();
    setStarted(false);
    setFinished(true);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    stopRecording();
    clearRecording();
    setActiveLine(0);
    setElapsed(0);
    setStarted(false);
    setFinished(false);
  };

  const handleMicClick = () => {
    if (finished) {
      handleReset();
      return;
    }
    if (started) {
      handleStop();
      return;
    }
    handleStart();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const micState = finished ? "finished" : started ? "recording" : "idle";

  // Pre-start: show textarea
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

        {/* Speed selector */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Velocidad (seg/línea)</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  speed === s ? "stage-gradient text-primary-foreground" : "glass-card text-muted-foreground"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Vintage mic as start button */}
        <VintageMicrophone
          isActive={false}
          volume={0}
          onClick={handleStart}
          state="idle"
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Tu Letra</h2>
        <span className="font-mono text-foreground">{formatTime(elapsed)}</span>
      </div>

      {/* Pitch */}
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

      {/* Lyrics display */}
      {lines.length > 0 && (
        <div className="glass-card p-5 space-y-2 max-h-64 overflow-y-auto">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`font-serif text-lg transition-all duration-300 ${
                i === activeLine
                  ? "text-primary font-semibold text-xl"
                  : i < activeLine
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground/70"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Vintage Microphone */}
      <VintageMicrophone
        isActive={started}
        volume={volume}
        onClick={handleMicClick}
        state={micState}
      />

      {/* Waveform */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-0.5 h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-75 ${started && h > 15 ? "stage-gradient" : "bg-muted"}`}
              style={{ height: `${Math.min(h, 100)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Playback */}
      {finished && audioUrl && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center">🎧 Escucha tu interpretación</p>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <a href={audioUrl} download="mi-cancion.webm" className="flex-1 glass-card p-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-lg">
              <Download className="h-4 w-4" /> Descargar
            </a>
            <button onClick={() => saveRecording(`Letra propia - ${genre}`)} disabled={isUploading} className="flex-1 stage-gradient p-2.5 flex items-center justify-center gap-2 text-sm text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
              <Cloud className="h-4 w-4" /> {isUploading ? "Guardando..." : "Guardar"}
            </button>
          </div>
          <button onClick={handleReset} className="w-full glass-card p-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg">
            Cantar de nuevo
          </button>
        </div>
      )}

      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
