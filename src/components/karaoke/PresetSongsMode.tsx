import { useState, useEffect, useRef } from "react";
import { Mic, Square, RotateCcw, Download, Cloud, Play } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

interface Song {
  title: string;
  artist: string;
  lyrics: { time: number; text: string; targetNote: string }[];
  duration: number;
}

const PRESET_SONGS: Song[] = [
  {
    title: "Bésame Mucho", artist: "Consuelo Velázquez", duration: 36,
    lyrics: [
      { time: 0, text: "Bésame, bésame mucho", targetNote: "G4" },
      { time: 4, text: "Como si fuera esta noche", targetNote: "A4" },
      { time: 8, text: "La última vez", targetNote: "B4" },
      { time: 12, text: "Bésame, bésame mucho", targetNote: "G4" },
      { time: 16, text: "Que tengo miedo a perderte", targetNote: "A4" },
      { time: 20, text: "Perderte después", targetNote: "F4" },
      { time: 24, text: "Quiero tenerte muy cerca", targetNote: "G4" },
      { time: 28, text: "Mirarme en tus ojos", targetNote: "A4" },
      { time: 32, text: "Verte junto a mí", targetNote: "G4" },
    ],
  },
  {
    title: "Cielito Lindo", artist: "Tradicional Mexicana", duration: 32,
    lyrics: [
      { time: 0, text: "De la Sierra Morena", targetNote: "C4" },
      { time: 4, text: "Cielito lindo, vienen bajando", targetNote: "E4" },
      { time: 8, text: "Un par de ojitos negros", targetNote: "G4" },
      { time: 12, text: "Cielito lindo, de contrabando", targetNote: "E4" },
      { time: 16, text: "Ay, ay, ay, ay", targetNote: "C5" },
      { time: 20, text: "Canta y no llores", targetNote: "A4" },
      { time: 24, text: "Porque cantando se alegran", targetNote: "G4" },
      { time: 28, text: "Cielito lindo, los corazones", targetNote: "E4" },
    ],
  },
  {
    title: "La Bamba", artist: "Tradicional Veracruzana", duration: 28,
    lyrics: [
      { time: 0, text: "Para bailar la bamba", targetNote: "C4" },
      { time: 4, text: "Se necesita una poca de gracia", targetNote: "E4" },
      { time: 8, text: "Una poca de gracia", targetNote: "G4" },
      { time: 12, text: "Pa' mí, pa' ti, arriba y arriba", targetNote: "A4" },
      { time: 16, text: "Y arriba y arriba por ti seré", targetNote: "G4" },
      { time: 20, text: "Yo no soy marinero", targetNote: "E4" },
      { time: 24, text: "Soy capitán, soy capitán", targetNote: "C4" },
    ],
  },
];

export default function PresetSongsMode({ genre, pitchRange, bpm }: Props) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });

  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isPlaying);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const scoreSamplesRef = useRef({ pitchHits: 0, pitchTotal: 0, timingHits: 0, timingTotal: 0 });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  const activeLine = selectedSong ? selectedSong.lyrics.reduce((best, line, i) => (elapsed >= line.time ? i : best), 0) : 0;
  const progress = selectedSong ? (elapsed / selectedSong.duration) * 100 : 0;
  const globalScore = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const handlePlay = async () => {
    if (finished || !selectedSong) return;
    if (!isListening) {
      const ok = await requestMic();
      if (!ok) return;
    }
    setTimeout(() => {
      if (stream && !isRecording) startRecording(stream);
      setIsPlaying(true);
    }, 200);
  };

  useEffect(() => {
    if (isPlaying && !finished && selectedSong) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.25;
          if (next >= selectedSong.duration) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setFinished(true);
            return selectedSong.duration;
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, finished, selectedSong]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const s = scoreSamplesRef.current;
      s.timingTotal++;
      if (volume > 15) s.timingHits++;
      if (pitch) {
        s.pitchTotal++;
        if (Math.abs(pitch.cents) < 30) s.pitchHits++;
      }
      setScores({
        pitch: s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0,
        timing: s.timingTotal > 0 ? Math.round((s.timingHits / s.timingTotal) * 100) : 0,
        expression: Math.min(Math.round(volume * 1.2), 100),
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, volume, pitch]);

  useEffect(() => {
    if (finished) stopRecording();
  }, [finished]);

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

  if (!selectedSong) {
    return (
      <div className="p-4 md:p-8 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Canciones</h2>
          <p className="text-sm text-muted-foreground">Elige una canción para cantar</p>
        </div>
        <div className="grid gap-3">
          {PRESET_SONGS.map((song) => (
            <button key={song.title} onClick={() => setSelectedSong(song)} className="glass-card p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Play className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-serif font-semibold text-foreground">{song.title}</p>
                <p className="text-xs text-muted-foreground">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">{selectedSong.title}</h2>
          <p className="text-xs text-muted-foreground">{selectedSong.artist}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-serif font-bold gold-text">{globalScore || "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
        </div>
      </div>

      {isPlaying && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-0.5 h-16 mb-3">
          {bars.map((h, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-75 ${isPlaying && h > 15 ? "gold-gradient" : "bg-muted"}`} style={{ height: `${Math.min(h, 100)}%` }} />
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <div className="h-full gold-gradient rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(selectedSong.duration)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Afinación", value: scores.pitch },
          { label: "Timing", value: scores.timing },
          { label: "Expresión", value: scores.expression },
        ].map((s) => (
          <div key={s.label} className="glass-card p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
            <p className="text-lg font-serif font-bold text-foreground">{s.value || "—"}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 space-y-2 max-h-48 overflow-y-auto">
        {selectedSong.lyrics.map((line, i) => (
          <p key={i} className={`font-serif text-lg transition-all duration-300 ${
            i === activeLine ? "text-primary font-semibold text-xl" : i < activeLine ? "text-muted-foreground/40" : "text-muted-foreground"
          }`}>
            {line.text}
          </p>
        ))}
      </div>

      {finished && audioUrl && (
        <div className="glass-card p-4 space-y-3">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <a href={audioUrl} download={`${selectedSong.title}.webm`} className="flex-1 glass-card p-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-lg">
              <Download className="h-4 w-4" /> Descargar
            </a>
            <button onClick={() => saveRecording(selectedSong.title, { scores, genre })} disabled={isUploading} className="flex-1 gold-gradient p-2.5 flex items-center justify-center gap-2 text-sm text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
              <Cloud className="h-4 w-4" /> {isUploading ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-5">
        <button onClick={() => { handleReset(); setSelectedSong(null); }} className="h-11 w-11 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" />
        </button>
        {!finished && (
          <button onClick={isPlaying ? () => { setIsPlaying(false); clearInterval(timerRef.current); } : handlePlay} className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 glow-gold">
            {isPlaying ? <Square className="h-6 w-6" /> : <Mic className="h-7 w-7" />}
          </button>
        )}
        {finished && (
          <button onClick={handleReset} className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 glow-gold">
            <RotateCcw className="h-6 w-6" />
          </button>
        )}
      </div>

      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
