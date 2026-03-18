import { useState, useEffect, useRef } from "react";
import { Mic, Square, RotateCcw, Download, Cloud } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

export default function CustomLyricsMode({ genre, pitchRange, bpm }: Props) {
  const [lyrics, setLyrics] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [speed, setSpeed] = useState(4); // seconds per line
  const [started, setStarted] = useState(false);

  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, started);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const [elapsed, setElapsed] = useState(0);

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  // Parse lyrics into lines
  const handleStart = async () => {
    const parsed = lyrics.split("\n").filter((l) => l.trim().length > 0);
    if (parsed.length === 0) return;
    setLines(parsed);
    setActiveLine(0);
    setElapsed(0);

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
  };

  const handleReset = () => {
    handleStop();
    clearRecording();
    setActiveLine(0);
    setElapsed(0);
    setStarted(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Pre-start: show textarea
  if (!started && !audioUrl) {
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
                  speed === s ? "gold-gradient text-primary-foreground" : "glass-card text-muted-foreground"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={lyrics.trim().length === 0}
          className="w-full h-14 rounded-xl gold-gradient flex items-center justify-center gap-2 text-primary-foreground text-lg font-serif font-semibold hover:opacity-90 transition-opacity glow-gold disabled:opacity-40"
        >
          <Mic className="h-5 w-5" /> Cantar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Tu Letra</h2>
        <span className="font-mono text-foreground">{formatTime(elapsed)}</span>
      </div>

      {/* Pitch */}
      {started && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
        </div>
      )}

      {/* Lyrics display */}
      {started && lines.length > 0 && (
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

      {/* Waveform */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-0.5 h-16">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-75 ${started && h > 15 ? "gold-gradient" : "bg-muted"}`}
              style={{ height: `${Math.min(h, 100)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5">
        <button onClick={handleReset} className="h-11 w-11 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" />
        </button>
        {started && (
          <button onClick={handleStop} className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground animate-pulse">
            <Square className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && !started && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center">🎧 Escucha tu interpretación</p>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <a href={audioUrl} download="mi-cancion.webm" className="flex-1 glass-card p-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-lg">
              <Download className="h-4 w-4" /> Descargar
            </a>
            <button onClick={() => saveRecording(`Letra propia - ${genre}`)} disabled={isUploading} className="flex-1 gold-gradient p-2.5 flex items-center justify-center gap-2 text-sm text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
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
