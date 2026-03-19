import { useState, useEffect, useRef } from "react";
import { Download, Cloud, Play } from "lucide-react";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { SaveAuthGate } from "@/components/SaveAuthGate";
import VintageMicrophone from "./VintageMicrophone";
import SingingFeedback from "./SingingFeedback";

interface Props {
  genre: string;
  pitchRange: string;
  bpm: number;
}

interface Song {
  title: string;
  artist: string;
  genre: string;
  difficulty: string;
  lyrics: { time: number; text: string; targetNote: string }[];
  duration: number;
}

const difficultyColor: Record<string, string> = {
  "Fácil": "text-green-400",
  "Media": "text-yellow-400",
  "Difícil": "text-red-400",
};

const PRESET_SONGS: Song[] = [
  {
    title: "Bésame Mucho", artist: "Consuelo Velázquez", genre: "Bolero", difficulty: "Fácil", duration: 36,
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
    title: "Cielito Lindo", artist: "Tradicional Mexicana", genre: "Ranchera", difficulty: "Fácil", duration: 32,
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
    title: "La Bamba", artist: "Tradicional Veracruzana", genre: "Son", difficulty: "Fácil", duration: 28,
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
  {
    title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", difficulty: "Difícil", duration: 40,
    lyrics: [
      { time: 0, text: "Is this the real life?", targetNote: "Bb4" },
      { time: 3, text: "Is this just fantasy?", targetNote: "A4" },
      { time: 6, text: "Caught in a landslide", targetNote: "G4" },
      { time: 9, text: "No escape from reality", targetNote: "F4" },
      { time: 12, text: "Open your eyes", targetNote: "Eb4" },
      { time: 15, text: "Look up to the skies and see", targetNote: "F4" },
      { time: 18, text: "I'm just a poor boy", targetNote: "G4" },
      { time: 21, text: "I need no sympathy", targetNote: "Ab4" },
      { time: 24, text: "Because I'm easy come, easy go", targetNote: "Bb4" },
      { time: 28, text: "Little high, little low", targetNote: "G4" },
      { time: 32, text: "Any way the wind blows", targetNote: "F4" },
      { time: 36, text: "Doesn't really matter to me", targetNote: "Eb4" },
    ],
  },
  {
    title: "Imagine", artist: "John Lennon", genre: "Pop", difficulty: "Media", duration: 36,
    lyrics: [
      { time: 0, text: "Imagine there's no heaven", targetNote: "C4" },
      { time: 4, text: "It's easy if you try", targetNote: "E4" },
      { time: 8, text: "No hell below us", targetNote: "F4" },
      { time: 12, text: "Above us, only sky", targetNote: "G4" },
      { time: 16, text: "Imagine all the people", targetNote: "A4" },
      { time: 20, text: "Living for today", targetNote: "G4" },
      { time: 24, text: "You may say I'm a dreamer", targetNote: "C5" },
      { time: 28, text: "But I'm not the only one", targetNote: "A4" },
      { time: 32, text: "I hope someday you'll join us", targetNote: "G4" },
    ],
  },
  {
    title: "Despacito", artist: "Luis Fonsi", genre: "Reggaetón", difficulty: "Media", duration: 36,
    lyrics: [
      { time: 0, text: "Sí, sabes que ya llevo un rato mirándote", targetNote: "B3" },
      { time: 4, text: "Tengo que bailar contigo hoy", targetNote: "E4" },
      { time: 8, text: "Vi que tu mirada ya estaba llamándome", targetNote: "F#4" },
      { time: 12, text: "Muéstrame el camino que yo voy", targetNote: "B3" },
      { time: 16, text: "Des-pa-cito", targetNote: "B4" },
      { time: 19, text: "Quiero respirar tu cuello despacito", targetNote: "A4" },
      { time: 23, text: "Deja que te diga cosas al oído", targetNote: "G#4" },
      { time: 27, text: "Para que te acuerdes si no estás conmigo", targetNote: "F#4" },
      { time: 31, text: "Despacito", targetNote: "E4" },
    ],
  },
  {
    title: "Someone Like You", artist: "Adele", genre: "Balada", difficulty: "Difícil", duration: 40,
    lyrics: [
      { time: 0, text: "I heard that you're settled down", targetNote: "E4" },
      { time: 4, text: "That you found a girl", targetNote: "F#4" },
      { time: 7, text: "And you're married now", targetNote: "A4" },
      { time: 10, text: "I heard that your dreams came true", targetNote: "E4" },
      { time: 14, text: "Guess she gave you things", targetNote: "F#4" },
      { time: 17, text: "I didn't give to you", targetNote: "A4" },
      { time: 20, text: "Never mind, I'll find someone like you", targetNote: "C#5" },
      { time: 25, text: "I wish nothing but the best for you, too", targetNote: "B4" },
      { time: 30, text: "Don't forget me, I beg", targetNote: "A4" },
      { time: 34, text: "I remember you said", targetNote: "F#4" },
      { time: 37, text: "Sometimes it lasts in love", targetNote: "E4" },
    ],
  },
  {
    title: "Vivir Mi Vida", artist: "Marc Anthony", genre: "Salsa", difficulty: "Media", duration: 32,
    lyrics: [
      { time: 0, text: "Voy a reír, voy a bailar", targetNote: "G4" },
      { time: 4, text: "Vivir mi vida, la la la la", targetNote: "Bb4" },
      { time: 8, text: "Voy a reír, voy a gozar", targetNote: "C5" },
      { time: 12, text: "Vivir mi vida, la la la la", targetNote: "Bb4" },
      { time: 16, text: "A veces llega la lluvia", targetNote: "G4" },
      { time: 20, text: "Para limpiar las heridas", targetNote: "A4" },
      { time: 24, text: "A veces solo una gota", targetNote: "Bb4" },
      { time: 28, text: "Puede vencer la sequía", targetNote: "G4" },
    ],
  },
  {
    title: "Losing My Religion", artist: "R.E.M.", genre: "Rock", difficulty: "Media", duration: 36,
    lyrics: [
      { time: 0, text: "Oh life, is bigger", targetNote: "A3" },
      { time: 4, text: "It's bigger than you", targetNote: "C4" },
      { time: 7, text: "And you are not me", targetNote: "E4" },
      { time: 10, text: "The lengths that I will go to", targetNote: "G4" },
      { time: 14, text: "The distance in your eyes", targetNote: "E4" },
      { time: 18, text: "That's me in the corner", targetNote: "A4" },
      { time: 22, text: "That's me in the spotlight", targetNote: "G4" },
      { time: 26, text: "Losing my religion", targetNote: "E4" },
      { time: 30, text: "Trying to keep up with you", targetNote: "C4" },
      { time: 34, text: "And I don't know if I can do it", targetNote: "A3" },
    ],
  },
  {
    title: "No Woman No Cry", artist: "Bob Marley", genre: "Reggae", difficulty: "Fácil", duration: 32,
    lyrics: [
      { time: 0, text: "No woman, no cry", targetNote: "C4" },
      { time: 4, text: "No woman, no cry", targetNote: "E4" },
      { time: 8, text: "No woman, no cry", targetNote: "G4" },
      { time: 12, text: "No woman, no cry", targetNote: "E4" },
      { time: 16, text: "Said I remember when we used to sit", targetNote: "C4" },
      { time: 20, text: "In the government yard in Trenchtown", targetNote: "E4" },
      { time: 24, text: "Observing the hypocrites", targetNote: "G4" },
      { time: 28, text: "As they would mingle with the good people we meet", targetNote: "E4" },
    ],
  },
];

  // Playback ref for iconic controls
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

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

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      const blob = await fetch(audioUrl).then(r => r.blob());
      const file = new File([blob], `${selectedSong?.title || "song"}.webm`, { type: "audio/webm" });
      if (navigator.share) await navigator.share({ files: [file], title: selectedSong?.title });
    } catch {}
  };

export default function PresetSongsMode({ genre, pitchRange, bpm }: Props) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState({ pitch: 0, timing: 0, expression: 0 });
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const audioPlayRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, volume, waveformData, requestMic, stream, analyserNode } = useMicrophone(2048);
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording, saveRecording, isUploading, needsAuth, dismissAuth } = useSupabaseRecorder("karaoke");
  const pitch = usePitchDetection(analyserNode, isPlaying);
  const timerRef = useRef<ReturnType<typeof setInterval>>(0 as any);
  const scoreSamplesRef = useRef({ pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, prevVolumes: [] as number[] });

  const bars = waveformData.length > 0
    ? waveformData.slice(0, 50).map((v) => Math.max(v, 4))
    : Array.from({ length: 50 }, () => 4);

  const activeLine = selectedSong ? selectedSong.lyrics.reduce((best, line, i) => (elapsed >= line.time ? i : best), 0) : 0;
  const progress = selectedSong ? (elapsed / selectedSong.duration) * 100 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const handlePlaySong = async () => {
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
      s.totalSamples++;
      s.prevVolumes.push(volume);
      if (s.prevVolumes.length > 40) s.prevVolumes.shift();
      if (pitch) { s.pitchTotal++; if (Math.abs(pitch.cents) < 25) s.pitchHits++; }
      if (volume < 8) s.silentSamples++;
      s.volumeSum += volume;
      s.volumeMax = Math.max(s.volumeMax, volume);
      const avg = s.volumeSum / s.totalSamples;
      const variance = s.prevVolumes.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / Math.max(s.prevVolumes.length, 1);
      const dynamicRange = Math.sqrt(variance);
      setScores({
        pitch: s.pitchTotal > 0 ? Math.round((s.pitchHits / s.pitchTotal) * 100) : 0,
        timing: Math.round((1 - (s.silentSamples / s.totalSamples)) * 100),
        expression: Math.min(Math.round(dynamicRange * 3 + (s.volumeMax > 40 ? 15 : 0)), 100),
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, volume, pitch]);

  useEffect(() => { if (finished) stopRecording(); }, [finished]);

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setElapsed(0);
    setFinished(false);
    stopRecording();
    clearRecording();
    audioPlayRef.current?.pause();
    audioPlayRef.current = null;
    setIsPlayingBack(false);
    scoreSamplesRef.current = { pitchHits: 0, pitchTotal: 0, silentSamples: 0, totalSamples: 0, volumeSum: 0, volumeMax: 0, prevVolumes: [] };
    setScores({ pitch: 0, timing: 0, expression: 0 });
  };

  const handlePlayback = () => {
    if (!audioUrl) return;
    if (!audioPlayRef.current) {
      audioPlayRef.current = new Audio(audioUrl);
      audioPlayRef.current.onended = () => setIsPlayingBack(false);
    }
    if (isPlayingBack) { audioPlayRef.current.pause(); setIsPlayingBack(false); }
    else { audioPlayRef.current.play(); setIsPlayingBack(true); }
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      const blob = await fetch(audioUrl).then(r => r.blob());
      const file = new File([blob], `${selectedSong?.title || "song"}.webm`, { type: "audio/webm" });
      if (navigator.share) await navigator.share({ files: [file], title: selectedSong?.title });
    } catch {}
  };

  if (!selectedSong) {
    return (
      <div className="p-4 md:p-8 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Canciones</h2>
          <p className="text-sm text-muted-foreground">{PRESET_SONGS.length} disponibles</p>
        </div>
        <div className="grid gap-3">
          {PRESET_SONGS.map((song) => (
            <button key={song.title} onClick={() => setSelectedSong(song)} className="glass-card p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Play className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-foreground">{song.title}</p>
                <p className="text-xs text-muted-foreground">{song.artist}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{song.genre}</p>
                <p className={`text-[10px] font-medium ${difficultyColor[song.difficulty] || "text-muted-foreground"}`}>{song.difficulty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleMicClick = () => {
    if (finished) return;
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(timerRef.current);
      stopRecording();
      setFinished(true);
      return;
    }
    handlePlaySong();
  };

  const micState = finished ? "finished" : isPlaying ? "recording" : "idle";

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">{selectedSong.title}</h2>
          <p className="text-xs text-muted-foreground">{selectedSong.artist}</p>
        </div>
        <button onClick={() => { handleReset(); setSelectedSong(null); }} className="text-sm text-muted-foreground hover:text-foreground">← Cambiar</button>
      </div>

      {isPlaying && pitch && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-primary">
            {pitch.note}{pitch.octave}
            <span className={`ml-2 text-xs ${Math.abs(pitch.cents) < 20 ? "text-green-400" : Math.abs(pitch.cents) < 40 ? "text-yellow-400" : "text-destructive"}`}>
              {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
            </span>
          </span>
        </div>
      )}

      <div className="glass-card p-4 space-y-2 max-h-48 overflow-y-auto">
        {selectedSong.lyrics.map((line, i) => (
          <p key={i} className={`font-serif text-lg transition-all duration-300 ${
            i === activeLine ? "text-primary font-semibold text-xl" : i < activeLine ? "text-muted-foreground/40" : "text-muted-foreground"
          }`}>{line.text}</p>
        ))}
      </div>

      <VintageMicrophone
        isActive={isPlaying}
        volume={volume}
        onClick={handleMicClick}
        state={micState}
        onPlay={finished && audioUrl ? handlePlayback : undefined}
        onSave={finished && audioUrl ? () => saveRecording(selectedSong.title, { scores, genre }) : undefined}
        onShare={finished && audioUrl ? handleShare : undefined}
        onRetry={finished ? handleReset : undefined}
        isPlaying={isPlayingBack}
      />

      <div className="glass-card p-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
          <div className="h-full stage-gradient rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(selectedSong.duration)}</span>
        </div>
      </div>

      <SingingFeedback scores={scores} isActive={isPlaying} finished={finished} />
      <SaveAuthGate open={needsAuth} onOpenChange={dismissAuth} />
    </div>
  );
}
